/**
 * Serendipity | StoryWeaver — LLM Provider Store (Zustand)
 *
 * Manages connected providers, model assignments, and API communication.
 * Provider Router: routes requests to the correct provider based on role assignment.
 * Supports streaming, role-based routing, usage tracking, and retry with exponential backoff.
 */
import { create } from 'zustand';
import { storeApiKey, getApiKey, removeApiKey, listProviders, getSetting, setSetting } from '../lib/db';
import { LLM_PROVIDERS, getModelLimits } from '../lib/constants';
import { fitMessagesToContext } from '../services/contextBuilder';

/**
 * Build the API endpoint URL for each provider
 */
const PROVIDER_ENDPOINTS = {
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  ollama: 'http://localhost:11434/api/chat',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  custom: null, // user-provided
};

/**
 * Lazy load settings store to avoid circular dependencies
 */
const getSettings = async () => {
  try {
    const { useSettingsStore } = await import('../stores/settingsStore');
    return useSettingsStore.getState();
  } catch (err) {
    console.warn('Could not load settings store:', err);
    return { roleAssignment: 'simple', roles: {}, taskOverrides: {} };
  }
};

/**
 * Retry helper with exponential backoff
 * Max 3 retries: 1s, 2s, 4s
 * Only retry on 429 (rate limit) or 5xx errors
 */
const retryWithBackoff = async (fetchFn, maxRetries = 3) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFn();
      // Don't retry on 4xx errors (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }
      // Retry on 429 or 5xx
      if (response.ok || (response.status !== 429 && response.status < 500)) {
        return response;
      }
      lastError = response;
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(r => setTimeout(r, backoffMs));
      }
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }
  throw lastError;
};

export const useLlmStore = create((set, get) => ({
  // Connected providers with their config
  providers: {},
  // Currently active connections (tested successfully)
  activeProviders: [],
  // Loading state
  loading: false,
  // Last error
  lastError: null,
  // Usage history: { timestamp, provider, model, role, inputTokens, outputTokens }
  usageHistory: [],
  // AbortController for cancelling streaming requests
  currentAbortController: null,
  // Whether a streaming request is currently in progress
  isStreaming: false,
  // Whether any provider needs reconnection (encryption key lost)
  needsReconnect: false,

  /**
   * Load saved providers from IndexedDB
   *
   * Uses two sources of truth:
   * 1. `apiKeys` table — provider records with encrypted keys, model, baseUrl
   * 2. `settings` table, key `connectedProviders` — simple string[] of provider keys
   *    that were last confirmed connected. This survives independently of encryption.
   */
  loadProviders: async () => {
    set({ loading: true });
    try {
      const stored = await listProviders();
      // Read the persisted connected-provider list from settings (simple string array)
      const savedConnected = (await getSetting('connectedProviders', [])) || [];
      const providers = {};
      let hasDecryptionFailure = false;

      for (const record of stored) {
        // A provider is considered connected if EITHER the apiKeys record says so
        // OR it appears in the persisted connectedProviders list
        let connected = record.connected ?? false;
        if (!connected && savedConnected.includes(record.provider)) {
          connected = true;
          console.info(`[LLM] Provider "${record.provider}" restored from connectedProviders setting.`);
        }

        // Health check: verify the API key can actually be decrypted
        // This catches the case where the encryption key was lost (power loss, storage clear)
        if (connected && record.encrypted) {
          try {
            const key = await getApiKey(record.provider);
            if (!key) {
              console.warn(`[LLM] Provider "${record.provider}" marked connected but API key could not be decrypted. Marking as disconnected.`);
              connected = false;
              hasDecryptionFailure = true;
            }
          } catch (e) {
            console.warn(`[LLM] Provider "${record.provider}" decryption check failed:`, e.message);
            connected = false;
            hasDecryptionFailure = true;
          }
        }

        providers[record.provider] = {
          provider: record.provider,
          model: record.model || null,
          baseUrl: record.baseUrl || PROVIDER_ENDPOINTS[record.provider],
          connected,
          lastTested: record.lastTested || null,
          responseTime: record.responseTime || null,
          needsReconnect: hasDecryptionFailure && !connected,
        };
      }

      const activeProviders = Object.keys(providers).filter(k => providers[k].connected);

      set({
        providers,
        activeProviders,
        loading: false,
        needsReconnect: hasDecryptionFailure,
      });

      // Sync the persisted list so it stays current
      await setSetting('connectedProviders', activeProviders).catch(() => {});

      if (hasDecryptionFailure) {
        console.warn('[LLM] One or more providers need to be reconnected. The encryption key may have been lost after a power loss or browser storage change.');
      }
    } catch (err) {
      console.warn('Failed to load providers:', err);
      set({ loading: false });
    }
  },

  /**
   * Add / update a provider connection
   */
  connectProvider: async ({ provider, apiKey, model, baseUrl = null }) => {
    try {
      // Store encrypted API key
      await storeApiKey(provider, apiKey, {
        model,
        baseUrl: baseUrl || PROVIDER_ENDPOINTS[provider],
        connected: false,
        lastTested: null,
      });

      set(state => ({
        providers: {
          ...state.providers,
          [provider]: {
            provider,
            model,
            baseUrl: baseUrl || PROVIDER_ENDPOINTS[provider],
            connected: false,
            lastTested: null,
            responseTime: null,
          },
        },
      }));

      return true;
    } catch (err) {
      set({ lastError: err.message });
      return false;
    }
  },

  /**
   * Test a provider connection
   */
  testConnection: async (providerKey) => {
    const apiKey = await getApiKey(providerKey);
    if (!apiKey) {
      set({ lastError: 'No API key found for ' + providerKey });
      return { success: false, error: 'No API key stored' };
    }

    const startTime = Date.now();

    try {
      let response;

      switch (providerKey) {
        case 'anthropic':
          response = await fetch(PROVIDER_ENDPOINTS.anthropic, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
              model: get().providers[providerKey]?.model || 'claude-sonnet-4-5-20250514',
              max_tokens: 10,
              messages: [{ role: 'user', content: 'Say "connected" and nothing else.' }],
            }),
          });
          break;

        case 'openai':
        case 'deepseek':
        case 'openrouter':
        case 'custom': {
          const url = get().providers[providerKey]?.baseUrl || PROVIDER_ENDPOINTS[providerKey];
          const defaultModel = providerKey === 'deepseek' ? 'deepseek-chat' : 'gpt-4o';
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: get().providers[providerKey]?.model || defaultModel,
              max_tokens: 10,
              messages: [{ role: 'user', content: 'Say "connected" and nothing else.' }],
            }),
          });
          break;
        }

        case 'google': {
          const model = get().providers[providerKey]?.model || 'gemini-2.0-flash';
          response = await fetch(
            `${PROVIDER_ENDPOINTS.google}/${model}:generateContent`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'Say "connected" and nothing else.' }] }],
                generationConfig: { maxOutputTokens: 10 },
              }),
            }
          );
          break;
        }

        case 'ollama':
          response = await fetch(PROVIDER_ENDPOINTS.ollama, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: get().providers[providerKey]?.model || 'llama3',
              messages: [{ role: 'user', content: 'Say "connected" and nothing else.' }],
            }),
          });
          break;

        default:
          return { success: false, error: 'Unknown provider' };
      }

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      // Update provider as connected
      const providerData = {
        ...get().providers[providerKey],
        connected: true,
        lastTested: Date.now(),
        responseTime,
      };

      await storeApiKey(providerKey, apiKey, {
        model: providerData.model,
        baseUrl: providerData.baseUrl,
        connected: true,
        lastTested: Date.now(),
      });

      const newActive = [...new Set([...get().activeProviders, providerKey])];
      set(state => ({
        providers: { ...state.providers, [providerKey]: providerData },
        activeProviders: newActive,
        lastError: null,
      }));

      // Persist connected provider list to settings for reliable recovery on restart
      await setSetting('connectedProviders', newActive).catch(() => {});

      return { success: true, responseTime };
    } catch (err) {
      set({ lastError: err.message });
      return { success: false, error: err.message };
    }
  },

  /**
   * Disconnect a provider
   */
  disconnectProvider: async (providerKey) => {
    await removeApiKey(providerKey);
    const newActive = get().activeProviders.filter(k => k !== providerKey);
    set(state => {
      const { [providerKey]: _, ...remaining } = state.providers;
      return {
        providers: remaining,
        activeProviders: newActive,
      };
    });
    // Update persisted connected provider list
    await setSetting('connectedProviders', newActive).catch(() => {});
  },

  /**
   * Stop the current streaming generation
   */
  stopGeneration: () => {
    const { currentAbortController } = get();
    if (currentAbortController) {
      currentAbortController.abort();
      set({ currentAbortController: null, isStreaming: false });
    }
  },

  /**
   * Determine which provider to use based on role assignment settings
   */
  selectProvider: async (role = 'generator', task = null) => {
    const { providers, activeProviders } = get();
    const settings = await getSettings();

    if (activeProviders.length === 0) {
      return null;
    }

    if (settings.roleAssignment === 'simple') {
      // Simple mode: use first active provider
      return activeProviders[0];
    }

    if (settings.roleAssignment === 'granular' && task && settings.taskOverrides?.[task]) {
      // Granular mode: check task-specific overrides first
      const override = settings.taskOverrides[task];
      if (override && activeProviders.includes(override)) {
        return override;
      }
    }

    if (settings.roleAssignment === 'standard' || settings.roleAssignment === 'granular') {
      // Standard/Granular mode: look up role assignment
      const assignedProvider = settings.roles?.[role];
      // Verify the assigned provider is actually connected/active
      if (assignedProvider && activeProviders.includes(assignedProvider)) {
        return assignedProvider;
      }
    }

    // Fallback: use first active provider
    return activeProviders[0];
  },

  /**
   * Send a message to the appropriate provider
   * Routes based on role assignment settings
   */
  sendMessage: async ({ messages, role = 'generator', maxTokens = 4096, stream = false, task = null }) => {
    const { providers, activeProviders } = get();

    if (activeProviders.length === 0) {
      const { needsReconnect } = get();
      return {
        success: false,
        error: needsReconnect
          ? 'No connected providers. Your API key could not be read — this can happen after a power loss or browser storage change. Please re-enter your API key in Settings.'
          : 'No connected providers. Please add an AI model in Settings.',
      };
    }

    // Use role-based routing to select provider
    const providerKey = await get().selectProvider(role, task);
    if (!providerKey) {
      return { success: false, error: 'No suitable provider found for role: ' + role };
    }

    const provider = providers[providerKey];
    const apiKey = await getApiKey(providerKey);

    if (!apiKey) {
      // Mark this provider as needing reconnection
      const newActive = get().activeProviders.filter(k => k !== providerKey);
      set(state => ({
        providers: { ...state.providers, [providerKey]: { ...state.providers[providerKey], connected: false, needsReconnect: true } },
        activeProviders: newActive,
        needsReconnect: true,
      }));
      // Update persisted list so the disconnect survives reload
      await setSetting('connectedProviders', newActive).catch(() => {});
      return { success: false, error: 'API key could not be read — this can happen after a power loss or browser storage change. Please re-enter your API key in Settings.' };
    }

    try {
      // ── Auto-fit messages to model's context window ──
      // Prevents "prompt too long" errors for ANY model, including small
      // free-tier OpenRouter models with 4k-8k context windows.
      const modelName = provider.model || '';
      const limits = getModelLimits(modelName);
      const safeMaxTokens = Math.min(maxTokens, limits.maxOutput);
      const fitResult = fitMessagesToContext(messages, limits.context, safeMaxTokens);
      // Use fitted messages and capped output tokens for all API calls below
      const msgs = fitResult.messages;
      const outputTokens = safeMaxTokens;
      if (fitResult.trimmed) {
        console.info(`[LLM] Context trimmed (${fitResult.strategy}) to fit ${modelName || 'unknown'} (${limits.context} ctx)`);
      }

      let response;

      switch (providerKey) {
        case 'anthropic': {
          // Extract system message if present
          const systemMsg = msgs.find(m => m.role === 'system');
          const userMessages = msgs.filter(m => m.role !== 'system');

          const body = {
            model: provider.model || 'claude-sonnet-4-5-20250514',
            max_tokens: outputTokens,
            messages: userMessages,
            stream,
          };
          if (systemMsg) body.system = systemMsg.content;

          response = await retryWithBackoff(() =>
            fetch(PROVIDER_ENDPOINTS.anthropic, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
              },
              body: JSON.stringify(body),
            })
          );

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
          }

          if (stream) return { success: true, stream: response.body, provider: providerKey };

          const data = await response.json();

          // Track usage
          if (data.usage) {
            set(state => ({
              usageHistory: [
                ...state.usageHistory,
                {
                  timestamp: Date.now(),
                  provider: providerKey,
                  model: data.model || provider.model,
                  role,
                  inputTokens: data.usage.input_tokens || 0,
                  outputTokens: data.usage.output_tokens || 0,
                },
              ],
            }));
          }

          const textContent = data.content?.[0]?.text || '';
          if (!textContent) {
            console.warn('[LLM] Anthropic returned empty text content. stop_reason:', data.stop_reason, 'content blocks:', data.content?.length, 'usage:', JSON.stringify(data.usage));
          }
          return {
            success: true,
            content: textContent,
            usage: data.usage,
            provider: providerKey,
            model: data.model,
          };
        }

        case 'openai':
        case 'deepseek':
        case 'openrouter':
        case 'custom': {
          const url = provider.baseUrl || PROVIDER_ENDPOINTS[providerKey];
          response = await retryWithBackoff(() =>
            fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: provider.model || (providerKey === 'deepseek' ? 'deepseek-chat' : 'gpt-4o'),
                max_tokens: outputTokens,
                messages: msgs,
                stream,
              }),
            })
          );

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
          }

          if (stream) return { success: true, stream: response.body, provider: providerKey };

          const data = await response.json();

          // Track usage
          if (data.usage) {
            set(state => ({
              usageHistory: [
                ...state.usageHistory,
                {
                  timestamp: Date.now(),
                  provider: providerKey,
                  model: data.model || provider.model,
                  role,
                  inputTokens: data.usage.prompt_tokens || 0,
                  outputTokens: data.usage.completion_tokens || 0,
                },
              ],
            }));
          }

          const oaiContent = data.choices?.[0]?.message?.content || '';
          if (!oaiContent) {
            console.warn('[LLM] OpenAI-style returned empty content. finish_reason:', data.choices?.[0]?.finish_reason, 'usage:', JSON.stringify(data.usage));
          }
          return {
            success: true,
            content: oaiContent,
            usage: data.usage,
            provider: providerKey,
            model: data.model,
          };
        }

        case 'google': {
          const model = provider.model || 'gemini-2.0-flash';
          // Convert messages to Gemini format
          const contents = msgs
            .filter(m => m.role !== 'system')
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            }));

          const systemInstruction = msgs.find(m => m.role === 'system');

          const body = {
            contents,
            generationConfig: { maxOutputTokens: outputTokens },
          };
          if (systemInstruction) {
            body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
          }

          // Google: use header-based auth to avoid key exposure in URLs
          response = await retryWithBackoff(() =>
            fetch(
              `${PROVIDER_ENDPOINTS.google}/${model}:generateContent`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': apiKey,
                },
                body: JSON.stringify(body),
              }
            )
          );

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
          }

          const data = await response.json();

          // Track usage
          if (data.usageMetadata) {
            set(state => ({
              usageHistory: [
                ...state.usageHistory,
                {
                  timestamp: Date.now(),
                  provider: providerKey,
                  model,
                  role,
                  inputTokens: data.usageMetadata.promptTokenCount || 0,
                  outputTokens: data.usageMetadata.candidatesTokenCount || 0,
                },
              ],
            }));
          }

          const geminiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (!geminiContent) {
            console.warn('[LLM] Google returned empty content. finishReason:', data.candidates?.[0]?.finishReason, 'candidates:', data.candidates?.length, 'usage:', JSON.stringify(data.usageMetadata));
          }
          return {
            success: true,
            content: geminiContent,
            usage: data.usageMetadata,
            provider: providerKey,
            model,
          };
        }

        case 'ollama': {
          response = await retryWithBackoff(() =>
            fetch(PROVIDER_ENDPOINTS.ollama, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: provider.model || 'llama3',
                messages: msgs,
                stream: false,
              }),
            })
          );

          if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);

          const data = await response.json();

          // Ollama doesn't provide standard usage metrics, track model only
          set(state => ({
            usageHistory: [
              ...state.usageHistory,
              {
                timestamp: Date.now(),
                provider: providerKey,
                model: provider.model || 'llama3',
                role,
                inputTokens: 0,
                outputTokens: 0,
              },
            ],
          }));

          return {
            success: true,
            content: data.message?.content || '',
            provider: providerKey,
            model: provider.model,
          };
        }

        default:
          return { success: false, error: 'Unknown provider' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Send a message with streaming support
   * Returns an async generator that yields text chunks
   */
  sendMessageStreaming: async function* ({ messages, role = 'generator', maxTokens = 4096, task = null }) {
    const abortController = new AbortController();
    set({ currentAbortController: abortController, isStreaming: true });

    const { providers, activeProviders } = get();

    if (activeProviders.length === 0) {
      throw new Error('No connected providers. Please add an AI model in Settings.');
    }

    const providerKey = await get().selectProvider(role, task);
    if (!providerKey) {
      throw new Error('No suitable provider found for role: ' + role);
    }

    const provider = providers[providerKey];
    const apiKey = await getApiKey(providerKey);

    if (!apiKey) {
      throw new Error('API key not found. Please reconnect provider.');
    }

    // ── Auto-fit messages to model's context window (streaming) ──
    const streamModelName = provider.model || '';
    const streamLimits = getModelLimits(streamModelName);
    const streamMaxTokens = Math.min(maxTokens, streamLimits.maxOutput);
    const streamFit = fitMessagesToContext(messages, streamLimits.context, streamMaxTokens);
    const streamMsgs = streamFit.messages;
    if (streamFit.trimmed) {
      console.info(`[LLM Stream] Context trimmed (${streamFit.strategy}) to fit ${streamModelName || 'unknown'} (${streamLimits.context} ctx)`);
    }

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    try {
      let response;

      switch (providerKey) {
        case 'anthropic': {
          const systemMsg = streamMsgs.find(m => m.role === 'system');
          const userMessages = streamMsgs.filter(m => m.role !== 'system');

          const body = {
            model: provider.model || 'claude-sonnet-4-5-20250514',
            max_tokens: streamMaxTokens,
            messages: userMessages,
            stream: true,
          };
          if (systemMsg) body.system = systemMsg.content;

          response = await retryWithBackoff(() =>
            fetch(PROVIDER_ENDPOINTS.anthropic, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
              },
              body: JSON.stringify(body),
              signal: abortController.signal,
            })
          );

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
                    yield data.delta.text;
                  } else if (data.type === 'message_delta' && data.usage) {
                    totalInputTokens = data.usage.input_tokens || 0;
                    totalOutputTokens = data.usage.output_tokens || 0;
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }

          // Track usage after streaming completes
          if (totalInputTokens > 0 || totalOutputTokens > 0) {
            set(state => ({
              usageHistory: [
                ...state.usageHistory,
                {
                  timestamp: Date.now(),
                  provider: providerKey,
                  model: provider.model,
                  role,
                  inputTokens: totalInputTokens,
                  outputTokens: totalOutputTokens,
                },
              ],
            }));
          }
          break;
        }

        case 'openai':
        case 'deepseek':
        case 'openrouter':
        case 'custom': {
          const url = provider.baseUrl || PROVIDER_ENDPOINTS[providerKey];
          response = await retryWithBackoff(() =>
            fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: provider.model || (providerKey === 'deepseek' ? 'deepseek-chat' : 'gpt-4o'),
                max_tokens: streamMaxTokens,
                messages: streamMsgs,
                stream: true,
              }),
              signal: abortController.signal,
            })
          );

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.slice(6);
                  if (dataStr === '[DONE]') continue;
                  const data = JSON.parse(dataStr);
                  if (data.choices?.[0]?.delta?.content) {
                    yield data.choices[0].delta.content;
                  }
                  // Capture usage from final chunk if present
                  if (data.usage) {
                    totalInputTokens = data.usage.prompt_tokens || 0;
                    totalOutputTokens = data.usage.completion_tokens || 0;
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }

          // Track usage after streaming completes
          if (totalInputTokens > 0 || totalOutputTokens > 0) {
            set(state => ({
              usageHistory: [
                ...state.usageHistory,
                {
                  timestamp: Date.now(),
                  provider: providerKey,
                  model: provider.model,
                  role,
                  inputTokens: totalInputTokens,
                  outputTokens: totalOutputTokens,
                },
              ],
            }));
          }
          break;
        }

        case 'google': {
          // Google doesn't support streaming, fall back to non-streaming
          const result = await get().sendMessage({ messages: streamMsgs, role, maxTokens: streamMaxTokens, task });
          if (result.success) {
            yield result.content;
          } else {
            throw new Error(result.error);
          }
          break;
        }

        case 'ollama': {
          response = await retryWithBackoff(() =>
            fetch(PROVIDER_ENDPOINTS.ollama, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: provider.model || 'llama3',
                messages: streamMsgs,
                stream: true,
              }),
              signal: abortController.signal,
            })
          );

          if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.trim()) {
                  const data = JSON.parse(line);
                  if (data.message?.content) {
                    yield data.message.content;
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }

          // Track Ollama usage (no token counts available)
          set(state => ({
            usageHistory: [
              ...state.usageHistory,
              {
                timestamp: Date.now(),
                provider: providerKey,
                model: provider.model || 'llama3',
                role,
                inputTokens: 0,
                outputTokens: 0,
              },
            ],
          }));
          break;
        }

        default:
          throw new Error('Unknown provider');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Silently stop on abort
      }
      throw err;
    } finally {
      set({ currentAbortController: null, isStreaming: false });
    }
  },

  /**
   * Get a summary of usage by provider
   */
  getUsageSummary: () => {
    const { usageHistory } = get();
    const summary = {};

    for (const entry of usageHistory) {
      if (!summary[entry.provider]) {
        summary[entry.provider] = {
          provider: entry.provider,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          callCount: 0,
        };
      }
      summary[entry.provider].totalInputTokens += entry.inputTokens || 0;
      summary[entry.provider].totalOutputTokens += entry.outputTokens || 0;
      summary[entry.provider].callCount += 1;
    }

    return Object.values(summary);
  },

  /**
   * Get provider info for display
   */
  getProviderLabel: (providerKey) => {
    const def = LLM_PROVIDERS.find(p => p.key === providerKey);
    return def?.label || providerKey;
  },
}));

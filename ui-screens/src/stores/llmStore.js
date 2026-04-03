/**
 * Serendipity Engine — LLM Provider Store (Zustand)
 *
 * Manages connected providers, model assignments, and API communication.
 * Provider Router: routes requests to the correct provider based on role assignment.
 */
import { create } from 'zustand';
import { storeApiKey, getApiKey, removeApiKey, listProviders } from '../lib/db';
import { LLM_PROVIDERS } from '../lib/constants';

/**
 * Build the API endpoint URL for each provider
 */
const PROVIDER_ENDPOINTS = {
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/chat/completions',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  ollama: 'http://localhost:11434/api/chat',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  custom: null, // user-provided
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

  /**
   * Load saved providers from IndexedDB
   */
  loadProviders: async () => {
    set({ loading: true });
    try {
      const stored = await listProviders();
      const providers = {};

      for (const record of stored) {
        providers[record.provider] = {
          provider: record.provider,
          model: record.model || null,
          baseUrl: record.baseUrl || PROVIDER_ENDPOINTS[record.provider],
          connected: record.connected ?? false,
          lastTested: record.lastTested || null,
          responseTime: record.responseTime || null,
        };
      }

      set({
        providers,
        activeProviders: Object.keys(providers).filter(k => providers[k].connected),
        loading: false,
      });
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
        case 'openrouter':
        case 'custom': {
          const url = get().providers[providerKey]?.baseUrl || PROVIDER_ENDPOINTS[providerKey];
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: get().providers[providerKey]?.model || 'gpt-4o',
              max_tokens: 10,
              messages: [{ role: 'user', content: 'Say "connected" and nothing else.' }],
            }),
          });
          break;
        }

        case 'google': {
          const model = get().providers[providerKey]?.model || 'gemini-2.0-flash';
          response = await fetch(
            `${PROVIDER_ENDPOINTS.google}/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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

      set(state => ({
        providers: { ...state.providers, [providerKey]: providerData },
        activeProviders: [...new Set([...state.activeProviders, providerKey])],
        lastError: null,
      }));

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
    set(state => {
      const { [providerKey]: _, ...remaining } = state.providers;
      return {
        providers: remaining,
        activeProviders: state.activeProviders.filter(k => k !== providerKey),
      };
    });
  },

  /**
   * Send a message to the appropriate provider
   * Routes based on role assignment settings
   */
  sendMessage: async ({ messages, role = 'generator', maxTokens = 4096, stream = false }) => {
    const { providers, activeProviders } = get();

    if (activeProviders.length === 0) {
      return { success: false, error: 'No connected providers. Please add an AI model in Settings.' };
    }

    // For now, use the first active provider
    // TODO: Implement role-based routing from settings store
    const providerKey = activeProviders[0];
    const provider = providers[providerKey];
    const apiKey = await getApiKey(providerKey);

    if (!apiKey) {
      return { success: false, error: 'API key not found. Please reconnect provider.' };
    }

    try {
      let response;

      switch (providerKey) {
        case 'anthropic': {
          // Extract system message if present
          const systemMsg = messages.find(m => m.role === 'system');
          const userMessages = messages.filter(m => m.role !== 'system');

          const body = {
            model: provider.model || 'claude-sonnet-4-5-20250514',
            max_tokens: maxTokens,
            messages: userMessages,
            stream,
          };
          if (systemMsg) body.system = systemMsg.content;

          response = await fetch(PROVIDER_ENDPOINTS.anthropic, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
          }

          if (stream) return { success: true, stream: response.body, provider: providerKey };

          const data = await response.json();
          return {
            success: true,
            content: data.content?.[0]?.text || '',
            usage: data.usage,
            provider: providerKey,
            model: data.model,
          };
        }

        case 'openai':
        case 'openrouter':
        case 'custom': {
          const url = provider.baseUrl || PROVIDER_ENDPOINTS[providerKey];
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: provider.model || 'gpt-4o',
              max_tokens: maxTokens,
              messages,
              stream,
            }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
          }

          if (stream) return { success: true, stream: response.body, provider: providerKey };

          const data = await response.json();
          return {
            success: true,
            content: data.choices?.[0]?.message?.content || '',
            usage: data.usage,
            provider: providerKey,
            model: data.model,
          };
        }

        case 'google': {
          const model = provider.model || 'gemini-2.0-flash';
          // Convert messages to Gemini format
          const contents = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            }));

          const systemInstruction = messages.find(m => m.role === 'system');

          const body = {
            contents,
            generationConfig: { maxOutputTokens: maxTokens },
          };
          if (systemInstruction) {
            body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
          }

          response = await fetch(
            `${PROVIDER_ENDPOINTS.google}/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            }
          );

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
          }

          const data = await response.json();
          return {
            success: true,
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
            usage: data.usageMetadata,
            provider: providerKey,
            model,
          };
        }

        case 'ollama': {
          response = await fetch(PROVIDER_ENDPOINTS.ollama, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: provider.model || 'llama3',
              messages,
              stream: false,
            }),
          });

          if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);

          const data = await response.json();
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
   * Get provider info for display
   */
  getProviderLabel: (providerKey) => {
    const def = LLM_PROVIDERS.find(p => p.key === providerKey);
    return def?.label || providerKey;
  },
}));

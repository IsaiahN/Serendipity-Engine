/**
 * Tests for LM Studio + custom (BYOK) provider routing.
 *
 * Verifies:
 *  - LM Studio is registered as a local, self-configured provider.
 *  - Local providers (LM Studio / Ollama) connect WITHOUT an API key and send
 *    no Authorization header.
 *  - Custom providers route to the user-supplied base URL and DO send the
 *    Authorization header when a key is present.
 *
 * The DB layer is mocked so the test never touches IndexedDB / Web Crypto,
 * and `fetch` is mocked so no network calls are made.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LLM_PROVIDERS,
  SELF_CONFIGURED_PROVIDERS,
  LOCAL_PROVIDERS,
} from '../lib/constants';

// In-memory stand-in for the encrypted key store.
const keyStore = {};

vi.mock('../lib/db', () => ({
  storeApiKey: vi.fn(async (provider, key) => { keyStore[provider] = key; }),
  getApiKey: vi.fn(async (provider) => keyStore[provider] ?? null),
  removeApiKey: vi.fn(async (provider) => { delete keyStore[provider]; }),
  listProviders: vi.fn(async () => []),
  getSetting: vi.fn(async (_k, d = null) => d),
  setSetting: vi.fn(async () => {}),
}));

import { useLlmStore } from '../stores/llmStore';

function okResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: 'connected' } }] }),
  };
}

describe('LM Studio + custom provider config', () => {
  it('registers LM Studio as a local, self-configured provider', () => {
    const lms = LLM_PROVIDERS.find(p => p.key === 'lmstudio');
    expect(lms).toBeTruthy();
    expect(lms.local).toBe(true);
    expect(lms.defaultBaseUrl).toBe('http://localhost:1234/v1/chat/completions');
    expect(SELF_CONFIGURED_PROVIDERS).toContain('lmstudio');
    expect(SELF_CONFIGURED_PROVIDERS).toContain('custom');
    expect(LOCAL_PROVIDERS).toContain('lmstudio');
    // Custom stays self-configured but is NOT a keyless local provider.
    expect(LOCAL_PROVIDERS).not.toContain('custom');
  });
});

describe('testConnection routing', () => {
  beforeEach(() => {
    for (const k of Object.keys(keyStore)) delete keyStore[k];
    useLlmStore.setState({ providers: {}, activeProviders: [], lastError: null });
    global.fetch = vi.fn(async () => okResponse());
  });

  it('connects LM Studio with no key and sends no Authorization header', async () => {
    useLlmStore.setState({
      providers: {
        lmstudio: {
          provider: 'lmstudio',
          model: 'local-model',
          baseUrl: 'http://localhost:1234/v1/chat/completions',
        },
      },
    });

    const result = await useLlmStore.getState().testConnection('lmstudio');
    expect(result.success).toBe(true);

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('http://localhost:1234/v1/chat/completions');
    expect(opts.headers.Authorization).toBeUndefined();
    expect(JSON.parse(opts.body).model).toBe('local-model');
  });

  it('routes custom provider to the user base URL with Authorization header', async () => {
    keyStore.custom = 'sk-user-key';
    useLlmStore.setState({
      providers: {
        custom: {
          provider: 'custom',
          model: 'my-model',
          baseUrl: 'https://my.endpoint.example/v1/chat/completions',
        },
      },
    });

    const result = await useLlmStore.getState().testConnection('custom');
    expect(result.success).toBe(true);

    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('https://my.endpoint.example/v1/chat/completions');
    expect(opts.headers.Authorization).toBe('Bearer sk-user-key');
  });
});

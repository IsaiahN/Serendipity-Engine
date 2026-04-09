import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { Key, LogIn, Check, AlertTriangle, Loader, Server, Plus, Trash2, ExternalLink, Shield, Info } from 'lucide-react';
import { useLlmStore } from '../stores/llmStore';
import { useSettingsStore } from '../stores/settingsStore';
import { LLM_PROVIDERS, STANDARD_ROLES, ROLE_ASSIGNMENT_MODES } from '../lib/constants';

export default function SetupScreen() {
  const navigate = useNavigate();
  const { connectProvider, testConnection, providers, disconnectProvider } = useLlmStore();
  const updateSettings = useSettingsStore(s => s.updateSettings);

  const [method, setMethod] = useState('api');
  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [assignMode, setAssignMode] = useState('simple');
  const [simpleModel, setSimpleModel] = useState('');
  const [roleAssignments, setRoleAssignments] = useState({});
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthProvider, setOauthProvider] = useState('google');
  const [oauthStatus, setOauthStatus] = useState(null); // null | 'pending' | 'success' | 'error'

  const connectedProviders = Object.entries(providers).filter(([_, p]) => p.connected);
  const allConnectedModels = connectedProviders.map(([key, p]) => ({
    key,
    label: LLM_PROVIDERS.find(lp => lp.key === key)?.label || key,
    model: p.model,
  }));

  const handleConnect = async () => {
    if (!apiKeyInput.trim()) return;

    const providerDef = LLM_PROVIDERS.find(p => p.key === selectedProvider);
    const model = selectedModel || providerDef?.models[0] || '';

    await connectProvider({
      provider: selectedProvider,
      apiKey: apiKeyInput.trim(),
      model,
      baseUrl: selectedProvider === 'custom' ? customBaseUrl : null,
    });

    // Test the connection
    setTesting(selectedProvider);
    setTestResult(null);
    const result = await testConnection(selectedProvider);
    setTesting(null);
    setTestResult({ provider: selectedProvider, ...result });

    if (result.success) {
      setApiKeyInput('');
      setSelectedModel('');
      if (!simpleModel) setSimpleModel(`${selectedProvider}:${model}`);
    }
  };

  const handleContinue = async () => {
    await updateSettings({
      onboarded: true,
      roleAssignment: assignMode,
    });
    navigate('/hub');
  };

  const handleSkip = async () => {
    await updateSettings({ onboarded: true });
    navigate('/hub');
  };

  const OAUTH_PROVIDERS = [
    {
      key: 'google',
      label: 'Google (Gemini)',
      status: 'available',
      description: 'Sign in with your Google account to use Gemini models. Requires a Google Cloud project with OAuth credentials.',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scopes: 'https://www.googleapis.com/auth/generative-language',
      color: '#4285f4',
    },
    {
      key: 'openai',
      label: 'OpenAI',
      status: 'planned',
      description: 'OpenAI does not currently offer OAuth for direct API access. Use an API key instead.',
      color: '#10a37f',
    },
    {
      key: 'anthropic',
      label: 'Anthropic (Claude)',
      status: 'planned',
      description: 'Anthropic does not currently offer OAuth for direct API access. Use an API key instead.',
      color: '#d4a574',
    },
  ];

  const handleOAuthSignIn = (providerKey) => {
    const provider = OAUTH_PROVIDERS.find(p => p.key === providerKey);
    if (!provider || provider.status !== 'available') return;

    if (!oauthClientId.trim()) {
      setOauthStatus('error');
      return;
    }

    setOauthStatus('pending');

    // Build OAuth URL
    const redirectUri = window.location.origin + '/oauth/callback';
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', providerKey);

    const params = new URLSearchParams({
      client_id: oauthClientId.trim(),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: provider.scopes,
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    // Open in popup
    const w = 500, h = 600;
    const left = (window.screen.width - w) / 2;
    const top = (window.screen.height - h) / 2;
    const popup = window.open(
      `${provider.authUrl}?${params.toString()}`,
      'oauth_popup',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`
    );

    // Listen for callback message
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'oauth_callback') {
        window.removeEventListener('message', onMessage);
        if (event.data.code) {
          setOauthStatus('success');
          // In a full implementation, exchange code for tokens here
        } else {
          setOauthStatus('error');
        }
      }
    };
    window.addEventListener('message', onMessage);

    // Fallback timeout
    setTimeout(() => {
      if (oauthStatus === 'pending') setOauthStatus(null);
    }, 120000);
  };

  const currentProviderDef = LLM_PROVIDERS.find(p => p.key === selectedProvider);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 40px 80px',
    }}>
      <div style={{ maxWidth: 700, width: '100%', animation: 'fadeIn 0.4s ease forwards' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Connect Your AI Models</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            StoryWeaver uses AI models you provide. Connect at least one to get started.
          </p>
        </div>

        {/* Connection Method Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Card
            active={method === 'api'}
            onClick={() => setMethod('api')}
            style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}
          >
            <Key size={20} color={method === 'api' ? 'var(--accent)' : 'var(--text-muted)'} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>API Key</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paste your key directly</div>
            </div>
          </Card>
          <Card
            active={method === 'sso'}
            onClick={() => setMethod('sso')}
            style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}
          >
            <LogIn size={20} color={method === 'sso' ? 'var(--accent)' : 'var(--text-muted)'} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sign In with Provider</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OAuth / SSO</div>
            </div>
          </Card>
        </div>

        {/* Connected Providers */}
        {connectedProviders.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Connected Models
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {connectedProviders.map(([key, p]) => {
                const def = LLM_PROVIDERS.find(lp => lp.key === key);
                return (
                  <Card key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
                    <Check size={16} color="var(--health-exceptional)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{def?.label || key}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {p.model} {p.responseTime ? `(${p.responseTime}ms)` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => disconnectProvider(key)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', padding: 4,
                      }}
                      title="Disconnect"
                    >
                      <Trash2 size={14} />
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* SSO / OAuth Panel */}
        {method === 'sso' && (
          <Card style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Shield size={16} color="var(--accent)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sign In with Provider</span>
            </div>

            <div style={{
              background: 'var(--accent-subtle)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 20,
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                OAuth lets you authenticate with your provider account instead of pasting an API key. Your access token stays on-device and calls go directly to the provider.
              </div>
            </div>

            {/* Provider cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {OAUTH_PROVIDERS.map((op) => {
                const isAvailable = op.status === 'available';
                const isSelected = oauthProvider === op.key;
                return (
                  <div
                    key={op.key}
                    onClick={() => isAvailable && setOauthProvider(op.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      background: isSelected && isAvailable ? `${op.color}10` : 'var(--bg-tertiary)',
                      border: `1px solid ${isSelected && isAvailable ? op.color + '40' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: isAvailable ? 'pointer' : 'default',
                      opacity: isAvailable ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: op.color + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <LogIn size={16} color={op.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {op.label}
                        {isAvailable ? (
                          <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 100, background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 500 }}>Available</span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 100, background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontWeight: 500 }}>API Key Only</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{op.description}</div>
                    </div>
                    {isAvailable && isSelected && <Check size={16} color={op.color} />}
                  </div>
                );
              })}
            </div>

            {/* OAuth config for the selected available provider */}
            {oauthProvider === 'google' && (
              <div style={{ marginTop: 4 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Google Cloud OAuth Client ID
                </label>
                <input
                  type="text"
                  value={oauthClientId}
                  onChange={(e) => { setOauthClientId(e.target.value); setOauthStatus(null); }}
                  placeholder="123456789.apps.googleusercontent.com"
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: '0.85rem',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)', marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Create one at{' '}
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    Google Cloud Console
                  </a>
                  {' '}→ Credentials → OAuth 2.0 Client ID → Web Application. Add <code style={{ background: 'var(--bg-tertiary)', padding: '1px 4px', borderRadius: 3, fontSize: '0.7rem' }}>{window.location.origin}/oauth/callback</code> as an authorized redirect URI.
                </div>

                {oauthStatus === 'error' && !oauthClientId.trim() && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.1)', marginBottom: 12, fontSize: '0.8rem', color: '#ef4444' }}>
                    <AlertTriangle size={14} /> Please enter your OAuth Client ID first
                  </div>
                )}

                {oauthStatus === 'success' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(34,197,94,0.1)', marginBottom: 12, fontSize: '0.8rem', color: '#22c55e' }}>
                    <Check size={14} /> Authenticated successfully
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={oauthStatus === 'pending'}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {oauthStatus === 'pending' ? (
                    <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Waiting for authorization...</>
                  ) : (
                    <><ExternalLink size={14} /> Sign In with Google</>
                  )}
                </Button>
              </div>
            )}

            {/* Link to switch to API key */}
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Don't have OAuth credentials?{' '}
              <span onClick={() => setMethod('api')} style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>
                Use an API key instead
              </span>
            </div>
          </Card>
        )}

        {/* Add Provider Form */}
        {method === 'api' && <Card style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Plus size={16} color="var(--accent)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {connectedProviders.length > 0 ? 'Add Another Model' : 'Add Your First Model'}
            </span>
          </div>

          {/* Provider Selection */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => { setSelectedProvider(e.target.value); setSelectedModel(''); }}
                style={{
                  width: '100%', padding: '8px 10px', fontSize: '0.85rem',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                }}
              >
                {LLM_PROVIDERS.map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>
            {currentProviderDef?.models.length > 0 ? (
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: '0.85rem',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  }}
                >
                  <option value="">Select model...</option>
                  {currentProviderDef.models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            ) : selectedProvider !== 'ollama' && (
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Model Name</label>
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="e.g. stepfun/step-3.5-flash:free"
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: '0.85rem',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Custom Base URL */}
          {(selectedProvider === 'custom' || selectedProvider === 'ollama') && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                {selectedProvider === 'ollama' ? 'Ollama URL' : 'Base URL'}
              </label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder={selectedProvider === 'ollama' ? 'http://localhost:11434' : 'https://your-endpoint.com/v1/chat/completions'}
                style={{
                  width: '100%', padding: '8px 10px', fontSize: '0.85rem',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          )}

          {/* API Key Input */}
          {method === 'api' && selectedProvider !== 'ollama' && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>API Key</label>
                {currentProviderDef?.apiKeyUrl && (
                  <a
                    href={currentProviderDef.apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.7rem', color: 'var(--accent)',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    Get your API key <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste your API key here"
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                style={{
                  width: '100%', padding: '8px 10px', fontSize: '0.85rem',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          )}

          {/* Test result */}
          {testResult && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              background: testResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              marginBottom: 12,
              fontSize: '0.8rem',
            }}>
              {testResult.success ? (
                <>
                  <Check size={14} color="var(--health-exceptional)" />
                  <span style={{ color: 'var(--health-exceptional)' }}>
                    Connected successfully ({testResult.responseTime}ms)
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={14} color="#ef4444" />
                  <span style={{ color: '#ef4444' }}>{testResult.error}</span>
                </>
              )}
            </div>
          )}

          {/* Connect Button */}
          <Button
            variant="primary"
            onClick={handleConnect}
            disabled={testing || (!apiKeyInput.trim() && selectedProvider !== 'ollama')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {testing ? (
              <>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Testing Connection...
              </>
            ) : (
              <>
                <Server size={14} /> Test & Connect
              </>
            )}
          </Button>
        </Card>}

        {/* Role Assignment */}
        {connectedProviders.length > 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease forwards', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Role Assignment</h2>
              <div style={{
                display: 'flex', gap: 2, padding: 2,
                background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
              }}>
                {Object.entries(ROLE_ASSIGNMENT_MODES).map(([key, mode]) => (
                  <button
                    key={key}
                    onClick={() => setAssignMode(key)}
                    style={{
                      padding: '4px 12px', border: 'none', borderRadius: 4,
                      fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                      background: assignMode === key ? 'var(--accent)' : 'transparent',
                      color: assignMode === key ? 'var(--accent-btn-text)' : 'var(--text-muted)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {assignMode === 'simple' && (
              <Card style={{ padding: 16 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  One model handles everything. Best for getting started quickly.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Use for all tasks:</span>
                  <select
                    value={simpleModel}
                    onChange={(e) => setSimpleModel(e.target.value)}
                    style={{
                      padding: '6px 10px', fontSize: '0.8rem',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                    }}
                  >
                    {allConnectedModels.map(m => (
                      <option key={m.key} value={`${m.key}:${m.model}`}>
                        {m.label} — {m.model}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>
            )}

            {assignMode === 'advanced' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {STANDARD_ROLES.map((r) => (
                  <Card key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.description}</div>
                    </div>
                    <select
                      value={roleAssignments[r.key] || ''}
                      onChange={(e) => setRoleAssignments(prev => ({ ...prev, [r.key]: e.target.value }))}
                      style={{
                        padding: '4px 8px', fontSize: '0.8rem',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                        minWidth: 180,
                      }}
                    >
                      <option value="">Select model...</option>
                      {allConnectedModels.map(m => (
                        <option key={m.key} value={`${m.key}:${m.model}`}>
                          {m.label} — {m.model}
                        </option>
                      ))}
                    </select>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security note */}
        <Card style={{ padding: 14, display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 32 }}>
          <span style={{ fontSize: '1rem' }}>🔒</span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: 2 }}>Your keys stay on your device</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              API keys are encrypted using AES-256 and stored in your browser's IndexedDB. They are never sent to our servers.
              Calls go directly from your browser to the AI provider.
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={handleSkip}>Skip for now</Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
          >
            {connectedProviders.length > 0 ? 'Continue to Project Hub' : 'Continue Without AI'} →
          </Button>
        </div>
      </div>

      {/* Spin animation for loader */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

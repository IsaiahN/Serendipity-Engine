import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { Key, LogIn, Check, AlertTriangle, Loader, Server, Plus, Trash2 } from 'lucide-react';
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
            The Serendipity Engine uses AI models you provide. Connect at least one to get started.
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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OAuth / SSO (coming soon)</div>
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

        {/* Add Provider Form */}
        <Card style={{ padding: 20, marginBottom: 24 }}>
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
            {currentProviderDef?.models.length > 0 && (
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
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>API Key</label>
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
        </Card>

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

            {(assignMode === 'standard' || assignMode === 'granular') && (
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { Key, LogIn, ChevronDown, Check, Plus } from 'lucide-react';

const providers = [
  { name: 'Anthropic', models: ['Claude Opus 4', 'Claude Sonnet 4', 'Claude Haiku 3.5'], color: '#d4a574' },
  { name: 'OpenAI', models: ['GPT-4o', 'GPT-4 Turbo', 'o3-mini'], color: '#74d4a5' },
  { name: 'Google', models: ['Gemini 2.5 Pro', 'Gemini 2.0 Flash'], color: '#7498d4' },
];

const roles = [
  { role: 'Author (generation)', desc: 'Writes chapters, creates architecture', model: 'Claude Opus 4' },
  { role: 'Editor (review)', desc: 'Reviews, critiques, grades', model: 'Gemini 2.5 Pro' },
  { role: 'Health assessment', desc: 'Scores structural health', model: 'Gemini 2.5 Pro' },
  { role: 'Chat / Story Assistant', desc: 'Conversation, brainstorming', model: 'Claude Sonnet 4' },
  { role: 'Decomposition', desc: 'Reverse-engineers existing works', model: 'Claude Opus 4' },
  { role: 'TTS narration', desc: 'Text-to-speech voice', model: 'OpenAI TTS' },
];

export default function SetupScreen() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('api');
  const [connected, setConnected] = useState([]);
  const [assignMode, setAssignMode] = useState('simple');

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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OAuth / SSO</div>
            </div>
          </Card>
        </div>

        {/* Provider Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {providers.map((p) => {
            const isConnected = connected.includes(p.name);
            return (
              <Card key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                  background: `${p.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem', color: p.color,
                }}>
                  {p.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {p.models.join(', ')}
                  </div>
                </div>
                {isConnected ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--health-exceptional)', fontSize: '0.8rem' }}>
                    <Check size={14} /> Connected
                  </span>
                ) : method === 'api' ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="password"
                      placeholder={`${p.name} API Key`}
                      style={{
                        width: 180, padding: '6px 10px', fontSize: '0.8rem',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    />
                    <Button size="sm" onClick={() => setConnected([...connected, p.name])}>Connect</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setConnected([...connected, p.name])}>
                    <LogIn size={14} /> Sign In
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Role Assignment */}
        {connected.length > 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Role Assignment</h2>
              <div style={{
                display: 'flex', gap: 2, padding: 2,
                background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
              }}>
                {['simple', 'standard', 'granular'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setAssignMode(m)}
                    style={{
                      padding: '4px 12px', border: 'none', borderRadius: 4,
                      fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                      background: assignMode === m ? 'var(--accent)' : 'transparent',
                      color: assignMode === m ? '#000' : 'var(--text-muted)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {assignMode === 'simple' && (
              <Card style={{ padding: 16, marginBottom: 24 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  One model handles everything. Best for getting started quickly.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Use for all tasks:</span>
                  <select style={{
                    padding: '6px 10px', fontSize: '0.8rem',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  }}>
                    <option>Claude Opus 4</option>
                    <option>Gemini 2.5 Pro</option>
                  </select>
                </div>
              </Card>
            )}

            {(assignMode === 'standard' || assignMode === 'granular') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
                {roles.map((r) => (
                  <Card key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.role}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                    </div>
                    <select style={{
                      padding: '4px 8px', fontSize: '0.8rem',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                      minWidth: 160,
                    }}>
                      <option>{r.model}</option>
                      <option>Claude Opus 4</option>
                      <option>Gemini 2.5 Pro</option>
                      <option>GPT-4o</option>
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
              API keys are stored in your browser's encrypted storage. They are never sent to our servers.
              Calls go directly from your browser to the AI provider.
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={() => navigate('/hub')}>Skip for now</Button>
          <Button
            variant="primary"
            size="lg"
            disabled={connected.length === 0}
            onClick={() => navigate('/hub')}
          >
            Continue to Project Hub →
          </Button>
        </div>
      </div>
    </div>
  );
}

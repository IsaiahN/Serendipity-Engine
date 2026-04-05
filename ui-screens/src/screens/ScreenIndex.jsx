import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';

const screens = [
  { path: '/terms', label: 'Screen 0A', name: 'Terms of Use & License', desc: 'First-time acceptance flow' },
  { path: '/setup', label: 'Screen 0B', name: 'LLM Connection Setup', desc: 'API key or SSO, multi-model config' },
  { path: '/hub', label: 'Screen 1', name: 'Project Hub', desc: 'Project list, welcome back, quick actions' },
  { path: '/wizard', label: 'Screen 2', name: 'Onboarding Wizard', desc: 'Typeform-style guided setup (8 steps)' },
  { path: '/workspace', label: 'Screen 3', name: 'Main Workspace', desc: '8 Center Stage modes, sidebars, bottom bar' },
  { path: '/settings', label: 'Settings', name: 'Unified Settings Page', desc: '8 categories, all toggles consolidated' },
];

const modes = [
  { path: '/workspace?mode=guided', name: 'Mode 1: Guided Flow' },
  { path: '/workspace?mode=editor', name: 'Mode 2: Editor' },
  { path: '/workspace?mode=reader', name: 'Mode 3: Reader' },
  { path: '/workspace?mode=comparison', name: 'Mode 4: Comparison' },
  { path: '/workspace?mode=graph', name: 'Mode 5: Relationship Graph' },
  { path: '/workspace?mode=chat', name: 'Mode 6: Story Assistant Chat' },
  { path: '/workspace?mode=timeline', name: 'Mode 7: Story Timeline' },
  { path: '/workspace?mode=board', name: 'Mode 8: Drawing Board' },
];

export default function ScreenIndex() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 40px',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✦</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
          Serendipity | StoryWeaver
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
          UI/UX Prototype — Screen Map
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Click any screen to view the interactive prototype
        </p>
      </div>

      {/* User Flow */}
      <div style={{ width: '100%', marginBottom: 40 }}>
        <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 16 }}>
          User Flow — Screens
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {screens.map((s, i) => (
            <Card key={s.path} onClick={() => navigate(s.path)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{
                width: 40, height: 40,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '0.8rem',
                flexShrink: 0,
              }}>
                {s.label.split(' ').pop()}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Center Stage Modes */}
      <div style={{ width: '100%', marginBottom: 40 }}>
        <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 16 }}>
          Center Stage — 8 Modes (within Main Workspace)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {modes.map((m) => (
            <Card key={m.path} onClick={() => navigate(m.path)} style={{ cursor: 'pointer', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{m.name}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Serendipity | StoryWeaver by Isaiah Nwukor
      </p>
    </div>
  );
}

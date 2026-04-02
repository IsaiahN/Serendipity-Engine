import { Check, Circle, Loader, AlertCircle } from 'lucide-react';

const phases = [
  { num: 1, name: 'Author', pct: 100 },
  { num: 2, name: 'Narrator', pct: 100 },
  { num: 3, name: 'Quality Control', pct: 0 },
  { num: 4, name: 'World', pct: 72 },
  { num: 5, name: 'Characters', pct: 0 },
  { num: 6, name: 'Relationships', pct: 0 },
  { num: 7, name: 'Story Foundation', pct: 0 },
  { num: '⟡', name: 'Bridge', pct: 0 },
  { num: 8, name: 'Chapter Execution', pct: 0 },
  { num: 9, name: 'Editor', pct: 0 },
];

function StatusIcon({ pct }) {
  if (pct === 100) return <Check size={14} color="var(--health-exceptional)" />;
  if (pct > 0) return <Loader size={14} color="var(--accent)" />;
  return <Circle size={14} color="var(--text-muted)" />;
}

export default function PhaseProgress({ currentPhase = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
        Pipeline Progress
      </h4>
      {phases.map((p, i) => {
        const isActive = p.num === currentPhase;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <StatusIcon pct={p.pct} />
            <span style={{
              fontSize: '0.8rem',
              color: isActive ? 'var(--accent)' : p.pct === 100 ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 400,
              flex: 1,
            }}>
              {typeof p.num === 'number' ? `Phase ${p.num}` : ''} — {p.name}
            </span>
            {p.pct > 0 && p.pct < 100 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>{p.pct}%</span>
            )}
            {p.pct === 100 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--health-exceptional)' }}>✓</span>
            )}
          </div>
        );
      })}
      <div style={{ marginTop: 8, padding: '0 8px' }}>
        <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 100 }}>
          <div style={{ width: '28%', height: '100%', background: 'var(--accent)', borderRadius: 100, transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Overall: 28% complete</span>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Check, Circle, Loader, Lock, AlertTriangle } from 'lucide-react';

export const phases = [
  { num: 1, name: 'Author', pct: 100, gated: false },
  { num: 2, name: 'Narrator', pct: 100, gated: false },
  { num: 3, name: 'World', pct: 72, gated: false },
  { num: 4, name: 'Characters', pct: 0, gated: false },
  { num: 5, name: 'Relationships', pct: 0, gated: false },
  { num: 6, name: 'Story Foundation', pct: 0, gated: false },
  { num: 7, name: 'Quality Control', pct: 0, gated: false },
  { num: '⟡', name: 'Bridge', pct: 0, gated: false },
  { num: 8, name: 'Chapter Execution', pct: 0, gated: true },
  { num: 9, name: 'Editor', pct: 0, gated: true },
];

// Check if all non-gated phases are complete
export function allPrereqsComplete() {
  return phases.filter(p => !p.gated).every(p => p.pct === 100);
}

// Compute overall progress
export function overallProgress() {
  const total = phases.reduce((s, p) => s + p.pct, 0);
  return Math.round(total / phases.length);
}

function StatusIcon({ pct, locked }) {
  if (locked) return <Lock size={13} color="var(--text-muted)" style={{ opacity: 0.5 }} />;
  if (pct === 100) return <Check size={14} color="var(--health-exceptional)" />;
  if (pct > 0) return <Loader size={14} color="var(--accent)" />;
  return <Circle size={14} color="var(--text-muted)" />;
}

export default function PhaseProgress({ currentPhase = 3, onPhaseClick }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const pctOverall = overallProgress();
  const prereqsDone = allPrereqsComplete();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>
        Pipeline Progress
      </h4>
      <div style={{ padding: '0 8px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overall: {pctOverall}% complete</span>
        </div>
        <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 100 }}>
          <div style={{ width: `${pctOverall}%`, height: '100%', background: 'var(--accent)', borderRadius: 100, transition: 'width 0.5s ease' }} />
        </div>
      </div>
      {phases.map((p, i) => {
        const isActive = p.num === currentPhase;
        const isLocked = p.gated && !prereqsDone;
        const isHovered = hoveredIdx === i;
        return (
          <div
            key={i}
            onClick={() => {
              if (onPhaseClick) onPhaseClick(p.num, p.name, isLocked);
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--accent-glow)' : isHovered ? 'var(--bg-hover)' : 'transparent',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              opacity: isLocked ? 0.55 : 1,
            }}
          >
            <StatusIcon pct={p.pct} locked={isLocked} />
            <span style={{
              fontSize: '0.8rem',
              color: isActive ? 'var(--accent)' : p.pct === 100 ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 400,
              flex: 1,
            }}>
              {typeof p.num === 'number' ? `Phase ${p.num}` : ''} — {p.name}
            </span>
            {isLocked && (
              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', opacity: 0.7 }}>locked</span>
            )}
            {!isLocked && p.pct > 0 && p.pct < 100 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>{p.pct}%</span>
            )}
            {!isLocked && p.pct === 100 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--health-exceptional)' }}>✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

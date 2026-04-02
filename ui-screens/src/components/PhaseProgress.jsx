import { useState } from 'react';
import { Check, Circle, Loader, Lock, AlertTriangle } from 'lucide-react';

export const phases = [
  { num: 1, name: 'Author', gated: false },
  { num: 2, name: 'Narrator', gated: false },
  { num: 3, name: 'World', gated: false },
  { num: 4, name: 'Characters', gated: false },
  { num: 5, name: 'Relationships', gated: false },
  { num: 6, name: 'Story Foundation', gated: false },
  { num: 7, name: 'Quality Control', gated: false },
  { num: '⟡', name: 'Bridge', gated: false },
  { num: 8, name: 'Chapter Execution', gated: true },
  { num: 9, name: 'Editor', gated: true },
];

// Check if all non-gated phases are complete (accepts pctMap: { phaseNum: pct })
export function allPrereqsComplete(pctMap = {}) {
  return phases.filter(p => !p.gated).every(p => (pctMap[p.num] || 0) === 100);
}

// Compute overall progress
export function overallProgress(pctMap = {}) {
  const total = phases.reduce((s, p) => s + (pctMap[p.num] || 0), 0);
  return Math.round(total / phases.length);
}

// Find the current active phase — first incomplete non-gated phase
export function currentActivePhase(pctMap = {}) {
  const incomplete = phases.find(p => !p.gated && (pctMap[p.num] || 0) < 100);
  return incomplete ? incomplete.num : phases[phases.length - 1].num;
}

function StatusIcon({ pct, locked }) {
  if (locked) return <Lock size={13} color="var(--text-muted)" style={{ opacity: 0.5 }} />;
  if (pct === 100) return <Check size={14} color="var(--health-exceptional)" />;
  if (pct > 0) return <Loader size={14} color="var(--accent)" />;
  return <Circle size={14} color="var(--text-muted)" />;
}

export default function PhaseProgress({ currentPhase = 3, onPhaseClick, phasePcts = {} }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const pctOverall = overallProgress(phasePcts);
  const prereqsDone = allPrereqsComplete(phasePcts);

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
        const pct = phasePcts[p.num] || 0;
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
            <StatusIcon pct={pct} locked={isLocked} />
            <span style={{
              fontSize: '0.8rem',
              color: isActive ? 'var(--accent)' : pct === 100 ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 400,
              flex: 1,
            }}>
              {typeof p.num === 'number' ? `Phase ${p.num}` : ''} — {p.name}
            </span>
            {isLocked && (
              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', opacity: 0.7 }}>locked</span>
            )}
            {!isLocked && pct > 0 && pct < 100 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>{pct}%</span>
            )}
            {!isLocked && pct === 100 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--health-exceptional)' }}>✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

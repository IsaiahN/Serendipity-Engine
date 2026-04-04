import { useState } from 'react';
import { Check, Circle, Loader, Lock, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

/*
 * Phase gating rules:
 *   - Phases 8 (Chapter Execution) and 9 (Editor) are gated by default.
 *   - Gates unlock when ALL non-gated phases reach 100% completion.
 *
 * TODO: Decompose / Import flow override
 *   When a user uploads a rough draft or completed book (via /wizard?mode=decompose),
 *   the gates on Phase 8 and 9 should be UNLOCKED immediately because chapters already
 *   exist. Implementation steps:
 *     1. Add a project-level flag: `isDecomposed` (or `hasImportedManuscript`).
 *        Set this to true when the decompose wizard completes successfully.
 *     2. When `isDecomposed` is true:
 *        - Set `gated: false` on phases 8 and 9 (or bypass the gate check entirely).
 *        - The uploaded manuscript should be split into individual chapter/scene/act files
 *          (e.g., chapter-1.md, chapter-2.md, etc.) placed in the project's story/ folder.
 *        - Chapters should be parsed from the uploaded content using heading markers,
 *          page breaks, or "Chapter N" patterns. Each resulting file should include
 *          scene metadata: goal, dominant tone, active threads, location, time of day.
 *        - Phase 8 should display these files as already-generated content ready for editing.
 *        - Phase 9 (Editor) should be immediately available for review/refinement.
 *     3. The decompose pipeline still runs Phases 1–7 in reverse (inferring structure
 *        from existing text), but Phases 8–9 are accessible from the start since the
 *        raw chapter content is already available.
 */
export const phases = [
  { num: 1, name: 'Author', gated: false },
  { num: 2, name: 'Narrator', gated: false },
  { num: 3, name: 'World', gated: false },
  { num: 4, name: 'Characters', gated: false },
  { num: 5, name: 'Relationships', gated: false },
  { num: 6, name: 'Story Foundation', gated: false },
  { num: 7, name: 'Quality Control', gated: false },
  { num: '⟡', name: 'Bridge', gated: false },
  { num: 8, name: 'Chapter Execution', gated: true },  // Unlock when decomposed or all prereqs complete
  { num: 9, name: 'Editor', gated: true },              // Unlock when decomposed or all prereqs complete
];

// Check if all non-gated phases are complete (accepts pctMap: { phaseNum: pct })
// TODO: Also return true when `isDecomposed` project flag is set (imported manuscript)
export function allPrereqsComplete(pctMap = {}, isDecomposed = false) {
  if (isDecomposed) return true;
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

export default function PhaseProgress({ currentPhase = 3, onPhaseClick, phasePcts = {}, isDecomposed = false }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const pctOverall = overallProgress(phasePcts);
  const prereqsDone = allPrereqsComplete(phasePcts, isDecomposed);
  const userMode = useSettingsStore(s => s.mode) || 'advanced';

  // Filter phases: in simple mode, hide phases 8 & 9 (Chapter Execution & Editor) as "advanced"
  // Also filter Bridge phase for decomposed projects
  let visiblePhases = isDecomposed ? phases.filter(p => p.num !== '⟡') : phases;
  if (userMode === 'simple') {
    visiblePhases = visiblePhases.filter(p => ![8, 9].includes(p.num));
  }

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
      {visiblePhases.map((p, i) => {
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

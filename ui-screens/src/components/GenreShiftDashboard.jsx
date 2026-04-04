/**
 * GenreShiftDashboard.jsx
 *
 * Full-featured panel for exploring genre and medium shifts.
 * Helps writers understand how their story would change if shifted to a different genre or medium.
 */

import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useLlmStore } from '../stores/llmStore';
import { STORY_MEDIUMS } from '../lib/constants';
import { AlertTriangle, ChevronDown, ChevronUp, Copy, RefreshCw, Zap } from 'lucide-react';
import Button from './Button';
import Card from './Card';

// Genre list — comprehensive
const GENRES = [
  'Literary Fiction',
  'Thriller',
  'Horror',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Historical Fiction',
  'Comedy',
  'Drama',
  'Dystopian',
  'Magical Realism',
  'Western',
  'Crime',
  'Gothic',
  'Satire',
  'Adventure',
  'Psychological',
];

function GenreShiftDashboard() {
  const activeProject = useProjectStore(s => s.activeProject);
  const files = useProjectStore(s => s.files);
  const updateProject = useProjectStore(s => s.updateProject);
  const updateFile = useProjectStore(s => s.updateFile);
  const forkProject = useProjectStore(s => s.forkProject);

  const sendMessage = useLlmStore.getState().sendMessage;

  // Local state
  const [targetGenre, setTargetGenre] = useState(null);
  const [targetMedium, setTargetMedium] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    currentState: true,
    genreExplorer: true,
    mediumExplorer: false,
    analysis: true,
    applyShift: true,
    history: false,
  });
  const [applyMode, setApplyMode] = useState('direct'); // 'direct' or 'fork'
  const [confirmApply, setConfirmApply] = useState(false);
  const [confirmFork, setConfirmFork] = useState(false);

  if (!activeProject) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No project loaded. Open a project to use Genre Shift.
      </div>
    );
  }

  // Load shift history from drawing-board/genre-shifts.md
  useEffect(() => {
    const historyContent = files['drawing-board/genre-shifts.md'] || '';
    if (historyContent) {
      const lines = historyContent.split('\n').filter(l => l.trim());
      const shifts = lines.filter(l => l.startsWith('- '));
      setShiftHistory(shifts.map(s => s.replace(/^- /, '')));
    }
  }, [files]);

  // Build analysis prompt
  const buildAnalysisPrompt = () => {
    const currentGenre = activeProject.genre || 'Unknown';
    const currentMedium = activeProject.medium || 'novel';

    const outline = files['outline.md'] || '';
    const characters = Object.keys(files)
      .filter(k => k.startsWith('characters/') && k.endsWith('.md') && k !== 'characters/questions-answered.md')
      .map(k => `${k}: ${files[k]}`)
      .join('\n\n');

    const world = files['world/world-building.md'] || '';
    const narrator = files['narrator.md'] || '';

    return `
## Current Story Context

**Genre:** ${currentGenre}
**Medium:** ${currentMedium}

### Outline
${outline || '(No outline provided)'}

### Characters
${characters || '(No character files)'}

### World
${world || '(No world building)'}

### Narrator
${narrator || '(No narrator profile)'}

---

## Shift Request

Analyze what would happen if this story were shifted from **${currentGenre} (${currentMedium})** to **${targetGenre} (${targetMedium})**.

Provide a detailed impact analysis covering:

1. **Tone Changes** — How the overall emotional tone and voice would shift
2. **Character Adjustments** — How characters might need to adapt their motivations, behaviors, or arcs
3. **Plot Modifications** — What plot elements would change, be removed, or be added
4. **Structural Changes** — Changes to pacing, chapter structure, point of view, or narrative technique
5. **New Opportunities** — What new possibilities the shift opens up
6. **Risks** — What could be lost or compromised in the shift

Be specific and concrete. Reference actual story elements from the outline and characters provided above.
`;
  };

  // Handle "Analyze Shift" button
  const handleAnalyzeShift = async () => {
    if (!targetGenre || !targetMedium) {
      setAnalysisError('Please select both a target genre and medium.');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis(null);

    const result = await sendMessage({
      messages: [
        {
          role: 'system',
          content: `You are a genre analysis expert helping a writer explore how their story would change across different genres and mediums. Provide specific, actionable insights grounded in story craft and the actual story details provided.`,
        },
        {
          role: 'user',
          content: buildAnalysisPrompt(),
        },
      ],
      role: 'chat',
      maxTokens: 2000,
    });

    if (result.success) {
      setAnalysis(result.content);
    } else {
      setAnalysisError(result.error || 'Failed to generate analysis.');
    }
    setAnalysisLoading(false);
  };

  // Handle "Apply Genre Shift"
  const handleApplyGenreShift = async () => {
    if (!targetGenre) {
      setAnalysisError('Please select a target genre.');
      return;
    }

    if (applyMode === 'fork') {
      // Create fork first
      try {
        await forkProject(activeProject.id, {
          title: `${activeProject.title} (${targetGenre})`,
          forkType: 'genre-shift',
        });

        // After fork is created, the active project updates via subscription
        // For now, show confirmation
        setConfirmFork(false);
        addToHistory(`Shifted to ${targetGenre} as fork`);
      } catch (err) {
        setAnalysisError(`Failed to fork project: ${err.message}`);
      }
    } else {
      // Direct update
      updateProject({
        genre: targetGenre,
      });
      setConfirmApply(false);
      addToHistory(`Shifted genre to ${targetGenre}`);
      setTargetGenre(null);
    }
  };

  // Handle "Apply Medium Change"
  const handleApplyMediumChange = async () => {
    if (!targetMedium) {
      setAnalysisError('Please select a target medium.');
      return;
    }

    const targetMediumObj = STORY_MEDIUMS.find(m => m.key === targetMedium);
    if (!targetMediumObj) {
      setAnalysisError('Invalid medium selected.');
      return;
    }

    if (applyMode === 'fork') {
      try {
        await forkProject(activeProject.id, {
          title: `${activeProject.title} (${targetMediumObj.label})`,
          forkType: 'medium-shift',
        });
        setConfirmFork(false);
        addToHistory(`Shifted to ${targetMediumObj.label} as fork`);
      } catch (err) {
        setAnalysisError(`Failed to fork project: ${err.message}`);
      }
    } else {
      // Calculate new word goal based on medium
      const [minWords, maxWords] = targetMediumObj.wordRange;
      const newWordGoal = Math.floor((minWords + maxWords) / 2);

      updateProject({
        medium: targetMedium,
        wordGoal: newWordGoal,
      });
      setConfirmApply(false);
      addToHistory(`Shifted medium to ${targetMediumObj.label}`);
      setTargetMedium(null);
    }
  };

  // Add to history
  const addToHistory = (entry) => {
    const timestamp = new Date().toLocaleString();
    const newEntry = `- ${entry} (${timestamp})`;
    setShiftHistory([newEntry, ...shiftHistory]);

    const historyContent = [
      '# Genre & Medium Shift History',
      '',
      ...shiftHistory,
      newEntry,
    ].join('\n');

    updateFile('drawing-board/genre-shifts.md', historyContent);
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const currentMediumObj = STORY_MEDIUMS.find(m => m.key === activeProject.medium) || STORY_MEDIUMS[0];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Genre Shift & Medium Transposition
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Explore how your story would change if shifted to a different genre or medium.
        </p>
      </div>

      {/* Section A: Current State Display */}
      <SectionCard
        title="Current State"
        section="currentState"
        expanded={expandedSections.currentState}
        onToggle={toggleSection}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <StateChip label="Genre" value={activeProject.genre || 'Not set'} />
          <StateChip label="Medium" value={currentMediumObj.label} />
          <StateChip label="Content Rating" value={activeProject.contentRating || 'Not set'} />
          <StateChip label="Word Goal" value={`${activeProject.wordGoal || 0} words`} />
        </div>
      </SectionCard>

      {/* Section B: Genre Shift Explorer */}
      <SectionCard
        title="Genre Shift Explorer"
        section="genreExplorer"
        expanded={expandedSections.genreExplorer}
        onToggle={toggleSection}
      >
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select a target genre. Current genre: <strong>{activeProject.genre || 'Not set'}</strong>
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}>
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => setTargetGenre(genre)}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: targetGenre === genre ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: genre === activeProject.genre ? 'var(--bg-tertiary)' : targetGenre === genre ? 'var(--bg-secondary)' : 'var(--bg-card)',
                  color: genre === activeProject.genre || targetGenre === genre ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: genre === activeProject.genre ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                {genre === activeProject.genre && '✓ '}
                {genre}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Section C: Medium Transposition */}
      <SectionCard
        title="Medium Transposition"
        section="mediumExplorer"
        expanded={expandedSections.mediumExplorer}
        onToggle={toggleSection}
      >
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select a target medium. Current: <strong>{currentMediumObj.label}</strong>
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '0.75rem',
          }}>
            {STORY_MEDIUMS.map(med => (
              <button
                key={med.key}
                onClick={() => setTargetMedium(med.key)}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: targetMedium === med.key ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: med.key === activeProject.medium ? 'var(--bg-tertiary)' : targetMedium === med.key ? 'var(--bg-secondary)' : 'var(--bg-card)',
                  color: med.key === activeProject.medium || targetMedium === med.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: med.key === activeProject.medium ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: med.key === activeProject.medium ? 600 : 500 }}>
                  {med.key === activeProject.medium && '✓ '}
                  {med.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {med.wordRange[0].toLocaleString()} – {med.wordRange[1].toLocaleString()} words
                </div>
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Section D: Impact Analysis */}
      {(targetGenre || targetMedium) && (
        <SectionCard
          title="Impact Analysis"
          section="analysis"
          expanded={expandedSections.analysis}
          onToggle={toggleSection}
        >
          <div style={{ marginBottom: '1rem' }}>
            {!analysis && !analysisLoading && (
              <Button
                variant="primary"
                onClick={handleAnalyzeShift}
                style={{ marginBottom: '1rem' }}
              >
                <Zap size={14} style={{ marginRight: '0.5rem' }} />
                Analyze Shift
              </Button>
            )}
          </div>

          {analysisError && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <span>{analysisError}</span>
              </div>
            </div>
          )}

          {analysisLoading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={20} style={{ animation: 'spin 2s linear infinite', marginRight: '0.5rem' }} />
              Analyzing shift...
            </div>
          )}

          {analysis && (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}>
              <AnalysisContent content={analysis} />
            </div>
          )}
        </SectionCard>
      )}

      {/* Section E: Apply Shift */}
      <SectionCard
        title="Apply Shift"
        section="applyShift"
        expanded={expandedSections.applyShift}
        onToggle={toggleSection}
      >
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
              <input
                type="radio"
                name="applyMode"
                value="direct"
                checked={applyMode === 'direct'}
                onChange={e => setApplyMode(e.target.value)}
              />
              <span style={{ fontSize: '0.95rem' }}>Apply directly to this project</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="applyMode"
                value="fork"
                checked={applyMode === 'fork'}
                onChange={e => setApplyMode(e.target.value)}
              />
              <span style={{ fontSize: '0.95rem' }}>Create a fork and apply (safer)</span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {targetGenre && (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Shift genre to <strong>{targetGenre}</strong>
                </p>
                {!confirmApply && !confirmFork && (
                  <Button variant="secondary" onClick={() => applyMode === 'direct' ? setConfirmApply(true) : setConfirmFork(true)}>
                    Apply Genre Shift
                  </Button>
                )}
                {confirmApply && applyMode === 'direct' && (
                  <ConfirmButtons
                    onConfirm={handleApplyGenreShift}
                    onCancel={() => setConfirmApply(false)}
                    label="Apply genre shift?"
                  />
                )}
                {confirmFork && applyMode === 'fork' && (
                  <ConfirmButtons
                    onConfirm={handleApplyGenreShift}
                    onCancel={() => setConfirmFork(false)}
                    label="Create fork with genre shift?"
                  />
                )}
              </div>
            )}

            {targetMedium && (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Shift medium to <strong>{STORY_MEDIUMS.find(m => m.key === targetMedium)?.label}</strong>
                </p>
                {!confirmApply && !confirmFork && (
                  <Button variant="secondary" onClick={() => applyMode === 'direct' ? setConfirmApply(true) : setConfirmFork(true)}>
                    Apply Medium Change
                  </Button>
                )}
                {confirmApply && applyMode === 'direct' && (
                  <ConfirmButtons
                    onConfirm={handleApplyMediumChange}
                    onCancel={() => setConfirmApply(false)}
                    label="Apply medium change?"
                  />
                )}
                {confirmFork && applyMode === 'fork' && (
                  <ConfirmButtons
                    onConfirm={handleApplyMediumChange}
                    onCancel={() => setConfirmFork(false)}
                    label="Create fork with medium shift?"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Section F: Shift History */}
      {shiftHistory.length > 0 && (
        <SectionCard
          title="Shift History"
          section="history"
          expanded={expandedSections.history}
          onToggle={toggleSection}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {shiftHistory.map((shift, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {shift}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/**
 * Section card with collapsible header
 */
function SectionCard({ title, section, expanded, onToggle, children }) {
  return (
    <Card style={{ marginBottom: '1.5rem' }}>
      <button
        onClick={() => onToggle(section)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '1rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        <span>{title}</span>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {expanded && <div style={{ padding: '0 1rem 1rem 1rem' }}>{children}</div>}
    </Card>
  );
}

/**
 * State display chip
 */
function StateChip({ label, value }) {
  return (
    <div style={{
      padding: '0.75rem',
      backgroundColor: 'var(--bg-tertiary)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

/**
 * Parse and render analysis content into sections
 */
function AnalysisContent({ content }) {
  const sections = content.split(/\n(?=\d\.\s+\*\*)/);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {sections.map((section, idx) => {
        const lines = section.split('\n');
        const titleLine = lines[0] || '';
        const bodyLines = lines.slice(1);

        const titleMatch = titleLine.match(/\d\.\s+\*\*(.+?)\*\*/);
        const title = titleMatch ? titleMatch[1] : titleLine;

        return (
          <div key={idx}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--accent)',
              marginBottom: '0.75rem',
            }}>
              {title}
            </h4>
            <div style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {bodyLines.map((line, lineIdx) => {
                if (!line.trim()) return null;
                return (
                  <p key={lineIdx} style={{ marginBottom: '0.5rem' }}>
                    {renderLine(line)}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render a line with basic markdown formatting
 */
function renderLine(line) {
  // Replace **bold** with strong
  const parts = line.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/**
 * Confirmation buttons
 */
function ConfirmButtons({ onConfirm, onCancel, label }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <Button variant="primary" onClick={onConfirm} size="small">
        Confirm
      </Button>
      <Button variant="secondary" onClick={onCancel} size="small">
        Cancel
      </Button>
    </div>
  );
}

export default GenreShiftDashboard;

import { useState, useRef, useMemo } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { analyzeFeedbackHealth } from '../services/healthScoring';
import { MessageSquare } from 'lucide-react';

export default function FeedbackManager() {
  const files = useProjectStore(s => s.files);
  const updateFile = useProjectStore(s => s.updateFile);
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedbackSource, setFeedbackSource] = useState('beta-reader');
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const fileInputRef = useRef(null);

  // Collect all feedback files
  const feedbackFiles = useMemo(() => {
    return Object.entries(files || {})
      .filter(([k]) => k.startsWith('feedback/') && k.endsWith('.md'))
      .map(([path, content]) => ({ path, content, name: path.replace('feedback/', '') }))
      .sort((a, b) => b.name.localeCompare(a.name));
  }, [files]);

  // Detect recurring flags
  const recurringFlags = useMemo(() => {
    const allContent = feedbackFiles.map(f => f.content).join('\n');
    const flagPatterns = [
      { pattern: /pacing|pace|slow|drag/gi, label: 'Pacing concerns' },
      { pattern: /dialogue|speech|conversation/gi, label: 'Dialogue feedback' },
      { pattern: /confus|unclear|lost/gi, label: 'Clarity issues' },
      { pattern: /character|motivation|believab/gi, label: 'Character development' },
      { pattern: /tension|suspense|stakes/gi, label: 'Tension/stakes' },
      { pattern: /ending|resolution|conclusion/gi, label: 'Ending feedback' },
    ];
    return flagPatterns
      .map(fp => ({ label: fp.label, count: (allContent.match(fp.pattern) || []).length }))
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [feedbackFiles]);

  // Analyze feedback health impact
  const feedbackHealthAnalysis = useMemo(() => {
    if (feedbackFiles.length === 0) return null;
    const feedbackMap = {};
    feedbackFiles.forEach(f => {
      feedbackMap[f.path] = f.content;
    });
    return analyzeFeedbackHealth(feedbackMap);
  }, [feedbackFiles]);

  // Map dimension names to display labels
  const dimensionLabels = {
    pacing: 'Pacing',
    dialogueQuality: 'Dialogue',
    thematicCoherence: 'Coherence',
    characterDepth: 'Character Depth',
    readerEngagement: 'Engagement',
    worldBuilding: 'Worldbuilding',
    plotConsistency: 'Consistency',
    proseQuality: 'Prose Quality',
    narrativeArc: 'Narrative Arc',
    emotionalResonance: 'Emotional Resonance',
  };

  // Get impact color and label
  const getImpactStyle = (impact) => {
    const absImpact = Math.abs(impact);
    if (absImpact > 0.10) {
      return {
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#ef4444',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        label: 'Strong',
      };
    } else if (absImpact > 0.05) {
      return {
        background: 'rgba(251, 191, 36, 0.15)',
        color: '#fbbf24',
        borderColor: 'rgba(251, 191, 36, 0.3)',
        label: 'Moderate',
      };
    } else {
      return {
        background: 'rgba(234, 179, 8, 0.15)',
        color: '#eab308',
        borderColor: 'rgba(234, 179, 8, 0.3)',
        label: 'Mild',
      };
    }
  };

  const handleAddFeedback = async () => {
    if (!feedbackContent.trim()) return;
    const timestamp = new Date().toISOString().split('T')[0];
    const slug = feedbackAuthor ? feedbackAuthor.replace(/\s+/g, '-').toLowerCase() : feedbackSource;
    const path = `feedback/${timestamp}-${slug}.md`;
    
    const content = [
      `# Feedback from ${feedbackAuthor || 'Anonymous'}`,
      `- **Source:** ${feedbackSource}`,
      `- **Date:** ${timestamp}`,
      '',
      feedbackContent,
    ].join('\n');

    await updateFile(path, content);
    setFeedbackContent('');
    setFeedbackAuthor('');
    setShowAddForm(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/\s+/g, '-').toLowerCase();
    const path = `feedback/uploaded-${baseName}.md`;
    
    const content = [
      `# Uploaded Feedback: ${file.name}`,
      `- **Source:** uploaded file`,
      `- **Date:** ${new Date().toISOString().split('T')[0]}`,
      '',
      text,
    ].join('\n');

    await updateFile(path, content);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Feedback Manager</h2>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <label style={{
            padding: '5px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)', color: 'var(--text-secondary)',
            fontSize: '0.72rem', cursor: 'pointer',
          }}>
            Upload File
            <input ref={fileInputRef} type="file" accept=".txt,.md,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button onClick={() => setShowAddForm(!showAddForm)} style={{
            padding: '5px 12px', borderRadius: 'var(--radius-sm)',
            background: showAddForm ? 'var(--bg-tertiary)' : 'var(--accent)', border: 'none',
            color: showAddForm ? 'var(--text-muted)' : '#000',
            fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
          }}>{showAddForm ? 'Cancel' : '+ Add Feedback'}</button>
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
        Collect and organize feedback from beta readers, editors, workshops, or your own notes. Recurring themes are automatically detected and their impact on story health is analyzed.
      </p>

      {/* Add feedback form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>SOURCE</div>
              <select value={feedbackSource} onChange={e => setFeedbackSource(e.target.value)} style={{
                width: '100%', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.8rem',
              }}>
                <option value="beta-reader">Beta Reader</option>
                <option value="editor">Editor</option>
                <option value="self-note">Self Note</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>AUTHOR</div>
              <input value={feedbackAuthor} onChange={e => setFeedbackAuthor(e.target.value)}
                placeholder="Name (optional)" style={{
                  width: '100%', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
          <textarea value={feedbackContent} onChange={e => setFeedbackContent(e.target.value)}
            placeholder="Paste or type feedback here..." style={{
              width: '100%', minHeight: 100, padding: 10, background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)', fontSize: '0.8rem', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleAddFeedback} disabled={!feedbackContent.trim()} style={{
              padding: '6px 16px', borderRadius: 'var(--radius-sm)',
              background: feedbackContent.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
              border: 'none', color: feedbackContent.trim() ? '#000' : 'var(--text-muted)',
              fontSize: '0.75rem', fontWeight: 600, cursor: feedbackContent.trim() ? 'pointer' : 'default',
            }}>Save Feedback</button>
          </div>
        </div>
      )}

      {/* Recurring flags */}
      {recurringFlags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Recurring Themes</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {recurringFlags.map(f => (
              <span key={f.label} style={{
                padding: '3px 10px', borderRadius: 10, fontSize: '0.68rem',
                background: f.count > 5 ? '#ef444422' : f.count > 2 ? '#fbbf2422' : '#4ade8022',
                color: f.count > 5 ? '#ef4444' : f.count > 2 ? '#fbbf24' : '#4ade80',
                border: `1px solid ${f.count > 5 ? '#ef444433' : f.count > 2 ? '#fbbf2433' : '#4ade8033'}`,
              }}>{f.label} ({f.count})</span>
            ))}
          </div>
        </div>
      )}

      {/* Health Impact */}
      {feedbackHealthAnalysis && feedbackHealthAnalysis.themes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Health Impact</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {feedbackHealthAnalysis.themes.map((theme, idx) => {
              const impactStyle = getImpactStyle(theme.impact);
              const dimensionLabel = dimensionLabels[theme.dimension] || theme.dimension;
              return (
                <div
                  key={`${theme.theme}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: impactStyle.background,
                    border: `1px solid ${impactStyle.borderColor}`,
                    fontSize: '0.72rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: impactStyle.color }}>
                      {theme.theme.charAt(0).toUpperCase() + theme.theme.slice(1)}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>
                      ({theme.count}x)
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 110 }}>
                    <div style={{ color: impactStyle.color, fontWeight: 600 }}>
                      {dimensionLabel}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                      {impactStyle.label} impact
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback file list */}
      {feedbackFiles.length === 0 && !showAddForm && (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No feedback yet. Add feedback from beta readers, editors, or your own notes.
        </div>
      )}
      {feedbackFiles.map(f => (
        <div key={f.path} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 8,
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>{f.name.replace('.md', '')}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxHeight: 60, overflow: 'hidden' }}>
            {f.content.replace(/^#.*\n/gm, '').replace(/- \*\*.*\*\*.*\n/g, '').trim().slice(0, 200)}...
          </div>
        </div>
      ))}
    </div>
  );
}

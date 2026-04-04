import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useLlmStore } from '../stores/llmStore';

export default function ReaderExperienceReport({ chapterPath }) {
  const files = useProjectStore(s => s.files);
  const [report, setReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const content = files?.[chapterPath] || '';

  const localMetrics = () => {
    if (!content.trim()) return null;
    const words = content.split(/\s+/).filter(Boolean);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    const dialogueMatches = content.match(/[""\u201C][^""\u201D]*[""\u201D]/g) || [];
    const dialogueWords = dialogueMatches.join(' ').split(/\s+/).length;
    
    return {
      wordCount: words.length,
      readTimeMin: Math.ceil(words.length / 250),
      sentenceCount: sentences.length,
      avgSentenceLen: Math.round(words.length / sentences.length),
      paragraphCount: paragraphs.length,
      avgParagraphLen: Math.round(words.length / paragraphs.length),
      dialogueRatio: Math.round((dialogueWords / words.length) * 100),
    };
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const metrics = localMetrics();
    try {
      const sendMessage = useLlmStore.getState().sendMessage;
      const result = await sendMessage({
        messages: [
          { role: 'system', content: `Analyze this chapter from a reader experience perspective. Return JSON: { "pacingShape": "description of pacing curve", "pacingScore": 1-10, "emotionalTrajectory": "description", "emotionalPeaks": ["moment1", "moment2"], "informationDensity": "low|medium|high|varied", "engagementScore": 1-10, "hookStrength": 1-10, "closingStrength": 1-10, "suggestions": ["suggestion1"] }` },
          { role: 'user', content: content.slice(0, 4000) },
        ],
        role: 'analyst',
        maxTokens: 800,
      });

      if (result.success) {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setReport({ ...metrics, ...JSON.parse(jsonMatch[0]) });
        } else {
          setReport(metrics);
        }
      } else {
        setReport(metrics);
      }
    } catch (err) {
      setReport(metrics);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render a score bar
  const ScoreBar = ({ label, score, max = 10, color = 'var(--accent)' }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 3 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 600, color }}>{score}/{max}</span>
      </div>
      <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${(score / max) * 100}%`, background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );

  if (!content.trim()) return null;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Reader Experience Report</h4>
        <button onClick={runAnalysis} disabled={isAnalyzing} style={{
          padding: '4px 12px', borderRadius: 'var(--radius-sm)',
          background: isAnalyzing ? 'var(--bg-tertiary)' : '#06b6d4', border: 'none',
          color: isAnalyzing ? 'var(--text-muted)' : '#fff',
          fontSize: '0.72rem', fontWeight: 600, cursor: isAnalyzing ? 'wait' : 'pointer',
        }}>{isAnalyzing ? 'Analyzing...' : report ? 'Re-analyze' : 'Analyze'}</button>
      </div>

      {report && (
        <div>
          {/* Quick stats row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Words', value: report.wordCount?.toLocaleString() },
              { label: 'Read Time', value: `${report.readTimeMin} min` },
              { label: 'Dialogue', value: `${report.dialogueRatio}%` },
              { label: 'Avg Sentence', value: `${report.avgSentenceLen} words` },
              { label: 'Info Density', value: report.informationDensity || '—' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', textAlign: 'center', flex: '1 1 80px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Score bars */}
          {report.pacingScore && <ScoreBar label="Pacing" score={report.pacingScore} color="#f97316" />}
          {report.engagementScore && <ScoreBar label="Engagement" score={report.engagementScore} color="#4ade80" />}
          {report.hookStrength && <ScoreBar label="Hook Strength" score={report.hookStrength} color="#8b5cf6" />}
          {report.closingStrength && <ScoreBar label="Closing Strength" score={report.closingStrength} color="#06b6d4" />}

          {/* Narrative analysis */}
          {report.pacingShape && (
            <div style={{ marginTop: 12, padding: 10, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Pacing:</strong> {report.pacingShape}
            </div>
          )}
          {report.emotionalTrajectory && (
            <div style={{ marginTop: 6, padding: 10, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Emotional Arc:</strong> {report.emotionalTrajectory}
            </div>
          )}

          {/* Suggestions */}
          {report.suggestions?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Suggestions</div>
              {report.suggestions.map((s, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '3px 0' }}>• {s}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

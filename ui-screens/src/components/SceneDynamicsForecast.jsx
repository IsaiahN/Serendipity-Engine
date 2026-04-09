import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useLlmStore } from '../stores/llmStore';

export default function SceneDynamicsForecast({ chapterNum }) {
  const files = useProjectStore(s => s.files);
  const [forecast, setForecast] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const runForecast = async () => {
    setIsAnalyzing(true);
    try {
      const sendMessage = useLlmStore.getState().sendMessage;

      // Gather context
      const outline = files?.['outline.md'] || '';
      const arc = files?.['story/arc.md'] || '';
      const prevChapter = files?.[`story/chapter-${chapterNum - 1}.md`] || '';
      const prevNotes = files?.[`story/chapter-${chapterNum - 1}-notes.md`] || '';
      const characters = Object.entries(files || {})
        .filter(([k]) => k.startsWith('characters/') && k.endsWith('.md'))
        .map(([, v]) => v).join('\n---\n');

      const context = [
        outline ? `## Outline\n${outline.slice(0, 2000)}` : '',
        arc ? `## Arc\n${arc.slice(0, 500)}` : '',
        prevChapter ? `## Previous Chapter (${chapterNum - 1})\n${prevChapter.slice(0, 1500)}` : '',
        prevNotes ? `## Previous Notes\n${prevNotes.slice(0, 500)}` : '',
        characters ? `## Characters\n${characters.slice(0, 1500)}` : '',
      ].filter(Boolean).join('\n\n');

      const result = await sendMessage({
        messages: [
          { role: 'system', content: `You are a story dynamics analyst. Given the context of a story so far, predict what will happen in the next chapter. Return ONLY a JSON object with these fields:
{
  "emotionalCollisions": [{"characters": ["Name1", "Name2"], "tension": "description", "intensity": 1-10}],
  "arcOpportunities": [{"type": "character|plot|thematic", "description": "opportunity description", "priority": "high|medium|low"}],
  "tensionPairings": [{"element1": "...", "element2": "...", "type": "conflict|irony|revelation|reversal"}],
  "predictedTone": "one-word tone prediction",
  "riskFlags": ["potential issue 1", "potential issue 2"]
}` },
          { role: 'user', content: `Analyze dynamics for Chapter ${chapterNum}:\n\n${context}` },
        ],
        role: 'analyst',
        maxTokens: 1500,
      });

      if (result.success) {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setForecast(JSON.parse(jsonMatch[0]));
        }
      }
    } catch (err) {
      console.warn('Forecast failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', marginBottom: 16, overflow: 'hidden',
    }}>
      <button onClick={() => { setIsExpanded(!isExpanded); if (!forecast && !isAnalyzing) runForecast(); }} style={{
        width: '100%', padding: '12px 16px', background: 'none', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', color: 'var(--text-primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scene Dynamics Forecast</span>
          {forecast && <span style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 600 }}>Predicted tone: {forecast.predictedTone}</span>}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {isExpanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {isAnalyzing && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', animation: 'pulse 1.5s ease-in-out infinite' }}>
              Analyzing story dynamics...
            </div>
          )}

          {forecast && !isAnalyzing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Emotional Collisions */}
              {forecast.emotionalCollisions?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', marginBottom: 6 }}>Emotional Collisions</div>
                  {forecast.emotionalCollisions.map((c, i) => (
                    <div key={i} style={{ padding: '6px 10px', background: '#ef444410', borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: '0.78rem', borderLeft: '3px solid #ef4444' }}>
                      <strong>{c.characters?.join(' vs ')}</strong> — {c.tension}
                      <span style={{ float: 'right', fontSize: '0.65rem', color: '#ef4444' }}>Intensity: {c.intensity}/10</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Arc Opportunities */}
              {forecast.arcOpportunities?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4ade80', textTransform: 'uppercase', marginBottom: 6 }}>Arc Opportunities</div>
                  {forecast.arcOpportunities.map((o, i) => (
                    <div key={i} style={{ padding: '6px 10px', background: '#4ade8010', borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: '0.78rem', borderLeft: '3px solid #4ade80' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: o.priority === 'high' ? '#ef4444' : o.priority === 'medium' ? '#fbbf24' : '#4ade80', textTransform: 'uppercase', marginRight: 6 }}>{o.priority}</span>
                      [{o.type}] {o.description}
                    </div>
                  ))}
                </div>
              )}

              {/* Tension Pairings */}
              {forecast.tensionPairings?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', marginBottom: 6 }}>Tension Pairings</div>
                  {forecast.tensionPairings.map((t, i) => (
                    <div key={i} style={{ padding: '6px 10px', background: '#fbbf2410', borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: '0.78rem', borderLeft: '3px solid #fbbf24' }}>
                      {t.element1} ↔ {t.element2} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({t.type})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Risk Flags */}
              {forecast.riskFlags?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Risk Flags</div>
                  {forecast.riskFlags.map((f, i) => (
                    <div key={i} style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⚠ {f}</div>
                  ))}
                </div>
              )}

              <button onClick={runForecast} style={{
                padding: '4px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', alignSelf: 'flex-end',
              }}>Re-analyze</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

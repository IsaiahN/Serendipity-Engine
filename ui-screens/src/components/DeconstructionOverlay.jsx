import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useLlmStore } from '../stores/llmStore';

// Layer definitions with colors
const LAYERS = [
  { key: 'grammar', label: 'Grammar', color: '#ef4444', icon: '📝' },
  { key: 'voice', label: 'Voice', color: '#8b5cf6', icon: '🎤' },
  { key: 'structure', label: 'Structure', color: '#3b82f6', icon: '🏗️' },
  { key: 'theme', label: 'Theme', color: '#f59e0b', icon: '💡' },
  { key: 'character', label: 'Character', color: '#10b981', icon: '👤' },
];

export default function DeconstructionOverlay({ content, onClose }) {
  const settings = useSettingsStore(s => ({
    activeDeconstruction: s.activeDeconstruction,
    deconstructionLayers: s.deconstructionLayers,
  }));
  const activeDeconstruction = settings.activeDeconstruction;
  const layerToggles = settings.deconstructionLayers || {};

  const [annotations, setAnnotations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeLayers, setActiveLayers] = useState(
    Object.keys(layerToggles).filter(k => layerToggles[k])
  );
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const runAnalysis = useCallback(async () => {
    if (!content?.trim()) return;
    setIsAnalyzing(true);

    try {
      const sendMessage = useLlmStore.getState().sendMessage;
      const layersToAnalyze = activeLayers.join(', ');

      const result = await sendMessage({
        messages: [
          { role: 'system', content: `You are a writing analysis tool. Analyze the given text across these layers: ${layersToAnalyze}. Return a JSON array of annotations. Each annotation: { "layer": "grammar|voice|structure|theme|character", "text": "the problematic phrase or sentence", "note": "explanation of the issue or observation", "severity": "info|warning|error" }. Return ONLY the JSON array.` },
          { role: 'user', content: content.slice(0, 3000) }, // Limit to ~3000 chars for speed
        ],
        role: 'editor',
        maxTokens: 2000,
      });

      if (result.success) {
        const jsonMatch = result.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setAnnotations(parsed.filter(a => activeLayers.includes(a.layer)));
          setHasAnalyzed(true);
        }
      }
    } catch (err) {
      console.warn('Deconstruction analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, activeLayers]);

  if (!activeDeconstruction) return null;

  const toggleLayer = (key) => {
    setActiveLayers(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const filteredAnnotations = annotations.filter(a => activeLayers.includes(a.layer));

  const severityIcon = (s) => s === 'error' ? '⚠️' : s === 'warning' ? '💡' : 'ℹ️';

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Active Deconstruction
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={runAnalysis} disabled={isAnalyzing} style={{
            padding: '4px 12px', borderRadius: 'var(--radius-sm)',
            background: isAnalyzing ? 'var(--bg-tertiary)' : 'var(--accent)',
            color: isAnalyzing ? 'var(--text-muted)' : '#000',
            border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: isAnalyzing ? 'wait' : 'pointer',
          }}>
            {isAnalyzing ? 'Analyzing...' : hasAnalyzed ? 'Re-analyze' : 'Analyze'}
          </button>
          {onClose && (
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem',
            }}>✕</button>
          )}
        </div>
      </div>

      {/* Layer toggles */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {LAYERS.map(layer => (
          <button
            key={layer.key}
            onClick={() => toggleLayer(layer.key)}
            style={{
              padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 500,
              background: activeLayers.includes(layer.key) ? layer.color + '22' : 'var(--bg-tertiary)',
              color: activeLayers.includes(layer.key) ? layer.color : 'var(--text-muted)',
              border: `1px solid ${activeLayers.includes(layer.key) ? layer.color + '44' : 'transparent'}`,
              cursor: 'pointer', transition: 'var(--transition)',
            }}
          >
            {layer.icon} {layer.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {!hasAnalyzed && !isAnalyzing && (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Select layers and click Analyze to deconstruct your text
        </div>
      )}

      {filteredAnnotations.length > 0 && (
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {filteredAnnotations.map((ann, i) => {
            const layerDef = LAYERS.find(l => l.key === ann.layer);
            return (
              <div key={i} style={{
                padding: '8px 12px', marginBottom: 6, borderRadius: 'var(--radius-sm)',
                background: (layerDef?.color || '#888') + '0a',
                borderLeft: `3px solid ${layerDef?.color || '#888'}`,
                fontSize: '0.8rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: layerDef?.color, textTransform: 'uppercase' }}>
                    {layerDef?.label}
                  </span>
                  <span>{severityIcon(ann.severity)}</span>
                </div>
                {ann.text && (
                  <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    "{ann.text}"
                  </div>
                )}
                <div style={{ color: 'var(--text-primary)' }}>{ann.note}</div>
              </div>
            );
          })}
        </div>
      )}

      {hasAnalyzed && filteredAnnotations.length === 0 && (
        <div style={{ padding: 16, textAlign: 'center', color: '#4ade80', fontSize: '0.8rem' }}>
          ✓ No issues found for selected layers
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useLlmStore } from '../stores/llmStore';

export default function VoiceCasting() {
  const files = useProjectStore(s => s.files);
  const [castings, setCastings] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const characters = Object.entries(files || {})
    .filter(([k]) => k.startsWith('characters/') && k.endsWith('.md'))
    .map(([path, content]) => ({
      name: path.replace('characters/', '').replace('.md', '').replace(/-/g, ' '),
      content,
    }));

  const generateCastings = async () => {
    setIsGenerating(true);
    try {
      const sendMessage = useLlmStore.getState().sendMessage;
      const charSummaries = characters.map(c => `### ${c.name}\n${c.content.slice(0, 500)}`).join('\n\n');
      
      const result = await sendMessage({
        messages: [
          { role: 'system', content: `Generate voice casting briefs for TTS/audiobook narration. For each character, return a JSON array: [{ "name": "...", "ageRange": "25-35", "accent": "...", "pitch": "low|medium|high", "pace": "slow|measured|quick|variable", "quality": "warm|sharp|gravelly|silky|etc", "emotionalRange": "description", "direction": "1-sentence direction for voice actor", "similarTo": "famous voice reference" }]` },
          { role: 'user', content: `Generate voice casting for these characters:\n\n${charSummaries}` },
        ],
        role: 'analyst',
        maxTokens: 2000,
      });

      if (result.success) {
        const jsonMatch = result.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) setCastings(JSON.parse(jsonMatch[0]));
      }
    } catch (err) {
      console.warn('Voice casting failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Voice Casting</h3>
        <button onClick={generateCastings} disabled={isGenerating || characters.length === 0} style={{
          padding: '6px 16px', borderRadius: 'var(--radius-sm)',
          background: isGenerating ? 'var(--bg-tertiary)' : 'var(--accent)', border: 'none',
          color: isGenerating ? 'var(--text-muted)' : '#000',
          fontSize: '0.75rem', fontWeight: 600, cursor: isGenerating ? 'wait' : 'pointer',
        }}>{isGenerating ? 'Generating...' : castings.length > 0 ? 'Regenerate' : 'Generate Casting Briefs'}</button>
      </div>

      {characters.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Create characters first to generate voice casting briefs.
        </div>
      )}

      {castings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {castings.map((c, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: 16, 
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>{c.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.75rem', marginBottom: 10 }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Age:</span> {c.ageRange}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Accent:</span> {c.accent}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Pitch:</span> {c.pitch}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Pace:</span> {c.pace}</div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-muted)' }}>Quality:</span> {c.quality}</div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5, fontStyle: 'italic' }}>
                "{c.direction}"
              </div>
              {c.similarTo && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Think: {c.similarTo}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

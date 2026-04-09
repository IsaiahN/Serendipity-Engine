import { useState, useEffect, useMemo } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useLlmStore } from '../stores/llmStore';
import { removeEmdashes } from '../lib/randomEngine';
import { Music, Download, Loader2 } from 'lucide-react';

// Parse saved voice-casting.md back into structured castings
function parseSavedCastings(md) {
  if (!md || !md.trim()) return [];
  const castings = [];
  const blocks = md.split(/^## /m).slice(1); // split on ## headers, skip preamble
  for (const block of blocks) {
    const lines = block.split('\n');
    const name = (lines[0] || '').trim();
    if (!name) continue;
    const c = { name, ageRange: '', accent: '', pitch: '', pace: '', quality: '', emotionalRange: '', direction: '', similarTo: '', distinctiveTraits: '' };
    for (const line of lines) {
      const match = line.match(/^- \*\*(.+?)\*\*:\s*(.*)/);
      if (match) {
        const key = match[1].trim().toLowerCase();
        const val = match[2].trim();
        if (key === 'age range') c.ageRange = val;
        else if (key === 'accent') c.accent = val;
        else if (key === 'pitch') c.pitch = val;
        else if (key === 'pace') c.pace = val;
        else if (key === 'vocal quality') c.quality = val;
        else if (key === 'emotional range') c.emotionalRange = val;
        else if (key === 'similar to') c.similarTo = val;
        else if (key === 'distinctive traits') c.distinctiveTraits = val;
      }
      const dirMatch = line.match(/^>\s*\*Direction:\s*(.*?)\*$/);
      if (dirMatch) c.direction = dirMatch[1].trim();
    }
    castings.push(c);
  }
  return castings;
}

export default function VoiceCasting() {
  const files = useProjectStore(s => s.files);
  const updateFile = useProjectStore(s => s.updateFile);
  const [castings, setCastings] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Load saved castings on mount
  useEffect(() => {
    if (castings.length === 0 && files?.['voice-casting.md']) {
      const saved = parseSavedCastings(files['voice-casting.md']);
      if (saved.length > 0) setCastings(saved);
    }
  }, [files?.['voice-casting.md']]); // eslint-disable-line react-hooks/exhaustive-deps

  const characters = useMemo(() => {
    return Object.entries(files || {})
      .filter(([k]) => k.startsWith('characters/') && k.endsWith('.md') && k !== 'characters/questions-answered.md')
      .map(([path, content]) => ({
        name: path.replace('characters/', '').replace('.md', '').replace(/-/g, ' '),
        path,
        content: content || '',
      }));
  }, [files]);

  // Build full project context for richer casting
  const buildContext = () => {
    const parts = [];
    if (files?.['narrator.md']?.trim()) parts.push(`## Narrator Voice\n${files['narrator.md']}`);
    if (files?.['author.md']?.trim()) parts.push(`## Author Intent\n${files['author.md'].slice(0, 800)}`);
    if (files?.['world/world-building.md']?.trim()) parts.push(`## World Setting\n${files['world/world-building.md'].slice(0, 1000)}`);
    return parts.join('\n\n---\n\n');
  };

  const generateCastings = async () => {
    setIsGenerating(true);
    setError(null);
    setElapsedSeconds(0);

    const timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000);

    try {
      const sendMessage = useLlmStore.getState().sendMessage;
      const projectContext = buildContext();

      // Send full character profiles, not truncated
      const charProfiles = characters.map(c =>
        `### ${c.name}\n${c.content}`
      ).join('\n\n---\n\n');

      const result = await sendMessage({
        messages: [
          { role: 'system', content: `You are a voice casting director for audiobook/TTS narration. You have deep knowledge of the project's world, narrator style, and character profiles.

${projectContext ? `### Project Context\n${projectContext}\n\n---\n` : ''}

Generate voice casting briefs for EVERY character below. Each brief should reflect the character's personality, background, emotional range, and role in the story.

Return a JSON array where each element has:
- "name": character name (exactly matching the input)
- "ageRange": e.g. "25-35"
- "accent": regional/cultural accent that fits the character and world
- "pitch": "low" | "medium-low" | "medium" | "medium-high" | "high"
- "pace": "slow" | "measured" | "moderate" | "quick" | "variable"
- "quality": vocal quality descriptor (e.g. "warm and weathered", "sharp and clipped", "honeyed", "gravelly")
- "emotionalRange": 1-2 sentence description of emotional spectrum
- "direction": 1-2 sentence direction for a voice actor reading this character
- "similarTo": a famous voice reference the actor could study (actor, narrator, or public figure)
- "distinctiveTraits": 1-2 unique vocal habits (e.g. "drops volume when lying", "speeds up when excited")

Respond ONLY with the JSON array.` },
          { role: 'user', content: `Generate voice casting briefs for these ${characters.length} characters:\n\n${charProfiles}` },
        ],
        role: 'analyst',
        maxTokens: 3000,
      });

      clearInterval(timer);

      if (result.success) {
        const cleaned = removeEmdashes(result.content);
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setCastings(parsed);

          // Save as exportable file
          const exportMd = [
            '# Voice Casting Briefs',
            `*Generated: ${new Date().toLocaleString()}*`,
            `*Characters: ${parsed.length}*\n`,
            ...parsed.map(c => [
              `## ${c.name}`,
              `- **Age Range**: ${c.ageRange}`,
              `- **Accent**: ${c.accent}`,
              `- **Pitch**: ${c.pitch}`,
              `- **Pace**: ${c.pace}`,
              `- **Vocal Quality**: ${c.quality}`,
              `- **Emotional Range**: ${c.emotionalRange}`,
              `- **Similar To**: ${c.similarTo}`,
              c.distinctiveTraits ? `- **Distinctive Traits**: ${c.distinctiveTraits}` : '',
              `\n> *Direction: ${c.direction}*\n`,
            ].filter(Boolean).join('\n')),
          ].join('\n');
          try { updateFile('voice-casting.md', exportMd); } catch (e) { /* ignore */ }
        } else {
          setError('Failed to parse voice casting results.');
        }
      } else {
        setError(result.error || 'Voice casting generation failed.');
      }
    } catch (err) {
      setError(err.message || 'Voice casting generation failed.');
    } finally {
      clearInterval(timer);
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (castings.length === 0) return;
    const exportText = castings.map(c => [
      `CHARACTER: ${c.name}`,
      `Age Range: ${c.ageRange}`,
      `Accent: ${c.accent}`,
      `Pitch: ${c.pitch} | Pace: ${c.pace}`,
      `Vocal Quality: ${c.quality}`,
      `Emotional Range: ${c.emotionalRange}`,
      `Direction: ${c.direction}`,
      `Reference: ${c.similarTo}`,
      c.distinctiveTraits ? `Distinctive Traits: ${c.distinctiveTraits}` : '',
      '---',
    ].filter(Boolean).join('\n')).join('\n\n');

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voice-casting-briefs.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Music size={20} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Voice Casting</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {castings.length > 0 && (
            <button onClick={handleExport} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Download size={12} /> Export
            </button>
          )}
          <button onClick={generateCastings} disabled={isGenerating || characters.length === 0} style={{
            padding: '6px 16px', borderRadius: 'var(--radius-sm)',
            background: isGenerating ? 'var(--bg-tertiary)' : 'var(--accent)', border: 'none',
            color: isGenerating ? 'var(--text-muted)' : '#000',
            fontSize: '0.75rem', fontWeight: 600, cursor: isGenerating ? 'wait' : 'pointer',
          }}>{isGenerating ? 'Generating...' : castings.length > 0 ? 'Regenerate' : 'Generate Casting Briefs'}</button>
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
        Generate voice casting briefs for audiobook narration or TTS. Each brief includes vocal direction, accent, pace, pitch, and reference actors based on your character profiles and world setting.
      </p>

      {/* No characters */}
      {characters.length === 0 && !isGenerating && (
        <div style={{
          background: '#1a1410', border: '1px solid #3d2e1a',
          borderRadius: 'var(--radius-md)', padding: 40,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          textAlign: 'center',
        }}>
          <Music size={32} style={{ color: '#f97316', opacity: 0.4 }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Create characters first to generate voice casting briefs.
          </div>
        </div>
      )}

      {/* Generating state */}
      {isGenerating && (
        <div style={{
          background: '#1a1410', border: '1px solid #3d2e1a',
          borderRadius: 'var(--radius-md)', padding: 40,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          textAlign: 'center',
        }}>
          <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
            <Music size={36} style={{ color: '#f97316' }} />
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#d4a574' }}>
            Casting {characters.length} character{characters.length !== 1 ? 's' : ''}...
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Analyzing character profiles, narrator voice, and world setting
          </div>
          <div style={{ width: '100%', maxWidth: 300, marginTop: 4 }}>
            <div style={{
              height: 4, borderRadius: 2,
              background: 'var(--bg-tertiary)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, #f97316, #fbbf24)',
                animation: 'outlineProgress 30s ease-in-out forwards',
              }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
              {formatTime(elapsedSeconds)} elapsed
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16,
          fontSize: '0.85rem', color: '#ef4444',
        }}>
          {error}
          <button onClick={() => setError(null)} style={{
            marginLeft: 12, background: 'none', border: 'none', color: '#ef4444',
            cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline',
          }}>Dismiss</button>
        </div>
      )}

      {/* Results */}
      {castings.length > 0 && !isGenerating && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {castings.map((c, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: 16,
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10, color: 'var(--accent)' }}>{c.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.75rem', marginBottom: 10 }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Age:</span> {c.ageRange}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Accent:</span> {c.accent}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Pitch:</span> {c.pitch}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Pace:</span> {c.pace}</div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-muted)' }}>Quality:</span> {c.quality}</div>
              </div>
              {c.emotionalRange && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Range:</span> {c.emotionalRange}
                </div>
              )}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5, fontStyle: 'italic' }}>
                "{c.direction}"
              </div>
              {c.distinctiveTraits && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Traits: {c.distinctiveTraits}
                </div>
              )}
              {c.similarTo && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 4 }}>
                  Think: {c.similarTo}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

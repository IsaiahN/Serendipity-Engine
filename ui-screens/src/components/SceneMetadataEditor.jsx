/**
 * Scene Metadata Editor — Per-chapter structured metadata fields
 *
 * Provides structured inputs for location, time of day, season, weather,
 * mood, interior/exterior, and setting active functions. Persists to
 * chapter notes files (story/chapter-N-notes.md).
 */
import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';

const SETTING_FUNCTIONS = [
  'Carrying history', 'Creating contrast', 'Exerting pressure',
  'Revealing character', 'Building tension', 'Providing comfort',
  'Symbolizing change', 'Mirroring emotion', 'Establishing normalcy',
  'Foreshadowing', 'Isolating character', 'Connecting worlds',
];

const TIME_OPTIONS = [
  'Dawn', 'Early morning', 'Morning', 'Late morning', 'Midday',
  'Early afternoon', 'Afternoon', 'Late afternoon', 'Dusk',
  'Evening', 'Night', 'Late night', 'Midnight',
];

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

function parseSceneMetadata(notes) {
  const meta = {};

  const grab = (pattern) => {
    const m = notes.match(pattern);
    return m ? m[1].replace(/\*\*/g, '').trim() : '';
  };

  meta.location = grab(/Location:\s*(.+)/i);
  meta.timeOfDay = grab(/Time of [Dd]ay:\s*(.+)/i);
  meta.weather = grab(/Weather:\s*(.+)/i);
  meta.mood = grab(/Mood.*?:\s*(.+)/i);

  const ieMatch = notes.match(/Interior\/Exterior:\s*(.+)/i);
  if (ieMatch) {
    const val = ieMatch[1].replace(/\*\*/g, '').trim().toLowerCase();
    if (val.includes('both')) meta.interiorExterior = 'Both';
    else if (val.includes('exterior')) meta.interiorExterior = 'Exterior';
    else meta.interiorExterior = 'Interior';
  }

  const seasonMatch = notes.match(/Season.*?:\s*(.+)/i);
  if (seasonMatch) {
    const parts = seasonMatch[1].replace(/\*\*/g, '').split(/[—–-]/).map(s => s.trim());
    meta.season = parts[0] || '';
    meta.temporalContext = parts[1] || '';
  }

  const funcMatch = notes.match(/Setting [Aa]ctive [Ff]unction:\s*(.+)/i);
  if (funcMatch) {
    meta.settingFunctions = funcMatch[1].replace(/\*\*/g, '').split(';').map(f => f.trim()).filter(Boolean);
  }

  return meta;
}

export default function SceneMetadataEditor({ chapterNum }) {
  const files = useProjectStore(s => s.projectFiles);
  const updateFile = useProjectStore(s => s.updateFile);

  const [metadata, setMetadata] = useState({
    location: '',
    interiorExterior: 'Interior',
    timeOfDay: '',
    season: '',
    temporalContext: '',
    settingFunctions: [],
    weather: '',
    mood: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const notesPath = `story/chapter-${chapterNum}-notes.md`;

  // Load existing metadata from chapter notes
  useEffect(() => {
    const notes = files?.[notesPath];
    if (notes) {
      const parsed = parseSceneMetadata(notes);
      if (Object.keys(parsed).length > 0) {
        setMetadata(prev => ({ ...prev, ...parsed }));
      }
    }
    setHasChanges(false);
  }, [files?.[notesPath], chapterNum]);

  const updateField = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleFunction = (fn) => {
    setMetadata(prev => ({
      ...prev,
      settingFunctions: prev.settingFunctions.includes(fn)
        ? prev.settingFunctions.filter(f => f !== fn)
        : [...prev.settingFunctions, fn],
    }));
    setHasChanges(true);
  };

  const save = async () => {
    let notes = files?.[notesPath] || `# Chapter ${chapterNum} Notes\n\n`;

    const metaBlock = [
      '## Scene Metadata\n',
      `- **Location:** ${metadata.location || 'TBD'}`,
      `- **Interior/Exterior:** ${metadata.interiorExterior}`,
      `- **Time of Day:** ${metadata.timeOfDay || 'TBD'}`,
      `- **Season / Temporal Context:** ${metadata.season}${metadata.temporalContext ? ' — ' + metadata.temporalContext : ''}`,
      `- **Weather:** ${metadata.weather || 'N/A'}`,
      `- **Mood:** ${metadata.mood || 'N/A'}`,
      `- **Setting Active Function:** ${metadata.settingFunctions.join('; ') || 'TBD'}`,
      '',
    ].join('\n');

    if (notes.includes('## Scene Metadata')) {
      notes = notes.replace(/## Scene Metadata[\s\S]*?(?=\n## |$)/, metaBlock);
    } else {
      notes = notes.trimEnd() + '\n\n' + metaBlock;
    }

    await updateFile(notesPath, notes);
    setHasChanges(false);
  };

  const fieldStyle = {
    width: '100%', padding: '6px 10px', background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4,
  };

  // Collapsed summary
  const summaryParts = [
    metadata.location,
    metadata.timeOfDay,
    metadata.season,
  ].filter(Boolean);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', marginBottom: 16, overflow: 'hidden',
    }}>
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%', padding: '12px 16px', background: 'none', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', color: 'var(--text-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scene Metadata</span>
          {!isExpanded && summaryParts.length > 0 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {summaryParts.join(' · ')}
            </span>
          )}
          {hasChanges && (
            <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 600 }}>unsaved</span>
          )}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      {/* Expanded form */}
      {isExpanded && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Location — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={labelStyle}>Location</div>
              <input
                value={metadata.location}
                onChange={e => updateField('location', e.target.value)}
                placeholder="e.g., USA → Ohio → Cleveland → Maren's office"
                style={fieldStyle}
              />
            </div>

            {/* Interior/Exterior */}
            <div>
              <div style={labelStyle}>Interior / Exterior</div>
              <select
                value={metadata.interiorExterior}
                onChange={e => updateField('interiorExterior', e.target.value)}
                style={fieldStyle}
              >
                <option value="Interior">Interior</option>
                <option value="Exterior">Exterior</option>
                <option value="Both">Both</option>
              </select>
            </div>

            {/* Time of Day */}
            <div>
              <div style={labelStyle}>Time of Day</div>
              <select
                value={metadata.timeOfDay}
                onChange={e => updateField('timeOfDay', e.target.value)}
                style={fieldStyle}
              >
                <option value="">Select...</option>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Season */}
            <div>
              <div style={labelStyle}>Season</div>
              <select
                value={metadata.season}
                onChange={e => updateField('season', e.target.value)}
                style={fieldStyle}
              >
                <option value="">Select...</option>
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Weather */}
            <div>
              <div style={labelStyle}>Weather</div>
              <input
                value={metadata.weather}
                onChange={e => updateField('weather', e.target.value)}
                placeholder="e.g., Overcast, light rain"
                style={fieldStyle}
              />
            </div>

            {/* Mood */}
            <div>
              <div style={labelStyle}>Mood / Atmosphere</div>
              <input
                value={metadata.mood}
                onChange={e => updateField('mood', e.target.value)}
                placeholder="e.g., Contemplative, tense"
                style={fieldStyle}
              />
            </div>

            {/* Temporal Context */}
            <div>
              <div style={labelStyle}>Temporal Context</div>
              <input
                value={metadata.temporalContext}
                onChange={e => updateField('temporalContext', e.target.value)}
                placeholder="e.g., Two days after the incident"
                style={fieldStyle}
              />
            </div>
          </div>

          {/* Setting Functions — toggle chips */}
          <div style={{ marginTop: 12 }}>
            <div style={labelStyle}>Setting Active Functions</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              {SETTING_FUNCTIONS.map(fn => (
                <button key={fn} onClick={() => toggleFunction(fn)} style={{
                  padding: '3px 8px', borderRadius: 10, fontSize: '0.68rem',
                  background: metadata.settingFunctions.includes(fn) ? 'var(--accent)22' : 'var(--bg-tertiary)',
                  color: metadata.settingFunctions.includes(fn) ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${metadata.settingFunctions.includes(fn) ? 'var(--accent)44' : 'transparent'}`,
                  cursor: 'pointer', transition: 'var(--transition)',
                }}>
                  {fn}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          {hasChanges && (
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={save} style={{
                padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent)', border: 'none', color: '#000',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              }}>Save Metadata</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

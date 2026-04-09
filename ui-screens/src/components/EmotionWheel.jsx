import { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Lightbulb } from 'lucide-react';

const EMOTION_TAXONOMY = {
  joy: {
    label: 'Joy', color: '#fbbf24',
    children: {
      happiness: { label: 'Happiness', children: ['contentment', 'satisfaction', 'serenity', 'bliss'] },
      excitement: { label: 'Excitement', children: ['thrill', 'exhilaration', 'anticipation', 'eagerness'] },
      pride: { label: 'Pride', children: ['triumph', 'confidence', 'accomplishment', 'dignity'] },
      amusement: { label: 'Amusement', children: ['humor', 'whimsy', 'playfulness', 'mirth'] },
      love: { label: 'Love', children: ['tenderness', 'devotion', 'affection', 'adoration'] },
      gratitude: { label: 'Gratitude', children: ['thankfulness', 'appreciation', 'relief', 'grace'] },
    }
  },
  sadness: {
    label: 'Sadness', color: '#3b82f6',
    children: {
      grief: { label: 'Grief', children: ['mourning', 'loss', 'heartbreak', 'bereavement'] },
      melancholy: { label: 'Melancholy', children: ['nostalgia', 'wistfulness', 'longing', 'homesickness'] },
      despair: { label: 'Despair', children: ['hopelessness', 'helplessness', 'desolation', 'anguish'] },
      loneliness: { label: 'Loneliness', children: ['isolation', 'abandonment', 'alienation', 'emptiness'] },
    }
  },
  anger: {
    label: 'Anger', color: '#ef4444',
    children: {
      rage: { label: 'Rage', children: ['fury', 'wrath', 'outrage', 'indignation'] },
      frustration: { label: 'Frustration', children: ['irritation', 'exasperation', 'impatience', 'annoyance'] },
      resentment: { label: 'Resentment', children: ['bitterness', 'envy', 'jealousy', 'contempt'] },
      defiance: { label: 'Defiance', children: ['rebellion', 'stubbornness', 'resistance', 'spite'] },
    }
  },
  fear: {
    label: 'Fear', color: '#8b5cf6',
    children: {
      terror: { label: 'Terror', children: ['horror', 'dread', 'panic', 'fright'] },
      anxiety: { label: 'Anxiety', children: ['worry', 'unease', 'apprehension', 'nervousness'] },
      insecurity: { label: 'Insecurity', children: ['vulnerability', 'doubt', 'uncertainty', 'inadequacy'] },
      awe: { label: 'Awe', children: ['wonder', 'reverence', 'astonishment', 'overwhelm'] },
    }
  },
  surprise: {
    label: 'Surprise', color: '#06b6d4',
    children: {
      shock: { label: 'Shock', children: ['disbelief', 'stupefaction', 'bewilderment'] },
      discovery: { label: 'Discovery', children: ['revelation', 'epiphany', 'realization', 'curiosity'] },
    }
  },
  disgust: {
    label: 'Disgust', color: '#84cc16',
    children: {
      revulsion: { label: 'Revulsion', children: ['repulsion', 'nausea', 'abhorrence', 'loathing'] },
      disapproval: { label: 'Disapproval', children: ['judgment', 'disdain', 'scorn', 'derision'] },
    }
  },
  trust: {
    label: 'Trust', color: '#10b981',
    children: {
      acceptance: { label: 'Acceptance', children: ['tolerance', 'openness', 'receptiveness', 'faith'] },
      admiration: { label: 'Admiration', children: ['respect', 'esteem', 'veneration', 'deference'] },
    }
  },
  anticipation: {
    label: 'Anticipation', color: '#f97316',
    children: {
      hope: { label: 'Hope', children: ['optimism', 'aspiration', 'faith', 'expectation'] },
      vigilance: { label: 'Vigilance', children: ['alertness', 'suspicion', 'wariness', 'caution'] },
    }
  },
};

/**
 * Emotion Wheel Picker — hierarchical drill-down for selecting emotions
 * Supports single selection and compound blends (2 emotions)
 * Modes: 'picker' (manual selection) | 'engine' (auto-suggest based on context)
 */
export default function EmotionWheel({
  onSelect,
  defaultMode = 'picker',
  selectedEmotions = [],
  storyContext = '',
  chapterNotes = '',
}) {
  const [level, setLevel] = useState('primary'); // 'primary' | 'secondary' | 'tertiary'
  const [selectedPrimary, setSelectedPrimary] = useState(null);
  const [selectedSecondary, setSelectedSecondary] = useState(null);
  const [selections, setSelections] = useState(selectedEmotions);
  const [suggestions, setSuggestions] = useState([]);
  const [mode, setMode] = useState(defaultMode); // 'picker' | 'engine'
  const [showSuggestions, setShowSuggestions] = useState(defaultMode === 'engine');

  // Generate emotion suggestions based on context (simple heuristic)
  useEffect(() => {
    if (mode === 'engine' && (storyContext || chapterNotes)) {
      const combined = (storyContext + ' ' + chapterNotes).toLowerCase();

      // Simple keyword-based suggestion heuristic
      const keywordMap = {
        'joy:happiness:contentment': ['happy', 'peaceful', 'calm', 'serene', 'glad'],
        'fear:anxiety:worry': ['anxious', 'nervous', 'worried', 'scared', 'afraid'],
        'anger:rage:fury': ['angry', 'furious', 'mad', 'enraged', 'wrath'],
        'sadness:grief:loss': ['sad', 'grieving', 'mourning', 'lost', 'broken'],
        'surprise:shock:disbelief': ['surprised', 'shocked', 'amazed', 'stunned'],
        'trust:acceptance:faith': ['trust', 'believing', 'faith', 'accepted'],
        'anticipation:hope:optimism': ['hopeful', 'excited', 'looking forward', 'optimistic'],
        'disgust:revulsion:repulsion': ['disgusted', 'revolted', 'repulsed', 'sick'],
      };

      const matches = [];
      Object.entries(keywordMap).forEach(([emotions, keywords]) => {
        if (keywords.some(kw => combined.includes(kw))) {
          matches.push(emotions);
        }
      });

      setSuggestions(matches.slice(0, 2)); // Max 2 suggestions
    }
  }, [mode, storyContext, chapterNotes]);

  // Get primary emotions ordered
  const primaries = Object.entries(EMOTION_TAXONOMY).map(([key, data]) => ({
    key,
    ...data,
  }));

  // Get secondaries for current primary
  const primaryData = selectedPrimary ? EMOTION_TAXONOMY[selectedPrimary] : null;
  const secondaries = primaryData
    ? Object.entries(primaryData.children || {}).map(([key, data]) => ({
        key,
        ...data,
      }))
    : [];

  // Get tertiaries for current secondary
  const secondaryData = (primaryData && selectedSecondary) ? primaryData.children?.[selectedSecondary] : null;
  const tertiaries = secondaryData
    ? (secondaryData.children || []).map(e => e)
    : [];

  const handleSelectTertiary = (emotion) => {
    const fullPath = `${selectedPrimary}:${selectedSecondary}:${emotion}`;
    let newSelections = [...selections];

    if (newSelections.includes(fullPath)) {
      newSelections = newSelections.filter(e => e !== fullPath);
    } else if (newSelections.length < 2) {
      newSelections.push(fullPath);
    } else {
      // Replace the oldest selection
      newSelections.shift();
      newSelections.push(fullPath);
    }

    setSelections(newSelections);
    onSelect(newSelections);
  };

  const handleBack = () => {
    if (level === 'tertiary') {
      setLevel('secondary');
    } else if (level === 'secondary') {
      setLevel('primary');
      setSelectedPrimary(null);
    }
  };

  const handleSelectPrimary = (key) => {
    setSelectedPrimary(key);
    setSelectedSecondary(null);
    setLevel('secondary');
  };

  const handleSelectSecondary = (key) => {
    setSelectedSecondary(key);
    setLevel('tertiary');
  };

  const getEmotionLabel = (path) => {
    if (!path) return '';
    const [prim, sec, tert] = path.split(':');
    return tert || sec || prim;
  };

  const clearSelection = (index) => {
    const newSelections = selections.filter((_, i) => i !== index);
    setSelections(newSelections);
    onSelect(newSelections);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 16,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
    }}>
      {/* Header with mode toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={18} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Emotional Beats
          </h3>
          {selections.length > 0 && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              background: 'var(--accent)',
              color: 'var(--accent-btn-text)',
              borderRadius: 'var(--radius-sm)',
            }}>
              {selections.length}/2 selected
            </span>
          )}
        </div>
        {/* Mode toggle */}
        <div style={{
          display: 'flex',
          gap: 4,
          background: 'var(--bg-tertiary)',
          padding: 2,
          borderRadius: 'var(--radius-sm)',
        }}>
          <button
            onClick={() => setMode('picker')}
            style={{
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              border: mode === 'picker' ? '1px solid var(--accent)' : '1px solid transparent',
              background: mode === 'picker' ? 'var(--accent)' : 'transparent',
              color: mode === 'picker' ? 'var(--accent-btn-text)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            Manual
          </button>
          <button
            onClick={() => setMode('engine')}
            style={{
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              border: mode === 'engine' ? '1px solid var(--accent)' : '1px solid transparent',
              background: mode === 'engine' ? 'var(--accent)' : 'transparent',
              color: mode === 'engine' ? 'var(--accent-btn-text)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            Auto-Suggest
          </button>
        </div>
      </div>

      {/* Current selections display */}
      {selections.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          {selections.map((emotion, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              <span>{getEmotionLabel(emotion)}</span>
              <button
                onClick={() => clearSelection(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions in engine mode */}
      {level === 'primary' && mode === 'engine' && suggestions.length > 0 && (
        <div style={{
          padding: 10,
          background: 'rgba(251, 191, 36, 0.08)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 8,
        }}>
          <div style={{
            display: 'flex',
            gap: 6,
            alignItems: 'center',
            marginBottom: 8,
          }}>
            <Lightbulb size={14} style={{ color: '#fbbf24' }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              Based on your notes, consider:
            </span>
          </div>
          <div style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}>
            {suggestions.map((emotion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const newSelections = [...selections, emotion];
                  if (newSelections.length > 2) newSelections.shift();
                  setSelections(newSelections);
                  onSelect(newSelections);
                  setShowSuggestions(false);
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid #fbbf24',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => (e.target.style.background = '#fbbf24')}
                onMouseLeave={e => (e.target.style.background = 'var(--bg-tertiary)')}
              >
                {emotion.split(':').pop()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Level — Grid 4x2, alignment-chart style */}
      {level === 'primary' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 6,
        }}>
          {primaries.map(primary => (
            <button
              key={primary.key}
              onClick={() => handleSelectPrimary(primary.key)}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid var(--border)`,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
                fontWeight: 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = primary.color;
                e.currentTarget.style.color = primary.color;
                e.currentTarget.style.background = `${primary.color}18`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
            >
              {primary.label}
            </button>
          ))}
        </div>
      )}

      {/* Secondary Level — List */}
      {level === 'secondary' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}>
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: EMOTION_TAXONOMY[selectedPrimary]?.color,
              backgroundColor: EMOTION_TAXONOMY[selectedPrimary]?.color + '22',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
            }}>
              {EMOTION_TAXONOMY[selectedPrimary]?.label}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {secondaries.map(secondary => (
              <button
                key={secondary.key}
                onClick={() => handleSelectSecondary(secondary.key)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  e.target.style.background = EMOTION_TAXONOMY[selectedPrimary]?.color + '22';
                  e.target.style.borderColor = EMOTION_TAXONOMY[selectedPrimary]?.color;
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.borderColor = 'var(--border)';
                }}
              >
                {secondary.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tertiary Level — List */}
      {level === 'tertiary' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}>
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: EMOTION_TAXONOMY[selectedPrimary]?.color,
            }}>
              {EMOTION_TAXONOMY[selectedPrimary]?.children?.[selectedSecondary]?.label}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {tertiaries.map((tertiary, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTertiary(tertiary)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: selections.some(s => s.endsWith(`:${tertiary}`))
                    ? `2px solid ${EMOTION_TAXONOMY[selectedPrimary]?.color}`
                    : '1px solid var(--border)',
                  background: selections.some(s => s.endsWith(`:${tertiary}`))
                    ? EMOTION_TAXONOMY[selectedPrimary]?.color + '22'
                    : 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  textAlign: 'center',
                }}
                onMouseEnter={e => {
                  if (!selections.some(s => s.endsWith(`:${tertiary}`))) {
                    e.target.style.background = EMOTION_TAXONOMY[selectedPrimary]?.color + '11';
                  }
                }}
                onMouseLeave={e => {
                  if (!selections.some(s => s.endsWith(`:${tertiary}`))) {
                    e.target.style.background = 'var(--bg-tertiary)';
                  }
                }}
              >
                {tertiary}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info text */}
      <div style={{
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        marginTop: 4,
      }}>
        Select up to 2 emotions to create blends. Example: Joy + Fear = Thrilling Suspense
      </div>
    </div>
  );
}

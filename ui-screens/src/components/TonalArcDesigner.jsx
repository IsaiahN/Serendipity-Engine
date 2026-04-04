import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';

const TONAL_OPTIONS = [
  'earnest', 'wry', 'deadpan', 'elegiac', 'urgent', 'meditative',
  'sardonic', 'tender', 'cold', 'lyrical', 'raw', 'controlled',
  'volatile', 'hushed', 'incandescent', 'procedural', 'intimate',
  'tense', 'reflective', 'playful', 'ominous', 'bittersweet', 'gothic',
];

// Map tones to approximate intensity (0-100) for visual placement
const TONE_INTENSITY = {
  hushed: 15, meditative: 20, controlled: 25, deadpan: 30,
  cold: 35, procedural: 35, reflective: 40, tender: 45,
  earnest: 50, intimate: 50, lyrical: 55, bittersweet: 55,
  wry: 60, playful: 60, sardonic: 65, elegiac: 65,
  tense: 70, urgent: 75, raw: 80, volatile: 85,
  ominous: 80, incandescent: 90, gothic: 80,
};

const ARC_POINTS = [
  { key: 'opening', label: 'Opening', x: 10 },
  { key: 'risingAction', label: 'Rising Action', x: 30 },
  { key: 'midpoint', label: 'Midpoint', x: 50 },
  { key: 'climax', label: 'Climax', x: 75 },
  { key: 'resolution', label: 'Resolution', x: 92 },
];

export default function TonalArcDesigner() {
  const files = useProjectStore(s => s.files);
  const updateFile = useProjectStore(s => s.updateFile);

  const [tones, setTones] = useState({
    opening: 'controlled',
    risingAction: 'tense',
    midpoint: 'volatile',
    climax: 'incandescent',
    resolution: 'elegiac',
  });

  const [editingPoint, setEditingPoint] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load from story/arc.md
  useEffect(() => {
    const arcContent = files?.['story/arc.md'];
    if (arcContent) {
      // Parse tonal arc section from arc.md
      const tonalMatch = arcContent.match(/## Tonal Arc[\s\S]*?(?=\n## |\n---|\n$)/i);
      if (tonalMatch) {
        const section = tonalMatch[0];
        const parsed = {};

        // Try parsing from table format
        const tableLines = section.split('\n').filter(line => line.includes('|'));
        if (tableLines.length > 2) {
          // Table format: Act | Dominant Tone
          for (let i = 2; i < tableLines.length; i++) {
            const cells = tableLines[i].split('|').map(c => c.trim());
            if (cells.length >= 2) {
              const actText = cells[0].toLowerCase();
              const toneText = cells[1].toLowerCase().trim();

              // Map Act 1, Act 2, Act 3 to our structure
              if (actText.includes('act 1')) parsed.opening = toneText;
              else if (actText.includes('act 2')) parsed.midpoint = toneText;
              else if (actText.includes('act 3')) parsed.resolution = toneText;
            }
          }
        } else {
          // Try parsing from bullet format: - Opening: "tone"
          for (const point of ARC_POINTS) {
            const regex = new RegExp(`${point.label}[:\\s]+["']?([\\w\\s]+?)["']?(?:\\n|$)`, 'i');
            const m = section.match(regex);
            if (m) parsed[point.key] = m[1].trim().toLowerCase();
          }
        }

        if (Object.keys(parsed).length > 0) {
          setTones(prev => ({ ...prev, ...parsed }));
        }
      }
    }
  }, [files?.['story/arc.md']]);

  const handleToneChange = (pointKey, tone) => {
    setTones(prev => ({ ...prev, [pointKey]: tone }));
    setEditingPoint(null);
    setHasChanges(true);
  };

  const save = async () => {
    const arcContent = files?.['story/arc.md'] || '';
    const tonalSection = `## Tonal Arc\n\n| Act | Dominant Tone | Register |\n|-----|---------------|----------|\n${ARC_POINTS.map(p => {
      const actMap = {
        opening: 'Act 1',
        risingAction: 'Act 1–2',
        midpoint: 'Act 2',
        climax: 'Act 2–3',
        resolution: 'Act 3',
      };
      return `| ${actMap[p.key]} | ${tones[p.key]} | |`;
    }).join('\n')}\n`;

    // Replace or append tonal arc section
    let newContent;
    if (arcContent.match(/## Tonal Arc/i)) {
      newContent = arcContent.replace(/## Tonal Arc[\s\S]*?(?=\n## |\n---|\n$|$)/i, tonalSection);
    } else {
      newContent = arcContent.trim() + '\n\n' + tonalSection;
    }

    await updateFile('story/arc.md', newContent);
    setHasChanges(false);
  };

  // SVG dimensions
  const svgW = 600, svgH = 250, padX = 40, padY = 30;

  const points = ARC_POINTS.map(p => ({
    ...p,
    tone: tones[p.key] || 'controlled',
    cx: padX + (p.x / 100) * (svgW - 2 * padX),
    cy: padY + (1 - (TONE_INTENSITY[tones[p.key]] || 50) / 100) * (svgH - 2 * padY),
  }));

  // Generate smooth curve path
  const pathD = points.length > 1
    ? `M ${points[0].cx} ${points[0].cy} ` + points.slice(1).map((p, i) => {
      const prev = points[i];
      const cpx = (prev.cx + p.cx) / 2;
      return `C ${cpx} ${prev.cy}, ${cpx} ${p.cy}, ${p.cx} ${p.cy}`;
    }).join(' ')
    : '';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 20,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          margin: 0,
          color: 'var(--text-primary)',
        }}>Tonal Arc</h3>
        {hasChanges && (
          <button onClick={save} style={{
            padding: '4px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)',
            border: 'none',
            color: '#000',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >Save</button>
        )}
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '240px',
          marginBottom: 16,
        }}
      >
        {/* Grid lines */}
        {[20, 40, 60, 80].map(pct => (
          <line
            key={`grid-${pct}`}
            x1={padX}
            x2={svgW - padX}
            y1={padY + (1 - pct / 100) * (svgH - 2 * padY)}
            y2={padY + (1 - pct / 100) * (svgH - 2 * padY)}
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="4,4"
          />
        ))}

        {/* Intensity labels */}
        <text
          x={padX - 8}
          y={padY + 4}
          fontSize="9"
          fill="var(--text-muted)"
          textAnchor="end"
        >High</text>
        <text
          x={padX - 8}
          y={svgH - padY + 4}
          fontSize="9"
          fill="var(--text-muted)"
          textAnchor="end"
        >Low</text>

        {/* Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Fill below curve */}
        <path
          d={`${pathD} L ${points[points.length - 1].cx} ${svgH - padY} L ${points[0].cx} ${svgH - padY} Z`}
          fill="var(--accent)"
          fillOpacity="0.08"
        />

        {/* Points */}
        {points.map(p => (
          <g
            key={p.key}
            style={{ cursor: 'pointer' }}
            onClick={() => setEditingPoint(p.key)}
          >
            <circle
              cx={p.cx}
              cy={p.cy}
              r={editingPoint === p.key ? 10 : 7}
              fill={editingPoint === p.key ? 'var(--accent)' : 'var(--bg-card)'}
              stroke="var(--accent)"
              strokeWidth="2.5"
            />
            <text
              x={p.cx}
              y={p.cy + 22}
              fontSize="9"
              fill="var(--text-secondary)"
              textAnchor="middle"
              fontWeight="600"
            >
              {p.label}
            </text>
            <text
              x={p.cx}
              y={p.cy - 14}
              fontSize="8"
              fill="var(--accent)"
              textAnchor="middle"
              fontStyle="italic"
            >
              {p.tone}
            </text>
          </g>
        ))}
      </svg>

      {/* Tone selector dropdown */}
      {editingPoint && (
        <div style={{
          padding: 12,
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: 8,
            color: 'var(--text-secondary)',
          }}>
            Set tone for: {ARC_POINTS.find(p => p.key === editingPoint)?.label}
          </div>
          <div style={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
          }}>
            {TONAL_OPTIONS.map(tone => (
              <button
                key={tone}
                onClick={() => handleToneChange(editingPoint, tone)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 10,
                  fontSize: '0.7rem',
                  background: tones[editingPoint] === tone ? 'var(--accent)' : 'var(--bg-card)',
                  color: tones[editingPoint] === tone ? '#000' : 'var(--text-secondary)',
                  border: `1px solid ${tones[editingPoint] === tone ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontWeight: tones[editingPoint] === tone ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (tones[editingPoint] !== tone) {
                    e.target.style.background = 'var(--bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tones[editingPoint] !== tone) {
                    e.target.style.background = 'var(--bg-card)';
                  }
                }}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info text */}
      <div style={{
        marginTop: 12,
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        Click any point on the arc to select and change its tone. The visual position reflects the intensity of each tone — higher positions indicate more intense/volatile tones.
      </div>
    </div>
  );
}

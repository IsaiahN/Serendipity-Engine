import { MessageSquare, FileText, Plus, Users } from 'lucide-react';

const characters = [
  { name: 'Elena', role: 'Protagonist', tier: 'main', gradient: 'linear-gradient(135deg, #2dd4bf, #f472b6)', photo: null },
  { name: 'Marcus', role: 'Deuteragonist', tier: 'main', gradient: 'linear-gradient(135deg, #818cf8, #f97316)', photo: null },
  { name: 'Priya', role: 'Supporting', tier: 'main', gradient: 'linear-gradient(135deg, #fbbf24, #a78bfa)', photo: null },
  { name: 'Thomas', role: 'Minor', tier: 'minor', gradient: 'linear-gradient(135deg, #6ee7b7, #60a5fa)', photo: null },
  { name: 'Ruth', role: 'Minor', tier: 'minor', gradient: 'linear-gradient(135deg, #f9a8d4, #818cf8)', photo: null },
  { name: 'Bishop Lapp', role: 'Minor', tier: 'minor', gradient: 'linear-gradient(135deg, #94a3b8, #475569)', photo: null },
];

function Avatar({ char, size = 36 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: char.gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 700,
      color: '#000',
      flexShrink: 0,
    }}>
      {char.name[0]}
    </div>
  );
}

function MainCharRow({ c, onCharacterClick }) {
  return (
    <div
      data-char-name={c.name}
      onClick={() => onCharacterClick?.(c.name)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 8px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'var(--transition)',
      }}
    >
      <Avatar char={c} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.name}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.role}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }} title="Talk">
        <MessageSquare size={13} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }} title="File">
        <FileText size={13} />
      </button>
    </div>
  );
}

function MinorCharCell({ c, onCharacterClick }) {
  return (
    <div
      data-char-name={c.name}
      onClick={() => onCharacterClick?.(c.name)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 6px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'var(--transition)',
        flex: '1 1 45%',
        minWidth: 0,
      }}
    >
      <Avatar char={c} size={24} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{c.role}</div>
      </div>
    </div>
  );
}

export default function CastRoster({ onCharacterClick, onViewFullCast, onAddCharacter }) {
  const mainChars = characters.filter(c => c.tier === 'main');
  const minorChars = characters.filter(c => c.tier === 'minor');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header with add button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Cast Roster
        </h4>
        <button
          onClick={() => onAddCharacter?.()}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--accent)',
            cursor: 'pointer', padding: '3px 8px', fontSize: '0.65rem', fontWeight: 600,
          }}
          title="Add new character"
        >
          <Plus size={11} /> New
        </button>
      </div>

      {/* Main Characters — full-width rows */}
      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '4px 8px', marginBottom: 2 }}>
        Main Characters
      </div>
      {mainChars.map((c) => (
        <MainCharRow key={c.name} c={c} onCharacterClick={onCharacterClick} />
      ))}

      {/* Minor Characters — compact two-per-row grid */}
      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '8px 8px 4px', marginTop: 4 }}>
        Minor Characters
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {minorChars.map((c) => (
          <MinorCharCell key={c.name} c={c} onCharacterClick={onCharacterClick} />
        ))}
      </div>

      {/* View Full Cast link */}
      <button
        onClick={(e) => { e.stopPropagation(); onViewFullCast?.(); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          background: 'none', border: 'none',
          color: 'var(--accent)', cursor: 'pointer',
          padding: '8px 0', marginTop: 8, fontSize: '0.75rem',
          borderTop: '1px solid var(--border)',
          width: '100%',
        }}
      >
        <Users size={12} /> View Full Cast ({characters.length})
      </button>
    </div>
  );
}

export { Avatar, characters };

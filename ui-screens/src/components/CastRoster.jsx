import { useState } from 'react';
import { MessageSquare, Trash2, Plus, Users } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';

const gradients = [
  'linear-gradient(135deg, #2dd4bf, #f472b6)',
  'linear-gradient(135deg, #818cf8, #f97316)',
  'linear-gradient(135deg, #fbbf24, #a78bfa)',
  'linear-gradient(135deg, #6ee7b7, #60a5fa)',
  'linear-gradient(135deg, #f9a8d4, #818cf8)',
  'linear-gradient(135deg, #94a3b8, #475569)',
  'linear-gradient(135deg, #f87171, #fbbf24)',
  'linear-gradient(135deg, #34d399, #818cf8)',
];

function buildCastFromFiles(files) {
  return Object.entries(files)
    .filter(([p]) => p.startsWith('characters/') && p.endsWith('.md') && !p.includes('questions'))
    .map(([path, content], idx) => {
      const slug = path.replace('characters/', '').replace('.md', '');
      const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const lower = (content || '').toLowerCase();

      // Derive role from content
      let role = 'Supporting';
      if (lower.includes('protagonist')) role = 'Protagonist';
      else if (lower.includes('deuteragonist') || lower.includes('antihero')) role = 'Deuteragonist';
      else if (lower.includes('antagonist')) role = 'Antagonist';
      else if (lower.includes('confidante')) role = 'Supporting';
      else if (lower.includes('minor') || lower.includes('authority')) role = 'Minor';

      // Derive tier
      const isMain = lower.includes('protagonist') || lower.includes('deuteragonist') || lower.includes('main character') || lower.includes('main protagonist') || lower.includes('supporting') || lower.includes('confidante') || lower.includes('antihero');
      const tier = isMain ? 'main' : 'minor';

      return {
        name,
        role,
        tier,
        gradient: gradients[idx % gradients.length],
        photo: null,
      };
    });
}

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

function MainCharRow({ c, onCharacterClick, onCharacterChat, onCharacterDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      <button onClick={(e) => { e.stopPropagation(); onCharacterChat?.(c.name); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }} title={`Chat with ${c.name}`}>
        <MessageSquare size={13} />
      </button>
      {confirmDelete ? (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            onClick={() => { onCharacterDelete?.(c.name); setConfirmDelete(false); }}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 6px', fontSize: '0.6rem', fontWeight: 600 }}
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px', fontSize: '0.6rem' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }} title={`Remove ${c.name}`}>
          <Trash2 size={13} />
        </button>
      )}
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

export default function CastRoster({ onCharacterClick, onViewFullCast, onAddCharacter, onCharacterChat, onCharacterDelete }) {
  const files = useProjectStore(s => s.files);
  const characters = buildCastFromFiles(files);
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
      {mainChars.length > 0 && (
        <>
          <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '4px 8px', marginBottom: 2 }}>
            Main Characters
          </div>
          {mainChars.map((c) => (
            <MainCharRow key={c.name} c={c} onCharacterClick={onCharacterClick} onCharacterChat={onCharacterChat} onCharacterDelete={onCharacterDelete} />
          ))}
        </>
      )}

      {/* Minor Characters — compact two-per-row grid */}
      {minorChars.length > 0 && (
        <>
          <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '8px 8px 4px', marginTop: 4 }}>
            Minor Characters
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {minorChars.map((c) => (
              <MinorCharCell key={c.name} c={c} onCharacterClick={onCharacterClick} />
            ))}
          </div>
        </>
      )}

      {characters.length === 0 && (
        <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          No characters yet. Click "+ New" to add one.
        </div>
      )}

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

export { Avatar, buildCastFromFiles };

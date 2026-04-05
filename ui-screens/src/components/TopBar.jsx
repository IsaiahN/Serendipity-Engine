import { useState, useEffect, useRef } from 'react';
import { Settings, Search, Keyboard, Palette, ChevronDown, FileText, BookOpen, MessageSquare, Clock, Users, Compass, Edit3, GitCompare, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import HealthBar, { getHealthLevel } from './HealthBar';

/* ─── Command Palette / Search Modal ─── */
const commandItems = [
  { icon: Compass, label: 'Open Guide Mode', shortcut: null, action: (nav) => nav('/workspace?mode=guided') },
  { icon: MessageSquare, label: 'Open Story Assistant', shortcut: null, action: (nav) => nav('/workspace?mode=chat') },
  { icon: BookOpen, label: 'Open Reader', shortcut: null, action: (nav) => nav('/workspace?mode=reader') },
  { icon: Edit3, label: 'Open Editor', shortcut: null, action: (nav) => nav('/workspace?mode=editor') },
  { icon: Clock, label: 'Open Timeline', shortcut: null, action: (nav) => nav('/workspace?mode=timeline') },
  { icon: GitCompare, label: 'Compare Stories', shortcut: null, action: (nav) => nav('/workspace?mode=comparison') },
  { icon: Users, label: 'View Full Cast', shortcut: null, action: (nav) => nav('/workspace?mode=full-cast') },
  { icon: FileText, label: 'Go to Hub', shortcut: null, action: (nav) => nav('/hub') },
  { icon: Settings, label: 'Open Settings', shortcut: 'Ctrl+,', action: (nav) => nav('/settings') },
];

function SearchModal({ onClose, navigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = commandItems.filter(
    (item) => item.label.toLowerCase().includes(query.toLowerCase())
  );

  const runCommand = (item) => {
    item.action(navigate);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: 120, zIndex: 9999,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 440, background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && filtered.length > 0) runCommand(filtered[0]); }}
            placeholder="Search commands..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.9rem',
            }}
          />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>ESC</span>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '4px 0' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No matching commands
            </div>
          )}
          {filtered.map((item) => (
            <div
              key={item.label}
              onClick={() => runCommand(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem',
                color: 'var(--text-secondary)', transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <item.icon size={15} color="var(--text-muted)" />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.shortcut}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Keyboard Shortcuts Modal ─── */
const shortcutList = [
  { keys: 'Ctrl+K', desc: 'Command palette' },
  { keys: 'Ctrl+,', desc: 'Open settings' },
  { keys: 'Ctrl+S', desc: 'Save current file' },
  { keys: 'Ctrl+Z', desc: 'Undo' },
  { keys: 'Ctrl+Shift+Z', desc: 'Redo' },
  { keys: 'Ctrl+F', desc: 'Search in project' },
  { keys: 'Ctrl+/', desc: 'Toggle sidebar' },
  { keys: 'Escape', desc: 'Close modal / cancel' },
];

function ShortcutsModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 380, background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Keyboard Shortcuts</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, fontSize: '1.1rem' }}>&times;</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {shortcutList.map(s => (
            <div key={s.keys} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.desc}</span>
              <span style={{
                fontSize: '0.7rem', color: 'var(--text-muted)',
                padding: '2px 8px', border: '1px solid var(--border)',
                borderRadius: 4, fontFamily: 'monospace', background: 'var(--bg-tertiary)',
              }}>{s.keys}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TopBar({ projectName, healthRating, showHealth = true, projectMode, onHealthClick, onSettingsClick, onThemeClick, onTourClick, onShowShortcuts, onRename }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/workspace');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef(null);

  // Focus the rename input when entering rename mode
  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  const startRename = () => {
    if (!onRename) return;
    setRenameValue(projectName || '');
    setIsRenaming(true);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== projectName && onRename) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  const cancelRename = () => {
    setIsRenaming(false);
  };

  // Ctrl+K / Cmd+K keyboard shortcut for command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
    {showSearch && <SearchModal onClose={() => setShowSearch(false)} navigate={navigate} />}
    {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    <div style={{
      height: 48,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo / Home */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'var(--accent)',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>✦</span>
        Serendipity Engine
      </div>

      {/* Project Name (if in workspace) — double-click to rename */}
      {isWorkspace && projectName && (
        <>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          {isRenaming ? (
            <input
              ref={renameRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') cancelRename();
              }}
              style={{
                fontSize: '0.9rem', color: 'var(--text-primary)',
                background: 'var(--bg-tertiary)', border: '1px solid var(--accent)',
                borderRadius: 4, padding: '2px 8px', outline: 'none',
                minWidth: 120, maxWidth: 400,
              }}
            />
          ) : (
            <span
              onDoubleClick={startRename}
              title={onRename ? 'Double-click to rename' : undefined}
              style={{
                fontSize: '0.9rem', color: 'var(--text-primary)',
                cursor: onRename ? 'text' : 'default',
                padding: '2px 4px', borderRadius: 4,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (onRename) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {projectName}
            </span>
          )}
          {projectMode && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '2px 7px',
              borderRadius: 100,
              background: projectMode === 'decompose'
                ? 'rgba(168, 85, 247, 0.12)'
                : 'rgba(59, 130, 246, 0.12)',
              color: projectMode === 'decompose'
                ? '#c084fc'
                : '#60a5fa',
              border: `1px solid ${projectMode === 'decompose' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(59, 130, 246, 0.25)'}`,
            }}>
              {projectMode === 'decompose' ? 'Decomposition' : projectMode === 'roughdraft' ? 'Rough Draft' : 'Creation'}
            </span>
          )}
        </>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Story Structure Score (if in workspace) — hidden for decomposed projects */}
      {isWorkspace && showHealth && projectMode !== 'decompose' && (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', position: 'relative' }}
          onClick={onHealthClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Story Structure:</span>
          <div style={{ width: 150 }}>
            <HealthBar rating={healthRating || 3} size="sm" compact />
          </div>
          {showTooltip && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              width: 280,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 14,
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              zIndex: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Story Structure Score
              </div>
              <p style={{ marginBottom: 8 }}>
                This is the weighted average of all 10 story dimensions — from Author Depth to Theme Resonance. It tells you at a glance how well-developed your story is across the board.
              </p>
              <p style={{ marginBottom: 8 }}>
                <strong style={{ color: getHealthLevel(healthRating || 3).color }}>
                  {getHealthLevel(healthRating || 3).label} ({healthRating || 3}/5)
                </strong>{' '}
                means your story's foundations are solid with a few areas that need attention.
              </p>
              <div style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 600 }}>
                Click to view full breakdown →
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <button onClick={() => setShowSearch(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Command Palette (Ctrl+K)">
        <Search size={16} />
      </button>
      <button onClick={() => onShowShortcuts?.()} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Keyboard Shortcuts (Ctrl+/)">
        <Keyboard size={16} />
      </button>
      <button onClick={onThemeClick || (() => navigate('/settings?tab=general'))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Theme">
        <Palette size={16} />
      </button>
      <button onClick={onTourClick || (() => navigate('/settings?tab=about'))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Start product tour" data-tour="settings-btn">
        <HelpCircle size={16} />
      </button>
      <button onClick={onSettingsClick || (() => navigate('/settings'))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Settings (Ctrl+,)">
        <Settings size={16} />
      </button>
    </div>
    </>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Settings,
  Plus,
  BookOpen,
  Users,
  Compass,
  Edit3,
  Download,
  Sparkles,
  Home,
  X,
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * CommandPalette — Cmd+K / Ctrl+K command overlay
 *
 * Features:
 * - Opens with Cmd+K or Ctrl+K
 * - Searchable with fuzzy matching on label, description, keywords
 * - Categorized command sections
 * - Arrow key navigation
 * - Enter to select
 * - Escape to close
 */

const COMMANDS = [
  // ── Navigation ──────────────────────
  {
    id: 'go-hub',
    label: 'Go to Hub',
    description: 'Return to the project hub',
    icon: Home,
    category: 'Navigation',
    keywords: ['home', 'hub', 'projects'],
    action: (navigate) => navigate('/hub'),
  },
  {
    id: 'go-settings',
    label: 'Go to Settings',
    description: 'Open settings and preferences',
    icon: Settings,
    category: 'Navigation',
    keywords: ['settings', 'preferences', 'config'],
    action: (navigate) => navigate('/settings'),
  },
  {
    id: 'go-workspace',
    label: 'Go to Workspace',
    description: 'Open the active workspace',
    icon: Compass,
    category: 'Navigation',
    keywords: ['workspace', 'editor', 'work'],
    action: (navigate) => navigate('/workspace'),
  },
  {
    id: 'new-project',
    label: 'New Project',
    description: 'Start a new project with wizard',
    icon: Plus,
    category: 'Navigation',
    keywords: ['new', 'create', 'project', 'wizard'],
    action: (navigate) => navigate('/wizard'),
  },

  // ── Workspace Modes ──────────────────
  {
    id: 'mode-guide',
    label: 'Switch to Guide',
    description: 'Show AI guide and teaching tips',
    icon: BookOpen,
    category: 'Workspace',
    keywords: ['guide', 'mode', 'teach', 'tips'],
    action: (navigate, settingsStore) => {
      settingsStore.updateSettings({ teachingTips: 'on' });
    },
  },
  {
    id: 'mode-chat',
    label: 'Switch to Chat',
    description: 'Open the writing assistant chat',
    icon: Users,
    category: 'Workspace',
    keywords: ['chat', 'assistant', 'mode'],
    action: (navigate, settingsStore) => {
      // Toggle chat mode (app-specific logic)
    },
  },
  {
    id: 'mode-editor',
    label: 'Switch to Editor',
    description: 'Focus the text editor',
    icon: Edit3,
    category: 'Workspace',
    keywords: ['editor', 'write', 'mode'],
    action: (navigate, settingsStore) => {
      // Focus editor (app-specific logic)
    },
  },
  {
    id: 'mode-reader',
    label: 'Switch to Reader',
    description: 'View project in reading mode',
    icon: FileText,
    category: 'Workspace',
    keywords: ['reader', 'read', 'view', 'mode'],
    action: (navigate, settingsStore) => {
      // Switch to reader (app-specific logic)
    },
  },

  // ── Export ──────────────────────────
  {
    id: 'export-markdown',
    label: 'Export as Markdown',
    description: 'Download as .md file',
    icon: Download,
    category: 'Export',
    keywords: ['export', 'markdown', 'md', 'download'],
    action: (navigate, settingsStore) => {
      // Trigger export (app-specific logic)
    },
  },
  {
    id: 'export-docx',
    label: 'Export as DOCX',
    description: 'Download as Word document',
    icon: Download,
    category: 'Export',
    keywords: ['export', 'docx', 'word', 'download'],
    action: (navigate, settingsStore) => {
      // Trigger export (app-specific logic)
    },
  },
  {
    id: 'export-pdf',
    label: 'Export as PDF',
    description: 'Download as PDF file',
    icon: Download,
    category: 'Export',
    keywords: ['export', 'pdf', 'download'],
    action: (navigate, settingsStore) => {
      // Trigger export (app-specific logic)
    },
  },
  {
    id: 'export-zip',
    label: 'Export as ZIP',
    description: 'Download entire project as archive',
    icon: Download,
    category: 'Export',
    keywords: ['export', 'zip', 'archive', 'download'],
    action: (navigate, settingsStore) => {
      // Trigger export (app-specific logic)
    },
  },

  // ── Quick Actions ───────────────────
  {
    id: 'open-phase-1',
    label: 'Open Phase 1',
    description: 'Concept & Vision',
    icon: Sparkles,
    category: 'Quick Actions',
    keywords: ['phase', '1', 'concept', 'vision'],
    action: (navigate, settingsStore) => {
      // Open phase (app-specific logic)
    },
  },
  {
    id: 'open-phase-8',
    label: 'Open Phase 8',
    description: 'Final Polish',
    icon: Sparkles,
    category: 'Quick Actions',
    keywords: ['phase', '8', 'polish', 'final'],
    action: (navigate, settingsStore) => {
      // Open phase (app-specific logic)
    },
  },
  {
    id: 'character-cast',
    label: 'Open Character Cast',
    description: 'View and manage character profiles',
    icon: Users,
    category: 'Quick Actions',
    keywords: ['character', 'cast', 'profiles', 'view'],
    action: (navigate, settingsStore) => {
      // Open character cast (app-specific logic)
    },
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Theme',
    description: 'Switch between light and dark mode',
    icon: Sparkles,
    category: 'Quick Actions',
    keywords: ['theme', 'dark', 'light', 'toggle'],
    action: (navigate, settingsStore) => {
      const currentTheme = settingsStore.theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      settingsStore.updateSettings({ theme: newTheme });
    },
  },
];

/**
 * Fuzzy search: match any word in label, description, or keywords
 */
function fuzzyMatch(query, command) {
  if (!query) return true;

  const queryWords = query.toLowerCase().split(/\s+/);
  const searchText = [
    command.label,
    command.description,
    ...command.keywords,
  ]
    .join(' ')
    .toLowerCase();

  return queryWords.every(word => searchText.includes(word));
}

/**
 * Hook to open/close palette with Cmd+K / Ctrl+K
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}

/**
 * CommandPalette component
 */
export default function CommandPalette() {
  const navigate = useNavigate();
  const settingsStore = useSettingsStore();
  const { open, setOpen } = useCommandPalette();

  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  // Filter and group commands
  const filtered = useMemo(() => {
    return COMMANDS.filter(cmd => fuzzyMatch(query, cmd)).slice(0, 10);
  }, [query]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  // Focus input when palette opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Handle keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (!open) return;

      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIdx]) {
          const cmd = filtered[selectedIdx];
          cmd.action(navigate, settingsStore);
          setOpen(false);
          setQuery('');
          setSelectedIdx(0);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selectedIdx, navigate, settingsStore, setOpen]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 990,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Palette */}
      <div
        style={{
          position: 'fixed',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '500px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <Search size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or keyword..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
              }}
            >
              No commands found
            </div>
          ) : (
            Object.entries(grouped).map(([category, commands]) => (
              <div key={category}>
                {/* Category Header */}
                <div
                  style={{
                    padding: '8px 12px 4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {category}
                </div>

                {/* Commands */}
                {commands.map((cmd, idx) => {
                  const globalIdx = filtered.indexOf(cmd);
                  const isSelected = globalIdx === selectedIdx;
                  const IconComponent = cmd.icon;

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action(navigate, settingsStore);
                        setOpen(false);
                        setQuery('');
                        setSelectedIdx(0);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 12px',
                        marginBottom: '2px',
                        background: isSelected
                          ? 'var(--bg-tertiary)'
                          : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <IconComponent
                        size={18}
                        style={{
                          color: 'var(--text-muted)',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {cmd.label}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          {cmd.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Dismiss</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}

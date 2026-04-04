import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { Copy, Trash2, Eye, Upload, Plus, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import db from '../lib/db';

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function calculateWordDelta(forkFiles, parentFiles) {
  const countWords = (content) => (content ? content.split(/\s+/).filter(Boolean).length : 0);
  const forkWords = Object.values(forkFiles).reduce((sum, content) => sum + countWords(content), 0);
  const parentWords = Object.values(parentFiles).reduce((sum, content) => sum + countWords(content), 0);
  return forkWords - parentWords;
}

function DiffView({ parentContent, forkContent }) {
  const [showDiff, setShowDiff] = useState(false);

  if (!showDiff) {
    return (
      <button
        onClick={() => setShowDiff(true)}
        style={{
          padding: '8px 12px',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Eye size={14} /> View Diff
      </button>
    );
  }

  const parentLines = parentContent ? parentContent.split('\n') : [];
  const forkLines = forkContent ? forkContent.split('\n') : [];

  return (
    <div style={{ marginTop: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: 2, background: 'var(--bg-secondary)' }}>
        {/* Parent */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            padding: '8px 12px',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}>
            Parent Version
          </div>
          <div style={{
            padding: '12px',
            maxHeight: 300,
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'var(--bg-primary)',
          }}>
            {parentLines.slice(0, 20).map((line, i) => (
              <div key={i} style={{ lineHeight: '1.4' }}>
                {line || '\u00A0'}
              </div>
            ))}
            {parentLines.length > 20 && <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>... ({parentLines.length - 20} more lines)</div>}
          </div>
        </div>

        {/* Fork */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            padding: '8px 12px',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}>
            Fork Version
          </div>
          <div style={{
            padding: '12px',
            maxHeight: 300,
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'var(--bg-primary)',
          }}>
            {forkLines.slice(0, 20).map((line, i) => (
              <div key={i} style={{ lineHeight: '1.4', backgroundColor: line && line !== parentLines[i] ? 'rgba(34, 197, 94, 0.1)' : 'transparent' }}>
                {line || '\u00A0'}
              </div>
            ))}
            {forkLines.length > 20 && <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>... ({forkLines.length - 20} more lines)</div>}
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowDiff(false)}
        style={{
          width: '100%',
          padding: '8px',
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: 'none',
          borderTop: '1px solid var(--border)',
          cursor: 'pointer',
          fontSize: '0.8rem',
        }}
      >
        Hide Diff
      </button>
    </div>
  );
}

function FileItem({ filePath, forkContent, parentContent, onPromote, onViewDiff }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      marginBottom: 8,
      overflow: 'hidden',
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {filePath}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 8, flexShrink: 0 }}>
          {(forkContent || '').length} chars
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 12 }}>
            <DiffView parentContent={parentContent} forkContent={forkContent} />
          </div>
          <button
            onClick={() => onPromote(filePath)}
            style={{
              padding: '8px 12px',
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            <Upload size={14} /> Promote to Main
          </button>
        </div>
      )}
    </div>
  );
}

function ForkCard({ fork, parentFiles, onOpenFork, onPromoteFile, onPromoteAll, onDiscard }) {
  const [forkFiles, setForkFiles] = useState({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadForkFiles = async () => {
      try {
        const fileRecords = await db.projectFiles.where('projectId').equals(fork.id).toArray();
        if (fileRecords) {
          const files = {};
          for (const f of fileRecords) {
            files[f.path] = f.content;
          }
          setForkFiles(files);
        }
      } catch (err) {
        console.warn('Failed to load fork files:', err);
      }
    };
    loadForkFiles();
  }, [fork.id]);

  const wordDelta = calculateWordDelta(forkFiles, parentFiles);
  const fileCount = Object.keys(forkFiles).length;
  const changedFiles = Object.keys(forkFiles).filter(path => forkFiles[path] !== parentFiles[path]);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          userSelect: 'none',
          marginBottom: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              padding: '3px 8px',
              background: fork.forkType === 'sandbox' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
              color: fork.forkType === 'sandbox' ? '#3b82f6' : '#a855f7',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {fork.forkType}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {formatDate(fork.forkCreatedAt)}
            </div>
          </div>
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            wordBreak: 'break-word',
          }}>
            {fork.title}
          </h3>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginTop: 6,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <span>{fileCount} files</span>
            <span>{changedFiles.length} changed</span>
            <span style={{ color: wordDelta > 0 ? '#22c55e' : '#ef4444' }}>
              {wordDelta > 0 ? '+' : ''}{wordDelta} words
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 12, flexShrink: 0, color: 'var(--text-secondary)' }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {/* Files List */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
              Changed Files ({changedFiles.length})
            </div>
            {changedFiles.length === 0 ? (
              <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                No changes in this fork yet.
              </div>
            ) : (
              changedFiles.map(path => (
                <FileItem
                  key={path}
                  filePath={path}
                  forkContent={forkFiles[path]}
                  parentContent={parentFiles[path] || ''}
                  onPromote={onPromoteFile}
                />
              ))
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button
              onClick={() => {
                if (window.confirm('Replace ALL files in the main project with this fork\'s version? This cannot be undone.')) {
                  onPromoteAll(fork.id);
                }
              }}
              style={{
                padding: '8px 12px',
                background: '#22c55e',
                color: '#000',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              <Upload size={14} /> Promote All
            </button>

            <button
              onClick={() => {
                if (window.confirm('Delete this fork permanently? This cannot be undone.')) {
                  onDiscard(fork.id);
                }
              }}
              style={{
                padding: '8px 12px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              <Trash2 size={14} /> Delete Fork
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SandboxMode() {
  const activeProject = useProjectStore(s => s.activeProject);
  const files = useProjectStore(s => s.files);
  const projectStore = useProjectStore();

  const [forks, setForks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadForks();
  }, [activeProject?.id]);

  const loadForks = async () => {
    if (!activeProject?.id) return;
    setLoading(true);
    try {
      const forksList = await projectStore.listForks(activeProject.id);
      setForks(forksList);
    } catch (err) {
      console.warn('Failed to load forks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSandbox = async () => {
    try {
      const title = prompt('Sandbox name (optional):', '');
      await projectStore.forkProject(activeProject.id, {
        title: title || `${activeProject.title} (Sandbox)`,
        forkType: 'sandbox',
      });
      await loadForks();
    } catch (err) {
      console.error('Failed to create sandbox:', err);
      alert('Failed to create sandbox. Please try again.');
    }
  };

  const handleCreateFork = async () => {
    try {
      const title = prompt('Fork name (optional):', '');
      await projectStore.forkProject(activeProject.id, {
        title: title || `${activeProject.title} (Fork)`,
        forkType: 'fork',
      });
      await loadForks();
    } catch (err) {
      console.error('Failed to create fork:', err);
      alert('Failed to create fork. Please try again.');
    }
  };

  const handlePromoteFile = async (forkId, filePath) => {
    try {
      await projectStore.promoteFromFork(forkId, filePath);
      await loadForks();
      alert(`${filePath} promoted to main project!`);
    } catch (err) {
      console.error('Failed to promote file:', err);
      alert('Failed to promote file. Please try again.');
    }
  };

  const handlePromoteAll = async (forkId) => {
    try {
      await projectStore.promoteFork(forkId);
      await loadForks();
      alert('Fork promoted! All changes are now in the main project.');
    } catch (err) {
      console.error('Failed to promote fork:', err);
      alert('Failed to promote fork. Please try again.');
    }
  };

  const handleDiscard = async (forkId) => {
    try {
      await projectStore.discardFork(forkId);
      await loadForks();
      alert('Fork deleted.');
    } catch (err) {
      console.error('Failed to discard fork:', err);
      alert('Failed to delete fork. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-primary)',
      padding: 0,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 12px 0',
        }}>
          Sandbox Mode
        </h2>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: 1.4,
        }}>
          Experiment with "what-if" scenarios without affecting your main project. Create sandboxes to test ideas, or forks to explore major revisions.
        </p>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
      }}>
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={handleCreateSandbox}
            style={{
              padding: '10px 16px',
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            <Plus size={16} /> New Sandbox
          </button>

          <button
            onClick={handleCreateFork}
            style={{
              padding: '10px 16px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.target.style.background = 'var(--bg-secondary)')}
            onMouseLeave={(e) => (e.target.style.background = 'var(--bg-tertiary)')}
          >
            <Copy size={16} /> New Fork
          </button>
        </div>

        {/* Forks List */}
        {loading ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}>
            Loading forks...
          </div>
        ) : forks.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border)',
            color: 'var(--text-secondary)',
          }}>
            <AlertCircle size={32} style={{ opacity: 0.5, marginBottom: 12, display: 'inline-block' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              No sandboxes or forks yet.
            </p>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
              Click "New Sandbox" or "New Fork" to get started.
            </p>
          </div>
        ) : (
          forks.map(fork => (
            <ForkCard
              key={fork.id}
              fork={fork}
              parentFiles={files}
              onPromoteFile={(filePath) => handlePromoteFile(fork.id, filePath)}
              onPromoteAll={handlePromoteAll}
              onDiscard={handleDiscard}
            />
          ))
        )}
      </div>
    </div>
  );
}

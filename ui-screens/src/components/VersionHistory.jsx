/**
 * Serendipity Engine — Version History Panel
 *
 * Shows a chronological list of file changes with diff preview
 * and one-click restore. Integrates with projectStore's file history.
 */
import { useState, useMemo } from 'react';
import { Clock, RotateCcw, Eye, ChevronDown, ChevronRight, FileText, Pencil, Plus, Trash2, GitCommit } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';

// ── Diff Engine (word-level) ────────────────────────────────────────

function computeWordDiff(oldText, newText) {
  if (!oldText && !newText) return [];
  if (!oldText) return [{ type: 'add', text: newText }];
  if (!newText) return [{ type: 'remove', text: oldText }];

  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  const result = [];

  // Simple LCS-based diff
  const m = oldWords.length;
  const n = newWords.length;

  // For performance, use a simplified approach for large texts
  if (m * n > 100000) {
    // Fall back to line-level diff for very large texts
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const lineResult = [];

    let oi = 0, ni = 0;
    while (oi < oldLines.length || ni < newLines.length) {
      if (oi >= oldLines.length) {
        lineResult.push({ type: 'add', text: newLines[ni] + '\n' });
        ni++;
      } else if (ni >= newLines.length) {
        lineResult.push({ type: 'remove', text: oldLines[oi] + '\n' });
        oi++;
      } else if (oldLines[oi] === newLines[ni]) {
        lineResult.push({ type: 'same', text: oldLines[oi] + '\n' });
        oi++;
        ni++;
      } else {
        // Look ahead to find a match
        let foundOld = -1, foundNew = -1;
        for (let k = 1; k < 10; k++) {
          if (foundNew === -1 && ni + k < newLines.length && oldLines[oi] === newLines[ni + k]) foundNew = ni + k;
          if (foundOld === -1 && oi + k < oldLines.length && oldLines[oi + k] === newLines[ni]) foundOld = oi + k;
        }

        if (foundOld !== -1 && (foundNew === -1 || foundOld - oi <= foundNew - ni)) {
          while (oi < foundOld) {
            lineResult.push({ type: 'remove', text: oldLines[oi] + '\n' });
            oi++;
          }
        } else if (foundNew !== -1) {
          while (ni < foundNew) {
            lineResult.push({ type: 'add', text: newLines[ni] + '\n' });
            ni++;
          }
        } else {
          lineResult.push({ type: 'remove', text: oldLines[oi] + '\n' });
          lineResult.push({ type: 'add', text: newLines[ni] + '\n' });
          oi++;
          ni++;
        }
      }
    }
    return lineResult;
  }

  // Simple two-pointer diff for smaller texts
  let oi = 0, ni = 0;
  while (oi < m || ni < n) {
    if (oi < m && ni < n && oldWords[oi] === newWords[ni]) {
      result.push({ type: 'same', text: oldWords[oi] });
      oi++;
      ni++;
    } else {
      // Look ahead
      let foundOld = -1, foundNew = -1;
      for (let k = 1; k < 20; k++) {
        if (foundNew === -1 && ni + k < n && oldWords[oi] === newWords[ni + k]) foundNew = ni + k;
        if (foundOld === -1 && oi + k < m && oldWords[oi + k] === newWords[ni]) foundOld = oi + k;
      }

      if (foundOld !== -1 && (foundNew === -1 || foundOld - oi <= foundNew - ni)) {
        while (oi < foundOld) {
          result.push({ type: 'remove', text: oldWords[oi] });
          oi++;
        }
      } else if (foundNew !== -1) {
        while (ni < foundNew) {
          result.push({ type: 'add', text: newWords[ni] });
          ni++;
        }
      } else {
        if (oi < m) { result.push({ type: 'remove', text: oldWords[oi] }); oi++; }
        if (ni < n) { result.push({ type: 'add', text: newWords[ni] }); ni++; }
      }
    }
  }

  return result;
}

// ── Time Formatting ─────────────────────────────────────────────────

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function actionIcon(action) {
  switch (action) {
    case 'create': return <Plus size={12} color="#22c55e" />;
    case 'edit': return <Pencil size={12} color="var(--accent)" />;
    case 'delete': return <Trash2 size={12} color="#ef4444" />;
    default: return <GitCommit size={12} color="var(--text-muted)" />;
  }
}

function actionLabel(action) {
  switch (action) {
    case 'create': return 'Created';
    case 'edit': return 'Edited';
    case 'delete': return 'Deleted';
    default: return 'Changed';
  }
}

// ── Version History Entry ───────────────────────────────────────────

function HistoryEntry({ entry, onPreview, onRestore, isExpanded, onToggle }) {
  const diffSegments = useMemo(() => {
    if (!isExpanded || !entry.previousContent) return [];
    return computeWordDiff(entry.previousContent, entry.content);
  }, [isExpanded, entry]);

  const stats = useMemo(() => {
    if (!entry.previousContent && entry.content) {
      const words = entry.content.split(/\s+/).filter(Boolean).length;
      return { added: words, removed: 0 };
    }
    if (!isExpanded) return null;
    const added = diffSegments.filter(s => s.type === 'add').reduce((sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length, 0);
    const removed = diffSegments.filter(s => s.type === 'remove').reduce((sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length, 0);
    return { added, removed };
  }, [isExpanded, diffSegments, entry]);

  return (
    <div style={{
      borderLeft: '2px solid var(--border)',
      paddingLeft: 16,
      marginLeft: 8,
      paddingBottom: 16,
      position: 'relative',
    }}>
      {/* Timeline dot */}
      <div style={{
        position: 'absolute',
        left: -6,
        top: 4,
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: entry.action === 'create' ? '#22c55e' : 'var(--accent)',
        border: '2px solid var(--bg-primary)',
      }} />

      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        {isExpanded ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
        {actionIcon(entry.action)}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {entry.filename}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {actionLabel(entry.action)}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {timeAgo(entry.timestamp)}
        </span>
      </div>

      {/* Description */}
      {entry.description && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: 2,
          paddingLeft: 22,
        }}>
          {entry.description}
        </div>
      )}

      {/* Expanded diff view */}
      {isExpanded && (
        <div style={{
          marginTop: 8,
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {/* Stats bar */}
          {stats && (
            <div style={{
              display: 'flex',
              gap: 12,
              padding: '6px 12px',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.7rem',
            }}>
              {stats.added > 0 && (
                <span style={{ color: '#22c55e' }}>+{stats.added} words</span>
              )}
              {stats.removed > 0 && (
                <span style={{ color: '#ef4444' }}>-{stats.removed} words</span>
              )}
            </div>
          )}

          {/* Diff content */}
          <div style={{
            padding: '8px 12px',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            lineHeight: 1.7,
            maxHeight: 200,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {diffSegments.length > 0 ? diffSegments.map((seg, i) => (
              <span key={i} style={{
                background: seg.type === 'add' ? 'rgba(34,197,94,0.15)' : seg.type === 'remove' ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: seg.type === 'add' ? '#22c55e' : seg.type === 'remove' ? '#ef4444' : 'var(--text-secondary)',
                textDecoration: seg.type === 'remove' ? 'line-through' : 'none',
              }}>{seg.text}</span>
            )) : (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {entry.action === 'create' ? 'New file created' : 'No previous version available'}
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 8,
            padding: '8px 12px',
            borderTop: '1px solid var(--border)',
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(entry); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                fontSize: '0.7rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Eye size={12} /> Preview
            </button>
            {entry.previousContent && (
              <button
                onClick={(e) => { e.stopPropagation(); onRestore(entry); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--accent)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <RotateCcw size={12} /> Restore This Version
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Version History Panel ──────────────────────────────────────

export default function VersionHistory({ onClose, onRestore }) {
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [filterFile, setFilterFile] = useState(null);
  const [previewEntry, setPreviewEntry] = useState(null);

  // Get session log from projectStore (loaded from IndexedDB on project open)
  const files = useProjectStore(s => s.files);
  const sessionLog = useProjectStore(s => s.sessionLog);

  // Build history from session log entries
  const history = useMemo(() => {
    const entries = [];

    for (const log of sessionLog) {
      if (log.type === 'file-edit' || log.type === 'file-create') {
        entries.push({
          id: log.id || `${log.timestamp}-${log.filename}`,
          filename: log.filename || log.path,
          action: log.type === 'file-create' ? 'create' : 'edit',
          timestamp: log.timestamp,
          content: log.content || files[log.filename || log.path] || '',
          previousContent: log.previousContent || null,
          description: log.description || null,
        });
      }
    }

    // If no session log entries yet, generate synthetic entries from current files
    // so there's always something to show
    if (entries.length === 0 && files) {
      const now = Date.now();
      Object.keys(files).sort().forEach((filename, i) => {
        entries.push({
          id: `synthetic-${i}`,
          filename,
          action: 'create',
          timestamp: now - (Object.keys(files).length - i) * 60000,
          content: files[filename],
          previousContent: null,
          description: 'Project file',
        });
      });
    }

    // Sort newest first
    entries.sort((a, b) => b.timestamp - a.timestamp);
    return entries;
  }, [sessionLog, files]);

  // Get unique filenames for filter
  const fileList = useMemo(() => {
    const set = new Set(history.map(e => e.filename));
    return Array.from(set).sort();
  }, [history]);

  const filteredHistory = filterFile
    ? history.filter(e => e.filename === filterFile)
    : history;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-secondary)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <Clock size={16} color="var(--accent)" />
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Version History
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {filteredHistory.length} changes
        </span>
      </div>

      {/* File filter */}
      {fileList.length > 1 && (
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '8px 16px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border)',
        }}>
          <button
            onClick={() => setFilterFile(null)}
            style={{
              padding: '3px 8px',
              fontSize: '0.65rem',
              borderRadius: 100,
              border: '1px solid var(--border)',
              background: !filterFile ? 'var(--accent-glow)' : 'transparent',
              color: !filterFile ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All files
          </button>
          {fileList.slice(0, 10).map(f => (
            <button
              key={f}
              onClick={() => setFilterFile(f)}
              style={{
                padding: '3px 8px',
                fontSize: '0.65rem',
                borderRadius: 100,
                border: '1px solid var(--border)',
                background: filterFile === f ? 'var(--accent-glow)' : 'transparent',
                color: filterFile === f ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {f.split('/').pop()}
            </button>
          ))}
        </div>
      )}

      {/* History list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {filteredHistory.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            gap: 8,
          }}>
            <Clock size={32} color="var(--text-muted)" style={{ opacity: 0.4 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No changes yet
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7 }}>
              Changes to your project files will appear here
            </span>
          </div>
        ) : (
          filteredHistory.map(entry => (
            <HistoryEntry
              key={entry.id}
              entry={entry}
              isExpanded={expandedEntry === entry.id}
              onToggle={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
              onPreview={(e) => setPreviewEntry(e)}
              onRestore={(e) => {
                if (onRestore) onRestore(e.filename, e.previousContent);
              }}
            />
          ))
        )}
      </div>

      {/* Preview modal */}
      {previewEntry && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setPreviewEntry(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              width: '80%',
              maxWidth: 700,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <FileText size={14} color="var(--accent)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{previewEntry.filename}</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {timeAgo(previewEntry.timestamp)}
              </span>
              <button
                onClick={() => setPreviewEntry(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              fontFamily: 'Georgia, serif',
              fontSize: '0.9rem',
              lineHeight: 1.8,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
            }}>
              {previewEntry.content || 'No content'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

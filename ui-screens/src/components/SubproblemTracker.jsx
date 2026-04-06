import { useState, useEffect, useMemo } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { X } from 'lucide-react';

const THREAD_STATES = {
  opens: { label: 'Opens', color: '#3b82f6', bg: '#3b82f622' },
  active: { label: 'Active', color: '#f97316', bg: '#f9731622' },
  hinted: { label: 'Hinted', color: '#8b5cf6', bg: '#8b5cf622' },
  develops: { label: 'Develops', color: '#fbbf24', bg: '#fbbf2422' },
  escalates: { label: 'Escalates', color: '#ef4444', bg: '#ef444422' },
  resolves: { label: 'Resolves', color: '#4ade80', bg: '#4ade8022' },
  closed: { label: 'Closed', color: '#6b7280', bg: '#6b728022' },
};

export default function SubproblemTracker() {
  const files = useProjectStore(s => s.files);
  const updateFile = useProjectStore(s => s.updateFile);
  const [threads, setThreads] = useState([]);
  const [newThreadName, setNewThreadName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Extract chapter count
  const chapters = useMemo(() => {
    return Object.keys(files || {})
      .filter(f => f.match(/^story\/chapter-\d+\.md$/))
      .map(f => parseInt(f.match(/chapter-(\d+)/)?.[1]))
      .sort((a, b) => a - b);
  }, [files]);

  const maxChapter = Math.max(chapters.length, 1);

  // Parse threads from story/threads.md or outline
  useEffect(() => {
    const threadsContent = files?.['story/threads.md'];
    if (threadsContent) {
      try {
        // Parse markdown table or structured content
        const parsed = parseThreadsFile(threadsContent, maxChapter);
        if (parsed.length > 0) setThreads(parsed);
      } catch (e) { console.warn('[SubproblemTracker] Failed to parse threads:', e.message); }
    }

    if (!threadsContent && threads.length === 0) {
      // Try to extract from outline
      const outline = files?.['story/outline.md'] || '';
      const extracted = extractThreadsFromOutline(outline, maxChapter);
      if (extracted.length > 0) setThreads(extracted);
    }
  }, [files?.['story/threads.md'], files?.['story/outline.md']]);

  const addThread = () => {
    if (!newThreadName.trim()) return;
    const states = {};
    for (let i = 1; i <= maxChapter; i++) states[i] = null;
    setThreads(prev => [...prev, { id: Date.now().toString(), name: newThreadName.trim(), states }]);
    setNewThreadName('');
    setHasChanges(true);
  };

  const setThreadState = (threadId, chapter, state) => {
    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, states: { ...t.states, [chapter]: state } } : t
    ));
    setHasChanges(true);
  };

  const removeThread = (threadId) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    setHasChanges(true);
  };

  const save = async () => {
    const content = generateThreadsMarkdown(threads, maxChapter);
    await updateFile('story/threads.md', content);
    setHasChanges(false);
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Narrative Threads</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasChanges && (
            <button onClick={save} style={{
              padding: '4px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)', border: 'none', color: '#000',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            }}>Save</button>
          )}
        </div>
      </div>

      {/* Thread legend */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(THREAD_STATES).map(([key, def]) => (
          <span key={key} style={{
            padding: '2px 8px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 500,
            background: def.bg, color: def.color, border: `1px solid ${def.color}33`,
          }}>{def.label}</span>
        ))}
      </div>

      {/* Multi-lane grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', minWidth: 140 }}>Thread</th>
              {Array.from({ length: maxChapter }, (_, i) => (
                <th key={i + 1} style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', minWidth: 60 }}>
                  Ch {i + 1}
                </th>
              ))}
              <th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {threads.map(thread => (
              <tr key={thread.id}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                  {thread.name}
                </td>
                {Array.from({ length: maxChapter }, (_, i) => {
                  const ch = i + 1;
                  const state = thread.states[ch];
                  const stateDef = state ? THREAD_STATES[state] : null;
                  return (
                    <td key={ch} style={{ padding: '4px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={state || ''}
                        onChange={e => setThreadState(thread.id, ch, e.target.value || null)}
                        style={{
                          width: '100%', padding: '3px 2px', fontSize: '0.65rem',
                          background: stateDef ? stateDef.bg : 'var(--bg-tertiary)',
                          color: stateDef ? stateDef.color : 'var(--text-muted)',
                          border: `1px solid ${stateDef ? stateDef.color + '44' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        }}
                      >
                        <option value="">—</option>
                        {Object.entries(THREAD_STATES).map(([key, def]) => (
                          <option key={key} value={key}>{def.label}</option>
                        ))}
                      </select>
                    </td>
                  );
                })}
                <td style={{ padding: '4px' }}>
                  <button onClick={() => removeThread(thread.id)} style={{
                    background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem',
                  }}>
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add thread */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={newThreadName}
          onChange={e => setNewThreadName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addThread()}
          placeholder="New thread name..."
          style={{
            flex: 1, padding: '6px 10px', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)', fontSize: '0.8rem',
          }}
        />
        <button onClick={addThread} disabled={!newThreadName.trim()} style={{
          padding: '6px 14px', borderRadius: 'var(--radius-sm)',
          background: newThreadName.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
          color: newThreadName.trim() ? '#000' : 'var(--text-muted)',
          border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
        }}>+ Add</button>
      </div>

      {threads.length === 0 && (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Add narrative threads to track how story elements develop across chapters.
        </div>
      )}
    </div>
  );
}

// Helper functions
function parseThreadsFile(content, maxCh) {
  const threads = [];
  const lines = content.split('\n').filter(l => l.startsWith('|') && !l.startsWith('|---'));
  if (lines.length < 2) return [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('|').filter(Boolean).map(c => c.trim());
    if (cells.length < 2) continue;
    const name = cells[0];
    const states = {};
    for (let ch = 1; ch <= maxCh; ch++) {
      const val = cells[ch]?.toLowerCase().trim();
      if (val && THREAD_STATES[val]) states[ch] = val;
      else states[ch] = null;
    }
    threads.push({ id: `parsed-${i}`, name, states });
  }
  return threads;
}

function extractThreadsFromOutline(outline, maxCh) {
  const threads = [];
  // Look for thread/subplot mentions
  const threadPatterns = outline.match(/(?:subplot|thread|arc):\s*(.+)/gi) || [];
  for (const match of threadPatterns) {
    const name = match.replace(/(?:subplot|thread|arc):\s*/i, '').trim();
    if (name && !threads.find(t => t.name === name)) {
      const states = {};
      for (let ch = 1; ch <= maxCh; ch++) states[ch] = null;
      threads.push({ id: `extracted-${threads.length}`, name, states });
    }
  }
  return threads;
}

function generateThreadsMarkdown(threads, maxCh) {
  if (!threads.length) return '# Narrative Threads\n\nNo threads tracked yet.\n';

  const headers = ['Thread', ...Array.from({ length: maxCh }, (_, i) => `Ch ${i + 1}`)];
  const separator = headers.map(() => '---');
  const rows = threads.map(t => [
    t.name,
    ...Array.from({ length: maxCh }, (_, i) => {
      const state = t.states[i + 1];
      return state ? THREAD_STATES[state]?.label || '—' : '—';
    }),
  ]);

  return [
    '# Narrative Threads\n',
    `| ${headers.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...rows.map(r => `| ${r.join(' | ')} |`),
    '',
  ].join('\n');
}

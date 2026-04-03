/**
 * Serendipity Engine — Search Panel
 *
 * Full-text search across project files with context snippets,
 * category filtering, and result navigation.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, FileText, Filter, ChevronDown, ArrowRight, Replace } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { searchFiles, getSearchSuggestions, searchAndReplace } from '../services/projectSearch';

const CATEGORIES = ['All', 'Story', 'Character', 'World', 'Author', 'Narrator', 'Outline', 'Relationships', 'Other'];

export default function SearchPanel({ onOpenFile, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showReplace, setShowReplace] = useState(false);
  const [replaceQuery, setReplaceQuery] = useState('');
  const [replacePreview, setReplacePreview] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult] = useState(0);
  const inputRef = useRef(null);
  const files = useProjectStore(s => s.files);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const opts = {
        fileFilter: selectedCategory !== 'All' ? selectedCategory : null,
      };
      const res = searchFiles(files, query, opts);
      setResults(res);
      setSelectedResult(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, files, selectedCategory]);

  // Suggestions
  useEffect(() => {
    if (query.length >= 2 && results.length === 0) {
      const sugg = getSearchSuggestions(files, query);
      setSuggestions(sugg);
    } else {
      setSuggestions([]);
    }
  }, [query, results.length, files]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResult(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResult(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedResult]) {
      e.preventDefault();
      if (onOpenFile) onOpenFile(results[selectedResult].path);
    } else if (e.key === 'Escape') {
      if (onClose) onClose();
    }
  }, [results, selectedResult, onOpenFile, onClose]);

  // Replace preview
  const handleReplacePreview = useCallback(() => {
    if (!query || !replaceQuery) return;
    const changes = searchAndReplace(files, query, replaceQuery);
    setReplacePreview(changes);
  }, [files, query, replaceQuery]);

  // Apply replacements
  const handleApplyReplace = useCallback(async () => {
    if (!replacePreview || replacePreview.length === 0) return;
    const { updateFile } = useProjectStore.getState();
    for (const change of replacePreview) {
      await updateFile(change.path, change.newContent);
    }
    setReplacePreview(null);
    // Re-run search to update results
    if (query) {
      const newResults = searchFiles(useProjectStore.getState().files, query, { category: selectedCategory === 'All' ? null : selectedCategory });
      setResults(newResults);
    }
  }, [replacePreview, query, selectedCategory]);

  const totalMatches = useMemo(() => {
    return results.reduce((sum, r) => sum + r.matchCount, 0);
  }, [results]);

  // Highlight matching text in snippet
  const highlightSnippet = (snippet) => {
    if (!query) return snippet.text;

    const parts = [];
    const regex = new RegExp(`(${query.split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(snippet.text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(<span key={`t-${lastIdx}`}>{snippet.text.slice(lastIdx, match.index)}</span>);
      }
      parts.push(
        <span key={`m-${match.index}`} style={{
          background: 'rgba(var(--accent-rgb, 245,158,11), 0.3)',
          color: 'var(--accent)',
          fontWeight: 600,
          borderRadius: 2,
          padding: '0 1px',
        }}>
          {match[0]}
        </span>
      );
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < snippet.text.length) {
      parts.push(<span key={`t-${lastIdx}`}>{snippet.text.slice(lastIdx)}</span>);
    }
    return parts;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-secondary)',
    }}>
      {/* Search input */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Search across all files..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Replace input (toggle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <button
            onClick={() => setShowReplace(!showReplace)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              fontSize: '0.65rem',
              background: showReplace ? 'var(--accent-glow)' : 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: showReplace ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <Replace size={10} /> Replace
          </button>
        </div>

        {showReplace && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 6,
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
          }}>
            <ArrowRight size={14} color="var(--text-muted)" />
            <input
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace with..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
            <button
              onClick={handleReplacePreview}
              style={{
                padding: '2px 8px',
                fontSize: '0.7rem',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Preview
            </button>
          </div>
        )}
      </div>

      {/* Category filter */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '8px 16px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border)',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '2px 8px',
              fontSize: '0.65rem',
              borderRadius: 100,
              border: '1px solid var(--border)',
              background: selectedCategory === cat ? 'var(--accent-glow)' : 'transparent',
              color: selectedCategory === cat ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results summary */}
      {query.length >= 2 && (
        <div style={{
          padding: '6px 16px',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border)',
        }}>
          {results.length > 0
            ? `${totalMatches} matches across ${results.length} files`
            : 'No results found'
          }
        </div>
      )}

      {/* Results list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && results.length === 0 && (
          <div style={{ padding: '8px 16px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              Did you mean:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {suggestions.map(s => (
                <button
                  key={s.word}
                  onClick={() => { setQuery(s.word); setShowSuggestions(false); }}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                  }}
                >
                  {s.word} <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>({s.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {results.map((result, idx) => (
          <div
            key={result.path}
            onClick={() => { if (onOpenFile) onOpenFile(result.path); }}
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              background: selectedResult === idx ? 'var(--accent-glow)' : 'transparent',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover, var(--bg-tertiary))'; setSelectedResult(idx); }}
            onMouseLeave={(e) => { e.currentTarget.style.background = selectedResult === idx ? 'var(--accent-glow)' : 'transparent'; }}
          >
            {/* File header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <FileText size={12} color="var(--accent)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {result.title}
              </span>
              <span style={{
                fontSize: '0.6rem',
                padding: '1px 6px',
                borderRadius: 100,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
              }}>
                {result.category}
              </span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* File path */}
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              {result.path}
            </div>

            {/* Context snippets */}
            {result.snippets.map((snippet, si) => (
              <div
                key={si}
                style={{
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                  color: 'var(--text-secondary)',
                  padding: '4px 8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: si < result.snippets.length - 1 ? 4 : 0,
                  borderLeft: '2px solid var(--accent)',
                }}
              >
                {snippet.lineNumber && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginRight: 6 }}>
                    L{snippet.lineNumber}
                  </span>
                )}
                {highlightSnippet(snippet)}
              </div>
            ))}
          </div>
        ))}

        {/* Replace preview */}
        {replacePreview && replacePreview.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '2px solid var(--accent)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>
              Replace Preview — {replacePreview.reduce((s, c) => s + c.replacementCount, 0)} replacements in {replacePreview.length} files
            </div>
            {replacePreview.map((change, i) => (
              <div key={i} style={{
                padding: '6px 8px',
                marginBottom: 4,
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
              }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{change.path}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                  {change.replacementCount} replacement{change.replacementCount !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
            <button
              onClick={handleApplyReplace}
              style={{
                marginTop: 8,
                padding: '6px 16px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Apply All Replacements
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Serendipity | StoryWeaver — Series Order Manager
 *
 * Modal component for managing the chronological order of projects in a series.
 * Allows users to reorder books, assign story roles (mainline, prequel, etc.),
 * and ensure continuity across the series timeline.
 */

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import db from '../lib/db';

const ROLE_COLORS = {
  mainline: '#60a5fa',    // blue
  prequel: '#a78bfa',     // purple
  sequel: '#34d399',      // green
  spinoff: '#f472b6',     // pink
  companion: '#fbbf24',   // amber
  interlude: '#94a3b8',   // slate
};

const ROLE_OPTIONS = [
  'mainline',
  'prequel',
  'sequel',
  'spinoff',
  'companion',
  'interlude',
];

export default function SeriesOrderManager({ seriesName, onClose }) {
  const updateSeriesOrder = useProjectStore(s => s.updateSeriesOrder);
  const projects = useProjectStore(s => s.projects);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load all projects in the series
  useEffect(() => {
    (async () => {
      try {
        const seriesProjects = await db.projects
          .filter(p => p.series === seriesName)
          .toArray();

        // Sort by seriesOrder (nulls last)
        seriesProjects.sort((a, b) => (a.seriesOrder || 999) - (b.seriesOrder || 999));

        setItems(
          seriesProjects.map(p => ({
            id: p.id,
            title: p.title,
            genre: p.genre || 'unset',
            medium: p.medium || 'unset',
            wordCount: p.wordCount || 0,
            currentPhase: p.currentPhase || 1,
            seriesRole: p.seriesRole || 'mainline',
          }))
        );
        setLoading(false);
      } catch (err) {
        console.error('Failed to load series projects:', err);
        setLoading(false);
      }
    })();
  }, [seriesName]);

  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
  };

  const updateRole = (index, role) => {
    const updated = [...items];
    updated[index].seriesRole = role;
    setItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const orderedEntries = items.map((item, i) => ({
        projectId: item.id,
        order: i + 1,
        role: item.seriesRole,
      }));

      await updateSeriesOrder(seriesName, orderedEntries);
      setSaveSuccess(true);

      // Show success message for 2 seconds then close
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to save series order:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: 40,
          maxWidth: 700,
          textAlign: 'center',
        }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading series...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 28,
        maxWidth: 700,
        width: '90%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              📚 {seriesName} — Series Order
            </h2>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              margin: '8px 0 0 0',
            }}>
              Arrange your projects in chronological story order. This helps the AI understand where each book falls in the timeline.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
              flexShrink: 0,
              marginLeft: 16,
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: 20,
          paddingRight: 8,
        }}>
          {items.map((item, idx) => (
            <div key={item.id} style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              marginBottom: 12,
              border: '1px solid var(--border)',
              transition: 'var(--transition)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 12,
              }}>
                {/* Drag handle */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  userSelect: 'none',
                  minWidth: 20,
                  paddingTop: 2,
                }}>
                  <span>⋮</span>
                  <span>⋮</span>
                </div>

                {/* Position number */}
                <div style={{
                  background: 'var(--accent)',
                  color: 'white',
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}>
                  {idx + 1}
                </div>

                {/* Title and metadata */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    margin: 0,
                    marginBottom: 6,
                    wordBreak: 'break-word',
                  }}>
                    {item.title}
                  </h3>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}>
                    <span>{item.genre}</span>
                    <span>•</span>
                    <span>{item.medium}</span>
                    <span>•</span>
                    <span>{item.wordCount.toLocaleString()} words</span>
                  </div>
                </div>
              </div>

              {/* Role selector and up/down buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                {/* Role dropdown */}
                <select
                  value={item.seriesRole}
                  onChange={(e) => updateRole(idx, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    background: 'var(--bg-tertiary)',
                    border: `1px solid ${ROLE_COLORS[item.seriesRole] || 'var(--border)'}`,
                    borderRadius: 4,
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'var(--transition)',
                  }}
                >
                  {ROLE_OPTIONS.map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Role badge */}
                <div style={{
                  background: ROLE_COLORS[item.seriesRole],
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: 12,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                }}>
                  {item.seriesRole}
                </div>

                {/* Up/Down buttons */}
                <button
                  onClick={() => moveItem(idx, idx - 1)}
                  disabled={idx === 0}
                  style={{
                    background: idx === 0 ? 'transparent' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    color: idx === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                    cursor: idx === 0 ? 'default' : 'pointer',
                    padding: '6px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)',
                    opacity: idx === 0 ? 0.4 : 1,
                  }}
                  title="Move up"
                >
                  <ChevronUp size={16} />
                </button>

                <button
                  onClick={() => moveItem(idx, idx + 1)}
                  disabled={idx === items.length - 1}
                  style={{
                    background: idx === items.length - 1 ? 'transparent' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    color: idx === items.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                    cursor: idx === items.length - 1 ? 'default' : 'pointer',
                    padding: '6px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)',
                    opacity: idx === items.length - 1 ? 0.4 : 1,
                  }}
                  title="Move down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div style={{
          display: 'flex',
          gap: 8,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
        }}>
          {saveSuccess && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}>
              ✓ Series order saved successfully
            </div>
          )}

          {!saveSuccess && (
            <>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'var(--accent)',
                  border: '1px solid var(--accent)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'var(--transition)',
                  opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.background = 'var(--accent-dark)';
                }}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
              >
                {saving ? 'Saving...' : 'Save Series Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

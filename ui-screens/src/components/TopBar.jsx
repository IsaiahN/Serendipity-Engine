import { useState } from 'react';
import { Settings, Search, Keyboard, Palette, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import HealthBar, { getHealthLevel } from './HealthBar';

export default function TopBar({ projectName, healthRating, showHealth = true, onHealthClick, onSettingsClick, onThemeClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/workspace');
  const [showTooltip, setShowTooltip] = useState(false);

  return (
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

      {/* Project Name (if in workspace) */}
      {isWorkspace && projectName && (
        <>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{projectName}</span>
        </>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Story Structure Score (if in workspace) — clickable */}
      {isWorkspace && showHealth && (
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
      <button onClick={() => {}} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Command Palette (Ctrl+K)">
        <Search size={16} />
      </button>
      <button onClick={() => {}} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Keyboard Shortcuts">
        <Keyboard size={16} />
      </button>
      <button onClick={onThemeClick || (() => {})} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Theme">
        <Palette size={16} />
      </button>
      <button onClick={onSettingsClick || (() => navigate('/settings'))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }} title="Settings (Ctrl+,)">
        <Settings size={16} />
      </button>
    </div>
  );
}

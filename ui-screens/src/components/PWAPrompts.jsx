/**
 * Serendipity Engine — PWA UI Components
 *
 * - InstallBanner: prompts user to install the app
 * - OfflineIndicator: shows when offline
 * - UpdateNotification: shows when a new version is available
 */

import { useState, useEffect } from 'react';
import { useInstallPrompt, useOnlineStatus, useServiceWorker } from '../hooks/usePWA';
import { Download, WifiOff, RefreshCw, X } from 'lucide-react';

// ─── Install Banner ─────────────────────────────────────────────────────────

export function InstallBanner() {
  const { canPrompt, isStandalone, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already installed, dismissed, or can't install
  if (isStandalone || dismissed || !canPrompt) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--bg-secondary, #1a1d26)', border: '1px solid var(--accent, #f0a050)',
      borderRadius: 12, padding: '12px 20px', maxWidth: 440,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.3s ease',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'var(--accent-glow, rgba(240,160,80,0.1))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Download size={20} style={{ color: 'var(--accent, #f0a050)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary, #e8e0d4)', marginBottom: 2 }}>
          Install Serendipity | StoryWeaver
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #7a7568)' }}>
          Works offline. Faster loads. Your own app.
        </div>
      </div>
      <button
        onClick={async () => {
          const accepted = await install();
          if (!accepted) setDismissed(true);
        }}
        style={{
          padding: '6px 16px', fontSize: '0.78rem', fontWeight: 600,
          background: 'var(--accent, #f0a050)', color: '#000',
          border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none', border: 'none', padding: 4,
          color: 'var(--text-muted, #7a7568)', cursor: 'pointer',
        }}
      >
        <X size={16} />
      </button>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Offline Indicator ──────────────────────────────────────────────────────

export function OfflineIndicator() {
  const online = useOnlineStatus();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!online) {
      setShow(true);
    } else {
      // Show "Back online" briefly then hide
      if (show) {
        const timer = setTimeout(() => setShow(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [online]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show && online) return null;

  return (
    <div style={{
      position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8,
      background: online ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
      border: `1px solid ${online ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
      borderRadius: 8, padding: '6px 16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      animation: 'fadeIn 0.3s ease',
      fontSize: '0.8rem', fontWeight: 500,
      color: online ? '#4ade80' : '#f87171',
    }}>
      {online ? (
        <>
          <RefreshCw size={14} /> Back online
        </>
      ) : (
        <>
          <WifiOff size={14} /> Offline mode. Your work is saved locally.
        </>
      )}
    </div>
  );
}

// ─── Update Notification ────────────────────────────────────────────────────

export function UpdateNotification() {
  const { updateAvailable, applyUpdate } = useServiceWorker();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-secondary, #1a1d26)', border: '1px solid var(--border, #2a2d36)',
      borderRadius: 10, padding: '10px 16px', maxWidth: 340,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.3s ease',
    }}>
      <RefreshCw size={18} style={{ color: 'var(--accent, #f0a050)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary, #e8e0d4)', marginBottom: 2 }}>
          Update available
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #7a7568)' }}>
          Refresh to get the latest version.
        </div>
      </div>
      <button
        onClick={applyUpdate}
        style={{
          padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600,
          background: 'var(--accent, #f0a050)', color: '#000',
          border: 'none', borderRadius: 6, cursor: 'pointer',
        }}
      >
        Refresh
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none', border: 'none', padding: 2,
          color: 'var(--text-muted, #7a7568)', cursor: 'pointer',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

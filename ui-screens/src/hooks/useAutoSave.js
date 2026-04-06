/**
 * Serendipity | StoryWeaver — Auto-Save Hook
 *
 * Automatically persists content at configurable intervals.
 * Used for file editing, drawing board, and chat history.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export function useAutoSave(saveFn, deps = [], options = {}) {
  const interval = useSettingsStore(s => s.autoSaveInterval);
  const enabled = interval > 0 && !options.disabled;
  const timerRef = useRef(null);
  const dirtyRef = useRef(false);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(() => {
      if (dirtyRef.current) {
        saveFn();
        dirtyRef.current = false;
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, interval, saveFn, ...deps]);

  return { markDirty };
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcut(key, callback, options = {}) {
  const { ctrl = false, shift = false, alt = false } = options;

  useEffect(() => {
    const handler = (e) => {
      const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : true;
      const shiftMatch = shift ? e.shiftKey : true;
      const altMatch = alt ? e.altKey : true;

      if (e.key === key && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, ctrl, shift, alt]);
}

/**
 * Hook for toast notifications
 */
export function useToast() {
  const toastRef = useRef(null);

  const showToast = useCallback((message, duration = 2500) => {
    // Create or update toast element
    if (!toastRef.current) {
      toastRef.current = document.createElement('div');
      toastRef.current.style.cssText = `
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        padding: 10px 20px; border-radius: 8px;
        background: var(--bg-tertiary); color: var(--text-primary);
        border: 1px solid var(--border); font-size: 0.85rem;
        z-index: 10000; opacity: 0; transition: opacity 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(toastRef.current);
    }

    toastRef.current.textContent = message;
    toastRef.current.style.opacity = '1';

    setTimeout(() => {
      if (toastRef.current) toastRef.current.style.opacity = '0';
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (toastRef.current) {
        document.body.removeChild(toastRef.current);
        toastRef.current = null;
      }
    };
  }, []);

  return showToast;
}

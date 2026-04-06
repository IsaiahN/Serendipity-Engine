/**
 * Serendipity | StoryWeaver — Undo/Redo Hook
 *
 * Generic undo/redo stack with debounced history tracking.
 * Use for file editing, phase answers, or any reversible state.
 */
import { useState, useRef, useCallback } from 'react';

export function useUndoRedo(initialState, options = {}) {
  const { maxHistory = 50, debounceMs = 500 } = options;

  const [state, setStateInternal] = useState(initialState);
  const historyRef = useRef([initialState]);
  const indexRef = useRef(0);
  const debounceTimer = useRef(null);
  const batchRef = useRef(false);

  // Force re-render when history changes
  const [, forceUpdate] = useState(0);

  const pushToHistory = useCallback((newState) => {
    // Truncate any redo states
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(newState);

    // Trim if exceeds max
    if (historyRef.current.length > maxHistory) {
      historyRef.current = historyRef.current.slice(historyRef.current.length - maxHistory);
    }

    indexRef.current = historyRef.current.length - 1;
    forceUpdate(n => n + 1);
  }, [maxHistory]);

  const setState = useCallback((newStateOrFn) => {
    setStateInternal(prev => {
      const newState = typeof newStateOrFn === 'function' ? newStateOrFn(prev) : newStateOrFn;

      if (batchRef.current) {
        // In batch mode, just update state without pushing to history
        // The batch end will push the final state
        return newState;
      }

      // Debounce history pushes for rapid changes (typing)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        pushToHistory(newState);
        debounceTimer.current = null;
      }, debounceMs);

      return newState;
    });
  }, [debounceMs, pushToHistory]);

  // Immediately push current state to history (for explicit save points)
  const checkpoint = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    pushToHistory(state);
  }, [state, pushToHistory]);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      // Flush any pending debounced push first
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
        pushToHistory(state);
      }
      indexRef.current--;
      const prevState = historyRef.current[indexRef.current];
      setStateInternal(prevState);
      forceUpdate(n => n + 1);
      return prevState;
    }
    return state;
  }, [state, pushToHistory]);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      const nextState = historyRef.current[indexRef.current];
      setStateInternal(nextState);
      forceUpdate(n => n + 1);
      return nextState;
    }
    return state;
  }, [state]);

  // Batch operations — groups multiple setState calls into one undo step
  const batch = useCallback((fn) => {
    batchRef.current = true;
    fn();
    batchRef.current = false;
    // Push the final state after batch completes
    setStateInternal(current => {
      pushToHistory(current);
      return current;
    });
  }, [pushToHistory]);

  const clear = useCallback(() => {
    historyRef.current = [state];
    indexRef.current = 0;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    forceUpdate(n => n + 1);
  }, [state]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1,
    history: historyRef.current,
    historyIndex: indexRef.current,
    checkpoint,
    batch,
    clear,
  };
}

/**
 * Keyboard shortcut integration for undo/redo.
 * Call this in a useEffect to wire Ctrl+Z / Ctrl+Shift+Z.
 */
export function useUndoRedoKeys(undoRedoHook) {
  const { undo, redo, canUndo, canRedo } = undoRedoHook;

  const handler = useCallback((e) => {
    const isMod = e.ctrlKey || e.metaKey;
    if (!isMod) return;

    if (e.key === 'z' && !e.shiftKey && canUndo) {
      e.preventDefault();
      undo();
    } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
      if (canRedo) {
        e.preventDefault();
        redo();
      }
    }
  }, [undo, redo, canUndo, canRedo]);

  return handler;
}

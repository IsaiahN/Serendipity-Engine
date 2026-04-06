/**
 * Serendipity | StoryWeaver — PWA Hooks
 *
 * React hooks for service worker status, install prompts,
 * online/offline detection, and update notifications.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  registerServiceWorker,
  applyUpdate,
  canInstall,
  isInstalled,
  promptInstall,
  isOnline as checkOnline,
  onConnectivityChange,
  onSWEvent,
  processPendingSync,
  getStorageEstimate,
  requestPersistentStorage,
} from '../lib/serviceWorker';

/**
 * Hook: online/offline status
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(checkOnline());

  useEffect(() => {
    const unsub = onConnectivityChange(setOnline);
    return unsub;
  }, []);

  return online;
}

/**
 * Hook: service worker lifecycle
 * Returns: { ready, updateAvailable, applyUpdate }
 */
export function useServiceWorker() {
  const [ready, setReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    registerServiceWorker().then(reg => {
      if (reg) setReady(true);
    });

    const unsub = onSWEvent((event) => {
      if (event === 'update-available') {
        setUpdateAvailable(true);
      }
    });

    return unsub;
  }, []);

  return {
    ready,
    updateAvailable,
    applyUpdate,
  };
}

/**
 * Hook: install-to-home-screen prompt
 * Returns: { canPrompt, isStandalone, install }
 */
export function useInstallPrompt() {
  const [canPrompt, setCanPrompt] = useState(canInstall());
  const [isStandalone, setIsStandalone] = useState(isInstalled());

  useEffect(() => {
    const unsub = onSWEvent((event) => {
      if (event === 'install-available') {
        setCanPrompt(true);
      }
      if (event === 'installed') {
        setCanPrompt(false);
        setIsStandalone(true);
      }
    });

    return unsub;
  }, []);

  const install = useCallback(async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setCanPrompt(false);
      setIsStandalone(true);
    }
    return accepted;
  }, []);

  return { canPrompt, isStandalone, install };
}

/**
 * Hook: background sync processor
 * Runs pending syncs when coming back online
 */
export function useBackgroundSync(onSyncItem) {
  const online = useOnlineStatus();
  const callbackRef = useRef(onSyncItem);
  callbackRef.current = onSyncItem;

  useEffect(() => {
    if (!online) return;

    // Process any pending items when we come back online
    processPendingSync().then(items => {
      for (const item of items) {
        callbackRef.current?.(item);
      }
    });
  }, [online]);
}

/**
 * Hook: storage usage
 * Returns: { usage, quota, percentUsed, isPersistent, requestPersistence }
 */
export function useStorageInfo() {
  const [info, setInfo] = useState({ usage: 0, quota: 0, percentUsed: 0 });
  const [isPersistent, setIsPersistent] = useState(false);

  useEffect(() => {
    getStorageEstimate().then(setInfo);

    // Check persistence
    if (navigator.storage?.persisted) {
      navigator.storage.persisted().then(setIsPersistent);
    }
  }, []);

  const requestPersistence = useCallback(async () => {
    const granted = await requestPersistentStorage();
    setIsPersistent(granted);
    return granted;
  }, []);

  return { ...info, isPersistent, requestPersistence };
}

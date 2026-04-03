/**
 * Serendipity Engine — Service Worker Registration & PWA Utilities
 *
 * Handles:
 * - SW registration and lifecycle (install, update, activate)
 * - Install-to-home-screen (A2HS) prompt management
 * - Online/offline detection
 * - Background sync queue for failed writes
 * - Update notifications
 */

// ─── State ──────────────────────────────────────────────────────────────────

let swRegistration = null;
let deferredInstallPrompt = null;
const listeners = new Set();

// ─── Event Bus ──────────────────────────────────────────────────────────────

function emit(event, data) {
  listeners.forEach(fn => fn(event, data));
}

export function onSWEvent(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// ─── Registration ───────────────────────────────────────────────────────────

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return null;
  }

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Registered:', swRegistration.scope);

    // Listen for updates
    swRegistration.addEventListener('updatefound', () => {
      const newWorker = swRegistration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          emit('update-available', { registration: swRegistration });
        }
      });
    });

    // Listen for messages from SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_RETRY') {
        emit('sync-retry', event.data.payload);
      }
    });

    // Check for existing waiting worker (update already downloaded)
    if (swRegistration.waiting) {
      emit('update-available', { registration: swRegistration });
    }

    return swRegistration;
  } catch (err) {
    console.error('[SW] Registration failed:', err);
    return null;
  }
}

/**
 * Apply a pending SW update (forces reload)
 */
export function applyUpdate() {
  if (swRegistration?.waiting) {
    swRegistration.waiting.postMessage('SKIP_WAITING');
    window.location.reload();
  }
}

/**
 * Cache additional URLs dynamically (e.g., after discovering lazy chunks)
 */
export function cacheUrls(urls) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls,
    });
  }
}

// ─── Install Prompt (A2HS) ──────────────────────────────────────────────────

// Capture the beforeinstallprompt event
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    emit('install-available', {});
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    emit('installed', {});
  });
}

/**
 * Check if the install prompt is available
 */
export function canInstall() {
  return deferredInstallPrompt !== null;
}

/**
 * Check if the app is already installed (standalone mode)
 */
export function isInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Show the install prompt
 * @returns {Promise<boolean>} true if user accepted
 */
export async function promptInstall() {
  if (!deferredInstallPrompt) return false;

  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;

  return outcome === 'accepted';
}

// ─── Online / Offline Detection ─────────────────────────────────────────────

export function isOnline() {
  return navigator.onLine;
}

/**
 * Subscribe to online/offline changes
 * @param {Function} callback - (isOnline: boolean) => void
 * @returns {Function} unsubscribe
 */
export function onConnectivityChange(callback) {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// ─── Background Sync Queue ──────────────────────────────────────────────────

const SYNC_DB_NAME = 'serendipity-sync-queue';
const SYNC_DB_VERSION = 1;

function openSyncDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_DB_NAME, SYNC_DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Queue a write operation for background sync
 * Used when a save fails (e.g., offline, quota exceeded)
 */
export async function queueSync(operation) {
  try {
    const db = await openSyncDb();
    const tx = db.transaction('pending', 'readwrite');
    tx.objectStore('pending').add({
      ...operation,
      timestamp: Date.now(),
    });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });

    // Request background sync if available
    if (swRegistration && 'sync' in swRegistration) {
      await swRegistration.sync.register('sync-project-files');
    }
  } catch (err) {
    console.warn('[Sync] Failed to queue operation:', err);
  }
}

/**
 * Process any pending sync items (called on reconnect)
 */
export async function processPendingSync() {
  try {
    const db = await openSyncDb();
    const tx = db.transaction('pending', 'readwrite');
    const store = tx.objectStore('pending');
    const items = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (items.length === 0) return [];

    // Return items for processing by the app
    // Clear the queue
    const clearTx = db.transaction('pending', 'readwrite');
    clearTx.objectStore('pending').clear();
    await new Promise((resolve, reject) => {
      clearTx.oncomplete = resolve;
      clearTx.onerror = reject;
    });

    return items;
  } catch (err) {
    console.warn('[Sync] Failed to process pending items:', err);
    return [];
  }
}

// ─── Storage Estimate ───────────────────────────────────────────────────────

/**
 * Get storage usage estimate
 * @returns {{ usage: number, quota: number, percentUsed: number }}
 */
export async function getStorageEstimate() {
  if (!navigator.storage?.estimate) {
    return { usage: 0, quota: 0, percentUsed: 0 };
  }

  const { usage, quota } = await navigator.storage.estimate();
  return {
    usage: usage || 0,
    quota: quota || 0,
    percentUsed: quota ? Math.round((usage / quota) * 100) : 0,
  };
}

/**
 * Request persistent storage (prevents browser from evicting data)
 */
export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false;
  return navigator.storage.persist();
}

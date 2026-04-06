/**
 * Serendipity | StoryWeaver — Browser Utilities
 *
 * Stripped-down version for Chrome Extension context.
 * PWA-specific features (SW registration, A2HS, background sync) removed.
 *
 * Retains:
 * - Online/offline detection
 * - Storage estimate
 * - Persistent storage request
 */

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

// ─── Stubs for backward compatibility ───────────────────────────────────────
// These are no-ops so any code that lazily imports them won't crash.

export async function registerServiceWorker() { return null; }
export function applyUpdate() {}
export function cacheUrls() {}
export function canInstall() { return false; }
export function isInstalled() { return false; }
export async function promptInstall() { return false; }
export function onSWEvent() { return () => {}; }
export async function queueSync() {}
export async function processPendingSync() { return []; }

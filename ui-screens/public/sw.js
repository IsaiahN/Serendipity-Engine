/**
 * Serendipity | StoryWeaver — Service Worker
 *
 * Offline-first caching strategy:
 * - App Shell (HTML, CSS, JS): Cache-first, update in background
 * - API calls (LLM): Network-only (cannot cache generative content)
 * - Static assets (icons, fonts): Cache-first, long TTL
 * - IndexedDB: Not managed by SW (Dexie handles persistence directly)
 *
 * Background sync:
 * - Queues failed file saves for retry when online
 */

// Version is passed as ?v= query param at registration time (see serviceWorker.js).
// Bumping package.json version triggers SW update + cache bust automatically.
const swUrl = new URL(self.registration?.active?.scriptURL || self.location.href);
const CACHE_VERSION = `serendipity-${swUrl.searchParams.get('v') || '1.0.0'}`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// App shell files to precache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg',
];

// Domains that should never be cached (LLM API calls)
const NETWORK_ONLY_DOMAINS = [
  'api.anthropic.com',
  'api.openai.com',
  'generativelanguage.googleapis.com',
  'openrouter.ai',
  'localhost:11434', // Ollama
];

// ─── Install ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ───────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('serendipity-') && key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ──────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension, devtools, etc.
  if (!url.protocol.startsWith('http')) return;

  // Network-only for LLM API calls
  if (NETWORK_ONLY_DOMAINS.some(domain => url.host.includes(domain))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigation requests (HTML pages) — network-first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest HTML
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline — serve from cache
          return caches.match(event.request)
            .then(cached => cached || caches.match('/index.html'));
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) — stale-while-revalidate
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request)
            .then(response => {
              if (response.ok) {
                cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch(() => cached);

          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Default: network-first
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ─── Background Sync ────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-project-files') {
    event.waitUntil(syncProjectFiles());
  }
});

async function syncProjectFiles() {
  // Read pending sync items from IndexedDB (if the sync queue exists)
  // In practice, Dexie handles persistence directly, so this is a safety net
  // for any writes that failed due to quota or corruption.
  try {
    const dbs = await indexedDB.databases();
    const hasSyncQueue = dbs.some(db => db.name === 'serendipity-sync-queue');
    if (!hasSyncQueue) return;

    const request = indexedDB.open('serendipity-sync-queue', 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pending')) return;

      const tx = db.transaction('pending', 'readwrite');
      const store = tx.objectStore('pending');
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        const items = getAll.result || [];
        // Process each pending item
        for (const item of items) {
          // Re-attempt the save by posting to the main thread
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_RETRY',
                payload: item,
              });
            });
          });
          store.delete(item.id);
        }
      };
    };
  } catch (err) {
    console.warn('[SW] Background sync failed:', err);
  }
}

// ─── Push Notifications (future use) ────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Serendipity | StoryWeaver', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: data.tag || 'default',
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url);
    })
  );
});

// ─── Message Handling ───────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'CACHE_URLS') {
    // Dynamically cache additional URLs (e.g., after lazy-loaded chunks are discovered)
    const urls = event.data.urls || [];
    caches.open(RUNTIME_CACHE).then(cache =>
      cache.addAll(urls).catch(() => {})
    );
  }
});

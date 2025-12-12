// Service Worker for Next.js App
const CACHE_NAME = 'delphi-nextjs-v1';
const RUNTIME_CACHE = 'delphi-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
            );
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim(); // Take control of all pages
});

// SOS Monitoring
let sosCheckInterval = null;
const SOS_CHECK_INTERVAL = 30000; // 30 seconds

// Start SOS monitoring
function startSOSMonitoring() {
  if (sosCheckInterval) {
    return; // Already monitoring
  }

  console.log('[Service Worker] Starting SOS monitoring');
  sosCheckInterval = setInterval(() => {
    checkSOSActivity();
  }, SOS_CHECK_INTERVAL);
}

// Stop SOS monitoring
function stopSOSMonitoring() {
  if (sosCheckInterval) {
    clearInterval(sosCheckInterval);
    sosCheckInterval = null;
    console.log('[Service Worker] Stopped SOS monitoring');
  }
}

// Check SOS activity
async function checkSOSActivity() {
  try {
    const response = await fetch('/api/sos/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ check: true }),
    });

    if (!response.ok) {
      console.error('[Service Worker] SOS check failed');
    }
  } catch (error) {
    console.error('[Service Worker] SOS check error:', error);
  }
}

// Listen for messages from the page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_SOS') {
    startSOSMonitoring();
  } else if (event.data && event.data.type === 'STOP_SOS') {
    stopSOSMonitoring();
  }
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page or fallback if available
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
    })
  );
});


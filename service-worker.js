const CACHE_NAME = 'vespatimer-v1.4-' + Date.now();
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v1.4...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating v1.4...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[Service Worker] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip browser extension requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache the fresh response
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline - try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigating and offline, return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline - Please connect to internet', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    console.log('[Service Worker] Skip waiting message received');
    self.skipWaiting();
  }
});

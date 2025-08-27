/**
 * Service Worker for Crypto Guide Website
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'crypto-guide-cache-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/css/layout.css',
  '/assets/css/components.css',
  '/assets/css/header.css',
  '/assets/css/sidebar.css',
  '/assets/js/navigation.js',
  '/assets/js/language-switcher.js',
  '/assets/js/utils.js'
];

// Resources to cache on first request
const RUNTIME_CACHE_RESOURCES = [
  '/development-roadmap/',
  '/node-guides/',
  '/search.html',
  '/user-progress.html'
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  pages: 'networkFirst',
  assets: 'cacheFirst',
  api: 'networkFirst',
  images: 'cacheFirst'
};

/**
 * Install event - precache essential resources
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Precaching resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Error during precaching:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - handle network requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Determine cache strategy based on resource type
  const strategy = getCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

/**
 * Determine cache strategy for request
 */
function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // API requests
  if (pathname.startsWith('/api/') || pathname.includes('.json')) {
    return CACHE_STRATEGIES.api;
  }
  
  // Images
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return CACHE_STRATEGIES.images;
  }
  
  // CSS and JS assets
  if (pathname.match(/\.(css|js)$/i)) {
    return CACHE_STRATEGIES.assets;
  }
  
  // HTML pages
  return CACHE_STRATEGIES.pages;
}

/**
 * Handle request with specified strategy
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request);
    case 'networkFirst':
      return networkFirst(request);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);
    default:
      return networkFirst(request);
  }
}

/**
 * Cache First strategy - check cache first, fallback to network
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return getOfflineFallback(request);
  }
}

/**
 * Network First strategy - try network first, fallback to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('Network failed, trying cache:', error.message);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineFallback(request);
  }
}

/**
 * Stale While Revalidate strategy - return cache immediately, update in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('Background fetch failed:', error);
    });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network response if no cache
  try {
    return await networkResponsePromise;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

/**
 * Get offline fallback for failed requests
 */
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // For HTML pages, return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
  }
  
  // For images, return placeholder
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f0f0f0"/><text x="100" y="75" text-anchor="middle" fill="#999">Image unavailable</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
  
  // For other resources, return error response
  return new Response('Resource unavailable offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

/**
 * Background sync event
 */
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Perform background sync operations
 */
async function doBackgroundSync() {
  try {
    // Sync any pending data
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_BACKGROUND',
        timestamp: Date.now()
      });
    });
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Push notification event
 */
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New content available',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/badge-72.png',
    tag: 'crypto-guide-notification',
    renotify: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/assets/images/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/images/dismiss-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Crypto Guide Update', options)
  );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Message event - handle messages from main thread
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(data.urls));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache());
      break;
      
    case 'GET_CACHE_SIZE':
      event.waitUntil(getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      }));
      break;
  }
});

/**
 * Cache specific URLs
 */
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_UPDATED',
        urls: urls
      });
    });
    
    console.log('URLs cached:', urls);
  } catch (error) {
    console.error('Error caching URLs:', error);
  }
}

/**
 * Clear all caches
 */
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('All caches cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get total cache size
 */
async function getCacheSize() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    let totalSize = 0;
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
}

/**
 * Periodic cache cleanup
 */
setInterval(async () => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // Remove old entries (older than 7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const now = Date.now();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (now - responseDate > maxAge) {
            await cache.delete(request);
            console.log('Removed old cache entry:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during cache cleanup:', error);
  }
}, 60 * 60 * 1000); // Run every hour
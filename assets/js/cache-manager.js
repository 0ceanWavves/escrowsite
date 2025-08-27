/**
 * Cache Manager Module
 * Implements content caching and offline functionality using Service Worker and localStorage
 */

class CacheManager {
  constructor() {
    this.cacheName = 'crypto-guide-cache-v1';
    this.offlineStorageKey = 'crypto-guide-offline';
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    this.isOnline = navigator.onLine;
    this.pendingRequests = new Map();
    
    this.init();
  }

  /**
   * Initialize cache manager
   */
  async init() {
    this.setupServiceWorker();
    this.setupOfflineHandling();
    this.setupNetworkMonitoring();
    this.cleanExpiredCache();
    
    console.log('Cache manager initialized');
  }

  /**
   * Setup service worker for caching
   */
  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
        
        // Update service worker when new version available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Setup offline content handling
   */
  setupOfflineHandling() {
    // Cache critical content for offline access
    this.cacheEssentialContent();
    
    // Setup offline page detection
    this.setupOfflinePageDetection();
  }

  /**
   * Setup network monitoring
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOnlineStatus(false);
    });
  }

  /**
   * Handle online/offline status changes
   */
  handleOnlineStatus(isOnline) {
    const statusIndicator = document.getElementById('network-status');
    
    if (isOnline) {
      if (statusIndicator) {
        statusIndicator.textContent = 'Back online';
        statusIndicator.className = 'network-status online';
        setTimeout(() => statusIndicator.style.display = 'none', 3000);
      }
      
      // Sync pending requests
      this.syncPendingRequests();
      
    } else {
      if (statusIndicator) {
        statusIndicator.textContent = 'Offline - Using cached content';
        statusIndicator.className = 'network-status offline';
        statusIndicator.style.display = 'block';
      }
    }
  }

  /**
   * Cache essential content for offline access
   */
  async cacheEssentialContent() {
    const essentialUrls = [
      '/',
      '/index.html',
      '/development-roadmap/',
      '/node-guides/',
      '/assets/css/layout.css',
      '/assets/css/components.css',
      '/assets/js/navigation.js',
      '/data/search-index.json'
    ];

    try {
      const cache = await caches.open(this.cacheName);
      await cache.addAll(essentialUrls);
      console.log('Essential content cached');
    } catch (error) {
      console.error('Error caching essential content:', error);
    }
  }

  /**
   * Cache content with expiry
   */
  async cacheContent(url, content, contentType = 'text/html') {
    try {
      const cache = await caches.open(this.cacheName);
      const response = new Response(content, {
        headers: {
          'Content-Type': contentType,
          'Cache-Timestamp': Date.now().toString(),
          'Cache-Expiry': (Date.now() + this.cacheExpiry).toString()
        }
      });
      
      await cache.put(url, response);
      console.log(`Cached content for: ${url}`);
    } catch (error) {
      console.error('Error caching content:', error);
    }
  }

  /**
   * Get cached content
   */
  async getCachedContent(url) {
    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(url);
      
      if (response) {
        const cacheExpiry = response.headers.get('Cache-Expiry');
        
        // Check if cache is expired
        if (cacheExpiry && Date.now() > parseInt(cacheExpiry)) {
          await cache.delete(url);
          return null;
        }
        
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached content:', error);
      return null;
    }
  }

  /**
   * Fetch content with caching
   */
  async fetchWithCache(url, options = {}) {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    // Return pending request if already in progress
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const fetchPromise = this.performFetchWithCache(url, options);
    this.pendingRequests.set(cacheKey, fetchPromise);
    
    try {
      const result = await fetchPromise;
      this.pendingRequests.delete(cacheKey);
      return result;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Perform fetch with cache logic
   */
  async performFetchWithCache(url, options) {
    // Try cache first if offline or cache-first strategy
    if (!this.isOnline || options.cacheFirst) {
      const cachedResponse = await this.getCachedContent(url);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    try {
      // Fetch from network
      const response = await fetch(url, options);
      
      if (response.ok) {
        // Cache successful responses
        if (options.cache !== false) {
          const responseClone = response.clone();
          const content = await responseClone.text();
          await this.cacheContent(url, content, response.headers.get('Content-Type'));
        }
        
        return response;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
    } catch (error) {
      // Fallback to cache if network fails
      const cachedResponse = await this.getCachedContent(url);
      if (cachedResponse) {
        console.log(`Using cached content for failed request: ${url}`);
        return cachedResponse;
      }
      
      throw error;
    }
  }

  /**
   * Store data in offline storage
   */
  storeOfflineData(key, data) {
    try {
      const offlineData = this.getOfflineData();
      offlineData[key] = {
        data: data,
        timestamp: Date.now(),
        expiry: Date.now() + this.cacheExpiry
      };
      
      localStorage.setItem(this.offlineStorageKey, JSON.stringify(offlineData));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  /**
   * Get data from offline storage
   */
  getOfflineData(key = null) {
    try {
      const stored = localStorage.getItem(this.offlineStorageKey);
      const offlineData = stored ? JSON.parse(stored) : {};
      
      if (key) {
        const item = offlineData[key];
        if (item && Date.now() < item.expiry) {
          return item.data;
        }
        return null;
      }
      
      return offlineData;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return key ? null : {};
    }
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpiredCache() {
    try {
      const cache = await caches.open(this.cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const cacheExpiry = response.headers.get('Cache-Expiry');
          if (cacheExpiry && Date.now() > parseInt(cacheExpiry)) {
            await cache.delete(request);
            console.log(`Removed expired cache entry: ${request.url}`);
          }
        }
      }
      
      // Clean offline storage
      this.cleanExpiredOfflineData();
      
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
    }
  }

  /**
   * Clean expired offline data
   */
  cleanExpiredOfflineData() {
    try {
      const offlineData = this.getOfflineData();
      let hasChanges = false;
      
      Object.keys(offlineData).forEach(key => {
        const item = offlineData[key];
        if (item.expiry && Date.now() > item.expiry) {
          delete offlineData[key];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        localStorage.setItem(this.offlineStorageKey, JSON.stringify(offlineData));
      }
    } catch (error) {
      console.error('Error cleaning expired offline data:', error);
    }
  }

  /**
   * Setup offline page detection
   */
  setupOfflinePageDetection() {
    // Intercept navigation for offline handling
    window.addEventListener('beforeunload', () => {
      if (!this.isOnline) {
        // Store current page state for offline recovery
        this.storeOfflineData('lastPage', {
          url: window.location.href,
          title: document.title,
          scrollPosition: window.scrollY
        });
      }
    });
  }

  /**
   * Handle service worker messages
   */
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.url);
        break;
      case 'OFFLINE_FALLBACK':
        this.showOfflineMessage();
        break;
      case 'SYNC_BACKGROUND':
        this.handleBackgroundSync(data);
        break;
    }
  }

  /**
   * Show update notification
   */
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <span>A new version is available!</span>
        <button onclick="window.location.reload()" class="update-btn">Update</button>
        <button onclick="this.parentElement.parentElement.remove()" class="dismiss-btn">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
  }

  /**
   * Show offline message
   */
  showOfflineMessage() {
    const message = document.createElement('div');
    message.className = 'offline-message';
    message.innerHTML = `
      <div class="offline-content">
        <span>You're offline. Showing cached content.</span>
        <button onclick="this.parentElement.parentElement.remove()" class="dismiss-btn">×</button>
      </div>
    `;
    
    document.body.appendChild(message);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (message.parentElement) {
        message.remove();
      }
    }, 5000);
  }

  /**
   * Sync pending requests when back online
   */
  async syncPendingRequests() {
    const pendingData = this.getOfflineData('pendingRequests');
    if (!pendingData || !Array.isArray(pendingData)) {
      return;
    }

    console.log(`Syncing ${pendingData.length} pending requests`);
    
    for (const request of pendingData) {
      try {
        await fetch(request.url, request.options);
        console.log(`Synced request: ${request.url}`);
      } catch (error) {
        console.error(`Failed to sync request: ${request.url}`, error);
      }
    }
    
    // Clear pending requests
    this.storeOfflineData('pendingRequests', []);
  }

  /**
   * Add request to pending sync queue
   */
  addToPendingSync(url, options) {
    const pendingRequests = this.getOfflineData('pendingRequests') || [];
    pendingRequests.push({ url, options, timestamp: Date.now() });
    this.storeOfflineData('pendingRequests', pendingRequests);
  }

  /**
   * Handle background sync
   */
  handleBackgroundSync(data) {
    console.log('Background sync triggered:', data);
    // Handle background sync operations
  }

  /**
   * Preload content for offline access
   */
  async preloadForOffline(urls) {
    console.log(`Preloading ${urls.length} URLs for offline access`);
    
    for (const url of urls) {
      try {
        await this.fetchWithCache(url, { cacheFirst: false });
      } catch (error) {
        console.error(`Failed to preload: ${url}`, error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const cache = await caches.open(this.cacheName);
      const requests = await cache.keys();
      const offlineData = this.getOfflineData();
      
      return {
        cacheEntries: requests.length,
        offlineDataKeys: Object.keys(offlineData).length,
        isOnline: this.isOnline,
        pendingRequests: this.pendingRequests.size
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Clear all cache
   */
  async clearCache() {
    try {
      await caches.delete(this.cacheName);
      localStorage.removeItem(this.offlineStorageKey);
      console.log('Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Initialize cache manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cacheManager = new CacheManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CacheManager;
}
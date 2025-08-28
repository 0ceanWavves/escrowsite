/**
 * Resource Optimizer Module
 * Implements code splitting, resource bundling, and loading optimization
 */

class ResourceOptimizer {
  constructor() {
    this.loadedModules = new Set();
    this.moduleCache = new Map();
    this.resourceQueue = [];
    this.isProcessingQueue = false;
    this.criticalResources = new Set();
    this.deferredResources = new Set();
    
    this.init();
  }

  /**
   * Initialize resource optimizer
   */
  init() {
    this.setupCriticalResourceLoading();
    this.setupDeferredLoading();
    this.setupModuleSystem();
    this.optimizeExistingResources();
    
    console.log('Resource optimizer initialized');
  }

  /**
   * Setup critical resource loading
   */
  setupCriticalResourceLoading() {
    // Identify critical resources
    this.identifyCriticalResources();
    
    // Preload critical resources
    this.preloadCriticalResources();
  }

  /**
   * Identify critical resources based on page content
   */
  identifyCriticalResources() {
    // Critical CSS files
    const criticalCSS = [
      '/assets/css/layout.css',
      '/assets/css/components.css',
      '/assets/css/header.css'
    ];
    
    // Critical JavaScript modules
    const criticalJS = [
      '/assets/js/navigation.js',
      '/assets/js/language-switcher.js'
    ];
    
    // Add to critical resources set
    [...criticalCSS, ...criticalJS].forEach(resource => {
      this.criticalResources.add(resource);
    });
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    this.criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  /**
   * Setup deferred loading for non-critical resources
   */
  setupDeferredLoading() {
    // Defer non-critical resources until after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.loadDeferredResources();
      }, 100);
    });
  }

  /**
   * Load deferred resources
   */
  loadDeferredResources() {
    const deferredResources = [
      '/assets/css/search.css',
      '/assets/css/code-blocks.css',
      '/assets/css/progress-indicators.css',
      '/assets/js/search.js',
      '/assets/js/code-blocks.js',
      '/assets/js/progress-tracker.js'
    ];
    
    deferredResources.forEach(resource => {
      this.loadResourceDeferred(resource);
    });
  }

  /**
   * Load a resource with deferred loading
   */
  loadResourceDeferred(src) {
    if (src.endsWith('.css')) {
      this.loadCSSDeferred(src);
    } else if (src.endsWith('.js')) {
      this.loadJSDeferred(src);
    }
  }

  /**
   * Load CSS with deferred loading
   */
  loadCSSDeferred(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    
    link.onload = () => {
      link.media = 'all';
      console.log(`Deferred CSS loaded: ${href}`);
    };
    
    document.head.appendChild(link);
  }

  /**
   * Load JavaScript with deferred loading
   */
  loadJSDeferred(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log(`Deferred JS loaded: ${src}`);
    };
    
    document.head.appendChild(script);
  }

  /**
   * Setup module system for code splitting
   */
  setupModuleSystem() {
    // Create module loader
    window.loadModule = (moduleName, dependencies = []) => {
      return this.loadModule(moduleName, dependencies);
    };
    
    // Setup dynamic imports
    this.setupDynamicImports();
  }

  /**
   * Load module with dependencies
   */
  async loadModule(moduleName, dependencies = []) {
    if (this.loadedModules.has(moduleName)) {
      return this.moduleCache.get(moduleName);
    }

    // Add to queue if currently processing
    if (this.isProcessingQueue) {
      return new Promise((resolve) => {
        this.resourceQueue.push({ moduleName, dependencies, resolve });
      });
    }

    try {
      this.isProcessingQueue = true;
      
      // Load dependencies first
      await this.loadDependencies(dependencies);
      
      // Load the module
      const module = await this.importModule(moduleName);
      
      // Cache the module
      this.moduleCache.set(moduleName, module);
      this.loadedModules.add(moduleName);
      
      // Process queue
      this.processResourceQueue();
      
      return module;
      
    } catch (error) {
      console.error(`Error loading module ${moduleName}:`, error);
      throw error;
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Load module dependencies
   */
  async loadDependencies(dependencies) {
    const loadPromises = dependencies.map(dep => {
      if (!this.loadedModules.has(dep)) {
        return this.loadModule(dep);
      }
      return Promise.resolve(this.moduleCache.get(dep));
    });
    
    await Promise.all(loadPromises);
  }

  /**
   * Import module dynamically
   */
  async importModule(moduleName) {
    const modulePath = this.resolveModulePath(moduleName);
    
    try {
      // Try dynamic import first
      const module = await import(modulePath);
      return module.default || module;
    } catch (error) {
      // Fallback to script loading
      return this.loadModuleAsScript(modulePath);
    }
  }

  /**
   * Resolve module path
   */
  resolveModulePath(moduleName) {
    const moduleMap = {
      'search': '/assets/js/search.js',
      'codeBlocks': '/assets/js/code-blocks.js',
      'progressTracker': '/assets/js/progress-tracker.js',
      'lazyLoader': '/assets/js/lazy-loader.js',
      'cacheManager': '/assets/js/cache-manager.js',
      'navigation': '/assets/js/navigation.js',
      'languageSwitcher': '/assets/js/language-switcher.js',
      'accordion': '/assets/js/accordion.js',
      'tabs': '/assets/js/tabs.js'
    };
    
    return moduleMap[moduleName] || `/assets/js/${moduleName}.js`;
  }

  /**
   * Load module as script (fallback)
   */
  loadModuleAsScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        // Try to get module from global scope
        const moduleName = src.split('/').pop().replace('.js', '');
        const module = window[moduleName] || window[this.camelCase(moduleName)];
        resolve(module);
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load module: ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Process resource queue
   */
  processResourceQueue() {
    while (this.resourceQueue.length > 0) {
      const { moduleName, dependencies, resolve } = this.resourceQueue.shift();
      
      if (this.loadedModules.has(moduleName)) {
        resolve(this.moduleCache.get(moduleName));
      } else {
        // Re-queue if dependencies not ready
        this.resourceQueue.push({ moduleName, dependencies, resolve });
        break;
      }
    }
  }

  /**
   * Setup dynamic imports for modern browsers
   */
  setupDynamicImports() {
    // Feature detection for dynamic imports
    this.supportsDynamicImport = this.checkDynamicImportSupport();
    
    if (!this.supportsDynamicImport) {
      console.log('Dynamic imports not supported, using fallback loading');
    }
  }

  /**
   * Check if browser supports dynamic imports
   */
  checkDynamicImportSupport() {
    try {
      new Function('import("")');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Optimize existing resources
   */
  optimizeExistingResources() {
    // Optimize images
    this.optimizeImages();
    
    // Optimize CSS loading
    this.optimizeCSSLoading();
    
    // Optimize JavaScript loading
    this.optimizeJSLoading();
  }

  /**
   * Optimize images
   */
  optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async';
      }
      
      // Optimize image format based on browser support
      this.optimizeImageFormat(img);
    });
  }

  /**
   * Optimize image format
   */
  optimizeImageFormat(img) {
    const src = img.src || img.dataset.src;
    if (!src) return;
    
    // Check for WebP support
    if (this.supportsWebP() && !src.includes('.webp')) {
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Test if WebP version exists
      this.testImageExists(webpSrc).then(exists => {
        if (exists) {
          img.src = webpSrc;
        }
      });
    }
  }

  /**
   * Check WebP support
   */
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Test if image exists
   */
  testImageExists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  /**
   * Optimize CSS loading
   */
  optimizeCSSLoading() {
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    
    cssLinks.forEach(link => {
      // Add media queries for conditional loading
      if (!link.media || link.media === 'all') {
        // Check if CSS is critical
        if (!this.criticalResources.has(link.href)) {
          link.media = 'print';
          link.onload = () => {
            link.media = 'all';
          };
        }
      }
    });
  }

  /**
   * Optimize JavaScript loading
   */
  optimizeJSLoading() {
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
      // Add async/defer if not present
      if (!script.async && !script.defer) {
        if (this.criticalResources.has(script.src)) {
          script.defer = true;
        } else {
          script.async = true;
        }
      }
    });
  }

  /**
   * Bundle resources for production
   */
  async bundleResources(resources, bundleName) {
    const bundledContent = [];
    
    for (const resource of resources) {
      try {
        const response = await fetch(resource);
        const content = await response.text();
        bundledContent.push(`/* ${resource} */\n${content}\n`);
      } catch (error) {
        console.error(`Error bundling resource ${resource}:`, error);
      }
    }
    
    // Create bundle blob
    const bundle = new Blob(bundledContent, { type: 'text/javascript' });
    const bundleUrl = URL.createObjectURL(bundle);
    
    // Cache bundle
    this.moduleCache.set(bundleName, bundleUrl);
    
    return bundleUrl;
  }

  /**
   * Prefetch resources for next page
   */
  prefetchNextPageResources(nextPageUrl) {
    // Analyze next page requirements
    const nextPageResources = this.analyzePageResources(nextPageUrl);
    
    nextPageResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  /**
   * Analyze page resource requirements
   */
  analyzePageResources(pageUrl) {
    // Basic resource analysis based on page type
    const resources = [];
    
    if (pageUrl.includes('/node-guides/')) {
      resources.push(
        '/assets/css/code-blocks.css',
        '/assets/js/code-blocks.js',
        '/assets/js/progress-tracker.js'
      );
    }
    
    if (pageUrl.includes('/search')) {
      resources.push(
        '/assets/css/search.css',
        '/assets/js/search.js',
        '/data/search-index.json'
      );
    }
    
    return resources;
  }

  /**
   * Get resource loading statistics
   */
  getStats() {
    return {
      loadedModules: this.loadedModules.size,
      cachedModules: this.moduleCache.size,
      queuedResources: this.resourceQueue.length,
      criticalResources: this.criticalResources.size,
      supportsDynamicImport: this.supportsDynamicImport
    };
  }

  /**
   * Utility: Convert to camelCase
   */
  camelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Clear module cache
   */
  clearCache() {
    this.moduleCache.clear();
    this.loadedModules.clear();
    console.log('Resource optimizer cache cleared');
  }
}

// Initialize resource optimizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.resourceOptimizer = new ResourceOptimizer();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResourceOptimizer;
}
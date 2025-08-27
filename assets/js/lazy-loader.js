/**
 * Lazy Loading Module
 * Implements lazy loading for images, content sections, and non-critical resources
 */

class LazyLoader {
  constructor() {
    this.imageObserver = null;
    this.contentObserver = null;
    this.loadedImages = new Set();
    this.loadedContent = new Set();
    this.isSupported = 'IntersectionObserver' in window;
    
    this.init();
  }

  /**
   * Initialize lazy loading
   */
  init() {
    if (!this.isSupported) {
      console.warn('IntersectionObserver not supported, falling back to immediate loading');
      this.fallbackLoad();
      return;
    }

    this.setupImageLazyLoading();
    this.setupContentLazyLoading();
    this.setupResourceLazyLoading();
    
    console.log('Lazy loader initialized');
  }

  /**
   * Setup lazy loading for images
   */
  setupImageLazyLoading() {
    const imageOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.imageObserver.unobserve(entry.target);
        }
      });
    }, imageOptions);

    // Observe all lazy images
    this.observeImages();
  }

  /**
   * Setup lazy loading for content sections
   */
  setupContentLazyLoading() {
    const contentOptions = {
      root: null,
      rootMargin: '100px',
      threshold: 0.05
    };

    this.contentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadContent(entry.target);
          this.contentObserver.unobserve(entry.target);
        }
      });
    }, contentOptions);

    // Observe all lazy content
    this.observeContent();
  }

  /**
   * Observe images for lazy loading
   */
  observeImages() {
    const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    
    lazyImages.forEach(img => {
      if (!this.loadedImages.has(img)) {
        this.imageObserver.observe(img);
      }
    });
  }

  /**
   * Observe content sections for lazy loading
   */
  observeContent() {
    const lazyContent = document.querySelectorAll('[data-lazy-content]');
    
    lazyContent.forEach(element => {
      if (!this.loadedContent.has(element)) {
        this.contentObserver.observe(element);
      }
    });
  }

  /**
   * Load a lazy image
   */
  loadImage(img) {
    if (this.loadedImages.has(img)) return;

    const src = img.dataset.src || img.src;
    const srcset = img.dataset.srcset;
    
    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Update the actual image
      img.src = src;
      if (srcset) {
        img.srcset = srcset;
      }
      
      // Add loaded class for animations
      img.classList.add('lazy-loaded');
      
      // Remove lazy loading attributes
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      
      this.loadedImages.add(img);
    };
    
    imageLoader.onerror = () => {
      // Handle error - show placeholder or fallback
      img.classList.add('lazy-error');
      this.loadedImages.add(img);
    };
    
    // Start loading
    imageLoader.src = src;
    if (srcset) {
      imageLoader.srcset = srcset;
    }
  }

  /**
   * Load lazy content
   */
  async loadContent(element) {
    if (this.loadedContent.has(element)) return;

    const contentType = element.dataset.lazyContent;
    const contentSrc = element.dataset.contentSrc;
    
    try {
      element.classList.add('lazy-loading');
      
      switch (contentType) {
        case 'html':
          await this.loadHTMLContent(element, contentSrc);
          break;
        case 'json':
          await this.loadJSONContent(element, contentSrc);
          break;
        case 'component':
          await this.loadComponent(element, contentSrc);
          break;
        default:
          console.warn(`Unknown lazy content type: ${contentType}`);
      }
      
      element.classList.remove('lazy-loading');
      element.classList.add('lazy-loaded');
      this.loadedContent.add(element);
      
    } catch (error) {
      console.error('Error loading lazy content:', error);
      element.classList.remove('lazy-loading');
      element.classList.add('lazy-error');
      this.loadedContent.add(element);
    }
  }

  /**
   * Load HTML content
   */
  async loadHTMLContent(element, src) {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    element.innerHTML = html;
    
    // Process any new lazy elements in the loaded content
    this.observeImages();
    this.observeContent();
  }

  /**
   * Load JSON content and render
   */
  async loadJSONContent(element, src) {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const template = element.dataset.template;
    
    if (template && window[template]) {
      // Use template function if available
      element.innerHTML = window[template](data);
    } else {
      // Default JSON rendering
      element.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }
  }

  /**
   * Load component dynamically
   */
  async loadComponent(element, componentName) {
    try {
      // Try to load component module
      const module = await import(`./components/${componentName}.js`);
      const Component = module.default || module[componentName];
      
      if (Component) {
        const instance = new Component(element);
        if (instance.render) {
          instance.render();
        }
      }
    } catch (error) {
      console.error(`Error loading component ${componentName}:`, error);
      throw error;
    }
  }

  /**
   * Setup lazy loading for external resources
   */
  setupResourceLazyLoading() {
    // Lazy load CSS files
    const lazyCSSLinks = document.querySelectorAll('link[data-lazy-css]');
    lazyCSSLinks.forEach(link => {
      this.lazyLoadCSS(link.dataset.lazyCss, link.media || 'all');
      link.remove();
    });

    // Lazy load JavaScript files
    const lazyScripts = document.querySelectorAll('script[data-lazy-src]');
    lazyScripts.forEach(script => {
      this.lazyLoadScript(script.dataset.lazySrc);
      script.remove();
    });
  }

  /**
   * Lazy load CSS file
   */
  lazyLoadCSS(href, media = 'all') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = media;
    
    link.onload = () => {
      console.log(`Lazy loaded CSS: ${href}`);
    };
    
    document.head.appendChild(link);
  }

  /**
   * Lazy load JavaScript file
   */
  lazyLoadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        console.log(`Lazy loaded script: ${src}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`Error loading script: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Fallback for browsers without IntersectionObserver
   */
  fallbackLoad() {
    // Load all images immediately
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
    });

    // Load all content immediately
    const lazyContent = document.querySelectorAll('[data-lazy-content]');
    lazyContent.forEach(element => {
      this.loadContent(element);
    });
  }

  /**
   * Preload critical resources
   */
  preloadCritical() {
    // Preload critical images
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
      if (img.dataset.src) {
        this.loadImage(img);
      }
    });

    // Preload above-the-fold content
    const aboveFoldContent = document.querySelectorAll('[data-above-fold]');
    aboveFoldContent.forEach(element => {
      if (element.dataset.lazyContent) {
        this.loadContent(element);
      }
    });
  }

  /**
   * Add new elements to lazy loading
   */
  addElements(elements) {
    elements.forEach(element => {
      if (element.tagName === 'IMG' && (element.dataset.src || element.loading === 'lazy')) {
        this.imageObserver.observe(element);
      } else if (element.dataset.lazyContent) {
        this.contentObserver.observe(element);
      }
    });
  }

  /**
   * Remove elements from lazy loading
   */
  removeElements(elements) {
    elements.forEach(element => {
      if (this.imageObserver) {
        this.imageObserver.unobserve(element);
      }
      if (this.contentObserver) {
        this.contentObserver.unobserve(element);
      }
      this.loadedImages.delete(element);
      this.loadedContent.delete(element);
    });
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      loadedImages: this.loadedImages.size,
      loadedContent: this.loadedContent.size,
      isSupported: this.isSupported
    };
  }

  /**
   * Destroy lazy loader
   */
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
    if (this.contentObserver) {
      this.contentObserver.disconnect();
    }
    
    this.loadedImages.clear();
    this.loadedContent.clear();
  }
}

// Initialize lazy loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.lazyLoader = new LazyLoader();
  
  // Preload critical resources
  window.lazyLoader.preloadCritical();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoader;
}
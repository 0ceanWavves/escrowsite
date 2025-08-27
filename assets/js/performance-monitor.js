/**
 * Performance Monitoring System
 * Tracks page performance, user interactions, and resource loading
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.observers = [];
    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    // Wait for page load to start monitoring
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
    } else {
      this.startMonitoring();
    }
  }

  /**
   * Start all performance monitoring
   */
  startMonitoring() {
    this.monitorPageLoad();
    this.monitorResourceLoading();
    this.monitorUserInteractions();
    this.monitorLargestContentfulPaint();
    this.monitorCumulativeLayoutShift();
    this.monitorFirstInputDelay();
  }

  /**
   * Monitor page load performance
   */
  monitorPageLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.recordMetric('page_load', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnect: navigation.connectEnd - navigation.connectStart,
            serverResponse: navigation.responseEnd - navigation.requestStart,
            domProcessing: navigation.domComplete - navigation.domLoading,
            timestamp: new Date().toISOString()
          });
        }
      }, 0);
    });
  }

  /**
   * Monitor resource loading performance
   */
  monitorResourceLoading() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) { // Resources taking more than 1 second
          this.recordMetric('slow_resource', {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize || 0,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  /**
   * Monitor user interactions
   */
  monitorUserInteractions() {
    const interactionTypes = ['click', 'scroll', 'keydown'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        
        // Use requestAnimationFrame to measure interaction response time
        requestAnimationFrame(() => {
          const responseTime = performance.now() - startTime;
          
          if (responseTime > 100) { // Slow interactions (>100ms)
            this.recordMetric('slow_interaction', {
              type: type,
              target: event.target.tagName,
              responseTime: responseTime,
              timestamp: new Date().toISOString()
            });
          }
        });
      }, { passive: true });
    });
  }

  /**
   * Monitor Largest Contentful Paint (LCP)
   */
  monitorLargestContentfulPaint() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.recordMetric('largest_contentful_paint', {
        value: lastEntry.startTime,
        element: lastEntry.element ? lastEntry.element.tagName : 'unknown',
        timestamp: new Date().toISOString()
      });
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  /**
   * Monitor Cumulative Layout Shift (CLS)
   */
  monitorCumulativeLayoutShift() {
    let clsValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      this.recordMetric('cumulative_layout_shift', {
        value: clsValue,
        timestamp: new Date().toISOString()
      });
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  /**
   * Monitor First Input Delay (FID)
   */
  monitorFirstInputDelay() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('first_input_delay', {
          value: entry.processingStart - entry.startTime,
          inputType: entry.name,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  /**
   * Record a performance metric
   */
  recordMetric(type, data) {
    const metric = {
      type,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
    
    // Store in localStorage
    try {
      localStorage.setItem('performanceMetrics', JSON.stringify(this.metrics));
    } catch (e) {
      // Ignore storage errors
    }
    
    // Send to analytics (implement based on your backend)
    this.sendMetric(metric);
  }

  /**
   * Send metric to analytics backend
   */
  async sendMetric(metric) {
    try {
      // Implement your analytics reporting logic here
      // This could be Google Analytics, custom backend, etc.
      
      // Example implementation:
      // await fetch('/api/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metric)
      // });
      
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return [...this.metrics];
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type) {
    return this.metrics.filter(metric => metric.type === type);
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
    try {
      localStorage.removeItem('performanceMetrics');
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Disconnect all observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
} else {
  window.PerformanceMonitor = PerformanceMonitor;
  window.performanceMonitor = performanceMonitor;
}
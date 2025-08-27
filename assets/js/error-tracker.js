/**
 * Error Tracking System
 * Captures and reports JavaScript errors and performance issues
 */

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 50;
    this.endpoint = '/api/errors'; // Configure with your error reporting endpoint
    this.sessionId = this.generateSessionId();
    this.init();
  }

  /**
   * Initialize error tracking
   */
  init() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'promise',
        message: event.reason ? event.reason.toString() : 'Unhandled promise rejection',
        stack: event.reason ? event.reason.stack : null,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Network error tracking
    this.trackNetworkErrors();
    
    // Performance issue tracking
    this.trackPerformanceIssues();
  }

  /**
   * Capture and store error
   */
  captureError(errorData) {
    const error = {
      ...errorData,
      sessionId: this.sessionId,
      id: this.generateErrorId()
    };

    this.errors.push(error);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('errorTracker', JSON.stringify(this.errors));
    } catch (e) {
      // localStorage might be full or unavailable
    }

    // Report error (implement based on your backend)
    this.reportError(error);
    
    console.error('Error tracked:', error);
  }

  /**
   * Track network errors
   */
  trackNetworkErrors() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.captureError({
            type: 'network',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            timestamp: new Date().toISOString()
          });
        }
        
        return response;
      } catch (error) {
        this.captureError({
          type: 'network',
          message: error.message,
          url: args[0],
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    };
  }

  /**
   * Track performance issues
   */
  trackPerformanceIssues() {
    // Track slow page loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation && navigation.loadEventEnd > 5000) { // 5 seconds
          this.captureError({
            type: 'performance',
            message: 'Slow page load detected',
            loadTime: navigation.loadEventEnd,
            timestamp: new Date().toISOString()
          });
        }
      }, 1000);
    });

    // Track memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          this.captureError({
            type: 'performance',
            message: 'High memory usage detected',
            memoryUsage: memory.usedJSHeapSize,
            memoryLimit: memory.jsHeapSizeLimit,
            timestamp: new Date().toISOString()
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Report error to backend
   */
  async reportError(error) {
    try {
      // Implement your error reporting logic here
      // This could be sending to a service like Sentry, LogRocket, etc.
      
      // Example implementation:
      // await fetch(this.endpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // });
      
    } catch (e) {
      // Silently fail to avoid infinite error loops
    }
  }

  /**
   * Get all tracked errors
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
    try {
      localStorage.removeItem('errorTracker');
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate error ID
   */
  generateErrorId() {
    return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Initialize error tracking
const errorTracker = new ErrorTracker();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorTracker;
} else {
  window.ErrorTracker = ErrorTracker;
  window.errorTracker = errorTracker;
}
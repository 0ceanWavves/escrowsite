/**
 * Privacy-Focused Analytics System
 * Tracks user behavior while respecting privacy
 */

class Analytics {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.pageViews = 0;
    this.init();
  }

  /**
   * Initialize analytics
   */
  init() {
    this.trackPageView();
    this.trackUserEngagement();
    this.trackContentInteractions();
    this.trackSearchUsage();
    this.trackLanguageSwitching();
  }

  /**
   * Track page views
   */
  trackPageView() {
    this.pageViews++;
    
    this.trackEvent('page_view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      pageNumber: this.pageViews
    });
    
    // Track page view duration when user leaves
    let startTime = Date.now();
    
    const trackDuration = () => {
      const duration = Date.now() - startTime;
      this.trackEvent('page_duration', {
        url: window.location.href,
        duration: duration,
        timestamp: new Date().toISOString()
      });
    };
    
    window.addEventListener('beforeunload', trackDuration);
    window.addEventListener('pagehide', trackDuration);
  }

  /**
   * Track user engagement
   */
  trackUserEngagement() {
    let scrollDepth = 0;
    let maxScrollDepth = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollDepth = Math.round((scrollTop / documentHeight) * 100);
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track milestone scroll depths
        if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
          this.trackEvent('scroll_depth', { depth: '25%', url: window.location.href });
        } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
          this.trackEvent('scroll_depth', { depth: '50%', url: window.location.href });
        } else if (maxScrollDepth >= 75 && maxScrollDepth < 100) {
          this.trackEvent('scroll_depth', { depth: '75%', url: window.location.href });
        } else if (maxScrollDepth >= 100) {
          this.trackEvent('scroll_depth', { depth: '100%', url: window.location.href });
        }
      }
    }, { passive: true });
  }

  /**
   * Track content interactions
   */
  trackContentInteractions() {
    // Track accordion interactions
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('accordion-header')) {
        this.trackEvent('accordion_interaction', {
          action: event.target.getAttribute('aria-expanded') === 'true' ? 'close' : 'open',
          section: event.target.textContent.trim(),
          url: window.location.href
        });
      }
    });
    
    // Track tab interactions
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('tab-button')) {
        this.trackEvent('tab_interaction', {
          tab: event.target.textContent.trim(),
          url: window.location.href
        });
      }
    });
    
    // Track code block interactions
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('copy-button')) {
        this.trackEvent('code_copy', {
          language: event.target.dataset.language || 'unknown',
          url: window.location.href
        });
      }
    });
    
    // Track external link clicks
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        this.trackEvent('external_link_click', {
          url: link.href,
          text: link.textContent.trim(),
          source: window.location.href
        });
      }
    });
  }

  /**
   * Track search usage
   */
  trackSearchUsage() {
    // Track search queries
    document.addEventListener('submit', (event) => {
      if (event.target.id === 'search-form') {
        const query = event.target.querySelector('input[type="search"]').value;
        this.trackEvent('search_query', {
          query: query,
          url: window.location.href
        });
      }
    });
    
    // Track search result clicks
    document.addEventListener('click', (event) => {
      if (event.target.closest('.search-result')) {
        this.trackEvent('search_result_click', {
          result: event.target.textContent.trim(),
          url: window.location.href
        });
      }
    });
  }

  /**
   * Track language switching
   */
  trackLanguageSwitching() {
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('language-switch')) {
        this.trackEvent('language_switch', {
          from: document.documentElement.lang || 'unknown',
          to: event.target.dataset.lang || 'unknown',
          url: window.location.href
        });
      }
    });
  }

  /**
   * Track custom event
   */
  trackEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };
    
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > 200) {
      this.events = this.events.slice(-200);
    }
    
    // Store in localStorage
    try {
      localStorage.setItem('analyticsEvents', JSON.stringify(this.events));
    } catch (e) {
      // Ignore storage errors
    }
    
    // Send to analytics backend
    this.sendEvent(event);
  }

  /**
   * Send event to analytics backend
   */
  async sendEvent(event) {
    try {
      // Implement your analytics backend here
      // This could be Google Analytics, Plausible, custom backend, etc.
      
      // Example implementation:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
      
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Get all events
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type) {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = [];
    try {
      localStorage.removeItem('analyticsEvents');
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
}

// Initialize analytics
const analytics = new Analytics();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
} else {
  window.Analytics = Analytics;
  window.analytics = analytics;
}
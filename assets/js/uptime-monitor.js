/**
 * Client-Side Uptime Monitoring
 * Monitors site availability and performance from user perspective
 */

class UptimeMonitor {
  constructor() {
    this.checks = [];
    this.isOnline = navigator.onLine;
    this.lastCheck = null;
    this.checkInterval = 60000; // 1 minute
    this.init();
  }

  /**
   * Initialize uptime monitoring
   */
  init() {
    this.monitorNetworkStatus();
    this.startPeriodicChecks();
    this.monitorPageVisibility();
  }

  /**
   * Monitor network status
   */
  monitorNetworkStatus() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.recordCheck('network_online', { status: 'online' });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.recordCheck('network_offline', { status: 'offline' });
    });
  }

  /**
   * Start periodic availability checks
   */
  startPeriodicChecks() {
    this.performCheck();
    setInterval(() => this.performCheck(), this.checkInterval);
  }

  /**
   * Monitor page visibility for accurate uptime tracking
   */
  monitorPageVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, perform immediate check
        this.performCheck();
      }
    });
  }

  /**
   * Perform availability check
   */
  async performCheck() {
    const startTime = performance.now();
    
    try {
      // Check main site availability
      const response = await fetch(window.location.origin + '/index.html', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.recordCheck('availability_check', {
        status: response.ok ? 'up' : 'down',
        responseTime: responseTime,
        httpStatus: response.status,
        timestamp: new Date().toISOString()
      });
      
      // Check critical resources
      await this.checkCriticalResources();
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.recordCheck('availability_check', {
        status: 'error',
        error: error.message,
        responseTime: responseTime,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Check critical resources
   */
  async checkCriticalResources() {
    const criticalResources = [
      '/data/development-roadmap.json',
      '/data/node-guides.json',
      '/assets/css/layout.css',
      '/assets/js/navigation.js'
    ];
    
    for (const resource of criticalResources) {
      try {
        const startTime = performance.now();
        const response = await fetch(resource, {
          method: 'HEAD',
          cache: 'no-cache'
        });
        const endTime = performance.now();
        
        this.recordCheck('resource_check', {
          resource: resource,
          status: response.ok ? 'available' : 'unavailable',
          responseTime: endTime - startTime,
          httpStatus: response.status,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        this.recordCheck('resource_check', {
          resource: resource,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Record uptime check
   */
  recordCheck(type, data) {
    const check = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.checks.push(check);
    this.lastCheck = check;
    
    // Keep only recent checks
    if (this.checks.length > 100) {
      this.checks = this.checks.slice(-100);
    }
    
    // Store in localStorage
    try {
      localStorage.setItem('uptimeChecks', JSON.stringify(this.checks));
    } catch (e) {
      // Ignore storage errors
    }
    
    // Report to monitoring service
    this.reportCheck(check);
  }

  /**
   * Report check to monitoring service
   */
  async reportCheck(check) {
    try {
      // Implement your uptime monitoring backend here
      // This could be a custom service, third-party monitoring, etc.
      
      // Example implementation:
      // await fetch('/api/uptime', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(check)
      // });
      
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Get uptime statistics
   */
  getUptimeStats() {
    const availabilityChecks = this.checks.filter(check => check.type === 'availability_check');
    const upChecks = availabilityChecks.filter(check => check.data.status === 'up');
    
    const uptime = availabilityChecks.length > 0 ? 
      (upChecks.length / availabilityChecks.length) * 100 : 0;
    
    const avgResponseTime = availabilityChecks.length > 0 ?
      availabilityChecks.reduce((sum, check) => sum + (check.data.responseTime || 0), 0) / availabilityChecks.length : 0;
    
    return {
      uptime: uptime.toFixed(2),
      totalChecks: availabilityChecks.length,
      upChecks: upChecks.length,
      downChecks: availabilityChecks.length - upChecks.length,
      averageResponseTime: avgResponseTime.toFixed(2),
      lastCheck: this.lastCheck
    };
  }

  /**
   * Get all checks
   */
  getChecks() {
    return [...this.checks];
  }

  /**
   * Clear all checks
   */
  clearChecks() {
    this.checks = [];
    this.lastCheck = null;
    try {
      localStorage.removeItem('uptimeChecks');
    } catch (e) {
      // Ignore
    }
  }
}

// Initialize uptime monitoring
const uptimeMonitor = new UptimeMonitor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UptimeMonitor;
} else {
  window.UptimeMonitor = UptimeMonitor;
  window.uptimeMonitor = uptimeMonitor;
}
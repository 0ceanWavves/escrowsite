/**
 * Sequential Navigation Module
 * Provides previous/next navigation for sequential guides and learning paths
 */

class SequentialNavigation {
  constructor() {
    this.navigationData = new Map();
    this.currentPage = null;
    this.currentSequence = null;
    
    this.init();
  }

  /**
   * Initialize sequential navigation
   */
  init() {
    this.setupNavigationData();
    this.detectCurrentPage();
    this.renderNavigation();
    this.setupKeyboardShortcuts();
    
    console.log('Sequential navigation initialized');
  }

  /**
   * Setup navigation data for different sequences
   */
  setupNavigationData() {
    // Development Roadmap sequence
    this.navigationData.set('development-roadmap', {
      title: 'Development Roadmap',
      description: 'Complete crypto development learning path',
      sequence: [
        {
          id: 'overview',
          title: 'Development Overview',
          url: '/development-roadmap/',
          description: 'Introduction to the development roadmap'
        },
        {
          id: 'phase-1-overview',
          title: 'Phase 1: Overview',
          url: '/development-roadmap/phase-1/',
          description: 'Foundational Infrastructure overview'
        },
        {
          id: 'database-schemas',
          title: 'Database Schemas',
          url: '/development-roadmap/phase-1/database-schemas.html',
          description: 'Design and implement database structures'
        },
        {
          id: 'payment-gateways',
          title: 'Payment Gateways',
          url: '/development-roadmap/phase-1/payment-gateways.html',
          description: 'Integrate payment processing systems'
        },
        {
          id: 'self-hosted-nodes',
          title: 'Self-Hosted Nodes',
          url: '/development-roadmap/phase-1/self-hosted-nodes.html',
          description: 'Set up and manage blockchain nodes'
        },
        {
          id: 'phase-2-overview',
          title: 'Phase 2: Overview',
          url: '/development-roadmap/phase-2/',
          description: 'Backend & APIs overview'
        },
        {
          id: 'api-development',
          title: 'API Development',
          url: '/development-roadmap/phase-2/api-development.html',
          description: 'Build robust APIs and backend services'
        },
        {
          id: 'security-implementation',
          title: 'Security Implementation',
          url: '/development-roadmap/phase-2/security-implementation.html',
          description: 'Implement security best practices'
        },
        {
          id: 'phase-3-overview',
          title: 'Phase 3: Overview',
          url: '/development-roadmap/phase-3/',
          description: 'Frontend & UI overview'
        },
        {
          id: 'react-development',
          title: 'React Development',
          url: '/development-roadmap/phase-3/react-development.html',
          description: 'Build modern React applications'
        },
        {
          id: 'web3-integration',
          title: 'Web3 Integration',
          url: '/development-roadmap/phase-3/web3-integration.html',
          description: 'Integrate Web3 functionality'
        }
      ]
    });

    // Node Guides sequence
    this.navigationData.set('node-guides', {
      title: 'Node Setup Guides',
      description: 'Complete BTC & XMR node setup process',
      sequence: [
        {
          id: 'overview',
          title: 'Node Guides Overview',
          url: '/node-guides/',
          description: 'Introduction to node setup guides'
        },
        {
          id: 'procurement-overview',
          title: 'Procurement & Provisioning',
          url: '/node-guides/procurement-provisioning/',
          description: 'Server procurement and initial setup'
        },
        {
          id: 'vps-selection',
          title: 'VPS Selection',
          url: '/node-guides/procurement-provisioning/vps-selection.html',
          description: 'Choose the right VPS provider'
        },
        {
          id: 'hardware-requirements',
          title: 'Hardware Requirements',
          url: '/node-guides/procurement-provisioning/hardware-requirements.html',
          description: 'Understand hardware specifications'
        },
        {
          id: 'cost-estimation',
          title: 'Cost Estimation',
          url: '/node-guides/procurement-provisioning/cost-estimation.html',
          description: 'Calculate setup and running costs'
        },
        {
          id: 'security-overview',
          title: 'Server Foundation & Security',
          url: '/node-guides/server-security/',
          description: 'Secure your server foundation'
        },
        {
          id: 'secure-connections',
          title: 'Secure Connections',
          url: '/node-guides/server-security/secure-connections.html',
          description: 'Set up SSH and secure access'
        },
        {
          id: 'firewall-config',
          title: 'Firewall Configuration',
          url: '/node-guides/server-security/firewall-config.html',
          description: 'Configure firewall rules'
        },
        {
          id: 'system-hardening',
          title: 'System Hardening',
          url: '/node-guides/server-security/system-hardening.html',
          description: 'Harden your server security'
        },
        {
          id: 'installation-overview',
          title: 'Node Software Installation',
          url: '/node-guides/installation/',
          description: 'Install node software'
        },
        {
          id: 'download-verification',
          title: 'Download & Verification',
          url: '/node-guides/installation/download-verification.html',
          description: 'Download and verify node software'
        },
        {
          id: 'configuration',
          title: 'Configuration',
          url: '/node-guides/installation/configuration.html',
          description: 'Configure node settings'
        },
        {
          id: 'setup-wizard',
          title: 'Setup Wizard',
          url: '/node-guides/installation/setup-wizard.html',
          description: 'Complete initial setup'
        },
        {
          id: 'sync-overview',
          title: 'Blockchain Synchronization',
          url: '/node-guides/synchronization/',
          description: 'Synchronize with the blockchain'
        },
        {
          id: 'monitoring',
          title: 'Monitoring',
          url: '/node-guides/synchronization/monitoring.html',
          description: 'Monitor synchronization progress'
        },
        {
          id: 'testing',
          title: 'Testing & Validation',
          url: '/node-guides/synchronization/testing.html',
          description: 'Test and validate your node'
        },
        {
          id: 'maintenance',
          title: 'Ongoing Maintenance',
          url: '/node-guides/synchronization/maintenance.html',
          description: 'Maintain your node long-term'
        }
      ]
    });
  }

  /**
   * Detect current page and sequence
   */
  detectCurrentPage() {
    const path = window.location.pathname;
    
    // Determine which sequence we're in
    if (path.includes('/development-roadmap/')) {
      this.currentSequence = 'development-roadmap';
    } else if (path.includes('/node-guides/')) {
      this.currentSequence = 'node-guides';
    } else {
      this.currentSequence = null;
      return;
    }

    // Find current page in sequence
    const sequenceData = this.navigationData.get(this.currentSequence);
    if (sequenceData) {
      this.currentPage = sequenceData.sequence.find(page => 
        page.url === path || path.startsWith(page.url)
      );
    }
  }

  /**
   * Get previous page in sequence
   */
  getPreviousPage() {
    if (!this.currentSequence || !this.currentPage) return null;

    const sequenceData = this.navigationData.get(this.currentSequence);
    const currentIndex = sequenceData.sequence.findIndex(page => page.id === this.currentPage.id);
    
    if (currentIndex > 0) {
      return sequenceData.sequence[currentIndex - 1];
    }
    
    return null;
  }

  /**
   * Get next page in sequence
   */
  getNextPage() {
    if (!this.currentSequence || !this.currentPage) return null;

    const sequenceData = this.navigationData.get(this.currentSequence);
    const currentIndex = sequenceData.sequence.findIndex(page => page.id === this.currentPage.id);
    
    if (currentIndex >= 0 && currentIndex < sequenceData.sequence.length - 1) {
      return sequenceData.sequence[currentIndex + 1];
    }
    
    return null;
  }

  /**
   * Get progress information
   */
  getProgress() {
    if (!this.currentSequence || !this.currentPage) return null;

    const sequenceData = this.navigationData.get(this.currentSequence);
    const currentIndex = sequenceData.sequence.findIndex(page => page.id === this.currentPage.id);
    
    return {
      current: currentIndex + 1,
      total: sequenceData.sequence.length,
      percentage: Math.round(((currentIndex + 1) / sequenceData.sequence.length) * 100)
    };
  }

  /**
   * Render navigation elements
   */
  renderNavigation() {
    if (!this.currentSequence) return;

    this.renderSequentialNav();
    this.renderProgressIndicator();
    this.renderSequenceOverview();
  }

  /**
   * Render previous/next navigation
   */
  renderSequentialNav() {
    const previousPage = this.getPreviousPage();
    const nextPage = this.getNextPage();
    
    if (!previousPage && !nextPage) return;

    // Find or create navigation container
    let navContainer = document.getElementById('sequential-navigation');
    if (!navContainer) {
      navContainer = document.createElement('nav');
      navContainer.id = 'sequential-navigation';
      navContainer.className = 'sequential-nav';
      navContainer.setAttribute('aria-label', 'Sequential navigation');
      
      // Insert at the end of main content
      const mainContent = document.querySelector('.content, main, article');
      if (mainContent) {
        mainContent.appendChild(navContainer);
      } else {
        document.body.appendChild(navContainer);
      }
    }

    const navHTML = `
      <div class="sequential-nav-container">
        ${previousPage ? `
          <a href="${previousPage.url}" class="sequential-nav-link sequential-nav-prev">
            <div class="sequential-nav-direction">
              <svg class="sequential-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
              Previous
            </div>
            <div class="sequential-nav-content">
              <h4 class="sequential-nav-title">${previousPage.title}</h4>
              <p class="sequential-nav-description">${previousPage.description}</p>
            </div>
          </a>
        ` : '<div class="sequential-nav-spacer"></div>'}
        
        ${nextPage ? `
          <a href="${nextPage.url}" class="sequential-nav-link sequential-nav-next">
            <div class="sequential-nav-content">
              <h4 class="sequential-nav-title">${nextPage.title}</h4>
              <p class="sequential-nav-description">${nextPage.description}</p>
            </div>
            <div class="sequential-nav-direction">
              Next
              <svg class="sequential-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </div>
          </a>
        ` : '<div class="sequential-nav-spacer"></div>'}
      </div>
    `;

    navContainer.innerHTML = navHTML;
  }

  /**
   * Render progress indicator
   */
  renderProgressIndicator() {
    const progress = this.getProgress();
    if (!progress) return;

    // Find or create progress container
    let progressContainer = document.getElementById('sequence-progress');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.id = 'sequence-progress';
      progressContainer.className = 'sequence-progress';
      
      // Insert at the top of main content
      const mainContent = document.querySelector('.content, main, article');
      if (mainContent) {
        mainContent.insertBefore(progressContainer, mainContent.firstChild);
      }
    }

    const sequenceData = this.navigationData.get(this.currentSequence);
    
    const progressHTML = `
      <div class="progress-header">
        <h3 class="progress-title">${sequenceData.title}</h3>
        <span class="progress-stats">${progress.current} of ${progress.total}</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progress.percentage}%"></div>
      </div>
      <p class="progress-description">${sequenceData.description}</p>
    `;

    progressContainer.innerHTML = progressHTML;
  }

  /**
   * Render sequence overview (optional sidebar)
   */
  renderSequenceOverview() {
    // Check if there's a sidebar or dedicated area for sequence overview
    const overviewContainer = document.getElementById('sequence-overview');
    if (!overviewContainer) return;

    const sequenceData = this.navigationData.get(this.currentSequence);
    const progress = this.getProgress();
    
    const overviewHTML = `
      <h3 class="overview-title">${sequenceData.title}</h3>
      <ol class="sequence-list">
        ${sequenceData.sequence.map((page, index) => {
          const isCurrent = page.id === this.currentPage?.id;
          const isCompleted = index < (progress.current - 1);
          const isAccessible = index <= progress.current;
          
          return `
            <li class="sequence-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${!isAccessible ? 'locked' : ''}">
              ${isAccessible ? `<a href="${page.url}" class="sequence-link">` : '<span class="sequence-link disabled">'}
                <span class="sequence-number">${index + 1}</span>
                <span class="sequence-title">${page.title}</span>
                ${isCurrent ? '<span class="sequence-indicator">Current</span>' : ''}
                ${isCompleted ? '<span class="sequence-check">✓</span>' : ''}
              ${isAccessible ? '</a>' : '</span>'}
            </li>
          `;
        }).join('')}
      </ol>
    `;

    overviewContainer.innerHTML = overviewHTML;
  }

  /**
   * Setup keyboard shortcuts for navigation
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts if not in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      // Previous page: Alt + Left Arrow
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        const previousPage = this.getPreviousPage();
        if (previousPage) {
          window.location.href = previousPage.url;
        }
      }

      // Next page: Alt + Right Arrow
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        const nextPage = this.getNextPage();
        if (nextPage) {
          window.location.href = nextPage.url;
        }
      }

      // Sequence overview: Alt + O
      if (e.altKey && e.key === 'o') {
        e.preventDefault();
        const sequenceData = this.navigationData.get(this.currentSequence);
        if (sequenceData) {
          window.location.href = sequenceData.sequence[0].url;
        }
      }
    });
  }

  /**
   * Navigate to specific page in sequence
   */
  navigateToPage(pageId) {
    if (!this.currentSequence) return false;

    const sequenceData = this.navigationData.get(this.currentSequence);
    const page = sequenceData.sequence.find(p => p.id === pageId);
    
    if (page) {
      window.location.href = page.url;
      return true;
    }
    
    return false;
  }

  /**
   * Get sequence data for external use
   */
  getSequenceData() {
    if (!this.currentSequence) return null;

    return {
      sequence: this.currentSequence,
      current: this.currentPage,
      previous: this.getPreviousPage(),
      next: this.getNextPage(),
      progress: this.getProgress(),
      data: this.navigationData.get(this.currentSequence)
    };
  }

  /**
   * Update navigation for new page (for SPA-like behavior)
   */
  updateForNewPage() {
    this.detectCurrentPage();
    this.renderNavigation();
  }

  /**
   * Add custom sequence
   */
  addSequence(id, sequenceData) {
    this.navigationData.set(id, sequenceData);
  }

  /**
   * Remove sequence
   */
  removeSequence(id) {
    this.navigationData.delete(id);
  }
}

// Initialize sequential navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.sequentialNavigation = new SequentialNavigation();
});

// Update navigation on page changes (for SPA-like behavior)
window.addEventListener('popstate', () => {
  if (window.sequentialNavigation) {
    window.sequentialNavigation.updateForNewPage();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SequentialNavigation;
}
/**
 * Progress Tracker Module
 * Manages user progress through guides and phases with localStorage persistence
 */

class ProgressTracker {
  constructor() {
    this.storageKey = 'crypto-guide-progress';
    this.bookmarksKey = 'crypto-guide-bookmarks';
    this.progress = this.loadProgress();
    this.bookmarks = this.loadBookmarks();
    this.currentSection = null;
    this.currentPhase = null;
    this.currentSubsection = null;
    
    this.init();
  }

  /**
   * Initialize the progress tracker
   */
  init() {
    this.detectCurrentPage();
    this.setupEventListeners();
    this.updateProgressDisplay();
    console.log('Progress tracker initialized');
  }

  /**
   * Load progress data from localStorage
   */
  loadProgress() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
    
    return {
      'development-roadmap': {
        'phase-1': {
          completed: false,
          subsections: {},
          startedAt: null,
          completedAt: null
        },
        'phase-2': {
          completed: false,
          subsections: {},
          startedAt: null,
          completedAt: null
        },
        'phase-3': {
          completed: false,
          subsections: {},
          startedAt: null,
          completedAt: null
        }
      },
      'node-guides': {
        'procurement-provisioning': {
          completed: false,
          subsections: {},
          startedAt: null,
          completedAt: null
        },
        'server-security': {
          completed: false,
          subsections: {},
          startedAt: null,
          completedAt: null
        },
        'installation': {
          completed: false,
          subsections: {},
          startedAt: null,
          completedAt: null
        },
        'synchronization': {
          completed: false,
          subsections: {},
          startedAt: null,
          completedAt: null
        }
      },
      metadata: {
        totalTimeSpent: 0,
        lastActive: null,
        startedAt: null
      }
    };
  }

  /**
   * Load bookmarks from localStorage
   */
  loadBookmarks() {
    try {
      const stored = localStorage.getItem(this.bookmarksKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
    
    return [];
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    try {
      this.progress.metadata.lastActive = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  /**
   * Save bookmarks to localStorage
   */
  saveBookmarks() {
    try {
      localStorage.setItem(this.bookmarksKey, JSON.stringify(this.bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }

  /**
   * Detect current page and set context
   */
  detectCurrentPage() {
    const path = window.location.pathname;
    
    // Parse URL to determine section, phase, and subsection
    if (path.includes('/development-roadmap/')) {
      this.currentSection = 'development-roadmap';
      
      if (path.includes('/phase-1/')) {
        this.currentPhase = 'phase-1';
        this.extractSubsection(path, ['database-schemas', 'payment-gateways', 'self-hosted-nodes']);
      } else if (path.includes('/phase-2/')) {
        this.currentPhase = 'phase-2';
        this.extractSubsection(path, ['api-development', 'security-implementation']);
      } else if (path.includes('/phase-3/')) {
        this.currentPhase = 'phase-3';
        this.extractSubsection(path, ['react-development', 'web3-integration']);
      }
    } else if (path.includes('/node-guides/')) {
      this.currentSection = 'node-guides';
      
      if (path.includes('/procurement-provisioning/')) {
        this.currentPhase = 'procurement-provisioning';
        this.extractSubsection(path, ['vps-selection', 'hardware-requirements', 'cost-estimation']);
      } else if (path.includes('/server-security/')) {
        this.currentPhase = 'server-security';
        this.extractSubsection(path, ['secure-connections', 'firewall-config', 'system-hardening']);
      } else if (path.includes('/installation/')) {
        this.currentPhase = 'installation';
        this.extractSubsection(path, ['download-verification', 'configuration', 'setup-wizard']);
      } else if (path.includes('/synchronization/')) {
        this.currentPhase = 'synchronization';
        this.extractSubsection(path, ['monitoring', 'testing', 'maintenance']);
      }
    }

    // Mark as started if not already
    if (this.currentSection && this.currentPhase) {
      this.markPhaseStarted(this.currentSection, this.currentPhase);
    }
  }

  /**
   * Extract subsection from path
   */
  extractSubsection(path, possibleSubsections) {
    for (const subsection of possibleSubsections) {
      if (path.includes(`/${subsection}.html`) || path.includes(`/${subsection}/`)) {
        this.currentSubsection = subsection;
        break;
      }
    }
  }

  /**
   * Setup event listeners for progress tracking
   */
  setupEventListeners() {
    // Mark subsection as completed when user scrolls to bottom
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.checkScrollCompletion();
      }, 1000);
    });

    // Track time spent on page
    this.startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      this.trackTimeSpent();
    });

    // Listen for manual completion buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('mark-complete-btn')) {
        e.preventDefault();
        const section = e.target.dataset.section;
        const phase = e.target.dataset.phase;
        const subsection = e.target.dataset.subsection;
        
        if (subsection) {
          this.markSubsectionCompleted(section, phase, subsection);
        } else if (phase) {
          this.markPhaseCompleted(section, phase);
        }
      }
      
      if (e.target.classList.contains('bookmark-btn')) {
        e.preventDefault();
        this.toggleBookmark();
      }
    });
  }

  /**
   * Check if user has scrolled to bottom of content
   */
  checkScrollCompletion() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 0.9; // 90% of page

    if (scrollPosition >= documentHeight * threshold) {
      if (this.currentSection && this.currentPhase && this.currentSubsection) {
        this.markSubsectionCompleted(this.currentSection, this.currentPhase, this.currentSubsection);
      }
    }
  }

  /**
   * Track time spent on current page
   */
  trackTimeSpent() {
    if (this.startTime) {
      const timeSpent = Date.now() - this.startTime;
      this.progress.metadata.totalTimeSpent += timeSpent;
      this.saveProgress();
    }
  }

  /**
   * Mark a phase as started
   */
  markPhaseStarted(section, phase) {
    if (!this.progress[section] || !this.progress[section][phase]) {
      return;
    }

    if (!this.progress[section][phase].startedAt) {
      this.progress[section][phase].startedAt = new Date().toISOString();
      
      if (!this.progress.metadata.startedAt) {
        this.progress.metadata.startedAt = new Date().toISOString();
      }
      
      this.saveProgress();
      this.updateProgressDisplay();
    }
  }

  /**
   * Mark a subsection as completed
   */
  markSubsectionCompleted(section, phase, subsection) {
    if (!this.progress[section] || !this.progress[section][phase]) {
      return;
    }

    if (!this.progress[section][phase].subsections[subsection]) {
      this.progress[section][phase].subsections[subsection] = {
        completed: true,
        completedAt: new Date().toISOString()
      };

      this.saveProgress();
      this.updateProgressDisplay();
      this.showCompletionNotification(`Completed: ${this.formatSubsectionName(subsection)}`);
      
      // Check if all subsections in phase are completed
      this.checkPhaseCompletion(section, phase);
    }
  }

  /**
   * Mark a phase as completed
   */
  markPhaseCompleted(section, phase) {
    if (!this.progress[section] || !this.progress[section][phase]) {
      return;
    }

    this.progress[section][phase].completed = true;
    this.progress[section][phase].completedAt = new Date().toISOString();
    
    this.saveProgress();
    this.updateProgressDisplay();
    this.showCompletionNotification(`Phase Completed: ${this.formatPhaseName(phase)}`);
  }

  /**
   * Check if all subsections in a phase are completed
   */
  checkPhaseCompletion(section, phase) {
    const phaseData = this.progress[section][phase];
    const expectedSubsections = this.getExpectedSubsections(section, phase);
    
    const completedSubsections = Object.keys(phaseData.subsections).filter(
      subsection => phaseData.subsections[subsection].completed
    );

    if (completedSubsections.length >= expectedSubsections.length && !phaseData.completed) {
      this.markPhaseCompleted(section, phase);
    }
  }

  /**
   * Get expected subsections for a phase
   */
  getExpectedSubsections(section, phase) {
    const subsections = {
      'development-roadmap': {
        'phase-1': ['database-schemas', 'payment-gateways', 'self-hosted-nodes'],
        'phase-2': ['api-development', 'security-implementation'],
        'phase-3': ['react-development', 'web3-integration']
      },
      'node-guides': {
        'procurement-provisioning': ['vps-selection', 'hardware-requirements', 'cost-estimation'],
        'server-security': ['secure-connections', 'firewall-config', 'system-hardening'],
        'installation': ['download-verification', 'configuration', 'setup-wizard'],
        'synchronization': ['monitoring', 'testing', 'maintenance']
      }
    };

    return subsections[section]?.[phase] || [];
  }

  /**
   * Toggle bookmark for current page
   */
  toggleBookmark() {
    if (!this.currentSection || !this.currentPhase) {
      return;
    }

    const bookmark = {
      section: this.currentSection,
      phase: this.currentPhase,
      subsection: this.currentSubsection,
      url: window.location.pathname,
      title: document.title,
      addedAt: new Date().toISOString()
    };

    const existingIndex = this.bookmarks.findIndex(b => 
      b.section === bookmark.section && 
      b.phase === bookmark.phase && 
      b.subsection === bookmark.subsection
    );

    if (existingIndex >= 0) {
      this.bookmarks.splice(existingIndex, 1);
      this.showNotification('Bookmark removed');
    } else {
      this.bookmarks.push(bookmark);
      this.showNotification('Bookmark added');
    }

    this.saveBookmarks();
    this.updateBookmarkButton();
  }

  /**
   * Check if current page is bookmarked
   */
  isCurrentPageBookmarked() {
    return this.bookmarks.some(b => 
      b.section === this.currentSection && 
      b.phase === this.currentPhase && 
      b.subsection === this.currentSubsection
    );
  }

  /**
   * Update progress display elements
   */
  updateProgressDisplay() {
    this.updateProgressBars();
    this.updateProgressStats();
    this.updateBookmarkButton();
  }

  /**
   * Update progress bars
   */
  updateProgressBars() {
    // Update section progress bars
    ['development-roadmap', 'node-guides'].forEach(section => {
      const progressBar = document.querySelector(`[data-progress-section="${section}"]`);
      if (progressBar) {
        const percentage = this.getSectionProgress(section);
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
      }
    });

    // Update phase progress bars
    Object.keys(this.progress).forEach(section => {
      if (section === 'metadata') return;
      
      Object.keys(this.progress[section]).forEach(phase => {
        const progressBar = document.querySelector(`[data-progress-phase="${section}-${phase}"]`);
        if (progressBar) {
          const percentage = this.getPhaseProgress(section, phase);
          progressBar.style.width = `${percentage}%`;
          progressBar.setAttribute('aria-valuenow', percentage);
        }
      });
    });
  }

  /**
   * Update progress statistics
   */
  updateProgressStats() {
    const totalProgress = this.getTotalProgress();
    const statsElement = document.getElementById('progress-stats');
    
    if (statsElement) {
      statsElement.innerHTML = `
        <div class="progress-stat">
          <span class="progress-stat-label">Overall Progress</span>
          <span class="progress-stat-value">${Math.round(totalProgress)}%</span>
        </div>
        <div class="progress-stat">
          <span class="progress-stat-label">Time Spent</span>
          <span class="progress-stat-value">${this.formatTimeSpent(this.progress.metadata.totalTimeSpent)}</span>
        </div>
        <div class="progress-stat">
          <span class="progress-stat-label">Bookmarks</span>
          <span class="progress-stat-value">${this.bookmarks.length}</span>
        </div>
      `;
    }
  }

  /**
   * Update bookmark button state
   */
  updateBookmarkButton() {
    const bookmarkBtn = document.querySelector('.bookmark-btn');
    if (bookmarkBtn) {
      const isBookmarked = this.isCurrentPageBookmarked();
      bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
      bookmarkBtn.innerHTML = isBookmarked ? '🔖 Bookmarked' : '📖 Bookmark';
    }
  }

  /**
   * Get section progress percentage
   */
  getSectionProgress(section) {
    if (!this.progress[section]) return 0;
    
    const phases = Object.keys(this.progress[section]);
    const completedPhases = phases.filter(phase => this.progress[section][phase].completed);
    
    return phases.length > 0 ? (completedPhases.length / phases.length) * 100 : 0;
  }

  /**
   * Get phase progress percentage
   */
  getPhaseProgress(section, phase) {
    if (!this.progress[section] || !this.progress[section][phase]) return 0;
    
    const expectedSubsections = this.getExpectedSubsections(section, phase);
    const completedSubsections = Object.keys(this.progress[section][phase].subsections).filter(
      subsection => this.progress[section][phase].subsections[subsection].completed
    );
    
    return expectedSubsections.length > 0 ? (completedSubsections.length / expectedSubsections.length) * 100 : 0;
  }

  /**
   * Get total progress percentage
   */
  getTotalProgress() {
    const sections = ['development-roadmap', 'node-guides'];
    const sectionProgresses = sections.map(section => this.getSectionProgress(section));
    
    return sectionProgresses.reduce((sum, progress) => sum + progress, 0) / sections.length;
  }

  /**
   * Format time spent in human readable format
   */
  formatTimeSpent(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return '< 1m';
    }
  }

  /**
   * Format phase name for display
   */
  formatPhaseName(phase) {
    const phaseNames = {
      'phase-1': 'Phase 1: Foundational Infrastructure',
      'phase-2': 'Phase 2: Backend & APIs',
      'phase-3': 'Phase 3: Frontend & UI',
      'procurement-provisioning': 'Procurement & Provisioning',
      'server-security': 'Server Foundation & Security',
      'installation': 'Node Software Installation',
      'synchronization': 'Blockchain Synchronization'
    };
    
    return phaseNames[phase] || phase;
  }

  /**
   * Format subsection name for display
   */
  formatSubsectionName(subsection) {
    return subsection.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Show completion notification
   */
  showCompletionNotification(message) {
    this.showNotification(message, 'success');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Export progress data
   */
  exportProgress() {
    return {
      progress: this.progress,
      bookmarks: this.bookmarks,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import progress data
   */
  importProgress(data) {
    try {
      if (data.progress) {
        this.progress = data.progress;
        this.saveProgress();
      }
      
      if (data.bookmarks) {
        this.bookmarks = data.bookmarks;
        this.saveBookmarks();
      }
      
      this.updateProgressDisplay();
      this.showNotification('Progress imported successfully', 'success');
    } catch (error) {
      console.error('Error importing progress:', error);
      this.showNotification('Error importing progress', 'error');
    }
  }

  /**
   * Reset all progress
   */
  resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.bookmarksKey);
      this.progress = this.loadProgress();
      this.bookmarks = this.loadBookmarks();
      this.updateProgressDisplay();
      this.showNotification('Progress reset successfully', 'success');
    }
  }
}

// Initialize progress tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.progressTracker = new ProgressTracker();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressTracker;
}
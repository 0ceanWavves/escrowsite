/**
 * Bookmark Module
 * Manages user bookmarks for guides and pages with localStorage persistence
 */

class BookmarkManager {
  constructor() {
    this.storageKey = 'crypto-guide-bookmarks';
    this.bookmarks = this.loadBookmarks();
    this.currentPage = this.getCurrentPageInfo();
    
    this.init();
  }

  /**
   * Initialize the bookmark manager
   */
  init() {
    this.setupEventListeners();
    this.updateBookmarkButtons();
    console.log('Bookmark manager initialized');
  }

  /**
   * Load bookmarks from localStorage
   */
  loadBookmarks() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
    
    return [];
  }

  /**
   * Save bookmarks to localStorage
   */
  saveBookmarks() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }

  /**
   * Get current page information
   */
  getCurrentPageInfo() {
    const path = window.location.pathname;
    const title = document.title;
    
    // Parse URL to determine section, phase, and subsection
    let section = null;
    let phase = null;
    let subsection = null;
    let pageType = 'page';

    if (path.includes('/development-roadmap/')) {
      section = 'development-roadmap';
      pageType = 'guide';
      
      if (path.includes('/phase-1/')) {
        phase = 'phase-1';
        subsection = this.extractSubsection(path, ['database-schemas', 'payment-gateways', 'self-hosted-nodes']);
      } else if (path.includes('/phase-2/')) {
        phase = 'phase-2';
        subsection = this.extractSubsection(path, ['api-development', 'security-implementation']);
      } else if (path.includes('/phase-3/')) {
        phase = 'phase-3';
        subsection = this.extractSubsection(path, ['react-development', 'web3-integration']);
      }
    } else if (path.includes('/node-guides/')) {
      section = 'node-guides';
      pageType = 'guide';
      
      if (path.includes('/procurement-provisioning/')) {
        phase = 'procurement-provisioning';
        subsection = this.extractSubsection(path, ['vps-selection', 'hardware-requirements', 'cost-estimation']);
      } else if (path.includes('/server-security/')) {
        phase = 'server-security';
        subsection = this.extractSubsection(path, ['secure-connections', 'firewall-config', 'system-hardening']);
      } else if (path.includes('/installation/')) {
        phase = 'installation';
        subsection = this.extractSubsection(path, ['download-verification', 'configuration', 'setup-wizard']);
      } else if (path.includes('/synchronization/')) {
        phase = 'synchronization';
        subsection = this.extractSubsection(path, ['monitoring', 'testing', 'maintenance']);
      }
    }

    return {
      url: path,
      title: title,
      section: section,
      phase: phase,
      subsection: subsection,
      pageType: pageType,
      hostname: window.location.hostname
    };
  }

  /**
   * Extract subsection from path
   */
  extractSubsection(path, possibleSubsections) {
    for (const subsection of possibleSubsections) {
      if (path.includes(`/${subsection}.html`) || path.includes(`/${subsection}/`)) {
        return subsection;
      }
    }
    return null;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Bookmark button clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('bookmark-btn') || e.target.closest('.bookmark-btn')) {
        e.preventDefault();
        this.toggleBookmark();
      }
      
      if (e.target.classList.contains('remove-bookmark-btn')) {
        e.preventDefault();
        const bookmarkId = e.target.dataset.bookmarkId;
        this.removeBookmark(bookmarkId);
      }
    });

    // Keyboard shortcut (Ctrl+D)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        this.toggleBookmark();
      }
    });
  }

  /**
   * Toggle bookmark for current page
   */
  toggleBookmark() {
    const existingBookmark = this.findBookmark(this.currentPage);
    
    if (existingBookmark) {
      this.removeBookmark(existingBookmark.id);
    } else {
      this.addBookmark(this.currentPage);
    }
  }

  /**
   * Add a bookmark
   */
  addBookmark(pageInfo = null) {
    const info = pageInfo || this.currentPage;
    
    // Don't bookmark if essential info is missing
    if (!info.title || !info.url) {
      this.showNotification('Cannot bookmark this page', 'error');
      return;
    }

    const bookmark = {
      id: this.generateBookmarkId(),
      title: info.title,
      url: info.url,
      section: info.section,
      phase: info.phase,
      subsection: info.subsection,
      pageType: info.pageType,
      addedAt: new Date().toISOString(),
      tags: this.generateTags(info),
      description: this.generateDescription(info)
    };

    this.bookmarks.unshift(bookmark); // Add to beginning
    this.saveBookmarks();
    this.updateBookmarkButtons();
    this.showNotification('Bookmark added', 'success');
    
    return bookmark;
  }

  /**
   * Remove a bookmark
   */
  removeBookmark(bookmarkId) {
    const index = this.bookmarks.findIndex(b => b.id === bookmarkId);
    
    if (index >= 0) {
      this.bookmarks.splice(index, 1);
      this.saveBookmarks();
      this.updateBookmarkButtons();
      this.showNotification('Bookmark removed', 'info');
      
      // Update bookmark list if visible
      this.updateBookmarkList();
      return true;
    }
    
    return false;
  }

  /**
   * Find existing bookmark for page
   */
  findBookmark(pageInfo) {
    return this.bookmarks.find(bookmark => 
      bookmark.url === pageInfo.url ||
      (bookmark.section === pageInfo.section && 
       bookmark.phase === pageInfo.phase && 
       bookmark.subsection === pageInfo.subsection)
    );
  }

  /**
   * Check if current page is bookmarked
   */
  isCurrentPageBookmarked() {
    return !!this.findBookmark(this.currentPage);
  }

  /**
   * Generate unique bookmark ID
   */
  generateBookmarkId() {
    return 'bookmark_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate tags for bookmark
   */
  generateTags(pageInfo) {
    const tags = [];
    
    if (pageInfo.section) {
      tags.push(pageInfo.section);
    }
    
    if (pageInfo.phase) {
      tags.push(pageInfo.phase);
    }
    
    if (pageInfo.subsection) {
      tags.push(pageInfo.subsection);
    }
    
    tags.push(pageInfo.pageType);
    
    // Add content-based tags
    const title = pageInfo.title.toLowerCase();
    if (title.includes('bitcoin')) tags.push('bitcoin');
    if (title.includes('monero')) tags.push('monero');
    if (title.includes('security')) tags.push('security');
    if (title.includes('setup')) tags.push('setup');
    if (title.includes('configuration')) tags.push('configuration');
    if (title.includes('installation')) tags.push('installation');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Generate description for bookmark
   */
  generateDescription(pageInfo) {
    const descriptions = {
      'development-roadmap': 'Crypto development guide',
      'node-guides': 'Node setup tutorial',
      'phase-1': 'Foundational Infrastructure',
      'phase-2': 'Backend & APIs',
      'phase-3': 'Frontend & UI',
      'procurement-provisioning': 'Procurement & Provisioning',
      'server-security': 'Server Foundation & Security',
      'installation': 'Node Software Installation',
      'synchronization': 'Blockchain Synchronization'
    };
    
    let description = '';
    
    if (pageInfo.section && descriptions[pageInfo.section]) {
      description = descriptions[pageInfo.section];
    }
    
    if (pageInfo.phase && descriptions[pageInfo.phase]) {
      description += ` - ${descriptions[pageInfo.phase]}`;
    }
    
    return description || 'Bookmarked page';
  }

  /**
   * Update bookmark button states
   */
  updateBookmarkButtons() {
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    const isBookmarked = this.isCurrentPageBookmarked();
    
    bookmarkBtns.forEach(btn => {
      btn.classList.toggle('bookmarked', isBookmarked);
      
      if (isBookmarked) {
        btn.innerHTML = '🔖 Bookmarked';
        btn.title = 'Remove bookmark (Ctrl+D)';
      } else {
        btn.innerHTML = '📖 Bookmark';
        btn.title = 'Add bookmark (Ctrl+D)';
      }
    });
  }

  /**
   * Get bookmarks by section
   */
  getBookmarksBySection(section) {
    return this.bookmarks.filter(bookmark => bookmark.section === section);
  }

  /**
   * Get bookmarks by tags
   */
  getBookmarksByTags(tags) {
    return this.bookmarks.filter(bookmark => 
      tags.some(tag => bookmark.tags.includes(tag))
    );
  }

  /**
   * Search bookmarks
   */
  searchBookmarks(query) {
    const searchTerm = query.toLowerCase();
    
    return this.bookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(searchTerm) ||
      bookmark.description.toLowerCase().includes(searchTerm) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Sort bookmarks
   */
  sortBookmarks(sortBy = 'addedAt', order = 'desc') {
    const sorted = [...this.bookmarks];
    
    sorted.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'addedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (order === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    return sorted;
  }

  /**
   * Update bookmark list display
   */
  updateBookmarkList() {
    const bookmarkList = document.getElementById('bookmark-list');
    if (!bookmarkList) return;
    
    if (this.bookmarks.length === 0) {
      bookmarkList.innerHTML = `
        <div class="bookmark-empty">
          <p>No bookmarks yet</p>
          <p class="text-sm text-gray-600">Bookmark pages to save them for later</p>
        </div>
      `;
      return;
    }
    
    const bookmarksHTML = this.bookmarks.map(bookmark => `
      <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
        <div class="bookmark-content">
          <h3 class="bookmark-title">
            <a href="${bookmark.url}">${bookmark.title}</a>
          </h3>
          <p class="bookmark-description">${bookmark.description}</p>
          <div class="bookmark-meta">
            <span class="bookmark-date">${this.formatDate(bookmark.addedAt)}</span>
            <div class="bookmark-tags">
              ${bookmark.tags.map(tag => `<span class="bookmark-tag">${tag}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="bookmark-actions">
          <button class="remove-bookmark-btn" data-bookmark-id="${bookmark.id}" title="Remove bookmark">
            ✕
          </button>
        </div>
      </div>
    `).join('');
    
    bookmarkList.innerHTML = bookmarksHTML;
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Export bookmarks
   */
  exportBookmarks() {
    const exportData = {
      bookmarks: this.bookmarks,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `crypto-guide-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showNotification('Bookmarks exported', 'success');
  }

  /**
   * Import bookmarks
   */
  importBookmarks(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (importData.bookmarks && Array.isArray(importData.bookmarks)) {
          // Merge with existing bookmarks, avoiding duplicates
          const existingUrls = new Set(this.bookmarks.map(b => b.url));
          const newBookmarks = importData.bookmarks.filter(b => !existingUrls.has(b.url));
          
          this.bookmarks = [...this.bookmarks, ...newBookmarks];
          this.saveBookmarks();
          this.updateBookmarkButtons();
          this.updateBookmarkList();
          
          this.showNotification(`Imported ${newBookmarks.length} bookmarks`, 'success');
        } else {
          throw new Error('Invalid bookmark file format');
        }
      } catch (error) {
        console.error('Error importing bookmarks:', error);
        this.showNotification('Error importing bookmarks', 'error');
      }
    };
    
    reader.readAsText(file);
  }

  /**
   * Clear all bookmarks
   */
  clearAllBookmarks() {
    if (confirm('Are you sure you want to remove all bookmarks? This cannot be undone.')) {
      this.bookmarks = [];
      this.saveBookmarks();
      this.updateBookmarkButtons();
      this.updateBookmarkList();
      this.showNotification('All bookmarks cleared', 'info');
    }
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
   * Get bookmark statistics
   */
  getBookmarkStats() {
    const stats = {
      total: this.bookmarks.length,
      bySections: {},
      byTags: {},
      recentCount: 0
    };
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    this.bookmarks.forEach(bookmark => {
      // Count by section
      if (bookmark.section) {
        stats.bySections[bookmark.section] = (stats.bySections[bookmark.section] || 0) + 1;
      }
      
      // Count by tags
      bookmark.tags.forEach(tag => {
        stats.byTags[tag] = (stats.byTags[tag] || 0) + 1;
      });
      
      // Count recent bookmarks
      if (new Date(bookmark.addedAt) > oneWeekAgo) {
        stats.recentCount++;
      }
    });
    
    return stats;
  }
}

// Initialize bookmark manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.bookmarkManager = new BookmarkManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookmarkManager;
}
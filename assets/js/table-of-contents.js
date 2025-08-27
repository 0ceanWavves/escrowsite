/**
 * Table of Contents Generator
 * Automatically generates table of contents for long pages with smooth scrolling
 */

class TableOfContents {
  constructor(options = {}) {
    this.options = {
      containerSelector: options.containerSelector || '.content',
      tocSelector: options.tocSelector || '#table-of-contents',
      headingSelectors: options.headingSelectors || 'h1, h2, h3, h4, h5, h6',
      minHeadings: options.minHeadings || 3,
      scrollOffset: options.scrollOffset || 80,
      activeClass: options.activeClass || 'active',
      smoothScroll: options.smoothScroll !== false,
      autoGenerate: options.autoGenerate !== false,
      showNumbers: options.showNumbers !== false,
      collapsible: options.collapsible !== false,
      ...options
    };
    
    this.headings = [];
    this.tocContainer = null;
    this.activeHeading = null;
    this.observer = null;
    
    this.init();
  }

  /**
   * Initialize table of contents
   */
  init() {
    this.findHeadings();
    
    if (this.headings.length >= this.options.minHeadings) {
      this.createTocContainer();
      this.generateToc();
      this.setupScrollSpy();
      this.setupEventListeners();
      
      console.log(`Table of contents generated with ${this.headings.length} headings`);
    }
  }

  /**
   * Find all headings in the content
   */
  findHeadings() {
    const container = document.querySelector(this.options.containerSelector);
    if (!container) {
      console.warn(`Content container not found: ${this.options.containerSelector}`);
      return;
    }

    const headingElements = container.querySelectorAll(this.options.headingSelectors);
    
    this.headings = Array.from(headingElements).map((heading, index) => {
      // Generate ID if not present
      if (!heading.id) {
        heading.id = this.generateHeadingId(heading.textContent, index);
      }
      
      return {
        element: heading,
        id: heading.id,
        text: heading.textContent.trim(),
        level: parseInt(heading.tagName.charAt(1)),
        index: index
      };
    });
  }

  /**
   * Generate unique ID for heading
   */
  generateHeadingId(text, index) {
    const baseId = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const id = baseId || `heading-${index}`;
    
    // Ensure uniqueness
    let finalId = id;
    let counter = 1;
    while (document.getElementById(finalId)) {
      finalId = `${id}-${counter}`;
      counter++;
    }
    
    return finalId;
  }

  /**
   * Create or find TOC container
   */
  createTocContainer() {
    this.tocContainer = document.querySelector(this.options.tocSelector);
    
    if (!this.tocContainer) {
      // Create TOC container if it doesn't exist
      this.tocContainer = document.createElement('div');
      this.tocContainer.id = 'table-of-contents';
      this.tocContainer.className = 'table-of-contents';
      
      // Try to insert in a logical place
      const contentContainer = document.querySelector(this.options.containerSelector);
      if (contentContainer) {
        contentContainer.insertBefore(this.tocContainer, contentContainer.firstChild);
      } else {
        document.body.appendChild(this.tocContainer);
      }
    }
  }

  /**
   * Generate table of contents HTML
   */
  generateToc() {
    if (!this.tocContainer || this.headings.length === 0) return;

    const tocHTML = this.buildTocHTML();
    
    this.tocContainer.innerHTML = `
      <div class="toc-header">
        <h3 class="toc-title">
          <svg class="toc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Table of Contents
        </h3>
        ${this.options.collapsible ? `
          <button class="toc-toggle" aria-label="Toggle table of contents">
            <svg class="toc-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
        ` : ''}
      </div>
      <nav class="toc-nav" role="navigation" aria-label="Table of contents">
        ${tocHTML}
      </nav>
    `;

    // Add CSS classes
    this.tocContainer.classList.add('toc-generated');
    if (this.options.collapsible) {
      this.tocContainer.classList.add('toc-collapsible');
    }
  }

  /**
   * Build TOC HTML structure
   */
  buildTocHTML() {
    if (this.headings.length === 0) return '';

    let html = '<ol class="toc-list">';
    let currentLevel = this.headings[0].level;
    let listStack = [currentLevel];

    this.headings.forEach((heading, index) => {
      const { id, text, level } = heading;
      
      // Handle level changes
      if (level > currentLevel) {
        // Going deeper - open new nested list
        html += '<li><ol class="toc-sublist">';
        listStack.push(level);
      } else if (level < currentLevel) {
        // Going up - close nested lists
        while (listStack.length > 1 && listStack[listStack.length - 1] > level) {
          html += '</ol></li>';
          listStack.pop();
        }
      }

      // Add the heading item
      const number = this.options.showNumbers ? this.getHeadingNumber(index) : '';
      html += `
        <li class="toc-item toc-level-${level}">
          <a href="#${id}" class="toc-link" data-heading-id="${id}">
            ${number ? `<span class="toc-number">${number}</span>` : ''}
            <span class="toc-text">${text}</span>
          </a>
        </li>
      `;

      currentLevel = level;
    });

    // Close any remaining open lists
    while (listStack.length > 1) {
      html += '</ol></li>';
      listStack.pop();
    }

    html += '</ol>';
    return html;
  }

  /**
   * Get heading number for display
   */
  getHeadingNumber(index) {
    // Simple numbering - could be enhanced for hierarchical numbering
    return `${index + 1}.`;
  }

  /**
   * Setup scroll spy to highlight active section
   */
  setupScrollSpy() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, scroll spy disabled');
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: `-${this.options.scrollOffset}px 0px -50% 0px`,
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const headingId = entry.target.id;
        const tocLink = this.tocContainer.querySelector(`[data-heading-id="${headingId}"]`);
        
        if (entry.isIntersecting) {
          this.setActiveHeading(headingId, tocLink);
        }
      });
    }, observerOptions);

    // Observe all headings
    this.headings.forEach(heading => {
      this.observer.observe(heading.element);
    });
  }

  /**
   * Set active heading in TOC
   */
  setActiveHeading(headingId, tocLink) {
    // Remove previous active states
    const previousActive = this.tocContainer.querySelector(`.${this.options.activeClass}`);
    if (previousActive) {
      previousActive.classList.remove(this.options.activeClass);
    }

    // Set new active state
    if (tocLink) {
      tocLink.classList.add(this.options.activeClass);
      this.activeHeading = headingId;
      
      // Scroll TOC to show active item
      this.scrollTocToActive(tocLink);
    }
  }

  /**
   * Scroll TOC to show active item
   */
  scrollTocToActive(activeLink) {
    const tocNav = this.tocContainer.querySelector('.toc-nav');
    if (!tocNav) return;

    const tocRect = tocNav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    
    // Check if link is outside visible area
    if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
      const scrollTop = activeLink.offsetTop - tocNav.offsetTop - (tocNav.clientHeight / 2);
      tocNav.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Handle TOC link clicks
    this.tocContainer.addEventListener('click', (e) => {
      const tocLink = e.target.closest('.toc-link');
      if (tocLink) {
        e.preventDefault();
        this.scrollToHeading(tocLink.dataset.headingId);
      }

      // Handle toggle button
      const toggleBtn = e.target.closest('.toc-toggle');
      if (toggleBtn) {
        this.toggleToc();
      }
    });

    // Handle keyboard navigation
    this.tocContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const tocLink = e.target.closest('.toc-link');
        if (tocLink) {
          e.preventDefault();
          this.scrollToHeading(tocLink.dataset.headingId);
        }
      }
    });

    // Handle window resize
    window.addEventListener('resize', this.debounce(() => {
      this.updateTocPosition();
    }, 250));
  }

  /**
   * Scroll to specific heading
   */
  scrollToHeading(headingId) {
    const heading = document.getElementById(headingId);
    if (!heading) return;

    const targetPosition = heading.getBoundingClientRect().top + window.pageYOffset - this.options.scrollOffset;
    
    if (this.options.smoothScroll) {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, targetPosition);
    }

    // Update URL hash
    if (history.replaceState) {
      history.replaceState(null, null, `#${headingId}`);
    }

    // Focus the heading for accessibility
    heading.focus({ preventScroll: true });
  }

  /**
   * Toggle TOC visibility
   */
  toggleToc() {
    if (!this.options.collapsible) return;

    const tocNav = this.tocContainer.querySelector('.toc-nav');
    const toggleIcon = this.tocContainer.querySelector('.toc-toggle-icon');
    
    if (tocNav && toggleIcon) {
      const isCollapsed = this.tocContainer.classList.contains('toc-collapsed');
      
      if (isCollapsed) {
        this.tocContainer.classList.remove('toc-collapsed');
        toggleIcon.style.transform = 'rotate(0deg)';
      } else {
        this.tocContainer.classList.add('toc-collapsed');
        toggleIcon.style.transform = 'rotate(-90deg)';
      }
    }
  }

  /**
   * Update TOC position (for sticky positioning)
   */
  updateTocPosition() {
    // This method can be extended for dynamic positioning
    const tocRect = this.tocContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Adjust max height if TOC is too tall
    const tocNav = this.tocContainer.querySelector('.toc-nav');
    if (tocNav && tocRect.height > viewportHeight * 0.8) {
      tocNav.style.maxHeight = `${viewportHeight * 0.6}px`;
      tocNav.style.overflowY = 'auto';
    }
  }

  /**
   * Get current active heading
   */
  getActiveHeading() {
    return this.activeHeading;
  }

  /**
   * Refresh TOC (useful for dynamic content)
   */
  refresh() {
    this.destroy();
    this.init();
  }

  /**
   * Destroy TOC
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.tocContainer && this.tocContainer.classList.contains('toc-generated')) {
      this.tocContainer.remove();
    }
    
    this.headings = [];
    this.activeHeading = null;
  }

  /**
   * Utility: Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Auto-initialize on pages with long content
document.addEventListener('DOMContentLoaded', () => {
  // Check if page has enough headings to warrant a TOC
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  if (headings.length >= 3) {
    window.tableOfContents = new TableOfContents({
      containerSelector: '.content, main, article, .guide-content',
      autoGenerate: true
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TableOfContents;
}
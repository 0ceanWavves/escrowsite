/**
 * Contextual Links Module
 * Provides related content suggestions and contextual navigation
 */

class ContextualLinks {
  constructor() {
    this.contentMap = new Map();
    this.currentPage = null;
    this.relatedContent = [];
    this.contextualSuggestions = [];
    
    this.init();
  }

  /**
   * Initialize contextual links system
   */
  async init() {
    await this.loadContentMap();
    this.detectCurrentPage();
    this.generateRelatedContent();
    this.setupContextualSuggestions();
    this.renderSuggestions();
    
    console.log('Contextual links initialized');
  }

  /**
   * Load content mapping data
   */
  async loadContentMap() {
    try {
      // Try to load from search index first
      const response = await fetch('/data/search-index.json');
      if (response.ok) {
        const data = await response.json();
        this.buildContentMapFromIndex(data.searchIndex);
      } else {
        // Fallback to manual content mapping
        this.buildManualContentMap();
      }
    } catch (error) {
      console.error('Error loading content map:', error);
      this.buildManualContentMap();
    }
  }

  /**
   * Build content map from search index
   */
  buildContentMapFromIndex(searchIndex) {
    searchIndex.forEach(item => {
      this.contentMap.set(item.url, {
        title: item.title,
        description: item.description,
        section: item.section,
        phase: item.phase,
        type: item.type,
        keywords: item.keywords,
        difficulty: item.difficulty || 'intermediate',
        estimatedTime: item.estimatedTime || '10-15 minutes',
        prerequisites: item.prerequisites || [],
        relatedTopics: item.relatedTopics || []
      });
    });
  }

  /**
   * Build manual content map (fallback)
   */
  buildManualContentMap() {
    const manualMap = {
      '/': {
        title: 'The Road to Crypto - Home',
        description: 'Your comprehensive guide to crypto development and node setup',
        section: 'home',
        type: 'overview',
        keywords: ['crypto', 'development', 'node', 'guide'],
        relatedTopics: ['development-roadmap', 'node-guides']
      },
      '/development-roadmap/': {
        title: 'Development Roadmap',
        description: 'Complete roadmap for crypto development',
        section: 'development-roadmap',
        type: 'overview',
        keywords: ['development', 'roadmap', 'crypto', 'programming'],
        relatedTopics: ['phase-1', 'phase-2', 'phase-3']
      },
      '/node-guides/': {
        title: 'Node Setup Guides',
        description: 'Comprehensive guides for setting up BTC & XMR nodes',
        section: 'node-guides',
        type: 'overview',
        keywords: ['node', 'setup', 'bitcoin', 'monero', 'server'],
        relatedTopics: ['procurement-provisioning', 'server-security', 'installation', 'synchronization']
      },
      // Add more manual mappings as needed
    };

    Object.entries(manualMap).forEach(([url, data]) => {
      this.contentMap.set(url, data);
    });
  }

  /**
   * Detect current page context
   */
  detectCurrentPage() {
    const path = window.location.pathname;
    this.currentPage = this.contentMap.get(path) || this.inferPageContext(path);
  }

  /**
   * Infer page context from URL
   */
  inferPageContext(path) {
    let section = 'general';
    let phase = null;
    let type = 'guide';

    if (path.includes('/development-roadmap/')) {
      section = 'development-roadmap';
      if (path.includes('/phase-1/')) phase = 'phase-1';
      else if (path.includes('/phase-2/')) phase = 'phase-2';
      else if (path.includes('/phase-3/')) phase = 'phase-3';
    } else if (path.includes('/node-guides/')) {
      section = 'node-guides';
      if (path.includes('/procurement-provisioning/')) phase = 'procurement-provisioning';
      else if (path.includes('/server-security/')) phase = 'server-security';
      else if (path.includes('/installation/')) phase = 'installation';
      else if (path.includes('/synchronization/')) phase = 'synchronization';
    }

    return {
      title: document.title,
      description: this.extractPageDescription(),
      section,
      phase,
      type,
      keywords: this.extractKeywords(),
      url: path
    };
  }

  /**
   * Extract page description from meta tags or content
   */
  extractPageDescription() {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) return metaDesc.content;

    const firstParagraph = document.querySelector('p');
    if (firstParagraph) {
      return firstParagraph.textContent.substring(0, 150) + '...';
    }

    return '';
  }

  /**
   * Extract keywords from page content
   */
  extractKeywords() {
    const keywords = [];
    const title = document.title.toLowerCase();
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.toLowerCase());
    
    // Common crypto/tech keywords
    const commonKeywords = [
      'bitcoin', 'btc', 'monero', 'xmr', 'node', 'server', 'security',
      'installation', 'configuration', 'development', 'api', 'database',
      'frontend', 'backend', 'blockchain', 'cryptocurrency', 'wallet'
    ];

    commonKeywords.forEach(keyword => {
      if (title.includes(keyword) || headings.some(h => h.includes(keyword))) {
        keywords.push(keyword);
      }
    });

    return keywords;
  }

  /**
   * Generate related content suggestions
   */
  generateRelatedContent() {
    if (!this.currentPage) return;

    const related = [];
    const currentSection = this.currentPage.section;
    const currentPhase = this.currentPage.phase;
    const currentKeywords = this.currentPage.keywords || [];

    this.contentMap.forEach((content, url) => {
      if (url === window.location.pathname) return;

      let relevanceScore = 0;

      // Same section bonus
      if (content.section === currentSection) {
        relevanceScore += 3;
      }

      // Same phase bonus
      if (content.phase === currentPhase) {
        relevanceScore += 2;
      }

      // Keyword matching
      const matchingKeywords = content.keywords?.filter(k => 
        currentKeywords.includes(k)
      ) || [];
      relevanceScore += matchingKeywords.length;

      // Related topics matching
      if (content.relatedTopics?.includes(currentPhase) || 
          this.currentPage.relatedTopics?.includes(content.phase)) {
        relevanceScore += 2;
      }

      if (relevanceScore > 0) {
        related.push({
          ...content,
          url,
          relevanceScore
        });
      }
    });

    // Sort by relevance and take top suggestions
    this.relatedContent = related
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);
  }

  /**
   * Setup contextual suggestions based on page content
   */
  setupContextualSuggestions() {
    this.contextualSuggestions = [];

    if (!this.currentPage) return;

    const { section, phase } = this.currentPage;

    // Add navigation suggestions based on current context
    if (section === 'development-roadmap') {
      this.addDevelopmentSuggestions(phase);
    } else if (section === 'node-guides') {
      this.addNodeGuideSuggestions(phase);
    }

    // Add cross-section suggestions
    this.addCrossSectionSuggestions(section);
  }

  /**
   * Add development roadmap specific suggestions
   */
  addDevelopmentSuggestions(currentPhase) {
    const phases = ['phase-1', 'phase-2', 'phase-3'];
    const phaseNames = {
      'phase-1': 'Foundational Infrastructure',
      'phase-2': 'Backend & APIs',
      'phase-3': 'Frontend & UI'
    };

    phases.forEach(phase => {
      if (phase !== currentPhase) {
        this.contextualSuggestions.push({
          title: `Phase ${phase.split('-')[1]}: ${phaseNames[phase]}`,
          url: `/development-roadmap/${phase}/`,
          type: 'next-phase',
          description: `Continue your development journey with ${phaseNames[phase]}`,
          icon: '🚀'
        });
      }
    });

    // Suggest node guides as practical application
    this.contextualSuggestions.push({
      title: 'Apply Your Skills: Node Setup',
      url: '/node-guides/',
      type: 'cross-section',
      description: 'Put your development knowledge into practice by setting up crypto nodes',
      icon: '⚙️'
    });
  }

  /**
   * Add node guide specific suggestions
   */
  addNodeGuideSuggestions(currentPhase) {
    const phases = ['procurement-provisioning', 'server-security', 'installation', 'synchronization'];
    const phaseNames = {
      'procurement-provisioning': 'Procurement & Provisioning',
      'server-security': 'Server Foundation & Security',
      'installation': 'Node Software Installation',
      'synchronization': 'Blockchain Synchronization'
    };

    // Suggest next phase in sequence
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex >= 0 && currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      this.contextualSuggestions.push({
        title: `Next: ${phaseNames[nextPhase]}`,
        url: `/node-guides/${nextPhase}/`,
        type: 'next-phase',
        description: `Continue with ${phaseNames[nextPhase]}`,
        icon: '➡️'
      });
    }

    // Suggest previous phase for reference
    if (currentIndex > 0) {
      const prevPhase = phases[currentIndex - 1];
      this.contextualSuggestions.push({
        title: `Review: ${phaseNames[prevPhase]}`,
        url: `/node-guides/${prevPhase}/`,
        type: 'previous-phase',
        description: `Review ${phaseNames[prevPhase]}`,
        icon: '⬅️'
      });
    }

    // Suggest development roadmap for background knowledge
    this.contextualSuggestions.push({
      title: 'Learn the Fundamentals',
      url: '/development-roadmap/',
      type: 'cross-section',
      description: 'Build foundational development skills for better node management',
      icon: '📚'
    });
  }

  /**
   * Add cross-section suggestions
   */
  addCrossSectionSuggestions(currentSection) {
    if (currentSection !== 'home') {
      this.contextualSuggestions.push({
        title: 'Back to Home',
        url: '/',
        type: 'navigation',
        description: 'Return to the main page',
        icon: '🏠'
      });
    }

    // Add progress tracking suggestion
    this.contextualSuggestions.push({
      title: 'Track Your Progress',
      url: '/user-progress.html',
      type: 'utility',
      description: 'View your learning progress and bookmarks',
      icon: '📊'
    });

    // Add search suggestion
    this.contextualSuggestions.push({
      title: 'Search Content',
      url: '/search.html',
      type: 'utility',
      description: 'Find specific topics and information',
      icon: '🔍'
    });
  }

  /**
   * Render suggestions on the page
   */
  renderSuggestions() {
    this.renderRelatedContent();
    this.renderContextualSuggestions();
    this.renderInlineLinks();
  }

  /**
   * Render related content section
   */
  renderRelatedContent() {
    if (this.relatedContent.length === 0) return;

    const container = this.createOrFindContainer('related-content', 'Related Content');
    
    const relatedHTML = this.relatedContent.map(content => `
      <div class="related-item">
        <a href="${content.url}" class="related-link">
          <div class="related-header">
            <h4 class="related-title">${content.title}</h4>
            <span class="related-type">${this.formatType(content.type)}</span>
          </div>
          <p class="related-description">${content.description}</p>
          <div class="related-meta">
            ${content.difficulty ? `<span class="related-difficulty">${content.difficulty}</span>` : ''}
            ${content.estimatedTime ? `<span class="related-time">${content.estimatedTime}</span>` : ''}
          </div>
        </a>
      </div>
    `).join('');

    container.innerHTML = `
      <h3 class="suggestions-title">
        <svg class="suggestions-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        Related Content
      </h3>
      <div class="related-grid">
        ${relatedHTML}
      </div>
    `;
  }

  /**
   * Render contextual suggestions
   */
  renderContextualSuggestions() {
    if (this.contextualSuggestions.length === 0) return;

    const container = this.createOrFindContainer('contextual-suggestions', 'Quick Navigation');
    
    const suggestionsHTML = this.contextualSuggestions.map(suggestion => `
      <a href="${suggestion.url}" class="contextual-link contextual-${suggestion.type}">
        <span class="contextual-icon">${suggestion.icon}</span>
        <div class="contextual-content">
          <span class="contextual-title">${suggestion.title}</span>
          <span class="contextual-description">${suggestion.description}</span>
        </div>
      </a>
    `).join('');

    container.innerHTML = `
      <h3 class="suggestions-title">
        <svg class="suggestions-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
        Quick Navigation
      </h3>
      <div class="contextual-grid">
        ${suggestionsHTML}
      </div>
    `;
  }

  /**
   * Render inline contextual links within content
   */
  renderInlineLinks() {
    const contentContainer = document.querySelector('.content, main, article');
    if (!contentContainer) return;

    // Find text that could be enhanced with contextual links
    const textNodes = this.getTextNodes(contentContainer);
    
    textNodes.forEach(node => {
      this.enhanceTextWithLinks(node);
    });
  }

  /**
   * Get all text nodes in container
   */
  getTextNodes(container) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip nodes inside links, code blocks, etc.
          const parent = node.parentElement;
          if (parent.tagName === 'A' || parent.tagName === 'CODE' || 
              parent.tagName === 'PRE' || parent.classList.contains('no-enhance')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim().length > 10) {
        textNodes.push(node);
      }
    }

    return textNodes;
  }

  /**
   * Enhance text with contextual links
   */
  enhanceTextWithLinks(textNode) {
    const text = textNode.textContent;
    let enhancedText = text;
    let hasChanges = false;

    // Define terms to link
    const linkableTerms = {
      'Bitcoin node': '/node-guides/installation/',
      'Monero node': '/node-guides/installation/',
      'server security': '/node-guides/server-security/',
      'VPS setup': '/node-guides/procurement-provisioning/',
      'blockchain sync': '/node-guides/synchronization/',
      'development roadmap': '/development-roadmap/',
      'API development': '/development-roadmap/phase-2/',
      'database setup': '/development-roadmap/phase-1/',
      'frontend development': '/development-roadmap/phase-3/'
    };

    Object.entries(linkableTerms).forEach(([term, url]) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(text) && !text.includes(`href="${url}"`)) {
        enhancedText = enhancedText.replace(regex, `<a href="${url}" class="contextual-inline-link">${term}</a>`);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = enhancedText;
      textNode.parentNode.replaceChild(wrapper, textNode);
    }
  }

  /**
   * Create or find container for suggestions
   */
  createOrFindContainer(id, title) {
    let container = document.getElementById(id);
    
    if (!container) {
      container = document.createElement('div');
      container.id = id;
      container.className = 'suggestions-container';
      
      // Try to insert at the end of main content
      const mainContent = document.querySelector('.content, main, article');
      if (mainContent) {
        mainContent.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
    }
    
    return container;
  }

  /**
   * Format content type for display
   */
  formatType(type) {
    const typeMap = {
      'overview': 'Overview',
      'guide': 'Guide',
      'phase': 'Phase',
      'tutorial': 'Tutorial'
    };
    
    return typeMap[type] || type;
  }

  /**
   * Update suggestions for new page
   */
  updateForNewPage() {
    this.detectCurrentPage();
    this.generateRelatedContent();
    this.setupContextualSuggestions();
    this.renderSuggestions();
  }

  /**
   * Get suggestions data (for external use)
   */
  getSuggestions() {
    return {
      related: this.relatedContent,
      contextual: this.contextualSuggestions,
      currentPage: this.currentPage
    };
  }
}

// Initialize contextual links when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.contextualLinks = new ContextualLinks();
});

// Update suggestions on navigation (for SPA-like behavior)
window.addEventListener('popstate', () => {
  if (window.contextualLinks) {
    window.contextualLinks.updateForNewPage();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextualLinks;
}
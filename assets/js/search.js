/**
 * Search Module
 * Provides site-wide search functionality with filtering and highlighting
 */

class SearchEngine {
  constructor() {
    this.searchIndex = null;
    this.isInitialized = false;
    this.searchResults = [];
    this.currentQuery = '';
    this.filters = {
      section: 'all',
      type: 'all'
    };
    
    this.init();
  }

  /**
   * Initialize the search engine
   */
  async init() {
    try {
      await this.loadSearchIndex();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('Search engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize search engine:', error);
    }
  }

  /**
   * Load search index from JSON file
   */
  async loadSearchIndex() {
    try {
      const response = await fetch('/data/search-index.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.searchIndex = data.searchIndex;
      console.log(`Loaded ${this.searchIndex.length} search entries`);
    } catch (error) {
      console.error('Error loading search index:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners for search functionality
   */
  setupEventListeners() {
    // Search input handler
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.performSearch(e.target.value);
      }, 300));

      // Keyboard shortcuts
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.clearSearch();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.navigateToFirstResult();
        }
      });
    }

    // Filter handlers
    const sectionFilter = document.getElementById('section-filter');
    if (sectionFilter) {
      sectionFilter.addEventListener('change', (e) => {
        this.filters.section = e.target.value;
        this.performSearch(this.currentQuery);
      });
    }

    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.filters.type = e.target.value;
        this.performSearch(this.currentQuery);
      });
    }

    // Global keyboard shortcut (Ctrl+K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.focusSearchInput();
      }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        this.hideSearchResults();
      }
    });
  }

  /**
   * Perform search with the given query
   */
  performSearch(query) {
    if (!this.isInitialized || !query.trim()) {
      this.clearSearchResults();
      return;
    }

    this.currentQuery = query.trim().toLowerCase();
    const results = this.searchContent(this.currentQuery);
    this.displaySearchResults(results);
  }

  /**
   * Search through the content index
   */
  searchContent(query) {
    const queryTerms = query.split(/\s+/).filter(term => term.length > 0);
    const results = [];

    this.searchIndex.forEach(item => {
      let score = 0;
      let matchedTerms = 0;

      queryTerms.forEach(term => {
        // Title match (highest weight)
        if (item.title.toLowerCase().includes(term)) {
          score += 10;
          matchedTerms++;
        }

        // Keywords match (high weight)
        if (item.keywords.some(keyword => keyword.toLowerCase().includes(term))) {
          score += 8;
          matchedTerms++;
        }

        // Description match (medium weight)
        if (item.description.toLowerCase().includes(term)) {
          score += 5;
          matchedTerms++;
        }

        // Content match (low weight)
        if (item.content.toLowerCase().includes(term)) {
          score += 2;
          matchedTerms++;
        }
      });

      // Only include results that match at least one term
      if (matchedTerms > 0) {
        // Apply filters
        if (this.filters.section !== 'all' && item.section !== this.filters.section) {
          return;
        }
        if (this.filters.type !== 'all' && item.type !== this.filters.type) {
          return;
        }

        // Boost score for exact matches
        if (item.title.toLowerCase() === query) {
          score += 20;
        }

        results.push({
          ...item,
          score,
          matchedTerms,
          relevance: (matchedTerms / queryTerms.length) * 100
        });
      }
    });

    // Sort by score (descending) and then by relevance
    return results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.relevance - a.relevance;
    }).slice(0, 10); // Limit to top 10 results
  }

  /**
   * Display search results in the UI
   */
  displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    this.searchResults = results;

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p>No results found for "${this.currentQuery}"</p>
          <p class="text-sm text-gray-600">Try different keywords or check your spelling</p>
        </div>
      `;
    } else {
      const resultsHTML = results.map((result, index) => {
        const highlightedTitle = this.highlightText(result.title, this.currentQuery);
        const highlightedDescription = this.highlightText(result.description, this.currentQuery);
        
        return `
          <div class="search-result-item" data-index="${index}" data-url="${result.url}">
            <div class="search-result-header">
              <h3 class="search-result-title">${highlightedTitle}</h3>
              <span class="search-result-type">${this.formatType(result.type)}</span>
            </div>
            <p class="search-result-description">${highlightedDescription}</p>
            <div class="search-result-meta">
              <span class="search-result-section">${this.formatSection(result.section)}</span>
              ${result.phase ? `<span class="search-result-phase">${result.phase}</span>` : ''}
              <span class="search-result-relevance">${Math.round(result.relevance)}% match</span>
            </div>
          </div>
        `;
      }).join('');

      resultsContainer.innerHTML = `
        <div class="search-results-header">
          <p>Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${this.currentQuery}"</p>
        </div>
        <div class="search-results-list">
          ${resultsHTML}
        </div>
      `;

      // Add click handlers to results
      resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const url = item.dataset.url;
          if (url) {
            window.location.href = url;
          }
        });
      });
    }

    this.showSearchResults();
  }

  /**
   * Highlight search terms in text
   */
  highlightText(text, query) {
    if (!query) return text;

    const queryTerms = query.split(/\s+/).filter(term => term.length > 0);
    let highlightedText = text;

    queryTerms.forEach(term => {
      const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return highlightedText;
  }

  /**
   * Escape special regex characters
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Format section name for display
   */
  formatSection(section) {
    const sectionNames = {
      'development-roadmap': 'Development Roadmap',
      'node-guides': 'Node Guides'
    };
    return sectionNames[section] || section;
  }

  /**
   * Format type name for display
   */
  formatType(type) {
    const typeNames = {
      'overview': 'Overview',
      'phase': 'Phase',
      'guide': 'Guide'
    };
    return typeNames[type] || type;
  }

  /**
   * Show search results container
   */
  showSearchResults() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.classList.add('show');
    }
  }

  /**
   * Hide search results container
   */
  hideSearchResults() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.classList.remove('show');
    }
  }

  /**
   * Clear search results
   */
  clearSearchResults() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
    }
    this.hideSearchResults();
    this.searchResults = [];
    this.currentQuery = '';
  }

  /**
   * Clear search input and results
   */
  clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
    }
    this.clearSearchResults();
  }

  /**
   * Focus on search input
   */
  focusSearchInput() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  /**
   * Navigate to first search result
   */
  navigateToFirstResult() {
    if (this.searchResults.length > 0) {
      const firstResult = this.searchResults[0];
      window.location.href = firstResult.url;
    }
  }

  /**
   * Debounce function to limit search frequency
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

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(partialQuery) {
    if (!partialQuery || partialQuery.length < 2) {
      return [];
    }

    const suggestions = new Set();
    const query = partialQuery.toLowerCase();

    this.searchIndex.forEach(item => {
      // Add matching keywords
      item.keywords.forEach(keyword => {
        if (keyword.toLowerCase().startsWith(query)) {
          suggestions.add(keyword);
        }
      });

      // Add matching title words
      const titleWords = item.title.toLowerCase().split(/\s+/);
      titleWords.forEach(word => {
        if (word.startsWith(query)) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }

  /**
   * Export search results (for analytics or debugging)
   */
  exportResults() {
    return {
      query: this.currentQuery,
      results: this.searchResults,
      filters: this.filters,
      timestamp: new Date().toISOString()
    };
  }
}

// Initialize search engine when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.searchEngine = new SearchEngine();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchEngine;
}
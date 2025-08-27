/**
 * Content Loader Module
 * Handles loading and parsing of JSON content data for the crypto website
 */

class ContentLoader {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Load content data from JSON file
   * @param {string} contentType - Type of content ('development-roadmap' or 'node-guides')
   * @param {boolean} useCache - Whether to use cached data (default: true)
   * @returns {Promise<Object>} Parsed content data
   */
  async loadContent(contentType, useCache = true) {
    // Return cached data if available and caching is enabled
    if (useCache && this.cache.has(contentType)) {
      return this.cache.get(contentType);
    }

    // Return existing loading promise if already in progress
    if (this.loadingPromises.has(contentType)) {
      return this.loadingPromises.get(contentType);
    }

    // Create new loading promise
    const loadingPromise = this._fetchContent(contentType);
    this.loadingPromises.set(contentType, loadingPromise);

    try {
      const content = await loadingPromise;
      
      // Cache the loaded content
      this.cache.set(contentType, content);
      
      // Remove from loading promises
      this.loadingPromises.delete(contentType);
      
      return content;
    } catch (error) {
      // Remove failed promise from loading promises
      this.loadingPromises.delete(contentType);
      throw error;
    }
  }

  /**
   * Internal method to fetch content from JSON file
   * @private
   * @param {string} contentType - Type of content to fetch
   * @returns {Promise<Object>} Parsed JSON content
   */
  async _fetchContent(contentType) {
    const validTypes = ['development-roadmap', 'node-guides'];
    
    if (!validTypes.includes(contentType)) {
      throw new Error(`Invalid content type: ${contentType}. Must be one of: ${validTypes.join(', ')}`);
    }

    const url = `/data/${contentType}.json`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - Failed to load ${url}`);
      }
      
      const content = await response.json();
      
      // Validate content structure
      this._validateContent(content, contentType);
      
      return content;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in ${url}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate content structure
   * @private
   * @param {Object} content - Content to validate
   * @param {string} contentType - Type of content being validated
   */
  _validateContent(content, contentType) {
    if (!content || typeof content !== 'object') {
      throw new Error(`Invalid content structure for ${contentType}: content must be an object`);
    }

    if (!content.title || typeof content.title !== 'string') {
      throw new Error(`Invalid content structure for ${contentType}: missing or invalid title`);
    }

    if (!content.phases || !Array.isArray(content.phases)) {
      throw new Error(`Invalid content structure for ${contentType}: missing or invalid phases array`);
    }

    // Validate each phase
    content.phases.forEach((phase, index) => {
      if (!phase.id || typeof phase.id !== 'string') {
        throw new Error(`Invalid phase structure at index ${index}: missing or invalid id`);
      }
      
      if (!phase.title || typeof phase.title !== 'string') {
        throw new Error(`Invalid phase structure at index ${index}: missing or invalid title`);
      }
      
      if (!phase.subsections || !Array.isArray(phase.subsections)) {
        throw new Error(`Invalid phase structure at index ${index}: missing or invalid subsections array`);
      }
    });
  }

  /**
   * Get specific phase by ID
   * @param {string} contentType - Type of content
   * @param {string} phaseId - ID of the phase to retrieve
   * @returns {Promise<Object|null>} Phase object or null if not found
   */
  async getPhase(contentType, phaseId) {
    const content = await this.loadContent(contentType);
    return content.phases.find(phase => phase.id === phaseId) || null;
  }

  /**
   * Get specific subsection by phase ID and subsection ID
   * @param {string} contentType - Type of content
   * @param {string} phaseId - ID of the phase
   * @param {string} subsectionId - ID of the subsection
   * @returns {Promise<Object|null>} Subsection object or null if not found
   */
  async getSubsection(contentType, phaseId, subsectionId) {
    const phase = await this.getPhase(contentType, phaseId);
    if (!phase) return null;
    
    return phase.subsections.find(subsection => subsection.id === subsectionId) || null;
  }

  /**
   * Search content by query string
   * @param {string} contentType - Type of content to search
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching results
   */
  async searchContent(contentType, query) {
    const content = await this.loadContent(contentType);
    const results = [];
    const searchTerm = query.toLowerCase();

    content.phases.forEach(phase => {
      // Search in phase title and description
      if (phase.title.toLowerCase().includes(searchTerm) || 
          phase.description.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'phase',
          contentType,
          phase: phase.id,
          title: phase.title,
          description: phase.description,
          url: `/${contentType}/${phase.id}/`
        });
      }

      // Search in subsections
      phase.subsections.forEach(subsection => {
        if (subsection.title.toLowerCase().includes(searchTerm) ||
            subsection.description.toLowerCase().includes(searchTerm) ||
            subsection.content.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'subsection',
            contentType,
            phase: phase.id,
            subsection: subsection.id,
            title: subsection.title,
            description: subsection.description,
            url: `/${contentType}/${phase.id}/${subsection.id}.html`
          });
        }
      });
    });

    return results;
  }

  /**
   * Get all content types available
   * @returns {Array<string>} Array of available content types
   */
  getAvailableContentTypes() {
    return ['development-roadmap', 'node-guides'];
  }

  /**
   * Clear cache for specific content type or all cache
   * @param {string} [contentType] - Specific content type to clear, or undefined to clear all
   */
  clearCache(contentType) {
    if (contentType) {
      this.cache.delete(contentType);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Preload all content types
   * @returns {Promise<void>} Promise that resolves when all content is loaded
   */
  async preloadAll() {
    const contentTypes = this.getAvailableContentTypes();
    const loadPromises = contentTypes.map(type => this.loadContent(type));
    
    try {
      await Promise.all(loadPromises);
      console.log('All content preloaded successfully');
    } catch (error) {
      console.error('Error preloading content:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      cachedItems: this.cache.size,
      loadingItems: this.loadingPromises.size,
      cachedTypes: Array.from(this.cache.keys())
    };
  }
}

// Create and export singleton instance
const contentLoader = new ContentLoader();

// Export both the class and the singleton instance
export { ContentLoader, contentLoader };

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContentLoader, contentLoader };
}
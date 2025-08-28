/**
 * Language Router Module
 * Handles URL routing and content loading by language
 */

import { i18n } from './i18n.js';
import { contentLoader } from './content-loader.js';

class LanguageRouter {
  constructor() {
    this.currentRoute = null;
    this.routeHistory = [];
    this.maxHistoryLength = 50;
    
    // Route patterns
    this.routePatterns = {
      home: /^\/$/,
      developmentRoadmap: /^\/development-roadmap\/?$/,
      developmentPhase: /^\/development-roadmap\/([^\/]+)\/?$/,
      developmentSubsection: /^\/development-roadmap\/([^\/]+)\/([^\/]+)\.html$/,
      nodeGuides: /^\/node-guides\/?$/,
      nodePhase: /^\/node-guides\/([^\/]+)\/?$/,
      nodeSubsection: /^\/node-guides\/([^\/]+)\/([^\/]+)\.html$/
    };
    
    // Initialize router
    this.initialize();
  }

  /**
   * Initialize the language router
   */
  initialize() {
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', (event) => {
      this.handlePopState(event);
    });
    
    // Listen for language change events
    document.addEventListener('languagechange', (event) => {
      this.handleLanguageChange(event.detail);
    });
    
    // Parse initial route
    this.parseCurrentRoute();
  }

  /**
   * Parse the current URL and extract route information
   * @returns {Object} Route information
   */
  parseCurrentRoute() {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    
    // Extract language from URL parameter or use current i18n language
    const urlLanguage = searchParams.get('lang');
    const language = urlLanguage && i18n.getSupportedLanguages().includes(urlLanguage) 
      ? urlLanguage 
      : i18n.getCurrentLanguage();
    
    // Parse route based on path
    const route = this._parseRoute(path);
    
    this.currentRoute = {
      ...route,
      language,
      path,
      search: window.location.search,
      hash,
      fullUrl: window.location.href
    };
    
    return this.currentRoute;
  } 
 /**
   * Parse route from path
   * @private
   * @param {string} path - URL path
   * @returns {Object} Parsed route information
   */
  _parseRoute(path) {
    // Home page
    if (this.routePatterns.home.test(path)) {
      return { type: 'home', contentType: null, phase: null, subsection: null };
    }
    
    // Development roadmap routes
    const devRoadmapMatch = this.routePatterns.developmentRoadmap.exec(path);
    if (devRoadmapMatch) {
      return { type: 'section', contentType: 'development-roadmap', phase: null, subsection: null };
    }
    
    const devPhaseMatch = this.routePatterns.developmentPhase.exec(path);
    if (devPhaseMatch) {
      return { 
        type: 'phase', 
        contentType: 'development-roadmap', 
        phase: devPhaseMatch[1], 
        subsection: null 
      };
    }
    
    const devSubsectionMatch = this.routePatterns.developmentSubsection.exec(path);
    if (devSubsectionMatch) {
      return { 
        type: 'subsection', 
        contentType: 'development-roadmap', 
        phase: devSubsectionMatch[1], 
        subsection: devSubsectionMatch[2] 
      };
    }
    
    // Node guides routes
    const nodeGuidesMatch = this.routePatterns.nodeGuides.exec(path);
    if (nodeGuidesMatch) {
      return { type: 'section', contentType: 'node-guides', phase: null, subsection: null };
    }
    
    const nodePhaseMatch = this.routePatterns.nodePhase.exec(path);
    if (nodePhaseMatch) {
      return { 
        type: 'phase', 
        contentType: 'node-guides', 
        phase: nodePhaseMatch[1], 
        subsection: null 
      };
    }
    
    const nodeSubsectionMatch = this.routePatterns.nodeSubsection.exec(path);
    if (nodeSubsectionMatch) {
      return { 
        type: 'subsection', 
        contentType: 'node-guides', 
        phase: nodeSubsectionMatch[1], 
        subsection: nodeSubsectionMatch[2] 
      };
    }
    
    // Unknown route
    return { type: 'unknown', contentType: null, phase: null, subsection: null };
  }

  /**
   * Navigate to a new route
   * @param {string} path - Path to navigate to
   * @param {string} [language] - Language for the route
   * @param {boolean} [pushState=true] - Whether to push to browser history
   * @returns {Promise<Object>} Route information and content
   */
  async navigateTo(path, language = null, pushState = true) {
    const targetLanguage = language || i18n.getCurrentLanguage();
    
    // Build URL with language parameter if different from default
    const url = new URL(path, window.location.origin);
    if (targetLanguage !== i18n.defaultLanguage) {
      url.searchParams.set('lang', targetLanguage);
    }
    
    // Update browser history
    if (pushState) {
      // Add current route to history before navigating
      if (this.currentRoute) {
        this._addToHistory(this.currentRoute);
      }
      
      window.history.pushState(
        { path, language: targetLanguage }, 
        '', 
        url.toString()
      );
    }
    
    // Update current route
    this.currentRoute = {
      ...this._parseRoute(path),
      language: targetLanguage,
      path,
      search: url.search,
      hash: url.hash,
      fullUrl: url.toString()
    };
    
    // Set language if different
    if (targetLanguage !== i18n.getCurrentLanguage()) {
      await i18n.setLanguage(targetLanguage);
    }
    
    // Load content for the route
    const content = await this.loadRouteContent(this.currentRoute);
    
    // Emit navigation event
    this._emitNavigationEvent(this.currentRoute, content);
    
    return { route: this.currentRoute, content };
  } 
 /**
   * Load content for a specific route
   * @param {Object} route - Route information
   * @returns {Promise<Object>} Content data
   */
  async loadRouteContent(route) {
    if (!route.contentType) {
      return null;
    }
    
    try {
      // Load base content
      const content = await contentLoader.loadContent(route.contentType);
      
      // Load translations
      const translations = await i18n.loadTranslations(route.language, route.contentType);
      
      // Combine content with translations
      const localizedContent = {
        ...content,
        ...translations,
        language: route.language
      };
      
      // If specific phase or subsection requested, extract it
      if (route.phase) {
        const phase = await contentLoader.getPhase(route.contentType, route.phase);
        if (!phase) {
          throw new Error(`Phase not found: ${route.phase}`);
        }
        
        localizedContent.currentPhase = phase;
        
        if (route.subsection) {
          const subsection = await contentLoader.getSubsection(
            route.contentType, 
            route.phase, 
            route.subsection
          );
          if (!subsection) {
            throw new Error(`Subsection not found: ${route.subsection}`);
          }
          
          localizedContent.currentSubsection = subsection;
        }
      }
      
      return localizedContent;
    } catch (error) {
      console.error('Error loading route content:', error);
      throw error;
    }
  }

  /**
   * Handle popstate event (back/forward navigation)
   * @param {PopStateEvent} event - Popstate event
   */
  async handlePopState(event) {
    try {
      const route = this.parseCurrentRoute();
      const content = await this.loadRouteContent(route);
      
      this._emitNavigationEvent(route, content);
    } catch (error) {
      console.error('Error handling popstate:', error);
    }
  }

  /**
   * Handle language change event
   * @param {Object} languageChangeDetail - Language change event detail
   */
  async handleLanguageChange(languageChangeDetail) {
    const { newLanguage } = languageChangeDetail;
    
    // Update current route language
    if (this.currentRoute) {
      this.currentRoute.language = newLanguage;
      
      // Update URL with new language parameter
      const url = new URL(window.location);
      if (newLanguage !== i18n.defaultLanguage) {
        url.searchParams.set('lang', newLanguage);
      } else {
        url.searchParams.delete('lang');
      }
      
      // Update URL without triggering navigation
      window.history.replaceState(
        { path: this.currentRoute.path, language: newLanguage },
        '',
        url.toString()
      );
      
      // Reload content with new language
      try {
        const content = await this.loadRouteContent(this.currentRoute);
        this._emitNavigationEvent(this.currentRoute, content);
      } catch (error) {
        console.error('Error reloading content after language change:', error);
      }
    }
  }

  /**
   * Add route to history
   * @private
   * @param {Object} route - Route to add to history
   */
  _addToHistory(route) {
    this.routeHistory.push({
      ...route,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.routeHistory.length > this.maxHistoryLength) {
      this.routeHistory.shift();
    }
  }

  /**
   * Emit navigation event
   * @private
   * @param {Object} route - Route information
   * @param {Object} content - Content data
   */
  _emitNavigationEvent(route, content) {
    const event = new CustomEvent('routechange', {
      detail: { route, content }
    });
    
    document.dispatchEvent(event);
  }  /**

   * Generate URL for a route
   * @param {string} contentType - Content type
   * @param {string} [phase] - Phase ID
   * @param {string} [subsection] - Subsection ID
   * @param {string} [language] - Language code
   * @returns {string} Generated URL
   */
  generateUrl(contentType, phase = null, subsection = null, language = null) {
    const targetLanguage = language || i18n.getCurrentLanguage();
    let path = '';
    
    // Build path based on content type and parameters
    if (contentType === 'development-roadmap') {
      path = '/development-roadmap';
      if (phase) {
        path += `/${phase}`;
        if (subsection) {
          path += `/${subsection}.html`;
        }
      }
    } else if (contentType === 'node-guides') {
      path = '/node-guides';
      if (phase) {
        path += `/${phase}`;
        if (subsection) {
          path += `/${subsection}.html`;
        }
      }
    } else {
      path = '/';
    }
    
    // Add language parameter if not default
    const url = new URL(path, window.location.origin);
    if (targetLanguage !== i18n.defaultLanguage) {
      url.searchParams.set('lang', targetLanguage);
    }
    
    return url.toString();
  }

  /**
   * Get current route information
   * @returns {Object} Current route
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Get route history
   * @returns {Array} Route history
   */
  getRouteHistory() {
    return [...this.routeHistory];
  }

  /**
   * Check if a route is valid
   * @param {string} path - Path to validate
   * @returns {boolean} Whether the route is valid
   */
  isValidRoute(path) {
    const route = this._parseRoute(path);
    return route.type !== 'unknown';
  }

  /**
   * Get breadcrumb navigation for current route
   * @returns {Promise<Array>} Breadcrumb items
   */
  async getBreadcrumbs() {
    if (!this.currentRoute || !this.currentRoute.contentType) {
      return [];
    }
    
    const breadcrumbs = [];
    const { contentType, phase, subsection, language } = this.currentRoute;
    
    try {
      // Load translations for breadcrumb labels
      const translations = await i18n.loadTranslations(language, contentType);
      
      // Home
      breadcrumbs.push({
        label: translations.navigation?.home || 'Home',
        url: this.generateUrl(null, null, null, language),
        active: false
      });
      
      // Section
      breadcrumbs.push({
        label: translations.title,
        url: this.generateUrl(contentType, null, null, language),
        active: !phase
      });
      
      // Phase
      if (phase) {
        const content = await contentLoader.loadContent(contentType);
        const phaseData = content.phases.find(p => p.id === phase);
        
        breadcrumbs.push({
          label: phaseData?.title || phase,
          url: this.generateUrl(contentType, phase, null, language),
          active: !subsection
        });
        
        // Subsection
        if (subsection) {
          const subsectionData = phaseData?.subsections.find(s => s.id === subsection);
          
          breadcrumbs.push({
            label: subsectionData?.title || subsection,
            url: this.generateUrl(contentType, phase, subsection, language),
            active: true
          });
        }
      }
      
      return breadcrumbs;
    } catch (error) {
      console.error('Error generating breadcrumbs:', error);
      return [];
    }
  }

  /**
   * Clear route history
   */
  clearHistory() {
    this.routeHistory = [];
  }
}

// Create and export singleton instance
const languageRouter = new LanguageRouter();

// Export both the class and the singleton instance
export { LanguageRouter, languageRouter };

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LanguageRouter, languageRouter };
}
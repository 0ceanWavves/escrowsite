/**
 * Internationalization (i18n) Module
 * Handles translation management and fallback handling for multilingual content
 */

class I18n {
  constructor() {
    this.currentLanguage = 'en';
    this.defaultLanguage = 'en';
    this.supportedLanguages = ['en', 'nl', 'fr'];
    this.translations = new Map();
    this.loadingPromises = new Map();
    
    // Language metadata
    this.languageInfo = {
      en: { name: 'English', nativeName: 'English', flag: '[Placeholder SVG]' },
      nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '[Placeholder SVG]' },
      fr: { name: 'French', nativeName: 'Français', flag: '[Placeholder SVG]' }
    };
    
    // Initialize with browser language or default
    this.currentLanguage = this.detectBrowserLanguage();
  }

  /**
   * Detect browser language preference
   * @returns {string} Detected language code
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    return this.supportedLanguages.includes(langCode) ? langCode : this.defaultLanguage;
  }

  /**
   * Load translations for a specific language and content type
   * @param {string} language - Language code
   * @param {string} contentType - Content type (development-roadmap, node-guides)
   * @returns {Promise<Object>} Translation data
   */
  async loadTranslations(language, contentType) {
    const key = `${language}-${contentType}`;
    
    // Return cached translations if available
    if (this.translations.has(key)) {
      return this.translations.get(key);
    }
    
    // Return existing loading promise if already in progress
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }
    
    // Create new loading promise
    const loadingPromise = this._fetchTranslations(language, contentType);
    this.loadingPromises.set(key, loadingPromise);
    
    try {
      const translations = await loadingPromise;
      
      // Cache the loaded translations
      this.translations.set(key, translations);
      
      // Remove from loading promises
      this.loadingPromises.delete(key);
      
      return translations;
    } catch (error) {
      // Remove failed promise from loading promises
      this.loadingPromises.delete(key);
      
      // Try fallback to default language if not already trying default
      if (language !== this.defaultLanguage) {
        console.warn(`Failed to load ${language} translations for ${contentType}, falling back to ${this.defaultLanguage}`);
        return this.loadTranslations(this.defaultLanguage, contentType);
      }
      
      throw error;
    }
  }  /*
*
   * Internal method to fetch translations from JSON file
   * @private
   * @param {string} language - Language code
   * @param {string} contentType - Content type
   * @returns {Promise<Object>} Translation data
   */
  async _fetchTranslations(language, contentType) {
    if (!this.supportedLanguages.includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    const validContentTypes = ['development-roadmap', 'node-guides'];
    if (!validContentTypes.includes(contentType)) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    
    const url = `/data/${language}/${contentType}.json`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - Failed to load ${url}`);
      }
      
      const translations = await response.json();
      return translations;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in ${url}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get translation for a specific key with fallback support
   * @param {string} contentType - Content type
   * @param {string} key - Translation key (dot notation supported)
   * @param {string} [language] - Language code (defaults to current language)
   * @returns {Promise<string>} Translated text
   */
  async translate(contentType, key, language = this.currentLanguage) {
    try {
      const translations = await this.loadTranslations(language, contentType);
      const value = this._getNestedValue(translations, key);
      
      if (value !== undefined) {
        return value;
      }
      
      // Fallback to default language if not found and not already using default
      if (language !== this.defaultLanguage) {
        return this.translate(contentType, key, this.defaultLanguage);
      }
      
      // Return key if no translation found
      console.warn(`Translation not found: ${key} for ${contentType} in ${language}`);
      return key;
    } catch (error) {
      console.error(`Translation error for ${key}:`, error);
      return key;
    }
  }

  /**
   * Get nested value from object using dot notation
   * @private
   * @param {Object} obj - Object to search in
   * @param {string} key - Dot notation key (e.g., 'navigation.home')
   * @returns {*} Value or undefined
   */
  _getNestedValue(obj, key) {
    return key.split('.').reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : undefined;
    }, obj);
  }

  /**
   * Set current language
   * @param {string} language - Language code to set
   * @returns {Promise<void>}
   */
  async setLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    const previousLanguage = this.currentLanguage;
    this.currentLanguage = language;
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('preferred-language', language);
    } catch (error) {
      console.warn('Could not save language preference to localStorage:', error);
    }
    
    // Emit language change event
    this._emitLanguageChange(language, previousLanguage);
  }  /*
*
   * Get current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   * @returns {Array<string>} Array of supported language codes
   */
  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }

  /**
   * Get language information
   * @param {string} [language] - Language code (defaults to current language)
   * @returns {Object} Language information
   */
  getLanguageInfo(language = this.currentLanguage) {
    return this.languageInfo[language] || this.languageInfo[this.defaultLanguage];
  }

  /**
   * Get all language information
   * @returns {Object} All language information
   */
  getAllLanguageInfo() {
    return { ...this.languageInfo };
  }

  /**
   * Initialize i18n system with stored preferences
   * @returns {Promise<void>}
   */
  async initialize() {
    // Load stored language preference
    try {
      const storedLanguage = localStorage.getItem('preferred-language');
      if (storedLanguage && this.supportedLanguages.includes(storedLanguage)) {
        this.currentLanguage = storedLanguage;
      }
    } catch (error) {
      console.warn('Could not load language preference from localStorage:', error);
    }
    
    // Preload default language translations
    try {
      await Promise.all([
        this.loadTranslations(this.currentLanguage, 'development-roadmap'),
        this.loadTranslations(this.currentLanguage, 'node-guides')
      ]);
    } catch (error) {
      console.error('Failed to preload translations:', error);
    }
  }

  /**
   * Emit language change event
   * @private
   * @param {string} newLanguage - New language code
   * @param {string} previousLanguage - Previous language code
   */
  _emitLanguageChange(newLanguage, previousLanguage) {
    const event = new CustomEvent('languagechange', {
      detail: {
        newLanguage,
        previousLanguage,
        languageInfo: this.getLanguageInfo(newLanguage)
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Format text with variables
   * @param {string} text - Text template with {variable} placeholders
   * @param {Object} variables - Variables to replace in template
   * @returns {string} Formatted text
   */
  formatText(text, variables = {}) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  /**
   * Clear translation cache
   * @param {string} [language] - Specific language to clear, or undefined to clear all
   * @param {string} [contentType] - Specific content type to clear, or undefined to clear all
   */
  clearCache(language, contentType) {
    if (language && contentType) {
      const key = `${language}-${contentType}`;
      this.translations.delete(key);
    } else if (language) {
      // Clear all content types for specific language
      const keysToDelete = Array.from(this.translations.keys())
        .filter(key => key.startsWith(`${language}-`));
      keysToDelete.forEach(key => this.translations.delete(key));
    } else {
      // Clear all cache
      this.translations.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      cachedTranslations: this.translations.size,
      loadingTranslations: this.loadingPromises.size,
      currentLanguage: this.currentLanguage,
      supportedLanguages: this.supportedLanguages.length
    };
  }
}

// Create and export singleton instance
const i18n = new I18n();

// Export both the class and the singleton instance
export { I18n, i18n };

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18n, i18n };
}
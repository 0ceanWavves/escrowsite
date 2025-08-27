/**
 * Content Integration System
 * Merges main content with language-specific translations and ensures consistency
 */

class ContentIntegrator {
  constructor() {
    this.cache = new Map();
    this.supportedLanguages = ['en', 'nl', 'fr'];
    this.defaultLanguage = 'en';
    this.contentTypes = ['development-roadmap', 'node-guides'];
  }

  /**
   * Load and integrate all content for a specific language
   */
  async loadIntegratedContent(contentType, language = 'en') {
    const cacheKey = `${contentType}-${language}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Load main content structure
      const mainContent = await this.loadMainContent(contentType);
      
      // Load language-specific translations
      const translations = await this.loadTranslations(contentType, language);
      
      // Merge content with translations
      const integratedContent = this.mergeContentWithTranslations(mainContent, translations, language);
      
      // Cache the result
      this.cache.set(cacheKey, integratedContent);
      
      return integratedContent;
    } catch (error) {
      console.error(`Failed to load integrated content for ${contentType} in ${language}:`, error);
      
      // Fallback to English if other language fails
      if (language !== this.defaultLanguage) {
        console.log(`Falling back to ${this.defaultLanguage} for ${contentType}`);
        return this.loadIntegratedContent(contentType, this.defaultLanguage);
      }
      
      throw error;
    }
  }

  /**
   * Load main content structure
   */
  async loadMainContent(contentType) {
    const response = await fetch(`/data/${contentType}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load main content: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Load language-specific translations
   */
  async loadTranslations(contentType, language) {
    const response = await fetch(`/data/${language}/${contentType}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${language} translations: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Merge main content with translations
   */
  mergeContentWithTranslations(mainContent, translations, language) {
    const integrated = {
      ...mainContent,
      language: language,
      title: translations.title || mainContent.title,
      description: translations.description || mainContent.description,
      navigation: translations.navigation || {},
      common: translations.common || {},
      phases: this.mergePhases(mainContent.phases, translations.phases || [])
    };

    return integrated;
  }

  /**
   * Merge phase data with translations
   */
  mergePhases(mainPhases, translatedPhases) {
    return mainPhases.map(mainPhase => {
      const translatedPhase = translatedPhases.find(tp => tp.id === mainPhase.id) || {};
      
      return {
        ...mainPhase,
        title: translatedPhase.title || mainPhase.title,
        description: translatedPhase.description || mainPhase.description,
        estimatedTime: translatedPhase.estimatedTime || mainPhase.estimatedTime,
        difficulty: translatedPhase.difficulty || mainPhase.difficulty,
        subsections: this.mergeSubsections(mainPhase.subsections || [], translatedPhase.subsections || [])
      };
    });
  }

  /**
   * Merge subsection data with translations
   */
  mergeSubsections(mainSubsections, translatedSubsections) {
    return mainSubsections.map(mainSubsection => {
      const translatedSubsection = translatedSubsections.find(ts => ts.id === mainSubsection.id) || {};
      
      return {
        ...mainSubsection,
        title: translatedSubsection.title || mainSubsection.title,
        description: translatedSubsection.description || mainSubsection.description,
        content: translatedSubsection.content || mainSubsection.content,
        prerequisites: translatedSubsection.prerequisites || mainSubsection.prerequisites || []
      };
    });
  }

  /**
   * Get all available content types
   */
  getContentTypes() {
    return [...this.contentTypes];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }

  /**
   * Preload all content for better performance
   */
  async preloadAllContent() {
    const loadPromises = [];
    
    for (const contentType of this.contentTypes) {
      for (const language of this.supportedLanguages) {
        loadPromises.push(this.loadIntegratedContent(contentType, language));
      }
    }
    
    try {
      await Promise.all(loadPromises);
      console.log('All content preloaded successfully');
    } catch (error) {
      console.error('Failed to preload some content:', error);
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Validate content integrity
   */
  async validateContentIntegrity() {
    const results = {
      valid: true,
      errors: [],
      warnings: []
    };

    for (const contentType of this.contentTypes) {
      try {
        // Check if main content exists
        await this.loadMainContent(contentType);
        
        // Check if all language translations exist
        for (const language of this.supportedLanguages) {
          try {
            await this.loadTranslations(contentType, language);
          } catch (error) {
            results.warnings.push(`Missing ${language} translation for ${contentType}`);
          }
        }
      } catch (error) {
        results.valid = false;
        results.errors.push(`Missing main content for ${contentType}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Generate content migration report
   */
  async generateMigrationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      contentTypes: {},
      summary: {
        totalPhases: 0,
        totalSubsections: 0,
        translationCompleteness: {}
      }
    };

    for (const contentType of this.contentTypes) {
      try {
        const mainContent = await this.loadMainContent(contentType);
        const phaseCount = mainContent.phases.length;
        const subsectionCount = mainContent.phases.reduce((total, phase) => 
          total + (phase.subsections ? phase.subsections.length : 0), 0);

        report.contentTypes[contentType] = {
          phases: phaseCount,
          subsections: subsectionCount,
          translations: {}
        };

        report.summary.totalPhases += phaseCount;
        report.summary.totalSubsections += subsectionCount;

        // Check translation completeness
        for (const language of this.supportedLanguages) {
          try {
            const translations = await this.loadTranslations(contentType, language);
            const translatedPhases = translations.phases ? translations.phases.length : 0;
            const completeness = Math.round((translatedPhases / phaseCount) * 100);
            
            report.contentTypes[contentType].translations[language] = {
              phases: translatedPhases,
              completeness: `${completeness}%`
            };

            if (!report.summary.translationCompleteness[language]) {
              report.summary.translationCompleteness[language] = [];
            }
            report.summary.translationCompleteness[language].push(completeness);
          } catch (error) {
            report.contentTypes[contentType].translations[language] = {
              error: error.message
            };
          }
        }
      } catch (error) {
        report.contentTypes[contentType] = {
          error: error.message
        };
      }
    }

    // Calculate average translation completeness
    for (const language of this.supportedLanguages) {
      if (report.summary.translationCompleteness[language]) {
        const avg = report.summary.translationCompleteness[language].reduce((a, b) => a + b, 0) / 
                   report.summary.translationCompleteness[language].length;
        report.summary.translationCompleteness[language] = `${Math.round(avg)}%`;
      }
    }

    return report;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentIntegrator;
} else {
  window.ContentIntegrator = ContentIntegrator;
}
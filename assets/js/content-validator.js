/**
 * Content Validation and Quality Assurance System
 * Validates content structure, translations, and data integrity
 */

class ContentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.supportedLanguages = ['en', 'nl', 'fr'];
    this.requiredFields = {
      main: ['title', 'description', 'phases'],
      phase: ['id', 'title', 'description', 'estimatedTime', 'difficulty', 'subsections'],
      subsection: ['id', 'title', 'description', 'content', 'prerequisites'],
      translation: ['title', 'description', 'navigation', 'common', 'phases']
    };
  }

  /**
   * Validate main content structure
   */
  async validateMainContent(contentType) {
    try {
      const response = await fetch(`/data/${contentType}.json`);
      const content = await response.json();
      
      this.validateStructure(content, this.requiredFields.main, `${contentType} main content`);
      
      // Validate phases
      content.phases.forEach((phase, index) => {
        this.validateStructure(phase, this.requiredFields.phase, `${contentType} phase ${index + 1}`);
        
        // Validate subsections
        phase.subsections.forEach((subsection, subIndex) => {
          this.validateStructure(subsection, this.requiredFields.subsection, 
            `${contentType} phase ${index + 1} subsection ${subIndex + 1}`);
        });
      });
      
      return { valid: this.errors.length === 0, errors: this.errors, warnings: this.warnings };
    } catch (error) {
      this.errors.push(`Failed to load ${contentType} content: ${error.message}`);
      return { valid: false, errors: this.errors, warnings: this.warnings };
    }
  }

  /**
   * Validate translations completeness
   */
  async validateTranslations(contentType) {
    const translationResults = {};
    
    for (const lang of this.supportedLanguages) {
      try {
        const response = await fetch(`/data/${lang}/${contentType}.json`);
        const translation = await response.json();
        
        this.validateStructure(translation, this.requiredFields.translation, 
          `${contentType} ${lang} translation`);
        
        // Validate navigation completeness
        this.validateNavigationTranslation(translation.navigation, lang, contentType);
        
        // Validate common terms
        this.validateCommonTermsTranslation(translation.common, lang, contentType);
        
        translationResults[lang] = {
          valid: this.errors.length === 0,
          errors: [...this.errors],
          warnings: [...this.warnings]
        };
        
        // Reset for next language
        this.errors = [];
        this.warnings = [];
        
      } catch (error) {
        translationResults[lang] = {
          valid: false,
          errors: [`Failed to load ${lang} translation: ${error.message}`],
          warnings: []
        };
      }
    }
    
    return translationResults;
  }

  /**
   * Validate content structure against required fields
   */
  validateStructure(obj, requiredFields, context) {
    requiredFields.forEach(field => {
      if (!obj.hasOwnProperty(field)) {
        this.errors.push(`Missing required field '${field}' in ${context}`);
      } else if (obj[field] === null || obj[field] === undefined || obj[field] === '') {
        this.errors.push(`Empty required field '${field}' in ${context}`);
      }
    });
  }

  /**
   * Validate navigation translation completeness
   */
  validateNavigationTranslation(navigation, lang, contentType) {
    const requiredNavItems = ['home', 'phases', 'overview', 'nextStep', 'previousStep', 'backToPhases'];
    
    requiredNavItems.forEach(item => {
      if (!navigation[item]) {
        this.errors.push(`Missing navigation translation '${item}' in ${lang} ${contentType}`);
      }
    });
  }

  /**
   * Validate common terms translation completeness
   */
  validateCommonTermsTranslation(common, lang, contentType) {
    const requiredCommonTerms = [
      'estimatedTime', 'difficulty', 'prerequisites', 'codeExample', 
      'copyCode', 'copied', 'showMore', 'showLess', 
      'beginner', 'intermediate', 'advanced'
    ];
    
    requiredCommonTerms.forEach(term => {
      if (!common[term]) {
        this.errors.push(`Missing common term translation '${term}' in ${lang} ${contentType}`);
      }
    });
  }

  /**
   * Validate cross-references and links
   */
  async validateCrossReferences(contentType) {
    try {
      const response = await fetch(`/data/${contentType}.json`);
      const content = await response.json();
      
      const phaseIds = content.phases.map(phase => phase.id);
      const subsectionIds = [];
      
      content.phases.forEach(phase => {
        phase.subsections.forEach(subsection => {
          subsectionIds.push(`${phase.id}/${subsection.id}`);
        });
      });
      
      // Validate internal references (this would be expanded based on actual content structure)
      this.validateInternalLinks(content, phaseIds, subsectionIds, contentType);
      
      return { valid: this.errors.length === 0, errors: this.errors, warnings: this.warnings };
    } catch (error) {
      this.errors.push(`Failed to validate cross-references: ${error.message}`);
      return { valid: false, errors: this.errors, warnings: this.warnings };
    }
  }

  /**
   * Validate internal links and references
   */
  validateInternalLinks(content, phaseIds, subsectionIds, contentType) {
    // This would check for broken internal links in content
    // For now, we'll add a placeholder validation
    content.phases.forEach((phase, phaseIndex) => {
      phase.subsections.forEach((subsection, subsectionIndex) => {
        // Check if content contains references to non-existent phases or subsections
        const contentText = subsection.content || '';
        
        // Simple regex to find potential internal references
        const references = contentText.match(/\[([^\]]+)\]\(#([^)]+)\)/g);
        if (references) {
          references.forEach(ref => {
            const match = ref.match(/\[([^\]]+)\]\(#([^)]+)\)/);
            if (match) {
              const linkTarget = match[2];
              if (!phaseIds.includes(linkTarget) && !subsectionIds.some(id => id.includes(linkTarget))) {
                this.warnings.push(`Potential broken internal link '${linkTarget}' in ${contentType} phase ${phaseIndex + 1} subsection ${subsectionIndex + 1}`);
              }
            }
          });
        }
      });
    });
  }

  /**
   * Generate validation report
   */
  generateReport(validationResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: 0,
        totalWarnings: 0,
        contentTypes: Object.keys(validationResults)
      },
      details: validationResults
    };

    // Calculate totals
    Object.values(validationResults).forEach(result => {
      if (result.errors) {
        report.summary.totalErrors += result.errors.length;
      }
      if (result.warnings) {
        report.summary.totalWarnings += result.warnings.length;
      }
      
      // Handle translation results
      if (result.translations) {
        Object.values(result.translations).forEach(translation => {
          report.summary.totalErrors += translation.errors.length;
          report.summary.totalWarnings += translation.warnings.length;
        });
      }
    });

    return report;
  }

  /**
   * Run comprehensive validation
   */
  async runFullValidation() {
    const results = {};
    const contentTypes = ['development-roadmap', 'node-guides'];
    
    for (const contentType of contentTypes) {
      console.log(`Validating ${contentType}...`);
      
      // Validate main content
      const mainValidation = await this.validateMainContent(contentType);
      
      // Validate translations
      const translationValidation = await this.validateTranslations(contentType);
      
      // Validate cross-references
      this.errors = []; // Reset errors for cross-reference validation
      this.warnings = [];
      const crossRefValidation = await this.validateCrossReferences(contentType);
      
      results[contentType] = {
        main: mainValidation,
        translations: translationValidation,
        crossReferences: crossRefValidation
      };
    }
    
    return this.generateReport(results);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentValidator;
} else {
  window.ContentValidator = ContentValidator;
}
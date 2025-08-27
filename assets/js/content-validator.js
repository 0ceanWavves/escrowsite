/**
 * Content Validator Module
 * Provides validation and error handling for content data
 */

class ContentValidator {
  constructor() {
    this.validationRules = {
      content: {
        required: ['title', 'description', 'phases'],
        types: {
          title: 'string',
          description: 'string',
          phases: 'array'
        }
      },
      phase: {
        required: ['id', 'title', 'description', 'subsections'],
        types: {
          id: 'string',
          title: 'string',
          description: 'string',
          estimatedTime: 'string',
          difficulty: 'string',
          subsections: 'array'
        }
      },
      subsection: {
        required: ['id', 'title', 'description', 'content'],
        types: {
          id: 'string',
          title: 'string',
          description: 'string',
          content: 'string',
          prerequisites: 'array',
          codeBlocks: 'array'
        }
      }
    };
  }

  /**
   * Validate complete content structure
   * @param {Object} content - Content object to validate
   * @param {string} contentType - Type of content being validated
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validateContent(content, contentType) {
    const errors = [];
    
    try {
      // Basic structure validation
      this._validateObject(content, 'content', errors);
      
      if (content.phases) {
        content.phases.forEach((phase, index) => {
          this._validatePhase(phase, index, errors);
        });
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        contentType
      };
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
      return {
        isValid: false,
        errors,
        contentType
      };
    }
  }  
/**
   * Validate phase structure
   * @private
   * @param {Object} phase - Phase object to validate
   * @param {number} index - Phase index for error reporting
   * @param {Array} errors - Array to collect errors
   */
  _validatePhase(phase, index, errors) {
    const phaseContext = `Phase ${index}`;
    
    this._validateObject(phase, 'phase', errors, phaseContext);
    
    if (phase.subsections) {
      phase.subsections.forEach((subsection, subIndex) => {
        this._validateSubsection(subsection, index, subIndex, errors);
      });
    }
  }

  /**
   * Validate subsection structure
   * @private
   * @param {Object} subsection - Subsection object to validate
   * @param {number} phaseIndex - Phase index for error reporting
   * @param {number} subIndex - Subsection index for error reporting
   * @param {Array} errors - Array to collect errors
   */
  _validateSubsection(subsection, phaseIndex, subIndex, errors) {
    const subsectionContext = `Phase ${phaseIndex}, Subsection ${subIndex}`;
    
    this._validateObject(subsection, 'subsection', errors, subsectionContext);
    
    // Validate code blocks if present
    if (subsection.codeBlocks) {
      subsection.codeBlocks.forEach((codeBlock, codeIndex) => {
        this._validateCodeBlock(codeBlock, phaseIndex, subIndex, codeIndex, errors);
      });
    }
  }

  /**
   * Validate code block structure
   * @private
   * @param {Object} codeBlock - Code block object to validate
   * @param {number} phaseIndex - Phase index for error reporting
   * @param {number} subIndex - Subsection index for error reporting
   * @param {number} codeIndex - Code block index for error reporting
   * @param {Array} errors - Array to collect errors
   */
  _validateCodeBlock(codeBlock, phaseIndex, subIndex, codeIndex, errors) {
    const context = `Phase ${phaseIndex}, Subsection ${subIndex}, Code Block ${codeIndex}`;
    
    if (!codeBlock.language || typeof codeBlock.language !== 'string') {
      errors.push(`${context}: Missing or invalid language`);
    }
    
    if (!codeBlock.code || typeof codeBlock.code !== 'string') {
      errors.push(`${context}: Missing or invalid code`);
    }
  }  /**
  
 * Validate object against rules
   * @private
   * @param {Object} obj - Object to validate
   * @param {string} type - Type of object (content, phase, subsection)
   * @param {Array} errors - Array to collect errors
   * @param {string} context - Context for error reporting
   */
  _validateObject(obj, type, errors, context = '') {
    const rules = this.validationRules[type];
    const prefix = context ? `${context}: ` : '';
    
    if (!obj || typeof obj !== 'object') {
      errors.push(`${prefix}Invalid ${type}: must be an object`);
      return;
    }
    
    // Check required fields
    rules.required.forEach(field => {
      if (!(field in obj)) {
        errors.push(`${prefix}Missing required field: ${field}`);
      }
    });
    
    // Check field types
    Object.entries(rules.types).forEach(([field, expectedType]) => {
      if (field in obj) {
        const actualType = this._getType(obj[field]);
        if (actualType !== expectedType) {
          errors.push(`${prefix}Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
        }
      }
    });
  }

  /**
   * Get type of value
   * @private
   * @param {*} value - Value to check type of
   * @returns {string} Type name
   */
  _getType(value) {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
  }

  /**
   * Validate content IDs for uniqueness
   * @param {Object} content - Content object to validate
   * @returns {Object} Validation result
   */
  validateUniqueIds(content) {
    const errors = [];
    const phaseIds = new Set();
    const subsectionIds = new Set();
    
    if (content.phases) {
      content.phases.forEach((phase, phaseIndex) => {
        // Check phase ID uniqueness
        if (phaseIds.has(phase.id)) {
          errors.push(`Duplicate phase ID: ${phase.id}`);
        } else {
          phaseIds.add(phase.id);
        }
        
        // Check subsection ID uniqueness within phase
        const phaseSubsectionIds = new Set();
        if (phase.subsections) {
          phase.subsections.forEach((subsection, subIndex) => {
            const fullId = `${phase.id}.${subsection.id}`;
            
            if (phaseSubsectionIds.has(subsection.id)) {
              errors.push(`Duplicate subsection ID in phase ${phase.id}: ${subsection.id}`);
            } else {
              phaseSubsectionIds.add(subsection.id);
            }
            
            if (subsectionIds.has(fullId)) {
              errors.push(`Duplicate subsection full ID: ${fullId}`);
            } else {
              subsectionIds.add(fullId);
            }
          });
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }  
/**
   * Validate content completeness (check for empty or missing content)
   * @param {Object} content - Content object to validate
   * @returns {Object} Validation result
   */
  validateCompleteness(content) {
    const warnings = [];
    
    if (content.phases) {
      content.phases.forEach((phase, phaseIndex) => {
        if (!phase.description || phase.description.trim().length < 10) {
          warnings.push(`Phase ${phaseIndex} (${phase.id}): Description is too short or missing`);
        }
        
        if (!phase.subsections || phase.subsections.length === 0) {
          warnings.push(`Phase ${phaseIndex} (${phase.id}): No subsections defined`);
        }
        
        if (phase.subsections) {
          phase.subsections.forEach((subsection, subIndex) => {
            if (!subsection.content || subsection.content.trim().length < 20) {
              warnings.push(`Phase ${phaseIndex}, Subsection ${subIndex} (${subsection.id}): Content is too short or missing`);
            }
            
            if (!subsection.prerequisites || subsection.prerequisites.length === 0) {
              warnings.push(`Phase ${phaseIndex}, Subsection ${subIndex} (${subsection.id}): No prerequisites defined`);
            }
          });
        }
      });
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Generate validation report
   * @param {Object} content - Content to validate
   * @param {string} contentType - Type of content
   * @returns {Object} Complete validation report
   */
  generateReport(content, contentType) {
    const structureValidation = this.validateContent(content, contentType);
    const uniqueIdValidation = this.validateUniqueIds(content);
    const completenessValidation = this.validateCompleteness(content);
    
    return {
      contentType,
      timestamp: new Date().toISOString(),
      structure: structureValidation,
      uniqueIds: uniqueIdValidation,
      completeness: completenessValidation,
      overall: {
        isValid: structureValidation.isValid && uniqueIdValidation.isValid,
        hasWarnings: completenessValidation.warnings.length > 0,
        totalErrors: structureValidation.errors.length + uniqueIdValidation.errors.length,
        totalWarnings: completenessValidation.warnings.length
      }
    };
  }
}

// Create and export singleton instance
const contentValidator = new ContentValidator();

// Export both the class and the singleton instance
export { ContentValidator, contentValidator };

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContentValidator, contentValidator };
}
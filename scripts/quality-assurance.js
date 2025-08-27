#!/usr/bin/env node

/**
 * Quality Assurance System
 * Comprehensive content quality checks and validation
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QualityAssurance {
  constructor() {
    this.supportedLanguages = ['en', 'nl', 'fr'];
    this.contentTypes = ['development-roadmap', 'node-guides'];
    this.dataDir = path.join(__dirname, '..', 'data');
    this.issues = [];
    this.checks = [];
  }

  /**
   * Run comprehensive quality assurance
   */
  async runQA() {
    console.log('🔍 Starting Quality Assurance checks...\n');

    try {
      // Content structure validation
      await this.validateContentStructure();
      
      // Translation consistency checks
      await this.validateTranslationConsistency();
      
      // Code block validation
      await this.validateCodeBlocks();
      
      // Link validation
      await this.validateLinks();
      
      // Accessibility checks
      await this.validateAccessibility();
      
      // Performance checks
      await this.validatePerformance();
      
      // Generate QA report
      const report = await this.generateQAReport();
      
      console.log('\n📊 Quality Assurance Report:');
      console.log('============================');
      console.log(`✅ Total checks performed: ${this.checks.length}`);
      console.log(`⚠️  Issues found: ${this.issues.length}`);
      console.log(`📈 Quality score: ${this.calculateQualityScore()}%`);
      
      if (this.issues.length > 0) {
        console.log('\n🔍 Issues found:');
        this.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. [${issue.severity}] ${issue.message}`);
          if (issue.location) {
            console.log(`      Location: ${issue.location}`);
          }
          if (issue.suggestion) {
            console.log(`      Suggestion: ${issue.suggestion}`);
          }
        });
      }
      
      console.log('\n✅ Quality assurance completed!');
      
      // Exit with error code if critical issues found
      const criticalIssues = this.issues.filter(issue => issue.severity === 'critical');
      if (criticalIssues.length > 0) {
        console.log(`\n❌ ${criticalIssues.length} critical issues found. Please fix before deployment.`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Quality assurance failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate content structure and completeness
   */
  async validateContentStructure() {
    console.log('📋 Validating content structure...');
    
    for (const contentType of this.contentTypes) {
      try {
        const mainPath = path.join(this.dataDir, `${contentType}.json`);
        const content = JSON.parse(await fs.readFile(mainPath, 'utf8'));
        
        // Check required fields
        this.checkRequiredFields(content, ['title', 'description', 'phases'], `${contentType} main`);
        
        // Validate phases
        content.phases.forEach((phase, phaseIndex) => {
          this.checkRequiredFields(phase, ['id', 'title', 'description', 'estimatedTime', 'difficulty'], 
            `${contentType} phase ${phaseIndex + 1}`);
          
          // Validate subsections if they exist
          if (phase.subsections) {
            phase.subsections.forEach((subsection, subIndex) => {
              this.checkRequiredFields(subsection, ['id', 'title', 'description', 'content'], 
                `${contentType} phase ${phaseIndex + 1} subsection ${subIndex + 1}`);
              
              // Check content length
              if (subsection.content && subsection.content.length < 50) {
                this.addIssue('warning', 
                  `Content too short in ${contentType} phase ${phaseIndex + 1} subsection ${subIndex + 1}`,
                  `${contentType}/${phase.id}/${subsection.id}`,
                  'Consider expanding the content to provide more value to users');
              }
            });
          }
        });
        
        this.addCheck(`Content structure validation for ${contentType}`);
        
      } catch (error) {
        this.addIssue('critical', `Failed to validate ${contentType} structure: ${error.message}`);
      }
    }
  }

  /**
   * Validate translation consistency
   */
  async validateTranslationConsistency() {
    console.log('🌍 Validating translation consistency...');
    
    for (const contentType of this.contentTypes) {
      const translations = {};
      
      // Load all translations
      for (const lang of this.supportedLanguages) {
        try {
          const langPath = path.join(this.dataDir, lang, `${contentType}.json`);
          translations[lang] = JSON.parse(await fs.readFile(langPath, 'utf8'));
        } catch (error) {
          this.addIssue('high', `Missing ${lang} translation for ${contentType}`);
          continue;
        }
      }
      
      // Check consistency across languages
      const baseTranslation = translations['en'];
      if (baseTranslation) {
        for (const lang of this.supportedLanguages) {
          if (lang === 'en' || !translations[lang]) continue;
          
          // Check phase count consistency
          if (baseTranslation.phases && translations[lang].phases) {
            if (baseTranslation.phases.length !== translations[lang].phases.length) {
              this.addIssue('high', 
                `Phase count mismatch in ${lang} translation for ${contentType}`,
                `${contentType}/${lang}`,
                'Ensure all phases are translated');
            }
          }
          
          // Check navigation completeness
          if (baseTranslation.navigation && translations[lang].navigation) {
            const baseNavKeys = Object.keys(baseTranslation.navigation);
            const langNavKeys = Object.keys(translations[lang].navigation);
            
            const missingKeys = baseNavKeys.filter(key => !langNavKeys.includes(key));
            if (missingKeys.length > 0) {
              this.addIssue('medium', 
                `Missing navigation translations in ${lang} for ${contentType}: ${missingKeys.join(', ')}`,
                `${contentType}/${lang}/navigation`);
            }
          }
        }
      }
      
      this.addCheck(`Translation consistency for ${contentType}`);
    }
  }

  /**
   * Validate code blocks
   */
  async validateCodeBlocks() {
    console.log('💻 Validating code blocks...');
    
    for (const contentType of this.contentTypes) {
      try {
        const mainPath = path.join(this.dataDir, `${contentType}.json`);
        const content = JSON.parse(await fs.readFile(mainPath, 'utf8'));
        
        content.phases.forEach((phase, phaseIndex) => {
          if (phase.subsections) {
            phase.subsections.forEach((subsection, subIndex) => {
              if (subsection.codeBlocks) {
                subsection.codeBlocks.forEach((codeBlock, codeIndex) => {
                  // Check required code block fields
                  this.checkRequiredFields(codeBlock, ['language', 'code'], 
                    `${contentType} phase ${phaseIndex + 1} subsection ${subIndex + 1} code block ${codeIndex + 1}`);
                  
                  // Validate code syntax (basic checks)
                  if (codeBlock.code) {
                    this.validateCodeSyntax(codeBlock, 
                      `${contentType} phase ${phaseIndex + 1} subsection ${subIndex + 1} code block ${codeIndex + 1}`);
                  }
                });
              }
            });
          }
        });
        
        this.addCheck(`Code block validation for ${contentType}`);
        
      } catch (error) {
        this.addIssue('medium', `Failed to validate code blocks for ${contentType}: ${error.message}`);
      }
    }
  }

  /**
   * Validate code syntax (basic checks)
   */
  validateCodeSyntax(codeBlock, location) {
    const { language, code } = codeBlock;
    
    // Basic syntax checks based on language
    switch (language) {
      case 'javascript':
      case 'js':
        // Check for common JS syntax issues
        if (code.includes('function') && !code.includes('{')) {
          this.addIssue('low', `Potential syntax issue in JavaScript code`, location,
            'Check for missing opening braces in function declarations');
        }
        break;
        
      case 'bash':
      case 'shell':
        // Check for common bash issues
        if (code.includes('sudo') && !code.includes('apt') && !code.includes('yum') && !code.includes('systemctl')) {
          this.addIssue('low', `Sudo usage without common commands`, location,
            'Verify sudo usage is appropriate and safe');
        }
        break;
        
      case 'json':
        // Validate JSON syntax
        try {
          JSON.parse(code);
        } catch (error) {
          this.addIssue('medium', `Invalid JSON syntax`, location,
            'Fix JSON syntax errors');
        }
        break;
    }
    
    // Check for placeholder values that might need updating
    if (code.includes('your_email@example.com') || code.includes('your_password_here')) {
      this.addIssue('low', `Placeholder values found in code`, location,
        'Consider using more descriptive placeholder text');
    }
  }

  /**
   * Validate internal links
   */
  async validateLinks() {
    console.log('🔗 Validating links...');
    
    for (const contentType of this.contentTypes) {
      try {
        const mainPath = path.join(this.dataDir, `${contentType}.json`);
        const content = JSON.parse(await fs.readFile(mainPath, 'utf8'));
        
        // Collect all valid internal IDs
        const validIds = new Set();
        content.phases.forEach(phase => {
          validIds.add(phase.id);
          if (phase.subsections) {
            phase.subsections.forEach(subsection => {
              validIds.add(`${phase.id}/${subsection.id}`);
              validIds.add(subsection.id);
            });
          }
        });
        
        // Check for broken internal references
        content.phases.forEach((phase, phaseIndex) => {
          if (phase.subsections) {
            phase.subsections.forEach((subsection, subIndex) => {
              if (subsection.content) {
                const links = subsection.content.match(/\[([^\]]+)\]\(#([^)]+)\)/g);
                if (links) {
                  links.forEach(link => {
                    const match = link.match(/\[([^\]]+)\]\(#([^)]+)\)/);
                    if (match) {
                      const linkTarget = match[2];
                      if (!validIds.has(linkTarget)) {
                        this.addIssue('medium', 
                          `Broken internal link: ${linkTarget}`,
                          `${contentType} phase ${phaseIndex + 1} subsection ${subIndex + 1}`,
                          'Update link target or create missing content');
                      }
                    }
                  });
                }
              }
            });
          }
        });
        
        this.addCheck(`Link validation for ${contentType}`);
        
      } catch (error) {
        this.addIssue('medium', `Failed to validate links for ${contentType}: ${error.message}`);
      }
    }
  }

  /**
   * Validate accessibility requirements
   */
  async validateAccessibility() {
    console.log('♿ Validating accessibility...');
    
    // Check for proper heading structure
    for (const contentType of this.contentTypes) {
      try {
        const mainPath = path.join(this.dataDir, `${contentType}.json`);
        const content = JSON.parse(await fs.readFile(mainPath, 'utf8'));
        
        content.phases.forEach((phase, phaseIndex) => {
          // Check for descriptive titles
          if (phase.title && phase.title.length < 5) {
            this.addIssue('low', 
              `Phase title too short for accessibility`,
              `${contentType} phase ${phaseIndex + 1}`,
              'Use more descriptive titles for better screen reader experience');
          }
          
          if (phase.subsections) {
            phase.subsections.forEach((subsection, subIndex) => {
              // Check for alt text in content (basic check)
              if (subsection.content && subsection.content.includes('![') && 
                  !subsection.content.includes('![') || subsection.content.includes('![]')) {
                this.addIssue('medium', 
                  `Missing or empty alt text for images`,
                  `${contentType} phase ${phaseIndex + 1} subsection ${subIndex + 1}`,
                  'Add descriptive alt text for all images');
              }
            });
          }
        });
        
        this.addCheck(`Accessibility validation for ${contentType}`);
        
      } catch (error) {
        this.addIssue('low', `Failed to validate accessibility for ${contentType}: ${error.message}`);
      }
    }
  }

  /**
   * Validate performance considerations
   */
  async validatePerformance() {
    console.log('⚡ Validating performance considerations...');
    
    try {
      // Check search index size
      const searchIndexPath = path.join(this.dataDir, 'search-index.json');
      const searchIndex = JSON.parse(await fs.readFile(searchIndexPath, 'utf8'));
      
      if (searchIndex.totalEntries > 1000) {
        this.addIssue('low', 
          `Large search index (${searchIndex.totalEntries} entries)`,
          'search-index.json',
          'Consider implementing search index pagination or optimization');
      }
      
      // Check content file sizes
      for (const contentType of this.contentTypes) {
        const mainPath = path.join(this.dataDir, `${contentType}.json`);
        const stats = await fs.stat(mainPath);
        
        if (stats.size > 100000) { // 100KB
          this.addIssue('low', 
            `Large content file (${Math.round(stats.size / 1024)}KB)`,
            `${contentType}.json`,
            'Consider splitting large content files for better performance');
        }
      }
      
      this.addCheck('Performance validation');
      
    } catch (error) {
      this.addIssue('low', `Failed to validate performance: ${error.message}`);
    }
  }

  /**
   * Check required fields
   */
  checkRequiredFields(obj, requiredFields, location) {
    requiredFields.forEach(field => {
      if (!obj.hasOwnProperty(field) || obj[field] === null || obj[field] === undefined || obj[field] === '') {
        this.addIssue('high', `Missing required field: ${field}`, location);
      }
    });
  }

  /**
   * Add an issue to the list
   */
  addIssue(severity, message, location = null, suggestion = null) {
    this.issues.push({
      severity,
      message,
      location,
      suggestion,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add a completed check
   */
  addCheck(description) {
    this.checks.push({
      description,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Calculate quality score
   */
  calculateQualityScore() {
    if (this.checks.length === 0) return 0;
    
    const criticalIssues = this.issues.filter(issue => issue.severity === 'critical').length;
    const highIssues = this.issues.filter(issue => issue.severity === 'high').length;
    const mediumIssues = this.issues.filter(issue => issue.severity === 'medium').length;
    const lowIssues = this.issues.filter(issue => issue.severity === 'low').length;
    
    // Weight issues by severity
    const totalDeductions = (criticalIssues * 20) + (highIssues * 10) + (mediumIssues * 5) + (lowIssues * 2);
    const maxScore = 100;
    
    return Math.max(0, maxScore - totalDeductions);
  }

  /**
   * Generate QA report
   */
  async generateQAReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: this.checks.length,
        totalIssues: this.issues.length,
        qualityScore: this.calculateQualityScore(),
        issuesBySeverity: {
          critical: this.issues.filter(issue => issue.severity === 'critical').length,
          high: this.issues.filter(issue => issue.severity === 'high').length,
          medium: this.issues.filter(issue => issue.severity === 'medium').length,
          low: this.issues.filter(issue => issue.severity === 'low').length
        }
      },
      checks: this.checks,
      issues: this.issues
    };

    // Write report
    const reportPath = path.join(__dirname, '..', 'qa-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }
}

// Run QA if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const qa = new QualityAssurance();
  qa.runQA().catch(error => {
    console.error('QA failed:', error);
    process.exit(1);
  });
}

export default QualityAssurance;
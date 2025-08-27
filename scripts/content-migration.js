#!/usr/bin/env node

/**
 * Content Migration and Integration Script
 * Ensures all content is properly migrated and translations are complete
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ContentMigrator {
  constructor() {
    this.supportedLanguages = ['en', 'nl', 'fr'];
    this.contentTypes = ['development-roadmap', 'node-guides'];
    this.dataDir = path.join(__dirname, '..', 'data');
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Run complete content migration
   */
  async migrate() {
    console.log('[Placeholder SVG] Starting content migration...\n');

    try {
      // Step 1: Validate directory structure
      await this.validateDirectoryStructure();

      // Step 2: Validate main content files
      await this.validateMainContent();

      // Step 3: Validate and complete translations
      await this.validateTranslations();

      // Step 4: Generate search index
      await this.generateSearchIndex();

      // Step 5: Generate migration report
      const report = await this.generateReport();

      console.log('\n[Placeholder SVG] Migration Report:');
      console.log('===================');
      console.log(`[Placeholder SVG] Content types processed: ${report.contentTypes.length}`);
      console.log(`[Placeholder SVG] Languages supported: ${report.languages.length}`);
      console.log(`📄 Total phases: ${report.totalPhases}`);
      console.log(`[Placeholder SVG] Total subsections: ${report.totalSubsections}`);
      console.log(`[Placeholder SVG]  Warnings: ${this.warnings.length}`);
      console.log(`[Placeholder SVG] Errors: ${this.errors.length}`);

      if (this.warnings.length > 0) {
        console.log('\n[Placeholder SVG]  Warnings:');
        this.warnings.forEach(warning => console.log(`   - ${warning}`));
      }

      if (this.errors.length > 0) {
        console.log('\n[Placeholder SVG] Errors:');
        this.errors.forEach(error => console.log(`   - ${error}`));
        process.exit(1);
      }

      console.log('\n[Placeholder SVG] Content migration completed successfully!');
    } catch (error) {
      console.error('[Placeholder SVG] Migration failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate directory structure
   */
  async validateDirectoryStructure() {
    console.log('📁 Validating directory structure...');

    try {
      await fs.access(this.dataDir);
    } catch (error) {
      throw new Error(`Data directory not found: ${this.dataDir}`);
    }

    // Check language directories
    for (const lang of this.supportedLanguages) {
      const langDir = path.join(this.dataDir, lang);
      try {
        await fs.access(langDir);
        console.log(`   [Placeholder SVG] ${lang} directory exists`);
      } catch (error) {
        console.log(`   📁 Creating ${lang} directory...`);
        await fs.mkdir(langDir, { recursive: true });
      }
    }
  }

  /**
   * Validate main content files
   */
  async validateMainContent() {
    console.log('\n📄 Validating main content files...');

    for (const contentType of this.contentTypes) {
      const filePath = path.join(this.dataDir, `${contentType}.json`);
      
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Validate structure
        this.validateContentStructure(data, contentType);
        console.log(`   [Placeholder SVG] ${contentType}.json is valid`);
      } catch (error) {
        this.errors.push(`Invalid main content file ${contentType}.json: ${error.message}`);
      }
    }
  }

  /**
   * Validate content structure
   */
  validateContentStructure(data, contentType) {
    const required = ['title', 'description', 'phases'];
    
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(data.phases)) {
      throw new Error('Phases must be an array');
    }

    data.phases.forEach((phase, index) => {
      const phaseRequired = ['id', 'title', 'description', 'estimatedTime', 'difficulty'];
      for (const field of phaseRequired) {
        if (!phase[field]) {
          throw new Error(`Phase ${index + 1} missing required field: ${field}`);
        }
      }

      if (phase.subsections && !Array.isArray(phase.subsections)) {
        throw new Error(`Phase ${index + 1} subsections must be an array`);
      }
    });
  }

  /**
   * Validate and complete translations
   */
  async validateTranslations() {
    console.log('\n[Placeholder SVG] Validating translations...');

    for (const contentType of this.contentTypes) {
      console.log(`\n   Processing ${contentType} translations:`);
      
      // Load main content as reference
      const mainPath = path.join(this.dataDir, `${contentType}.json`);
      const mainContent = JSON.parse(await fs.readFile(mainPath, 'utf8'));

      for (const lang of this.supportedLanguages) {
        const langPath = path.join(this.dataDir, lang, `${contentType}.json`);
        
        try {
          const translationContent = await fs.readFile(langPath, 'utf8');
          const translation = JSON.parse(translationContent);
          
          // Validate translation completeness
          const validation = this.validateTranslationCompleteness(mainContent, translation, lang, contentType);
          
          if (validation.complete) {
            console.log(`     [Placeholder SVG] ${lang} translation complete`);
          } else {
            console.log(`     [Placeholder SVG]  ${lang} translation incomplete (${validation.completeness}%)`);
            this.warnings.push(`${contentType} ${lang} translation is ${validation.completeness}% complete`);
          }
        } catch (error) {
          console.log(`     [Placeholder SVG] ${lang} translation missing or invalid`);
          this.errors.push(`${contentType} ${lang} translation error: ${error.message}`);
        }
      }
    }
  }

  /**
   * Validate translation completeness
   */
  validateTranslationCompleteness(mainContent, translation, lang, contentType) {
    let totalFields = 0;
    let translatedFields = 0;

    // Check main fields
    const mainFields = ['title', 'description'];
    mainFields.forEach(field => {
      totalFields++;
      if (translation[field]) translatedFields++;
    });

    // Check navigation
    if (translation.navigation) {
      const navFields = ['home', 'phases', 'overview', 'nextStep', 'previousStep', 'backToPhases'];
      navFields.forEach(field => {
        totalFields++;
        if (translation.navigation[field]) translatedFields++;
      });
    }

    // Check common terms
    if (translation.common) {
      const commonFields = ['estimatedTime', 'difficulty', 'prerequisites', 'beginner', 'intermediate', 'advanced'];
      commonFields.forEach(field => {
        totalFields++;
        if (translation.common[field]) translatedFields++;
      });
    }

    // Check phases
    if (translation.phases && Array.isArray(translation.phases)) {
      mainContent.phases.forEach((mainPhase, index) => {
        const translatedPhase = translation.phases.find(p => p.id === mainPhase.id);
        
        ['title', 'description', 'estimatedTime', 'difficulty'].forEach(field => {
          totalFields++;
          if (translatedPhase && translatedPhase[field]) translatedFields++;
        });
      });
    }

    const completeness = Math.round((translatedFields / totalFields) * 100);
    
    return {
      complete: completeness >= 90, // Consider 90%+ as complete
      completeness,
      translatedFields,
      totalFields
    };
  }

  /**
   * Generate search index
   */
  async generateSearchIndex() {
    console.log('\n[Placeholder SVG] Generating search index...');

    const searchIndex = {
      timestamp: new Date().toISOString(),
      languages: {},
      totalEntries: 0
    };

    for (const lang of this.supportedLanguages) {
      searchIndex.languages[lang] = [];
      
      for (const contentType of this.contentTypes) {
        try {
          const langPath = path.join(this.dataDir, lang, `${contentType}.json`);
          const translation = JSON.parse(await fs.readFile(langPath, 'utf8'));
          
          // Load main content for detailed data
          const mainPath = path.join(this.dataDir, `${contentType}.json`);
          const mainContent = JSON.parse(await fs.readFile(mainPath, 'utf8'));

          // Index phases and subsections
          mainContent.phases.forEach(phase => {
            const translatedPhase = translation.phases?.find(p => p.id === phase.id);
            
            searchIndex.languages[lang].push({
              type: 'phase',
              contentType,
              id: phase.id,
              title: translatedPhase?.title || phase.title,
              description: translatedPhase?.description || phase.description,
              url: `/${contentType}/${phase.id}/`,
              keywords: [contentType, phase.id, 'phase']
            });

            if (phase.subsections) {
              phase.subsections.forEach(subsection => {
                const translatedSubsection = translatedPhase?.subsections?.find(s => s.id === subsection.id);
                
                searchIndex.languages[lang].push({
                  type: 'subsection',
                  contentType,
                  phaseId: phase.id,
                  id: subsection.id,
                  title: translatedSubsection?.title || subsection.title,
                  description: translatedSubsection?.description || subsection.description,
                  url: `/${contentType}/${phase.id}/${subsection.id}.html`,
                  keywords: [contentType, phase.id, subsection.id, 'guide']
                });
              });
            }
          });
        } catch (error) {
          this.warnings.push(`Failed to index ${contentType} for ${lang}: ${error.message}`);
        }
      }
      
      searchIndex.totalEntries += searchIndex.languages[lang].length;
    }

    // Write search index
    const indexPath = path.join(this.dataDir, 'search-index.json');
    await fs.writeFile(indexPath, JSON.stringify(searchIndex, null, 2));
    
    console.log(`   [Placeholder SVG] Search index generated with ${searchIndex.totalEntries} entries`);
  }

  /**
   * Generate migration report
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      contentTypes: this.contentTypes,
      languages: this.supportedLanguages,
      totalPhases: 0,
      totalSubsections: 0,
      translationStatus: {}
    };

    for (const contentType of this.contentTypes) {
      try {
        const mainPath = path.join(this.dataDir, `${contentType}.json`);
        const mainContent = JSON.parse(await fs.readFile(mainPath, 'utf8'));
        
        report.totalPhases += mainContent.phases.length;
        report.totalSubsections += mainContent.phases.reduce((total, phase) => 
          total + (phase.subsections ? phase.subsections.length : 0), 0);

        report.translationStatus[contentType] = {};
        
        for (const lang of this.supportedLanguages) {
          try {
            const langPath = path.join(this.dataDir, lang, `${contentType}.json`);
            const translation = JSON.parse(await fs.readFile(langPath, 'utf8'));
            const validation = this.validateTranslationCompleteness(mainContent, translation, lang, contentType);
            
            report.translationStatus[contentType][lang] = {
              completeness: validation.completeness,
              complete: validation.complete
            };
          } catch (error) {
            report.translationStatus[contentType][lang] = {
              error: error.message
            };
          }
        }
      } catch (error) {
        this.errors.push(`Failed to process ${contentType}: ${error.message}`);
      }
    }

    // Write report
    const reportPath = path.join(__dirname, '..', 'migration-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new ContentMigrator();
  migrator.migrate().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export default ContentMigrator;
#!/usr/bin/env node

/**
 * Deployment Readiness Check
 * Validates that the site is ready for production deployment
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentChecker {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.checks = [];
    this.failures = [];
    this.warnings = [];
  }

  /**
   * Run comprehensive deployment checks
   */
  async checkDeploymentReadiness() {
    console.log('🔍 Checking deployment readiness...\n');

    try {
      // Essential file checks
      await this.checkEssentialFiles();
      
      // Configuration validation
      await this.validateConfiguration();
      
      // Content integrity checks
      await this.validateContentIntegrity();
      
      // Performance checks
      await this.checkPerformanceRequirements();
      
      // Security checks
      await this.validateSecurityConfiguration();
      
      // Accessibility validation
      await this.checkAccessibilityCompliance();
      
      // Generate deployment report
      const report = await this.generateDeploymentReport();
      
      console.log('\n📊 Deployment Readiness Report:');
      console.log('===============================');
      console.log(`✅ Checks passed: ${this.checks.length}`);
      console.log(`⚠️  Warnings: ${this.warnings.length}`);
      console.log(`❌ Critical failures: ${this.failures.length}`);
      console.log(`🚀 Ready for deployment: ${this.failures.length === 0 ? 'YES' : 'NO'}`);
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        this.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
      
      if (this.failures.length > 0) {
        console.log('\n❌ Critical Issues:');
        this.failures.forEach(failure => console.log(`   - ${failure}`));
        console.log('\n🛑 Deployment blocked due to critical issues!');
        process.exit(1);
      }
      
      console.log('\n✅ Site is ready for deployment!');
      
    } catch (error) {
      console.error('❌ Deployment check failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check for essential files
   */
  async checkEssentialFiles() {
    console.log('📁 Checking essential files...');
    
    const essentialFiles = [
      'index.html',
      'netlify.toml',
      'package.json',
      'data/development-roadmap.json',
      'data/node-guides.json',
      'data/search-index.json'
    ];
    
    const essentialDirectories = [
      'assets/css',
      'assets/js',
      'data/en',
      'data/nl',
      'data/fr'
    ];
    
    // Check files
    for (const file of essentialFiles) {
      const filePath = path.join(this.rootDir, file);
      try {
        await fs.access(filePath);
        this.addCheck(`Essential file exists: ${file}`);
      } catch (error) {
        this.addFailure(`Missing essential file: ${file}`);
      }
    }
    
    // Check directories
    for (const dir of essentialDirectories) {
      const dirPath = path.join(this.rootDir, dir);
      try {
        await fs.access(dirPath);
        this.addCheck(`Essential directory exists: ${dir}`);
      } catch (error) {
        this.addFailure(`Missing essential directory: ${dir}`);
      }
    }
  }

  /**
   * Validate configuration files
   */
  async validateConfiguration() {
    console.log('⚙️  Validating configuration...');
    
    // Check netlify.toml
    try {
      const netlifyConfig = await fs.readFile(path.join(this.rootDir, 'netlify.toml'), 'utf8');
      
      if (netlifyConfig.includes('[build]')) {
        this.addCheck('Netlify build configuration present');
      } else {
        this.addFailure('Missing Netlify build configuration');
      }
      
      if (netlifyConfig.includes('[[headers]]')) {
        this.addCheck('Security headers configured');
      } else {
        this.addWarning('No security headers configured');
      }
      
      if (netlifyConfig.includes('[[redirects]]')) {
        this.addCheck('URL redirects configured');
      } else {
        this.addWarning('No URL redirects configured');
      }
      
    } catch (error) {
      this.addFailure('Failed to validate netlify.toml');
    }
    
    // Check package.json
    try {
      const packageJson = JSON.parse(await fs.readFile(path.join(this.rootDir, 'package.json'), 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts.build) {
        this.addCheck('Build script configured');
      } else {
        this.addFailure('Missing build script in package.json');
      }
      
      if (packageJson.scripts && packageJson.scripts['build:production']) {
        this.addCheck('Production build script configured');
      } else {
        this.addWarning('No production build script configured');
      }
      
    } catch (error) {
      this.addFailure('Failed to validate package.json');
    }
  }

  /**
   * Validate content integrity
   */
  async validateContentIntegrity() {
    console.log('📄 Validating content integrity...');
    
    const contentTypes = ['development-roadmap', 'node-guides'];
    const languages = ['en', 'nl', 'fr'];
    
    for (const contentType of contentTypes) {
      // Check main content
      try {
        const mainPath = path.join(this.rootDir, 'data', `${contentType}.json`);
        const content = JSON.parse(await fs.readFile(mainPath, 'utf8'));
        
        if (content.phases && content.phases.length > 0) {
          this.addCheck(`${contentType} main content valid`);
        } else {
          this.addFailure(`${contentType} main content invalid or empty`);
        }
        
      } catch (error) {
        this.addFailure(`Failed to validate ${contentType} main content`);
      }
      
      // Check translations
      for (const lang of languages) {
        try {
          const langPath = path.join(this.rootDir, 'data', lang, `${contentType}.json`);
          const translation = JSON.parse(await fs.readFile(langPath, 'utf8'));
          
          if (translation.title && translation.phases) {
            this.addCheck(`${contentType} ${lang} translation valid`);
          } else {
            this.addWarning(`${contentType} ${lang} translation incomplete`);
          }
          
        } catch (error) {
          this.addWarning(`${contentType} ${lang} translation missing or invalid`);
        }
      }
    }
    
    // Check search index
    try {
      const searchIndexPath = path.join(this.rootDir, 'data', 'search-index.json');
      const searchIndex = JSON.parse(await fs.readFile(searchIndexPath, 'utf8'));
      
      if (searchIndex.totalEntries && searchIndex.totalEntries > 0) {
        this.addCheck(`Search index valid (${searchIndex.totalEntries} entries)`);
      } else {
        this.addFailure('Search index empty or invalid');
      }
      
    } catch (error) {
      this.addFailure('Search index missing or invalid');
    }
  }

  /**
   * Check performance requirements
   */
  async checkPerformanceRequirements() {
    console.log('⚡ Checking performance requirements...');
    
    // Check file sizes
    const criticalFiles = [
      'assets/css/layout.css',
      'assets/css/components.css',
      'assets/js/navigation.js',
      'assets/js/content-loader.js'
    ];
    
    for (const file of criticalFiles) {
      try {
        const filePath = path.join(this.rootDir, file);
        const stats = await fs.stat(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        
        if (sizeKB > 100) {
          this.addWarning(`Large file size: ${file} (${sizeKB}KB)`);
        } else {
          this.addCheck(`File size acceptable: ${file} (${sizeKB}KB)`);
        }
        
      } catch (error) {
        // File might not exist, skip
      }
    }
    
    // Check for service worker
    try {
      await fs.access(path.join(this.rootDir, 'sw.js'));
      this.addCheck('Service worker present for offline functionality');
    } catch (error) {
      this.addWarning('No service worker found');
    }
    
    // Check for cache manifest
    try {
      await fs.access(path.join(this.rootDir, 'cache-manifest.json'));
      this.addCheck('Cache manifest present');
    } catch (error) {
      this.addWarning('No cache manifest found');
    }
  }

  /**
   * Validate security configuration
   */
  async validateSecurityConfiguration() {
    console.log('🔒 Validating security configuration...');
    
    // Check netlify.toml for security headers
    try {
      const netlifyConfig = await fs.readFile(path.join(this.rootDir, 'netlify.toml'), 'utf8');
      
      const securityHeaders = [
        'X-Frame-Options',
        'X-XSS-Protection',
        'X-Content-Type-Options',
        'Referrer-Policy'
      ];
      
      let securityScore = 0;
      for (const header of securityHeaders) {
        if (netlifyConfig.includes(header)) {
          securityScore++;
        }
      }
      
      if (securityScore === securityHeaders.length) {
        this.addCheck('All security headers configured');
      } else {
        this.addWarning(`Missing ${securityHeaders.length - securityScore} security headers`);
      }
      
    } catch (error) {
      this.addWarning('Could not validate security headers');
    }
    
    // Check for HTTPS enforcement
    try {
      const netlifyConfig = await fs.readFile(path.join(this.rootDir, 'netlify.toml'), 'utf8');
      
      if (netlifyConfig.includes('force_ssl = true') || netlifyConfig.includes('Force-SSL')) {
        this.addCheck('HTTPS enforcement configured');
      } else {
        this.addWarning('HTTPS enforcement not explicitly configured');
      }
      
    } catch (error) {
      this.addWarning('Could not check HTTPS configuration');
    }
  }

  /**
   * Check accessibility compliance
   */
  async checkAccessibilityCompliance() {
    console.log('♿ Checking accessibility compliance...');
    
    // Check for accessibility CSS
    try {
      await fs.access(path.join(this.rootDir, 'assets', 'css', 'accessibility.css'));
      this.addCheck('Accessibility CSS present');
    } catch (error) {
      this.addWarning('No dedicated accessibility CSS found');
    }
    
    // Check for accessibility JavaScript
    try {
      await fs.access(path.join(this.rootDir, 'assets', 'js', 'accessibility.js'));
      this.addCheck('Accessibility JavaScript present');
    } catch (error) {
      this.addWarning('No dedicated accessibility JavaScript found');
    }
    
    // Check main HTML files for basic accessibility
    const htmlFiles = ['index.html', 'getting-started.html'];
    
    for (const file of htmlFiles) {
      try {
        const filePath = path.join(this.rootDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        if (content.includes('lang=')) {
          this.addCheck(`Language attribute present in ${file}`);
        } else {
          this.addWarning(`Missing language attribute in ${file}`);
        }
        
        if (content.includes('alt=')) {
          this.addCheck(`Alt attributes found in ${file}`);
        } else {
          this.addWarning(`No alt attributes found in ${file}`);
        }
        
      } catch (error) {
        // File might not exist, skip
      }
    }
  }

  /**
   * Add a successful check
   */
  addCheck(message) {
    this.checks.push({
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add a warning
   */
  addWarning(message) {
    this.warnings.push({
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add a critical failure
   */
  addFailure(message) {
    this.failures.push({
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate deployment report
   */
  async generateDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      readyForDeployment: this.failures.length === 0,
      summary: {
        totalChecks: this.checks.length,
        totalWarnings: this.warnings.length,
        totalFailures: this.failures.length,
        deploymentScore: this.calculateDeploymentScore()
      },
      checks: this.checks,
      warnings: this.warnings,
      failures: this.failures
    };

    // Write report
    const reportPath = path.join(this.rootDir, 'deployment-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  /**
   * Calculate deployment readiness score
   */
  calculateDeploymentScore() {
    const totalItems = this.checks.length + this.warnings.length + this.failures.length;
    if (totalItems === 0) return 0;
    
    const score = ((this.checks.length + (this.warnings.length * 0.5)) / totalItems) * 100;
    return Math.round(score);
  }
}

// Run deployment check if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new DeploymentChecker();
  checker.checkDeploymentReadiness().catch(error => {
    console.error('Deployment check failed:', error);
    process.exit(1);
  });
}

export default DeploymentChecker;
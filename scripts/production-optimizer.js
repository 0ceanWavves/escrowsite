#!/usr/bin/env node

/**
 * Production Optimization Script
 * Optimizes assets and content for production deployment
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionOptimizer {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.optimizations = [];
    this.errors = [];
  }

  /**
   * Run all production optimizations
   */
  async optimize() {
    console.log('[Placeholder SVG] Starting production optimization...\n');

    try {
      // Minify CSS files
      await this.minifyCSS();
      
      // Optimize JavaScript files
      await this.optimizeJavaScript();
      
      // Optimize JSON data files
      await this.optimizeJSONFiles();
      
      // Generate service worker cache manifest
      await this.generateCacheManifest();
      
      // Optimize images (if any)
      await this.optimizeImages();
      
      // Generate performance report
      const report = await this.generateOptimizationReport();
      
      console.log('\n[Placeholder SVG] Optimization Report:');
      console.log('======================');
      console.log(`[Placeholder SVG] Optimizations applied: ${this.optimizations.length}`);
      console.log(`[Placeholder SVG] Errors encountered: ${this.errors.length}`);
      
      if (this.errors.length > 0) {
        console.log('\n[Placeholder SVG] Errors:');
        this.errors.forEach(error => console.log(`   - ${error}`));
      }
      
      console.log('\n[Placeholder SVG] Production optimization completed!');
      
    } catch (error) {
      console.error('[Placeholder SVG] Optimization failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Minify CSS files (basic minification)
   */
  async minifyCSS() {
    console.log('[Placeholder SVG] Optimizing CSS files...');
    
    const cssDir = path.join(this.rootDir, 'assets', 'css');
    
    try {
      const files = await fs.readdir(cssDir);
      const cssFiles = files.filter(file => file.endsWith('.css'));
      
      for (const file of cssFiles) {
        const filePath = path.join(cssDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Basic CSS minification
        const minified = content
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
          .replace(/\s*{\s*/g, '{') // Clean up braces
          .replace(/\s*}\s*/g, '}')
          .replace(/\s*;\s*/g, ';')
          .replace(/\s*,\s*/g, ',')
          .replace(/\s*:\s*/g, ':')
          .trim();
        
        if (minified.length < content.length) {
          await fs.writeFile(filePath, minified);
          const savings = ((content.length - minified.length) / content.length * 100).toFixed(1);
          this.optimizations.push(`Minified ${file} (${savings}% reduction)`);
        }
      }
      
    } catch (error) {
      this.errors.push(`CSS optimization failed: ${error.message}`);
    }
  }

  /**
   * Optimize JavaScript files
   */
  async optimizeJavaScript() {
    console.log('⚡ Optimizing JavaScript files...');
    
    const jsDir = path.join(this.rootDir, 'assets', 'js');
    
    try {
      const files = await fs.readdir(jsDir);
      const jsFiles = files.filter(file => file.endsWith('.js'));
      
      for (const file of jsFiles) {
        const filePath = path.join(jsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Basic JavaScript optimization
        let optimized = content
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
          .replace(/\/\/.*$/gm, '') // Remove line comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/;\s*}/g, '}') // Clean up semicolons
          .trim();
        
        // Remove console.log statements in production
        optimized = optimized.replace(/console\.log\([^)]*\);?/g, '');
        
        if (optimized.length < content.length) {
          await fs.writeFile(filePath, optimized);
          const savings = ((content.length - optimized.length) / content.length * 100).toFixed(1);
          this.optimizations.push(`Optimized ${file} (${savings}% reduction)`);
        }
      }
      
    } catch (error) {
      this.errors.push(`JavaScript optimization failed: ${error.message}`);
    }
  }

  /**
   * Optimize JSON data files
   */
  async optimizeJSONFiles() {
    console.log('📄 Optimizing JSON files...');
    
    const dataDir = path.join(this.rootDir, 'data');
    
    try {
      const processDirectory = async (dir) => {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = await fs.stat(filePath);
          
          if (stat.isDirectory()) {
            await processDirectory(filePath);
          } else if (file.endsWith('.json')) {
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);
            
            // Minify JSON (remove whitespace)
            const minified = JSON.stringify(data);
            
            if (minified.length < content.length) {
              await fs.writeFile(filePath, minified);
              const savings = ((content.length - minified.length) / content.length * 100).toFixed(1);
              this.optimizations.push(`Minified ${path.relative(this.rootDir, filePath)} (${savings}% reduction)`);
            }
          }
        }
      };
      
      await processDirectory(dataDir);
      
    } catch (error) {
      this.errors.push(`JSON optimization failed: ${error.message}`);
    }
  }

  /**
   * Generate service worker cache manifest
   */
  async generateCacheManifest() {
    console.log('📦 Generating cache manifest...');
    
    try {
      const manifest = {
        version: Date.now(),
        static: [],
        dynamic: []
      };
      
      // Add static assets
      const staticPaths = [
        'assets/css',
        'assets/js',
        'assets/images'
      ];
      
      for (const staticPath of staticPaths) {
        const fullPath = path.join(this.rootDir, staticPath);
        try {
          await this.addFilesToManifest(fullPath, staticPath, manifest.static);
        } catch (error) {
          // Directory might not exist, skip
        }
      }
      
      // Add dynamic content
      manifest.dynamic = [
        '/data/*.json',
        '/data/*/*.json'
      ];
      
      // Write manifest
      const manifestPath = path.join(this.rootDir, 'cache-manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      
      this.optimizations.push(`Generated cache manifest with ${manifest.static.length} static assets`);
      
    } catch (error) {
      this.errors.push(`Cache manifest generation failed: ${error.message}`);
    }
  }

  /**
   * Add files to cache manifest
   */
  async addFilesToManifest(dir, relativePath, manifest) {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        await this.addFilesToManifest(filePath, `${relativePath}/${file}`, manifest);
      } else {
        manifest.push(`/${relativePath}/${file}`);
      }
    }
  }

  /**
   * Optimize images (placeholder for future implementation)
   */
  async optimizeImages() {
    console.log('🖼️  Checking for image optimizations...');
    
    const imagesDir = path.join(this.rootDir, 'assets', 'images');
    
    try {
      await fs.access(imagesDir);
      const files = await fs.readdir(imagesDir);
      const imageFiles = files.filter(file => 
        file.endsWith('.jpg') || file.endsWith('.jpeg') || 
        file.endsWith('.png') || file.endsWith('.svg')
      );
      
      if (imageFiles.length > 0) {
        this.optimizations.push(`Found ${imageFiles.length} images (optimization placeholder)`);
        // TODO: Implement actual image optimization
      }
      
    } catch (error) {
      // Images directory doesn't exist, skip
    }
  }

  /**
   * Generate optimization report
   */
  async generateOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      optimizations: this.optimizations,
      errors: this.errors,
      summary: {
        totalOptimizations: this.optimizations.length,
        totalErrors: this.errors.length,
        success: this.errors.length === 0
      }
    };

    // Write report
    const reportPath = path.join(this.rootDir, 'optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }
}

// Run optimization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new ProductionOptimizer();
  optimizer.optimize().catch(error => {
    console.error('Optimization failed:', error);
    process.exit(1);
  });
}

export default ProductionOptimizer;
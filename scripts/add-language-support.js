#!/usr/bin/env node

/**
 * Script to add language switching support to all HTML pages
 */

import fs from 'fs';
import path from 'path';

// File extensions to process
const fileExtensions = ['.html'];

// Directories to skip
const skipDirectories = ['node_modules', '.git', 'playwright-report', 'test-results', 'test-reports'];

// Common text elements that need translation keys
const commonTranslations = {
  'Home': 'nav.home',
  'Development Roadmap': 'nav.development-roadmap', 
  'Node Guides': 'nav.node-guides',
  'Getting Started': 'getting.started.title',
  'The Road to Crypto': 'site.title',
  'Interactive Implementation Blueprint': 'site.subtitle',
  'Welcome to The Road to Crypto': 'hero.title',
  'Your comprehensive guide to crypto development and node setup': 'hero.subtitle'
};

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return fileExtensions.includes(ext);
}

/**
 * Check if directory should be skipped
 */
function shouldSkipDirectory(dirName) {
  return skipDirectories.includes(dirName);
}

/**
 * Add data-i18n attributes to common elements
 */
function addLanguageSupport(content) {
  let updatedContent = content;
  let hasChanges = false;
  
  // Add data-i18n to common navigation elements
  for (const [text, key] of Object.entries(commonTranslations)) {
    // Match text in various HTML contexts
    const patterns = [
      // Navigation links
      new RegExp(`(<a[^>]*>)\\s*${text}\\s*(</a>)`, 'gi'),
      // Headings
      new RegExp(`(<h[1-6][^>]*>)\\s*${text}\\s*(</h[1-6]>)`, 'gi'),
      // Paragraphs
      new RegExp(`(<p[^>]*>)\\s*${text}\\s*(</p>)`, 'gi'),
      // Spans
      new RegExp(`(<span[^>]*>)\\s*${text}\\s*(</span>)`, 'gi'),
      // Buttons
      new RegExp(`(<button[^>]*>)\\s*${text}\\s*(</button>)`, 'gi')
    ];
    
    patterns.forEach(pattern => {
      const matches = updatedContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Only add data-i18n if it doesn't already exist
          if (!match.includes('data-i18n')) {
            const replacement = match.replace(/(<[^>]+)>/, `$1 data-i18n="${key}">`);
            updatedContent = updatedContent.replace(match, replacement);
            hasChanges = true;
          }
        });
      }
    });
  }
  
  // Ensure language switcher JavaScript is included
  if (updatedContent.includes('language-switcher') && !updatedContent.includes('language-switcher.js')) {
    const scriptPattern = /<script src="[^"]*utils\.js"><\/script>/;
    if (scriptPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(
        scriptPattern,
        '$&\n    <script src="/assets/js/language-switcher.js"></script>'
      );
      hasChanges = true;
    }
  }
  
  return { content: updatedContent, hasChanges };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: updatedContent, hasChanges } = addLanguageSupport(content);
    
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Process directory recursively
 */
function processDirectory(dirPath) {
  let filesUpdated = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        if (!shouldSkipDirectory(item)) {
          filesUpdated += processDirectory(itemPath);
        }
      } else if (stat.isFile() && shouldProcessFile(itemPath)) {
        filesUpdated += processFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`✗ Error processing directory ${dirPath}:`, error.message);
  }
  
  return filesUpdated;
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Adding language support to all HTML pages...\n');
  
  const startTime = Date.now();
  const filesUpdated = processDirectory('.');
  const endTime = Date.now();
  
  console.log('\n' + '='.repeat(50));
  console.log('[Placeholder SVG] LANGUAGE SUPPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Files updated: ${filesUpdated}`);
  console.log(`Time taken: ${endTime - startTime}ms`);
  
  if (filesUpdated > 0) {
    console.log('\n[Placeholder SVG] Language support added successfully!');
    console.log('All HTML pages now have data-i18n attributes for common elements');
  } else {
    console.log('\n[Placeholder SVG] No files needed language support updates');
  }
}

// Run the script
main();

export { addLanguageSupport, processFile, processDirectory };
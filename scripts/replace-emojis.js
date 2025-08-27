#!/usr/bin/env node

/**
 * Script to replace all emojis with [Placeholder SVG] across the project
 */

import fs from 'fs';
import path from 'path';

// Common emojis used in the project
const emojiReplacements = {
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]'
};

// File extensions to process
const fileExtensions = ['.html', '.js', '.json', '.md', '.css'];

// Directories to skip
const skipDirectories = ['node_modules', '.git', 'playwright-report', 'test-results', 'test-reports'];

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
 * Replace emojis in text content
 */
function replaceEmojis(content) {
  let updatedContent = content;
  let hasChanges = false;
  
  for (const [emoji, replacement] of Object.entries(emojiReplacements)) {
    if (updatedContent.includes(emoji)) {
      updatedContent = updatedContent.replace(new RegExp(emoji, 'g'), replacement);
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
    const { content: updatedContent, hasChanges } = replaceEmojis(content);
    
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
  console.log('🔄 Starting emoji replacement across project...\n');
  
  const startTime = Date.now();
  const filesUpdated = processDirectory('.');
  const endTime = Date.now();
  
  console.log('\n' + '='.repeat(50));
  console.log('[Placeholder SVG] EMOJI REPLACEMENT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Files updated: ${filesUpdated}`);
  console.log(`Time taken: ${endTime - startTime}ms`);
  
  if (filesUpdated > 0) {
    console.log('\n[Placeholder SVG] Emoji replacement completed successfully!');
    console.log('All emojis have been replaced with [Placeholder SVG]');
  } else {
    console.log('\n[Placeholder SVG] No emojis found to replace');
  }
}

// Run the script
main();

export { replaceEmojis, processFile, processDirectory };
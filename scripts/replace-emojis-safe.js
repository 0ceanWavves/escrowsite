#!/usr/bin/env node

/**
 * Safe script to replace ONLY actual emojis with [Placeholder SVG]
 */

import fs from 'fs';
import path from 'path';

// ONLY actual emojis used in the project - very specific Unicode ranges
const emojiReplacements = {
  // Flag emojis
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  '[Placeholder SVG]': '[Placeholder SVG]',
  
  // Common emojis used in the project
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
const fileExtensions = ['.html', '.js', '.json', '.md'];

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
 * Replace ONLY specific emojis in text content
 */
function replaceEmojis(content) {
  let updatedContent = content;
  let hasChanges = false;
  
  for (const [emoji, replacement] of Object.entries(emojiReplacements)) {
    if (updatedContent.includes(emoji)) {
      // Use exact string replacement, not regex
      updatedContent = updatedContent.split(emoji).join(replacement);
      hasChanges = true;
      console.log(`  Found and replaced: ${emoji}`);
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
  console.log('🔄 Safely replacing ONLY actual emojis...\n');
  
  const startTime = Date.now();
  const filesUpdated = processDirectory('.');
  const endTime = Date.now();
  
  console.log('\n' + '='.repeat(50));
  console.log('[Placeholder SVG] SAFE EMOJI REPLACEMENT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Files updated: ${filesUpdated}`);
  console.log(`Time taken: ${endTime - startTime}ms`);
  
  if (filesUpdated > 0) {
    console.log('\n[Placeholder SVG] Safe emoji replacement completed successfully!');
    console.log('Only actual emojis have been replaced with [Placeholder SVG]');
  } else {
    console.log('\n[Placeholder SVG] No emojis found to replace');
  }
}

// Run the script
main();

export { replaceEmojis, processFile, processDirectory };
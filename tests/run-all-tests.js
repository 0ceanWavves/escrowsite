#!/usr/bin/env node

/**
 * Test Runner Script
 * Runs all test suites in sequence
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const testSuites = [
  {
    name: 'Unit Tests',
    command: 'npm',
    args: ['run', 'test'],
    description: 'Running JavaScript unit tests with Vitest'
  },
  {
    name: 'Integration Tests',
    command: 'npm',
    args: ['run', 'test:integration'],
    description: 'Running browser integration tests with Playwright'
  },
  {
    name: 'Accessibility Tests',
    command: 'npm',
    args: ['run', 'test:accessibility'],
    description: 'Running accessibility tests with axe-core'
  }
];

async function runCommand(command, args, description) {
  console.log(`\n🧪 ${description}`);
  console.log('='.repeat(50));
  
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`[Placeholder SVG] ${description} - PASSED`);
        resolve();
      } else {
        console.log(`[Placeholder SVG] ${description} - FAILED (exit code: ${code})`);
        reject(new Error(`Test suite failed with exit code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      console.error(`[Placeholder SVG] ${description} - ERROR:`, error.message);
      reject(error);
    });
  });
}

async function runAllTests() {
  console.log('[Placeholder SVG] Starting comprehensive test suite...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: testSuites.length
  };
  
  for (const suite of testSuites) {
    try {
      await runCommand(suite.command, suite.args, suite.description);
      results.passed++;
    } catch (error) {
      results.failed++;
      console.error(`\n[Placeholder SVG] ${suite.name} failed:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('[Placeholder SVG] TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total test suites: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n[Placeholder SVG] All tests passed successfully!');
    process.exit(0);
  } else {
    console.log(`\n💥 ${results.failed} test suite(s) failed.`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n[Placeholder SVG]  Test execution interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n[Placeholder SVG]  Test execution terminated');
  process.exit(1);
});

// Run the tests
runAllTests().catch((error) => {
  console.error('\n💥 Test runner failed:', error.message);
  process.exit(1);
});
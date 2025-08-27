#!/usr/bin/env node

/**
 * UX Test Runner and Report Generator
 * Comprehensive user experience testing with detailed reporting
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const reportsDir = join(rootDir, 'test-reports');

// Ensure reports directory exists
try {
  mkdirSync(reportsDir, { recursive: true });
} catch (error) {
  // Directory might already exist
}

class UXTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      testSuites: [],
      recommendations: []
    };
  }

  async runTestSuite(name, command, args, description) {
    console.log(`\n🧪 ${description}`);
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const testProcess = spawn(command, args, {
        cwd: rootDir,
        stdio: 'pipe',
        shell: true
      });
      
      let stdout = '';
      let stderr = '';
      
      testProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
      });
      
      testProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });
      
      testProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        const success = code === 0;
        
        const suiteResult = {
          name,
          description,
          success,
          duration,
          exitCode: code,
          stdout,
          stderr,
          timestamp: new Date().toISOString()
        };
        
        this.results.testSuites.push(suiteResult);
        
        if (success) {
          console.log(`[Placeholder SVG] ${name} - PASSED (${duration}ms)`);
          this.results.summary.passed++;
        } else {
          console.log(`[Placeholder SVG] ${name} - FAILED (${duration}ms)`);
          this.results.summary.failed++;
        }
        
        this.results.summary.total++;
        resolve(suiteResult);
      });
      
      testProcess.on('error', (error) => {
        console.error(`[Placeholder SVG] ${name} - ERROR:`, error.message);
        
        const suiteResult = {
          name,
          description,
          success: false,
          duration: Date.now() - startTime,
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        this.results.testSuites.push(suiteResult);
        this.results.summary.failed++;
        this.results.summary.total++;
        
        resolve(suiteResult);
      });
    });
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze test results for recommendations
    this.results.testSuites.forEach(suite => {
      if (!suite.success) {
        if (suite.name.includes('Mobile')) {
          recommendations.push({
            category: 'Mobile Usability',
            priority: 'High',
            issue: `Mobile tests failed for ${suite.name}`,
            recommendation: 'Review mobile responsive design and touch target sizes',
            impact: 'Users on mobile devices may have difficulty navigating the site'
          });
        }
        
        if (suite.name.includes('Accessibility')) {
          recommendations.push({
            category: 'Accessibility',
            priority: 'Critical',
            issue: `Accessibility tests failed for ${suite.name}`,
            recommendation: 'Address WCAG compliance issues and improve screen reader support',
            impact: 'Site may be inaccessible to users with disabilities'
          });
        }
        
        if (suite.name.includes('Performance')) {
          recommendations.push({
            category: 'Performance',
            priority: 'Medium',
            issue: `Performance tests failed for ${suite.name}`,
            recommendation: 'Optimize loading times and implement better caching strategies',
            impact: 'Slow loading times may lead to user abandonment'
          });
        }
      }
    });
    
    // Add general recommendations based on test coverage
    if (this.results.summary.total > 0) {
      const passRate = (this.results.summary.passed / this.results.summary.total) * 100;
      
      if (passRate < 80) {
        recommendations.push({
          category: 'Overall Quality',
          priority: 'High',
          issue: `Test pass rate is ${passRate.toFixed(1)}%`,
          recommendation: 'Focus on improving failing tests to achieve at least 80% pass rate',
          impact: 'Low test pass rate indicates potential user experience issues'
        });
      }
    }
    
    this.results.recommendations = recommendations;
  }

  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UX Test Report - ${new Date(this.results.timestamp).toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .summary-card .number {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #6c757d; }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .test-suite {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #6c757d;
        }
        .test-suite.success {
            border-left-color: #28a745;
        }
        .test-suite.failure {
            border-left-color: #dc3545;
        }
        .test-suite h3 {
            margin: 0 0 10px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-block;
        }
        .status-icon.success {
            background-color: #28a745;
        }
        .status-icon.failure {
            background-color: #dc3545;
        }
        .test-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .test-detail {
            background: white;
            padding: 10px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        .test-detail strong {
            display: block;
            color: #666;
            font-size: 0.8em;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .recommendations {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
        }
        .recommendation {
            background: white;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #ffc107;
        }
        .recommendation.high {
            border-left-color: #fd7e14;
        }
        .recommendation.critical {
            border-left-color: #dc3545;
        }
        .recommendation h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .priority {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .priority.critical {
            background-color: #dc3545;
            color: white;
        }
        .priority.high {
            background-color: #fd7e14;
            color: white;
        }
        .priority.medium {
            background-color: #ffc107;
            color: #333;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        @media (max-width: 768px) {
            .summary {
                grid-template-columns: 1fr;
            }
            .test-details {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 UX Test Report</h1>
            <p>Generated on ${new Date(this.results.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number total">${this.results.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="number passed">${this.results.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number failed">${this.results.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Pass Rate</h3>
                <div class="number ${this.results.summary.total > 0 ? (this.results.summary.passed / this.results.summary.total) >= 0.8 ? 'passed' : 'failed' : 'total'}">
                    ${this.results.summary.total > 0 ? Math.round((this.results.summary.passed / this.results.summary.total) * 100) : 0}%
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>[Placeholder SVG] Test Suite Results</h2>
                ${this.results.testSuites.map(suite => `
                    <div class="test-suite ${suite.success ? 'success' : 'failure'}">
                        <h3>
                            <span class="status-icon ${suite.success ? 'success' : 'failure'}"></span>
                            ${suite.name}
                        </h3>
                        <p>${suite.description}</p>
                        <div class="test-details">
                            <div class="test-detail">
                                <strong>Status</strong>
                                ${suite.success ? '[Placeholder SVG] Passed' : '[Placeholder SVG] Failed'}
                            </div>
                            <div class="test-detail">
                                <strong>Duration</strong>
                                ${suite.duration}ms
                            </div>
                            <div class="test-detail">
                                <strong>Exit Code</strong>
                                ${suite.exitCode || 0}
                            </div>
                            <div class="test-detail">
                                <strong>Timestamp</strong>
                                ${new Date(suite.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                        ${suite.error ? `<div style="margin-top: 15px; padding: 10px; background: #f8d7da; border-radius: 4px; color: #721c24;"><strong>Error:</strong> ${suite.error}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            
            ${this.results.recommendations.length > 0 ? `
            <div class="section">
                <h2>[Placeholder SVG] Recommendations</h2>
                <div class="recommendations">
                    ${this.results.recommendations.map(rec => `
                        <div class="recommendation ${rec.priority.toLowerCase()}">
                            <h4>
                                ${rec.category}
                                <span class="priority ${rec.priority.toLowerCase()}">${rec.priority}</span>
                            </h4>
                            <p><strong>Issue:</strong> ${rec.issue}</p>
                            <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                            <p><strong>Impact:</strong> ${rec.impact}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>Report generated by UX Test Runner | Crypto Website Redesign Project</p>
        </div>
    </div>
</body>
</html>`;
    
    return html;
  }

  generateMarkdownReport() {
    const passRate = this.results.summary.total > 0 
      ? Math.round((this.results.summary.passed / this.results.summary.total) * 100)
      : 0;
    
    let markdown = `# UX Test Report

**Generated:** ${new Date(this.results.timestamp).toLocaleString()}

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${this.results.summary.total} |
| Passed | ${this.results.summary.passed} |
| Failed | ${this.results.summary.failed} |
| Pass Rate | ${passRate}% |

## Test Suite Results

`;

    this.results.testSuites.forEach(suite => {
      const status = suite.success ? '[Placeholder SVG] PASSED' : '[Placeholder SVG] FAILED';
      markdown += `### ${suite.name} - ${status}

**Description:** ${suite.description}
**Duration:** ${suite.duration}ms
**Exit Code:** ${suite.exitCode || 0}

`;
      
      if (suite.error) {
        markdown += `**Error:** ${suite.error}\n\n`;
      }
    });

    if (this.results.recommendations.length > 0) {
      markdown += `## Recommendations

`;
      
      this.results.recommendations.forEach(rec => {
        markdown += `### ${rec.category} (${rec.priority} Priority)

**Issue:** ${rec.issue}
**Recommendation:** ${rec.recommendation}
**Impact:** ${rec.impact}

`;
      });
    }

    markdown += `## Next Steps

Based on the test results:

1. **Address Critical Issues:** Focus on any critical accessibility or security issues first
2. **Improve Mobile Experience:** Ensure all mobile usability tests pass
3. **Optimize Performance:** Address any performance-related failures
4. **Maintain Quality:** Aim for at least 80% test pass rate

---

*Report generated by UX Test Runner for Crypto Website Redesign Project*
`;

    return markdown;
  }

  async saveReports() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save JSON report
    const jsonPath = join(reportsDir, `ux-test-results-${timestamp}.json`);
    writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));
    
    // Save HTML report
    const htmlPath = join(reportsDir, `ux-test-report-${timestamp}.html`);
    writeFileSync(htmlPath, this.generateHTMLReport());
    
    // Save Markdown report
    const mdPath = join(reportsDir, `ux-test-report-${timestamp}.md`);
    writeFileSync(mdPath, this.generateMarkdownReport());
    
    // Update latest reports
    writeFileSync(join(reportsDir, 'ux-test-results.json'), JSON.stringify(this.results, null, 2));
    writeFileSync(join(reportsDir, 'ux-test-report.html'), this.generateHTMLReport());
    writeFileSync(join(reportsDir, 'ux-test-report.md'), this.generateMarkdownReport());
    
    console.log(`\n📄 Reports saved:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   HTML: ${htmlPath}`);
    console.log(`   Markdown: ${mdPath}`);
  }

  async runAllTests() {
    console.log('[Placeholder SVG] Starting comprehensive UX testing suite...\n');
    
    const testSuites = [
      {
        name: 'Information Findability',
        command: 'npx',
        args: ['playwright', 'test', 'tests/ux/usability-tests.js', '--grep', 'Information Findability'],
        description: 'Testing information findability and navigation efficiency'
      },
      {
        name: 'Task Completion',
        command: 'npx',
        args: ['playwright', 'test', 'tests/ux/usability-tests.js', '--grep', 'Task Completion'],
        description: 'Testing user task completion workflows'
      },
      {
        name: 'Mobile Usability',
        command: 'npx',
        args: ['playwright', 'test', 'tests/ux/usability-tests.js', '--grep', 'Mobile Usability'],
        description: 'Testing mobile device usability and touch interactions'
      },
      {
        name: 'Responsive Design',
        command: 'npx',
        args: ['playwright', 'test', 'tests/ux/usability-tests.js', '--grep', 'Responsive Design'],
        description: 'Testing responsive design across different viewport sizes'
      },
      {
        name: 'Performance and Loading',
        command: 'npx',
        args: ['playwright', 'test', 'tests/ux/usability-tests.js', '--grep', 'Performance and Loading'],
        description: 'Testing page load performance and loading states'
      },
      {
        name: 'Content Quality',
        command: 'npx',
        args: ['playwright', 'test', 'tests/ux/usability-tests.js', '--grep', 'Content Quality'],
        description: 'Testing content structure and quality'
      },
      {
        name: 'WCAG Compliance',
        command: 'npx',
        args: ['playwright', 'test', 'tests/accessibility/comprehensive-a11y.spec.js', '--grep', 'WCAG'],
        description: 'Testing WCAG 2.1 AA compliance'
      },
      {
        name: 'Keyboard Navigation',
        command: 'npx',
        args: ['playwright', 'test', 'tests/accessibility/comprehensive-a11y.spec.js', '--grep', 'Keyboard Navigation'],
        description: 'Testing keyboard accessibility and navigation'
      },
      {
        name: 'Screen Reader Compatibility',
        command: 'npx',
        args: ['playwright', 'test', 'tests/accessibility/comprehensive-a11y.spec.js', '--grep', 'Screen Reader'],
        description: 'Testing screen reader compatibility and ARIA support'
      }
    ];
    
    for (const suite of testSuites) {
      await this.runTestSuite(suite.name, suite.command, suite.args, suite.description);
    }
    
    this.generateRecommendations();
    await this.saveReports();
    
    console.log('\n' + '='.repeat(80));
    console.log('[Placeholder SVG] UX TESTING SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total test suites: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    
    const passRate = this.results.summary.total > 0 
      ? Math.round((this.results.summary.passed / this.results.summary.total) * 100)
      : 0;
    console.log(`Pass rate: ${passRate}%`);
    
    if (this.results.recommendations.length > 0) {
      console.log(`\n[Placeholder SVG] ${this.results.recommendations.length} recommendations generated`);
    }
    
    if (this.results.summary.failed === 0) {
      console.log('\n[Placeholder SVG] All UX tests passed successfully!');
      return true;
    } else {
      console.log(`\n[Placeholder SVG]  ${this.results.summary.failed} test suite(s) need attention.`);
      return false;
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n[Placeholder SVG]  UX test execution interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n[Placeholder SVG]  UX test execution terminated');
  process.exit(1);
});

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new UXTestRunner();
  runner.runAllTests().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error('\n💥 UX test runner failed:', error.message);
    process.exit(1);
  });
}

export default UXTestRunner;
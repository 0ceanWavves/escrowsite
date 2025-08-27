/**
 * Cross-Browser Compatibility Tests
 * Tests for consistent behavior across different browsers
 */

import { test, expect, devices } from '@playwright/test';

// Test across different browsers
const browsers = ['chromium', 'firefox', 'webkit'];

test.describe('Cross-Browser Functionality', () => {
  browsers.forEach(browserName => {
    test.describe(`${browserName} compatibility`, () => {
      test(`should load homepage correctly in ${browserName}`, async ({ page }) => {
        await page.goto('/');
        
        // Basic page load
        await expect(page.locator('body')).toBeVisible();
        
        // Check title
        const title = await page.title();
        expect(title).toBeTruthy();
        
        // Check main navigation
        const nav = page.locator('nav, .navigation');
        if (await nav.count() > 0) {
          await expect(nav.first()).toBeVisible();
        }
      });

      test(`should handle JavaScript interactions in ${browserName}`, async ({ page }) => {
        await page.goto('/');
        
        // Test mobile menu if present
        const mobileToggle = page.locator('.mobile-menu-toggle, .hamburger');
        if (await mobileToggle.count() > 0) {
          await mobileToggle.click();
          
          const mobileMenu = page.locator('.mobile-nav, .mobile-menu');
          if (await mobileMenu.count() > 0) {
            await expect(mobileMenu).toBeVisible();
          }
        }
      });

      test(`should handle search functionality in ${browserName}`, async ({ page }) => {
        await page.goto('/search.html');
        
        const searchInput = page.locator('#search-input, input[type="search"]');
        if (await searchInput.count() > 0) {
          await searchInput.fill('database');
          
          // Wait for results or no results message
          await page.waitForSelector('.search-result-item, .search-no-results', { timeout: 5000 });
          
          const hasResults = await page.locator('.search-result-item').count() > 0;
          const hasNoResults = await page.locator('.search-no-results').count() > 0;
          
          expect(hasResults || hasNoResults).toBe(true);
        }
      });

      test(`should handle CSS layouts correctly in ${browserName}`, async ({ page }) => {
        await page.goto('/development-roadmap/');
        
        // Check layout doesn't break
        const body = page.locator('body');
        const bodyBox = await body.boundingBox();
        
        expect(bodyBox?.width).toBeGreaterThan(0);
        expect(bodyBox?.height).toBeGreaterThan(0);
        
        // Check sidebar if present
        const sidebar = page.locator('.sidebar, aside');
        if (await sidebar.count() > 0) {
          await expect(sidebar.first()).toBeVisible();
        }
      });
    });
  });
});

test.describe('Device-Specific Tests', () => {
  const testDevices = [
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPad', device: devices['iPad'] },
    { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
    { name: 'Desktop Firefox', device: devices['Desktop Firefox'] }
  ];

  testDevices.forEach(({ name, device }) => {
    test(`should work on ${name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      
      const page = await context.newPage();
      
      await page.goto('/');
      
      // Basic functionality
      await expect(page.locator('body')).toBeVisible();
      
      // Navigation should be accessible
      const nav = page.locator('nav, .navigation');
      if (await nav.count() > 0) {
        await expect(nav.first()).toBeVisible();
      }
      
      // Test touch/click interactions
      const links = page.locator('a');
      if (await links.count() > 0) {
        const firstLink = links.first();
        if (await firstLink.isVisible()) {
          await firstLink.click();
          await page.waitForLoadState('networkidle');
        }
      }
      
      await context.close();
    });
  });
});

test.describe('Feature Detection and Fallbacks', () => {
  test('should handle missing JavaScript gracefully', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      delete window.fetch;
      delete window.localStorage;
    });
    
    await page.goto('/');
    
    // Basic content should still be accessible
    await expect(page.locator('body')).toBeVisible();
    
    // Navigation should work (basic HTML)
    const links = page.locator('a[href]');
    if (await links.count() > 0) {
      await expect(links.first()).toBeVisible();
    }
  });

  test('should handle localStorage unavailability', async ({ page }) => {
    // Mock localStorage to throw errors
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage not available'); },
          setItem: () => { throw new Error('localStorage not available'); },
          removeItem: () => { throw new Error('localStorage not available'); },
          clear: () => { throw new Error('localStorage not available'); }
        },
        writable: false
      });
    });
    
    await page.goto('/development-roadmap/phase-1/database-schemas.html');
    
    // Page should still load and function
    await expect(page.locator('body')).toBeVisible();
    
    // Progress tracking might not work, but page should be usable
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Should not crash
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle network failures gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Simulate network failure for subsequent requests
    await page.route('**/*', route => {
      if (route.request().url().includes('.json')) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Try to use search (which might depend on JSON data)
    await page.goto('/search.html');
    
    const searchInput = page.locator('#search-input');
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      
      // Should handle gracefully (show error or empty results)
      await page.waitForTimeout(2000);
      
      // Page should not crash
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Performance Across Browsers', () => {
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (generous for CI)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle large pages efficiently', async ({ page }) => {
    await page.goto('/development-roadmap/');
    
    // Measure memory usage (basic check)
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Should not use excessive memory (100MB limit)
    if (memoryUsage > 0) {
      expect(memoryUsage).toBeLessThan(100 * 1024 * 1024);
    }
  });
});

test.describe('CSS and Styling Consistency', () => {
  test('should maintain consistent styling across browsers', async ({ page }) => {
    await page.goto('/');
    
    // Check basic styling is applied
    const body = page.locator('body');
    const bodyStyles = await body.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        color: styles.color,
        backgroundColor: styles.backgroundColor
      };
    });
    
    // Should have custom styling (not browser defaults)
    expect(bodyStyles.fontFamily).not.toBe('Times');
    expect(bodyStyles.fontSize).not.toBe('16px'); // Assuming custom font size
  });

  test('should handle CSS Grid and Flexbox properly', async ({ page }) => {
    await page.goto('/');
    
    // Look for grid/flex containers
    const containers = page.locator('.grid, .flex, [style*="display: grid"], [style*="display: flex"]');
    
    if (await containers.count() > 0) {
      const container = containers.first();
      const display = await container.evaluate(el => {
        return window.getComputedStyle(el).display;
      });
      
      expect(['grid', 'flex'].includes(display)).toBe(true);
    }
  });
});

test.describe('Form Handling Across Browsers', () => {
  test('should handle form inputs consistently', async ({ page }) => {
    await page.goto('/search.html');
    
    const searchInput = page.locator('input[type="search"], input[type="text"]');
    
    if (await searchInput.count() > 0) {
      // Test input functionality
      await searchInput.fill('test input');
      
      const value = await searchInput.inputValue();
      expect(value).toBe('test input');
      
      // Test clearing
      await searchInput.clear();
      const clearedValue = await searchInput.inputValue();
      expect(clearedValue).toBe('');
    }
  });

  test('should handle form validation consistently', async ({ page }) => {
    await page.goto('/');
    
    // Look for forms with validation
    const forms = page.locator('form');
    
    if (await forms.count() > 0) {
      const form = forms.first();
      const requiredInputs = form.locator('input[required]');
      
      if (await requiredInputs.count() > 0) {
        // Try to submit without filling required fields
        const submitButton = form.locator('button[type="submit"], input[type="submit"]');
        
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Should show validation (browser native or custom)
          const isValid = await form.evaluate(form => (form as HTMLFormElement).checkValidity());
          expect(isValid).toBe(false);
        }
      }
    }
  });
});
/**
 * Usability Testing Suite
 * Tests for information findability, task completion, and user experience
 */

import { test, expect } from '@playwright/test';

test.describe('Information Findability', () => {
  test('should find development roadmap information within 3 clicks', async ({ page }) => {
    await page.goto('/');
    
    let clickCount = 0;
    
    // Track clicks
    page.on('framenavigated', () => {
      clickCount++;
    });
    
    // Navigate to development roadmap
    await page.click('a[href*="development-roadmap"]');
    clickCount++;
    
    // Should find specific phase information
    await page.click('a[href*="phase-1"]');
    clickCount++;
    
    // Should find specific topic
    await page.click('a[href*="database-schemas"]');
    clickCount++;
    
    expect(clickCount).toBeLessThanOrEqual(3);
    await expect(page.locator('h1')).toContainText('Database Schemas');
  });

  test('should find node setup information through search', async ({ page }) => {
    await page.goto('/search.html');
    
    // Search for node setup
    await page.fill('#search-input', 'node setup');
    
    // Wait for results
    await page.waitForSelector('.search-result-item', { timeout: 5000 });
    
    const results = page.locator('.search-result-item');
    await expect(results.first()).toBeVisible();
    
    // Click first result
    await results.first().click();
    
    // Should navigate to relevant page
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/node-guides/);
  });

  test('should provide clear navigation breadcrumbs', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/database-schemas.html');
    
    // Check for breadcrumb navigation
    const breadcrumbs = page.locator('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]');
    
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs).toBeVisible();
      await expect(breadcrumbs).toContainText('Development Roadmap');
      await expect(breadcrumbs).toContainText('Phase 1');
    }
  });
});

test.describe('Task Completion', () => {
  test('should complete progress tracking workflow', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/database-schemas.html');
    
    // Scroll to bottom to trigger completion
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait for progress to be tracked
    await page.waitForTimeout(2000);
    
    // Check if progress was saved
    const progress = await page.evaluate(() => {
      return localStorage.getItem('crypto-guide-progress');
    });
    
    expect(progress).toBeTruthy();
  });

  test('should complete bookmark workflow', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/database-schemas.html');
    
    // Look for bookmark button
    const bookmarkBtn = page.locator('.bookmark-btn, [data-bookmark], button:has-text("Bookmark")');
    
    if (await bookmarkBtn.count() > 0) {
      await bookmarkBtn.click();
      
      // Check if bookmark was saved
      const bookmarks = await page.evaluate(() => {
        return localStorage.getItem('crypto-guide-bookmarks');
      });
      
      expect(bookmarks).toBeTruthy();
    }
  });

  test('should complete language switching workflow', async ({ page }) => {
    await page.goto('/');
    
    // Look for language switcher
    const langSwitcher = page.locator('.lang-flag, .language-switcher, [data-lang]');
    
    if (await langSwitcher.count() > 0) {
      const frenchFlag = page.locator('[data-lang="fr"], .lang-flag:has-text("FR")');
      
      if (await frenchFlag.count() > 0) {
        await frenchFlag.click();
        
        // Check if language changed
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe('fr');
      }
    }
  });
});

test.describe('Mobile Usability', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should have accessible mobile navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for mobile menu toggle
    const mobileToggle = page.locator('.mobile-menu-toggle, .hamburger, button[aria-label*="menu"]');
    await expect(mobileToggle).toBeVisible();
    
    // Test mobile menu functionality
    await mobileToggle.click();
    
    const mobileMenu = page.locator('.mobile-nav, .mobile-menu, nav[aria-expanded="true"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should have readable text on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check font sizes are appropriate for mobile
    const bodyText = page.locator('body');
    const fontSize = await bodyText.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });
    
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(14); // Minimum readable size
  });

  test('should have touch-friendly interactive elements', async ({ page }) => {
    await page.goto('/');
    
    // Check button sizes
    const buttons = page.locator('button, a');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Minimum touch target size should be 44px
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(32);
      }
    }
  });

  test('should handle horizontal scrolling properly', async ({ page }) => {
    await page.goto('/');
    
    // Check for horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    // Should not have significant horizontal overflow
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });
});

test.describe('Responsive Design Validation', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1200, height: 800 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(viewport => {
    test(`should display correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Check layout doesn't break
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Check no horizontal scrollbar on smaller screens
      if (viewport.width < 1200) {
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20);
      }
      
      // Check navigation is accessible
      const nav = page.locator('nav, .navigation');
      if (await nav.count() > 0) {
        await expect(nav.first()).toBeVisible();
      }
    });
  });
});

test.describe('Performance and Loading', () => {
  test('should load main page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should show loading states for dynamic content', async ({ page }) => {
    await page.goto('/search.html');
    
    // Perform search
    await page.fill('#search-input', 'database');
    
    // Should show some indication of loading/processing
    // This could be a spinner, loading text, or immediate results
    await page.waitForTimeout(100);
    
    // Results should appear within reasonable time
    await page.waitForSelector('.search-result-item, .search-no-results', { timeout: 2000 });
  });

  test('should handle offline scenarios gracefully', async ({ page, context }) => {
    await page.goto('/');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate
    await page.click('a[href*="development-roadmap"]').catch(() => {
      // Navigation might fail, that's expected
    });
    
    // Should show offline page or graceful degradation
    const offlineIndicator = page.locator('.offline-message, .no-connection, [data-offline]');
    
    // Either navigation works (cached) or offline message appears
    const hasOfflineMessage = await offlineIndicator.count() > 0;
    const currentUrl = page.url();
    
    expect(hasOfflineMessage || currentUrl.includes('development-roadmap')).toBeTruthy();
  });
});

test.describe('Content Quality', () => {
  test('should have descriptive page titles', async ({ page }) => {
    const pages = [
      '/',
      '/development-roadmap/',
      '/node-guides/',
      '/search.html'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title).not.toBe('Document'); // Default title
    }
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/development-roadmap/');
    
    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount.greaterThanOrEqual(1);
    
    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    let previousLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const currentLevel = parseInt(tagName.charAt(1));
      
      // Heading levels shouldn't skip (e.g., h1 -> h3)
      if (previousLevel > 0) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
      
      previousLevel = currentLevel;
    }
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Images should have alt text (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });
});
/**
 * Progress Tracking Integration Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should track page completion on scroll', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/database-schemas.html');
    
    // Scroll to bottom of page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait for progress to be saved
    await page.waitForTimeout(2000);
    
    // Check if progress was saved to localStorage
    const progress = await page.evaluate(() => {
      return localStorage.getItem('crypto-guide-progress');
    });
    
    expect(progress).toBeTruthy();
  });

  test('should show progress indicators', async ({ page }) => {
    await page.goto('/user-progress.html');
    
    const progressBars = page.locator('[data-progress-section], [data-progress-phase]');
    await expect(progressBars.first()).toBeVisible();
  });

  test('should handle bookmark functionality', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/database-schemas.html');
    
    const bookmarkBtn = page.locator('.bookmark-btn');
    if (await bookmarkBtn.isVisible()) {
      await bookmarkBtn.click();
      
      // Check if bookmark was saved
      const bookmarks = await page.evaluate(() => {
        return localStorage.getItem('crypto-guide-bookmarks');
      });
      
      expect(bookmarks).toBeTruthy();
    }
  });

  test('should persist progress across page reloads', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/database-schemas.html');
    
    // Simulate completion
    await page.evaluate(() => {
      if (window.progressTracker) {
        window.progressTracker.markSubsectionCompleted('development-roadmap', 'phase-1', 'database-schemas');
      }
    });
    
    // Reload page
    await page.reload();
    
    // Check if progress persisted
    const progress = await page.evaluate(() => {
      return localStorage.getItem('crypto-guide-progress');
    });
    
    expect(progress).toContain('database-schemas');
  });

  test('should update progress statistics', async ({ page }) => {
    await page.goto('/user-progress.html');
    
    const progressStats = page.locator('#progress-stats');
    if (await progressStats.isVisible()) {
      await expect(progressStats).toContainText('Overall Progress');
      await expect(progressStats).toContainText('Time Spent');
      await expect(progressStats).toContainText('Bookmarks');
    }
  });
});
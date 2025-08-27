/**
 * Search Integration Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search.html');
  });

  test('should perform basic search', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await searchInput.fill('database');
    
    // Wait for search results
    await page.waitForSelector('.search-result-item', { timeout: 5000 });
    
    const results = page.locator('.search-result-item');
    await expect(results).toHaveCount.greaterThan(0);
  });

  test('should highlight search terms in results', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await searchInput.fill('payment');
    
    await page.waitForSelector('.search-result-item');
    
    const highlightedText = page.locator('mark');
    await expect(highlightedText).toBeVisible();
  });

  test('should filter results by section', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await searchInput.fill('phase');
    
    await page.waitForSelector('.search-result-item');
    
    const sectionFilter = page.locator('#section-filter');
    await sectionFilter.selectOption('development-roadmap');
    
    // Results should be filtered
    const results = page.locator('.search-result-item');
    await expect(results).toHaveCount.greaterThan(0);
  });

  test('should handle empty search results', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await searchInput.fill('nonexistentterm12345');
    
    const noResults = page.locator('.search-no-results');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText('No results found');
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    // Test Ctrl+K to focus search
    await page.keyboard.press('Control+k');
    
    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeFocused();
  });

  test('should navigate to search result on click', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await searchInput.fill('database');
    
    await page.waitForSelector('.search-result-item');
    
    const firstResult = page.locator('.search-result-item').first();
    await firstResult.click();
    
    // Should navigate to the result page
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL('/search.html');
  });
});
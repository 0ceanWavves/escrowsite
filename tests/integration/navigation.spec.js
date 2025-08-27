/**
 * Navigation Integration Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate between main sections', async ({ page }) => {
    // Test navigation to Development Roadmap
    await page.click('a[href*="development-roadmap"]');
    await expect(page).toHaveURL(/development-roadmap/);
    await expect(page.locator('h1')).toContainText('Development Roadmap');

    // Test navigation to Node Guides
    await page.click('a[href*="node-guides"]');
    await expect(page).toHaveURL(/node-guides/);
    await expect(page.locator('h1')).toContainText('Node Setup Guides');

    // Test navigation back to home
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('should show active navigation states', async ({ page }) => {
    await page.goto('/development-roadmap/');
    
    const activeLink = page.locator('.nav-link.active, .sidebar-nav-link.active');
    await expect(activeLink).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile menu toggle is visible
    const mobileToggle = page.locator('.mobile-menu-toggle');
    await expect(mobileToggle).toBeVisible();
    
    // Test mobile menu functionality
    await mobileToggle.click();
    const mobileMenu = page.locator('.mobile-nav');
    await expect(mobileMenu).toHaveClass(/active/);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on first navigation link
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test Enter key navigation
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Sidebar Navigation', () => {
  test('should expand and collapse sections', async ({ page }) => {
    await page.goto('/development-roadmap/');
    
    const toggleButton = page.locator('.sidebar-toggle').first();
    await toggleButton.click();
    
    const collapsibleContent = page.locator('.sidebar-collapsible-content').first();
    await expect(collapsibleContent).toHaveClass(/expanded/);
    
    await toggleButton.click();
    await expect(collapsibleContent).not.toHaveClass(/expanded/);
  });

  test('should highlight current page in sidebar', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/database-schemas.html');
    
    const activeLink = page.locator('.sidebar-nav-link.active');
    await expect(activeLink).toBeVisible();
    await expect(activeLink).toContainText('Database Schemas');
  });
});
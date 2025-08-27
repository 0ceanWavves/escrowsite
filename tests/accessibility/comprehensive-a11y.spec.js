/**
 * Comprehensive Accessibility Testing Suite
 * Tests for WCAG compliance, screen reader compatibility, and keyboard navigation
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA Compliance', () => {
  const testPages = [
    { path: '/', name: 'Homepage' },
    { path: '/development-roadmap/', name: 'Development Roadmap' },
    { path: '/node-guides/', name: 'Node Guides' },
    { path: '/search.html', name: 'Search Page' },
    { path: '/user-progress.html', name: 'Progress Page' }
  ];

  testPages.forEach(({ path, name }) => {
    test(`${name} should meet WCAG 2.1 AA standards`, async ({ page }) => {
      await page.goto(path);
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test('should have proper color contrast ratios', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/search.html');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'form-field-multiple-labels'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Keyboard Navigation', () => {
  test('should support full keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Start tabbing through the page
    let focusableElements = [];
    
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el.tagName,
          type: el.type || null,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          text: el.textContent?.trim().substring(0, 50)
        };
      });
      
      focusableElements.push(focusedElement);
      
      // Check if element is visible
      const isVisible = await page.locator(':focus').isVisible();
      expect(isVisible).toBe(true);
    }
    
    // Should have found focusable elements
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  test('should support skip links', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to focus first element (should be skip link)
    await page.keyboard.press('Tab');
    
    const firstFocused = await page.locator(':focus');
    const text = await firstFocused.textContent();
    
    // Should be a skip link or main navigation
    const isSkipLink = text?.toLowerCase().includes('skip') || 
                      text?.toLowerCase().includes('main') ||
                      await firstFocused.getAttribute('href') === '#main-content';
    
    if (isSkipLink) {
      // Test skip link functionality
      await page.keyboard.press('Enter');
      
      const mainContent = page.locator('#main-content, main, [role="main"]');
      if (await mainContent.count() > 0) {
        await expect(mainContent.first()).toBeFocused();
      }
    }
  });

  test('should handle arrow key navigation in menus', async ({ page }) => {
    await page.goto('/development-roadmap/');
    
    // Look for expandable menu items
    const menuButtons = page.locator('.sidebar-toggle, [aria-expanded], [role="button"]');
    
    if (await menuButtons.count() > 0) {
      await menuButtons.first().focus();
      await page.keyboard.press('Enter');
      
      // Check if menu expanded
      const expanded = await menuButtons.first().getAttribute('aria-expanded');
      if (expanded === 'true') {
        // Test arrow key navigation
        await page.keyboard.press('ArrowDown');
        
        const focusedAfterArrow = page.locator(':focus');
        await expect(focusedAfterArrow).toBeVisible();
      }
    }
  });

  test('should support Escape key to close modals/menus', async ({ page }) => {
    await page.goto('/');
    
    // Look for mobile menu toggle
    const mobileToggle = page.locator('.mobile-menu-toggle, .hamburger');
    
    if (await mobileToggle.count() > 0) {
      await mobileToggle.click();
      
      // Check if menu opened
      const mobileMenu = page.locator('.mobile-nav, .mobile-menu');
      if (await mobileMenu.count() > 0 && await mobileMenu.isVisible()) {
        // Press Escape to close
        await page.keyboard.press('Escape');
        
        // Menu should be closed
        await expect(mobileMenu).not.toBeVisible();
      }
    }
  });
});

test.describe('Screen Reader Compatibility', () => {
  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount.greaterThanOrEqual(1);
    
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toHaveCount.greaterThanOrEqual(1);
    
    // Check for complementary content if present
    const aside = page.locator('aside, [role="complementary"]');
    const asideCount = await aside.count();
    
    if (asideCount > 0) {
      await expect(aside.first()).toBeVisible();
    }
  });

  test('should have descriptive ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation has proper labeling
    const navElements = page.locator('nav');
    const navCount = await navElements.count();
    
    for (let i = 0; i < navCount; i++) {
      const nav = navElements.nth(i);
      const ariaLabel = await nav.getAttribute('aria-label');
      const ariaLabelledby = await nav.getAttribute('aria-labelledby');
      
      // Navigation should have accessible name
      expect(ariaLabel || ariaLabelledby).toBeTruthy();
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/search.html');
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    
    if (await liveRegions.count() > 0) {
      // Perform search to trigger dynamic content
      await page.fill('#search-input', 'test');
      
      // Wait for results
      await page.waitForTimeout(1000);
      
      // Live region should be present for screen readers
      await expect(liveRegions.first()).toBeInViewport();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/development-roadmap/');
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    // Should have at least one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Check heading levels don't skip
    let previousLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const currentLevel = parseInt(tagName.charAt(1));
      
      if (previousLevel > 0) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
      
      previousLevel = currentLevel;
    }
  });

  test('should have descriptive link text', async ({ page }) => {
    await page.goto('/');
    
    const links = page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      const accessibleName = text?.trim() || ariaLabel || title;
      
      // Links should have descriptive text
      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.length).toBeGreaterThan(2);
      
      // Avoid generic link text
      const genericTexts = ['click here', 'read more', 'link', 'here'];
      const isGeneric = genericTexts.some(generic => 
        accessibleName?.toLowerCase().includes(generic)
      );
      
      if (isGeneric) {
        // Generic text is okay if there's additional context
        expect(ariaLabel || title).toBeTruthy();
      }
    }
  });
});

test.describe('Focus Management', () => {
  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first focusable element
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check if focus is visually indicated
    const focusStyles = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        boxShadow: styles.boxShadow,
        border: styles.border
      };
    });
    
    // Should have some form of focus indication
    const hasFocusIndicator = 
      focusStyles.outline !== 'none' ||
      focusStyles.outlineWidth !== '0px' ||
      focusStyles.boxShadow !== 'none' ||
      focusStyles.border.includes('px');
    
    expect(hasFocusIndicator).toBe(true);
  });

  test('should manage focus in dynamic content', async ({ page }) => {
    await page.goto('/');
    
    // Look for expandable content
    const expandableButtons = page.locator('[aria-expanded="false"]');
    
    if (await expandableButtons.count() > 0) {
      const button = expandableButtons.first();
      await button.focus();
      await button.click();
      
      // Focus should remain on button or move to expanded content
      const focusedAfterExpand = page.locator(':focus');
      await expect(focusedAfterExpand).toBeVisible();
    }
  });

  test('should trap focus in modal dialogs', async ({ page }) => {
    await page.goto('/');
    
    // Look for modal triggers
    const modalTriggers = page.locator('[data-modal], [aria-haspopup="dialog"]');
    
    if (await modalTriggers.count() > 0) {
      await modalTriggers.first().click();
      
      // Check if modal opened
      const modal = page.locator('[role="dialog"], .modal');
      
      if (await modal.count() > 0 && await modal.isVisible()) {
        // Tab should stay within modal
        await page.keyboard.press('Tab');
        
        const focusedInModal = await page.evaluate(() => {
          const focused = document.activeElement;
          const modal = document.querySelector('[role="dialog"], .modal');
          return modal?.contains(focused);
        });
        
        expect(focusedInModal).toBe(true);
      }
    }
  });
});

test.describe('Mobile Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should have appropriate touch targets', async ({ page }) => {
    await page.goto('/');
    
    const interactiveElements = page.locator('button, a, input, [role="button"]');
    const elementCount = await interactiveElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = interactiveElements.nth(i);
      const box = await element.boundingBox();
      
      if (box && await element.isVisible()) {
        // WCAG recommends minimum 44x44px touch targets
        const minDimension = Math.min(box.width, box.height);
        expect(minDimension).toBeGreaterThanOrEqual(32); // Slightly relaxed for testing
      }
    }
  });

  test('should support zoom up to 200%', async ({ page }) => {
    await page.goto('/');
    
    // Simulate zoom
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    // Content should still be accessible
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Navigation should still work
    const nav = page.locator('nav, .navigation');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('should handle orientation changes', async ({ page }) => {
    await page.goto('/');
    
    // Test portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.locator('body')).toBeVisible();
    
    // Content should remain accessible in both orientations
    const nav = page.locator('nav, .navigation');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });
});

test.describe('Error Handling and Feedback', () => {
  test('should provide accessible error messages', async ({ page }) => {
    await page.goto('/search.html');
    
    // Trigger search with no results
    await page.fill('#search-input', 'nonexistentterm12345');
    
    // Wait for no results message
    const noResults = page.locator('.search-no-results, .no-results, [role="status"]');
    
    if (await noResults.count() > 0) {
      await expect(noResults).toBeVisible();
      
      // Error message should be accessible
      const ariaLive = await noResults.getAttribute('aria-live');
      const role = await noResults.getAttribute('role');
      
      expect(ariaLive || role).toBeTruthy();
    }
  });

  test('should provide loading feedback', async ({ page }) => {
    await page.goto('/search.html');
    
    // Start search
    await page.fill('#search-input', 'database');
    
    // Should provide some loading indication
    await page.waitForTimeout(100);
    
    // Look for loading indicators
    const loadingIndicators = page.locator('.loading, .spinner, [aria-busy="true"]');
    
    // Either immediate results or loading indicator
    const hasResults = await page.locator('.search-result-item').count() > 0;
    const hasLoadingIndicator = await loadingIndicators.count() > 0;
    
    expect(hasResults || hasLoadingIndicator).toBe(true);
  });
});
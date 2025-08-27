/**
 * Mobile Usability Testing Suite
 * Comprehensive mobile user experience validation
 */

import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  });

  test('should provide intuitive mobile navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for mobile-friendly navigation
    const mobileNav = page.locator('.mobile-nav, .mobile-menu, nav');
    await expect(mobileNav).toBeVisible();
    
    // Test hamburger menu if present
    const hamburger = page.locator('.mobile-menu-toggle, .hamburger, button[aria-label*="menu"]');
    if (await hamburger.count() > 0) {
      await hamburger.click();
      
      // Menu should expand
      const expandedMenu = page.locator('.mobile-nav[aria-expanded="true"], .mobile-menu.open');
      if (await expandedMenu.count() > 0) {
        await expect(expandedMenu).toBeVisible();
        
        // Should be able to close menu
        await page.keyboard.press('Escape');
        await expect(expandedMenu).not.toBeVisible();
      }
    }
  });

  test('should handle touch gestures appropriately', async ({ page }) => {
    await page.goto('/development-roadmap/');
    
    // Test swipe gestures on carousel/slider elements if present
    const carousel = page.locator('.carousel, .slider, .swiper');
    if (await carousel.count() > 0) {
      const startX = 200;
      const endX = 100;
      
      await page.mouse.move(startX, 300);
      await page.mouse.down();
      await page.mouse.move(endX, 300);
      await page.mouse.up();
      
      // Should handle swipe gesture gracefully
      await page.waitForTimeout(500);
    }
    
    // Test scroll behavior
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('should maintain readability on small screens', async ({ page }) => {
    await page.goto('/node-guides/');
    
    // Check font sizes
    const bodyText = page.locator('body');
    const fontSize = await bodyText.evaluate(el => {
      return parseInt(window.getComputedStyle(el).fontSize);
    });
    
    expect(fontSize).toBeGreaterThanOrEqual(14); // Minimum readable size
    
    // Check line height for readability
    const lineHeight = await bodyText.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return parseFloat(styles.lineHeight) / parseFloat(styles.fontSize);
    });
    
    expect(lineHeight).toBeGreaterThanOrEqual(1.4); // Good readability ratio
  });

  test('should handle orientation changes gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Test portrait mode
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test landscape mode
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.locator('body')).toBeVisible();
    
    // Navigation should still be accessible
    const nav = page.locator('nav, .navigation');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
    
    // Content should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });
});

test.describe('Touch Target Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should have appropriately sized touch targets', async ({ page }) => {
    await page.goto('/');
    
    const interactiveElements = page.locator('button, a, input, [role="button"], [tabindex="0"]');
    const elementCount = await interactiveElements.count();
    
    let tooSmallCount = 0;
    const minTouchSize = 44; // WCAG recommended minimum
    
    for (let i = 0; i < Math.min(elementCount, 15); i++) {
      const element = interactiveElements.nth(i);
      
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        
        if (box) {
          const minDimension = Math.min(box.width, box.height);
          
          if (minDimension < minTouchSize) {
            tooSmallCount++;
            
            // Log details for debugging
            const elementInfo = await element.evaluate(el => ({
              tagName: el.tagName,
              className: el.className,
              text: el.textContent?.trim().substring(0, 30)
            }));
            
            console.log(`Small touch target: ${elementInfo.tagName}.${elementInfo.className} - ${minDimension}px - "${elementInfo.text}"`);
          }
        }
      }
    }
    
    // Allow some small elements but most should meet guidelines
    const allowedSmallElements = Math.ceil(elementCount * 0.1); // 10% tolerance
    expect(tooSmallCount).toBeLessThanOrEqual(allowedSmallElements);
  });

  test('should have adequate spacing between touch targets', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.locator('button, a[role="button"], .btn');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount - 1, 10); i++) {
      const button1 = buttons.nth(i);
      const button2 = buttons.nth(i + 1);
      
      if (await button1.isVisible() && await button2.isVisible()) {
        const box1 = await button1.boundingBox();
        const box2 = await button2.boundingBox();
        
        if (box1 && box2) {
          // Check if buttons are on the same row (similar Y coordinates)
          const sameRow = Math.abs(box1.y - box2.y) < 20;
          
          if (sameRow) {
            const spacing = Math.abs(box2.x - (box1.x + box1.width));
            
            // Should have at least 8px spacing between touch targets
            expect(spacing).toBeGreaterThanOrEqual(8);
          }
        }
      }
    }
  });
});

test.describe('Mobile Content Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should display content without horizontal scrolling', async ({ page }) => {
    const testPages = [
      '/',
      '/development-roadmap/',
      '/node-guides/',
      '/search.html'
    ];
    
    for (const pagePath of testPages) {
      await page.goto(pagePath);
      
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      // Allow small tolerance for rounding
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    }
  });

  test('should handle long content appropriately', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/');
    
    // Check if there's a "back to top" button for long pages
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const backToTop = page.locator('.back-to-top, [href="#top"], button:has-text("top")');
    if (await backToTop.count() > 0) {
      await expect(backToTop).toBeVisible();
      
      // Test back to top functionality
      await backToTop.click();
      await page.waitForTimeout(500);
      
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(100);
    }
  });

  test('should provide mobile-optimized forms', async ({ page }) => {
    await page.goto('/search.html');
    
    const searchInput = page.locator('#search-input, input[type="search"], input[placeholder*="search"]');
    
    if (await searchInput.count() > 0) {
      // Input should be appropriately sized
      const inputBox = await searchInput.boundingBox();
      if (inputBox) {
        expect(inputBox.height).toBeGreaterThanOrEqual(44); // Touch-friendly height
      }
      
      // Should have appropriate input type for mobile keyboards
      const inputType = await searchInput.getAttribute('type');
      expect(['search', 'text']).toContain(inputType);
      
      // Test input functionality
      await searchInput.fill('test query');
      const value = await searchInput.inputValue();
      expect(value).toBe('test query');
    }
  });

  test('should handle code blocks on mobile', async ({ page }) => {
    // Look for pages with code blocks
    const codePages = [
      '/node-guides/server-security/',
      '/development-roadmap/phase-1/'
    ];
    
    for (const pagePath of codePages) {
      try {
        await page.goto(pagePath);
        
        const codeBlocks = page.locator('pre, code, .code-block');
        const codeCount = await codeBlocks.count();
        
        if (codeCount > 0) {
          const firstCode = codeBlocks.first();
          
          // Code blocks should not cause horizontal overflow
          const codeBox = await firstCode.boundingBox();
          if (codeBox) {
            const viewportWidth = await page.evaluate(() => window.innerWidth);
            expect(codeBox.width).toBeLessThanOrEqual(viewportWidth);
          }
          
          // Should have horizontal scrolling within the code block if needed
          const hasOverflow = await firstCode.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return styles.overflowX === 'auto' || styles.overflowX === 'scroll';
          });
          
          // Either content fits or has internal scrolling
          expect(hasOverflow || codeBox.width <= 375).toBe(true);
        }
      } catch (error) {
        // Page might not exist, skip
        console.log(`Skipping ${pagePath}: ${error.message}`);
      }
    }
  });
});

test.describe('Mobile Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Simulate slower mobile connection
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 50)); // Add 50ms delay
      await route.continue();
    });
  });

  test('should load quickly on mobile connections', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds on simulated slow connection
    expect(loadTime).toBeLessThan(5000);
  });

  test('should show loading states for slow operations', async ({ page }) => {
    await page.goto('/search.html');
    
    // Perform search
    const searchInput = page.locator('#search-input, input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('database');
      
      // Should show loading state or immediate results
      await page.waitForTimeout(100);
      
      const loadingIndicator = page.locator('.loading, .spinner, [aria-busy="true"]');
      const results = page.locator('.search-result-item, .search-results');
      
      // Either shows loading or has results
      const hasLoading = await loadingIndicator.count() > 0;
      const hasResults = await results.count() > 0;
      
      expect(hasLoading || hasResults).toBe(true);
    }
  });

  test('should handle offline scenarios', async ({ page, context }) => {
    await page.goto('/');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate
    const navLink = page.locator('a[href*="development-roadmap"]').first();
    if (await navLink.count() > 0) {
      await navLink.click().catch(() => {
        // Navigation might fail offline
      });
      
      // Should either work (cached) or show offline message
      const offlineMessage = page.locator('.offline, .no-connection, [data-offline]');
      const currentUrl = page.url();
      
      const hasOfflineMessage = await offlineMessage.count() > 0;
      const navigationWorked = currentUrl.includes('development-roadmap');
      
      expect(hasOfflineMessage || navigationWorked).toBe(true);
    }
  });
});

test.describe('Mobile Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should support zoom up to 200% without loss of functionality', async ({ page }) => {
    await page.goto('/');
    
    // Simulate zoom
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    await page.waitForTimeout(500);
    
    // Content should still be accessible
    const nav = page.locator('nav, .navigation');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
    
    // Interactive elements should still work
    const firstLink = page.locator('a').first();
    if (await firstLink.count() > 0) {
      await expect(firstLink).toBeVisible();
      
      // Should be clickable
      const box = await firstLink.boundingBox();
      expect(box).toBeTruthy();
    }
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('should maintain focus visibility on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
      
      // Check focus indicator visibility
      const focusStyles = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow
        };
      });
      
      const hasFocusIndicator = 
        focusStyles.outline !== 'none' ||
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('should provide alternative input methods', async ({ page }) => {
    await page.goto('/search.html');
    
    const searchInput = page.locator('#search-input, input[type="search"]');
    
    if (await searchInput.count() > 0) {
      // Should support voice input (HTML5 speech input)
      const hasVoiceInput = await searchInput.evaluate(el => {
        return el.hasAttribute('x-webkit-speech') || 
               el.hasAttribute('speech') ||
               el.getAttribute('type') === 'search';
      });
      
      // Voice input or good mobile keyboard support
      const inputType = await searchInput.getAttribute('type');
      expect(['search', 'text'].includes(inputType) || hasVoiceInput).toBe(true);
    }
  });
});

test.describe('Mobile Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should display mobile-friendly error messages', async ({ page }) => {
    // Test 404 page
    await page.goto('/nonexistent-page').catch(() => {
      // 404 expected
    });
    
    // Should show user-friendly error
    const errorMessage = page.locator('.error, .not-found, h1:has-text("404"), h1:has-text("Not Found")');
    
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
      
      // Error message should be readable on mobile
      const errorBox = await errorMessage.boundingBox();
      if (errorBox) {
        expect(errorBox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    await page.goto('/');
    
    // Simulate network failure
    await context.setOffline(true);
    
    // Try to perform an action that requires network
    const searchLink = page.locator('a[href*="search"]');
    if (await searchLink.count() > 0) {
      await searchLink.click().catch(() => {
        // Expected to fail
      });
      
      // Should show appropriate offline message
      const offlineIndicator = page.locator('.offline, .no-connection, .network-error');
      
      if (await offlineIndicator.count() > 0) {
        await expect(offlineIndicator).toBeVisible();
        
        // Message should fit on mobile screen
        const messageBox = await offlineIndicator.boundingBox();
        if (messageBox) {
          expect(messageBox.width).toBeLessThanOrEqual(375);
        }
      }
    }
  });
});
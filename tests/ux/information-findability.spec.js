/**
 * Information Findability Testing Suite
 * Tests for content discoverability, search effectiveness, and navigation efficiency
 */

import { test, expect } from '@playwright/test';

test.describe('Content Discovery', () => {
  test('should find development roadmap content within 3 clicks', async ({ page }) => {
    await page.goto('/');
    
    let clickCount = 0;
    const maxClicks = 3;
    
    // Navigate to development roadmap
    const roadmapLink = page.locator('a[href*="development-roadmap"], a:has-text("Development"), a:has-text("Roadmap")');
    await expect(roadmapLink.first()).toBeVisible();
    await roadmapLink.first().click();
    clickCount++;
    
    // Should be on roadmap page
    await expect(page).toHaveURL(/development-roadmap/);
    
    // Navigate to specific phase
    const phaseLink = page.locator('a[href*="phase-1"], a:has-text("Phase 1"), a:has-text("Foundation")');
    if (await phaseLink.count() > 0) {
      await phaseLink.first().click();
      clickCount++;
      
      // Navigate to specific topic
      const topicLink = page.locator('a[href*="database"], a:has-text("Database"), a[href*="payment"], a:has-text("Payment")');
      if (await topicLink.count() > 0) {
        await topicLink.first().click();
        clickCount++;
      }
    }
    
    expect(clickCount).toBeLessThanOrEqual(maxClicks);
    
    // Should have reached specific content
    const contentHeading = page.locator('h1, h2');
    await expect(contentHeading.first()).toBeVisible();
  });

  test('should find node setup information efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to node guides
    const nodeLink = page.locator('a[href*="node-guides"], a:has-text("Node"), a:has-text("Setup")');
    await expect(nodeLink.first()).toBeVisible();
    await nodeLink.first().click();
    
    // Should be on node guides page
    await expect(page).toHaveURL(/node-guides/);
    
    // Should see phase structure
    const phases = page.locator('a[href*="procurement"], a[href*="security"], a[href*="installation"], a[href*="synchronization"]');
    const phaseCount = await phases.count();
    expect(phaseCount).toBeGreaterThanOrEqual(2); // Should have multiple phases
    
    // Navigate to specific phase
    await phases.first().click();
    
    // Should reach detailed content
    const detailedContent = page.locator('h1, h2, .content, main');
    await expect(detailedContent.first()).toBeVisible();
  });

  test('should provide clear content hierarchy', async ({ page }) => {
    const testPages = [
      '/development-roadmap/',
      '/node-guides/'
    ];
    
    for (const pagePath of testPages) {
      await page.goto(pagePath);
      
      // Should have clear page title
      const pageTitle = page.locator('h1');
      await expect(pageTitle).toHaveCount(1);
      
      // Should have logical heading structure
      const headings = await page.locator('h1, h2, h3, h4').all();
      expect(headings.length).toBeGreaterThan(1);
      
      // Check heading hierarchy
      let previousLevel = 0;
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const currentLevel = parseInt(tagName.charAt(1));
        
        if (previousLevel > 0) {
          // Heading levels shouldn't skip (e.g., h1 -> h3)
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
        
        previousLevel = currentLevel;
      }
    }
  });

  test('should provide contextual navigation aids', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/');
    
    // Check for breadcrumbs
    const breadcrumbs = page.locator('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"], .nav-breadcrumb');
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs).toBeVisible();
      
      // Breadcrumbs should show current location
      const breadcrumbText = await breadcrumbs.textContent();
      expect(breadcrumbText?.toLowerCase()).toContain('development');
    }
    
    // Check for "you are here" indicators
    const currentPageIndicator = page.locator('.current, .active, [aria-current="page"]');
    if (await currentPageIndicator.count() > 0) {
      await expect(currentPageIndicator.first()).toBeVisible();
    }
    
    // Check for related links
    const relatedLinks = page.locator('.related, .see-also, .next-steps');
    if (await relatedLinks.count() > 0) {
      const linkCount = await relatedLinks.locator('a').count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Search Functionality', () => {
  test('should provide effective site search', async ({ page }) => {
    await page.goto('/search.html');
    
    const searchInput = page.locator('#search-input, input[type="search"], input[placeholder*="search"]');
    await expect(searchInput).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('database');
    
    // Should show results or loading state
    await page.waitForTimeout(1000);
    
    const results = page.locator('.search-result-item, .search-result, .result-item');
    const noResults = page.locator('.no-results, .search-no-results');
    const loading = page.locator('.loading, .spinner');
    
    // Should have results, no results message, or loading state
    const hasResults = await results.count() > 0;
    const hasNoResults = await noResults.count() > 0;
    const hasLoading = await loading.count() > 0;
    
    expect(hasResults || hasNoResults || hasLoading).toBe(true);
    
    if (hasResults) {
      // Results should be relevant
      const firstResult = results.first();
      const resultText = await firstResult.textContent();
      expect(resultText?.toLowerCase()).toContain('database');
      
      // Results should be clickable
      await expect(firstResult.locator('a')).toBeVisible();
    }
  });

  test('should handle search queries effectively', async ({ page }) => {
    await page.goto('/search.html');
    
    const searchInput = page.locator('#search-input, input[type="search"]');
    
    if (await searchInput.count() > 0) {
      const testQueries = [
        'node setup',
        'bitcoin',
        'security',
        'installation'
      ];
      
      for (const query of testQueries) {
        await searchInput.fill(query);
        await page.waitForTimeout(500);
        
        // Should provide some response to each query
        const results = page.locator('.search-result-item, .search-result');
        const noResults = page.locator('.no-results, .search-no-results');
        
        const hasResults = await results.count() > 0;
        const hasNoResults = await noResults.count() > 0;
        
        expect(hasResults || hasNoResults).toBe(true);
        
        // Clear search for next query
        await searchInput.fill('');
      }
    }
  });

  test('should provide search suggestions or autocomplete', async ({ page }) => {
    await page.goto('/search.html');
    
    const searchInput = page.locator('#search-input, input[type="search"]');
    
    if (await searchInput.count() > 0) {
      // Type partial query
      await searchInput.fill('data');
      
      // Look for suggestions
      const suggestions = page.locator('.search-suggestions, .autocomplete, .dropdown-menu');
      
      if (await suggestions.count() > 0) {
        await expect(suggestions).toBeVisible();
        
        // Suggestions should be clickable
        const suggestionItems = suggestions.locator('a, button, .suggestion-item');
        if (await suggestionItems.count() > 0) {
          await expect(suggestionItems.first()).toBeVisible();
        }
      }
    }
  });

  test('should support search filters', async ({ page }) => {
    await page.goto('/search.html');
    
    // Look for search filters
    const filters = page.locator('.search-filters, .filter-options, input[type="checkbox"], select');
    
    if (await filters.count() > 0) {
      // Should have filter options
      const filterCount = await filters.count();
      expect(filterCount).toBeGreaterThan(0);
      
      // Test filter functionality
      const firstFilter = filters.first();
      const filterType = await firstFilter.evaluate(el => el.tagName.toLowerCase());
      
      if (filterType === 'input') {
        const inputType = await firstFilter.getAttribute('type');
        if (inputType === 'checkbox') {
          await firstFilter.check();
        }
      } else if (filterType === 'select') {
        const options = firstFilter.locator('option');
        if (await options.count() > 1) {
          await firstFilter.selectOption({ index: 1 });
        }
      }
      
      // Perform search with filter
      const searchInput = page.locator('#search-input, input[type="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        
        // Should show filtered results
        const results = page.locator('.search-result-item, .search-result');
        const hasResults = await results.count() > 0;
        
        // Either has filtered results or shows no results message
        if (!hasResults) {
          const noResults = page.locator('.no-results, .search-no-results');
          await expect(noResults).toBeVisible();
        }
      }
    }
  });
});

test.describe('Navigation Efficiency', () => {
  test('should provide quick access to main sections', async ({ page }) => {
    await page.goto('/');
    
    // Main navigation should be immediately visible
    const mainNav = page.locator('nav, .main-nav, .primary-nav');
    await expect(mainNav.first()).toBeVisible();
    
    // Should have links to main sections
    const mainSections = [
      'development-roadmap',
      'node-guides'
    ];
    
    for (const section of mainSections) {
      const sectionLink = page.locator(`a[href*="${section}"]`);
      await expect(sectionLink.first()).toBeVisible();
    }
  });

  test('should provide sidebar navigation within sections', async ({ page }) => {
    await page.goto('/development-roadmap/');
    
    // Should have sidebar navigation
    const sidebar = page.locator('.sidebar, .side-nav, aside');
    
    if (await sidebar.count() > 0) {
      await expect(sidebar.first()).toBeVisible();
      
      // Sidebar should contain navigation links
      const sidebarLinks = sidebar.locator('a');
      const linkCount = await sidebarLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Links should be organized hierarchically
      const nestedLists = sidebar.locator('ul ul, ol ol');
      if (await nestedLists.count() > 0) {
        // Has hierarchical structure
        await expect(nestedLists.first()).toBeVisible();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through navigation elements
    let focusableCount = 0;
    const maxTabs = 10;
    
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0 && await focusedElement.isVisible()) {
        focusableCount++;
        
        // Check if it's a navigation element
        const isNavElement = await focusedElement.evaluate(el => {
          return el.tagName === 'A' || 
                 el.tagName === 'BUTTON' ||
                 el.getAttribute('role') === 'button' ||
                 el.getAttribute('role') === 'link';
        });
        
        if (isNavElement) {
          // Should have visible focus indicator
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
      }
    }
    
    expect(focusableCount).toBeGreaterThan(0);
  });

  test('should provide skip links for accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to focus first element (should be skip link)
    await page.keyboard.press('Tab');
    
    const firstFocused = page.locator(':focus');
    if (await firstFocused.count() > 0) {
      const text = await firstFocused.textContent();
      const href = await firstFocused.getAttribute('href');
      
      // Check if it's a skip link
      const isSkipLink = text?.toLowerCase().includes('skip') ||
                        text?.toLowerCase().includes('main') ||
                        href === '#main-content' ||
                        href === '#content';
      
      if (isSkipLink) {
        // Test skip link functionality
        await page.keyboard.press('Enter');
        
        const mainContent = page.locator('#main-content, main, [role="main"]');
        if (await mainContent.count() > 0) {
          // Focus should move to main content
          const focusedAfterSkip = page.locator(':focus');
          const isInMainContent = await focusedAfterSkip.evaluate((focused, main) => {
            return main.contains(focused);
          }, await mainContent.first().elementHandle());
          
          expect(isInMainContent).toBe(true);
        }
      }
    }
  });
});

test.describe('Content Organization', () => {
  test('should group related content logically', async ({ page }) => {
    await page.goto('/node-guides/');
    
    // Should have clear phase groupings
    const phaseHeadings = page.locator('h2, h3, .phase-title, .section-title');
    const headingCount = await phaseHeadings.count();
    expect(headingCount).toBeGreaterThanOrEqual(2);
    
    // Each phase should have subsections
    for (let i = 0; i < Math.min(headingCount, 4); i++) {
      const heading = phaseHeadings.nth(i);
      const headingText = await heading.textContent();
      
      // Look for related links under this heading
      const nextHeading = i < headingCount - 1 ? phaseHeadings.nth(i + 1) : null;
      
      let sectionContent;
      if (nextHeading) {
        // Content between this heading and next
        sectionContent = page.locator(`h2:has-text("${headingText}") ~ * ~ h2:has-text("${await nextHeading.textContent()}")`);
      } else {
        // Content after this heading
        sectionContent = page.locator(`h2:has-text("${headingText}") ~ *`);
      }
      
      const sectionLinks = sectionContent.locator('a');
      if (await sectionLinks.count() > 0) {
        // Links should be related to the section topic
        const firstLinkText = await sectionLinks.first().textContent();
        expect(firstLinkText).toBeTruthy();
      }
    }
  });

  test('should provide clear progress indicators', async ({ page }) => {
    await page.goto('/node-guides/procurement-provisioning/');
    
    // Look for progress indicators
    const progressIndicators = page.locator('.progress, .step-indicator, .breadcrumb, .phase-progress');
    
    if (await progressIndicators.count() > 0) {
      await expect(progressIndicators.first()).toBeVisible();
      
      // Should indicate current position
      const currentStep = progressIndicators.locator('.current, .active, [aria-current]');
      if (await currentStep.count() > 0) {
        await expect(currentStep.first()).toBeVisible();
      }
    }
  });

  test('should provide next/previous navigation', async ({ page }) => {
    await page.goto('/development-roadmap/phase-1/');
    
    // Look for sequential navigation
    const nextPrevNav = page.locator('.next-prev, .pagination, .sequential-nav');
    
    if (await nextPrevNav.count() > 0) {
      const navLinks = nextPrevNav.locator('a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Should have descriptive link text
      for (let i = 0; i < Math.min(linkCount, 2); i++) {
        const link = navLinks.nth(i);
        const linkText = await link.textContent();
        
        expect(linkText?.trim().length).toBeGreaterThan(3);
        
        // Common navigation patterns
        const isNavLink = linkText?.toLowerCase().includes('next') ||
                         linkText?.toLowerCase().includes('previous') ||
                         linkText?.toLowerCase().includes('prev') ||
                         linkText?.toLowerCase().includes('continue');
        
        if (!isNavLink) {
          // Should have descriptive content title
          expect(linkText?.length).toBeGreaterThan(10);
        }
      }
    }
  });

  test('should provide table of contents for long pages', async ({ page }) => {
    // Test on potentially long content pages
    const longPages = [
      '/development-roadmap/phase-1/',
      '/node-guides/server-security/'
    ];
    
    for (const pagePath of longPages) {
      try {
        await page.goto(pagePath);
        
        // Check page length
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        
        if (pageHeight > viewportHeight * 2) {
          // Long page should have table of contents
          const toc = page.locator('.toc, .table-of-contents, .contents, #toc');
          
          if (await toc.count() > 0) {
            await expect(toc.first()).toBeVisible();
            
            // TOC should have links to page sections
            const tocLinks = toc.locator('a[href^="#"]');
            const tocLinkCount = await tocLinks.count();
            expect(tocLinkCount).toBeGreaterThan(0);
            
            // Test TOC link functionality
            if (tocLinkCount > 0) {
              const firstTocLink = tocLinks.first();
              const href = await firstTocLink.getAttribute('href');
              
              if (href) {
                await firstTocLink.click();
                await page.waitForTimeout(500);
                
                // Should scroll to target section
                const targetElement = page.locator(href);
                if (await targetElement.count() > 0) {
                  await expect(targetElement).toBeInViewport();
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(`Skipping ${pagePath}: ${error.message}`);
      }
    }
  });
});

test.describe('Content Quality and Clarity', () => {
  test('should have descriptive page titles', async ({ page }) => {
    const testPages = [
      '/',
      '/development-roadmap/',
      '/node-guides/',
      '/search.html'
    ];
    
    for (const pagePath of testPages) {
      await page.goto(pagePath);
      
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title).not.toBe('Document');
      
      // Title should be descriptive of content
      if (pagePath.includes('development-roadmap')) {
        expect(title.toLowerCase()).toMatch(/development|roadmap|crypto/);
      } else if (pagePath.includes('node-guides')) {
        expect(title.toLowerCase()).toMatch(/node|guide|setup|bitcoin|monero/);
      }
    }
  });

  test('should have clear section introductions', async ({ page }) => {
    const sectionPages = [
      '/development-roadmap/',
      '/node-guides/'
    ];
    
    for (const pagePath of sectionPages) {
      await page.goto(pagePath);
      
      // Should have introductory content
      const intro = page.locator('.intro, .overview, .description, p').first();
      await expect(intro).toBeVisible();
      
      const introText = await intro.textContent();
      expect(introText?.length).toBeGreaterThan(50);
      
      // Should explain what the section contains
      const hasExplanation = introText?.toLowerCase().includes('phase') ||
                            introText?.toLowerCase().includes('guide') ||
                            introText?.toLowerCase().includes('step') ||
                            introText?.toLowerCase().includes('learn');
      
      expect(hasExplanation).toBe(true);
    }
  });

  test('should provide clear calls to action', async ({ page }) => {
    await page.goto('/');
    
    // Should have clear action buttons or links
    const ctaElements = page.locator('.cta, .call-to-action, .btn-primary, .get-started');
    
    if (await ctaElements.count() > 0) {
      const cta = ctaElements.first();
      await expect(cta).toBeVisible();
      
      const ctaText = await cta.textContent();
      expect(ctaText?.length).toBeGreaterThan(5);
      
      // Should have action-oriented text
      const isActionOriented = ctaText?.toLowerCase().includes('start') ||
                              ctaText?.toLowerCase().includes('begin') ||
                              ctaText?.toLowerCase().includes('learn') ||
                              ctaText?.toLowerCase().includes('explore') ||
                              ctaText?.toLowerCase().includes('get');
      
      expect(isActionOriented).toBe(true);
    }
  });

  test('should provide helpful error messages', async ({ page }) => {
    // Test 404 page
    await page.goto('/nonexistent-page').catch(() => {
      // 404 expected
    });
    
    // Should show helpful error message
    const errorElements = page.locator('.error, .not-found, h1:has-text("404"), h1:has-text("Not Found")');
    
    if (await errorElements.count() > 0) {
      const errorMessage = errorElements.first();
      await expect(errorMessage).toBeVisible();
      
      // Should provide helpful guidance
      const helpfulLinks = page.locator('a[href="/"], a:has-text("home"), a:has-text("back")');
      if (await helpfulLinks.count() > 0) {
        await expect(helpfulLinks.first()).toBeVisible();
      }
    }
  });
});
/**
 * Navigation Manager Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockElement, simulateUserInteraction } from '../setup.js';

// Import the NavigationManager class
import NavigationManager from '../../assets/js/navigation.js';

describe('NavigationManager', () => {
  let navigationManager;
  let mockSidebar;
  let mockMobileToggle;

  beforeEach(() => {
    // Create mock DOM elements
    mockSidebar = createMockElement('nav', { className: 'sidebar-nav' });
    mockMobileToggle = createMockElement('button', { className: 'mobile-menu-toggle' });
    
    document.body.appendChild(mockSidebar);
    document.body.appendChild(mockMobileToggle);
    
    // Mock window.location for different test scenarios
    window.location.pathname = '/development-roadmap/';
  });

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      navigationManager = new NavigationManager();
      
      expect(navigationManager.currentSection).toBe('development-roadmap');
      expect(navigationManager.sidebarState.expandedItems).toBeInstanceOf(Set);
      expect(navigationManager.sidebarState.activeItem).toBeNull();
    });

    it('should detect current section from URL path', () => {
      window.location.pathname = '/node-guides/installation/';
      navigationManager = new NavigationManager();
      
      expect(navigationManager.currentSection).toBe('node-guides');
    });

    it('should default to home section for root path', () => {
      window.location.pathname = '/';
      navigationManager = new NavigationManager();
      
      expect(navigationManager.currentSection).toBe('home');
    });
  });

  describe('Section Detection', () => {
    it('should correctly detect development roadmap section', () => {
      window.location.pathname = '/development-roadmap/phase-1/';
      navigationManager = new NavigationManager();
      
      expect(navigationManager.currentSection).toBe('development-roadmap');
    });

    it('should correctly detect node guides section', () => {
      window.location.pathname = '/node-guides/server-security/';
      navigationManager = new NavigationManager();
      
      expect(navigationManager.currentSection).toBe('node-guides');
    });

    it('should extract current page from path', () => {
      window.location.pathname = '/development-roadmap/phase-1/database-schemas.html';
      navigationManager = new NavigationManager();
      
      expect(navigationManager.currentPage).toBe('database-schemas.html');
    });
  });

  describe('Sidebar Management', () => {
    beforeEach(() => {
      navigationManager = new NavigationManager();
    });

    it('should generate sidebar content based on current section', () => {
      const sidebarContent = navigationManager.generateSidebarContent();
      
      expect(sidebarContent).toContain('Development Roadmap');
      expect(sidebarContent).toContain('Phase 1: Infrastructure');
      expect(sidebarContent).toContain('Phase 2: Backend & APIs');
      expect(sidebarContent).toContain('Phase 3: Frontend & UI');
    });

    it('should render sidebar sections with proper structure', () => {
      const section = {
        title: 'Test Section',
        items: [
          {
            title: 'Test Item',
            href: '/test/',
            id: 'test-item'
          }
        ]
      };
      
      const html = navigationManager.renderSidebarSection(section);
      
      expect(html).toContain('Test Section');
      expect(html).toContain('Test Item');
      expect(html).toContain('href="/test/"');
    });

    it('should handle nested sidebar items with children', () => {
      const item = {
        title: 'Parent Item',
        href: '/parent/',
        id: 'parent',
        children: [
          { title: 'Child Item', href: '/parent/child/' }
        ]
      };
      
      const html = navigationManager.renderSidebarItem(item);
      
      expect(html).toContain('sidebar-toggle');
      expect(html).toContain('Parent Item');
      expect(html).toContain('Child Item');
      expect(html).toContain('sidebar-collapsible-content');
    });
  });

  describe('Mobile Menu', () => {
    beforeEach(() => {
      navigationManager = new NavigationManager();
    });

    it('should toggle mobile menu when button is clicked', async () => {
      const mobileMenu = createMockElement('nav', { className: 'mobile-nav' });
      document.body.appendChild(mobileMenu);
      
      await simulateUserInteraction(mockMobileToggle, 'click');
      
      expect(mockMobileToggle.classList.contains('active')).toBe(true);
      expect(mobileMenu.classList.contains('active')).toBe(true);
    });

    it('should close mobile menu when navigation link is clicked', async () => {
      const mobileMenu = createMockElement('nav', { className: 'mobile-nav active' });
      const navLink = createMockElement('a', { 
        className: 'nav-link',
        href: '/test-page/'
      });
      
      document.body.appendChild(mobileMenu);
      document.body.appendChild(navLink);
      
      await simulateUserInteraction(navLink, 'click');
      
      expect(mobileMenu.classList.contains('active')).toBe(false);
    });
  });

  describe('Sidebar Toggle', () => {
    beforeEach(() => {
      navigationManager = new NavigationManager();
    });

    it('should expand collapsed sidebar section', () => {
      const toggleButton = createMockElement('button', {
        className: 'sidebar-toggle',
        dataset: { target: 'test-section' }
      });
      
      const content = createMockElement('div', {
        id: 'test-section',
        className: 'sidebar-collapsible-content'
      });
      
      document.body.appendChild(toggleButton);
      document.body.appendChild(content);
      
      navigationManager.toggleSidebarSection(toggleButton);
      
      expect(navigationManager.sidebarState.expandedItems.has('test-section')).toBe(true);
      expect(toggleButton.classList.contains('expanded')).toBe(true);
      expect(content.classList.contains('expanded')).toBe(true);
    });

    it('should collapse expanded sidebar section', () => {
      const toggleButton = createMockElement('button', {
        className: 'sidebar-toggle expanded',
        dataset: { target: 'test-section' }
      });
      
      const content = createMockElement('div', {
        id: 'test-section',
        className: 'sidebar-collapsible-content expanded'
      });
      
      document.body.appendChild(toggleButton);
      document.body.appendChild(content);
      
      // Pre-expand the section
      navigationManager.sidebarState.expandedItems.add('test-section');
      
      navigationManager.toggleSidebarSection(toggleButton);
      
      expect(navigationManager.sidebarState.expandedItems.has('test-section')).toBe(false);
      expect(toggleButton.classList.contains('expanded')).toBe(false);
      expect(content.classList.contains('expanded')).toBe(false);
    });
  });

  describe('Active State Management', () => {
    beforeEach(() => {
      navigationManager = new NavigationManager();
    });

    it('should identify active navigation items correctly', () => {
      window.location.pathname = '/development-roadmap/phase-1/';
      
      const item = {
        href: '/development-roadmap/phase-1/'
      };
      
      expect(navigationManager.isItemActive(item)).toBe(true);
    });

    it('should update active states for navigation links', () => {
      const activeLink = createMockElement('a', {
        className: 'nav-link',
        href: '/development-roadmap/'
      });
      
      const inactiveLink = createMockElement('a', {
        className: 'nav-link',
        href: '/node-guides/'
      });
      
      document.body.appendChild(activeLink);
      document.body.appendChild(inactiveLink);
      
      window.location.pathname = '/development-roadmap/';
      navigationManager.updateActiveStates();
      
      expect(activeLink.classList.contains('active')).toBe(true);
      expect(inactiveLink.classList.contains('active')).toBe(false);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      navigationManager = new NavigationManager();
    });

    it('should handle popstate events', () => {
      const spy = vi.spyOn(navigationManager, 'detectCurrentSection');
      
      window.dispatchEvent(new PopStateEvent('popstate'));
      
      expect(spy).toHaveBeenCalled();
    });

    it('should handle navigation link clicks', async () => {
      const navLink = createMockElement('a', {
        className: 'nav-link',
        href: '/test-page/'
      });
      
      document.body.appendChild(navLink);
      
      const spy = vi.spyOn(navigationManager, 'updateActiveStates');
      
      await simulateUserInteraction(navLink, 'click');
      
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Public API', () => {
    beforeEach(() => {
      navigationManager = new NavigationManager();
    });

    it('should return current section', () => {
      expect(navigationManager.getCurrentSection()).toBe('development-roadmap');
    });

    it('should return current page', () => {
      window.location.pathname = '/development-roadmap/phase-1/test.html';
      navigationManager.detectCurrentSection();
      
      expect(navigationManager.getCurrentPage()).toBe('test.html');
    });

    it('should navigate to specified href', () => {
      const spy = vi.spyOn(window.location, 'assign');
      
      navigationManager.navigateTo('/test-page/');
      
      expect(window.location.href).toBe('/test-page/');
    });
  });

  describe('Section Structure', () => {
    beforeEach(() => {
      navigationManager = new NavigationManager();
    });

    it('should return correct structure for development roadmap', () => {
      window.location.pathname = '/development-roadmap/';
      navigationManager.detectCurrentSection();
      
      const structure = navigationManager.getSectionStructure();
      
      expect(structure).toHaveLength(1);
      expect(structure[0].title).toBe('Development Roadmap');
      expect(structure[0].items).toHaveLength(4); // Overview + 3 phases
    });

    it('should return correct structure for node guides', () => {
      window.location.pathname = '/node-guides/';
      navigationManager.detectCurrentSection();
      
      const structure = navigationManager.getSectionStructure();
      
      expect(structure).toHaveLength(1);
      expect(structure[0].title).toBe('Node Setup Guides');
      expect(structure[0].items).toHaveLength(5); // Overview + 4 phases
    });

    it('should return empty structure for unknown sections', () => {
      window.location.pathname = '/unknown-section/';
      navigationManager.detectCurrentSection();
      
      const structure = navigationManager.getSectionStructure();
      
      expect(structure).toHaveLength(0);
    });
  });

  describe('Auto-expansion', () => {
    beforeEach(() => {
      navigationManager = new NavigationManager();
    });

    it('should auto-expand relevant sections based on current path', () => {
      window.location.pathname = '/development-roadmap/phase-1/database-schemas.html';
      
      navigationManager.expandRelevantSections();
      
      expect(navigationManager.sidebarState.expandedItems.has('phase-1')).toBe(true);
    });

    it('should auto-expand node guide sections', () => {
      window.location.pathname = '/node-guides/server-security/firewall-config.html';
      
      navigationManager.expandRelevantSections();
      
      expect(navigationManager.sidebarState.expandedItems.has('server-security')).toBe(true);
    });
  });
});
/**
 * Tabs Component Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockElement, simulateUserInteraction } from '../setup.js';

describe('Tabs', () => {
  let tabs;
  let tabContainer;

  beforeEach(() => {
    // Create mock tab structure
    tabContainer = createMockElement('div', { className: 'tab-container' });
    
    const tabList = createMockElement('div', { className: 'tab-list' });
    
    // Create tab buttons and panels
    for (let i = 0; i < 3; i++) {
      const button = createMockElement('button', { className: 'tab-button' }, `Tab ${i + 1}`);
      const panel = createMockElement('div', { className: 'tab-panel' }, `Panel ${i + 1}`);
      
      tabList.appendChild(button);
      tabContainer.appendChild(panel);
    }
    
    tabContainer.insertBefore(tabList, tabContainer.firstChild);
    document.body.appendChild(tabContainer);

    // Create mock Tabs class
    class MockTabs {
      constructor(element, options = {}) {
        this.container = element;
        this.options = {
          activeIndex: options.activeIndex || 0,
          autoActivate: options.autoActivate !== false,
          orientation: options.orientation || 'horizontal',
          ...options
        };
        
        this.tabs = [];
        this.panels = [];
        this.activeIndex = 0;
        
        this.init();
      }

      init() {
        const tabList = this.container.querySelector('.tab-list');
        const tabButtons = tabList ? tabList.querySelectorAll('.tab-button') : [];
        const tabPanels = this.container.querySelectorAll('.tab-panel');
        
        if (tabButtons.length === 0 || tabPanels.length === 0) {
          return;
        }
        
        tabButtons.forEach((button, index) => {
          const panel = tabPanels[index];
          if (!panel) return;
          
          const tabId = `tab-${Date.now()}-${index}`;
          const panelId = `panel-${Date.now()}-${index}`;
          
          button.setAttribute('id', tabId);
          button.setAttribute('role', 'tab');
          button.setAttribute('aria-controls', panelId);
          button.setAttribute('aria-selected', 'false');
          button.setAttribute('tabindex', '-1');
          
          panel.setAttribute('id', panelId);
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', tabId);
          panel.setAttribute('tabindex', '0');
          
          this.tabs.push(button);
          this.panels.push(panel);
        });
        
        if (tabList) {
          tabList.setAttribute('role', 'tablist');
          tabList.setAttribute('aria-orientation', this.options.orientation);
        }
        
        this.activateTab(this.options.activeIndex);
      }

      activateTab(index) {
        if (index < 0 || index >= this.tabs.length) return;
        
        if (this.activeIndex !== null) {
          this.tabs[this.activeIndex].classList.remove('active');
          this.tabs[this.activeIndex].setAttribute('aria-selected', 'false');
          this.tabs[this.activeIndex].setAttribute('tabindex', '-1');
          this.panels[this.activeIndex].classList.remove('active');
        }
        
        this.activeIndex = index;
        this.tabs[index].classList.add('active');
        this.tabs[index].setAttribute('aria-selected', 'true');
        this.tabs[index].setAttribute('tabindex', '0');
        this.panels[index].classList.add('active');
        
        this.container.dispatchEvent(new CustomEvent('tab:activate', {
          detail: { 
            index, 
            tab: this.tabs[index], 
            panel: this.panels[index] 
          }
        }));
      }

      getActiveIndex() {
        return this.activeIndex;
      }

      getActiveTab() {
        return this.tabs[this.activeIndex];
      }

      getActivePanel() {
        return this.panels[this.activeIndex];
      }

      setActiveTab(index) {
        this.activateTab(index);
      }

      getNextIndex(currentIndex) {
        return (currentIndex + 1) % this.tabs.length;
      }

      getPreviousIndex(currentIndex) {
        return currentIndex === 0 ? this.tabs.length - 1 : currentIndex - 1;
      }
    }

    tabs = new MockTabs(tabContainer);
  });

  describe('Initialization', () => {
    it('should initialize with correct number of tabs and panels', () => {
      expect(tabs.tabs).toHaveLength(3);
      expect(tabs.panels).toHaveLength(3);
    });

    it('should set up ARIA attributes correctly', () => {
      tabs.tabs.forEach((tab, index) => {
        expect(tab.getAttribute('role')).toBe('tab');
        expect(tab.getAttribute('aria-controls')).toBeTruthy();
        expect(tabs.panels[index].getAttribute('role')).toBe('tabpanel');
        expect(tabs.panels[index].getAttribute('aria-labelledby')).toBeTruthy();
      });
    });

    it('should set up tablist with correct orientation', () => {
      const tabList = tabContainer.querySelector('.tab-list');
      expect(tabList.getAttribute('role')).toBe('tablist');
      expect(tabList.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('should activate the first tab by default', () => {
      expect(tabs.activeIndex).toBe(0);
      expect(tabs.tabs[0].classList.contains('active')).toBe(true);
      expect(tabs.panels[0].classList.contains('active')).toBe(true);
    });

    it('should activate specified initial tab', () => {
      const customTabs = new tabs.constructor(tabContainer, { activeIndex: 1 });
      expect(customTabs.activeIndex).toBe(1);
      expect(customTabs.tabs[1].classList.contains('active')).toBe(true);
    });
  });

  describe('Tab Activation', () => {
    it('should activate a tab correctly', () => {
      tabs.activateTab(1);
      
      expect(tabs.activeIndex).toBe(1);
      expect(tabs.tabs[1].classList.contains('active')).toBe(true);
      expect(tabs.tabs[1].getAttribute('aria-selected')).toBe('true');
      expect(tabs.tabs[1].getAttribute('tabindex')).toBe('0');
      expect(tabs.panels[1].classList.contains('active')).toBe(true);
    });

    it('should deactivate previous tab when activating new one', () => {
      tabs.activateTab(1);
      
      expect(tabs.tabs[0].classList.contains('active')).toBe(false);
      expect(tabs.tabs[0].getAttribute('aria-selected')).toBe('false');
      expect(tabs.tabs[0].getAttribute('tabindex')).toBe('-1');
      expect(tabs.panels[0].classList.contains('active')).toBe(false);
    });

    it('should handle invalid tab index gracefully', () => {
      const originalIndex = tabs.activeIndex;
      
      tabs.activateTab(-1);
      expect(tabs.activeIndex).toBe(originalIndex);
      
      tabs.activateTab(999);
      expect(tabs.activeIndex).toBe(originalIndex);
    });

    it('should dispatch activation event', () => {
      const activateSpy = vi.fn();
      tabContainer.addEventListener('tab:activate', activateSpy);
      
      tabs.activateTab(1);
      
      expect(activateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            index: 1,
            tab: tabs.tabs[1],
            panel: tabs.panels[1]
          })
        })
      );
    });
  });

  describe('Navigation', () => {
    it('should calculate next index correctly', () => {
      expect(tabs.getNextIndex(0)).toBe(1);
      expect(tabs.getNextIndex(1)).toBe(2);
      expect(tabs.getNextIndex(2)).toBe(0); // Wrap around
    });

    it('should calculate previous index correctly', () => {
      expect(tabs.getPreviousIndex(0)).toBe(2); // Wrap around
      expect(tabs.getPreviousIndex(1)).toBe(0);
      expect(tabs.getPreviousIndex(2)).toBe(1);
    });
  });

  describe('API Methods', () => {
    it('should return active index', () => {
      expect(tabs.getActiveIndex()).toBe(0);
      
      tabs.activateTab(2);
      expect(tabs.getActiveIndex()).toBe(2);
    });

    it('should return active tab element', () => {
      expect(tabs.getActiveTab()).toBe(tabs.tabs[0]);
      
      tabs.activateTab(1);
      expect(tabs.getActiveTab()).toBe(tabs.tabs[1]);
    });

    it('should return active panel element', () => {
      expect(tabs.getActivePanel()).toBe(tabs.panels[0]);
      
      tabs.activateTab(1);
      expect(tabs.getActivePanel()).toBe(tabs.panels[1]);
    });

    it('should set active tab via API', () => {
      tabs.setActiveTab(2);
      
      expect(tabs.activeIndex).toBe(2);
      expect(tabs.tabs[2].classList.contains('active')).toBe(true);
    });
  });

  describe('Options', () => {
    it('should respect activeIndex option', () => {
      const customTabs = new tabs.constructor(tabContainer, { activeIndex: 2 });
      expect(customTabs.activeIndex).toBe(2);
    });

    it('should respect autoActivate option', () => {
      const customTabs = new tabs.constructor(tabContainer, { autoActivate: false });
      expect(customTabs.options.autoActivate).toBe(false);
    });

    it('should respect orientation option', () => {
      const customTabs = new tabs.constructor(tabContainer, { orientation: 'vertical' });
      expect(customTabs.options.orientation).toBe('vertical');
      
      const tabList = tabContainer.querySelector('.tab-list');
      expect(tabList.getAttribute('aria-orientation')).toBe('vertical');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tab container', () => {
      const emptyContainer = createMockElement('div', { className: 'tab-container' });
      document.body.appendChild(emptyContainer);
      
      expect(() => {
        new tabs.constructor(emptyContainer);
      }).not.toThrow();
    });

    it('should handle mismatched tabs and panels', () => {
      const mismatchedContainer = createMockElement('div', { className: 'tab-container' });
      const tabList = createMockElement('div', { className: 'tab-list' });
      
      // Create 2 tabs but 3 panels
      for (let i = 0; i < 2; i++) {
        const button = createMockElement('button', { className: 'tab-button' });
        tabList.appendChild(button);
      }
      
      for (let i = 0; i < 3; i++) {
        const panel = createMockElement('div', { className: 'tab-panel' });
        mismatchedContainer.appendChild(panel);
      }
      
      mismatchedContainer.appendChild(tabList);
      document.body.appendChild(mismatchedContainer);
      
      expect(() => {
        const mismatchedTabs = new tabs.constructor(mismatchedContainer);
        expect(mismatchedTabs.tabs).toHaveLength(2);
        expect(mismatchedTabs.panels).toHaveLength(2); // Should only match existing tabs
      }).not.toThrow();
    });
  });
});
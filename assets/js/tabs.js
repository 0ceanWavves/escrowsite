/**
 * Tabbed Interface Component Module
 * Provides tabbed interface functionality with keyboard navigation and focus management
 */

class Tabs {
  constructor(element, options = {}) {
    this.container = element;
    this.options = {
      activeIndex: options.activeIndex || 0,
      autoActivate: options.autoActivate !== false, // true by default
      orientation: options.orientation || 'horizontal', // horizontal or vertical
      ...options
    };
    
    this.tabs = [];
    this.panels = [];
    this.activeIndex = 0;
    
    this.init();
  }

  init() {
    // Find tab buttons and panels
    const tabList = this.container.querySelector('.tab-list');
    const tabButtons = tabList ? tabList.querySelectorAll('.tab-button') : [];
    const tabPanels = this.container.querySelectorAll('.tab-panel');
    
    if (tabButtons.length === 0 || tabPanels.length === 0) {
      console.warn('Tabs: No tab buttons or panels found');
      return;
    }
    
    // Set up ARIA attributes and IDs
    tabButtons.forEach((button, index) => {
      const panel = tabPanels[index];
      if (!panel) return;
      
      const tabId = `tab-${Date.now()}-${index}`;
      const panelId = `panel-${Date.now()}-${index}`;
      
      // Configure tab button
      button.setAttribute('id', tabId);
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panelId);
      button.setAttribute('aria-selected', 'false');
      button.setAttribute('tabindex', '-1');
      
      // Configure tab panel
      panel.setAttribute('id', panelId);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);
      panel.setAttribute('tabindex', '0');
      
      // Store references
      this.tabs.push(button);
      this.panels.push(panel);
      
      // Add event listeners
      button.addEventListener('click', (e) => this.handleClick(e, index));
      button.addEventListener('keydown', (e) => this.handleKeydown(e, index));
      button.addEventListener('focus', () => this.handleFocus(index));
    });
    
    // Set up tab list ARIA attributes
    if (tabList) {
      tabList.setAttribute('role', 'tablist');
      tabList.setAttribute('aria-orientation', this.options.orientation);
    }
    
    // Activate initial tab
    this.activateTab(this.options.activeIndex);
  }

  handleClick(event, index) {
    event.preventDefault();
    this.activateTab(index);
  }

  handleKeydown(event, index) {
    const { key } = event;
    let newIndex = index;
    
    // Handle different orientations
    const isHorizontal = this.options.orientation === 'horizontal';
    
    switch (key) {
      case 'ArrowLeft':
        if (isHorizontal) {
          event.preventDefault();
          newIndex = this.getPreviousIndex(index);
        }
        break;
        
      case 'ArrowRight':
        if (isHorizontal) {
          event.preventDefault();
          newIndex = this.getNextIndex(index);
        }
        break;
        
      case 'ArrowUp':
        if (!isHorizontal) {
          event.preventDefault();
          newIndex = this.getPreviousIndex(index);
        }
        break;
        
      case 'ArrowDown':
        if (!isHorizontal) {
          event.preventDefault();
          newIndex = this.getNextIndex(index);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
        
      case 'End':
        event.preventDefault();
        newIndex = this.tabs.length - 1;
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateTab(index);
        return;
    }
    
    // Move focus and optionally activate
    if (newIndex !== index) {
      this.focusTab(newIndex);
      if (this.options.autoActivate) {
        this.activateTab(newIndex);
      }
    }
  }

  handleFocus(index) {
    // If auto-activate is disabled, only move focus
    if (!this.options.autoActivate) {
      this.focusTab(index);
    }
  }

  activateTab(index) {
    if (index < 0 || index >= this.tabs.length) return;
    
    // Deactivate current tab
    if (this.activeIndex !== null) {
      this.tabs[this.activeIndex].classList.remove('active');
      this.tabs[this.activeIndex].setAttribute('aria-selected', 'false');
      this.tabs[this.activeIndex].setAttribute('tabindex', '-1');
      this.panels[this.activeIndex].classList.remove('active');
    }
    
    // Activate new tab
    this.activeIndex = index;
    this.tabs[index].classList.add('active');
    this.tabs[index].setAttribute('aria-selected', 'true');
    this.tabs[index].setAttribute('tabindex', '0');
    this.panels[index].classList.add('active');
    
    // Focus the active tab
    this.tabs[index].focus();
    
    // Dispatch custom event
    this.container.dispatchEvent(new CustomEvent('tab:activate', {
      detail: { 
        index, 
        tab: this.tabs[index], 
        panel: this.panels[index] 
      }
    }));
  }

  focusTab(index) {
    if (index >= 0 && index < this.tabs.length) {
      this.tabs[index].focus();
    }
  }

  getNextIndex(currentIndex) {
    return (currentIndex + 1) % this.tabs.length;
  }

  getPreviousIndex(currentIndex) {
    return currentIndex === 0 ? this.tabs.length - 1 : currentIndex - 1;
  }

  // Public API methods
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

  addTab(tabButton, tabPanel) {
    // Add new tab and panel to the component
    const index = this.tabs.length;
    const tabId = `tab-${Date.now()}-${index}`;
    const panelId = `panel-${Date.now()}-${index}`;
    
    // Configure new tab button
    tabButton.setAttribute('id', tabId);
    tabButton.setAttribute('role', 'tab');
    tabButton.setAttribute('aria-controls', panelId);
    tabButton.setAttribute('aria-selected', 'false');
    tabButton.setAttribute('tabindex', '-1');
    
    // Configure new tab panel
    tabPanel.setAttribute('id', panelId);
    tabPanel.setAttribute('role', 'tabpanel');
    tabPanel.setAttribute('aria-labelledby', tabId);
    tabPanel.setAttribute('tabindex', '0');
    
    // Add event listeners
    tabButton.addEventListener('click', (e) => this.handleClick(e, index));
    tabButton.addEventListener('keydown', (e) => this.handleKeydown(e, index));
    tabButton.addEventListener('focus', () => this.handleFocus(index));
    
    // Store references
    this.tabs.push(tabButton);
    this.panels.push(tabPanel);
    
    return index;
  }

  removeTab(index) {
    if (index < 0 || index >= this.tabs.length) return;
    
    // Remove event listeners by cloning elements
    const tab = this.tabs[index];
    const panel = this.panels[index];
    
    const newTab = tab.cloneNode(true);
    const newPanel = panel.cloneNode(true);
    
    tab.parentNode.replaceChild(newTab, tab);
    panel.parentNode.replaceChild(newPanel, panel);
    
    // Remove from arrays
    this.tabs.splice(index, 1);
    this.panels.splice(index, 1);
    
    // Adjust active index if necessary
    if (index === this.activeIndex) {
      const newActiveIndex = Math.min(index, this.tabs.length - 1);
      this.activateTab(newActiveIndex);
    } else if (index < this.activeIndex) {
      this.activeIndex--;
    }
  }

  destroy() {
    // Remove all event listeners and clean up
    this.tabs.forEach(tab => {
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
    });
    
    this.tabs = [];
    this.panels = [];
    this.activeIndex = null;
  }
}

// Auto-initialize tabs on page load
document.addEventListener('DOMContentLoaded', () => {
  const tabContainers = document.querySelectorAll('.tab-container');
  tabContainers.forEach(container => {
    // Check for data attributes to configure options
    const activeIndex = parseInt(container.dataset.activeIndex) || 0;
    const autoActivate = container.dataset.autoActivate !== 'false';
    const orientation = container.dataset.orientation || 'horizontal';
    
    new Tabs(container, {
      activeIndex,
      autoActivate,
      orientation
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Tabs;
}

// Global namespace for direct usage
window.Tabs = Tabs;
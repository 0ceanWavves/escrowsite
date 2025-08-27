/**
 * Accordion Component Module
 * Provides collapsible functionality with ARIA support and keyboard navigation
 */

class Accordion {
  constructor(element, options = {}) {
    this.accordion = element;
    this.options = {
      allowMultiple: options.allowMultiple || false,
      animationDuration: options.animationDuration || 300,
      ...options
    };
    
    this.items = [];
    this.init();
  }

  init() {
    // Find all accordion items
    const items = this.accordion.querySelectorAll('.accordion-item');
    
    items.forEach((item, index) => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      
      if (!header || !content) return;
      
      // Set up ARIA attributes
      const headerId = `accordion-header-${Date.now()}-${index}`;
      const contentId = `accordion-content-${Date.now()}-${index}`;
      
      header.setAttribute('id', headerId);
      header.setAttribute('aria-controls', contentId);
      header.setAttribute('aria-expanded', 'false');
      
      content.setAttribute('id', contentId);
      content.setAttribute('aria-labelledby', headerId);
      content.setAttribute('hidden', '');
      
      // Store item data
      this.items.push({
        header,
        content,
        isExpanded: false
      });
      
      // Add event listeners
      header.addEventListener('click', (e) => this.toggle(index, e));
      header.addEventListener('keydown', (e) => this.handleKeydown(e, index));
    });
  }

  toggle(index, event = null) {
    if (event) {
      event.preventDefault();
    }
    
    const item = this.items[index];
    if (!item) return;
    
    if (item.isExpanded) {
      this.collapse(index);
    } else {
      // If allowMultiple is false, collapse all other items
      if (!this.options.allowMultiple) {
        this.items.forEach((_, i) => {
          if (i !== index && this.items[i].isExpanded) {
            this.collapse(i);
          }
        });
      }
      this.expand(index);
    }
  }

  expand(index) {
    const item = this.items[index];
    if (!item || item.isExpanded) return;
    
    item.isExpanded = true;
    item.header.setAttribute('aria-expanded', 'true');
    item.content.removeAttribute('hidden');
    
    // Add expanding animation class
    item.content.classList.add('expanding');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      item.content.classList.remove('expanding');
    }, this.options.animationDuration);
    
    // Dispatch custom event
    this.accordion.dispatchEvent(new CustomEvent('accordion:expand', {
      detail: { index, item }
    }));
  }

  collapse(index) {
    const item = this.items[index];
    if (!item || !item.isExpanded) return;
    
    item.isExpanded = false;
    item.header.setAttribute('aria-expanded', 'false');
    
    // Add collapsing animation class
    item.content.classList.add('collapsing');
    
    // Hide content after animation completes
    setTimeout(() => {
      item.content.setAttribute('hidden', '');
      item.content.classList.remove('collapsing');
    }, this.options.animationDuration);
    
    // Dispatch custom event
    this.accordion.dispatchEvent(new CustomEvent('accordion:collapse', {
      detail: { index, item }
    }));
  }

  handleKeydown(event, index) {
    const { key } = event;
    
    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle(index);
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        this.focusNext(index);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevious(index);
        break;
        
      case 'Home':
        event.preventDefault();
        this.focusFirst();
        break;
        
      case 'End':
        event.preventDefault();
        this.focusLast();
        break;
    }
  }

  focusNext(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.items.length;
    this.items[nextIndex].header.focus();
  }

  focusPrevious(currentIndex) {
    const prevIndex = currentIndex === 0 ? this.items.length - 1 : currentIndex - 1;
    this.items[prevIndex].header.focus();
  }

  focusFirst() {
    if (this.items.length > 0) {
      this.items[0].header.focus();
    }
  }

  focusLast() {
    if (this.items.length > 0) {
      this.items[this.items.length - 1].header.focus();
    }
  }

  // Public API methods
  expandAll() {
    this.items.forEach((_, index) => this.expand(index));
  }

  collapseAll() {
    this.items.forEach((_, index) => this.collapse(index));
  }

  expandItem(index) {
    this.expand(index);
  }

  collapseItem(index) {
    this.collapse(index);
  }

  isItemExpanded(index) {
    return this.items[index]?.isExpanded || false;
  }

  destroy() {
    // Remove event listeners and clean up
    this.items.forEach(item => {
      const newHeader = item.header.cloneNode(true);
      item.header.parentNode.replaceChild(newHeader, item.header);
    });
    this.items = [];
  }
}

// Auto-initialize accordions on page load
document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion');
  accordions.forEach(accordion => {
    // Check for data attributes to configure options
    const allowMultiple = accordion.dataset.allowMultiple === 'true';
    const animationDuration = parseInt(accordion.dataset.animationDuration) || 300;
    
    new Accordion(accordion, {
      allowMultiple,
      animationDuration
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Accordion;
}

// Global namespace for direct usage
window.Accordion = Accordion;
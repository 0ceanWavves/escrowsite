/**
 * Accordion Component Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockElement, simulateUserInteraction } from '../setup.js';

describe('Accordion', () => {
  let accordion;
  let accordionElement;

  beforeEach(() => {
    // Create mock accordion structure
    accordionElement = createMockElement('div', { className: 'accordion' });
    
    // Create accordion items
    for (let i = 0; i < 3; i++) {
      const item = createMockElement('div', { className: 'accordion-item' });
      const header = createMockElement('button', { className: 'accordion-header' }, `Header ${i + 1}`);
      const content = createMockElement('div', { className: 'accordion-content' }, `Content ${i + 1}`);
      
      item.appendChild(header);
      item.appendChild(content);
      accordionElement.appendChild(item);
    }
    
    document.body.appendChild(accordionElement);

    // Create mock Accordion class
    class MockAccordion {
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
        const items = this.accordion.querySelectorAll('.accordion-item');
        
        items.forEach((item, index) => {
          const header = item.querySelector('.accordion-header');
          const content = item.querySelector('.accordion-content');
          
          if (!header || !content) return;
          
          const headerId = `accordion-header-${Date.now()}-${index}`;
          const contentId = `accordion-content-${Date.now()}-${index}`;
          
          header.setAttribute('id', headerId);
          header.setAttribute('aria-controls', contentId);
          header.setAttribute('aria-expanded', 'false');
          
          content.setAttribute('id', contentId);
          content.setAttribute('aria-labelledby', headerId);
          content.setAttribute('hidden', '');
          
          this.items.push({
            header,
            content,
            isExpanded: false
          });
        });
      }

      toggle(index) {
        const item = this.items[index];
        if (!item) return;
        
        if (item.isExpanded) {
          this.collapse(index);
        } else {
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
        
        this.accordion.dispatchEvent(new CustomEvent('accordion:expand', {
          detail: { index, item }
        }));
      }

      collapse(index) {
        const item = this.items[index];
        if (!item || !item.isExpanded) return;
        
        item.isExpanded = false;
        item.header.setAttribute('aria-expanded', 'false');
        item.content.setAttribute('hidden', '');
        
        this.accordion.dispatchEvent(new CustomEvent('accordion:collapse', {
          detail: { index, item }
        }));
      }

      expandAll() {
        this.items.forEach((_, index) => this.expand(index));
      }

      collapseAll() {
        this.items.forEach((_, index) => this.collapse(index));
      }

      isItemExpanded(index) {
        return this.items[index]?.isExpanded || false;
      }
    }

    accordion = new MockAccordion(accordionElement);
  });

  describe('Initialization', () => {
    it('should initialize with correct number of items', () => {
      expect(accordion.items).toHaveLength(3);
    });

    it('should set up ARIA attributes correctly', () => {
      accordion.items.forEach(item => {
        expect(item.header.getAttribute('aria-expanded')).toBe('false');
        expect(item.header.getAttribute('aria-controls')).toBeTruthy();
        expect(item.content.getAttribute('aria-labelledby')).toBeTruthy();
        expect(item.content.hasAttribute('hidden')).toBe(true);
      });
    });

    it('should initialize all items as collapsed', () => {
      accordion.items.forEach(item => {
        expect(item.isExpanded).toBe(false);
      });
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should expand an item', () => {
      accordion.expand(0);
      
      const item = accordion.items[0];
      expect(item.isExpanded).toBe(true);
      expect(item.header.getAttribute('aria-expanded')).toBe('true');
      expect(item.content.hasAttribute('hidden')).toBe(false);
    });

    it('should collapse an expanded item', () => {
      accordion.expand(0);
      accordion.collapse(0);
      
      const item = accordion.items[0];
      expect(item.isExpanded).toBe(false);
      expect(item.header.getAttribute('aria-expanded')).toBe('false');
      expect(item.content.hasAttribute('hidden')).toBe(true);
    });

    it('should toggle item state', () => {
      // Initially collapsed
      expect(accordion.items[0].isExpanded).toBe(false);
      
      // Toggle to expand
      accordion.toggle(0);
      expect(accordion.items[0].isExpanded).toBe(true);
      
      // Toggle to collapse
      accordion.toggle(0);
      expect(accordion.items[0].isExpanded).toBe(false);
    });

    it('should handle invalid index gracefully', () => {
      expect(() => {
        accordion.expand(999);
        accordion.collapse(999);
        accordion.toggle(999);
      }).not.toThrow();
    });
  });

  describe('Multiple Items Behavior', () => {
    it('should collapse other items when allowMultiple is false', () => {
      accordion.expand(0);
      accordion.expand(1);
      
      expect(accordion.items[0].isExpanded).toBe(false);
      expect(accordion.items[1].isExpanded).toBe(true);
    });

    it('should allow multiple expanded items when allowMultiple is true', () => {
      const multiAccordion = new accordion.constructor(accordionElement, { allowMultiple: true });
      
      multiAccordion.expand(0);
      multiAccordion.expand(1);
      
      expect(multiAccordion.items[0].isExpanded).toBe(true);
      expect(multiAccordion.items[1].isExpanded).toBe(true);
    });
  });

  describe('Bulk Operations', () => {
    it('should expand all items', () => {
      accordion.expandAll();
      
      accordion.items.forEach(item => {
        expect(item.isExpanded).toBe(true);
      });
    });

    it('should collapse all items', () => {
      accordion.expandAll();
      accordion.collapseAll();
      
      accordion.items.forEach(item => {
        expect(item.isExpanded).toBe(false);
      });
    });
  });

  describe('Events', () => {
    it('should dispatch expand event', () => {
      const expandSpy = vi.fn();
      accordionElement.addEventListener('accordion:expand', expandSpy);
      
      accordion.expand(0);
      
      expect(expandSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            index: 0,
            item: accordion.items[0]
          })
        })
      );
    });

    it('should dispatch collapse event', () => {
      const collapseSpy = vi.fn();
      accordionElement.addEventListener('accordion:collapse', collapseSpy);
      
      accordion.expand(0);
      accordion.collapse(0);
      
      expect(collapseSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            index: 0,
            item: accordion.items[0]
          })
        })
      );
    });
  });

  describe('State Queries', () => {
    it('should correctly report item expansion state', () => {
      expect(accordion.isItemExpanded(0)).toBe(false);
      
      accordion.expand(0);
      expect(accordion.isItemExpanded(0)).toBe(true);
      
      accordion.collapse(0);
      expect(accordion.isItemExpanded(0)).toBe(false);
    });

    it('should handle invalid index in state query', () => {
      expect(accordion.isItemExpanded(999)).toBe(false);
    });
  });

  describe('Options', () => {
    it('should respect animationDuration option', () => {
      const customAccordion = new accordion.constructor(accordionElement, { 
        animationDuration: 500 
      });
      
      expect(customAccordion.options.animationDuration).toBe(500);
    });

    it('should respect allowMultiple option', () => {
      const customAccordion = new accordion.constructor(accordionElement, { 
        allowMultiple: true 
      });
      
      expect(customAccordion.options.allowMultiple).toBe(true);
    });
  });
});
/**
 * Accessibility Enhancement JavaScript
 * Handles keyboard navigation, ARIA states, and accessibility features
 */

class AccessibilityManager {
    constructor() {
        this.isKeyboardNavigation = false;
        this.focusableElements = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([aria-disabled="true"])',
            '[role="link"]:not([aria-disabled="true"])',
            '[role="menuitem"]:not([aria-disabled="true"])',
            '[role="tab"]:not([aria-disabled="true"])'
        ].join(', ');
        
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupARIAStates();
        this.setupSkipLinks();
        this.setupLiveRegions();
        this.setupReducedMotion();
        this.setupHighContrast();
        this.setupTouchAccessibility();
    }

    /**
     * Setup keyboard navigation detection and enhancement
     */
    setupKeyboardNavigation() {
        // Detect keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.isKeyboardNavigation = true;
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            this.isKeyboardNavigation = false;
            document.body.classList.remove('keyboard-navigation');
        });

        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input, .sidebar-search-input');
            if (searchInput) {
                searchInput.focus();
                this.announceToScreenReader('Search activated');
            }
        }

        // Alt + M for main content
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            const mainContent = document.querySelector('main, .content-area, #main-content');
            if (mainContent) {
                mainContent.focus();
                this.announceToScreenReader('Jumped to main content');
            }
        }

        // Alt + N for navigation
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            const navigation = document.querySelector('nav, .sidebar-nav, .main-nav');
            if (navigation) {
                const firstLink = navigation.querySelector('a, button');
                if (firstLink) {
                    firstLink.focus();
                    this.announceToScreenReader('Jumped to navigation');
                }
            }
        }
    }

    /**
     * Handle escape key for closing modals, dropdowns, etc.
     */
    handleEscapeKey() {
        // Close mobile menu
        const mobileNav = document.querySelector('.mobile-nav.active');
        if (mobileNav) {
            const toggleButton = document.querySelector('.mobile-menu-toggle');
            if (toggleButton) {
                toggleButton.click();
                toggleButton.focus();
            }
        }

        // Close expanded sidebar on mobile
        const expandedSidebar = document.querySelector('.sidebar-nav.mobile-expanded');
        if (expandedSidebar) {
            const toggleButton = document.querySelector('.sidebar-mobile-toggle');
            if (toggleButton) {
                toggleButton.click();
                toggleButton.focus();
            }
        }

        // Close any open accordions or dropdowns
        const openAccordions = document.querySelectorAll('[aria-expanded="true"]');
        openAccordions.forEach(element => {
            if (element.classList.contains('accordion-header') || 
                element.classList.contains('dropdown-toggle')) {
                element.click();
            }
        });
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Focus trap for modals
        this.setupFocusTrap();
        
        // Focus restoration
        this.setupFocusRestoration();
        
        // Focus indicators
        this.setupFocusIndicators();
    }

    /**
     * Setup focus trap for modal dialogs
     */
    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal:not([hidden])');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    /**
     * Trap focus within an element
     */
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(this.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Setup focus restoration
     */
    setupFocusRestoration() {
        let lastFocusedElement = null;

        // Store focus before opening modals/overlays
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-trigger], .mobile-menu-toggle, .sidebar-mobile-toggle')) {
                lastFocusedElement = e.target;
            }
        });

        // Restore focus when closing
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-close], .modal-overlay')) {
                if (lastFocusedElement) {
                    lastFocusedElement.focus();
                    lastFocusedElement = null;
                }
            }
        });
    }

    /**
     * Setup focus indicators
     */
    setupFocusIndicators() {
        // Add focus-visible polyfill behavior
        document.addEventListener('keydown', () => {
            document.body.classList.add('using-keyboard');
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });
    }

    /**
     * Setup ARIA states and properties
     */
    setupARIAStates() {
        this.setupAccordionARIA();
        this.setupTabsARIA();
        this.setupMenuARIA();
        this.setupFormARIA();
    }

    /**
     * Setup accordion ARIA states
     */
    setupAccordionARIA() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.accordion-header, .sidebar-toggle')) {
                const button = e.target;
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                
                button.setAttribute('aria-expanded', !isExpanded);
                
                const content = button.nextElementSibling || 
                              document.querySelector(button.getAttribute('aria-controls'));
                
                if (content) {
                    content.hidden = isExpanded;
                    
                    // Announce state change
                    const text = isExpanded ? 'collapsed' : 'expanded';
                    this.announceToScreenReader(`Section ${text}`);
                }
            }
        });
    }

    /**
     * Setup tabs ARIA states
     */
    setupTabsARIA() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tab-button')) {
                const clickedTab = e.target;
                const tabContainer = clickedTab.closest('.tab-container');
                
                if (tabContainer) {
                    // Update all tabs in this container
                    const allTabs = tabContainer.querySelectorAll('.tab-button');
                    const allPanels = tabContainer.querySelectorAll('.tab-panel');
                    
                    allTabs.forEach((tab, index) => {
                        const isSelected = tab === clickedTab;
                        tab.setAttribute('aria-selected', isSelected);
                        tab.setAttribute('tabindex', isSelected ? '0' : '-1');
                        
                        if (allPanels[index]) {
                            allPanels[index].hidden = !isSelected;
                            if (isSelected) {
                                allPanels[index].classList.add('active');
                            } else {
                                allPanels[index].classList.remove('active');
                            }
                        }
                    });
                    
                    // Announce tab change
                    this.announceToScreenReader(`${clickedTab.textContent} tab selected`);
                }
            }
        });

        // Arrow key navigation for tabs
        document.addEventListener('keydown', (e) => {
            if (e.target.matches('.tab-button')) {
                const currentTab = e.target;
                const tabList = currentTab.closest('.tab-list');
                const tabs = Array.from(tabList.querySelectorAll('.tab-button'));
                const currentIndex = tabs.indexOf(currentTab);
                
                let nextIndex;
                
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    nextIndex = (currentIndex + 1) % tabs.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    nextIndex = 0;
                } else if (e.key === 'End') {
                    e.preventDefault();
                    nextIndex = tabs.length - 1;
                }
                
                if (nextIndex !== undefined) {
                    tabs[nextIndex].focus();
                    tabs[nextIndex].click();
                }
            }
        });
    }

    /**
     * Setup menu ARIA states
     */
    setupMenuARIA() {
        // Mobile menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('.mobile-menu-toggle')) {
                const button = e.target;
                const menu = document.querySelector('.mobile-nav');
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                
                button.setAttribute('aria-expanded', !isExpanded);
                
                if (menu) {
                    menu.classList.toggle('active', !isExpanded);
                    
                    // Focus first menu item when opening
                    if (!isExpanded) {
                        const firstMenuItem = menu.querySelector('a, button');
                        if (firstMenuItem) {
                            setTimeout(() => firstMenuItem.focus(), 100);
                        }
                    }
                }
                
                this.announceToScreenReader(`Menu ${isExpanded ? 'closed' : 'opened'}`);
            }
        });

        // Sidebar toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('.sidebar-mobile-toggle')) {
                const button = e.target;
                const sidebar = document.querySelector('.sidebar-nav');
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                
                button.setAttribute('aria-expanded', !isExpanded);
                
                if (sidebar) {
                    sidebar.classList.toggle('mobile-expanded', !isExpanded);
                }
                
                this.announceToScreenReader(`Sidebar ${isExpanded ? 'closed' : 'opened'}`);
            }
        });
    }

    /**
     * Setup form ARIA states
     */
    setupFormARIA() {
        // Form validation
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validateField(e.target);
            }
        }, true);

        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                // Clear previous error state on input
                if (e.target.getAttribute('aria-invalid') === 'true') {
                    e.target.setAttribute('aria-invalid', 'false');
                    this.clearFieldError(e.target);
                }
            }
        });
    }

    /**
     * Validate form field
     */
    validateField(field) {
        const isValid = field.checkValidity();
        field.setAttribute('aria-invalid', !isValid);
        
        if (!isValid) {
            this.showFieldError(field, field.validationMessage);
        } else {
            this.clearFieldError(field);
        }
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        let errorElement = document.getElementById(`${field.id}-error`);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = `${field.id}-error`;
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        field.setAttribute('aria-describedby', errorElement.id);
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.remove();
        }
        field.removeAttribute('aria-describedby');
    }

    /**
     * Setup skip links
     */
    setupSkipLinks() {
        // Create skip links if they don't exist
        if (!document.querySelector('.skip-links')) {
            this.createSkipLinks();
        }
    }

    /**
     * Create skip links
     */
    createSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
            <a href="#search" class="skip-link">Skip to search</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // Add IDs to target elements if they don't exist
        const mainContent = document.querySelector('main, .content-area');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
            mainContent.setAttribute('tabindex', '-1');
        }
        
        const navigation = document.querySelector('nav, .sidebar-nav');
        if (navigation && !navigation.id) {
            navigation.id = 'navigation';
        }
        
        const search = document.querySelector('.search-input, .sidebar-search-input');
        if (search && !search.id) {
            search.id = 'search';
        }
    }

    /**
     * Setup live regions for announcements
     */
    setupLiveRegions() {
        // Create live region if it doesn't exist
        if (!document.querySelector('#live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.className = 'live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message, priority = 'polite') {
        const liveRegion = document.querySelector('#live-region');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Setup reduced motion preferences
     */
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotion = (mediaQuery) => {
            if (mediaQuery.matches) {
                document.body.classList.add('reduce-motion');
            } else {
                document.body.classList.remove('reduce-motion');
            }
        };
        
        handleReducedMotion(prefersReducedMotion);
        prefersReducedMotion.addEventListener('change', handleReducedMotion);
    }

    /**
     * Setup high contrast mode support
     */
    setupHighContrast() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        const handleHighContrast = (mediaQuery) => {
            if (mediaQuery.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        };
        
        handleHighContrast(prefersHighContrast);
        prefersHighContrast.addEventListener('change', handleHighContrast);
    }

    /**
     * Setup touch accessibility
     */
    setupTouchAccessibility() {
        // Detect touch capability
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (hasTouch) {
            document.body.classList.add('touch-device');
            
            // Ensure touch targets are large enough
            this.ensureTouchTargets();
        }
    }

    /**
     * Ensure touch targets meet minimum size requirements
     */
    ensureTouchTargets() {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]');
        
        interactiveElements.forEach(element => {
            if (!element.classList.contains('touch-target')) {
                element.classList.add('touch-target');
            }
        });
    }

    /**
     * Update progress indicators with ARIA attributes
     */
    updateProgress(progressBar, value, max = 100, text = null) {
        progressBar.setAttribute('aria-valuenow', value);
        progressBar.setAttribute('aria-valuemax', max);
        progressBar.setAttribute('aria-valuemin', 0);
        
        if (text) {
            progressBar.setAttribute('aria-valuetext', text);
        }
        
        const percentage = Math.round((value / max) * 100);
        this.announceToScreenReader(`Progress: ${percentage}%`);
    }

    /**
     * Setup roving tabindex for complex widgets
     */
    setupRovingTabindex(container, items) {
        let currentIndex = 0;
        
        // Set initial tabindex
        items.forEach((item, index) => {
            item.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });
        
        container.addEventListener('keydown', (e) => {
            let nextIndex;
            
            switch (e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    nextIndex = (currentIndex + 1) % items.length;
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    nextIndex = (currentIndex - 1 + items.length) % items.length;
                    break;
                case 'Home':
                    e.preventDefault();
                    nextIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    nextIndex = items.length - 1;
                    break;
                default:
                    return;
            }
            
            // Update tabindex
            items[currentIndex].setAttribute('tabindex', '-1');
            items[nextIndex].setAttribute('tabindex', '0');
            items[nextIndex].focus();
            
            currentIndex = nextIndex;
        });
    }
}

// Initialize accessibility manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
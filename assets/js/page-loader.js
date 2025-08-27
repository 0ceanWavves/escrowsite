/**
 * Page Loader Module - Handles dynamic content loading and state management
 */

class PageLoader {
    constructor() {
        this.currentPage = null;
        this.loadingState = false;
        this.cache = new Map();
        this.maxCacheSize = 20;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadInitialContent();
    }
    
    /**
     * Setup event listeners for page loading
     */
    setupEventListeners() {
        // Handle navigation clicks for dynamic loading
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-dynamic]');
            if (link) {
                e.preventDefault();
                this.loadPage(link.href, link.dataset.target || '#app');
            }
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, '#app', false);
            }
        });
        
        // Handle language changes
        window.addEventListener('languageChanged', () => {
            this.reloadCurrentPage();
        });
    }
    
    /**
     * Load initial content based on current URL
     */
    loadInitialContent() {
        const path = window.location.pathname;
        const contentArea = document.querySelector('#app');
        
        if (contentArea && !contentArea.innerHTML.trim()) {
            this.loadPage(path, '#app', false);
        }
    }
    
    /**
     * Load a page dynamically
     */
    async loadPage(url, targetSelector = '#app', updateHistory = true) {
        if (this.loadingState) {
            return;
        }
        
        const target = document.querySelector(targetSelector);
        if (!target) {
            console.error('Target element not found:', targetSelector);
            return;
        }
        
        this.loadingState = true;
        this.showLoadingState(target);
        
        try {
            const content = await this.fetchPageContent(url);
            
            if (content) {
                this.renderContent(target, content);
                this.currentPage = url;
                
                if (updateHistory) {
                    this.updateHistory(url);
                }
                
                this.initializePageComponents();
                this.updatePageMeta(content.meta);
            }
        } catch (error) {
            console.error('Failed to load page:', error);
            this.showErrorState(target, error);
        } finally {
            this.loadingState = false;
        }
    }
    
    /**
     * Fetch page content from server or cache
     */
    async fetchPageContent(url) {
        // Check cache first
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }
        
        try {
            // Try to fetch structured content first
            const contentResponse = await fetch(`${url}?format=json`);
            if (contentResponse.ok) {
                const content = await contentResponse.json();
                this.cacheContent(url, content);
                return content;
            }
            
            // Fallback to HTML parsing
            const htmlResponse = await fetch(url);
            if (htmlResponse.ok) {
                const html = await htmlResponse.text();
                const content = this.parseHTMLContent(html);
                this.cacheContent(url, content);
                return content;
            }
            
            throw new Error(`HTTP ${htmlResponse.status}: ${htmlResponse.statusText}`);
        } catch (error) {
            throw new Error(`Failed to fetch content: ${error.message}`);
        }
    }
    
    /**
     * Parse HTML content to extract structured data
     */
    parseHTMLContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract main content
        const main = doc.querySelector('main, .content-area, #app');
        const content = main ? main.innerHTML : doc.body.innerHTML;
        
        // Extract metadata
        const title = doc.querySelector('title')?.textContent || '';
        const description = doc.querySelector('meta[name="description"]')?.content || '';
        const keywords = doc.querySelector('meta[name="keywords"]')?.content || '';
        
        return {
            content,
            meta: {
                title,
                description,
                keywords
            }
        };
    }
    
    /**
     * Cache content with size limit
     */
    cacheContent(url, content) {
        if (this.cache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(url, content);
    }
    
    /**
     * Render content to target element
     */
    renderContent(target, content) {
        // Fade out current content
        target.style.opacity = '0';
        
        setTimeout(() => {
            target.innerHTML = content.content || content;
            
            // Fade in new content
            target.style.opacity = '1';
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);
    }
    
    /**
     * Show loading state
     */
    showLoadingState(target) {
        const loadingHTML = `
            <div class="loading-container" style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 200px;
                flex-direction: column;
                gap: 1rem;
            ">
                <div class="loading"></div>
                <p data-i18n="common.loading">Loading...</p>
            </div>
        `;
        
        target.style.opacity = '0.6';
        target.innerHTML = loadingHTML;
    }
    
    /**
     * Show error state
     */
    showErrorState(target, error) {
        const errorHTML = `
            <div class="error-container" style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 200px;
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            ">
                <div class="alert alert-error">
                    <h3 data-i18n="common.error">Error</h3>
                    <p>Failed to load content: ${error.message}</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        Retry
                    </button>
                </div>
            </div>
        `;
        
        target.style.opacity = '1';
        target.innerHTML = errorHTML;
    }
    
    /**
     * Initialize page-specific components
     */
    initializePageComponents() {
        // Initialize code blocks with copy functionality
        this.initializeCodeBlocks();
        
        // Initialize accordions
        this.initializeAccordions();
        
        // Initialize tabs
        this.initializeTabs();
        
        // Initialize tooltips
        this.initializeTooltips();
        
        // Apply translations to new content
        if (window.languageSwitcher) {
            window.languageSwitcher.applyTranslations();
        }
    }
    
    /**
     * Initialize code blocks
     */
    initializeCodeBlocks() {
        document.querySelectorAll('.code-block').forEach(block => {
            if (!block.querySelector('.copy-button')) {
                const header = block.querySelector('.code-block-header');
                if (header) {
                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-button';
                    copyButton.textContent = 'Copy';
                    copyButton.addEventListener('click', () => {
                        this.copyCodeBlock(block);
                    });
                    header.appendChild(copyButton);
                }
            }
        });
    }
    
    /**
     * Copy code block content to clipboard
     */
    async copyCodeBlock(block) {
        const code = block.querySelector('code, pre');
        if (!code) return;
        
        try {
            await navigator.clipboard.writeText(code.textContent);
            
            const button = block.querySelector('.copy-button');
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    }
    
    /**
     * Initialize accordion components
     */
    initializeAccordions() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            if (!header.hasAttribute('data-initialized')) {
                header.addEventListener('click', () => {
                    this.toggleAccordion(header);
                });
                header.setAttribute('data-initialized', 'true');
            }
        });
    }
    
    /**
     * Toggle accordion section
     */
    toggleAccordion(header) {
        const content = header.nextElementSibling;
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        
        header.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
            content.style.maxHeight = '0';
            content.setAttribute('hidden', '');
        } else {
            content.removeAttribute('hidden');
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    }
    
    /**
     * Initialize tab components
     */
    initializeTabs() {
        document.querySelectorAll('.tab-button').forEach(button => {
            if (!button.hasAttribute('data-initialized')) {
                button.addEventListener('click', () => {
                    this.switchTab(button);
                });
                button.setAttribute('data-initialized', 'true');
            }
        });
    }
    
    /**
     * Switch tab
     */
    switchTab(button) {
        const container = button.closest('.tab-container');
        if (!container) return;
        
        const tabId = button.dataset.tab;
        
        // Update button states
        container.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        
        // Update panel visibility
        container.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('hidden', '');
        });
        
        const activePanel = container.querySelector(`[data-tab-panel="${tabId}"]`);
        if (activePanel) {
            activePanel.classList.add('active');
            activePanel.removeAttribute('hidden');
        }
    }
    
    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            if (!element.hasAttribute('data-tooltip-initialized')) {
                this.setupTooltip(element);
                element.setAttribute('data-tooltip-initialized', 'true');
            }
        });
    }
    
    /**
     * Setup tooltip for element
     */
    setupTooltip(element) {
        let tooltip = null;
        
        element.addEventListener('mouseenter', () => {
            tooltip = this.createTooltip(element.dataset.tooltip);
            document.body.appendChild(tooltip);
            this.positionTooltip(tooltip, element);
        });
        
        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });
    }
    
    /**
     * Create tooltip element
     */
    createTooltip(text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #3f3c36;
            color: white;
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        return tooltip;
    }
    
    /**
     * Position tooltip relative to element
     */
    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top = rect.top - tooltipRect.height - 8;
        let left = rect.left + (rect.width - tooltipRect.width) / 2;
        
        // Adjust if tooltip goes off screen
        if (top < 0) {
            top = rect.bottom + 8;
        }
        
        if (left < 0) {
            left = 8;
        } else if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 8;
        }
        
        tooltip.style.top = top + window.scrollY + 'px';
        tooltip.style.left = left + 'px';
    }
    
    /**
     * Update page metadata
     */
    updatePageMeta(meta) {
        if (!meta) return;
        
        if (meta.title) {
            document.title = meta.title;
        }
        
        if (meta.description) {
            let descMeta = document.querySelector('meta[name="description"]');
            if (!descMeta) {
                descMeta = document.createElement('meta');
                descMeta.name = 'description';
                document.head.appendChild(descMeta);
            }
            descMeta.content = meta.description;
        }
        
        if (meta.keywords) {
            let keywordsMeta = document.querySelector('meta[name="keywords"]');
            if (!keywordsMeta) {
                keywordsMeta = document.createElement('meta');
                keywordsMeta.name = 'keywords';
                document.head.appendChild(keywordsMeta);
            }
            keywordsMeta.content = meta.keywords;
        }
    }
    
    /**
     * Update browser history
     */
    updateHistory(url) {
        const state = { page: url };
        window.history.pushState(state, '', url);
    }
    
    /**
     * Reload current page
     */
    reloadCurrentPage() {
        if (this.currentPage) {
            this.cache.delete(this.currentPage);
            this.loadPage(this.currentPage, '#app', false);
        }
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    
    /**
     * Get current page
     */
    getCurrentPage() {
        return this.currentPage;
    }
    
    /**
     * Check if page is loading
     */
    isLoading() {
        return this.loadingState;
    }
}

// Initialize page loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pageLoader = new PageLoader();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageLoader;
}
/**
 * Navigation Module - Handles sidebar navigation and page routing
 */

class NavigationManager {
    constructor() {
        this.currentSection = null;
        this.currentPage = null;
        this.sidebarState = {
            expandedItems: new Set(),
            activeItem: null
        };
        
        this.init();
    }
    
    init() {
        this.detectCurrentSection();
        this.setupEventListeners();
        this.initializeSidebar();
        this.updateActiveStates();
    }
    
    /**
     * Detect current section based on URL path
     */
    detectCurrentSection() {
        const path = window.location.pathname;
        
        if (path.includes('/development-roadmap/')) {
            this.currentSection = 'development-roadmap';
        } else if (path.includes('/node-guides/')) {
            this.currentSection = 'node-guides';
        } else {
            this.currentSection = 'home';
        }
        
        // Extract current page from path
        const pathParts = path.split('/').filter(part => part);
        this.currentPage = pathParts[pathParts.length - 1] || 'index';
    }
    
    /**
     * Setup event listeners for navigation
     */
    setupEventListeners() {
        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }
        
        // Sidebar collapsible items
        document.addEventListener('click', (e) => {
            if (e.target.matches('.sidebar-toggle')) {
                this.toggleSidebarSection(e.target);
            }
        });
        
        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link, .sidebar-nav-link')) {
                this.handleNavigation(e);
            }
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.detectCurrentSection();
            this.updateActiveStates();
        });
    }
    
    /**
     * Initialize sidebar based on current section
     */
    initializeSidebar() {
        const sidebar = document.querySelector('.sidebar-nav');
        if (!sidebar) return;
        
        // Generate sidebar content based on current section
        const sidebarContent = this.generateSidebarContent();
        sidebar.innerHTML = sidebarContent;
        
        // Expand relevant sections
        this.expandRelevantSections();
    }
    
    /**
     * Generate sidebar content based on current section
     */
    generateSidebarContent() {
        const sections = this.getSectionStructure();
        let html = '';
        
        sections.forEach(section => {
            html += this.renderSidebarSection(section);
        });
        
        return html;
    }
    
    /**
     * Get section structure based on current section
     */
    getSectionStructure() {
        if (this.currentSection === 'development-roadmap') {
            return [
                {
                    title: 'Development Roadmap',
                    items: [
                        {
                            title: 'Overview',
                            href: '/development-roadmap/',
                            id: 'overview'
                        },
                        {
                            title: 'Phase 1: Infrastructure',
                            href: '/development-roadmap/phase-1/',
                            id: 'phase-1',
                            children: [
                                { title: 'Database Schemas', href: '/development-roadmap/phase-1/database-schemas.html' },
                                { title: 'Payment Gateways', href: '/development-roadmap/phase-1/payment-gateways.html' },
                                { title: 'Self-Hosted Nodes', href: '/development-roadmap/phase-1/self-hosted-nodes.html' }
                            ]
                        },
                        {
                            title: 'Phase 2: Backend & APIs',
                            href: '/development-roadmap/phase-2/',
                            id: 'phase-2',
                            children: [
                                { title: 'API Endpoints', href: '/development-roadmap/phase-2/api-endpoints.html' },
                                { title: 'Escrow Logic', href: '/development-roadmap/phase-2/escrow-logic.html' },
                                { title: 'Security & Auditing', href: '/development-roadmap/phase-2/security-auditing.html' }
                            ]
                        },
                        {
                            title: 'Phase 3: Frontend & UI',
                            href: '/development-roadmap/phase-3/',
                            id: 'phase-3',
                            children: [
                                { title: 'User Wallet Dashboard', href: '/development-roadmap/phase-3/wallet-dashboard.html' },
                                { title: 'Integrated Checkout', href: '/development-roadmap/phase-3/checkout.html' },
                                { title: 'Escrow Interface', href: '/development-roadmap/phase-3/escrow-interface.html' }
                            ]
                        }
                    ]
                }
            ];
        } else if (this.currentSection === 'node-guides') {
            return [
                {
                    title: 'Node Setup Guides',
                    items: [
                        {
                            title: 'Overview',
                            href: '/node-guides/',
                            id: 'overview'
                        },
                        {
                            title: 'Phase 1: Procurement & Provisioning',
                            href: '/node-guides/procurement-provisioning/',
                            id: 'procurement-provisioning',
                            children: [
                                { title: 'VPS Selection', href: '/node-guides/procurement-provisioning/vps-selection.html' },
                                { title: 'Hardware Requirements', href: '/node-guides/procurement-provisioning/hardware-requirements.html' },
                                { title: 'Cost Estimation', href: '/node-guides/procurement-provisioning/cost-estimation.html' }
                            ]
                        },
                        {
                            title: 'Phase 2: Server Foundation & Security',
                            href: '/node-guides/server-security/',
                            id: 'server-security',
                            children: [
                                { title: 'Secure Connections', href: '/node-guides/server-security/secure-connections.html' },
                                { title: 'Firewall Configuration', href: '/node-guides/server-security/firewall-config.html' },
                                { title: 'System Hardening', href: '/node-guides/server-security/system-hardening.html' }
                            ]
                        },
                        {
                            title: 'Phase 3: Node Software Installation',
                            href: '/node-guides/installation/',
                            id: 'installation',
                            children: [
                                { title: 'Download & Verification', href: '/node-guides/installation/download-verification.html' },
                                { title: 'Configuration', href: '/node-guides/installation/configuration.html' },
                                { title: 'Setup Wizard', href: '/node-guides/installation/setup-wizard.html' }
                            ]
                        },
                        {
                            title: 'Phase 4: Blockchain Synchronization',
                            href: '/node-guides/synchronization/',
                            id: 'synchronization',
                            children: [
                                { title: 'Monitoring', href: '/node-guides/synchronization/monitoring.html' },
                                { title: 'Testing', href: '/node-guides/synchronization/testing.html' },
                                { title: 'Maintenance', href: '/node-guides/synchronization/maintenance.html' }
                            ]
                        }
                    ]
                }
            ];
        }
        
        return [];
    }
    
    /**
     * Render sidebar section HTML
     */
    renderSidebarSection(section) {
        let html = `<div class="sidebar-section">`;
        
        if (section.title) {
            html += `<h3 class="sidebar-section-title">${section.title}</h3>`;
        }
        
        html += `<ul class="sidebar-nav-list">`;
        
        section.items.forEach(item => {
            html += this.renderSidebarItem(item);
        });
        
        html += `</ul></div>`;
        
        return html;
    }
    
    /**
     * Render individual sidebar item
     */
    renderSidebarItem(item) {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = this.sidebarState.expandedItems.has(item.id);
        const isActive = this.isItemActive(item);
        
        let html = `<li class="sidebar-nav-item">`;
        
        if (hasChildren) {
            html += `
                <button class="sidebar-toggle ${isExpanded ? 'expanded' : ''} ${isActive ? 'active' : ''}" 
                        data-target="${item.id}">
                    <span>${item.title}</span>
                    <svg class="sidebar-toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
                <div class="sidebar-collapsible-content ${isExpanded ? 'expanded' : ''}" id="${item.id}">
                    <ul class="sidebar-nav-nested">
            `;
            
            item.children.forEach(child => {
                const childActive = this.isItemActive(child);
                html += `
                    <li class="sidebar-nav-item">
                        <a href="${child.href}" class="sidebar-nav-link ${childActive ? 'active' : ''}">
                            ${child.title}
                        </a>
                    </li>
                `;
            });
            
            html += `</ul></div>`;
        } else {
            html += `
                <a href="${item.href}" class="sidebar-nav-link ${isActive ? 'active' : ''}">
                    ${item.title}
                </a>
            `;
        }
        
        html += `</li>`;
        
        return html;
    }
    
    /**
     * Check if navigation item is active
     */
    isItemActive(item) {
        const currentPath = window.location.pathname;
        return currentPath === item.href || currentPath.startsWith(item.href);
    }
    
    /**
     * Toggle sidebar section
     */
    toggleSidebarSection(button) {
        const targetId = button.dataset.target;
        const content = document.getElementById(targetId);
        
        if (!content) return;
        
        const isExpanded = this.sidebarState.expandedItems.has(targetId);
        
        if (isExpanded) {
            this.sidebarState.expandedItems.delete(targetId);
            button.classList.remove('expanded');
            content.classList.remove('expanded');
        } else {
            this.sidebarState.expandedItems.add(targetId);
            button.classList.add('expanded');
            content.classList.add('expanded');
        }
    }
    
    /**
     * Expand relevant sections based on current page
     */
    expandRelevantSections() {
        const path = window.location.pathname;
        
        // Auto-expand sections that contain the current page
        if (path.includes('/phase-1/')) {
            this.sidebarState.expandedItems.add('phase-1');
        } else if (path.includes('/phase-2/')) {
            this.sidebarState.expandedItems.add('phase-2');
        } else if (path.includes('/phase-3/')) {
            this.sidebarState.expandedItems.add('phase-3');
        } else if (path.includes('/procurement-provisioning/')) {
            this.sidebarState.expandedItems.add('procurement-provisioning');
        } else if (path.includes('/server-security/')) {
            this.sidebarState.expandedItems.add('server-security');
        } else if (path.includes('/installation/')) {
            this.sidebarState.expandedItems.add('installation');
        } else if (path.includes('/synchronization/')) {
            this.sidebarState.expandedItems.add('synchronization');
        }
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.mobile-nav');
        
        if (toggle && menu) {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
        }
    }
    
    /**
     * Handle navigation clicks
     */
    handleNavigation(e) {
        const link = e.target;
        const href = link.getAttribute('href');
        
        // Don't prevent default for external links
        if (href && href.startsWith('http')) {
            return;
        }
        
        // Update active states
        this.updateActiveStates();
        
        // Close mobile menu if open
        const mobileMenu = document.querySelector('.mobile-nav');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            this.toggleMobileMenu();
        }
    }
    
    /**
     * Update active states for navigation items
     */
    updateActiveStates() {
        // Remove all active states
        document.querySelectorAll('.nav-link, .sidebar-nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active state to current page
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link, .sidebar-nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
    
    /**
     * Navigate to a specific page
     */
    navigateTo(href) {
        window.location.href = href;
    }
    
    /**
     * Get current section
     */
    getCurrentSection() {
        return this.currentSection;
    }
    
    /**
     * Get current page
     */
    getCurrentPage() {
        return this.currentPage;
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}
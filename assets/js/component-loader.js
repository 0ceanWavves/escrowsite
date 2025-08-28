// Component Loader - Simple client-side component loading
class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.basePath = this.getBasePath();
        console.log(`ComponentLoader initialized with basePath: ${this.basePath}`);
    }

    getBasePath() {
        // Determine the base path for components based on current location
        const path = window.location.pathname;
        console.log(`Current path: ${path}`);
        
        // Count directory depth (excluding the file itself)
        const segments = path.split('/').filter(segment => segment !== '' && !segment.includes('.html'));
        console.log(`Path segments (directories only): ${segments}`);
        
        const depth = segments.length;
        const basePath = '../'.repeat(depth) + 'components/';
        console.log(`Calculated depth: ${depth}, basePath: ${basePath}`);
        
        return basePath;
    }

    async loadComponent(componentName, targetId) {
        try {
            // Check if component is already cached
            if (this.components.has(componentName)) {
                document.getElementById(targetId).innerHTML = this.components.get(componentName);
                return;
            }

            const componentUrl = `${this.basePath}${componentName}.html`;
            console.log(`Loading component: ${componentName} from ${componentUrl}`);

            // Fetch component
            const response = await fetch(componentUrl);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName} (${response.status})`);
            }

            const html = await response.text();
            
            // Cache component
            this.components.set(componentName, html);
            
            // Insert into target element
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = html;
                console.log(`Successfully loaded component: ${componentName}`);
            } else {
                console.error(`Target element not found: ${targetId}`);
            }
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            // Show error in the target element
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = `<div style="color: red; padding: 1rem; border: 1px solid red;">Error loading ${componentName}: ${error.message}</div>`;
            }
        }
    }

    async loadAllComponents() {
        const componentMappings = [
            { component: 'header', target: 'header-component' },
            { component: 'sidebar-node-guides', target: 'sidebar-component' },
            { component: 'page-navigation', target: 'page-navigation-component' },
            { component: 'footer', target: 'footer-component' }
        ];

        // Load all components in parallel
        const promises = componentMappings.map(({ component, target }) => 
            this.loadComponent(component, target)
        );

        await Promise.all(promises);
    }
}

// Initialize component loader when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const loader = new ComponentLoader();
    await loader.loadAllComponents();
    
    // Dispatch custom event when components are loaded
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
});

// Export for use in other scripts
window.ComponentLoader = ComponentLoader;
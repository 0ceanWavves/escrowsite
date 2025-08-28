// Component Builder - Node.js script to build static HTML from components
const fs = require('fs').promises;
const path = require('path');

class ComponentBuilder {
    constructor(rootDir = '.') {
        this.rootDir = rootDir;
        this.componentsDir = path.join(rootDir, 'components');
        this.templatesDir = path.join(rootDir, 'templates');
    }

    async loadComponent(componentName) {
        try {
            const componentPath = path.join(this.componentsDir, `${componentName}.html`);
            return await fs.readFile(componentPath, 'utf8');
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return `<!-- Component ${componentName} not found -->`;
        }
    }

    async loadTemplate(templateName) {
        try {
            const templatePath = path.join(this.templatesDir, `${templateName}.html`);
            return await fs.readFile(templatePath, 'utf8');
        } catch (error) {
            console.error(`Error loading template ${templateName}:`, error);
            return '';
        }
    }

    async buildPage(config) {
        const {
            template = 'base',
            components = {},
            variables = {},
            outputPath
        } = config;

        // Load base template
        let html = await this.loadTemplate(template);

        // Load and inject components
        for (const [placeholder, componentName] of Object.entries(components)) {
            const componentHtml = await this.loadComponent(componentName);
            html = html.replace(`{{${placeholder}}}`, componentHtml);
        }

        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, value);
        }

        // Write output file
        if (outputPath) {
            await fs.writeFile(outputPath, html, 'utf8');
            console.log(`Built page: ${outputPath}`);
        }

        return html;
    }

    async buildProcurementProvisioningPage() {
        const config = {
            template: 'base',
            components: {
                header: 'header',
                sidebar: 'sidebar-node-guides',
                footer: 'footer'
            },
            variables: {
                title: 'Phase 1: Procurement & Provisioning',
                section: 'node-guides',
                section_title: 'Node Guides',
                page: 'procurement-provisioning',
                description: 'Select and provision the infrastructure needed for running cryptocurrency nodes',
                css_path: '../../assets/css',
                js_path: '../../assets/js',
                content: `
                    <div class="content-page">
                        <!-- Page content would go here -->
                        <!-- This would be loaded from a separate content file -->
                    </div>
                `
            },
            outputPath: path.join(this.rootDir, 'node-guides/procurement-provisioning/index-built.html')
        };

        return await this.buildPage(config);
    }
}

// Usage example
if (require.main === module) {
    const builder = new ComponentBuilder();
    builder.buildProcurementProvisioningPage()
        .then(() => console.log('Build complete!'))
        .catch(console.error);
}

module.exports = ComponentBuilder;
# Modular Architecture Guide

## Overview

We've refactored the monolithic HTML files into a modular, component-based architecture. This makes the codebase much more maintainable and reduces duplication.

## Directory Structure

```
├── components/                 # Reusable HTML components
│   ├── header.html            # Site header with navigation
│   ├── sidebar-node-guides.html # Node guides sidebar
│   ├── footer.html            # Site footer
│   └── page-navigation.html   # Previous/next page navigation
├── templates/                 # Base templates
│   └── base.html             # Main page template
├── build/                    # Build tools
│   └── component-builder.js  # Node.js build script
├── assets/
│   ├── css/                  # Stylesheets (unchanged)
│   └── js/
│       └── component-loader.js # Client-side component loader
└── node-guides/
    └── procurement-provisioning/
        ├── index.html         # Original monolithic file
        └── index-modular.html # New modular version
```

## How It Works

### Client-Side Loading (Development)
- Uses `component-loader.js` to dynamically load components
- Components are fetched via AJAX and inserted into placeholders
- Perfect for development and testing

### Build-Time Generation (Production)
- Uses `component-builder.js` to generate static HTML files
- All components are inlined at build time
- Better performance for production

## Usage

### Development Mode
1. Use `index-modular.html` files
2. Serve with a local server: `npm run dev`
3. Components load dynamically

### Production Build
1. Run `npm run build` to generate static files
2. Deploy the built HTML files
3. No JavaScript required for component loading

## Benefits

✅ **DRY Principle**: No more duplicated header/footer/sidebar code
✅ **Maintainability**: Update header once, changes everywhere
✅ **Modularity**: Easy to swap components or create variants
✅ **Performance**: Build-time inlining for production
✅ **Development Speed**: Quick iteration with dynamic loading

## Creating New Pages

### Option 1: Modular HTML
```html
<div id="header-component"></div>
<main class="main-content">
    <div id="sidebar-component"></div>
    <div class="content-area">
        <!-- Your page content here -->
    </div>
</main>
<div id="footer-component"></div>
<script src="assets/js/component-loader.js"></script>
```

### Option 2: Build Script
```javascript
const config = {
    template: 'base',
    components: {
        header: 'header',
        sidebar: 'sidebar-node-guides',
        footer: 'footer'
    },
    variables: {
        title: 'Your Page Title',
        section: 'node-guides',
        // ... other variables
    },
    outputPath: 'path/to/output.html'
};
```

## Migration Strategy

1. **Phase 1**: Create modular versions alongside existing files
2. **Phase 2**: Test and validate modular versions
3. **Phase 3**: Replace original files with modular versions
4. **Phase 4**: Set up build pipeline for production

## Next Steps

1. Create modular versions of other pages
2. Set up automated build pipeline
3. Add component variants (different sidebars, etc.)
4. Consider adding a simple templating engine for more complex scenarios
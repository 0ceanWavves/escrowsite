/**
 * Syntax Highlighter Module
 * Advanced syntax highlighting for multiple programming languages with custom themes
 */

class SyntaxHighlighter {
  constructor() {
    this.themes = {
      'vs-dark': 'vs2015',
      'github-light': 'github',
      'monokai': 'monokai',
      'dracula': 'dracula',
      'atom-dark': 'atom-one-dark',
      'solarized-light': 'solarized-light',
      'solarized-dark': 'solarized-dark'
    };
    
    this.currentTheme = 'vs-dark';
    this.isLoaded = false;
    this.loadPromise = null;
    
    // Language configurations
    this.languageConfig = {
      'javascript': {
        aliases: ['js', 'jsx', 'node'],
        extensions: ['.js', '.jsx', '.mjs'],
        highlightjs: 'javascript'
      },
      'typescript': {
        aliases: ['ts', 'tsx'],
        extensions: ['.ts', '.tsx'],
        highlightjs: 'typescript'
      },
      'python': {
        aliases: ['py', 'python3'],
        extensions: ['.py', '.pyw'],
        highlightjs: 'python'
      },
      'bash': {
        aliases: ['shell', 'sh', 'zsh', 'fish'],
        extensions: ['.sh', '.bash', '.zsh'],
        highlightjs: 'bash'
      },
      'sql': {
        aliases: ['mysql', 'postgresql', 'sqlite'],
        extensions: ['.sql'],
        highlightjs: 'sql'
      },
      'json': {
        aliases: ['json5'],
        extensions: ['.json', '.json5'],
        highlightjs: 'json'
      },
      'yaml': {
        aliases: ['yml'],
        extensions: ['.yaml', '.yml'],
        highlightjs: 'yaml'
      },
      'html': {
        aliases: ['htm'],
        extensions: ['.html', '.htm'],
        highlightjs: 'xml'
      },
      'css': {
        aliases: ['scss', 'sass', 'less'],
        extensions: ['.css', '.scss', '.sass', '.less'],
        highlightjs: 'css'
      },
      'php': {
        aliases: [],
        extensions: ['.php'],
        highlightjs: 'php'
      },
      'java': {
        aliases: [],
        extensions: ['.java'],
        highlightjs: 'java'
      },
      'c': {
        aliases: [],
        extensions: ['.c', '.h'],
        highlightjs: 'c'
      },
      'cpp': {
        aliases: ['c++', 'cxx'],
        extensions: ['.cpp', '.cxx', '.cc', '.hpp'],
        highlightjs: 'cpp'
      },
      'rust': {
        aliases: ['rs'],
        extensions: ['.rs'],
        highlightjs: 'rust'
      },
      'go': {
        aliases: ['golang'],
        extensions: ['.go'],
        highlightjs: 'go'
      },
      'dockerfile': {
        aliases: ['docker'],
        extensions: ['Dockerfile'],
        highlightjs: 'dockerfile'
      },
      'nginx': {
        aliases: [],
        extensions: ['.conf'],
        highlightjs: 'nginx'
      },
      'apache': {
        aliases: ['httpd'],
        extensions: ['.conf'],
        highlightjs: 'apache'
      }
    };
    
    this.init();
  }

  /**
   * Initialize the syntax highlighter
   */
  async init() {
    try {
      await this.loadHighlightJS();
      this.setupThemeSelector();
      this.highlightAllCodeBlocks();
      console.log('Syntax highlighter initialized');
    } catch (error) {
      console.error('Failed to initialize syntax highlighter:', error);
    }
  }

  /**
   * Load highlight.js library and theme
   */
  async loadHighlightJS() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise(async (resolve, reject) => {
      try {
        // Check if already loaded
        if (window.hljs && this.isLoaded) {
          resolve();
          return;
        }

        // Load CSS theme
        await this.loadTheme(this.currentTheme);

        // Load highlight.js core
        if (!window.hljs) {
          await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js');
        }

        // Load additional language modules
        await this.loadLanguageModules();

        // Configure highlight.js
        if (window.hljs) {
          window.hljs.configure({
            classPrefix: 'hljs-',
            languages: Object.keys(this.languageConfig),
            ignoreUnescapedHTML: true
          });
        }

        this.isLoaded = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    return this.loadPromise;
  }

  /**
   * Load CSS theme
   */
  async loadTheme(themeName) {
    const themeId = 'syntax-highlighter-theme';
    const existingTheme = document.getElementById(themeId);
    
    if (existingTheme) {
      existingTheme.remove();
    }

    const cssLink = document.createElement('link');
    cssLink.id = themeId;
    cssLink.rel = 'stylesheet';
    cssLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${this.themes[themeName] || 'vs2015'}.min.css`;
    
    return new Promise((resolve, reject) => {
      cssLink.onload = resolve;
      cssLink.onerror = reject;
      document.head.appendChild(cssLink);
    });
  }

  /**
   * Load JavaScript file
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Load additional language modules
   */
  async loadLanguageModules() {
    const additionalLanguages = [
      'typescript',
      'php',
      'java',
      'rust',
      'go',
      'dockerfile',
      'nginx',
      'apache'
    ];

    const loadPromises = additionalLanguages.map(lang => 
      this.loadScript(`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/${lang}.min.js`)
        .catch(error => {
          console.warn(`Failed to load language module: ${lang}`, error);
        })
    );

    await Promise.allSettled(loadPromises);
  }

  /**
   * Setup theme selector UI
   */
  setupThemeSelector() {
    // Create theme selector if it doesn't exist
    let themeSelector = document.getElementById('syntax-theme-selector');
    
    if (!themeSelector) {
      themeSelector = document.createElement('select');
      themeSelector.id = 'syntax-theme-selector';
      themeSelector.className = 'syntax-theme-selector';
      
      // Add options
      Object.keys(this.themes).forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = this.formatThemeName(theme);
        option.selected = theme === this.currentTheme;
        themeSelector.appendChild(option);
      });
      
      // Add event listener
      themeSelector.addEventListener('change', (e) => {
        this.changeTheme(e.target.value);
      });
      
      // Try to add to existing theme container or create one
      const themeContainer = document.querySelector('.theme-selector-container') || 
                           document.querySelector('.code-theme-selector') ||
                           this.createThemeContainer();
      
      themeContainer.appendChild(themeSelector);
    }
  }

  /**
   * Create theme container
   */
  createThemeContainer() {
    const container = document.createElement('div');
    container.className = 'theme-selector-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.9);
      padding: 8px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
    `;
    
    const label = document.createElement('label');
    label.textContent = 'Theme: ';
    label.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-right: 8px;
    `;
    
    container.appendChild(label);
    document.body.appendChild(container);
    
    return container;
  }

  /**
   * Change syntax highlighting theme
   */
  async changeTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme not found: ${themeName}`);
      return;
    }

    try {
      this.currentTheme = themeName;
      await this.loadTheme(themeName);
      
      // Re-highlight all code blocks with new theme
      this.highlightAllCodeBlocks();
      
      // Save theme preference
      localStorage.setItem('syntax-highlighter-theme', themeName);
      
      console.log(`Theme changed to: ${themeName}`);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  }

  /**
   * Highlight all code blocks on the page
   */
  highlightAllCodeBlocks() {
    if (!window.hljs) return;

    const codeBlocks = document.querySelectorAll('pre code, .code-block code');
    
    codeBlocks.forEach(block => {
      this.highlightCodeBlock(block);
    });
  }

  /**
   * Highlight a specific code block
   */
  highlightCodeBlock(codeElement) {
    if (!window.hljs || !codeElement) return;

    // Skip if already highlighted
    if (codeElement.dataset.highlighted === 'yes') {
      return;
    }

    // Detect and normalize language
    const language = this.detectLanguage(codeElement);
    
    if (language) {
      // Remove existing language classes
      codeElement.className = codeElement.className.replace(/language-\w+/g, '');
      
      // Add normalized language class
      codeElement.classList.add(`language-${language}`);
      
      // Apply highlighting
      try {
        window.hljs.highlightElement(codeElement);
        codeElement.dataset.highlighted = 'yes';
        
        // Add custom enhancements
        this.addCustomEnhancements(codeElement, language);
        
      } catch (error) {
        console.warn('Highlighting failed for element:', error);
      }
    }
  }

  /**
   * Detect programming language from code element
   */
  detectLanguage(codeElement) {
    // Check class names first
    const classes = Array.from(codeElement.classList);
    
    for (const className of classes) {
      if (className.startsWith('language-')) {
        const lang = className.replace('language-', '');
        return this.normalizeLanguage(lang);
      }
      
      if (className.startsWith('hljs-')) {
        const lang = className.replace('hljs-', '');
        return this.normalizeLanguage(lang);
      }
    }

    // Check parent element classes
    const parent = codeElement.parentElement;
    if (parent) {
      const parentClasses = Array.from(parent.classList);
      for (const className of parentClasses) {
        if (className.startsWith('language-')) {
          const lang = className.replace('language-', '');
          return this.normalizeLanguage(lang);
        }
      }
    }

    // Check data attributes
    const dataLang = codeElement.dataset.language || 
                    codeElement.dataset.lang ||
                    parent?.dataset.language ||
                    parent?.dataset.lang;
    
    if (dataLang) {
      return this.normalizeLanguage(dataLang);
    }

    // Auto-detect from content
    return this.autoDetectLanguage(codeElement.textContent);
  }

  /**
   * Normalize language name
   */
  normalizeLanguage(lang) {
    const normalized = lang.toLowerCase();
    
    // Direct match
    if (this.languageConfig[normalized]) {
      return normalized;
    }
    
    // Check aliases
    for (const [language, config] of Object.entries(this.languageConfig)) {
      if (config.aliases.includes(normalized)) {
        return language;
      }
    }
    
    // Common mappings
    const mappings = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'sh': 'bash',
      'shell': 'bash',
      'yml': 'yaml',
      'htm': 'html',
      'xml': 'html',
      'scss': 'css',
      'sass': 'css',
      'less': 'css'
    };
    
    return mappings[normalized] || normalized;
  }

  /**
   * Auto-detect language from code content
   */
  autoDetectLanguage(code) {
    if (!code || code.trim().length === 0) {
      return 'text';
    }

    const patterns = {
      'javascript': [
        /\b(function|const|let|var|=>|require|import|export)\b/,
        /\bconsole\.(log|error|warn)\b/,
        /\b(async|await|Promise)\b/
      ],
      'typescript': [
        /\b(interface|type|enum|namespace)\b/,
        /:\s*(string|number|boolean|any|void)\b/,
        /\bimport\s+.*\s+from\s+['"].*['"];?/
      ],
      'python': [
        /\b(def|class|import|from|if __name__|print)\b/,
        /^\s*#.*$/m,
        /\b(True|False|None)\b/
      ],
      'bash': [
        /^#!/,
        /\b(sudo|apt|yum|brew|cd|ls|mkdir|chmod)\b/,
        /\$\{.*\}|\$\w+/
      ],
      'sql': [
        /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i,
        /\b(FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b/i,
        /\b(TABLE|DATABASE|INDEX)\b/i
      ],
      'json': [
        /^\s*[\{\[]/,
        /["\w]+\s*:\s*["\w\[\{]/,
        /^\s*[\}\]]\s*$/m
      ],
      'yaml': [
        /^\s*\w+:\s*$/m,
        /^\s*-\s+\w+/m,
        /^\s*#.*$/m
      ],
      'html': [
        /<\/?[a-z][\s\S]*>/i,
        /<!DOCTYPE/i,
        /<(html|head|body|div|span|p|a|img)\b/i
      ],
      'css': [
        /\{[^}]*\}/,
        /\w+\s*:\s*[^;]+;/,
        /@(media|import|keyframes)\b/
      ],
      'php': [
        /<\?php/,
        /\$\w+/,
        /\b(echo|print|function|class|extends)\b/
      ],
      'dockerfile': [
        /^FROM\s+/m,
        /^(RUN|COPY|ADD|WORKDIR|EXPOSE|CMD|ENTRYPOINT)\s+/m
      ]
    };

    // Score each language
    const scores = {};
    
    for (const [language, langPatterns] of Object.entries(patterns)) {
      scores[language] = 0;
      
      for (const pattern of langPatterns) {
        const matches = code.match(pattern);
        if (matches) {
          scores[language] += matches.length;
        }
      }
    }

    // Find language with highest score
    const bestMatch = Object.entries(scores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)[0];

    return bestMatch ? bestMatch[0] : 'text';
  }

  /**
   * Add custom enhancements to highlighted code
   */
  addCustomEnhancements(codeElement, language) {
    // Add language-specific enhancements
    switch (language) {
      case 'bash':
        this.enhanceBashCode(codeElement);
        break;
      case 'javascript':
        this.enhanceJavaScriptCode(codeElement);
        break;
      case 'python':
        this.enhancePythonCode(codeElement);
        break;
      case 'sql':
        this.enhanceSQLCode(codeElement);
        break;
    }
    
    // Add general enhancements
    this.addLineHighlighting(codeElement);
    this.addWordWrapping(codeElement);
  }

  /**
   * Enhance bash code with command highlighting
   */
  enhanceBashCode(codeElement) {
    // Highlight common commands
    const commands = ['sudo', 'apt', 'yum', 'brew', 'docker', 'git', 'npm', 'yarn'];
    
    commands.forEach(cmd => {
      const regex = new RegExp(`\\b${cmd}\\b`, 'g');
      codeElement.innerHTML = codeElement.innerHTML.replace(
        regex, 
        `<span class="hljs-built_in">${cmd}</span>`
      );
    });
  }

  /**
   * Enhance JavaScript code
   */
  enhanceJavaScriptCode(codeElement) {
    // Additional highlighting for modern JS features
    const modernFeatures = ['async', 'await', 'Promise', 'fetch', 'import', 'export'];
    
    modernFeatures.forEach(feature => {
      const regex = new RegExp(`\\b${feature}\\b`, 'g');
      codeElement.innerHTML = codeElement.innerHTML.replace(
        regex,
        `<span class="hljs-keyword">${feature}</span>`
      );
    });
  }

  /**
   * Enhance Python code
   */
  enhancePythonCode(codeElement) {
    // Highlight Python built-ins
    const builtins = ['len', 'range', 'enumerate', 'zip', 'map', 'filter'];
    
    builtins.forEach(builtin => {
      const regex = new RegExp(`\\b${builtin}\\b`, 'g');
      codeElement.innerHTML = codeElement.innerHTML.replace(
        regex,
        `<span class="hljs-built_in">${builtin}</span>`
      );
    });
  }

  /**
   * Enhance SQL code
   */
  enhanceSQLCode(codeElement) {
    // Ensure SQL keywords are uppercase
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INSERT', 'UPDATE', 'DELETE'];
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
      codeElement.innerHTML = codeElement.innerHTML.replace(
        regex,
        `<span class="hljs-keyword">${keyword}</span>`
      );
    });
  }

  /**
   * Add line highlighting capability
   */
  addLineHighlighting(codeElement) {
    const lines = codeElement.innerHTML.split('\n');
    
    const highlightedLines = lines.map((line, index) => {
      return `<span class="code-line" data-line="${index + 1}">${line}</span>`;
    });
    
    codeElement.innerHTML = highlightedLines.join('\n');
  }

  /**
   * Add word wrapping for long lines
   */
  addWordWrapping(codeElement) {
    const preElement = codeElement.closest('pre');
    if (preElement) {
      preElement.style.whiteSpace = 'pre-wrap';
      preElement.style.wordBreak = 'break-word';
    }
  }

  /**
   * Format theme name for display
   */
  formatThemeName(themeName) {
    return themeName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return Object.keys(this.themes);
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Load saved theme preference
   */
  loadSavedTheme() {
    const savedTheme = localStorage.getItem('syntax-highlighter-theme');
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme;
    }
  }

  /**
   * Public API methods
   */
  
  /**
   * Manually highlight a code element
   */
  highlight(codeElement) {
    this.highlightCodeBlock(codeElement);
  }

  /**
   * Re-highlight all code blocks
   */
  rehighlightAll() {
    // Reset highlighted flags
    document.querySelectorAll('code[data-highlighted="yes"]').forEach(el => {
      el.dataset.highlighted = 'no';
    });
    
    this.highlightAllCodeBlocks();
  }

  /**
   * Set theme programmatically
   */
  setTheme(themeName) {
    this.changeTheme(themeName);
  }
}

// Initialize syntax highlighter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.syntaxHighlighter = new SyntaxHighlighter();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SyntaxHighlighter;
}
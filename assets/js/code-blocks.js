/**
 * Code Blocks Module
 * Enhanced code block functionality with copy-to-clipboard, expand/collapse, and interactive features
 */

class CodeBlockManager {
  constructor() {
    this.codeBlocks = [];
    this.copyTimeout = null;
    this.expandedBlocks = new Set();
    
    this.init();
  }

  /**
   * Initialize the code block manager
   */
  init() {
    this.setupCodeBlocks();
    this.setupEventListeners();
    console.log('Code block manager initialized');
  }

  /**
   * Setup all code blocks on the page
   */
  setupCodeBlocks() {
    // Find existing code blocks
    const existingBlocks = document.querySelectorAll('pre code, .code-block');
    existingBlocks.forEach(block => this.enhanceCodeBlock(block));

    // Setup mutation observer for dynamically added code blocks
    this.setupMutationObserver();
  }

  /**
   * Enhance a single code block
   */
  enhanceCodeBlock(element) {
    let codeBlock;
    
    if (element.classList.contains('code-block')) {
      codeBlock = element;
    } else {
      // Wrap existing pre/code elements
      codeBlock = this.wrapCodeBlock(element);
    }

    if (!codeBlock || codeBlock.dataset.enhanced === 'true') {
      return;
    }

    const blockId = this.generateBlockId();
    codeBlock.dataset.blockId = blockId;
    codeBlock.dataset.enhanced = 'true';

    // Extract code information
    const codeInfo = this.extractCodeInfo(codeBlock);
    
    // Create enhanced structure
    this.createCodeBlockStructure(codeBlock, codeInfo, blockId);
    
    // Add to managed blocks
    this.codeBlocks.push({
      id: blockId,
      element: codeBlock,
      info: codeInfo,
      isExpanded: true
    });

    // Apply syntax highlighting
    this.applySyntaxHighlighting(codeBlock);
  }

  /**
   * Wrap existing code elements in enhanced structure
   */
  wrapCodeBlock(element) {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    
    // Insert wrapper before the element
    element.parentNode.insertBefore(wrapper, element);
    
    // Move element into wrapper
    wrapper.appendChild(element);
    
    return wrapper;
  }

  /**
   * Extract code information from element
   */
  extractCodeInfo(codeBlock) {
    const codeElement = codeBlock.querySelector('code') || codeBlock.querySelector('pre');
    const preElement = codeBlock.querySelector('pre') || codeElement;
    
    let language = '';
    let title = '';
    let code = '';
    
    // Extract language from class names
    if (codeElement) {
      const classes = Array.from(codeElement.classList);
      const langClass = classes.find(cls => cls.startsWith('language-') || cls.startsWith('hljs-'));
      if (langClass) {
        language = langClass.replace(/^(language-|hljs-)/, '');
      }
      code = codeElement.textContent || codeElement.innerText || '';
    }
    
    // Extract title from data attribute or comment
    title = codeBlock.dataset.title || 
            preElement?.dataset.title || 
            this.extractTitleFromComment(code) || 
            '';
    
    // Detect language from content if not specified
    if (!language) {
      language = this.detectLanguage(code);
    }
    
    return {
      language: language,
      title: title,
      code: code.trim(),
      lineCount: code.trim().split('\n').length,
      isLarge: code.trim().split('\n').length > 20
    };
  }

  /**
   * Create enhanced code block structure
   */
  createCodeBlockStructure(codeBlock, codeInfo, blockId) {
    // Clear existing content
    const originalContent = codeBlock.innerHTML;
    codeBlock.innerHTML = '';
    
    // Add CSS classes
    codeBlock.classList.add('code-block');
    if (codeInfo.isLarge) {
      codeBlock.classList.add('collapsed');
    }
    
    // Create header
    const header = this.createCodeBlockHeader(codeInfo, blockId);
    codeBlock.appendChild(header);
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'code-block-content';
    
    // Create pre/code elements
    const pre = document.createElement('pre');
    pre.className = 'code-block-pre';
    
    const code = document.createElement('code');
    code.className = `code-block-code language-${codeInfo.language}`;
    code.textContent = codeInfo.code;
    
    pre.appendChild(code);
    
    // Add line numbers if enabled
    if (this.shouldShowLineNumbers(codeInfo)) {
      this.addLineNumbers(pre, codeInfo.lineCount);
      codeBlock.classList.add('code-block-with-lines');
    }
    
    contentContainer.appendChild(pre);
    codeBlock.appendChild(contentContainer);
    
    // Add output section if specified
    const output = codeBlock.dataset.output;
    if (output) {
      this.addCodeOutput(codeBlock, output);
    }
  }

  /**
   * Create code block header with actions
   */
  createCodeBlockHeader(codeInfo, blockId) {
    const header = document.createElement('div');
    header.className = 'code-block-header';
    
    // Title and language
    const titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    titleContainer.style.gap = '12px';
    
    if (codeInfo.title) {
      const title = document.createElement('h4');
      title.className = 'code-block-title';
      title.textContent = codeInfo.title;
      titleContainer.appendChild(title);
    }
    
    if (codeInfo.language) {
      const language = document.createElement('span');
      language.className = 'code-block-language';
      language.textContent = codeInfo.language;
      titleContainer.appendChild(language);
    }
    
    header.appendChild(titleContainer);
    
    // Actions container
    const actions = document.createElement('div');
    actions.className = 'code-block-actions';
    
    // Copy button
    const copyBtn = this.createCopyButton(blockId);
    actions.appendChild(copyBtn);
    
    // Expand/collapse button for large code blocks
    if (codeInfo.isLarge) {
      const expandBtn = this.createExpandButton(blockId);
      actions.appendChild(expandBtn);
    }
    
    // Run button for executable code
    if (this.isExecutableCode(codeInfo.language)) {
      const runBtn = this.createRunButton(blockId);
      actions.appendChild(runBtn);
    }
    
    header.appendChild(actions);
    
    return header;
  }

  /**
   * Create copy button
   */
  createCopyButton(blockId) {
    const button = document.createElement('button');
    button.className = 'code-action-btn copy-btn';
    button.dataset.blockId = blockId;
    button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
      </svg>
      Copy
      <span class="copy-feedback">Copied!</span>
    `;
    button.title = 'Copy code to clipboard';
    
    return button;
  }

  /**
   * Create expand/collapse button
   */
  createExpandButton(blockId) {
    const button = document.createElement('button');
    button.className = 'code-action-btn expand-btn';
    button.dataset.blockId = blockId;
    button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
      Expand
    `;
    button.title = 'Expand code block';
    
    return button;
  }

  /**
   * Create run button for executable code
   */
  createRunButton(blockId) {
    const button = document.createElement('button');
    button.className = 'code-action-btn run-btn';
    button.dataset.blockId = blockId;
    button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5,3 19,12 5,21"></polygon>
      </svg>
      Run
    `;
    button.title = 'Run code (simulation)';
    
    return button;
  }

  /**
   * Add line numbers to code block
   */
  addLineNumbers(preElement, lineCount) {
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'code-line-numbers';
    
    for (let i = 1; i <= lineCount; i++) {
      const lineNumber = document.createElement('span');
      lineNumber.className = 'code-line-number';
      lineNumber.textContent = i;
      lineNumbers.appendChild(lineNumber);
    }
    
    preElement.appendChild(lineNumbers);
  }

  /**
   * Add code output section
   */
  addCodeOutput(codeBlock, output) {
    const outputContainer = document.createElement('div');
    outputContainer.className = 'code-output';
    
    const outputHeader = document.createElement('div');
    outputHeader.className = 'code-output-header';
    outputHeader.innerHTML = `
      <svg class="code-output-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9,11 12,14 22,4"></polyline>
        <path d="M21,12v7a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V5A2,2,0,0,1,5,3H16"></path>
      </svg>
      Output
    `;
    
    const outputContent = document.createElement('div');
    outputContent.textContent = output;
    
    outputContainer.appendChild(outputHeader);
    outputContainer.appendChild(outputContent);
    
    codeBlock.classList.add('code-block-with-output');
    codeBlock.appendChild(outputContainer);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Delegate click events for code block actions
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.code-action-btn');
      if (!button) return;
      
      const blockId = button.dataset.blockId;
      
      if (button.classList.contains('copy-btn')) {
        this.handleCopyClick(blockId);
      } else if (button.classList.contains('expand-btn')) {
        this.handleExpandClick(blockId);
      } else if (button.classList.contains('run-btn')) {
        this.handleRunClick(blockId);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+C on focused code block
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const focusedBlock = document.activeElement.closest('.code-block');
        if (focusedBlock) {
          e.preventDefault();
          this.handleCopyClick(focusedBlock.dataset.blockId);
        }
      }
    });
  }

  /**
   * Handle copy button click
   */
  async handleCopyClick(blockId) {
    const block = this.findBlockById(blockId);
    if (!block) return;
    
    const code = block.info.code;
    const copyBtn = block.element.querySelector('.copy-btn');
    
    try {
      await navigator.clipboard.writeText(code);
      this.showCopyFeedback(copyBtn, true);
    } catch (error) {
      // Fallback for older browsers
      this.fallbackCopyToClipboard(code);
      this.showCopyFeedback(copyBtn, true);
    }
  }

  /**
   * Handle expand/collapse button click
   */
  handleExpandClick(blockId) {
    const block = this.findBlockById(blockId);
    if (!block) return;
    
    const codeBlock = block.element;
    const expandBtn = codeBlock.querySelector('.expand-btn');
    const isCollapsed = codeBlock.classList.contains('collapsed');
    
    if (isCollapsed) {
      codeBlock.classList.remove('collapsed');
      expandBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18,15 12,9 6,15"></polyline>
        </svg>
        Collapse
      `;
      expandBtn.title = 'Collapse code block';
      this.expandedBlocks.add(blockId);
    } else {
      codeBlock.classList.add('collapsed');
      expandBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
        Expand
      `;
      expandBtn.title = 'Expand code block';
      this.expandedBlocks.delete(blockId);
    }
    
    block.isExpanded = !isCollapsed;
  }

  /**
   * Handle run button click (simulation)
   */
  handleRunClick(blockId) {
    const block = this.findBlockById(blockId);
    if (!block) return;
    
    const runBtn = block.element.querySelector('.run-btn');
    const originalContent = runBtn.innerHTML;
    
    // Show loading state
    runBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12,6 L12,12 L16,14"></path>
      </svg>
      Running...
    `;
    runBtn.disabled = true;
    
    // Simulate execution
    setTimeout(() => {
      runBtn.innerHTML = originalContent;
      runBtn.disabled = false;
      
      // Show simulated output
      this.showSimulatedOutput(block);
    }, 1500);
  }

  /**
   * Show copy feedback
   */
  showCopyFeedback(copyBtn, success) {
    const feedback = copyBtn.querySelector('.copy-feedback');
    
    if (success) {
      copyBtn.classList.add('success');
      feedback.textContent = 'Copied!';
    } else {
      feedback.textContent = 'Failed to copy';
    }
    
    feedback.classList.add('show');
    
    clearTimeout(this.copyTimeout);
    this.copyTimeout = setTimeout(() => {
      feedback.classList.remove('show');
      copyBtn.classList.remove('success');
    }, 2000);
  }

  /**
   * Fallback copy to clipboard for older browsers
   */
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (error) {
      console.error('Fallback copy failed:', error);
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * Show simulated code output
   */
  showSimulatedOutput(block) {
    const { language, code } = block.info;
    let output = '';
    
    // Generate simulated output based on language
    switch (language) {
      case 'bash':
      case 'shell':
        output = this.simulateBashOutput(code);
        break;
      case 'javascript':
        output = this.simulateJavaScriptOutput(code);
        break;
      case 'python':
        output = this.simulatePythonOutput(code);
        break;
      default:
        output = 'Code executed successfully!';
    }
    
    // Add or update output section
    let outputContainer = block.element.querySelector('.code-output');
    if (!outputContainer) {
      this.addCodeOutput(block.element, output);
    } else {
      const outputContent = outputContainer.querySelector('div:last-child');
      outputContent.textContent = output;
    }
  }

  /**
   * Simulate bash command output
   */
  simulateBashOutput(code) {
    const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    const outputs = [];
    
    lines.forEach(line => {
      const cmd = line.trim();
      if (cmd.startsWith('ls')) {
        outputs.push('file1.txt  file2.txt  directory/');
      } else if (cmd.startsWith('pwd')) {
        outputs.push('/home/user/crypto-project');
      } else if (cmd.startsWith('echo')) {
        const match = cmd.match(/echo\s+["']?([^"']+)["']?/);
        outputs.push(match ? match[1] : 'Hello World');
      } else if (cmd.includes('--version')) {
        outputs.push('version 1.0.0');
      } else {
        outputs.push('Command executed successfully');
      }
    });
    
    return outputs.join('\n');
  }

  /**
   * Simulate JavaScript output
   */
  simulateJavaScriptOutput(code) {
    if (code.includes('console.log')) {
      const matches = code.match(/console\.log\([^)]+\)/g);
      if (matches) {
        return matches.map(match => {
          const content = match.match(/console\.log\(([^)]+)\)/)[1];
          return content.replace(/['"]/g, '');
        }).join('\n');
      }
    }
    
    if (code.includes('return')) {
      return 'Function executed and returned result';
    }
    
    return 'undefined';
  }

  /**
   * Simulate Python output
   */
  simulatePythonOutput(code) {
    if (code.includes('print(')) {
      const matches = code.match(/print\([^)]+\)/g);
      if (matches) {
        return matches.map(match => {
          const content = match.match(/print\(([^)]+)\)/)[1];
          return content.replace(/['"]/g, '');
        }).join('\n');
      }
    }
    
    return 'Script executed successfully';
  }

  /**
   * Apply syntax highlighting
   */
  applySyntaxHighlighting(codeBlock) {
    const codeElement = codeBlock.querySelector('code');
    if (!codeElement) return;
    
    // Use highlight.js if available
    if (window.hljs) {
      window.hljs.highlightElement(codeElement);
    } else {
      // Load highlight.js dynamically
      this.loadHighlightJS().then(() => {
        if (window.hljs) {
          window.hljs.highlightElement(codeElement);
        }
      });
    }
  }

  /**
   * Load highlight.js library
   */
  async loadHighlightJS() {
    if (window.hljs) return;
    
    try {
      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css';
      document.head.appendChild(cssLink);
      
      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
      
      return new Promise((resolve, reject) => {
        script.onload = () => {
          // Initialize highlight.js
          if (window.hljs) {
            window.hljs.configure({
              languages: ['javascript', 'python', 'bash', 'sql', 'json', 'yaml', 'html', 'css']
            });
          }
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Failed to load highlight.js:', error);
    }
  }

  /**
   * Setup mutation observer for dynamic content
   */
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node itself is a code block
            if (node.matches && (node.matches('pre code') || node.matches('.code-block'))) {
              this.enhanceCodeBlock(node);
            }
            
            // Check for code blocks within the added node
            const codeBlocks = node.querySelectorAll && node.querySelectorAll('pre code, .code-block');
            if (codeBlocks) {
              codeBlocks.forEach(block => this.enhanceCodeBlock(block));
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Utility methods
   */
  generateBlockId() {
    return 'code-block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  findBlockById(blockId) {
    return this.codeBlocks.find(block => block.id === blockId);
  }

  extractTitleFromComment(code) {
    const firstLine = code.split('\n')[0];
    const commentMatch = firstLine.match(/^(?:\/\/|#|\/\*|\<!--)\s*(.+?)(?:\*\/|-->)?$/);
    return commentMatch ? commentMatch[1].trim() : '';
  }

  detectLanguage(code) {
    // Simple language detection based on patterns
    if (code.includes('#!/bin/bash') || code.includes('sudo ') || code.includes('apt ')) {
      return 'bash';
    }
    if (code.includes('function ') || code.includes('const ') || code.includes('let ')) {
      return 'javascript';
    }
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
      return 'python';
    }
    if (code.includes('SELECT ') || code.includes('CREATE TABLE')) {
      return 'sql';
    }
    if (code.includes('{') && code.includes('"')) {
      return 'json';
    }
    
    return 'text';
  }

  shouldShowLineNumbers(codeInfo) {
    return codeInfo.lineCount > 5 && !['json', 'yaml'].includes(codeInfo.language);
  }

  isExecutableCode(language) {
    return ['bash', 'shell', 'javascript', 'python'].includes(language);
  }

  /**
   * Public API methods
   */
  
  /**
   * Manually enhance a code block
   */
  enhance(element) {
    this.enhanceCodeBlock(element);
  }

  /**
   * Get all managed code blocks
   */
  getBlocks() {
    return this.codeBlocks;
  }

  /**
   * Copy code from specific block
   */
  copyCode(blockId) {
    this.handleCopyClick(blockId);
  }

  /**
   * Toggle expansion of specific block
   */
  toggleExpansion(blockId) {
    this.handleExpandClick(blockId);
  }
}

// Initialize code block manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.codeBlockManager = new CodeBlockManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeBlockManager;
}
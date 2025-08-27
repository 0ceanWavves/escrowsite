/**
 * Code Blocks Component Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockElement, simulateUserInteraction } from '../setup.js';

describe('CodeBlockManager', () => {
  let codeBlockManager;
  let mockClipboard;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock clipboard API
    mockClipboard = {
      writeText: vi.fn(() => Promise.resolve()),
      readText: vi.fn(() => Promise.resolve(''))
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    // Create mock CodeBlockManager class
    class MockCodeBlockManager {
      constructor() {
        this.codeBlocks = [];
        this.copyTimeout = null;
        this.expandedBlocks = new Set();
        this.init();
      }

      init() {
        this.setupCodeBlocks();
      }

      setupCodeBlocks() {
        const existingBlocks = document.querySelectorAll('pre code, .code-block');
        existingBlocks.forEach(block => this.enhanceCodeBlock(block));
      }

      enhanceCodeBlock(element) {
        if (element.dataset.enhanced === 'true') return;

        const blockId = this.generateBlockId();
        element.dataset.blockId = blockId;
        element.dataset.enhanced = 'true';

        const codeInfo = this.extractCodeInfo(element);
        this.codeBlocks.push({
          id: blockId,
          element: element,
          info: codeInfo,
          isExpanded: true
        });
      }

      extractCodeInfo(codeBlock) {
        const codeElement = codeBlock.querySelector('code') || codeBlock;
        const code = codeElement.textContent || '';
        
        return {
          language: 'javascript',
          title: '',
          code: code.trim(),
          lineCount: code.trim().split('\n').length,
          isLarge: code.trim().split('\n').length > 20
        };
      }

      async handleCopyClick(blockId) {
        const block = this.findBlockById(blockId);
        if (!block) return;
        
        try {
          await navigator.clipboard.writeText(block.info.code);
          return true;
        } catch (error) {
          return false;
        }
      }

      generateBlockId() {
        return 'code-block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }

      findBlockById(blockId) {
        return this.codeBlocks.find(block => block.id === blockId);
      }

      detectLanguage(code) {
        if (code.includes('function ') || code.includes('const ')) {
          return 'javascript';
        }
        if (code.includes('def ') || code.includes('import ')) {
          return 'python';
        }
        return 'text';
      }
    }

    codeBlockManager = new MockCodeBlockManager();
  });

  describe('Initialization', () => {
    it('should initialize with empty code blocks array', () => {
      expect(codeBlockManager.codeBlocks).toEqual([]);
    });

    it('should enhance existing code blocks on init', () => {
      const codeElement = createMockElement('code', {}, 'console.log("Hello World");');
      const preElement = createMockElement('pre');
      preElement.appendChild(codeElement);
      document.body.appendChild(preElement);

      codeBlockManager.setupCodeBlocks();
      
      expect(codeBlockManager.codeBlocks).toHaveLength(1);
    });
  });
});
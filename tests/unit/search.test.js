/**
 * Search Engine Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockElement, simulateUserInteraction, waitFor } from '../setup.js';

// Import the SearchEngine class
import SearchEngine from '../../assets/js/search.js';

describe('SearchEngine', () => {
  let searchEngine;
  let mockSearchIndex;

  beforeEach(() => {
    // Mock search index data
    mockSearchIndex = [
      {
        title: 'Database Schemas',
        description: 'Learn about database design and schema implementation',
        content: 'Database schemas are essential for organizing data structures',
        keywords: ['database', 'schema', 'sql', 'design'],
        section: 'development-roadmap',
        type: 'guide',
        phase: 'Phase 1',
        url: '/development-roadmap/phase-1/database-schemas.html'
      },
      {
        title: 'Payment Gateways',
        description: 'Integration with cryptocurrency payment systems',
        content: 'Payment gateways handle crypto transactions securely',
        keywords: ['payment', 'gateway', 'crypto', 'bitcoin'],
        section: 'development-roadmap',
        type: 'guide',
        phase: 'Phase 1',
        url: '/development-roadmap/phase-1/payment-gateways.html'
      },
      {
        title: 'VPS Selection',
        description: 'Choosing the right VPS for your crypto node',
        content: 'VPS selection is crucial for node performance and reliability',
        keywords: ['vps', 'server', 'hosting', 'node'],
        section: 'node-guides',
        type: 'guide',
        phase: 'Phase 1',
        url: '/node-guides/procurement-provisioning/vps-selection.html'
      }
    ];

    // Mock fetch to return search index
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ searchIndex: mockSearchIndex })
    });

    // Create mock DOM elements
    const searchInput = createMockElement('input', {
      id: 'search-input',
      type: 'text'
    });
    
    const searchResults = createMockElement('div', {
      id: 'search-results'
    });
    
    const sectionFilter = createMockElement('select', {
      id: 'section-filter'
    });
    
    const typeFilter = createMockElement('select', {
      id: 'type-filter'
    });

    document.body.appendChild(searchInput);
    document.body.appendChild(searchResults);
    document.body.appendChild(sectionFilter);
    document.body.appendChild(typeFilter);
  });

  describe('Initialization', () => {
    it('should initialize successfully with search index', async () => {
      searchEngine = new SearchEngine();
      
      await waitFor(() => searchEngine.isInitialized);
      
      expect(searchEngine.isInitialized).toBe(true);
      expect(searchEngine.searchIndex).toEqual(mockSearchIndex);
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      searchEngine = new SearchEngine();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize search engine')
      );
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      searchEngine = new SearchEngine();
      await waitFor(() => searchEngine.isInitialized);
    });

    it('should perform basic text search', () => {
      const results = searchEngine.searchContent('database');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Database Schemas');
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should search across multiple fields', () => {
      const results = searchEngine.searchContent('payment');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Payment Gateways');
    });

    it('should handle multi-word queries', () => {
      const results = searchEngine.searchContent('database schema');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Database Schemas');
    });

    it('should return empty results for non-matching queries', () => {
      const results = searchEngine.searchContent('nonexistent');
      
      expect(results).toHaveLength(0);
    });

    it('should score exact title matches higher', () => {
      const results = searchEngine.searchContent('Database Schemas');
      
      expect(results).toHaveLength(1);
      expect(results[0].score).toBeGreaterThan(20); // Exact match bonus
    });

    it('should limit results to maximum count', () => {
      // Add more mock data to test limit
      const manyResults = Array.from({ length: 15 }, (_, i) => ({
        title: `Test Result ${i}`,
        description: 'Test description with database keyword',
        content: 'Test content',
        keywords: ['database', 'test'],
        section: 'test',
        type: 'guide',
        url: `/test-${i}.html`
      }));
      
      searchEngine.searchIndex = [...mockSearchIndex, ...manyResults];
      
      const results = searchEngine.searchContent('database');
      
      expect(results.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Filtering', () => {
    beforeEach(async () => {
      searchEngine = new SearchEngine();
      await waitFor(() => searchEngine.isInitialized);
    });

    it('should filter by section', () => {
      searchEngine.filters.section = 'development-roadmap';
      
      const results = searchEngine.searchContent('guide');
      
      expect(results.every(r => r.section === 'development-roadmap')).toBe(true);
    });

    it('should filter by type', () => {
      searchEngine.filters.type = 'guide';
      
      const results = searchEngine.searchContent('database');
      
      expect(results.every(r => r.type === 'guide')).toBe(true);
    });

    it('should apply multiple filters simultaneously', () => {
      searchEngine.filters.section = 'node-guides';
      searchEngine.filters.type = 'guide';
      
      const results = searchEngine.searchContent('vps');
      
      expect(results).toHaveLength(1);
      expect(results[0].section).toBe('node-guides');
      expect(results[0].type).toBe('guide');
    });
  });

  describe('UI Interaction', () => {
    beforeEach(async () => {
      searchEngine = new SearchEngine();
      await waitFor(() => searchEngine.isInitialized);
    });

    it('should perform search on input', async () => {
      const searchInput = document.getElementById('search-input');
      
      await simulateUserInteraction(searchInput, 'input', { value: 'database' });
      
      // Wait for debounced search
      await new Promise(resolve => setTimeout(resolve, 350));
      
      expect(searchEngine.currentQuery).toBe('database');
      expect(searchEngine.searchResults).toHaveLength(1);
    });

    it('should clear search on Escape key', async () => {
      const searchInput = document.getElementById('search-input');
      searchInput.value = 'test query';
      searchEngine.currentQuery = 'test query';
      
      await simulateUserInteraction(searchInput, 'keydown', { key: 'Escape' });
      
      expect(searchInput.value).toBe('');
      expect(searchEngine.currentQuery).toBe('');
    });

    it('should navigate to first result on Enter key', async () => {
      const searchInput = document.getElementById('search-input');
      
      // Set up search results
      searchEngine.searchResults = [mockSearchIndex[0]];
      
      const locationSpy = vi.spyOn(window.location, 'assign');
      
      await simulateUserInteraction(searchInput, 'keydown', { key: 'Enter' });
      
      expect(window.location.href).toBe(mockSearchIndex[0].url);
    });

    it('should update filters and re-search', async () => {
      const sectionFilter = document.getElementById('section-filter');
      
      // First perform a search
      searchEngine.performSearch('database');
      
      // Change filter
      sectionFilter.value = 'node-guides';
      await simulateUserInteraction(sectionFilter, 'change');
      
      expect(searchEngine.filters.section).toBe('node-guides');
    });
  });

  describe('Results Display', () => {
    beforeEach(async () => {
      searchEngine = new SearchEngine();
      await waitFor(() => searchEngine.isInitialized);
    });

    it('should display search results in DOM', () => {
      const results = [mockSearchIndex[0]];
      
      searchEngine.displaySearchResults(results);
      
      const resultsContainer = document.getElementById('search-results');
      expect(resultsContainer.innerHTML).toContain('Database Schemas');
      expect(resultsContainer.innerHTML).toContain('Development Roadmap');
    });

    it('should show no results message when empty', () => {
      searchEngine.currentQuery = 'nonexistent';
      
      searchEngine.displaySearchResults([]);
      
      const resultsContainer = document.getElementById('search-results');
      expect(resultsContainer.innerHTML).toContain('No results found');
    });

    it('should highlight search terms in results', () => {
      const highlightedText = searchEngine.highlightText('Database Schemas', 'database');
      
      expect(highlightedText).toContain('<mark>Database</mark>');
    });

    it('should handle multiple search terms in highlighting', () => {
      const highlightedText = searchEngine.highlightText('Database Schema Design', 'database schema');
      
      expect(highlightedText).toContain('<mark>Database</mark>');
      expect(highlightedText).toContain('<mark>Schema</mark>');
    });

    it('should add click handlers to result items', () => {
      const results = [mockSearchIndex[0]];
      
      searchEngine.displaySearchResults(results);
      
      const resultItem = document.querySelector('.search-result-item');
      expect(resultItem).toBeTruthy();
      expect(resultItem.dataset.url).toBe(mockSearchIndex[0].url);
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(async () => {
      searchEngine = new SearchEngine();
      await waitFor(() => searchEngine.isInitialized);
    });

    it('should focus search input on Ctrl+K', async () => {
      const searchInput = document.getElementById('search-input');
      const focusSpy = vi.spyOn(searchInput, 'focus');
      
      await simulateUserInteraction(document, 'keydown', { 
        key: 'k', 
        ctrlKey: true 
      });
      
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should focus search input on Cmd+K (Mac)', async () => {
      const searchInput = document.getElementById('search-input');
      const focusSpy = vi.spyOn(searchInput, 'focus');
      
      await simulateUserInteraction(document, 'keydown', { 
        key: 'k', 
        metaKey: true 
      });
      
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('Suggestions', () => {
    beforeEach(async () => {
      searchEngine = new SearchEngine();
      await waitFor(() => searchEngine.isInitialized);
    });

    it('should generate suggestions for partial queries', () => {
      const suggestions = searchEngine.getSuggestions('data');
      
      expect(suggestions).toContain('database');
    });

    it('should return empty suggestions for short queries', () => {
      const suggestions = searchEngine.getSuggestions('d');
      
      expect(suggestions).toHaveLength(0);
    });

    it('should limit suggestions count', () => {
      const suggestions = searchEngine.getSuggestions('test');
      
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Utility Functions', () => {
    beforeEach(async () => {
      searchEngine = new SearchEngine();
      await waitFor(() => searchEngine.isInitialized);
    });

    it('should escape regex special characters', () => {
      const escaped = searchEngine.escapeRegExp('test.regex+chars');
      
      expect(escaped).toBe('test\\.regex\\+chars');
    });

    it('should format section names correctly', () => {
      expect(searchEngine.formatSection('development-roadmap')).toBe('Development Roadmap');
      expect(searchEngine.formatSection('node-guides')).toBe('Node Guides');
    });

    it('should format type names correctly', () => {
      expect(searchEngine.formatType('overview')).toBe('Overview');
      expect(searchEngine.formatType('phase')).toBe('Phase');
      expect(searchEngine.formatType('guide')).toBe('Guide');
    });

    it('should export search results for analytics', () => {
      searchEngine.currentQuery = 'test';
      searchEngine.searchResults = [mockSearchIndex[0]];
      
      const exported = searchEngine.exportResults();
      
      expect(exported.query).toBe('test');
      expect(exported.results).toEqual([mockSearchIndex[0]]);
      expect(exported.timestamp).toBeTruthy();
    });
  });

  describe('Debouncing', () => {
    beforeEach(async () => {
      searchEngine = new SearchEngine();
      await waitFor(() => searchEngine.isInitialized);
    });

    it('should debounce search input', async () => {
      const searchSpy = vi.spyOn(searchEngine, 'performSearch');
      const searchInput = document.getElementById('search-input');
      
      // Rapid input changes
      await simulateUserInteraction(searchInput, 'input', { value: 'd' });
      await simulateUserInteraction(searchInput, 'input', { value: 'da' });
      await simulateUserInteraction(searchInput, 'input', { value: 'dat' });
      await simulateUserInteraction(searchInput, 'input', { value: 'data' });
      
      // Wait for debounce period
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Should only call search once after debounce
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(searchSpy).toHaveBeenCalledWith('data');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM elements gracefully', async () => {
      // Remove search input
      document.getElementById('search-input')?.remove();
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      searchEngine = new SearchEngine();
      
      // Should not throw errors
      expect(() => searchEngine.focusSearchInput()).not.toThrow();
    });

    it('should handle malformed search index', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ searchIndex: null })
      });
      
      searchEngine = new SearchEngine();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(searchEngine.searchIndex).toBeNull();
    });
  });
});
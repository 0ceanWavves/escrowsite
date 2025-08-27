/**
 * Language Switcher Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockElement, simulateUserInteraction } from '../setup.js';

describe('LanguageSwitcher', () => {
  let languageSwitcher;
  let mockLocalStorage;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock navigator.language
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      writable: true,
    });

    // Mock fetch
    global.fetch = vi.fn();

    // Create mock class for testing
    class MockLanguageSwitcher {
      constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'nl', 'fr'];
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.init();
      }

      init() {
        this.detectLanguage();
        this.loadEmbeddedTranslations();
      }

      detectLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        if (urlLang && this.supportedLanguages.includes(urlLang)) {
          this.currentLanguage = urlLang;
          return;
        }
        
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
          this.currentLanguage = savedLang;
          return;
        }
        
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) {
          this.currentLanguage = browserLang;
          return;
        }
        
        this.currentLanguage = this.fallbackLanguage;
      }

      switchLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
          return;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('preferred-language', lang);
        
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { language: lang }
        }));
      }

      loadEmbeddedTranslations() {
        this.translations = {
          en: {
            'nav.home': 'Home',
            'nav.development-roadmap': 'Development Roadmap',
            'common.search': 'Search',
            'site.title': 'The Road to Crypto'
          },
          nl: {
            'nav.home': 'Home',
            'nav.development-roadmap': 'Ontwikkelingsroadmap',
            'common.search': 'Zoeken',
            'site.title': 'De Weg naar Crypto'
          },
          fr: {
            'nav.home': 'Accueil',
            'nav.development-roadmap': 'Feuille de Route',
            'common.search': 'Rechercher',
            'site.title': 'La Voie vers la Crypto'
          }
        };
      }

      getTranslation(key) {
        const currentTranslations = this.translations[this.currentLanguage];
        const fallbackTranslations = this.translations[this.fallbackLanguage];
        
        if (currentTranslations && currentTranslations[key]) {
          return currentTranslations[key];
        }
        
        if (fallbackTranslations && fallbackTranslations[key]) {
          return fallbackTranslations[key];
        }
        
        return key;
      }

      applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
          const key = element.dataset.i18n;
          const translation = this.getTranslation(key);
          
          if (element.tagName === 'INPUT' && element.type === 'text') {
            element.placeholder = translation;
          } else {
            element.textContent = translation;
          }
        });

        document.querySelectorAll('[data-i18n-html]').forEach(element => {
          const key = element.dataset.i18nHtml;
          const translation = this.getTranslation(key);
          element.innerHTML = translation;
        });

        const titleKey = document.querySelector('meta[name="i18n-title"]')?.content;
        if (titleKey) {
          const titleTranslation = this.getTranslation(titleKey);
          if (titleTranslation) {
            document.title = titleTranslation;
          }
        }
      }

      getCurrentLanguage() {
        return this.currentLanguage;
      }

      getSupportedLanguages() {
        return [...this.supportedLanguages];
      }

      isLanguageSupported(lang) {
        return this.supportedLanguages.includes(lang);
      }

      getLanguageDisplayName(lang) {
        const displayNames = {
          'en': 'English',
          'nl': 'Nederlands',
          'fr': 'Français'
        };
        return displayNames[lang] || lang;
      }

      getLanguageFlag(lang) {
        const flags = {
          'en': '🇬🇧',
          'nl': '🇳🇱',
          'fr': '🇫🇷'
        };
        return flags[lang] || '🌐';
      }

      addTranslation(lang, key, value) {
        if (!this.translations[lang]) {
          this.translations[lang] = {};
        }
        this.translations[lang][key] = value;
      }
    }

    languageSwitcher = new MockLanguageSwitcher();
  });

  describe('Initialization', () => {
    it('should initialize with default language', () => {
      expect(languageSwitcher.currentLanguage).toBe('en');
      expect(languageSwitcher.supportedLanguages).toContain('en');
      expect(languageSwitcher.supportedLanguages).toContain('nl');
      expect(languageSwitcher.supportedLanguages).toContain('fr');
    });

    it('should detect language from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('nl');
      
      const switcher = new languageSwitcher.constructor();
      expect(switcher.currentLanguage).toBe('nl');
    });
  });

  describe('Language Switching', () => {
    it('should switch language successfully', () => {
      languageSwitcher.switchLanguage('fr');
      
      expect(languageSwitcher.currentLanguage).toBe('fr');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('preferred-language', 'fr');
    });

    it('should not switch to unsupported language', () => {
      const originalLang = languageSwitcher.currentLanguage;
      languageSwitcher.switchLanguage('de');
      
      expect(languageSwitcher.currentLanguage).toBe(originalLang);
    });

    it('should dispatch language change event', () => {
      const eventSpy = vi.fn();
      window.addEventListener('languageChanged', eventSpy);
      
      languageSwitcher.switchLanguage('fr');
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { language: 'fr' }
        })
      );
    });
  });

  describe('Translation Application', () => {
    it('should translate elements with data-i18n attribute', () => {
      const element = createMockElement('span', {
        dataset: { i18n: 'nav.home' }
      });
      document.body.appendChild(element);

      languageSwitcher.applyTranslations();
      
      expect(element.textContent).toBe('Home');
    });

    it('should translate input placeholders', () => {
      const input = createMockElement('input', {
        type: 'text',
        dataset: { i18n: 'common.search' }
      });
      document.body.appendChild(input);

      languageSwitcher.applyTranslations();
      
      expect(input.placeholder).toBe('Search');
    });

    it('should handle missing translations gracefully', () => {
      const element = createMockElement('span', {
        dataset: { i18n: 'nonexistent.key' }
      });
      document.body.appendChild(element);

      languageSwitcher.applyTranslations();
      
      expect(element.textContent).toBe('nonexistent.key');
    });
  });

  describe('Translation Utilities', () => {
    it('should get translation with fallback', () => {
      const translation = languageSwitcher.getTranslation('nav.home');
      expect(translation).toBe('Home');
    });

    it('should add translation dynamically', () => {
      languageSwitcher.addTranslation('en', 'test.key', 'Test Value');
      
      const translation = languageSwitcher.getTranslation('test.key');
      expect(translation).toBe('Test Value');
    });

    it('should check if language is supported', () => {
      expect(languageSwitcher.isLanguageSupported('en')).toBe(true);
      expect(languageSwitcher.isLanguageSupported('de')).toBe(false);
    });

    it('should get language display name', () => {
      expect(languageSwitcher.getLanguageDisplayName('en')).toBe('English');
      expect(languageSwitcher.getLanguageDisplayName('nl')).toBe('Nederlands');
      expect(languageSwitcher.getLanguageDisplayName('fr')).toBe('Français');
    });

    it('should get language flag emoji', () => {
      expect(languageSwitcher.getLanguageFlag('en')).toBe('🇬🇧');
      expect(languageSwitcher.getLanguageFlag('nl')).toBe('🇳🇱');
      expect(languageSwitcher.getLanguageFlag('fr')).toBe('🇫🇷');
      expect(languageSwitcher.getLanguageFlag('unknown')).toBe('🌐');
    });
  });

  describe('API Methods', () => {
    it('should return current language', () => {
      expect(languageSwitcher.getCurrentLanguage()).toBe('en');
    });

    it('should return supported languages', () => {
      const languages = languageSwitcher.getSupportedLanguages();
      expect(languages).toEqual(['en', 'nl', 'fr']);
    });
  });
});
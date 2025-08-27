/**
 * Language Switcher Module - Handles multilingual support
 */

class LanguageSwitcher {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'nl', 'fr'];
        this.translations = {};
        this.fallbackLanguage = 'en';
        
        this.init();
    }
    
    init() {
        this.detectLanguage();
        this.setupEventListeners();
        this.loadTranslations();
        this.updateLanguageIndicators();
    }
    
    /**
     * Detect current language from URL, localStorage, or browser
     */
    detectLanguage() {
        // Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        if (urlLang && this.supportedLanguages.includes(urlLang)) {
            this.currentLanguage = urlLang;
            this.saveLanguagePreference(urlLang);
            return;
        }
        
        // Check localStorage
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
            return;
        }
        
        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) {
            this.currentLanguage = browserLang;
            this.saveLanguagePreference(browserLang);
            return;
        }
        
        // Default to English
        this.currentLanguage = this.fallbackLanguage;
    }
    
    /**
     * Setup event listeners for language switching
     */
    setupEventListeners() {
        // Language flag clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.lang-flag')) {
                const lang = e.target.dataset.lang;
                if (lang && this.supportedLanguages.includes(lang)) {
                    this.switchLanguage(lang);
                }
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key >= '1' && e.key <= '3') {
                e.preventDefault();
                const langIndex = parseInt(e.key) - 1;
                if (langIndex < this.supportedLanguages.length) {
                    this.switchLanguage(this.supportedLanguages[langIndex]);
                }
            }
        });
    }
    
    /**
     * Load translations for current language
     */
    async loadTranslations() {
        try {
            // Try to load from external JSON file first
            const response = await fetch(`/assets/data/translations/${this.currentLanguage}.json`);
            if (response.ok) {
                this.translations[this.currentLanguage] = await response.json();
            } else {
                // Fallback to embedded translations
                this.loadEmbeddedTranslations();
            }
        } catch (error) {
            console.warn('Failed to load translations, using embedded fallback:', error);
            this.loadEmbeddedTranslations();
        }
        
        this.applyTranslations();
    }
    
    /**
     * Load embedded translations as fallback
     */
    loadEmbeddedTranslations() {
        this.translations = {
            en: {
                // Navigation
                'nav.home': 'Home',
                'nav.development-roadmap': 'Development Roadmap',
                'nav.node-guides': 'Node Guides',
                
                // Common elements
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.warning': 'Warning',
                'common.info': 'Information',
                'common.next': 'Next',
                'common.previous': 'Previous',
                'common.continue': 'Continue',
                'common.back': 'Back',
                'common.close': 'Close',
                'common.search': 'Search',
                'common.menu': 'Menu',
                
                // Site branding
                'site.title': 'The Road to Crypto',
                'site.subtitle': 'An Interactive Implementation Blueprint',
                
                // Development Roadmap
                'roadmap.title': 'Development Roadmap',
                'roadmap.subtitle': 'A Phased Approach to Secure Crypto Integration',
                'roadmap.phase1': 'Phase 1: Foundational Infrastructure',
                'roadmap.phase2': 'Phase 2: Backend & APIs',
                'roadmap.phase3': 'Phase 3: Frontend & UI',
                
                // Node Guides
                'guides.title': 'Node Setup Guides',
                'guides.subtitle': 'Complete BTC & XMR Node Setup',
                'guides.phase1': 'Phase 1: Procurement & Provisioning',
                'guides.phase2': 'Phase 2: Server Foundation & Security',
                'guides.phase3': 'Phase 3: Node Software Installation',
                'guides.phase4': 'Phase 4: Blockchain Synchronization',
                
                // Footer
                'footer.copyright': '© 2025 The Road to Crypto'
            },
            nl: {
                // Navigation
                'nav.home': 'Home',
                'nav.development-roadmap': 'Ontwikkelingsroadmap',
                'nav.node-guides': 'Node Gidsen',
                
                // Common elements
                'common.loading': 'Laden...',
                'common.error': 'Fout',
                'common.success': 'Succes',
                'common.warning': 'Waarschuwing',
                'common.info': 'Informatie',
                'common.next': 'Volgende',
                'common.previous': 'Vorige',
                'common.continue': 'Doorgaan',
                'common.back': 'Terug',
                'common.close': 'Sluiten',
                'common.search': 'Zoeken',
                'common.menu': 'Menu',
                
                // Site branding
                'site.title': 'De Weg naar Crypto',
                'site.subtitle': 'Een Interactieve Implementatie Blueprint',
                
                // Development Roadmap
                'roadmap.title': 'Ontwikkelingsroadmap',
                'roadmap.subtitle': 'Een Gefaseerde Aanpak voor Veilige Crypto-integratie',
                'roadmap.phase1': 'Fase 1: Fundamentele Infrastructuur',
                'roadmap.phase2': 'Fase 2: Backend & API\'s',
                'roadmap.phase3': 'Fase 3: Frontend & UI',
                
                // Node Guides
                'guides.title': 'Node Setup Gidsen',
                'guides.subtitle': 'Volledige BTC & XMR Node Setup',
                'guides.phase1': 'Fase 1: Inkoop & Provisioning',
                'guides.phase2': 'Fase 2: Server Fundament & Beveiliging',
                'guides.phase3': 'Fase 3: Node Software Installatie',
                'guides.phase4': 'Fase 4: Blockchain Synchronisatie',
                
                // Footer
                'footer.copyright': '© 2025 De Weg naar Crypto'
            },
            fr: {
                // Navigation
                'nav.home': 'Accueil',
                'nav.development-roadmap': 'Feuille de Route',
                'nav.node-guides': 'Guides de Nœud',
                
                // Common elements
                'common.loading': 'Chargement...',
                'common.error': 'Erreur',
                'common.success': 'Succès',
                'common.warning': 'Avertissement',
                'common.info': 'Information',
                'common.next': 'Suivant',
                'common.previous': 'Précédent',
                'common.continue': 'Continuer',
                'common.back': 'Retour',
                'common.close': 'Fermer',
                'common.search': 'Rechercher',
                'common.menu': 'Menu',
                
                // Site branding
                'site.title': 'La Voie vers la Crypto',
                'site.subtitle': 'Un Plan de Mise en Œuvre Interactif',
                
                // Development Roadmap
                'roadmap.title': 'Feuille de Route de Développement',
                'roadmap.subtitle': 'Une Approche en Phases pour une Intégration Crypto Sécurisée',
                'roadmap.phase1': 'Phase 1: Infrastructure Fondamentale',
                'roadmap.phase2': 'Phase 2: Backend & APIs',
                'roadmap.phase3': 'Phase 3: Frontend & UI',
                
                // Node Guides
                'guides.title': 'Guides de Configuration de Nœud',
                'guides.subtitle': 'Configuration Complète de Nœud BTC & XMR',
                'guides.phase1': 'Phase 1: Approvisionnement & Provisioning',
                'guides.phase2': 'Phase 2: Fondation Serveur & Sécurité',
                'guides.phase3': 'Phase 3: Installation Logiciel de Nœud',
                'guides.phase4': 'Phase 4: Synchronisation Blockchain',
                
                // Footer
                'footer.copyright': '© 2025 La Voie vers la Crypto'
            }
        };
    }
    
    /**
     * Switch to a different language
     */
    switchLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }
        
        this.currentLanguage = lang;
        this.saveLanguagePreference(lang);
        this.updateLanguageIndicators();
        this.loadTranslations();
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
    }
    
    /**
     * Save language preference to localStorage
     */
    saveLanguagePreference(lang) {
        localStorage.setItem('preferred-language', lang);
    }
    
    /**
     * Update language indicator flags
     */
    updateLanguageIndicators() {
        document.querySelectorAll('.lang-flag').forEach(flag => {
            flag.classList.remove('active');
            if (flag.dataset.lang === this.currentLanguage) {
                flag.classList.add('active');
            }
        });
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }
    
    /**
     * Apply translations to the page
     */
    applyTranslations() {
        const translations = this.translations[this.currentLanguage] || this.translations[this.fallbackLanguage];
        
        if (!translations) {
            console.warn('No translations available for language:', this.currentLanguage);
            return;
        }
        
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.getTranslation(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Translate elements with data-i18n-html attribute (allows HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.dataset.i18nHtml;
            const translation = this.getTranslation(key);
            
            if (translation) {
                element.innerHTML = translation;
            }
        });
        
        // Translate title and meta tags
        const titleKey = document.querySelector('meta[name="i18n-title"]')?.content;
        if (titleKey) {
            const titleTranslation = this.getTranslation(titleKey);
            if (titleTranslation) {
                document.title = titleTranslation;
            }
        }
    }
    
    /**
     * Get translation for a key with fallback support
     */
    getTranslation(key) {
        const currentTranslations = this.translations[this.currentLanguage];
        const fallbackTranslations = this.translations[this.fallbackLanguage];
        
        // Try current language first
        if (currentTranslations && currentTranslations[key]) {
            return currentTranslations[key];
        }
        
        // Fallback to default language
        if (fallbackTranslations && fallbackTranslations[key]) {
            return fallbackTranslations[key];
        }
        
        // Return key if no translation found
        console.warn(`Translation not found for key: ${key}`);
        return key;
    }
    
    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }
    
    /**
     * Check if a language is supported
     */
    isLanguageSupported(lang) {
        return this.supportedLanguages.includes(lang);
    }
    
    /**
     * Add translation dynamically
     */
    addTranslation(lang, key, value) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        this.translations[lang][key] = value;
    }
    
    /**
     * Get language display name
     */
    getLanguageDisplayName(lang) {
        const displayNames = {
            'en': 'English',
            'nl': 'Nederlands',
            'fr': 'Français'
        };
        return displayNames[lang] || lang;
    }
    
    /**
     * Get language flag emoji
     */
    getLanguageFlag(lang) {
        const flags = {
            'en': '🇬🇧',
            'nl': '🇳🇱',
            'fr': '🇫🇷'
        };
        return flags[lang] || '🌐';
    }
}

// Initialize language switcher when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageSwitcher = new LanguageSwitcher();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSwitcher;
}
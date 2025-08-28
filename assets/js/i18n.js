/**
 * Internationalization (i18n) Module
 * Handles translation management and configuration for different languages
 */

class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'nl', 'fr'];
        this.translations = {};
        this.fallbackLanguage = 'en';
        
        this.init();
    }
    
    init() {
        this.loadTranslations();
    }
    
    /**
     * Load translations for all supported languages
     */
    loadTranslations() {
        this.translations = {
            en: {
                // Site branding
                'site-title': 'The Road to Crypto',
                'site-subtitle': 'Interactive Implementation Blueprint',
                
                // Navigation
                'nav-home': 'Home',
                'nav-development': 'Development Roadmap',
                'nav-node-guides': 'Node Guides',
                
                // Common buttons and actions
                'btn-start': 'Start',
                'btn-continue': 'Continue',
                'btn-next': 'Next',
                'btn-previous': 'Previous',
                'btn-learn-more': 'Learn More',
                'btn-get-started': 'Get Started',
                
                // Development Roadmap
                'dev-hero-badge': 'Development Track',
                'dev-hero-title': 'Development Roadmap',
                'dev-hero-subtitle': 'Learn to integrate Bitcoin and Monero wallets with secure escrow systems',
                'dev-hero-description': 'A comprehensive 3-phase approach to crypto development, covering everything from database design to frontend implementation.',
                
                // Node Guides
                'node-hero-badge': 'Node Setup Track',
                'node-hero-title': 'Node Setup Guides',
                'node-hero-subtitle': 'Set up your own Bitcoin and Monero nodes for maximum privacy and decentralization',
                'node-hero-description': 'Follow step-by-step guides covering everything from server procurement to blockchain synchronization.',
                
                // Phase titles
                'phase-1-title': 'Phase 1: Procurement & Provisioning',
                'phase-2-title': 'Phase 2: Server Security & Hardening',
                'phase-3-title': 'Phase 3: Node Software Installation & Configuration',
                'phase-4-title': 'Phase 4: Blockchain Synchronization & Monitoring',
                
                // Features
                'feature-privacy-title': 'Enhanced Privacy',
                'feature-privacy-desc': 'Don\'t rely on third-party services that can track your transactions and balances',
                'feature-network-title': 'Network Contribution',
                'feature-network-desc': 'Help strengthen the network by validating transactions and maintaining decentralization',
                'feature-control-title': 'Full Control',
                'feature-control-desc': 'Complete sovereignty over your node configuration and transaction validation',
                
                // Footer
                'footer-text': '© 2025 The Road to Crypto - Interactive Implementation Blueprint'
            },
            
            nl: {
                // Site branding
                'site-title': 'De Weg naar Crypto',
                'site-subtitle': 'Interactieve Implementatie Blauwdruk',
                
                // Navigation
                'nav-home': 'Home',
                'nav-development': 'Ontwikkelingsroadmap',
                'nav-node-guides': 'Node Gidsen',
                
                // Common buttons and actions
                'btn-start': 'Start',
                'btn-continue': 'Doorgaan',
                'btn-next': 'Volgende',
                'btn-previous': 'Vorige',
                'btn-learn-more': 'Meer Leren',
                'btn-get-started': 'Aan de Slag',
                
                // Development Roadmap
                'dev-hero-badge': 'Ontwikkelingstraject',
                'dev-hero-title': 'Ontwikkelingsroadmap',
                'dev-hero-subtitle': 'Leer Bitcoin en Monero wallets integreren met veilige escrow systemen',
                'dev-hero-description': 'Een uitgebreide 3-fase aanpak voor crypto ontwikkeling, van database ontwerp tot frontend implementatie.',
                
                // Node Guides
                'node-hero-badge': 'Node Setup Traject',
                'node-hero-title': 'Node Setup Gidsen',
                'node-hero-subtitle': 'Stel je eigen Bitcoin en Monero nodes in voor maximale privacy en decentralisatie',
                'node-hero-description': 'Volg stap-voor-stap gidsen die alles behandelen van server aanschaf tot blockchain synchronisatie.',
                
                // Phase titles
                'phase-1-title': 'Fase 1: Aanschaf & Provisioning',
                'phase-2-title': 'Fase 2: Server Beveiliging & Hardening',
                'phase-3-title': 'Fase 3: Node Software Installatie & Configuratie',
                'phase-4-title': 'Fase 4: Blockchain Synchronisatie & Monitoring',
                
                // Features
                'feature-privacy-title': 'Verbeterde Privacy',
                'feature-privacy-desc': 'Vertrouw niet op externe diensten die je transacties en saldi kunnen volgen',
                'feature-network-title': 'Netwerk Bijdrage',
                'feature-network-desc': 'Help het netwerk versterken door transacties te valideren en decentralisatie te behouden',
                'feature-control-title': 'Volledige Controle',
                'feature-control-desc': 'Complete soevereiniteit over je node configuratie en transactie validatie',
                
                // Footer
                'footer-text': '© 2025 De Weg naar Crypto - Interactieve Implementatie Blauwdruk'
            },
            
            fr: {
                // Site branding
                'site-title': 'La Route vers la Crypto',
                'site-subtitle': 'Plan d\'Implémentation Interactif',
                
                // Navigation
                'nav-home': 'Accueil',
                'nav-development': 'Feuille de Route Développement',
                'nav-node-guides': 'Guides de Nœuds',
                
                // Common buttons and actions
                'btn-start': 'Commencer',
                'btn-continue': 'Continuer',
                'btn-next': 'Suivant',
                'btn-previous': 'Précédent',
                'btn-learn-more': 'En Savoir Plus',
                'btn-get-started': 'Commencer',
                
                // Development Roadmap
                'dev-hero-badge': 'Parcours Développement',
                'dev-hero-title': 'Feuille de Route Développement',
                'dev-hero-subtitle': 'Apprenez à intégrer les portefeuilles Bitcoin et Monero avec des systèmes d\'entiercement sécurisés',
                'dev-hero-description': 'Une approche complète en 3 phases pour le développement crypto, de la conception de base de données à l\'implémentation frontend.',
                
                // Node Guides
                'node-hero-badge': 'Parcours Configuration Nœud',
                'node-hero-title': 'Guides de Configuration de Nœuds',
                'node-hero-subtitle': 'Configurez vos propres nœuds Bitcoin et Monero pour une confidentialité et décentralisation maximales',
                'node-hero-description': 'Suivez des guides étape par étape couvrant tout de l\'approvisionnement de serveur à la synchronisation blockchain.',
                
                // Phase titles
                'phase-1-title': 'Phase 1: Approvisionnement & Provisioning',
                'phase-2-title': 'Phase 2: Sécurité Serveur & Durcissement',
                'phase-3-title': 'Phase 3: Installation & Configuration Logiciel Nœud',
                'phase-4-title': 'Phase 4: Synchronisation Blockchain & Surveillance',
                
                // Features
                'feature-privacy-title': 'Confidentialité Renforcée',
                'feature-privacy-desc': 'Ne dépendez pas de services tiers qui peuvent suivre vos transactions et soldes',
                'feature-network-title': 'Contribution Réseau',
                'feature-network-desc': 'Aidez à renforcer le réseau en validant les transactions et en maintenant la décentralisation',
                'feature-control-title': 'Contrôle Total',
                'feature-control-desc': 'Souveraineté complète sur votre configuration de nœud et validation de transaction',
                
                // Footer
                'footer-text': '© 2025 La Route vers la Crypto - Plan d\'Implémentation Interactif'
            }
        };
    }
    
    /**
     * Get translation for a key in the current language
     */
    translate(key, language = this.currentLanguage) {
        const translations = this.translations[language] || this.translations[this.fallbackLanguage];
        return translations && translations[key] ? translations[key] : key;
    }
    
    /**
     * Set current language
     */
    setLanguage(language) {
        if (this.supportedLanguages.includes(language)) {
            this.currentLanguage = language;
        }
    }
    
    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
    
    /**
     * Check if language is supported
     */
    isLanguageSupported(language) {
        return this.supportedLanguages.includes(language);
    }
}

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.i18n = new I18n();
    });
} else {
    window.i18n = new I18n();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
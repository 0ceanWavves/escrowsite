/**
 * Homepage Interactive Features
 * Handles interactive navigation cards and featured content
 */

class HomepageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.init();
    }

    init() {
        this.setupInteractiveCards();
        this.setupLanguageSupport();
        this.setupFeaturedContent();
        this.loadContent();
    }

    setupInteractiveCards() {
        const cards = document.querySelectorAll('.interactive-card');
        
        cards.forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', (e) => {
                this.animateCard(e.target, 'enter');
            });
            
            card.addEventListener('mouseleave', (e) => {
                this.animateCard(e.target, 'leave');
            });
            
            // Add click handling for card navigation
            card.addEventListener('click', (e) => {
                if (!e.target.closest('a')) {
                    const link = card.querySelector('.nav-card-button');
                    if (link) {
                        window.location.href = link.href;
                    }
                }
            });
        });
    }

    animateCard(card, action) {
        const icon = card.querySelector('.nav-card-icon');
        const button = card.querySelector('.nav-card-button');
        
        if (action === 'enter') {
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
            if (button) {
                button.style.transform = 'translateX(4px)';
            }
        } else {
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
            if (button) {
                button.style.transform = 'translateX(0)';
            }
        }
    }

    setupLanguageSupport() {
        // Language data for homepage content
        this.languageData = {
            en: {
                heroTitle: 'Welcome to The Road to Crypto',
                heroSubtitle: 'Your comprehensive guide to crypto development and node setup',
                heroDescription: 'Choose your path: Learn crypto development fundamentals or set up your own BTC & XMR nodes with our detailed guides.',
                
                devCardTitle: 'Development Roadmap',
                devCardDescription: 'Learn to integrate Bitcoin and Monero wallets with secure escrow systems. A comprehensive 3-phase approach to crypto development.',
                devFeature1: 'Database schema design',
                devFeature2: 'Payment gateway integration',
                devFeature3: 'Frontend wallet interfaces',
                devCardButton: 'Start Learning',
                
                nodeCardTitle: 'Node Setup Guides',
                nodeCardDescription: 'Set up your own Bitcoin and Monero nodes for maximum privacy and decentralization. Step-by-step guides from procurement to operation.',
                nodeFeature1: 'VPS procurement & setup',
                nodeFeature2: 'Security hardening',
                nodeFeature3: 'Node synchronization',
                nodeCardButton: 'Setup Nodes',
                
                gettingStartedTitle: 'Getting Started',
                gettingStartedDescription: 'New to crypto development or node setup? Here are some recommended starting points based on your experience level.',
                
                beginnerTitle: 'Beginner',
                beginnerDescription: 'Start with the Development Roadmap to understand crypto fundamentals and implementation concepts.',
                beginnerLink: 'Start Here',
                
                intermediateTitle: 'Intermediate',
                intermediateDescription: 'Ready to get hands-on? Jump into the Node Guides to set up your own infrastructure.',
                intermediateLink: 'Setup Nodes',
                
                advancedTitle: 'Advanced',
                advancedDescription: 'Experienced developer? Dive deep into both tracks for comprehensive crypto integration knowledge.',
                advancedLink: 'Deep Dive',
                
                footerText: '© 2025 The Road to Crypto - Interactive Implementation Blueprint'
            },
            
            nl: {
                heroTitle: 'Welkom bij De Weg naar Crypto',
                heroSubtitle: 'Jouw uitgebreide gids voor crypto-ontwikkeling en node-setup',
                heroDescription: 'Kies je pad: Leer crypto-ontwikkelingsfundamenten of stel je eigen BTC & XMR nodes in met onze gedetailleerde gidsen.',
                
                devCardTitle: 'Ontwikkelingsroadmap',
                devCardDescription: 'Leer Bitcoin en Monero portemonnees integreren met veilige escrow-systemen. Een uitgebreide 3-fasen aanpak voor crypto-ontwikkeling.',
                devFeature1: 'Database schema ontwerp',
                devFeature2: 'Betaalgateway integratie',
                devFeature3: 'Frontend portemonnee interfaces',
                devCardButton: 'Begin met Leren',
                
                nodeCardTitle: 'Node Setup Gidsen',
                nodeCardDescription: 'Stel je eigen Bitcoin en Monero nodes in voor maximale privacy en decentralisatie. Stap-voor-stap gidsen van aanschaf tot gebruik.',
                nodeFeature1: 'VPS aanschaf & setup',
                nodeFeature2: 'Beveiligingsharding',
                nodeFeature3: 'Node synchronisatie',
                nodeCardButton: 'Nodes Instellen',
                
                gettingStartedTitle: 'Aan de Slag',
                gettingStartedDescription: 'Nieuw in crypto-ontwikkeling of node-setup? Hier zijn enkele aanbevolen startpunten gebaseerd op je ervaringsniveau.',
                
                beginnerTitle: 'Beginner',
                beginnerDescription: 'Begin met de Ontwikkelingsroadmap om crypto-fundamenten en implementatieconcepten te begrijpen.',
                beginnerLink: 'Start Hier',
                
                intermediateTitle: 'Gemiddeld',
                intermediateDescription: 'Klaar om hands-on te gaan? Spring in de Node Gidsen om je eigen infrastructuur op te zetten.',
                intermediateLink: 'Nodes Instellen',
                
                advancedTitle: 'Gevorderd',
                advancedDescription: 'Ervaren ontwikkelaar? Duik diep in beide tracks voor uitgebreide crypto-integratiekennis.',
                advancedLink: 'Diep Duiken',
                
                footerText: '© 2025 De Weg naar Crypto - Interactieve Implementatie Blueprint'
            },
            
            fr: {
                heroTitle: 'Bienvenue sur La Voie vers la Crypto',
                heroSubtitle: 'Votre guide complet pour le développement crypto et la configuration de nœuds',
                heroDescription: 'Choisissez votre voie : Apprenez les fondamentaux du développement crypto ou configurez vos propres nœuds BTC & XMR avec nos guides détaillés.',
                
                devCardTitle: 'Feuille de Route de Développement',
                devCardDescription: 'Apprenez à intégrer des portefeuilles Bitcoin et Monero avec des systèmes d\'entiercement sécurisés. Une approche complète en 3 phases pour le développement crypto.',
                devFeature1: 'Conception de schéma de base de données',
                devFeature2: 'Intégration de passerelle de paiement',
                devFeature3: 'Interfaces de portefeuille frontend',
                devCardButton: 'Commencer l\'Apprentissage',
                
                nodeCardTitle: 'Guides de Configuration de Nœuds',
                nodeCardDescription: 'Configurez vos propres nœuds Bitcoin et Monero pour une confidentialité et une décentralisation maximales. Guides étape par étape de l\'achat au fonctionnement.',
                nodeFeature1: 'Achat et configuration VPS',
                nodeFeature2: 'Durcissement de sécurité',
                nodeFeature3: 'Synchronisation de nœuds',
                nodeCardButton: 'Configurer les Nœuds',
                
                gettingStartedTitle: 'Commencer',
                gettingStartedDescription: 'Nouveau dans le développement crypto ou la configuration de nœuds ? Voici quelques points de départ recommandés selon votre niveau d\'expérience.',
                
                beginnerTitle: 'Débutant',
                beginnerDescription: 'Commencez par la Feuille de Route de Développement pour comprendre les fondamentaux crypto et les concepts d\'implémentation.',
                beginnerLink: 'Commencer Ici',
                
                intermediateTitle: 'Intermédiaire',
                intermediateDescription: 'Prêt à vous salir les mains ? Plongez dans les Guides de Nœuds pour configurer votre propre infrastructure.',
                intermediateLink: 'Configurer les Nœuds',
                
                advancedTitle: 'Avancé',
                advancedDescription: 'Développeur expérimenté ? Plongez profondément dans les deux pistes pour une connaissance complète de l\'intégration crypto.',
                advancedLink: 'Plongée Profonde',
                
                footerText: '© 2025 La Voie vers la Crypto - Plan d\'Implémentation Interactif'
            }
        };

        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateContent();
        });
    }

    setupFeaturedContent() {
        // Add dynamic content loading for featured sections
        this.loadFeaturedContent();
        
        // Setup intersection observer for animations
        this.setupScrollAnimations();
    }

    loadFeaturedContent() {
        // This could load dynamic content from an API or data file
        // For now, we'll use static content defined in the language data
        console.log('Featured content loaded');
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const animateElements = document.querySelectorAll('.nav-card, .getting-started-card');
        animateElements.forEach(el => observer.observe(el));
    }

    loadContent() {
        // Get current language from language switcher or default to 'en'
        const currentLang = document.documentElement.getAttribute('data-language') || 'en';
        this.currentLanguage = currentLang;
        this.updateContent();
    }

    updateContent() {
        const data = this.languageData[this.currentLanguage];
        if (!data) return;

        // Update all text content
        const elements = {
            'hero-title': data.heroTitle,
            'hero-subtitle': data.heroSubtitle,
            'hero-description': data.heroDescription,
            
            'dev-card-title': data.devCardTitle,
            'dev-card-description': data.devCardDescription,
            'dev-feature-1': data.devFeature1,
            'dev-feature-2': data.devFeature2,
            'dev-feature-3': data.devFeature3,
            'dev-card-button': data.devCardButton,
            
            'node-card-title': data.nodeCardTitle,
            'node-card-description': data.nodeCardDescription,
            'node-feature-1': data.nodeFeature1,
            'node-feature-2': data.nodeFeature2,
            'node-feature-3': data.nodeFeature3,
            'node-card-button': data.nodeCardButton,
            
            'getting-started-title': data.gettingStartedTitle,
            'getting-started-description': data.gettingStartedDescription,
            
            'beginner-title': data.beginnerTitle,
            'beginner-description': data.beginnerDescription,
            'beginner-link': data.beginnerLink,
            
            'intermediate-title': data.intermediateTitle,
            'intermediate-description': data.intermediateDescription,
            'intermediate-link': data.intermediateLink,
            
            'advanced-title': data.advancedTitle,
            'advanced-description': data.advancedDescription,
            'advanced-link': data.advancedLink,
            
            'footer-text': data.footerText
        };

        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'A' || element.classList.contains('nav-card-button')) {
                    // For links, update the text content of the span inside
                    const span = element.querySelector('span');
                    if (span) {
                        span.textContent = text;
                    } else {
                        element.textContent = text;
                    }
                } else {
                    element.textContent = text;
                }
            }
        });
    }

    // Public method to refresh content
    refresh() {
        this.loadContent();
    }
}

// Initialize homepage manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.homepageManager = new HomepageManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomepageManager;
}
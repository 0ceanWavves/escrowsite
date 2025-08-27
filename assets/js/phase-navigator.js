/**
 * Phase Navigator
 * Handles phase navigation and progress tracking for section overview pages
 */

class PhaseNavigator {
    constructor() {
        this.currentLanguage = 'en';
        this.progressData = this.loadProgress();
        this.init();
    }

    init() {
        this.setupLanguageSupport();
        this.setupProgressTracking();
        this.setupPhaseInteractions();
        this.loadContent();
        this.updatePhaseStates();
    }

    setupLanguageSupport() {
        // Language data for phase navigator
        this.languageData = {
            en: {
                // Development Roadmap
                devHeroBadge: 'Development Track',
                devHeroTitle: 'Development Roadmap',
                devHeroSubtitle: 'Learn to integrate Bitcoin and Monero wallets with secure escrow systems',
                devHeroDescription: 'A comprehensive 3-phase approach to crypto development, covering everything from database design to frontend implementation. Perfect for developers looking to build secure, privacy-focused cryptocurrency payment systems.',
                
                devNavigatorTitle: 'Development Phases',
                devNavigatorDescription: 'Follow our structured approach to building a complete crypto payment system',
                
                devPhase1Title: 'Phase 1: Foundational Infrastructure',
                devPhase1Difficulty: 'Advanced',
                devPhase1Duration: '2-3 weeks',
                devPhase1Description: 'Build the secure backend foundation with database schemas, payment gateways, and self-hosted nodes. This critical phase establishes the bedrock for all subsequent features.',
                devPhase1TopicsTitle: 'Key Topics:',
                devPhase1Topic1: 'Database schema design',
                devPhase1Topic2: 'BTCPay Server integration',
                devPhase1Topic3: 'Self-hosted node setup',
                devPhase1Topic4: 'Security architecture',
                devPhase1Progress: 'Not Started',
                devPhase1Button: 'Start Phase 1',
                
                devPhase2Title: 'Phase 2: Core Backend Services & APIs',
                devPhase2Difficulty: 'Intermediate',
                devPhase2Duration: '2-3 weeks',
                devPhase2Description: 'Build application logic and APIs that power wallet and escrow functionalities. Connect infrastructure to user-facing features with robust backend services.',
                devPhase2TopicsTitle: 'Key Topics:',
                devPhase2Topic1: 'RESTful API design',
                devPhase2Topic2: 'Multi-signature escrow logic',
                devPhase2Topic3: 'Security & auditing systems',
                devPhase2Topic4: 'Wallet management services',
                devPhase2Progress: 'Locked',
                devPhase2Button: 'Complete Phase 1 First',
                
                devPhase3Title: 'Phase 3: Frontend Interface & User Experience',
                devPhase3Difficulty: 'Intermediate',
                devPhase3Duration: '1-2 weeks',
                devPhase3Description: 'Create seamless user experiences for crypto payments. Build intuitive interfaces that translate powerful backend capabilities into user-friendly interactions.',
                devPhase3TopicsTitle: 'Key Topics:',
                devPhase3Topic1: 'Wallet dashboard design',
                devPhase3Topic2: 'Integrated checkout flow',
                devPhase3Topic3: 'Escrow management interface',
                devPhase3Topic4: 'Transaction monitoring',
                devPhase3Progress: 'Locked',
                devPhase3Button: 'Complete Phase 2 First',
                
                devPathTitle: 'Your Learning Journey',
                devPathDescription: 'This roadmap is designed for progressive learning. Each phase builds upon the previous one, ensuring you develop a comprehensive understanding of crypto payment systems.',
                
                devFeature1Title: 'Structured Learning',
                devFeature1Desc: 'Follow a carefully designed curriculum that builds knowledge systematically',
                devFeature2Title: 'Hands-on Implementation',
                devFeature2Desc: 'Learn by building real systems with practical, production-ready code',
                devFeature3Title: 'Security-First Approach',
                devFeature3Desc: 'Emphasizes security best practices and privacy-focused development',
                
                devActionsTitle: 'Ready to Start?',
                devAction1Title: 'Begin Phase 1',
                devAction1Desc: 'Start with foundational infrastructure',
                devAction2Title: 'Need Help?',
                devAction2Desc: 'Check our getting started guide',
                devAction3Title: 'Setup Nodes',
                devAction3Desc: 'Learn node setup alongside development',
                
                // Node Guides
                nodeHeroBadge: 'Node Setup Track',
                nodeHeroTitle: 'Node Setup Guides',
                nodeHeroSubtitle: 'Set up your own Bitcoin and Monero nodes for maximum privacy and decentralization',
                nodeHeroDescription: 'Complete step-by-step guides covering everything from VPS procurement to full node operation. Learn to run your own infrastructure for true financial sovereignty and privacy protection.',
                
                nodeNavigatorTitle: 'Setup Phases',
                nodeNavigatorDescription: 'Follow our comprehensive 4-phase approach to node deployment and operation',
                
                nodePhase1Title: 'Phase 1: Procurement & Provisioning',
                nodePhase1Difficulty: 'Beginner',
                nodePhase1Duration: '2-4 hours',
                nodePhase1Description: 'Choose and set up your server infrastructure. Learn about VPS providers, hardware requirements, and cost considerations for running crypto nodes.',
                nodePhase1TopicsTitle: 'Key Topics:',
                nodePhase1Topic1: 'VPS provider comparison',
                nodePhase1Topic2: 'Hardware requirements analysis',
                nodePhase1Topic3: 'Cost estimation tools',
                nodePhase1Topic4: 'Initial server setup',
                nodePhase1Progress: 'Not Started',
                nodePhase1Button: 'Start Phase 1',
                
                nodePhase2Title: 'Phase 2: Server Foundation & Security',
                nodePhase2Difficulty: 'Intermediate',
                nodePhase2Duration: '4-6 hours',
                nodePhase2Description: 'Secure your server with proper configurations, firewall rules, and system hardening. Essential security practices for protecting your node infrastructure.',
                nodePhase2TopicsTitle: 'Key Topics:',
                nodePhase2Topic1: 'SSH security configuration',
                nodePhase2Topic2: 'Firewall setup and rules',
                nodePhase2Topic3: 'System hardening checklist',
                nodePhase2Topic4: 'Monitoring and logging',
                nodePhase2Progress: 'Locked',
                nodePhase2Button: 'Complete Phase 1 First',
                
                nodePhase3Title: 'Phase 3: Node Software Installation & Configuration',
                nodePhase3Difficulty: 'Intermediate',
                nodePhase3Duration: '3-5 hours',
                nodePhase3Description: 'Install and configure Bitcoin Core and Monero daemon software. Learn about configuration options, security settings, and optimization techniques.',
                nodePhase3TopicsTitle: 'Key Topics:',
                nodePhase3Topic1: 'Software download & verification',
                nodePhase3Topic2: 'Configuration file setup',
                nodePhase3Topic3: 'Service management',
                nodePhase3Topic4: 'Initial testing & validation',
                nodePhase3Progress: 'Locked',
                nodePhase3Button: 'Complete Phase 2 First',
                
                nodePhase4Title: 'Phase 4: Blockchain Synchronization & Operation',
                nodePhase4Difficulty: 'Advanced',
                nodePhase4Duration: '24-48 hours',
                nodePhase4Description: 'Complete the synchronization process and establish ongoing operations. Learn monitoring, maintenance, and troubleshooting for long-term node health.',
                nodePhase4TopicsTitle: 'Key Topics:',
                nodePhase4Topic1: 'Blockchain synchronization',
                nodePhase4Topic2: 'Performance monitoring',
                nodePhase4Topic3: 'Maintenance procedures',
                nodePhase4Topic4: 'Troubleshooting guide',
                nodePhase4Progress: 'Locked',
                nodePhase4Button: 'Complete Phase 3 First',
                
                nodeTypesTitle: 'Supported Node Types',
                nodeTypesDescription: 'Our guides cover setup for both Bitcoin and Monero nodes, with specific instructions for each cryptocurrency\'s unique requirements.',
                
                btcTitle: 'Bitcoin Core Node',
                btcDescription: 'Run a full Bitcoin node to validate transactions and contribute to network security. Requires ~500GB storage and grows over time.',
                btcStorageLabel: 'Storage:',
                btcStorage: '500GB+ SSD',
                btcRamLabel: 'RAM:',
                btcRam: '2GB minimum',
                btcSyncLabel: 'Sync Time:',
                btcSync: '24-48 hours',
                
                xmrTitle: 'Monero Node',
                xmrDescription: 'Operate a Monero node for enhanced privacy and network participation. Smaller blockchain size but requires careful privacy configuration.',
                xmrStorageLabel: 'Storage:',
                xmrStorage: '200GB+ SSD',
                xmrRamLabel: 'RAM:',
                xmrRam: '4GB recommended',
                xmrSyncLabel: 'Sync Time:',
                xmrSync: '12-24 hours',
                
                nodePathTitle: 'Why Run Your Own Node?',
                nodePathDescription: 'Running your own cryptocurrency node provides numerous benefits for privacy, security, and network participation. Here\'s what you\'ll gain.',
                
                nodeFeature1Title: 'Enhanced Privacy',
                nodeFeature1Desc: 'Don\'t rely on third-party services that can track your transactions and balances',
                nodeFeature2Title: 'Network Contribution',
                nodeFeature2Desc: 'Help strengthen the network by validating transactions and maintaining decentralization',
                nodeFeature3Title: 'Full Control',
                nodeFeature3Desc: 'Complete sovereignty over your node configuration and transaction validation',
                
                nodeActionsTitle: 'Ready to Setup Your Node?',
                nodeAction1Title: 'Start Phase 1',
                nodeAction1Desc: 'Begin with server procurement',
                nodeAction2Title: 'Need Help?',
                nodeAction2Desc: 'Check our getting started guide',
                nodeAction3Title: 'Learn Development',
                nodeAction3Desc: 'Explore crypto development alongside nodes',
                
                footerText: '© 2025 The Road to Crypto - Interactive Implementation Blueprint'
            },
            
            // Add Dutch and French translations here...
            nl: {
                // Dutch translations would go here
                footerText: '© 2025 De Weg naar Crypto - Interactieve Implementatie Blueprint'
            },
            
            fr: {
                // French translations would go here
                footerText: '© 2025 La Voie vers la Crypto - Plan d\'Implémentation Interactif'
            }
        };

        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateContent();
        });
    }

    setupProgressTracking() {
        // Initialize progress tracking
        this.phases = document.querySelectorAll('.phase-card');
        this.updateProgressDisplay();
    }

    setupPhaseInteractions() {
        // Add click handlers for phase cards
        this.phases.forEach(card => {
            const button = card.querySelector('.phase-button:not(.disabled)');
            if (button) {
                button.addEventListener('click', (e) => {
                    const phase = card.getAttribute('data-phase');
                    this.trackPhaseStart(phase);
                });
            }
        });
    }

    loadProgress() {
        // Load progress from localStorage
        const saved = localStorage.getItem('crypto-roadmap-progress');
        return saved ? JSON.parse(saved) : {
            development: { phases: {} },
            nodeGuides: { phases: {} }
        };
    }

    saveProgress() {
        localStorage.setItem('crypto-roadmap-progress', JSON.stringify(this.progressData));
    }

    trackPhaseStart(phase) {
        const section = this.getCurrentSection();
        if (!this.progressData[section]) {
            this.progressData[section] = { phases: {} };
        }
        
        if (!this.progressData[section].phases[phase]) {
            this.progressData[section].phases[phase] = {
                started: new Date().toISOString(),
                progress: 0
            };
        }
        
        this.saveProgress();
        this.updateProgressDisplay();
    }

    getCurrentSection() {
        const section = document.documentElement.getAttribute('data-current-section');
        return section === 'development-roadmap' ? 'development' : 'nodeGuides';
    }

    updatePhaseStates() {
        const section = this.getCurrentSection();
        const sectionProgress = this.progressData[section];
        
        this.phases.forEach(card => {
            const phase = parseInt(card.getAttribute('data-phase'));
            const button = card.querySelector('.phase-button');
            const progressText = card.querySelector('.progress-text');
            const progressFill = card.querySelector('.progress-fill');
            
            // Check if previous phases are completed
            const canAccess = this.canAccessPhase(section, phase);
            
            if (!canAccess && phase > 1) {
                button.disabled = true;
                button.classList.add('disabled');
                button.classList.remove('primary');
                progressText.textContent = 'Locked';
                progressFill.style.width = '0%';
            } else {
                button.disabled = false;
                button.classList.remove('disabled');
                button.classList.add('primary');
                
                const phaseProgress = sectionProgress?.phases?.[phase];
                if (phaseProgress) {
                    progressText.textContent = `${phaseProgress.progress}% Complete`;
                    progressFill.style.width = `${phaseProgress.progress}%`;
                } else {
                    progressText.textContent = 'Not Started';
                    progressFill.style.width = '0%';
                }
            }
        });
    }

    canAccessPhase(section, phase) {
        if (phase === 1) return true;
        
        const sectionProgress = this.progressData[section];
        if (!sectionProgress) return false;
        
        // Check if previous phase is completed (100% progress)
        const previousPhase = sectionProgress.phases?.[phase - 1];
        return previousPhase && previousPhase.progress >= 100;
    }

    updateProgressDisplay() {
        this.updatePhaseStates();
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

        const section = this.getCurrentSection();
        const prefix = section === 'development' ? 'dev' : 'node';
        
        // Update content based on section
        this.updateSectionContent(data, prefix);
    }

    updateSectionContent(data, prefix) {
        // Common elements
        const elements = {
            'footer-text': data.footerText
        };

        // Section-specific elements
        if (prefix === 'dev') {
            Object.assign(elements, {
                'hero-badge': data.devHeroBadge,
                'hero-title': data.devHeroTitle,
                'hero-subtitle': data.devHeroSubtitle,
                'hero-description': data.devHeroDescription,
                'navigator-title': data.devNavigatorTitle,
                'navigator-description': data.devNavigatorDescription,
                'path-title': data.devPathTitle,
                'path-description': data.devPathDescription,
                'actions-title': data.devActionsTitle
            });
        } else {
            Object.assign(elements, {
                'hero-badge': data.nodeHeroBadge,
                'hero-title': data.nodeHeroTitle,
                'hero-subtitle': data.nodeHeroSubtitle,
                'hero-description': data.nodeHeroDescription,
                'navigator-title': data.nodeNavigatorTitle,
                'navigator-description': data.nodeNavigatorDescription,
                'types-title': data.nodeTypesTitle,
                'types-description': data.nodeTypesDescription,
                'path-title': data.nodePathTitle,
                'path-description': data.nodePathDescription,
                'actions-title': data.nodeActionsTitle
            });
        }

        // Update all elements
        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        });
    }

    // Public method to update phase progress
    updatePhaseProgress(phase, progress) {
        const section = this.getCurrentSection();
        if (!this.progressData[section]) {
            this.progressData[section] = { phases: {} };
        }
        
        if (!this.progressData[section].phases[phase]) {
            this.progressData[section].phases[phase] = {
                started: new Date().toISOString(),
                progress: 0
            };
        }
        
        this.progressData[section].phases[phase].progress = progress;
        if (progress >= 100) {
            this.progressData[section].phases[phase].completed = new Date().toISOString();
        }
        
        this.saveProgress();
        this.updateProgressDisplay();
    }

    // Public method to refresh content
    refresh() {
        this.loadContent();
        this.updateProgressDisplay();
    }
}

// Initialize phase navigator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.phaseNavigator = new PhaseNavigator();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhaseNavigator;
}
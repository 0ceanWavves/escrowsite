/**
 * Language Switcher - Multi-language support
 * Handles language switching and multilingual content
 */

class LanguageSwitcher {
  constructor() {
    this.currentLanguage = "en";
    this.supportedLanguages = ["en", "nl", "fr"];
    this.translations = {};
    this.fallbackLanguage = "en";

    this.init();
  }

  init() {
    this.detectLanguage();
    this.setupEventListeners();
    this.loadTranslations();
    this.updateLanguageIndicators();
  }

  /**
   * Detect current language from URL, storage, or browser
   */
  detectLanguage() {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang");

    if (urlLang && this.supportedLanguages.includes(urlLang)) {
      this.currentLanguage = urlLang;
      this.saveLanguagePreference(urlLang);
      return;
    }

    // Check local storage
    const savedLang = localStorage.getItem("preferred-language");
    if (savedLang && this.supportedLanguages.includes(savedLang)) {
      this.currentLanguage = savedLang;
      return;
    }

    // Check browser language
    const browserLang = navigator.language.split("-")[0];
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
    document.addEventListener("click", (e) => {
      if (e.target.matches(".lang-flag")) {
        const lang = e.target.dataset.lang;
        if (lang && this.supportedLanguages.includes(lang)) {
          this.switchLanguage(lang);
        }
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.key >= "1" && e.key <= "3") {
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
      const response = await fetch(
        `/assets/data/translations/${this.currentLanguage}.json`
      );
      if (response.ok) {
        this.translations[this.currentLanguage] = await response.json();
      } else {
        // Fallback to embedded translations
        this.loadEmbeddedTranslations();
      }
    } catch (error) {
      console.warn("Could not load translations:", error);
      this.loadEmbeddedTranslations();
    }
  }

  /**
   * Load embedded translations as fallback
   */
  loadEmbeddedTranslations() {
    this.translations = {
      en: {
        // Navigation
        "nav-home": "Home",
        "nav-development": "Development Roadmap",
        "nav-node-guides": "Node Guides",

        // Common elements
        "site-title": "The Road to Crypto",
        "site-subtitle": "Interactive Implementation Blueprint",

        // Development Roadmap
        "hero-badge": "Development Track",
        "hero-title": "Development Roadmap",
        "hero-subtitle":
          "Learn to integrate Bitcoin and Monero wallets with secure escrow systems",
        "hero-description":
          "A comprehensive 3-phase approach to crypto development, covering everything from database design to frontend implementation. Perfect for developers looking to build secure, privacy-focused cryptocurrency payment systems.",

        // Node Guides
        "node-hero-badge": "Node Setup Track",
        "node-hero-title": "Node Setup Guides",
        "node-hero-subtitle":
          "Set up your own Bitcoin and Monero nodes for maximum privacy and decentralization",
        "node-hero-description":
          "Follow step-by-step guides covering everything from server procurement to blockchain synchronization. Perfect for those seeking sovereignty and privacy through self-hosted infrastructure.",

        // Footer
        "footer-text":
          "© 2025 The Road to Crypto - Interactive Implementation Blueprint",
      },
      nl: {
        // Navigation
        "nav-home": "Home",
        "nav-development": "Ontwikkelingsroadmap",
        "nav-node-guides": "Node Gidsen",

        // Common elements
        "site-title": "De Weg naar Crypto",
        "site-subtitle": "Interactieve Implementatie Blauwdruk",

        // Development Roadmap
        "hero-badge": "Ontwikkelingstraject",
        "hero-title": "Ontwikkelingsroadmap",
        "hero-subtitle":
          "Leer Bitcoin en Monero wallets integreren met veilige escrow systemen",
        "hero-description":
          "Een uitgebreide 3-fase aanpak voor crypto ontwikkeling, van database ontwerp tot frontend implementatie. Perfect voor ontwikkelaars die veilige, privacy-gerichte cryptocurrency betalingssystemen willen bouwen.",

        // Node Guides
        "node-hero-badge": "Node Setup Traject",
        "node-hero-title": "Node Setup Gidsen",
        "node-hero-subtitle":
          "Stel je eigen Bitcoin en Monero nodes in voor maximale privacy en decentralisatie",
        "node-hero-description":
          "Volg stap-voor-stap gidsen die alles behandelen van server aanschaf tot blockchain synchronisatie. Perfect voor degenen die soevereiniteit en privacy zoeken door zelf-gehoste infrastructuur.",

        // Footer
        "footer-text":
          "© 2025 De Weg naar Crypto - Interactieve Implementatie Blauwdruk",
      },
      fr: {
        // Navigation
        "nav-home": "Accueil",
        "nav-development": "Feuille de Route Développement",
        "nav-node-guides": "Guides de Nœuds",

        // Common elements
        "site-title": "La Route vers la Crypto",
        "site-subtitle": "Plan d'Implémentation Interactif",

        // Development Roadmap
        "hero-badge": "Parcours Développement",
        "hero-title": "Feuille de Route Développement",
        "hero-subtitle":
          "Apprenez à intégrer les portefeuilles Bitcoin et Monero avec des systèmes d'entiercement sécurisés",
        "hero-description":
          "Une approche complète en 3 phases pour le développement crypto, couvrant tout de la conception de base de données à l'implémentation frontend. Parfait pour les développeurs cherchant à construire des systèmes de paiement cryptocurrency sécurisés et axés sur la confidentialité.",

        // Node Guides
        "node-hero-badge": "Parcours Configuration Nœud",
        "node-hero-title": "Guides de Configuration de Nœuds",
        "node-hero-subtitle":
          "Configurez vos propres nœuds Bitcoin et Monero pour une confidentialité et décentralisation maximales",
        "node-hero-description":
          "Suivez des guides étape par étape couvrant tout de l'approvisionnement de serveur à la synchronisation blockchain. Parfait pour ceux qui recherchent la souveraineté et la confidentialité grâce à une infrastructure auto-hébergée.",

        // Footer
        "footer-text":
          "© 2025 La Route vers la Crypto - Plan d'Implémentation Interactif",
      },
    };
  }

  /**
   * Switch to a different language
   */
  switchLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      console.warn(`Language ${lang} is not supported`);
      return;
    }

    this.currentLanguage = lang;
    this.saveLanguagePreference(lang);
    this.updateLanguageIndicators();
    this.translatePage();

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url);

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { language: lang },
      })
    );
  }

  /**
   * Save language preference to localStorage
   */
  saveLanguagePreference(lang) {
    localStorage.setItem("preferred-language", lang);
  }

  /**
   * Update language indicator buttons
   */
  updateLanguageIndicators() {
    // Update flag buttons
    document.querySelectorAll(".lang-flag").forEach((flag) => {
      flag.classList.remove("active");
      if (flag.dataset.lang === this.currentLanguage) {
        flag.classList.add("active");
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;
  }

  /**
   * Translate page content
   */
  translatePage() {
    const translations =
      this.translations[this.currentLanguage] ||
      this.translations[this.fallbackLanguage];

    if (!translations) {
      console.warn("No translations available for", this.currentLanguage);
      return;
    }

    // Translate elements with IDs
    Object.keys(translations).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        element.textContent = translations[key];
      }
    });

    // Translate elements with data-translate attributes
    document.querySelectorAll("[data-translate]").forEach((element) => {
      const key = element.dataset.translate;
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });
  }

  /**
   * Get translation for a key
   */
  translate(key, fallback = key) {
    const translations =
      this.translations[this.currentLanguage] ||
      this.translations[this.fallbackLanguage];
    return translations && translations[key] ? translations[key] : fallback;
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(lang) {
    return this.supportedLanguages.includes(lang);
  }
}

// Initialize language switcher when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.languageSwitcher = new LanguageSwitcher();
  });
} else {
  window.languageSwitcher = new LanguageSwitcher();
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = LanguageSwitcher;
}

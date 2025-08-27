/**
 * Utility Functions - Shared utility functions across the application
 */

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function to limit function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Generate unique ID
 */
function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
function formatDate(date, locale = 'en-US', options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    return new Intl.DateTimeFormat(locale, formatOptions).format(new Date(date));
}

/**
 * Format time for display
 */
function formatTime(date, locale = 'en-US', options = {}) {
    const defaultOptions = {
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    return new Intl.DateTimeFormat(locale, formatOptions).format(new Date(date));
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert string to slug format
 */
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter of string
 */
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(text) {
    return text.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamel(text) {
    return text.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Check if element is in viewport
 */
function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
        rect.top >= -threshold &&
        rect.left >= -threshold &&
        rect.bottom <= windowHeight + threshold &&
        rect.right <= windowWidth + threshold
    );
}

/**
 * Smooth scroll to element
 */
function scrollToElement(element, offset = 0, behavior = 'smooth') {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (!element) return;
    
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetTop = elementTop - offset;
    
    window.scrollTo({
        top: offsetTop,
        behavior: behavior
    });
}

/**
 * Get scroll position
 */
function getScrollPosition() {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    };
}

/**
 * Set CSS custom property
 */
function setCSSProperty(property, value, element = document.documentElement) {
    element.style.setProperty(property, value);
}

/**
 * Get CSS custom property
 */
function getCSSProperty(property, element = document.documentElement) {
    return getComputedStyle(element).getPropertyValue(property).trim();
}

/**
 * Check if device is mobile
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is touch enabled
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get device type
 */
function getDeviceType() {
    const width = window.innerWidth;
    
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

/**
 * Local storage helpers with error handling
 */
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }
};

/**
 * Cookie helpers
 */
const cookies = {
    set(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },
    
    get(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    remove(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
};

/**
 * URL helpers
 */
const url = {
    getParams() {
        return new URLSearchParams(window.location.search);
    },
    
    getParam(name, defaultValue = null) {
        const params = this.getParams();
        return params.get(name) || defaultValue;
    },
    
    setParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    },
    
    removeParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    },
    
    buildQuery(params) {
        return new URLSearchParams(params).toString();
    }
};

/**
 * Event emitter for custom events
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }
    
    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            callback.apply(this, args);
        });
    }
    
    once(event, callback) {
        const onceCallback = (...args) => {
            callback.apply(this, args);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

/**
 * Simple state management
 */
class StateManager {
    constructor(initialState = {}) {
        this.state = { ...initialState };
        this.listeners = [];
    }
    
    getState() {
        return { ...this.state };
    }
    
    setState(updates) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        this.listeners.forEach(listener => {
            listener(this.state, prevState);
        });
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
}

/**
 * Performance helpers
 */
const perf = {
    mark(name) {
        if (performance.mark) {
            performance.mark(name);
        }
    },
    
    measure(name, startMark, endMark) {
        if (performance.measure) {
            performance.measure(name, startMark, endMark);
        }
    },
    
    getEntries(type = null) {
        if (!performance.getEntries) return [];
        
        if (type) {
            return performance.getEntriesByType(type);
        }
        return performance.getEntries();
    },
    
    clearMarks(name = null) {
        if (performance.clearMarks) {
            performance.clearMarks(name);
        }
    },
    
    clearMeasures(name = null) {
        if (performance.clearMeasures) {
            performance.clearMeasures(name);
        }
    }
};

/**
 * Animation helpers
 */
const animate = {
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function fade(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        }
        
        requestAnimationFrame(fade);
    },
    
    fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function fade(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(fade);
    },
    
    slideDown(element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight;
        const start = performance.now();
        
        function slide(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.height = (targetHeight * progress) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(slide);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(slide);
    },
    
    slideUp(element, duration = 300) {
        const startHeight = element.offsetHeight;
        const start = performance.now();
        
        element.style.overflow = 'hidden';
        
        function slide(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.height = (startHeight * (1 - progress)) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(slide);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(slide);
    }
};

// Export utilities for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        deepClone,
        generateId,
        formatDate,
        formatTime,
        escapeHtml,
        stripHtml,
        truncateText,
        slugify,
        capitalize,
        camelToKebab,
        kebabToCamel,
        isInViewport,
        scrollToElement,
        getScrollPosition,
        setCSSProperty,
        getCSSProperty,
        isMobile,
        isTouchDevice,
        getDeviceType,
        storage,
        cookies,
        url,
        EventEmitter,
        StateManager,
        perf,
        animate
    };
}

// Make utilities available globally
window.utils = {
    debounce,
    throttle,
    deepClone,
    generateId,
    formatDate,
    formatTime,
    escapeHtml,
    stripHtml,
    truncateText,
    slugify,
    capitalize,
    camelToKebab,
    kebabToCamel,
    isInViewport,
    scrollToElement,
    getScrollPosition,
    setCSSProperty,
    getCSSProperty,
    isMobile,
    isTouchDevice,
    getDeviceType,
    storage,
    cookies,
    url,
    EventEmitter,
    StateManager,
    perf,
    animate
};
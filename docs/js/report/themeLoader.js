/**
 * Theme Loader for the AI Tool Risk Framework Report System
 * Handles dynamic loading of theme CSS files
 */
import { ThemePreloader } from './themePreloader.js';

export class ThemeLoader {
  /**
   * Creates a new ThemeLoader instance
   * @param {ThemeRegistry} themeRegistry - The theme registry to use
   * @param {Array<string>} commonThemes - Array of common theme names to prefetch
   */
  constructor(themeRegistry, commonThemes = []) {
    this.themeRegistry = themeRegistry;
    this.loadedThemes = new Set();
    this.currentTheme = null;
    this.loadingPromises = new Map();
    
    // Create theme preloader
    this.themePreloader = new ThemePreloader(themeRegistry, commonThemes);
    
    // Initialize
    this.init();
  }
  
  /**
   * Initializes the theme loader
   * @private
   */
  init() {
    // Load theme from localStorage or use default
    const savedTheme = localStorage.getItem('current_theme');
    
    if (savedTheme && this.themeRegistry.hasTheme(savedTheme)) {
      this.loadTheme(savedTheme).catch(error => {
        console.error(`Failed to load saved theme ${savedTheme}:`, error);
        this.loadDefaultTheme();
      });
    } else {
      this.loadDefaultTheme();
    }
    
    // Listen for theme registry events
    document.addEventListener('themeregistered', event => {
      const { theme } = event.detail;
      console.log(`Theme registered: ${theme}`);
    });
    
    document.addEventListener('themeunregistered', event => {
      const { theme } = event.detail;
      console.log(`Theme unregistered: ${theme}`);
      
      // If the current theme was unregistered, load the default theme
      if (this.currentTheme === theme) {
        this.loadDefaultTheme();
      }
    });
  }
  
  /**
   * Loads the default theme
   * @returns {Promise<void>}
   */
  async loadDefaultTheme() {
    const defaultTheme = this.themeRegistry.getDefaultTheme();
    
    if (defaultTheme) {
      await this.loadTheme(defaultTheme.name);
    } else {
      console.error('No default theme available');
    }
  }
  
  /**
   * Loads a theme
   * @param {string} themeName - The name of the theme to load
   * @returns {Promise<void>}
   */
  async loadTheme(themeName) {
    // Check if theme exists
    if (!this.themeRegistry.hasTheme(themeName)) {
      throw new Error(`Theme ${themeName} not found`);
    }
    
    // Check if theme is already loading
    if (this.loadingPromises.has(themeName)) {
      return this.loadingPromises.get(themeName);
    }
    
    // Create loading promise
    const loadingPromise = this._loadThemeInternal(themeName);
    this.loadingPromises.set(themeName, loadingPromise);
    
    try {
      await loadingPromise;
      return loadingPromise;
    } finally {
      // Remove loading promise when done
      this.loadingPromises.delete(themeName);
    }
  }
  
  /**
   * Internal method to load a theme
   * @param {string} themeName - The name of the theme to load
   * @returns {Promise<void>}
   * @private
   */
  async _loadThemeInternal(themeName) {
    console.log(`Loading theme: ${themeName}`);
    
    // Get theme
    const theme = this.themeRegistry.getTheme(themeName);
    
    if (!theme) {
      throw new Error(`Theme ${themeName} not found`);
    }
    
    // Remove current theme stylesheets
    this.removeCurrentThemeStylesheets();
    
    // Load theme stylesheets
    await this.loadThemeStylesheets(theme);
    
    // Update current theme
    this.currentTheme = themeName;
    
    // Save to localStorage
    localStorage.setItem('current_theme', themeName);
    
    // Add to loaded themes
    this.loadedThemes.add(themeName);
    
    // Set theme attribute on body
    document.body.dataset.theme = themeName;
    
    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: themeName } 
    }));
    
    console.log(`Theme loaded: ${themeName}`);
  }
  
  /**
   * Removes current theme stylesheets
   * @private
   */
  removeCurrentThemeStylesheets() {
    const themeLinks = document.querySelectorAll('link[data-theme]');
    themeLinks.forEach(link => link.remove());
  }
  
  /**
   * Loads theme stylesheets
   * @param {Object} theme - The theme object
   * @returns {Promise<void>}
   * @private
   */
  async loadThemeStylesheets(theme) {
    if (!theme.paths) {
      console.warn(`Theme ${theme.name} has no paths defined`);
      return;
    }
    
    // Create promises for each stylesheet
    const loadPromises = Object.entries(theme.paths).map(([id, path]) => {
      return this.loadStylesheet(path, theme.name, id);
    });
    
    // Wait for all stylesheets to load
    await Promise.all(loadPromises);
  }
  
  /**
   * Loads a stylesheet
   * @param {string} path - The stylesheet path
   * @param {string} themeName - The theme name
   * @param {string} componentId - The component ID
   * @returns {Promise<void>}
   * @private
   */
  loadStylesheet(path, themeName, componentId) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      link.dataset.theme = themeName;
      link.dataset.themeComponent = componentId;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${path}`));
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * Preloads a theme
   * @param {string} themeName - The name of the theme to preload
   * @returns {Promise<void>}
   */
  async preloadTheme(themeName) {
    // Use the ThemePreloader to preload the theme
    this.themePreloader.preloadTheme(themeName);
  }
  
  /**
   * Preloads critical resources for a theme
   * @param {string} themeName - The name of the theme to preload critical resources for
   */
  preloadCriticalTheme(themeName) {
    this.themePreloader.preloadCriticalTheme(themeName);
  }
  
  /**
   * Prefetches common themes
   */
  prefetchCommonThemes() {
    this.themePreloader.prefetchCommonThemes();
  }
  
  /**
   * Clears all resource hints added by the preloader
   */
  clearResourceHints() {
    this.themePreloader.clearResourceHints();
  }
  
  /**
   * Gets the current theme name
   * @returns {string|null} - The current theme name or null if no theme is loaded
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  /**
   * Checks if a theme is loaded
   * @param {string} themeName - The theme name
   * @returns {boolean} - Whether the theme is loaded
   */
  isThemeLoaded(themeName) {
    return this.loadedThemes.has(themeName);
  }
}
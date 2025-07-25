/**
 * ThemeLoader.js
 * 
 * This module provides functionality for dynamically loading theme files.
 * It supports lazy loading of CSS files and handles loading errors.
 */

class ThemeLoader {
  constructor() {
    this.loadedThemes = new Set();
    this.loadingPromises = new Map();
    this.baseUrl = '/css/themes/';
  }

  /**
   * Sets the base URL for theme files
   * @param {string} url - The base URL
   */
  setBaseUrl(url) {
    this.baseUrl = url.endsWith('/') ? url : `${url}/`;
  }

  /**
   * Loads a theme's CSS files
   * @param {string} themeName - The name of the theme
   * @param {Array} components - Optional array of theme components to load
   * @returns {Promise<boolean>} Promise resolving to success status
   */
  async loadTheme(themeName, components = ['base', 'layout', 'colors']) {
    // If already loading this theme, return the existing promise
    if (this.loadingPromises.has(themeName)) {
      return this.loadingPromises.get(themeName);
    }
    
    // If already loaded, return success
    if (this.loadedThemes.has(themeName)) {
      return Promise.resolve(true);
    }
    
    // Create a new loading promise
    const loadingPromise = this._loadThemeFiles(themeName, components);
    this.loadingPromises.set(themeName, loadingPromise);
    
    try {
      const result = await loadingPromise;
      if (result) {
        this.loadedThemes.add(themeName);
      }
      return result;
    } catch (error) {
      console.error(`Error loading theme '${themeName}':`, error);
      return false;
    } finally {
      // Clean up the loading promise
      this.loadingPromises.delete(themeName);
    }
  }

  /**
   * Loads the CSS files for a theme
   * @param {string} themeName - The name of the theme
   * @param {Array} components - Array of theme components to load
   * @returns {Promise<boolean>} Promise resolving to success status
   * @private
   */
  async _loadThemeFiles(themeName, components) {
    try {
      const cssFiles = this._getThemeFiles(themeName, components);
      const loadPromises = cssFiles.map(file => this._loadCSSFile(file, themeName));
      
      // Wait for all files to load
      const results = await Promise.all(loadPromises);
      
      // Check if all files loaded successfully
      return results.every(result => result);
    } catch (error) {
      console.error(`Error loading theme files for '${themeName}':`, error);
      return false;
    }
  }

  /**
   * Gets the file paths for a theme's components
   * @param {string} themeName - The name of the theme
   * @param {Array} components - Array of theme components to load
   * @returns {Array} Array of file paths
   * @private
   */
  _getThemeFiles(themeName, components) {
    const files = [];
    const themeNameWithoutPrefix = themeName.startsWith('theme-') ? themeName.substring(6) : themeName;
    const themeNameWithPrefix = themeName.startsWith('theme-') ? themeName : `theme-${themeName}`;
    
    console.log(`Getting theme files for: ${themeName}, components:`, components);
    console.log(`Theme name without prefix: ${themeNameWithoutPrefix}`);
    console.log(`Theme name with prefix: ${themeNameWithPrefix}`);
    
    // Always include the base theme file if it exists
    if (components.includes('base')) {
      const baseFile = `${this.baseUrl}base/theme-base.css`;
      console.log(`Adding base theme file: ${baseFile}`);
      files.push(baseFile);
    }
    
    // Check if theme has a component-based structure
    const hasComponentStructure = this._checkComponentStructure(themeName);
    console.log(`Theme ${themeName} has component structure: ${hasComponentStructure}`);
    
    if (hasComponentStructure) {
      // Add component files
      const variablesFile = `${this.baseUrl}${themeNameWithoutPrefix}/variables.css`;
      const layoutFile = `${this.baseUrl}${themeNameWithoutPrefix}/layout.css`;
      const typographyFile = `${this.baseUrl}${themeNameWithoutPrefix}/typography.css`;
      const componentsFile = `${this.baseUrl}${themeNameWithoutPrefix}/components.css`;
      
      console.log(`Adding component files for ${themeNameWithoutPrefix}:`);
      console.log(`- Variables: ${variablesFile}`);
      console.log(`- Layout: ${layoutFile}`);
      console.log(`- Typography: ${typographyFile}`);
      console.log(`- Components: ${componentsFile}`);
      
      files.push(variablesFile);
      files.push(layoutFile);
      files.push(typographyFile);
      files.push(componentsFile);
    } else {
      // Add the main theme file
      const mainFile = `${this.baseUrl}${themeNameWithPrefix}.css`;
      console.log(`Adding main theme file: ${mainFile}`);
      files.push(mainFile);
    }
    
    console.log(`Final theme files for ${themeName}:`, files);
    return files;
  }
  
  /**
   * Checks if a theme has a component-based structure
   * @param {string} themeName - The name of the theme
   * @returns {boolean} Whether the theme has a component structure
   * @private
   */
  _checkComponentStructure(themeName) {
    // Extract theme name without prefix if it exists
    const themeNameWithoutPrefix = themeName.startsWith('theme-') ? themeName.substring(6) : themeName;
    
    // Check for specific themes we know have component structure
    // Only 'dark', 'default', and 'print' have actual component directories
    const componentThemes = ['dark', 'default', 'print'];
    const result = componentThemes.includes(themeNameWithoutPrefix);
    console.log(`Checking component structure for theme: ${themeName}, without prefix: ${themeNameWithoutPrefix}, result: ${result}`);
    return result;
  }

  /**
   * Loads a CSS file
   * @param {string} url - The URL of the CSS file
   * @param {string} themeName - The name of the theme
   * @returns {Promise<boolean>} Promise resolving to success status
   * @private
   */
  _loadCSSFile(url, themeName) {
    return new Promise((resolve) => {
      // Check if the link already exists
      const existingLink = document.querySelector(`link[href="${url}"]`);
      if (existingLink) {
        // If it exists but was disabled, enable it
        if (existingLink.disabled) {
          existingLink.disabled = false;
        }
        resolve(true);
        return;
      }
      
      // Create a new link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.dataset.theme = themeName;
      
      // Handle load events
      link.onload = () => resolve(true);
      link.onerror = () => {
        console.warn(`Failed to load CSS file: ${url}`);
        // Don't fail the entire theme load for a single file
        resolve(false);
      };
      
      // Add to document
      document.head.appendChild(link);
    });
  }

  /**
   * Unloads a theme by disabling its CSS files
   * @param {string} themeName - The name of the theme to unload
   */
  unloadTheme(themeName) {
    // Disable all link elements for this theme
    document.querySelectorAll(`link[data-theme="${themeName}"]`).forEach(link => {
      link.disabled = true;
    });
    
    // Remove from loaded themes
    this.loadedThemes.delete(themeName);
  }

  /**
   * Checks if a theme is loaded
   * @param {string} themeName - The name of the theme
   * @returns {boolean} Whether the theme is loaded
   */
  isThemeLoaded(themeName) {
    return this.loadedThemes.has(themeName);
  }

  /**
   * Gets a list of all loaded theme names
   * @returns {Array} Array of loaded theme names
   */
  getLoadedThemes() {
    return Array.from(this.loadedThemes);
  }
}

export default ThemeLoader;
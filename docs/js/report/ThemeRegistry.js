/**
 * Theme Registry for the AI Tool Risk Framework Report System
 * Manages theme registration and retrieval
 */
export class ThemeRegistry {
  /**
   * Creates a new ThemeRegistry instance
   */
  constructor() {
    this.themes = new Map();
    this.defaultTheme = 'default';
    
    // Register built-in themes
    this.registerBuiltInThemes();
  }
  
  /**
   * Registers built-in themes
   * @private
   */
  registerBuiltInThemes() {
    // Register default theme
    this.registerTheme('default', {
      name: 'default',
      displayName: 'Default',
      description: 'The default theme for the AI Tool Risk Framework',
      paths: {
        variables: 'css/themes/default/variables.css',
        layout: 'css/themes/default/layout.css',
        typography: 'css/themes/default/typography.css',
        components: 'css/themes/default/components.css'
      }
    });
    
    // Register dark theme
    this.registerTheme('dark', {
      name: 'dark',
      displayName: 'Dark Mode',
      description: 'A dark theme for the AI Tool Risk Framework',
      paths: {
        variables: 'css/themes/dark/variables.css',
        layout: 'css/themes/dark/layout.css',
        typography: 'css/themes/dark/typography.css',
        components: 'css/themes/dark/components.css'
      }
    });
    
    // Register print theme
    this.registerTheme('print', {
      name: 'print',
      displayName: 'Print',
      description: 'A theme optimized for printing',
      paths: {
        variables: 'css/themes/print/variables.css',
        layout: 'css/themes/print/layout.css',
        typography: 'css/themes/print/typography.css',
        components: 'css/themes/print/components.css'
      }
    });
  }
  
  /**
   * Registers a theme
   * @param {string} name - The theme name
   * @param {Object} theme - The theme object
   */
  registerTheme(name, theme) {
    this.themes.set(name, {
      ...theme,
      name: name // Ensure name is set correctly
    });
    
    // Dispatch theme registered event
    document.dispatchEvent(new CustomEvent('themeregistered', { 
      detail: { theme: name } 
    }));
  }
  
  /**
   * Unregisters a theme
   * @param {string} name - The theme name
   * @returns {boolean} - Whether the theme was unregistered
   */
  unregisterTheme(name) {
    // Don't allow unregistering built-in themes
    if (['default', 'dark', 'print'].includes(name)) {
      console.warn(`Cannot unregister built-in theme: ${name}`);
      return false;
    }
    
    const result = this.themes.delete(name);
    
    if (result) {
      // Dispatch theme unregistered event
      document.dispatchEvent(new CustomEvent('themeunregistered', { 
        detail: { theme: name } 
      }));
    }
    
    return result;
  }
  
  /**
   * Gets a theme by name
   * @param {string} name - The theme name
   * @returns {Object|null} - The theme object or null if not found
   */
  getTheme(name) {
    return this.themes.get(name) || null;
  }
  
  /**
   * Gets all registered themes
   * @returns {Array<Object>} - Array of theme objects
   */
  getAllThemes() {
    return Array.from(this.themes.values());
  }
  
  /**
   * Gets the default theme
   * @returns {Object} - The default theme object
   */
  getDefaultTheme() {
    return this.getTheme(this.defaultTheme);
  }
  
  /**
   * Sets the default theme
   * @param {string} name - The theme name
   * @returns {boolean} - Whether the default theme was set
   */
  setDefaultTheme(name) {
    if (!this.themes.has(name)) {
      console.warn(`Cannot set default theme: ${name} is not registered`);
      return false;
    }
    
    this.defaultTheme = name;
    
    // Dispatch default theme changed event
    document.dispatchEvent(new CustomEvent('defaultthemechanged', { 
      detail: { theme: name } 
    }));
    
    return true;
  }
  
  /**
   * Gets theme CSS paths
   * @param {string} name - The theme name
   * @returns {Object|null} - Object with CSS paths or null if theme not found
   */
  getThemePaths(name) {
    const theme = this.getTheme(name);
    return theme ? theme.paths : null;
  }
  
  /**
   * Gets a specific theme component path
   * @param {string} themeName - The theme name
   * @param {string} component - The component name
   * @returns {string|null} - The component path or null if not found
   */
  getThemeComponentPath(themeName, component) {
    const theme = this.getTheme(themeName);
    
    if (!theme || !theme.paths || !theme.paths[component]) {
      return null;
    }
    
    return theme.paths[component];
  }
  
  /**
   * Checks if a theme exists
   * @param {string} name - The theme name
   * @returns {boolean} - Whether the theme exists
   */
  hasTheme(name) {
    return this.themes.has(name);
  }
}
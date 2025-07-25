/**
 * ThemeRegistry.js
 * 
 * This module provides a registry for managing report themes.
 * It supports theme inheritance, lazy loading, and validation.
 */

class ThemeRegistry {
  constructor() {
    this.themes = new Map();
    this.baseTheme = null;
    this.activeTheme = null;
    this.styleSheet = null;
    
    this.initializeStyleSheet();
    this.registerDefaultThemes();
    this.setBaseTheme('default');
  }
  
  /**
   * Registers default themes
   */
  registerDefaultThemes() {
    // Register a default theme
    this.registerTheme('default', {
      name: 'default',
      cssFiles: ['theme-default.css'],
      colors: {
        primary: '#3498db',
        secondary: '#2ecc71',
        background: '#ffffff',
        text: '#333333'
      },
      layout: 'single',
      spacing: 'normal'
    });

    // Register single-file themes
    this.registerTheme('theme-colorful', {
      name: 'theme-colorful',
      cssFiles: ['/css/themes/theme-colorful.css'],
      colors: {
        primary: '#e74c3c',
        secondary: '#f39c12',
        background: '#ffffff',
        text: '#2c3e50'
      },
      layout: 'single',
      spacing: 'normal'
    });

    this.registerTheme('theme-corporate', {
      name: 'theme-corporate',
      cssFiles: ['/css/themes/theme-corporate.css'],
      colors: {
        primary: '#34495e',
        secondary: '#95a5a6',
        background: '#ffffff',
        text: '#2c3e50'
      },
      layout: 'single',
      spacing: 'normal'
    });

    this.registerTheme('theme-executive', {
      name: 'theme-executive',
      cssFiles: ['/css/themes/theme-executive.css'],
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        background: '#ffffff',
        text: '#2c3e50'
      },
      layout: 'single',
      spacing: 'normal'
    });

    this.registerTheme('theme-minimal', {
      name: 'theme-minimal',
      cssFiles: ['/css/themes/theme-minimal.css'],
      colors: {
        primary: '#7f8c8d',
        secondary: '#95a5a6',
        background: '#ffffff',
        text: '#2c3e50'
      },
      layout: 'single',
      spacing: 'normal'
    });

    this.registerTheme('theme-modern', {
      name: 'theme-modern',
      cssFiles: ['/css/themes/theme-modern.css'],
      colors: {
        primary: '#3498db',
        secondary: '#9b59b6',
        background: '#ffffff',
        text: '#2c3e50'
      },
      layout: 'single',
      spacing: 'normal'
    });

    this.registerTheme('theme-vibrant', {
      name: 'theme-vibrant',
      cssFiles: ['/css/themes/theme-vibrant.css'],
      colors: {
        primary: '#e74c3c',
        secondary: '#f39c12',
        background: '#ffffff',
        text: '#2c3e50'
      },
      layout: 'single',
      spacing: 'normal'
    });

    this.registerTheme('theme-system', {
      name: 'theme-system',
      cssFiles: ['/css/themes/theme-system.css'],
      colors: {
        primary: '#007acc',
        secondary: '#0099cc',
        background: '#ffffff',
        text: '#333333'
      },
      layout: 'single',
      spacing: 'normal'
    });

    this.registerTheme('theme-dark', {
      name: 'theme-dark',
      cssFiles: ['/css/themes/theme-dark.css'],
      colors: {
        primary: '#3498db',
        secondary: '#2ecc71',
        background: '#2c3e50',
        text: '#ecf0f1'
      },
      layout: 'single',
      spacing: 'normal'
    });

    this.registerTheme('theme-professional', {
      name: 'theme-professional',
      cssFiles: ['/css/themes/theme-professional.css'],
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        background: '#ffffff',
        text: '#2c3e50'
      },
      layout: 'single',
      spacing: 'normal'
    });
  }

  /**
   * Initializes the dynamic stylesheet for themes
   */
  initializeStyleSheet() {
    let styleSheet = document.getElementById('dynamic-theme-styles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'dynamic-theme-styles';
      document.head.appendChild(styleSheet);
    }
    this.styleSheet = styleSheet;
  }

  /**
   * Checks if a theme exists in the registry
   * @param {string} themeName - The name of the theme to check
   * @returns {boolean} True if the theme exists, false otherwise
   */
  hasTheme(themeName) {
    return this.themes.has(themeName);
  }

  /**
   * Registers a theme with the registry
   * @param {string} name - The name of the theme
   * @param {Object} config - The theme configuration
   * @param {string} parentTheme - Optional parent theme to inherit from
   * @returns {boolean} Success status
   */
  registerTheme(name, config, parentTheme = null) {
    try {
      // Validate the theme configuration
      if (!this.validateThemeConfig(config)) {
        console.error(`Invalid theme configuration for '${name}'`);
        return false;
      }
      
      // If parent theme is specified, merge configurations
      let mergedConfig = { ...config };
      if (parentTheme) {
        const parent = this.themes.get(parentTheme);
        if (!parent) {
          console.error(`Parent theme '${parentTheme}' not found for '${name}'`);
          return false;
        }
        
        // Merge with parent, allowing child to override
        mergedConfig = this.mergeThemeConfigs(parent.config, config);
      }
      
      // Store the theme
      this.themes.set(name, {
        name,
        config: mergedConfig,
        parent: parentTheme,
        cssLoaded: false,
        cssFiles: config.cssFiles || []
      });
      
      return true;
    } catch (error) {
      console.error(`Error registering theme '${name}':`, error);
      return false;
    }
  }

  /**
   * Registers multiple themes at once
   * @param {Object} themes - Object with theme names as keys and configs as values
   * @returns {boolean} Success status
   */
  registerThemes(themes) {
    let success = true;
    
    Object.entries(themes).forEach(([name, config]) => {
      const result = this.registerTheme(name, config, config.parent || null);
      if (!result) success = false;
    });
    
    return success;
  }

  /**
   * Sets a theme as the base theme
   * @param {string} themeName - The name of the base theme
   * @returns {boolean} Success status
   */
  setBaseTheme(themeName) {
    if (!this.themes.has(themeName)) {
      console.error(`Theme '${themeName}' not found for base theme`);
      return false;
    }
    
    this.baseTheme = themeName;
    return true;
  }

  /**
   * Activates a theme by loading its CSS and updating the DOM
   * @param {string} themeName - The name of the theme to activate
   * @returns {Promise<boolean>} Promise resolving to success status
   */
  async activateTheme(themeName) {
    try {
      // If theme doesn't exist, try to use base theme
      if (!this.themes.has(themeName)) {
        console.warn(`Theme '${themeName}' not found, falling back to base theme`);
        
        if (this.baseTheme) {
          themeName = this.baseTheme;
        } else {
          console.error('No base theme set for fallback');
          return false;
        }
      }
      
      const theme = this.themes.get(themeName);
      
      // Load CSS files if not already loaded
      if (!theme.cssLoaded && theme.cssFiles.length > 0) {
        await this.loadThemeCSS(theme);
      }
      
      // Generate CSS variables
      const css = this.generateThemeCSS(theme.config);
      this.updateStyleSheet(css);
      
      // Update DOM if needed
      this.updateDOM(theme.config);
      
      this.activeTheme = themeName;
      this.dispatchThemeChange(themeName);
      
      return true;
    } catch (error) {
      console.error(`Error activating theme '${themeName}':`, error);
      return false;
    }
  }

  /**
   * Loads CSS files for a theme
   * @param {Object} theme - The theme object
   * @returns {Promise<void>}
   */
  async loadThemeCSS(theme) {
    const cssPromises = theme.cssFiles.map(file => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = file;
        link.dataset.theme = theme.name;
        
        link.onload = () => resolve();
        link.onerror = () => {
          console.error(`Failed to load CSS file: ${file}`);
          resolve(); // Resolve anyway to continue with other files
        };
        
        document.head.appendChild(link);
      });
    });
    
    await Promise.all(cssPromises);
    theme.cssLoaded = true;
  }

  /**
   * Updates the dynamic stylesheet with theme CSS
   * @param {string} css - The CSS to apply
   */
  updateStyleSheet(css) {
    if (this.styleSheet) {
      this.styleSheet.innerHTML = css;
    }
  }

  /**
   * Generates CSS variables from theme configuration
   * @param {Object} config - The theme configuration
   * @returns {string} CSS string
   */
  generateThemeCSS(config) {
    // Extract CSS variables from config
    const variables = this.extractCSSVariables(config);
    
    // Generate CSS string
    let css = ':root {\n';
    Object.entries(variables).forEach(([name, value]) => {
      css += `  ${name}: ${value};\n`;
    });
    css += '}\n';
    
    // Add custom rules if present
    if (config.customRules) {
      css += this.generateCustomRules(config.customRules);
    }
    
    return css;
  }

  /**
   * Extracts CSS variables from theme configuration
   * @param {Object} config - The theme configuration
   * @returns {Object} Object with CSS variable names and values
   */
  extractCSSVariables(config) {
    const variables = {};
    
    // Process color scheme
    if (config.colors) {
      Object.entries(config.colors).forEach(([name, value]) => {
        variables[`--theme-${name}`] = value;
      });
    }
    
    // Process typography
    if (config.typography) {
      Object.entries(config.typography).forEach(([name, value]) => {
        variables[`--theme-font-${name}`] = value;
      });
    }
    
    // Process spacing
    if (config.spacing) {
      Object.entries(config.spacing).forEach(([name, value]) => {
        variables[`--theme-spacing-${name}`] = value;
      });
    }
    
    // Process other variables
    if (config.variables) {
      Object.entries(config.variables).forEach(([name, value]) => {
        variables[`--theme-${name}`] = value;
      });
    }
    
    return variables;
  }

  /**
   * Generates CSS for custom rules
   * @param {Object} customRules - The custom rules object
   * @returns {string} CSS string
   */
  generateCustomRules(customRules) {
    let css = '';
    
    Object.entries(customRules).forEach(([selector, rules]) => {
      css += `${selector} {\n`;
      
      Object.entries(rules).forEach(([property, value]) => {
        css += `  ${property}: ${value};\n`;
      });
      
      css += '}\n';
    });
    
    return css;
  }

  /**
   * Updates the DOM based on theme configuration
   * @param {Object} config - The theme configuration
   */
  updateDOM(config) {
    // Add theme class to body
    document.body.className = document.body.className
      .replace(/theme-[\w-]+/g, '')
      .trim();
    document.body.classList.add(`theme-${config.name || 'default'}`);
    
    // Update layout if specified
    if (config.layout) {
      const container = document.querySelector('.report-container');
      if (container) {
        container.className = container.className
          .replace(/layout-[\w-]+/g, '')
          .trim();
        container.classList.add(`layout-${config.layout}`);
      }
    }
    
    // Update sections visibility if specified
    if (config.sections) {
      this.updateSections(config.sections);
    }
  }

  /**
   * Updates section visibility based on theme configuration
   * @param {Array} sections - Array of section names to show
   */
  updateSections(sections) {
    const allSections = document.querySelectorAll('.report-section');
    
    // Hide all sections first
    allSections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Show only configured sections
    sections.forEach(sectionName => {
      const section = document.querySelector(`.report-section.${sectionName}`);
      if (section) {
        section.style.display = '';
      }
    });
  }

  /**
   * Merges parent and child theme configurations
   * @param {Object} parent - The parent theme configuration
   * @param {Object} child - The child theme configuration
   * @returns {Object} Merged configuration
   */
  mergeThemeConfigs(parent, child) {
    const merged = { ...parent };
    
    // Merge top-level properties
    Object.entries(child).forEach(([key, value]) => {
      // For objects, merge recursively
      if (value && typeof value === 'object' && !Array.isArray(value) && merged[key]) {
        merged[key] = { ...merged[key], ...value };
      } 
      // For arrays or primitives, replace
      else {
        merged[key] = value;
      }
    });
    
    return merged;
  }

  /**
   * Validates a theme configuration
   * @param {Object} config - The theme configuration to validate
   * @returns {boolean} Validation result
   */
  validateThemeConfig(config) {
    // Basic validation
    if (!config || typeof config !== 'object') {
      return false;
    }
    
    // Validate required fields
    if (!config.name) {
      console.warn('Theme config missing required field: name');
    }
    
    // Validate CSS files if present
    if (config.cssFiles && !Array.isArray(config.cssFiles)) {
      console.error('Theme cssFiles must be an array');
      return false;
    }
    
    return true;
  }

  /**
   * Dispatches a theme change event
   * @param {string} themeName - The name of the activated theme
   */
  dispatchThemeChange(themeName) {
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { 
        themeName, 
        config: this.themes.get(themeName).config 
      }
    }));
  }

  /**
   * Gets a list of all registered theme names
   * @returns {Array} Array of theme names
   */
  getThemeNames() {
    return Array.from(this.themes.keys());
  }

  /**
   * Gets the configuration for a specific theme
   * @param {string} themeName - The name of the theme
   * @returns {Object|null} The theme configuration or null if not found
   */
  getThemeConfig(themeName) {
    const theme = this.themes.get(themeName);
    return theme ? theme.config : null;
  }

  /**
   * Gets the currently active theme name
   * @returns {string|null} The active theme name or null if none active
   */
  getActiveTheme() {
    return this.activeTheme;
  }
  
  /**
   * Checks if a theme exists in the registry
   * @param {string} themeName - The name of the theme to check
   * @returns {boolean} True if the theme exists, false otherwise
   */
  hasTheme(themeName) {
    return this.themes.has(themeName);
  }
}

export default ThemeRegistry;
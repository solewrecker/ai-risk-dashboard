/**
 * Theme Compatibility Adapter for the AI Tool Risk Framework Report System
 * Provides backward compatibility for themes created for the previous system
 */
export class ThemeCompatibilityAdapter {
  /**
   * Creates a new ThemeCompatibilityAdapter instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      legacyThemePath: options.legacyThemePath || '/css/legacy-themes/',
      modernThemePath: options.modernThemePath || '/css/themes/',
      themeRegistry: options.themeRegistry || null,
      debug: options.debug !== undefined ? options.debug : false
    };
    
    this.themeRegistry = this.options.themeRegistry || window.themeRegistry;
    this.legacyThemeMap = new Map();
    this.cssVariableMap = new Map();
    
    // Initialize the adapter
    this.init();
  }
  
  /**
   * Initializes the compatibility adapter
   * @private
   */
  init() {
    // Set up CSS variable mappings between legacy and modern themes
    this.setupVariableMappings();
    
    // Log initialization if debug is enabled
    if (this.options.debug) {
      console.log('ThemeCompatibilityAdapter initialized with options:', this.options);
    }
  }
  
  /**
   * Sets up mappings between legacy and modern CSS variables
   * @private
   */
  setupVariableMappings() {
    // Map legacy CSS variables to modern equivalents
    this.cssVariableMap.set('--primary-color', '--color-primary');
    this.cssVariableMap.set('--secondary-color', '--color-secondary');
    this.cssVariableMap.set('--accent-color', '--color-accent');
    this.cssVariableMap.set('--text-color', '--color-text');
    this.cssVariableMap.set('--background-color', '--color-background');
    this.cssVariableMap.set('--border-color', '--color-border');
    this.cssVariableMap.set('--header-bg', '--color-header-background');
    this.cssVariableMap.set('--footer-bg', '--color-footer-background');
    this.cssVariableMap.set('--link-color', '--color-link');
    this.cssVariableMap.set('--link-hover-color', '--color-link-hover');
    this.cssVariableMap.set('--error-color', '--color-error');
    this.cssVariableMap.set('--success-color', '--color-success');
    this.cssVariableMap.set('--warning-color', '--color-warning');
    this.cssVariableMap.set('--info-color', '--color-info');
    this.cssVariableMap.set('--font-family', '--font-family');
    this.cssVariableMap.set('--heading-font', '--font-family-heading');
    this.cssVariableMap.set('--font-size-base', '--font-size-base');
    this.cssVariableMap.set('--font-size-small', '--font-size-small');
    this.cssVariableMap.set('--font-size-large', '--font-size-large');
    this.cssVariableMap.set('--font-weight-normal', '--font-weight-normal');
    this.cssVariableMap.set('--font-weight-bold', '--font-weight-bold');
    this.cssVariableMap.set('--line-height', '--line-height');
    this.cssVariableMap.set('--border-radius', '--border-radius');
    this.cssVariableMap.set('--box-shadow', '--box-shadow');
    this.cssVariableMap.set('--transition-speed', '--transition-duration');
    
    if (this.options.debug) {
      console.log('CSS variable mappings set up:', Object.fromEntries(this.cssVariableMap));
    }
  }
  
  /**
   * Registers a legacy theme with the theme registry
   * @param {string} themeName - The name of the legacy theme
   * @param {string} themePath - The path to the legacy theme CSS file
   * @returns {string} - The ID of the registered theme
   */
  registerLegacyTheme(themeName, themePath) {
    try {
      if (!this.themeRegistry) {
        throw new Error('Theme registry not available');
      }
      
      // Generate a unique ID for the theme
      const themeId = `legacy-${themeName.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Create a modern theme object from the legacy theme
      const modernTheme = this.createModernThemeFromLegacy(themeId, themeName, themePath);
      
      // Register the theme with the registry
      this.themeRegistry.registerTheme(modernTheme);
      
      // Store the mapping
      this.legacyThemeMap.set(themeId, {
        originalPath: themePath,
        modernTheme: modernTheme
      });
      
      if (this.options.debug) {
        console.log(`Legacy theme "${themeName}" registered with ID: ${themeId}`);
      }
      
      return themeId;
    } catch (error) {
      console.error(`Failed to register legacy theme "${themeName}":`, error);
      throw error;
    }
  }
  
  /**
   * Creates a modern theme object from a legacy theme
   * @param {string} themeId - The ID for the new theme
   * @param {string} themeName - The name of the legacy theme
   * @param {string} themePath - The path to the legacy theme CSS file
   * @returns {Object} - The modern theme object
   * @private
   */
  createModernThemeFromLegacy(themeId, themeName, themePath) {
    // Create a modern theme object
    const modernTheme = {
      id: themeId,
      name: `${themeName} (Legacy)`,
      description: `Legacy theme "${themeName}" adapted to the modern theme system`,
      version: '1.0.0',
      author: 'System',
      license: 'Unknown',
      cssFiles: [themePath],
      isLegacy: true,
      originalPath: themePath
    };
    
    return modernTheme;
  }
  
  /**
   * Adapts a legacy theme CSS file to be compatible with the modern theme system
   * @param {string} themeId - The ID of the legacy theme
   * @returns {Promise<string>} - The path to the adapted CSS file
   */
  async adaptLegacyTheme(themeId) {
    try {
      // Get the legacy theme info
      const legacyThemeInfo = this.legacyThemeMap.get(themeId);
      
      if (!legacyThemeInfo) {
        throw new Error(`Legacy theme with ID "${themeId}" not found`);
      }
      
      // Fetch the legacy CSS
      const legacyCSS = await this.fetchCSSFile(legacyThemeInfo.originalPath);
      
      // Transform the CSS
      const adaptedCSS = this.transformLegacyCSS(legacyCSS);
      
      // Create a blob URL for the adapted CSS
      const blob = new Blob([adaptedCSS], { type: 'text/css' });
      const adaptedCSSUrl = URL.createObjectURL(blob);
      
      // Update the theme's CSS files
      const theme = this.themeRegistry.getTheme(themeId);
      if (theme) {
        theme.cssFiles = [adaptedCSSUrl];
        theme.adaptedFromLegacy = true;
        
        // Update the theme in the registry
        this.themeRegistry.updateTheme(themeId, theme);
      }
      
      if (this.options.debug) {
        console.log(`Legacy theme "${themeId}" adapted successfully`);
      }
      
      return adaptedCSSUrl;
    } catch (error) {
      console.error(`Failed to adapt legacy theme "${themeId}":`, error);
      throw error;
    }
  }
  
  /**
   * Fetches a CSS file
   * @param {string} url - The URL of the CSS file
   * @returns {Promise<string>} - The CSS content
   * @private
   */
  async fetchCSSFile(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSS file: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error fetching CSS file ${url}:`, error);
      throw error;
    }
  }
  
  /**
   * Transforms legacy CSS to be compatible with the modern theme system
   * @param {string} css - The legacy CSS content
   * @returns {string} - The transformed CSS
   * @private
   */
  transformLegacyCSS(css) {
    let transformedCSS = css;
    
    // Replace legacy variable names with modern equivalents
    this.cssVariableMap.forEach((modernVar, legacyVar) => {
      const legacyVarRegex = new RegExp(legacyVar, 'g');
      transformedCSS = transformedCSS.replace(legacyVarRegex, modernVar);
    });
    
    // Add compatibility layer
    transformedCSS = this.addCompatibilityLayer(transformedCSS);
    
    return transformedCSS;
  }
  
  /**
   * Adds a compatibility layer to the CSS
   * @param {string} css - The CSS content
   * @returns {string} - The CSS with compatibility layer
   * @private
   */
  addCompatibilityLayer(css) {
    // Create a compatibility layer that maps modern variables back to legacy ones for backward compatibility
    let compatibilityLayer = '/* Legacy Theme Compatibility Layer */\n';
    compatibilityLayer += ':root {\n';
    
    this.cssVariableMap.forEach((modernVar, legacyVar) => {
      compatibilityLayer += `  ${legacyVar}: var(${modernVar});\n`;
    });
    
    compatibilityLayer += '}\n\n';
    
    // Add legacy class mappings
    compatibilityLayer += '/* Legacy Class Mappings */\n';
    compatibilityLayer += '.legacy-button { @extend .button; }\n';
    compatibilityLayer += '.legacy-card { @extend .card; }\n';
    compatibilityLayer += '.legacy-form-input { @extend .form-input; }\n';
    compatibilityLayer += '.legacy-alert { @extend .alert; }\n';
    compatibilityLayer += '\n';
    
    return compatibilityLayer + css;
  }
  
  /**
   * Applies a legacy theme
   * @param {string} themeId - The ID of the legacy theme
   * @returns {Promise<void>}
   */
  async applyLegacyTheme(themeId) {
    try {
      // Check if the theme exists
      const theme = this.themeRegistry.getTheme(themeId);
      
      if (!theme) {
        throw new Error(`Theme with ID "${themeId}" not found`);
      }
      
      // Check if it's a legacy theme
      if (!theme.isLegacy) {
        throw new Error(`Theme with ID "${themeId}" is not a legacy theme`);
      }
      
      // Adapt the theme if not already adapted
      if (!theme.adaptedFromLegacy) {
        await this.adaptLegacyTheme(themeId);
      }
      
      // Apply the theme using the registry
      this.themeRegistry.setActiveTheme(themeId);
      
      if (this.options.debug) {
        console.log(`Legacy theme "${themeId}" applied successfully`);
      }
    } catch (error) {
      console.error(`Failed to apply legacy theme "${themeId}":`, error);
      throw error;
    }
  }
  
  /**
   * Gets all registered legacy themes
   * @returns {Array<Object>} - Array of legacy theme objects
   */
  getLegacyThemes() {
    const legacyThemes = [];
    
    // Get all themes from the registry
    const allThemes = this.themeRegistry.getAllThemes();
    
    // Filter for legacy themes
    for (const theme of allThemes) {
      if (theme.isLegacy) {
        legacyThemes.push(theme);
      }
    }
    
    return legacyThemes;
  }
  
  /**
   * Checks if a theme is a legacy theme
   * @param {string} themeId - The ID of the theme to check
   * @returns {boolean} - True if the theme is a legacy theme
   */
  isLegacyTheme(themeId) {
    const theme = this.themeRegistry.getTheme(themeId);
    return theme ? theme.isLegacy : false;
  }
  
  /**
   * Converts a modern theme to be compatible with legacy systems
   * @param {string} themeId - The ID of the modern theme
   * @returns {Object} - Legacy-compatible theme object
   */
  convertModernToLegacy(themeId) {
    try {
      // Get the modern theme
      const modernTheme = this.themeRegistry.getTheme(themeId);
      
      if (!modernTheme) {
        throw new Error(`Theme with ID "${themeId}" not found`);
      }
      
      // Skip if it's already a legacy theme
      if (modernTheme.isLegacy) {
        return modernTheme;
      }
      
      // Create a legacy-compatible version
      const legacyCompatible = {
        id: `legacy-compatible-${modernTheme.id}`,
        name: `${modernTheme.name} (Legacy Compatible)`,
        path: modernTheme.cssFiles[0],
        variables: this.convertModernVariablesToLegacy(modernTheme),
        originalTheme: modernTheme
      };
      
      if (this.options.debug) {
        console.log(`Modern theme "${themeId}" converted to legacy-compatible format`);
      }
      
      return legacyCompatible;
    } catch (error) {
      console.error(`Failed to convert modern theme "${themeId}" to legacy format:`, error);
      throw error;
    }
  }
  
  /**
   * Converts modern CSS variables to legacy format
   * @param {Object} theme - The modern theme object
   * @returns {Object} - Legacy variables object
   * @private
   */
  convertModernVariablesToLegacy(theme) {
    // This would typically extract variables from the theme's CSS
    // For this implementation, we'll return a simplified mapping
    const legacyVariables = {};
    
    // Create reverse mapping
    const reverseMap = new Map();
    this.cssVariableMap.forEach((modernVar, legacyVar) => {
      reverseMap.set(modernVar, legacyVar);
    });
    
    // Set default legacy variables
    legacyVariables['--primary-color'] = 'var(--color-primary, #0066cc)';
    legacyVariables['--secondary-color'] = 'var(--color-secondary, #ff6600)';
    legacyVariables['--text-color'] = 'var(--color-text, #333333)';
    legacyVariables['--background-color'] = 'var(--color-background, #ffffff)';
    legacyVariables['--border-color'] = 'var(--color-border, #dddddd)';
    
    return legacyVariables;
  }
  
  /**
   * Cleans up resources used by the adapter
   */
  cleanup() {
    // Revoke any object URLs created for adapted CSS files
    this.legacyThemeMap.forEach(themeInfo => {
      if (themeInfo.modernTheme && themeInfo.modernTheme.cssFiles) {
        themeInfo.modernTheme.cssFiles.forEach(cssFile => {
          if (cssFile.startsWith('blob:')) {
            URL.revokeObjectURL(cssFile);
          }
        });
      }
    });
    
    // Clear maps
    this.legacyThemeMap.clear();
    
    if (this.options.debug) {
      console.log('ThemeCompatibilityAdapter cleaned up');
    }
  }
}
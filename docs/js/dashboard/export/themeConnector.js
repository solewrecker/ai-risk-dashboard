/**
 * themeConnector.js
 * 
 * This module provides a compatibility layer between the theme marketplace
 * and the theme system in the report generation system.
 * It connects the theme selection in the marketplace to the theme loading in the report preview.
 */

// Use dynamic imports or global window objects to avoid module resolution issues
let ThemeRegistry, ThemeLoader;

// Function to initialize the module dependencies
async function initDependencies() {
  // Try to load from window globals first
  if (window.ThemeRegistry && window.ThemeLoader) {
    ThemeRegistry = window.ThemeRegistry;
    ThemeLoader = window.ThemeLoader;
    return true;
  } else {
    // Fallback to dynamic imports
    try {
      const ThemeRegistryModule = await import('../../../js/ThemeRegistry.js');
      const ThemeLoaderModule = await import('../../../js/ThemeLoader.js');
      ThemeRegistry = ThemeRegistryModule.default;
      ThemeLoader = ThemeLoaderModule.default;
      return true;
    } catch (error) {
      console.error('Error loading theme modules:', error);
      // Create dummy classes as fallback
      ThemeRegistry = class ThemeRegistry { 
        getAvailableThemes() { return []; }
      };
      ThemeLoader = class ThemeLoader {};
      return false;
    }
  }
}

// Initialize dependencies
(async function() {
  try {
    await initDependencies();
  } catch (err) {
    console.error('Failed to initialize ThemeConnector dependencies:', err);
  }
})();

class ThemeConnector {
  constructor() {
    this.selectedTheme = 'theme-professional'; // Default theme
    this.initialized = false;
    
    // Load the selected theme from localStorage if available
    const storedTheme = localStorage.getItem('selectedTheme');
    if (storedTheme) {
      this.selectedTheme = storedTheme;
    }
    
    // Initialize registry and loader if they're available synchronously
    if (typeof ThemeRegistry === 'function' && typeof ThemeLoader === 'function') {
      this.themeRegistry = new ThemeRegistry();
      this.themeLoader = new ThemeLoader();
      this.initialized = true;
    } else {
      // Create dummy objects as placeholders
      this.themeRegistry = { getAvailableThemes: () => [] };
      this.themeLoader = {};
      console.warn('Theme modules not fully loaded in constructor');
      
      // Try to initialize asynchronously
      this.init();
    }
  }
  
  async init() {
    try {
      // Wait for dependencies to be initialized
      await initDependencies();
      
      // Create instances if ThemeRegistry and ThemeLoader are available
      if (typeof ThemeRegistry === 'function' && typeof ThemeLoader === 'function') {
        this.themeRegistry = new ThemeRegistry();
        this.themeLoader = new ThemeLoader();
        this.initialized = true;
        console.log('ThemeConnector initialized successfully');
      } else {
        console.error('ThemeConnector initialization failed: dependencies not available');
      }
    } catch (error) {
      console.error('Error initializing ThemeConnector:', error);
    }
  }
  
  /**
   * Initialize the ThemeConnector asynchronously
   * This should be called after instantiation if the constructor couldn't fully initialize
   */
  async initialize() {
    // If we already have proper instances, no need to initialize again
    if (this.themeRegistry instanceof ThemeRegistry && this.themeLoader instanceof ThemeLoader) {
      return;
    }
    
    try {
      // Try to load modules dynamically if they weren't available in constructor
      if (typeof ThemeRegistry !== 'function' || typeof ThemeLoader !== 'function') {
        const ThemeRegistryModule = await import('../../../js/ThemeRegistry.js');
        const ThemeLoaderModule = await import('../../../js/ThemeLoader.js');
        ThemeRegistry = ThemeRegistryModule.default;
        ThemeLoader = ThemeLoaderModule.default;
      }
      
      this.themeRegistry = new ThemeRegistry();
      this.themeLoader = new ThemeLoader();
    } catch (error) {
      console.error('Error initializing ThemeConnector:', error);
    }
  }
  
  /**
   * Get all themes from the marketplace
   * @returns {Array} Array of theme objects
   */
  getAllThemes() {
    // If themeMarketplace is available, get themes from there
    if (window.themeMarketplace) {
      return Array.from(window.themeMarketplace.marketplaceThemes.values());
    }
    
    // Fallback to registry themes if marketplace is not available
    return this.themeRegistry.getAvailableThemes();
  }
  
  /**
   * Get themes by category from the marketplace
   * @param {string} category - The category to filter by (free, premium, community)
   * @returns {Array} Array of theme objects in the specified category
   */
  getThemesByCategory(category) {
    // If themeMarketplace is available, filter themes from there
    if (window.themeMarketplace) {
      return Array.from(window.themeMarketplace.marketplaceThemes.values())
        .filter(theme => theme.category === category);
    }
    
    // Fallback to registry themes if marketplace is not available
    return this.themeRegistry.getAvailableThemes()
      .filter(theme => theme.category === category);
  }
  
  /**
   * Select a theme by ID
   * @param {string} themeId - The ID of the theme to select
   */
  selectTheme(themeId) {
    // Check if theme exists in marketplace
    let themeExists = false;
    
    if (window.themeMarketplace) {
      themeExists = window.themeMarketplace.marketplaceThemes.has(themeId);
    } else {
      themeExists = this.themeRegistry.hasTheme(themeId);
    }
    
    if (!themeExists) {
      console.error(`Theme with ID ${themeId} not found`);
      return;
    }
    
    this.selectedTheme = themeId;
    
    // Store the selected theme in localStorage for the report preview
    localStorage.setItem('selectedTheme', themeId);
    
    // If the theme is in the marketplace and installed, activate it
    if (window.themeMarketplace && 
        window.themeMarketplace.marketplaceThemes.has(themeId) && 
        window.themeMarketplace.isThemeInstalled(themeId)) {
      window.themeMarketplace.activateTheme(themeId);
    } else {
      // Otherwise, just load the theme using the ThemeLoader
      this.themeLoader.loadTheme(themeId);
      
      // Dispatch theme changed event
      const event = new CustomEvent('themeChanged', {
        detail: { themeName: themeId }
      });
      document.dispatchEvent(event);
    }
  }
  
  /**
   * Get the currently selected theme ID
   * @returns {string} The selected theme ID
   */
  getSelectedTheme() {
    return this.selectedTheme;
  }
  
  /**
   * Set the current theme and save to localStorage
   * @param {string} themeName - The theme ID to set
   * @returns {string} The set theme ID
   */
  setTheme(themeName) {
    if (!this.initialized) {
      console.warn('ThemeConnector not fully initialized, theme change may not take effect');
    }
    
    this.selectedTheme = themeName;
    localStorage.setItem('selectedTheme', themeName);
    
    // Dispatch a theme changed event
    const event = new CustomEvent('themeChanged', {
      detail: { themeName }
    });
    document.dispatchEvent(event);
    
    return themeName;
  }
  
  /**
   * Get the theme data for the report generation system
   * @returns {Object} The theme data in the format expected by the new theme system
   */
  getThemeDataForReport() {
    if (!this.initialized) {
      console.warn('ThemeConnector not fully initialized, returning basic theme data');
      return { themeId: this.selectedTheme };
    }
    
    const themeId = this.selectedTheme;
    
    // Get theme data from marketplace if available
    if (window.themeMarketplace && window.themeMarketplace.marketplaceThemes.has(themeId)) {
      const theme = window.themeMarketplace.marketplaceThemes.get(themeId);
      return {
        themeId: themeId,
        name: theme.name,
        author: theme.author,
        version: theme.version
      };
    }
    
    // Fallback to basic theme data
    return {
      themeId: themeId
    };
  }
  
  /**
   * Bridge between the marketplace and the ThemeRegistry/ThemeLoader
   * This method ensures the selected theme is registered in the ThemeRegistry
   * @returns {string} The selected theme ID
   */
  bridgeToThemeSystem() {
    if (!this.initialized) {
      console.warn('ThemeConnector not fully initialized, cannot bridge to theme system');
      return this.selectedTheme;
    }
    
    try {
      const themeId = this.selectedTheme;
      
      // If the theme is in the marketplace, use its data to register with the ThemeRegistry
      if (window.themeMarketplace && window.themeMarketplace.marketplaceThemes.has(themeId)) {
        const theme = window.themeMarketplace.marketplaceThemes.get(themeId);
        
        // Check if the theme is already registered and themeRegistry has the hasTheme method
        if (typeof this.themeRegistry.hasTheme === 'function' && !this.themeRegistry.hasTheme(themeId)) {
          // Register the theme with the ThemeRegistry or ScalableThemeSystem
          if (typeof this.themeRegistry.registerTheme === 'function') {
            console.log(`ThemeConnector: Registering theme ${themeId} with theme system`);
            const themeConfig = {
              id: themeId,
              name: theme.name,
              author: theme.author?.name || 'Unknown',
              version: theme.version || '1.0.0',
              cssFiles: theme.cssFiles || [],
              dependencies: theme.dependencies || []
            };
            
            // Handle different parameter orders between systems
            if (this.themeRegistry instanceof window.ScalableThemeSystem) {
              this.themeRegistry.registerTheme(themeId, themeConfig);
            } else {
              // Legacy ThemeRegistry expects (name, config) format
              this.themeRegistry.registerTheme(themeId, themeConfig);
            }
          }
        }
      }
      
      return themeId;
    } catch (error) {
      console.error('Error bridging to theme system:', error);
      return this.selectedTheme;
    }
  }
}

// Export the ThemeConnector class
export default ThemeConnector;
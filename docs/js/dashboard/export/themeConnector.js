/**
 * themeConnector.js
 * 
 * This module provides a compatibility layer between the theme marketplace
 * and the theme system in the report generation system.
 * It connects the theme selection in the marketplace to the theme loading in the report preview.
 */

import ThemeRegistry from '../../report/themes/ThemeRegistry.js';
import ThemeLoader from '../../report/themes/ThemeLoader.js';

class ThemeConnector {
  constructor() {
    this.themeRegistry = new ThemeRegistry();
    this.themeLoader = new ThemeLoader();
    this.selectedTheme = 'theme-professional'; // Default theme
    
    // Load the selected theme from localStorage if available
    const storedTheme = localStorage.getItem('selectedTheme');
    if (storedTheme) {
      this.selectedTheme = storedTheme;
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
   * Get the theme data for the report generation system
   * @returns {Object} The theme data in the format expected by the new theme system
   */
  getThemeDataForReport() {
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
    const themeId = this.selectedTheme;
    
    // If the theme is in the marketplace, use its data to register with the ThemeRegistry
    if (window.themeMarketplace && window.themeMarketplace.marketplaceThemes.has(themeId)) {
      const theme = window.themeMarketplace.marketplaceThemes.get(themeId);
      
      // Check if the theme is already registered
      if (!this.themeRegistry.hasTheme(themeId)) {
        // Register the theme with the ThemeRegistry
        this.themeRegistry.registerTheme(themeId, {
          name: theme.name,
          author: theme.author?.name || 'Unknown',
          version: theme.version || '1.0.0',
          cssFiles: theme.cssFiles || [],
          dependencies: theme.dependencies || []
        });
      }
    }
    
    return themeId;
  }
}

// Export the ThemeConnector class
export default ThemeConnector;
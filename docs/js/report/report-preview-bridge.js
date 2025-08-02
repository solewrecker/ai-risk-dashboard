/**
 * report-preview-bridge.js
 * 
 * This module provides a bridge between the old report preview system and the new theme inheritance model.
 * It handles the conversion of theme data from the old format to the new format and ensures compatibility
 * between the two systems during the migration phase.
 */

import ThemeRegistry from './themes/ThemeRegistry.js';
import ThemeLoader from './themes/ThemeLoader.js';

class ReportPreviewBridge {
  constructor() {
    this.themeRegistry = null;
    this.themeLoader = null;
  }
  
  /**
   * Initialize the bridge with the ThemeRegistry and ThemeLoader instances
   * @param {ThemeRegistry} themeRegistry - The ThemeRegistry instance
   * @param {ThemeLoader} themeLoader - The ThemeLoader instance
   */
  initialize(themeRegistry, themeLoader) {
    this.themeRegistry = themeRegistry;
    this.themeLoader = themeLoader;
  }
  
  /**
   * Process the report data from localStorage and convert theme data to the new format
   * @param {Object} reportData - The report data from localStorage
   * @returns {Object} The processed report data
   */
  processReportData(reportData) {
    if (!reportData) return null;
    
    // Extract theme data
    const { selectedTheme, themeData } = reportData;
    
    // If no theme data is available, use the selectedTheme as a fallback
    if (!themeData && selectedTheme) {
      reportData.themeData = { themeId: selectedTheme };
    }
    
    return reportData;
  }
  
  /**
   * Register the selected theme with the ThemeRegistry if it's not already registered
   * @param {string} themeId - The theme ID
   * @param {Object} themeData - Additional theme data
   * @returns {string} The registered theme ID
   */
  registerThemeIfNeeded(themeId, themeData = {}) {
    if (!this.themeRegistry) {
      console.error('ThemeRegistry is not initialized');
      return themeId;
    }
    
    // Check if the theme is already registered
    if (!this.themeRegistry.hasTheme(themeId)) {
      // Register the theme with basic configuration
      const themeConfig = {
        id: themeId,
        name: themeData.name || themeId,
        components: {
          base: `${themeId}-base`,
          layout: `${themeId}-layout`,
          colors: `${themeId}-colors`
        },
        // Add any additional configuration from themeData
        ...(themeData.config || {})
      };
      
      // Handle different parameter orders between systems
      if (this.themeRegistry && typeof this.themeRegistry.registerTheme === 'function') {
        console.log(`ReportPreviewBridge: Registering theme ${themeId} with ThemeRegistry`);
        this.themeRegistry.registerTheme(themeId, themeConfig);
      } else {
        console.log(`ReportPreviewBridge: No valid theme registry found for ${themeId}`);
        // Fallback - just log the theme config
        console.log('Theme config:', themeConfig);
      }
    }
    
    return themeId;
  }
  
  /**
   * Load the selected theme using the ThemeLoader
   * @param {string} themeId - The theme ID
   * @returns {Promise<void>}
   */
  async loadTheme(themeId) {
    if (!this.themeLoader) {
      console.error('ThemeLoader is not initialized');
      return;
    }
    
    try {
      await this.themeLoader.loadTheme(themeId);
    } catch (error) {
      console.error(`Failed to load theme ${themeId}:`, error);
      // Fall back to the default theme
      if (themeId !== 'theme-default') {
        await this.themeLoader.loadTheme('theme-default');
      }
    }
  }
}

export default ReportPreviewBridge;
/**
 * Theme Installer for the AI Tool Risk Framework Report System
 * Handles installation, activation, and management of themes
 */
export class ThemeInstaller {
  /**
   * Creates a new ThemeInstaller instance
   * @param {Object} themeRegistry - The theme registry to use
   * @param {ThemeValidator} themeValidator - The theme validator to use
   */
  constructor(themeRegistry, themeValidator) {
    this.themeRegistry = themeRegistry;
    this.themeValidator = themeValidator;
    this.installedThemes = new Map();
    this.storageKey = 'installed_themes';
    
    // Load installed themes from storage
    this.loadInstalledThemes();
  }
  
  /**
   * Loads installed themes from local storage
   * @private
   */
  loadInstalledThemes() {
    try {
      const storedThemes = localStorage.getItem(this.storageKey);
      
      if (storedThemes) {
        const themesData = JSON.parse(storedThemes);
        
        // Convert to Map
        Object.entries(themesData).forEach(([name, data]) => {
          this.installedThemes.set(name, {
            ...data,
            installDate: new Date(data.installDate)
          });
        });
      }
    } catch (error) {
      console.error('Failed to load installed themes:', error);
    }
  }
  
  /**
   * Saves installed themes to local storage
   * @private
   */
  saveInstalledThemes() {
    try {
      // Convert Map to object for storage
      const themesData = {};
      
      this.installedThemes.forEach((data, name) => {
        themesData[name] = { ...data };
      });
      
      localStorage.setItem(this.storageKey, JSON.stringify(themesData));
    } catch (error) {
      console.error('Failed to save installed themes:', error);
    }
  }
  
  /**
   * Installs a new theme from a package
   * @param {Object} themePackage - The theme package to install
   * @returns {Promise<Object>} - Installation results
   */
  async installTheme(themePackage) {
    // Validate the theme package
    const validationResults = this.themeValidator.validateTheme(themePackage);
    
    if (!validationResults.isValid) {
      return {
        success: false,
        message: 'Theme validation failed',
        errors: validationResults.errors
      };
    }
    
    try {
      // Extract theme metadata
      const { name, version, author } = themePackage.metadata;
      
      // Check for existing theme
      if (this.installedThemes.has(name)) {
        const existingTheme = this.installedThemes.get(name);
        
        // Version comparison logic
        if (this.compareVersions(existingTheme.version, version) >= 0) {
          return {
            success: false,
            message: `Theme ${name} v${existingTheme.version} is already installed and is newer or the same version`
          };
        }
      }
      
      // Install theme files
      await this.installThemeFiles(themePackage);
      
      // Register the theme
      this.registerTheme(themePackage);
      
      // Store installation info
      this.installedThemes.set(name, {
        name,
        version,
        author,
        installDate: new Date(),
        isActive: false
      });
      
      // Save to storage
      this.saveInstalledThemes();
      
      return {
        success: true,
        message: `Theme ${name} v${version} installed successfully`
      };
    } catch (error) {
      console.error('Theme installation failed:', error);
      return {
        success: false,
        message: `Installation failed: ${error.message}`
      };
    }
  }
  
  /**
   * Installs theme files to the appropriate locations
   * @param {Object} themePackage - The theme package
   * @returns {Promise<void>}
   * @private
   */
  async installThemeFiles(themePackage) {
    const { name } = themePackage.metadata;
    const themePath = `themes/${name}`;
    
    // Create theme directory if it doesn't exist
    await this.createDirectory(themePath);
    
    // Write theme files
    const filePromises = Object.entries(themePackage.files).map(([filename, content]) => {
      return this.writeFile(`${themePath}/${filename}`, content);
    });
    
    await Promise.all(filePromises);
  }
  
  /**
   * Creates a directory if it doesn't exist
   * @param {string} path - The directory path
   * @returns {Promise<void>}
   * @private
   */
  async createDirectory(path) {
    // In a browser environment, we can't create directories directly
    // This would be implemented differently in a Node.js environment
    console.log(`Creating directory: ${path} (simulated in browser environment)`);
    return Promise.resolve();
  }
  
  /**
   * Writes a file
   * @param {string} path - The file path
   * @param {string} content - The file content
   * @returns {Promise<void>}
   * @private
   */
  async writeFile(path, content) {
    // In a browser environment, we can't write files directly
    // This would be implemented differently in a Node.js environment
    console.log(`Writing file: ${path} (simulated in browser environment)`);
    
    // For demonstration, we'll store in localStorage
    try {
      localStorage.setItem(`theme_file_${path}`, content);
    } catch (error) {
      console.error(`Failed to write file ${path}:`, error);
    }
    
    return Promise.resolve();
  }
  
  /**
   * Registers a theme with the theme registry
   * @param {Object} themePackage - The theme package
   * @private
   */
  registerTheme(themePackage) {
    const { name, displayName, description } = themePackage.metadata;
    
    // Create theme paths
    const themePaths = {};
    Object.keys(themePackage.files).forEach(filename => {
      if (filename.endsWith('.css')) {
        themePaths[filename.replace('.css', '')] = `themes/${name}/${filename}`;
      }
    });
    
    // Register with theme registry
    const themeConfig = {
      id: name,
      name,
      displayName: displayName || name,
      description: description || '',
      paths: themePaths
    };
    
    // Handle different parameter orders between systems
    if (this.themeRegistry instanceof window.ScalableThemeSystem) {
      console.log(`ThemeInstaller: Registering theme ${name} with ScalableThemeSystem`);
      this.themeRegistry.registerTheme(name, themeConfig);
    } else {
      console.log(`ThemeInstaller: Registering theme ${name} with ThemeRegistry`);
      this.themeRegistry.registerTheme(name, themeConfig);
    }
  }
  
  /**
   * Activates an installed theme
   * @param {string} themeName - The name of the theme to activate
   * @returns {Promise<Object>} - Activation results
   */
  async activateTheme(themeName) {
    if (!this.installedThemes.has(themeName)) {
      return {
        success: false,
        message: `Theme ${themeName} is not installed`
      };
    }
    
    try {
      // Deactivate current theme
      const currentActive = Array.from(this.installedThemes.values())
        .find(theme => theme.isActive);
      
      if (currentActive) {
        currentActive.isActive = false;
      }
      
      // Activate new theme
      const theme = this.installedThemes.get(themeName);
      theme.isActive = true;
      
      // Save changes
      this.saveInstalledThemes();
      
      // Apply the theme
      await this.applyTheme(themeName);
      
      return {
        success: true,
        message: `Theme ${themeName} activated successfully`
      };
    } catch (error) {
      console.error('Theme activation failed:', error);
      return {
        success: false,
        message: `Activation failed: ${error.message}`
      };
    }
  }
  
  /**
   * Applies a theme to the current document
   * @param {string} themeName - The name of the theme to apply
   * @returns {Promise<void>}
   * @private
   */
  async applyTheme(themeName) {
    // Get theme from registry
    const theme = this.themeRegistry.getTheme(themeName);
    
    if (!theme) {
      throw new Error(`Theme ${themeName} not found in registry`);
    }
    
    // Apply theme using theme loader
    if (window.themeLoader) {
      await window.themeLoader.loadTheme(themeName);
    } else {
      // Fallback implementation
      this.applyThemeFallback(theme);
    }
  }
  
  /**
   * Fallback method to apply a theme without the theme loader
   * @param {Object} theme - The theme to apply
   * @private
   */
  applyThemeFallback(theme) {
    // Remove existing theme stylesheets
    const existingLinks = document.querySelectorAll('link[data-theme]');
    existingLinks.forEach(link => link.remove());
    
    // Add new theme stylesheets
    Object.entries(theme.paths).forEach(([id, path]) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      link.dataset.theme = theme.name;
      link.dataset.themeComponent = id;
      
      document.head.appendChild(link);
    });
    
    // Set theme attribute on body
    document.body.dataset.theme = theme.name;
    
    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme.name } }));
  }
  
  /**
   * Compares two version strings
   * @param {string} v1 - First version
   * @param {string} v2 - Second version
   * @returns {number} - -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
   * @private
   */
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }
  
  /**
   * Uninstalls a theme
   * @param {string} themeName - The name of the theme to uninstall
   * @returns {Promise<Object>} - Uninstallation results
   */
  async uninstallTheme(themeName) {
    if (!this.installedThemes.has(themeName)) {
      return {
        success: false,
        message: `Theme ${themeName} is not installed`
      };
    }
    
    try {
      const theme = this.installedThemes.get(themeName);
      
      // Check if theme is active
      if (theme.isActive) {
        return {
          success: false,
          message: `Cannot uninstall active theme ${themeName}. Please activate another theme first.`
        };
      }
      
      // Unregister from theme registry
      this.themeRegistry.unregisterTheme(themeName);
      
      // Remove theme files
      await this.removeThemeFiles(themeName);
      
      // Remove from installed themes
      this.installedThemes.delete(themeName);
      
      // Save changes
      this.saveInstalledThemes();
      
      return {
        success: true,
        message: `Theme ${themeName} uninstalled successfully`
      };
    } catch (error) {
      console.error('Theme uninstallation failed:', error);
      return {
        success: false,
        message: `Uninstallation failed: ${error.message}`
      };
    }
  }
  
  /**
   * Removes theme files
   * @param {string} themeName - The name of the theme
   * @returns {Promise<void>}
   * @private
   */
  async removeThemeFiles(themeName) {
    // In a browser environment, we can't remove files directly
    // This would be implemented differently in a Node.js environment
    console.log(`Removing theme files for ${themeName} (simulated in browser environment)`);
    
    // For demonstration, we'll remove from localStorage
    const prefix = `theme_file_themes/${themeName}/`;
    
    // Find all keys that start with the prefix
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove the keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return Promise.resolve();
  }
  
  /**
   * Gets a list of all installed themes
   * @returns {Array<Object>} - Array of installed theme objects
   */
  getInstalledThemes() {
    return Array.from(this.installedThemes.values());
  }
  
  /**
   * Gets the currently active theme
   * @returns {Object|null} - The active theme or null if no theme is active
   */
  getActiveTheme() {
    return this.getInstalledThemes().find(theme => theme.isActive) || null;
  }
}
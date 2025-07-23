/**
 * Theme Preloader for the AI Tool Risk Framework Report System
 * Handles preloading of theme CSS files for improved performance
 */
export class ThemePreloader {
  /**
   * Creates a new ThemePreloader instance
   * @param {ThemeRegistry} themeRegistry - The theme registry to use
   * @param {Array<string>} commonThemes - Array of common theme names to prefetch
   */
  constructor(themeRegistry, commonThemes = []) {
    this.themeRegistry = themeRegistry;
    this.commonThemes = commonThemes.length > 0 ? commonThemes : ['default', 'dark'];
    this.preloadedResources = new Set();
    
    // Initialize
    this.init();
  }
  
  /**
   * Initializes the theme preloader
   * @private
   */
  init() {
    // Preload the default theme
    const defaultTheme = this.themeRegistry.getDefaultTheme();
    
    if (defaultTheme) {
      this.preloadCriticalTheme(defaultTheme.name);
    }
    
    // Prefetch common themes
    this.prefetchCommonThemes();
  }
  
  /**
   * Adds preload hints for critical theme resources
   * @param {string} themeName - The primary theme to preload
   */
  preloadCriticalTheme(themeName) {
    // Check if theme exists
    if (!this.themeRegistry.hasTheme(themeName)) {
      console.warn(`Cannot preload theme ${themeName}: Theme not found`);
      return;
    }
    
    console.log(`Preloading critical theme: ${themeName}`);
    
    // Get theme
    const theme = this.themeRegistry.getTheme(themeName);
    
    if (!theme || !theme.paths) {
      console.warn(`Cannot preload theme ${themeName}: No paths defined`);
      return;
    }
    
    // Determine critical resources (typically variables, layout, and typography)
    const criticalComponents = ['variables', 'layout', 'typography'];
    const criticalResources = [];
    
    // Get paths for critical components
    criticalComponents.forEach(component => {
      if (theme.paths[component]) {
        criticalResources.push(theme.paths[component]);
      }
    });
    
    // Preload critical resources
    criticalResources.forEach(resource => {
      if (!this.preloadedResources.has(resource)) {
        this.addResourceHint(resource, 'preload');
        this.preloadedResources.add(resource);
      }
    });
    
    console.log(`Critical theme resources preloaded: ${themeName}`);
  }
  
  /**
   * Adds prefetch hints for commonly used themes
   */
  prefetchCommonThemes() {
    console.log(`Prefetching common themes: ${this.commonThemes.join(', ')}`);
    
    this.commonThemes.forEach(themeName => {
      // Skip if it's already the critical theme (which is preloaded)
      const defaultTheme = this.themeRegistry.getDefaultTheme();
      if (defaultTheme && defaultTheme.name === themeName) {
        return;
      }
      
      // Check if theme exists
      if (!this.themeRegistry.hasTheme(themeName)) {
        console.warn(`Cannot prefetch theme ${themeName}: Theme not found`);
        return;
      }
      
      // Get theme
      const theme = this.themeRegistry.getTheme(themeName);
      
      if (!theme || !theme.paths) {
        console.warn(`Cannot prefetch theme ${themeName}: No paths defined`);
        return;
      }
      
      // Determine resources to prefetch (typically just variables and layout)
      const prefetchComponents = ['variables', 'layout'];
      const resources = [];
      
      // Get paths for prefetch components
      prefetchComponents.forEach(component => {
        if (theme.paths[component]) {
          resources.push(theme.paths[component]);
        }
      });
      
      // Prefetch resources
      resources.forEach(resource => {
        if (!this.preloadedResources.has(resource)) {
          this.addResourceHint(resource, 'prefetch');
          this.preloadedResources.add(resource);
        }
      });
    });
    
    console.log('Common themes prefetched');
  }
  
  /**
   * Adds a resource hint to the document head
   * @param {string} url - The resource URL
   * @param {string} hintType - The type of hint (preload, prefetch)
   * @private
   */
  addResourceHint(url, hintType) {
    const link = document.createElement('link');
    link.rel = hintType;
    link.href = url;
    link.as = 'style';
    link.dataset.themePreloader = 'true';
    
    document.head.appendChild(link);
    console.log(`Added ${hintType} hint for: ${url}`);
  }
  
  /**
   * Preloads a specific theme
   * @param {string} themeName - The name of the theme to preload
   */
  preloadTheme(themeName) {
    // Check if theme exists
    if (!this.themeRegistry.hasTheme(themeName)) {
      console.warn(`Cannot preload theme ${themeName}: Theme not found`);
      return;
    }
    
    console.log(`Preloading theme: ${themeName}`);
    
    // Get theme
    const theme = this.themeRegistry.getTheme(themeName);
    
    if (!theme || !theme.paths) {
      console.warn(`Cannot preload theme ${themeName}: No paths defined`);
      return;
    }
    
    // Preload all theme resources
    Object.values(theme.paths).forEach(resource => {
      if (!this.preloadedResources.has(resource)) {
        this.addResourceHint(resource, 'preload');
        this.preloadedResources.add(resource);
      }
    });
    
    console.log(`Theme preloaded: ${themeName}`);
  }
  
  /**
   * Clears all resource hints added by the preloader
   */
  clearResourceHints() {
    const hints = document.querySelectorAll('link[data-theme-preloader="true"]');
    hints.forEach(hint => hint.remove());
    this.preloadedResources.clear();
    console.log('Cleared all theme resource hints');
  }
}
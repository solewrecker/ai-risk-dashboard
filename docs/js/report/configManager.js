/**
 * @class ConfigManager
 * @description Manages configuration settings for the report system across different environments
 */
class ConfigManager {
  /**
   * @constructor
   * @param {Object} options - Configuration options
   * @param {string} options.environment - Current environment (dev, staging, production)
   * @param {boolean} options.useLocalStorage - Whether to persist settings in localStorage
   * @param {Object} options.defaultConfig - Default configuration values
   */
  constructor(options = {}) {
    this.environment = options.environment || 'dev';
    this.useLocalStorage = options.useLocalStorage !== undefined ? options.useLocalStorage : true;
    this.storageKey = 'report_system_config';
    this.listeners = {};
    
    // Default configuration values
    this.defaultConfig = options.defaultConfig || {
      // System settings
      system: {
        debug: true,
        logLevel: 'info',
        cacheEnabled: true,
        cacheTTL: 3600, // seconds
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        apiTimeout: 30000, // 30 seconds
        maxRetries: 3,
        retryDelay: 1000, // 1 second
      },
      
      // Theme settings
      themes: {
        defaultTheme: 'corporate-blue',
        preloadThemes: true,
        themeTransitionDuration: 300, // milliseconds
        enableThemeCache: true,
        maxThemeSize: 2 * 1024 * 1024, // 2MB
        allowUserCustomThemes: true,
        validateThemes: true,
      },
      
      // Template settings
      templates: {
        defaultTemplate: 'executive-summary',
        enableTemplateCache: true,
        maxTemplateSize: 5 * 1024 * 1024, // 5MB
        allowUserCustomTemplates: true,
        validateTemplates: true,
      },
      
      // Export settings
      export: {
        defaultFormat: 'pdf',
        pdfResolution: 300, // DPI
        pdfPageSize: 'A4',
        pdfMargins: { top: 20, right: 20, bottom: 20, left: 20 },
        includeHeaderFooter: true,
        maxExportSize: 50 * 1024 * 1024, // 50MB
        compressionLevel: 0.8, // 0-1 scale
      },
      
      // Performance settings
      performance: {
        enableMonitoring: true,
        sampleRate: 0.1, // 10% of users
        reportMetrics: true,
        metricsEndpoint: '/api/metrics',
        maxResourceUsage: 0.8, // 80% of available resources
      },
      
      // Feature flags
      features: {
        enableMarketplace: true,
        enableVisualRegression: true,
        enableThemeComparison: true,
        enablePerformanceMonitoring: true,
        enableDeploymentPipeline: true,
        enableIntegrationService: true,
      },
      
      // API endpoints
      endpoints: {
        themes: '/api/themes',
        templates: '/api/templates',
        reports: '/api/reports',
        export: '/api/export',
        marketplace: '/api/marketplace',
        metrics: '/api/metrics',
      },
    };
    
    // Environment-specific overrides
    this.environmentConfig = {
      dev: {
        system: {
          debug: true,
          logLevel: 'debug',
          cacheEnabled: false,
        },
        endpoints: {
          themes: '/api/dev/themes',
          templates: '/api/dev/templates',
          reports: '/api/dev/reports',
          export: '/api/dev/export',
          marketplace: '/api/dev/marketplace',
          metrics: '/api/dev/metrics',
        },
      },
      staging: {
        system: {
          debug: true,
          logLevel: 'info',
          cacheEnabled: true,
        },
        endpoints: {
          themes: '/api/staging/themes',
          templates: '/api/staging/templates',
          reports: '/api/staging/reports',
          export: '/api/staging/export',
          marketplace: '/api/staging/marketplace',
          metrics: '/api/staging/metrics',
        },
      },
      production: {
        system: {
          debug: false,
          logLevel: 'warn',
          cacheEnabled: true,
        },
        performance: {
          sampleRate: 0.01, // 1% of users in production
        },
        endpoints: {
          themes: '/api/v1/themes',
          templates: '/api/v1/templates',
          reports: '/api/v1/reports',
          export: '/api/v1/export',
          marketplace: '/api/v1/marketplace',
          metrics: '/api/v1/metrics',
        },
      },
    };
    
    // User-specific overrides (loaded from localStorage if available)
    this.userConfig = {};
    
    // Initialize configuration
    this.initConfig();
  }
  
  /**
   * Initialize configuration by loading from localStorage if available
   * @private
   */
  initConfig() {
    if (this.useLocalStorage) {
      try {
        const storedConfig = localStorage.getItem(this.storageKey);
        if (storedConfig) {
          this.userConfig = JSON.parse(storedConfig);
        }
      } catch (error) {
        console.warn('Failed to load configuration from localStorage:', error);
        // Reset user config if there was an error
        this.userConfig = {};
      }
    }
    
    // Log the initialized configuration in dev environment
    if (this.environment === 'dev') {
      console.log('ConfigManager initialized with:', {
        environment: this.environment,
        config: this.getConfig(),
      });
    }
  }
  
  /**
   * Get the complete configuration with all overrides applied
   * @returns {Object} The complete configuration
   */
  getConfig() {
    // Start with default config
    const config = this._deepClone(this.defaultConfig);
    
    // Apply environment-specific overrides
    if (this.environmentConfig[this.environment]) {
      this._deepMerge(config, this.environmentConfig[this.environment]);
    }
    
    // Apply user-specific overrides
    this._deepMerge(config, this.userConfig);
    
    return config;
  }
  
  /**
   * Get a specific configuration value by path
   * @param {string} path - Dot-notation path to the configuration value
   * @param {*} defaultValue - Default value to return if path doesn't exist
   * @returns {*} The configuration value
   */
  get(path, defaultValue) {
    const config = this.getConfig();
    const parts = path.split('.');
    let current = config;
    
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[part];
    }
    
    return current !== undefined ? current : defaultValue;
  }
  
  /**
   * Set a specific configuration value by path
   * @param {string} path - Dot-notation path to the configuration value
   * @param {*} value - Value to set
   * @param {boolean} persist - Whether to persist the change to localStorage
   * @returns {boolean} True if the value was set successfully
   */
  set(path, value, persist = true) {
    const parts = path.split('.');
    let current = this.userConfig;
    
    // Navigate to the parent object of the property we want to set
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = {};
      } else if (typeof current[part] !== 'object') {
        // Can't set a property on a non-object
        return false;
      }
      current = current[part];
    }
    
    // Set the property
    const lastPart = parts[parts.length - 1];
    const oldValue = current[lastPart];
    current[lastPart] = value;
    
    // Persist to localStorage if requested
    if (persist && this.useLocalStorage) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.userConfig));
      } catch (error) {
        console.error('Failed to save configuration to localStorage:', error);
        return false;
      }
    }
    
    // Notify listeners
    this._notifyListeners(path, value, oldValue);
    
    return true;
  }
  
  /**
   * Reset a specific configuration path to its default value
   * @param {string} path - Dot-notation path to reset
   * @param {boolean} persist - Whether to persist the change to localStorage
   * @returns {boolean} True if the value was reset successfully
   */
  reset(path, persist = true) {
    const parts = path.split('.');
    let current = this.userConfig;
    
    // Navigate to the parent object of the property we want to reset
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        // Nothing to reset
        return true;
      }
      current = current[part];
    }
    
    // Reset the property by deleting it from userConfig
    const lastPart = parts[parts.length - 1];
    if (current[lastPart] === undefined) {
      // Nothing to reset
      return true;
    }
    
    const oldValue = current[lastPart];
    delete current[lastPart];
    
    // Clean up empty objects
    this._cleanupEmptyObjects(this.userConfig, parts.slice(0, -1));
    
    // Persist to localStorage if requested
    if (persist && this.useLocalStorage) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.userConfig));
      } catch (error) {
        console.error('Failed to save configuration to localStorage:', error);
        return false;
      }
    }
    
    // Get the default value to notify listeners
    const defaultValue = this.get(path);
    
    // Notify listeners
    this._notifyListeners(path, defaultValue, oldValue);
    
    return true;
  }
  
  /**
   * Reset all configuration to default values
   * @param {boolean} persist - Whether to persist the change to localStorage
   * @returns {boolean} True if the configuration was reset successfully
   */
  resetAll(persist = true) {
    const oldConfig = this.getConfig();
    this.userConfig = {};
    
    // Persist to localStorage if requested
    if (persist && this.useLocalStorage) {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        console.error('Failed to remove configuration from localStorage:', error);
        return false;
      }
    }
    
    // Notify listeners for all top-level keys
    const newConfig = this.getConfig();
    for (const key of Object.keys(newConfig)) {
      this._notifyListeners(key, newConfig[key], oldConfig[key]);
    }
    
    return true;
  }
  
  /**
   * Change the current environment
   * @param {string} environment - New environment (dev, staging, production)
   * @returns {boolean} True if the environment was changed successfully
   */
  setEnvironment(environment) {
    if (!this.environmentConfig[environment]) {
      console.error(`Invalid environment: ${environment}`);
      return false;
    }
    
    const oldConfig = this.getConfig();
    this.environment = environment;
    const newConfig = this.getConfig();
    
    // Notify listeners for all top-level keys
    for (const key of Object.keys(newConfig)) {
      if (JSON.stringify(newConfig[key]) !== JSON.stringify(oldConfig[key])) {
        this._notifyListeners(key, newConfig[key], oldConfig[key]);
      }
    }
    
    return true;
  }
  
  /**
   * Add a configuration change listener
   * @param {string} path - Dot-notation path to listen for changes
   * @param {Function} callback - Callback function(newValue, oldValue, path)
   * @returns {string} Listener ID for removing the listener
   */
  addListener(path, callback) {
    if (!this.listeners[path]) {
      this.listeners[path] = [];
    }
    
    const listenerId = `${path}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.listeners[path].push({
      id: listenerId,
      callback,
    });
    
    return listenerId;
  }
  
  /**
   * Remove a configuration change listener
   * @param {string} listenerId - Listener ID returned from addListener
   * @returns {boolean} True if the listener was removed successfully
   */
  removeListener(listenerId) {
    for (const path of Object.keys(this.listeners)) {
      const index = this.listeners[path].findIndex(listener => listener.id === listenerId);
      if (index !== -1) {
        this.listeners[path].splice(index, 1);
        if (this.listeners[path].length === 0) {
          delete this.listeners[path];
        }
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Export the current configuration as JSON
   * @returns {string} JSON string of the current configuration
   */
  exportConfig() {
    return JSON.stringify({
      environment: this.environment,
      userConfig: this.userConfig,
    }, null, 2);
  }
  
  /**
   * Import configuration from JSON
   * @param {string} json - JSON string of configuration to import
   * @param {boolean} persist - Whether to persist the imported configuration
   * @returns {boolean} True if the configuration was imported successfully
   */
  importConfig(json, persist = true) {
    try {
      const imported = JSON.parse(json);
      
      // Validate imported configuration
      if (!imported || typeof imported !== 'object') {
        throw new Error('Invalid configuration format');
      }
      
      const oldConfig = this.getConfig();
      
      // Update environment if specified
      if (imported.environment && this.environmentConfig[imported.environment]) {
        this.environment = imported.environment;
      }
      
      // Update user configuration if specified
      if (imported.userConfig && typeof imported.userConfig === 'object') {
        this.userConfig = this._deepClone(imported.userConfig);
      }
      
      // Persist to localStorage if requested
      if (persist && this.useLocalStorage) {
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.userConfig));
        } catch (error) {
          console.error('Failed to save imported configuration to localStorage:', error);
          return false;
        }
      }
      
      // Notify listeners for all top-level keys
      const newConfig = this.getConfig();
      for (const key of Object.keys(newConfig)) {
        if (JSON.stringify(newConfig[key]) !== JSON.stringify(oldConfig[key])) {
          this._notifyListeners(key, newConfig[key], oldConfig[key]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }
  
  /**
   * Create a configuration UI for the given container
   * @param {string} containerId - ID of the container element
   * @returns {Object} UI controller object
   */
  createConfigUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element not found: ${containerId}`);
    }
    
    const config = this.getConfig();
    
    // Create UI elements
    container.innerHTML = `
      <div class="config-manager">
        <div class="config-header">
          <h2>Configuration Manager</h2>
          <div class="environment-selector">
            <label for="environment-select">Environment:</label>
            <select id="environment-select">
              <option value="dev" ${this.environment === 'dev' ? 'selected' : ''}>Development</option>
              <option value="staging" ${this.environment === 'staging' ? 'selected' : ''}>Staging</option>
              <option value="production" ${this.environment === 'production' ? 'selected' : ''}>Production</option>
            </select>
          </div>
        </div>
        
        <div class="config-tabs">
          <button class="tab-button active" data-tab="system">System</button>
          <button class="tab-button" data-tab="themes">Themes</button>
          <button class="tab-button" data-tab="templates">Templates</button>
          <button class="tab-button" data-tab="export">Export</button>
          <button class="tab-button" data-tab="performance">Performance</button>
          <button class="tab-button" data-tab="features">Features</button>
          <button class="tab-button" data-tab="endpoints">Endpoints</button>
        </div>
        
        <div class="config-content">
          <div class="tab-content active" id="system-tab">
            <h3>System Settings</h3>
            <div class="config-group">
              <div class="config-item">
                <label for="system-debug">Debug Mode</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="system-debug" ${config.system.debug ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="system-log-level">Log Level</label>
                <select id="system-log-level">
                  <option value="debug" ${config.system.logLevel === 'debug' ? 'selected' : ''}>Debug</option>
                  <option value="info" ${config.system.logLevel === 'info' ? 'selected' : ''}>Info</option>
                  <option value="warn" ${config.system.logLevel === 'warn' ? 'selected' : ''}>Warning</option>
                  <option value="error" ${config.system.logLevel === 'error' ? 'selected' : ''}>Error</option>
                </select>
              </div>
              
              <div class="config-item">
                <label for="system-cache-enabled">Cache Enabled</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="system-cache-enabled" ${config.system.cacheEnabled ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="system-cache-ttl">Cache TTL (seconds)</label>
                <input type="number" id="system-cache-ttl" value="${config.system.cacheTTL}" min="0" step="60">
              </div>
              
              <div class="config-item">
                <label for="system-max-cache-size">Max Cache Size (MB)</label>
                <input type="number" id="system-max-cache-size" value="${config.system.maxCacheSize / (1024 * 1024)}" min="1" step="1">
              </div>
              
              <div class="config-item">
                <label for="system-api-timeout">API Timeout (ms)</label>
                <input type="number" id="system-api-timeout" value="${config.system.apiTimeout}" min="1000" step="1000">
              </div>
              
              <div class="config-item">
                <label for="system-max-retries">Max Retries</label>
                <input type="number" id="system-max-retries" value="${config.system.maxRetries}" min="0" step="1">
              </div>
              
              <div class="config-item">
                <label for="system-retry-delay">Retry Delay (ms)</label>
                <input type="number" id="system-retry-delay" value="${config.system.retryDelay}" min="100" step="100">
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="themes-tab">
            <h3>Theme Settings</h3>
            <div class="config-group">
              <div class="config-item">
                <label for="themes-default-theme">Default Theme</label>
                <input type="text" id="themes-default-theme" value="${config.themes.defaultTheme}">
              </div>
              
              <div class="config-item">
                <label for="themes-preload-themes">Preload Themes</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="themes-preload-themes" ${config.themes.preloadThemes ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="themes-transition-duration">Transition Duration (ms)</label>
                <input type="number" id="themes-transition-duration" value="${config.themes.themeTransitionDuration}" min="0" step="50">
              </div>
              
              <div class="config-item">
                <label for="themes-enable-cache">Enable Theme Cache</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="themes-enable-cache" ${config.themes.enableThemeCache ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="themes-max-size">Max Theme Size (MB)</label>
                <input type="number" id="themes-max-size" value="${config.themes.maxThemeSize / (1024 * 1024)}" min="0.1" step="0.1">
              </div>
              
              <div class="config-item">
                <label for="themes-allow-custom">Allow User Custom Themes</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="themes-allow-custom" ${config.themes.allowUserCustomThemes ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="themes-validate">Validate Themes</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="themes-validate" ${config.themes.validateThemes ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="templates-tab">
            <h3>Template Settings</h3>
            <div class="config-group">
              <div class="config-item">
                <label for="templates-default-template">Default Template</label>
                <input type="text" id="templates-default-template" value="${config.templates.defaultTemplate}">
              </div>
              
              <div class="config-item">
                <label for="templates-enable-cache">Enable Template Cache</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="templates-enable-cache" ${config.templates.enableTemplateCache ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="templates-max-size">Max Template Size (MB)</label>
                <input type="number" id="templates-max-size" value="${config.templates.maxTemplateSize / (1024 * 1024)}" min="0.1" step="0.1">
              </div>
              
              <div class="config-item">
                <label for="templates-allow-custom">Allow User Custom Templates</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="templates-allow-custom" ${config.templates.allowUserCustomTemplates ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="templates-validate">Validate Templates</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="templates-validate" ${config.templates.validateTemplates ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="export-tab">
            <h3>Export Settings</h3>
            <div class="config-group">
              <div class="config-item">
                <label for="export-default-format">Default Format</label>
                <select id="export-default-format">
                  <option value="pdf" ${config.export.defaultFormat === 'pdf' ? 'selected' : ''}>PDF</option>
                  <option value="png" ${config.export.defaultFormat === 'png' ? 'selected' : ''}>PNG</option>
                  <option value="jpg" ${config.export.defaultFormat === 'jpg' ? 'selected' : ''}>JPG</option>
                  <option value="html" ${config.export.defaultFormat === 'html' ? 'selected' : ''}>HTML</option>
                </select>
              </div>
              
              <div class="config-item">
                <label for="export-pdf-resolution">PDF Resolution (DPI)</label>
                <input type="number" id="export-pdf-resolution" value="${config.export.pdfResolution}" min="72" step="1">
              </div>
              
              <div class="config-item">
                <label for="export-pdf-page-size">PDF Page Size</label>
                <select id="export-pdf-page-size">
                  <option value="A4" ${config.export.pdfPageSize === 'A4' ? 'selected' : ''}>A4</option>
                  <option value="Letter" ${config.export.pdfPageSize === 'Letter' ? 'selected' : ''}>Letter</option>
                  <option value="Legal" ${config.export.pdfPageSize === 'Legal' ? 'selected' : ''}>Legal</option>
                  <option value="Tabloid" ${config.export.pdfPageSize === 'Tabloid' ? 'selected' : ''}>Tabloid</option>
                </select>
              </div>
              
              <div class="config-item">
                <label for="export-include-header-footer">Include Header/Footer</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="export-include-header-footer" ${config.export.includeHeaderFooter ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="export-max-size">Max Export Size (MB)</label>
                <input type="number" id="export-max-size" value="${config.export.maxExportSize / (1024 * 1024)}" min="1" step="1">
              </div>
              
              <div class="config-item">
                <label for="export-compression-level">Compression Level (0-1)</label>
                <input type="range" id="export-compression-level" value="${config.export.compressionLevel}" min="0" max="1" step="0.1">
                <span id="export-compression-level-value">${config.export.compressionLevel}</span>
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="performance-tab">
            <h3>Performance Settings</h3>
            <div class="config-group">
              <div class="config-item">
                <label for="performance-enable-monitoring">Enable Monitoring</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="performance-enable-monitoring" ${config.performance.enableMonitoring ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="performance-sample-rate">Sample Rate (0-1)</label>
                <input type="range" id="performance-sample-rate" value="${config.performance.sampleRate}" min="0" max="1" step="0.01">
                <span id="performance-sample-rate-value">${config.performance.sampleRate}</span>
              </div>
              
              <div class="config-item">
                <label for="performance-report-metrics">Report Metrics</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="performance-report-metrics" ${config.performance.reportMetrics ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="performance-metrics-endpoint">Metrics Endpoint</label>
                <input type="text" id="performance-metrics-endpoint" value="${config.performance.metricsEndpoint}">
              </div>
              
              <div class="config-item">
                <label for="performance-max-resource-usage">Max Resource Usage (0-1)</label>
                <input type="range" id="performance-max-resource-usage" value="${config.performance.maxResourceUsage}" min="0.1" max="1" step="0.1">
                <span id="performance-max-resource-usage-value">${config.performance.maxResourceUsage}</span>
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="features-tab">
            <h3>Feature Flags</h3>
            <div class="config-group">
              <div class="config-item">
                <label for="features-enable-marketplace">Enable Marketplace</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="features-enable-marketplace" ${config.features.enableMarketplace ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="features-enable-visual-regression">Enable Visual Regression</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="features-enable-visual-regression" ${config.features.enableVisualRegression ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="features-enable-theme-comparison">Enable Theme Comparison</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="features-enable-theme-comparison" ${config.features.enableThemeComparison ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="features-enable-performance-monitoring">Enable Performance Monitoring</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="features-enable-performance-monitoring" ${config.features.enablePerformanceMonitoring ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="features-enable-deployment-pipeline">Enable Deployment Pipeline</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="features-enable-deployment-pipeline" ${config.features.enableDeploymentPipeline ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
              
              <div class="config-item">
                <label for="features-enable-integration-service">Enable Integration Service</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="features-enable-integration-service" ${config.features.enableIntegrationService ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="endpoints-tab">
            <h3>API Endpoints</h3>
            <div class="config-group">
              <div class="config-item">
                <label for="endpoints-themes">Themes Endpoint</label>
                <input type="text" id="endpoints-themes" value="${config.endpoints.themes}">
              </div>
              
              <div class="config-item">
                <label for="endpoints-templates">Templates Endpoint</label>
                <input type="text" id="endpoints-templates" value="${config.endpoints.templates}">
              </div>
              
              <div class="config-item">
                <label for="endpoints-reports">Reports Endpoint</label>
                <input type="text" id="endpoints-reports" value="${config.endpoints.reports}">
              </div>
              
              <div class="config-item">
                <label for="endpoints-export">Export Endpoint</label>
                <input type="text" id="endpoints-export" value="${config.endpoints.export}">
              </div>
              
              <div class="config-item">
                <label for="endpoints-marketplace">Marketplace Endpoint</label>
                <input type="text" id="endpoints-marketplace" value="${config.endpoints.marketplace}">
              </div>
              
              <div class="config-item">
                <label for="endpoints-metrics">Metrics Endpoint</label>
                <input type="text" id="endpoints-metrics" value="${config.endpoints.metrics}">
              </div>
            </div>
          </div>
        </div>
        
        <div class="config-actions">
          <button id="save-config" class="primary-button">Save Changes</button>
          <button id="reset-config" class="secondary-button">Reset to Defaults</button>
          <button id="export-config" class="secondary-button">Export Config</button>
          <button id="import-config" class="secondary-button">Import Config</button>
        </div>
      </div>
      
      <style>
        .config-manager {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .config-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #dee2e6;
        }
        
        .config-header h2 {
          margin: 0;
          color: #0066cc;
          font-size: 1.5rem;
        }
        
        .environment-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .environment-selector select {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background-color: white;
          font-size: 0.9rem;
        }
        
        .config-tabs {
          display: flex;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 20px;
          overflow-x: auto;
        }
        
        .tab-button {
          padding: 10px 15px;
          background-color: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: #495057;
          transition: all 0.2s;
        }
        
        .tab-button:hover {
          color: #0066cc;
        }
        
        .tab-button.active {
          color: #0066cc;
          border-bottom-color: #0066cc;
        }
        
        .config-content {
          margin-bottom: 20px;
        }
        
        .tab-content {
          display: none;
        }
        
        .tab-content.active {
          display: block;
        }
        
        .tab-content h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #495057;
          font-size: 1.2rem;
        }
        
        .config-group {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }
        
        .config-item {
          margin-bottom: 10px;
        }
        
        .config-item label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          font-size: 0.9rem;
        }
        
        .config-item input[type="text"],
        .config-item input[type="number"],
        .config-item select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .config-item input[type="range"] {
          width: calc(100% - 40px);
          margin-right: 10px;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #0066cc;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }
        
        .config-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
        
        .primary-button {
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 15px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .primary-button:hover {
          background-color: #0056b3;
        }
        
        .secondary-button {
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 15px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .secondary-button:hover {
          background-color: #5a6268;
        }
        
        @media (max-width: 768px) {
          .config-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .config-group {
            grid-template-columns: 1fr;
          }
          
          .config-actions {
            flex-wrap: wrap;
          }
        }
      </style>
    `;
    
    // Add event listeners for tabs
    const tabButtons = container.querySelectorAll('.tab-button');
    const tabContents = container.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Deactivate all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activate clicked tab
        button.classList.add('active');
        const tabId = `${button.dataset.tab}-tab`;
        document.getElementById(tabId).classList.add('active');
      });
    });
    
    // Add event listeners for range inputs
    const rangeInputs = container.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
      const valueDisplay = document.getElementById(`${input.id}-value`);
      if (valueDisplay) {
        input.addEventListener('input', () => {
          valueDisplay.textContent = input.value;
        });
      }
    });
    
    // Save button click handler
    const saveButton = document.getElementById('save-config');
    saveButton.addEventListener('click', () => {
      // System settings
      this.set('system.debug', document.getElementById('system-debug').checked);
      this.set('system.logLevel', document.getElementById('system-log-level').value);
      this.set('system.cacheEnabled', document.getElementById('system-cache-enabled').checked);
      this.set('system.cacheTTL', parseInt(document.getElementById('system-cache-ttl').value));
      this.set('system.maxCacheSize', parseInt(document.getElementById('system-max-cache-size').value) * 1024 * 1024);
      this.set('system.apiTimeout', parseInt(document.getElementById('system-api-timeout').value));
      this.set('system.maxRetries', parseInt(document.getElementById('system-max-retries').value));
      this.set('system.retryDelay', parseInt(document.getElementById('system-retry-delay').value));
      
      // Theme settings
      this.set('themes.defaultTheme', document.getElementById('themes-default-theme').value);
      this.set('themes.preloadThemes', document.getElementById('themes-preload-themes').checked);
      this.set('themes.themeTransitionDuration', parseInt(document.getElementById('themes-transition-duration').value));
      this.set('themes.enableThemeCache', document.getElementById('themes-enable-cache').checked);
      this.set('themes.maxThemeSize', parseFloat(document.getElementById('themes-max-size').value) * 1024 * 1024);
      this.set('themes.allowUserCustomThemes', document.getElementById('themes-allow-custom').checked);
      this.set('themes.validateThemes', document.getElementById('themes-validate').checked);
      
      // Template settings
      this.set('templates.defaultTemplate', document.getElementById('templates-default-template').value);
      this.set('templates.enableTemplateCache', document.getElementById('templates-enable-cache').checked);
      this.set('templates.maxTemplateSize', parseFloat(document.getElementById('templates-max-size').value) * 1024 * 1024);
      this.set('templates.allowUserCustomTemplates', document.getElementById('templates-allow-custom').checked);
      this.set('templates.validateTemplates', document.getElementById('templates-validate').checked);
      
      // Export settings
      this.set('export.defaultFormat', document.getElementById('export-default-format').value);
      this.set('export.pdfResolution', parseInt(document.getElementById('export-pdf-resolution').value));
      this.set('export.pdfPageSize', document.getElementById('export-pdf-page-size').value);
      this.set('export.includeHeaderFooter', document.getElementById('export-include-header-footer').checked);
      this.set('export.maxExportSize', parseInt(document.getElementById('export-max-size').value) * 1024 * 1024);
      this.set('export.compressionLevel', parseFloat(document.getElementById('export-compression-level').value));
      
      // Performance settings
      this.set('performance.enableMonitoring', document.getElementById('performance-enable-monitoring').checked);
      this.set('performance.sampleRate', parseFloat(document.getElementById('performance-sample-rate').value));
      this.set('performance.reportMetrics', document.getElementById('performance-report-metrics').checked);
      this.set('performance.metricsEndpoint', document.getElementById('performance-metrics-endpoint').value);
      this.set('performance.maxResourceUsage', parseFloat(document.getElementById('performance-max-resource-usage').value));
      
      // Feature flags
      this.set('features.enableMarketplace', document.getElementById('features-enable-marketplace').checked);
      this.set('features.enableVisualRegression', document.getElementById('features-enable-visual-regression').checked);
      this.set('features.enableThemeComparison', document.getElementById('features-enable-theme-comparison').checked);
      this.set('features.enablePerformanceMonitoring', document.getElementById('features-enable-performance-monitoring').checked);
      this.set('features.enableDeploymentPipeline', document.getElementById('features-enable-deployment-pipeline').checked);
      this.set('features.enableIntegrationService', document.getElementById('features-enable-integration-service').checked);
      
      // API endpoints
      this.set('endpoints.themes', document.getElementById('endpoints-themes').value);
      this.set('endpoints.templates', document.getElementById('endpoints-templates').value);
      this.set('endpoints.reports', document.getElementById('endpoints-reports').value);
      this.set('endpoints.export', document.getElementById('endpoints-export').value);
      this.set('endpoints.marketplace', document.getElementById('endpoints-marketplace').value);
      this.set('endpoints.metrics', document.getElementById('endpoints-metrics').value);
      
      alert('Configuration saved successfully!');
    });
    
    // Reset button click handler
    const resetButton = document.getElementById('reset-config');
    resetButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all configuration to default values?')) {
        this.resetAll();
        // Reload the UI
        this.createConfigUI(containerId);
      }
    });
    
    // Export button click handler
    const exportButton = document.getElementById('export-config');
    exportButton.addEventListener('click', () => {
      const configJson = this.exportConfig();
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-system-config-${this.environment}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    
    // Import button click handler
    const importButton = document.getElementById('import-config');
    importButton.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      
      input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const contents = e.target.result;
            if (this.importConfig(contents)) {
              alert('Configuration imported successfully!');
              // Reload the UI
              this.createConfigUI(containerId);
            } else {
              alert('Failed to import configuration. Please check the file format.');
            }
          };
          reader.readAsText(file);
        }
      });
      
      input.click();
    });
    
    // Environment select change handler
    const environmentSelect = document.getElementById('environment-select');
    environmentSelect.addEventListener('change', () => {
      if (confirm(`Are you sure you want to switch to ${environmentSelect.options[environmentSelect.selectedIndex].text} environment?`)) {
        this.setEnvironment(environmentSelect.value);
        // Reload the UI
        this.createConfigUI(containerId);
      } else {
        // Reset to current environment
        environmentSelect.value = this.environment;
      }
    });
    
    return {
      refresh: () => this.createConfigUI(containerId),
      setEnvironment: (env) => {
        this.setEnvironment(env);
        this.createConfigUI(containerId);
      },
      resetAll: () => {
        this.resetAll();
        this.createConfigUI(containerId);
      }
    };
  }
  
  /**
   * Notify listeners of a configuration change
   * @param {string} path - Path that changed
   * @param {*} newValue - New value
   * @param {*} oldValue - Old value
   * @private
   */
  _notifyListeners(path, newValue, oldValue) {
    // Notify exact path listeners
    if (this.listeners[path]) {
      for (const listener of this.listeners[path]) {
        listener.callback(newValue, oldValue, path);
      }
    }
    
    // Notify parent path listeners
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      if (this.listeners[parentPath]) {
        const parentNewValue = this.get(parentPath);
        const parentOldValue = this._getValueFromPath(this._getOldConfig(), parentPath);
        
        for (const listener of this.listeners[parentPath]) {
          listener.callback(parentNewValue, parentOldValue, parentPath);
        }
      }
    }
    
    // Notify root listeners
    if (this.listeners['*']) {
      for (const listener of this.listeners['*']) {
        listener.callback(newValue, oldValue, path);
      }
    }
  }
  
  /**
   * Get the old configuration (before the last change)
   * @returns {Object} The old configuration
   * @private
   */
  _getOldConfig() {
    // This is a simplified implementation that doesn't actually track the old config
    // In a real implementation, you would keep a history of changes
    return this.getConfig();
  }
  
  /**
   * Get a value from a path in an object
   * @param {Object} obj - Object to get value from
   * @param {string} path - Dot-notation path
   * @returns {*} The value at the path
   * @private
   */
  _getValueFromPath(obj, path) {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }
  
  /**
   * Clean up empty objects in the user config
   * @param {Object} obj - Object to clean up
   * @param {Array} pathParts - Path parts to the current object
   * @private
   */
  _cleanupEmptyObjects(obj, pathParts) {
    if (pathParts.length === 0) {
      return;
    }
    
    let current = obj;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
      if (!current) {
        return;
      }
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    if (current[lastPart] && Object.keys(current[lastPart]).length === 0) {
      delete current[lastPart];
      this._cleanupEmptyObjects(obj, pathParts.slice(0, -1));
    }
  }
  
  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   * @private
   */
  _deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  /**
   * Deep merge two objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   * @private
   */
  _deepMerge(target, source) {
    if (!source) {
      return target;
    }
    
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && key in target) {
        this._deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    
    return target;
  }
}

// Export the ConfigManager class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigManager;
} else if (typeof window !== 'undefined') {
  window.ConfigManager = ConfigManager;
}
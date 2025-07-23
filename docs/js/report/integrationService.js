/**
 * @class IntegrationService
 * @description Service responsible for integrating the report system with the main application
 * Handles communication between the report system and the main application components
 */
class IntegrationService {
  /**
   * @constructor
   * @param {Object} options - Configuration options
   * @param {Object} options.themeRegistry - The theme registry instance
   * @param {Object} options.reportDataAdapter - The report data adapter instance
   * @param {Object} options.templateRegistry - The template registry instance
   * @param {Object} options.logger - Logger instance for tracking integration events
   */
  constructor(options = {}) {
    this.themeRegistry = options.themeRegistry || null;
    this.reportDataAdapter = options.reportDataAdapter || null;
    this.templateRegistry = options.templateRegistry || null;
    this.logger = options.logger || console;
    this.eventHandlers = {};
    this.isInitialized = false;
    this.integrationPoints = [];
    this.compatibilityMode = options.compatibilityMode || false;
    this.apiVersion = '1.0.0';
    
    // Integration status tracking
    this.status = {
      connected: false,
      lastSyncTime: null,
      errors: [],
      warnings: [],
      pendingOperations: 0
    };
  }

  /**
   * Initialize the integration service
   * @param {Object} config - Additional configuration options
   * @returns {Promise<boolean>} - Promise resolving to true if initialization was successful
   */
  async initialize(config = {}) {
    if (this.isInitialized) {
      this.logger.warn('IntegrationService already initialized');
      return true;
    }

    try {
      this.logger.info('Initializing IntegrationService...');
      
      // Validate dependencies
      if (!this.themeRegistry) {
        throw new Error('ThemeRegistry is required for integration');
      }
      
      if (!this.reportDataAdapter) {
        throw new Error('ReportDataAdapter is required for integration');
      }
      
      // Register event listeners
      this._registerEventListeners();
      
      // Discover integration points
      await this._discoverIntegrationPoints();
      
      // Initialize compatibility layer if needed
      if (this.compatibilityMode) {
        await this._initializeCompatibilityLayer();
      }
      
      // Connect to main application
      await this._connectToMainApplication(config);
      
      this.isInitialized = true;
      this.status.connected = true;
      this.status.lastSyncTime = new Date();
      
      this.logger.info('IntegrationService initialized successfully');
      this._triggerEvent('initialized', { success: true });
      
      return true;
    } catch (error) {
      this.status.errors.push({
        timestamp: new Date(),
        message: error.message,
        stack: error.stack
      });
      
      this.logger.error('Failed to initialize IntegrationService:', error);
      this._triggerEvent('error', { error, phase: 'initialization' });
      
      return false;
    }
  }

  /**
   * Register an integration point
   * @param {string} name - Name of the integration point
   * @param {Object} options - Integration point options
   * @param {Function} handler - Handler function for the integration point
   * @returns {string} - ID of the registered integration point
   */
  registerIntegrationPoint(name, options, handler) {
    const id = `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.integrationPoints.push({
      id,
      name,
      options,
      handler,
      active: true,
      registeredAt: new Date()
    });
    
    this.logger.info(`Registered integration point: ${name}`);
    this._triggerEvent('integrationPointRegistered', { id, name, options });
    
    return id;
  }

  /**
   * Unregister an integration point
   * @param {string} id - ID of the integration point to unregister
   * @returns {boolean} - True if the integration point was unregistered
   */
  unregisterIntegrationPoint(id) {
    const index = this.integrationPoints.findIndex(point => point.id === id);
    
    if (index === -1) {
      this.logger.warn(`Integration point with ID ${id} not found`);
      return false;
    }
    
    const point = this.integrationPoints[index];
    this.integrationPoints.splice(index, 1);
    
    this.logger.info(`Unregistered integration point: ${point.name}`);
    this._triggerEvent('integrationPointUnregistered', { id, name: point.name });
    
    return true;
  }

  /**
   * Synchronize report system data with the main application
   * @param {Object} options - Sync options
   * @param {boolean} options.force - Force synchronization even if not needed
   * @param {Array<string>} options.components - Specific components to synchronize
   * @returns {Promise<Object>} - Sync results
   */
  async synchronize(options = {}) {
    if (!this.isInitialized) {
      throw new Error('IntegrationService must be initialized before synchronization');
    }
    
    this.status.pendingOperations++;
    this._triggerEvent('syncStarted', options);
    
    try {
      this.logger.info('Starting synchronization with main application...');
      
      const results = {
        themes: await this._synchronizeThemes(options),
        templates: await this._synchronizeTemplates(options),
        data: await this._synchronizeData(options),
        timestamp: new Date()
      };
      
      this.status.lastSyncTime = results.timestamp;
      this.status.pendingOperations--;
      
      this.logger.info('Synchronization completed successfully');
      this._triggerEvent('syncCompleted', results);
      
      return results;
    } catch (error) {
      this.status.errors.push({
        timestamp: new Date(),
        message: error.message,
        stack: error.stack
      });
      
      this.status.pendingOperations--;
      
      this.logger.error('Synchronization failed:', error);
      this._triggerEvent('error', { error, phase: 'synchronization' });
      
      throw error;
    }
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @returns {string} - Handler ID
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    
    const id = `handler-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.eventHandlers[event].push({
      id,
      handler
    });
    
    return id;
  }

  /**
   * Remove an event handler
   * @param {string} event - Event name
   * @param {string} id - Handler ID
   * @returns {boolean} - True if the handler was removed
   */
  off(event, id) {
    if (!this.eventHandlers[event]) {
      return false;
    }
    
    const index = this.eventHandlers[event].findIndex(h => h.id === id);
    
    if (index === -1) {
      return false;
    }
    
    this.eventHandlers[event].splice(index, 1);
    return true;
  }

  /**
   * Get the current integration status
   * @returns {Object} - Current status
   */
  getStatus() {
    return { ...this.status };
  }

  /**
   * Get all registered integration points
   * @returns {Array<Object>} - Array of integration points
   */
  getIntegrationPoints() {
    return [...this.integrationPoints];
  }

  /**
   * Execute an action on the main application
   * @param {string} action - Action name
   * @param {Object} params - Action parameters
   * @returns {Promise<any>} - Action result
   */
  async executeAction(action, params = {}) {
    if (!this.isInitialized) {
      throw new Error('IntegrationService must be initialized before executing actions');
    }
    
    this.logger.info(`Executing action: ${action}`);
    this.status.pendingOperations++;
    
    try {
      // Find integration point that can handle this action
      const integrationPoint = this.integrationPoints.find(point => 
        point.active && point.options.actions && point.options.actions.includes(action)
      );
      
      if (!integrationPoint) {
        throw new Error(`No integration point found for action: ${action}`);
      }
      
      const result = await integrationPoint.handler(action, params);
      
      this.status.pendingOperations--;
      this._triggerEvent('actionExecuted', { action, params, success: true });
      
      return result;
    } catch (error) {
      this.status.pendingOperations--;
      this.status.errors.push({
        timestamp: new Date(),
        message: error.message,
        stack: error.stack,
        context: { action, params }
      });
      
      this.logger.error(`Action execution failed: ${action}`, error);
      this._triggerEvent('error', { error, phase: 'action', action, params });
      
      throw error;
    }
  }

  /**
   * Create a UI integration component
   * @param {string} type - Component type
   * @param {Object} options - Component options
   * @returns {HTMLElement} - The created UI component
   */
  createUIComponent(type, options = {}) {
    this.logger.info(`Creating UI component: ${type}`);
    
    // Basic component factory
    const component = document.createElement('div');
    component.className = `report-system-integration ${type}`;
    
    switch (type) {
      case 'theme-selector':
        this._createThemeSelectorComponent(component, options);
        break;
      case 'template-selector':
        this._createTemplateSelectorComponent(component, options);
        break;
      case 'report-preview':
        this._createReportPreviewComponent(component, options);
        break;
      case 'integration-status':
        this._createStatusComponent(component, options);
        break;
      default:
        component.textContent = `Unknown component type: ${type}`;
        this.logger.warn(`Unknown UI component type: ${type}`);
    }
    
    this._triggerEvent('uiComponentCreated', { type, options, component });
    
    return component;
  }

  /**
   * Disconnect from the main application
   * @returns {Promise<boolean>} - True if disconnected successfully
   */
  async disconnect() {
    if (!this.isInitialized) {
      this.logger.warn('IntegrationService not initialized, nothing to disconnect');
      return true;
    }
    
    try {
      this.logger.info('Disconnecting from main application...');
      
      // Clean up event listeners
      this._unregisterEventListeners();
      
      // Deactivate all integration points
      this.integrationPoints.forEach(point => {
        point.active = false;
      });
      
      this.isInitialized = false;
      this.status.connected = false;
      
      this._triggerEvent('disconnected', {});
      
      return true;
    } catch (error) {
      this.status.errors.push({
        timestamp: new Date(),
        message: error.message,
        stack: error.stack
      });
      
      this.logger.error('Failed to disconnect:', error);
      this._triggerEvent('error', { error, phase: 'disconnection' });
      
      return false;
    }
  }

  // Private methods

  /**
   * Register event listeners for integration
   * @private
   */
  _registerEventListeners() {
    // Listen for theme changes
    if (this.themeRegistry) {
      this._themeChangedHandler = (event) => {
        this._triggerEvent('themeChanged', event);
      };
      
      // Assuming themeRegistry has an addEventListener method
      this.themeRegistry.addEventListener('themeChanged', this._themeChangedHandler);
    }
    
    // Listen for template changes
    if (this.templateRegistry) {
      this._templateChangedHandler = (event) => {
        this._triggerEvent('templateChanged', event);
      };
      
      // Assuming templateRegistry has an addEventListener method
      this.templateRegistry.addEventListener('templateChanged', this._templateChangedHandler);
    }
    
    // Listen for data changes
    if (this.reportDataAdapter) {
      this._dataChangedHandler = (event) => {
        this._triggerEvent('dataChanged', event);
      };
      
      // Assuming reportDataAdapter has an addEventListener method
      this.reportDataAdapter.addEventListener('dataChanged', this._dataChangedHandler);
    }
  }

  /**
   * Unregister event listeners
   * @private
   */
  _unregisterEventListeners() {
    if (this.themeRegistry && this._themeChangedHandler) {
      this.themeRegistry.removeEventListener('themeChanged', this._themeChangedHandler);
    }
    
    if (this.templateRegistry && this._templateChangedHandler) {
      this.templateRegistry.removeEventListener('templateChanged', this._templateChangedHandler);
    }
    
    if (this.reportDataAdapter && this._dataChangedHandler) {
      this.reportDataAdapter.removeEventListener('dataChanged', this._dataChangedHandler);
    }
  }

  /**
   * Trigger an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @private
   */
  _triggerEvent(event, data) {
    if (!this.eventHandlers[event]) {
      return;
    }
    
    const eventData = {
      ...data,
      timestamp: new Date(),
      source: 'IntegrationService'
    };
    
    this.eventHandlers[event].forEach(handler => {
      try {
        handler.handler(eventData);
      } catch (error) {
        this.logger.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Discover integration points in the main application
   * @returns {Promise<Array>} - Discovered integration points
   * @private
   */
  async _discoverIntegrationPoints() {
    // This is a simulation for the demo
    // In a real implementation, this would communicate with the main application
    
    this.logger.info('Discovering integration points...');
    
    // Simulate async discovery
    return new Promise(resolve => {
      setTimeout(() => {
        const discoveredPoints = [
          {
            name: 'mainNavigation',
            options: {
              actions: ['addMenuItem', 'removeMenuItem', 'updateMenuItem']
            },
            handler: this._createMockHandler('mainNavigation')
          },
          {
            name: 'dashboardWidgets',
            options: {
              actions: ['addWidget', 'removeWidget', 'updateWidget']
            },
            handler: this._createMockHandler('dashboardWidgets')
          },
          {
            name: 'exportFunctions',
            options: {
              actions: ['exportPDF', 'exportHTML', 'exportCSV']
            },
            handler: this._createMockHandler('exportFunctions')
          },
          {
            name: 'userPreferences',
            options: {
              actions: ['getPreferences', 'setPreferences']
            },
            handler: this._createMockHandler('userPreferences')
          }
        ];
        
        // Register discovered points
        discoveredPoints.forEach(point => {
          this.registerIntegrationPoint(point.name, point.options, point.handler);
        });
        
        resolve(discoveredPoints);
      }, 500); // Simulate network delay
    });
  }

  /**
   * Create a mock handler for demo purposes
   * @param {string} pointName - Integration point name
   * @returns {Function} - Mock handler function
   * @private
   */
  _createMockHandler(pointName) {
    return async (action, params) => {
      this.logger.info(`Mock handler for ${pointName} executing action: ${action}`, params);
      
      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        success: true,
        action,
        params,
        timestamp: new Date(),
        result: `Simulated result for ${action} on ${pointName}`
      };
    };
  }

  /**
   * Connect to the main application
   * @param {Object} config - Connection configuration
   * @returns {Promise<boolean>} - True if connected successfully
   * @private
   */
  async _connectToMainApplication(config) {
    // This is a simulation for the demo
    // In a real implementation, this would establish a connection with the main application
    
    this.logger.info('Connecting to main application...');
    
    // Simulate connection process
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate for demo
          this.logger.info('Connected to main application successfully');
          resolve(true);
        } else {
          reject(new Error('Failed to connect to main application (simulated failure)'));
        }
      }, 800); // Simulate network delay
    });
  }

  /**
   * Initialize compatibility layer for legacy integration
   * @returns {Promise<boolean>} - True if initialized successfully
   * @private
   */
  async _initializeCompatibilityLayer() {
    this.logger.info('Initializing compatibility layer...');
    
    // Simulate initialization
    return new Promise(resolve => {
      setTimeout(() => {
        this.logger.info('Compatibility layer initialized');
        resolve(true);
      }, 300);
    });
  }

  /**
   * Synchronize themes with the main application
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} - Sync results
   * @private
   */
  async _synchronizeThemes(options) {
    this.logger.info('Synchronizing themes...');
    
    // Get themes from registry
    const themes = this.themeRegistry ? await this.themeRegistry.getAllThemes() : [];
    
    // Simulate synchronization with main application
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          synchronized: themes.length,
          themes: themes.map(theme => theme.id || theme.name),
          timestamp: new Date()
        });
      }, 400);
    });
  }

  /**
   * Synchronize templates with the main application
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} - Sync results
   * @private
   */
  async _synchronizeTemplates(options) {
    this.logger.info('Synchronizing templates...');
    
    // Get templates from registry
    const templates = this.templateRegistry ? await this.templateRegistry.getAllTemplates() : [];
    
    // Simulate synchronization with main application
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          synchronized: templates.length,
          templates: templates.map(template => template.id || template.name),
          timestamp: new Date()
        });
      }, 350);
    });
  }

  /**
   * Synchronize data with the main application
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} - Sync results
   * @private
   */
  async _synchronizeData(options) {
    this.logger.info('Synchronizing data...');
    
    // Simulate data synchronization
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          synchronized: true,
          dataPoints: Math.floor(Math.random() * 100) + 50, // Random number for demo
          timestamp: new Date()
        });
      }, 600);
    });
  }

  /**
   * Create a theme selector UI component
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Component options
   * @private
   */
  _createThemeSelectorComponent(container, options) {
    container.innerHTML = `
      <div class="theme-selector-component">
        <h3>Theme Selector</h3>
        <select class="theme-select">
          <option value="">Select a theme...</option>
          ${this._getThemeOptions()}
        </select>
        <button class="apply-theme-btn">Apply Theme</button>
      </div>
    `;
    
    const selectElement = container.querySelector('.theme-select');
    const applyButton = container.querySelector('.apply-theme-btn');
    
    applyButton.addEventListener('click', () => {
      const selectedTheme = selectElement.value;
      if (selectedTheme) {
        this._applyTheme(selectedTheme);
      }
    });
  }

  /**
   * Get theme options for select element
   * @returns {string} - HTML options string
   * @private
   */
  _getThemeOptions() {
    if (!this.themeRegistry) {
      return '<option value="default">Default Theme</option>';
    }
    
    // In a real implementation, this would get themes from the registry
    const mockThemes = [
      { id: 'default', name: 'Default Theme' },
      { id: 'dark', name: 'Dark Mode' },
      { id: 'light', name: 'Light Mode' },
      { id: 'corporate', name: 'Corporate Theme' },
      { id: 'modern', name: 'Modern UI' }
    ];
    
    return mockThemes.map(theme => 
      `<option value="${theme.id}">${theme.name}</option>`
    ).join('');
  }

  /**
   * Apply a theme
   * @param {string} themeId - Theme ID
   * @private
   */
  _applyTheme(themeId) {
    this.logger.info(`Applying theme: ${themeId}`);
    
    if (this.themeRegistry) {
      this.themeRegistry.setActiveTheme(themeId)
        .then(() => {
          this._triggerEvent('themeApplied', { themeId });
        })
        .catch(error => {
          this.logger.error(`Failed to apply theme: ${themeId}`, error);
          this._triggerEvent('error', { error, phase: 'applyTheme', themeId });
        });
    } else {
      this.logger.warn('ThemeRegistry not available, cannot apply theme');
    }
  }

  /**
   * Create a template selector UI component
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Component options
   * @private
   */
  _createTemplateSelectorComponent(container, options) {
    container.innerHTML = `
      <div class="template-selector-component">
        <h3>Template Selector</h3>
        <select class="template-select">
          <option value="">Select a template...</option>
          ${this._getTemplateOptions()}
        </select>
        <button class="apply-template-btn">Apply Template</button>
      </div>
    `;
    
    const selectElement = container.querySelector('.template-select');
    const applyButton = container.querySelector('.apply-template-btn');
    
    applyButton.addEventListener('click', () => {
      const selectedTemplate = selectElement.value;
      if (selectedTemplate) {
        this._applyTemplate(selectedTemplate);
      }
    });
  }

  /**
   * Get template options for select element
   * @returns {string} - HTML options string
   * @private
   */
  _getTemplateOptions() {
    if (!this.templateRegistry) {
      return '<option value="default">Default Template</option>';
    }
    
    // In a real implementation, this would get templates from the registry
    const mockTemplates = [
      { id: 'default', name: 'Default Template' },
      { id: 'executive', name: 'Executive Summary' },
      { id: 'detailed', name: 'Detailed Report' },
      { id: 'technical', name: 'Technical Report' },
      { id: 'compliance', name: 'Compliance Report' }
    ];
    
    return mockTemplates.map(template => 
      `<option value="${template.id}">${template.name}</option>`
    ).join('');
  }

  /**
   * Apply a template
   * @param {string} templateId - Template ID
   * @private
   */
  _applyTemplate(templateId) {
    this.logger.info(`Applying template: ${templateId}`);
    
    if (this.templateRegistry) {
      this.templateRegistry.setActiveTemplate(templateId)
        .then(() => {
          this._triggerEvent('templateApplied', { templateId });
        })
        .catch(error => {
          this.logger.error(`Failed to apply template: ${templateId}`, error);
          this._triggerEvent('error', { error, phase: 'applyTemplate', templateId });
        });
    } else {
      this.logger.warn('TemplateRegistry not available, cannot apply template');
    }
  }

  /**
   * Create a report preview UI component
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Component options
   * @private
   */
  _createReportPreviewComponent(container, options) {
    container.innerHTML = `
      <div class="report-preview-component">
        <h3>Report Preview</h3>
        <div class="preview-container">
          <div class="preview-placeholder">Report preview will appear here</div>
        </div>
        <div class="preview-controls">
          <button class="refresh-preview-btn">Refresh Preview</button>
          <button class="export-preview-btn">Export</button>
        </div>
      </div>
    `;
    
    const refreshButton = container.querySelector('.refresh-preview-btn');
    const exportButton = container.querySelector('.export-preview-btn');
    
    refreshButton.addEventListener('click', () => {
      this._refreshPreview(container);
    });
    
    exportButton.addEventListener('click', () => {
      this._showExportOptions(container);
    });
    
    // Initial preview load
    this._refreshPreview(container);
  }

  /**
   * Refresh the report preview
   * @param {HTMLElement} container - Container element
   * @private
   */
  _refreshPreview(container) {
    const previewContainer = container.querySelector('.preview-container');
    
    previewContainer.innerHTML = '<div class="loading">Loading preview...</div>';
    
    // Simulate preview loading
    setTimeout(() => {
      previewContainer.innerHTML = `
        <div class="mock-report">
          <div class="mock-report-header">
            <h2>AI Tool Risk Assessment</h2>
            <p class="mock-date">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="mock-report-section">
            <h3>Executive Summary</h3>
            <p>This report provides an assessment of AI tool risks based on the framework criteria.</p>
          </div>
          <div class="mock-report-section">
            <h3>Risk Factors</h3>
            <ul>
              <li>Data Privacy: <span class="mock-risk-high">High</span></li>
              <li>Transparency: <span class="mock-risk-medium">Medium</span></li>
              <li>Bias: <span class="mock-risk-low">Low</span></li>
              <li>Security: <span class="mock-risk-medium">Medium</span></li>
            </ul>
          </div>
          <div class="mock-report-section">
            <h3>Recommendations</h3>
            <p>Based on the assessment, the following actions are recommended:</p>
            <ol>
              <li>Implement enhanced data protection measures</li>
              <li>Improve model documentation</li>
              <li>Conduct regular security audits</li>
            </ol>
          </div>
        </div>
      `;
      
      this._triggerEvent('previewRefreshed', { container });
    }, 800);
  }

  /**
   * Show export options
   * @param {HTMLElement} container - Container element
   * @private
   */
  _showExportOptions(container) {
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.innerHTML = `
      <div class="export-modal-content">
        <h3>Export Report</h3>
        <p>Select export format:</p>
        <div class="export-options">
          <button data-format="pdf">PDF</button>
          <button data-format="html">HTML</button>
          <button data-format="docx">Word (DOCX)</button>
          <button data-format="csv">CSV</button>
        </div>
        <button class="close-modal-btn">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeButton = modal.querySelector('.close-modal-btn');
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    const formatButtons = modal.querySelectorAll('[data-format]');
    formatButtons.forEach(button => {
      button.addEventListener('click', () => {
        const format = button.getAttribute('data-format');
        this._exportReport(format);
        document.body.removeChild(modal);
      });
    });
  }

  /**
   * Export the report
   * @param {string} format - Export format
   * @private
   */
  _exportReport(format) {
    this.logger.info(`Exporting report in ${format} format`);
    
    // In a real implementation, this would call the appropriate export function
    this.executeAction(`export${format.toUpperCase()}`, {})
      .then(result => {
        this._triggerEvent('reportExported', { format, result });
        alert(`Report would be exported as ${format.toUpperCase()} in a real implementation`);
      })
      .catch(error => {
        this.logger.error(`Failed to export report as ${format}`, error);
        this._triggerEvent('error', { error, phase: 'export', format });
      });
  }

  /**
   * Create a status UI component
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Component options
   * @private
   */
  _createStatusComponent(container, options) {
    container.innerHTML = `
      <div class="integration-status-component">
        <h3>Integration Status</h3>
        <div class="status-indicator ${this.status.connected ? 'connected' : 'disconnected'}">
          ${this.status.connected ? 'Connected' : 'Disconnected'}
        </div>
        <div class="status-details">
          <p><strong>Last Sync:</strong> ${this.status.lastSyncTime ? this.status.lastSyncTime.toLocaleString() : 'Never'}</p>
          <p><strong>Pending Operations:</strong> ${this.status.pendingOperations}</p>
          <p><strong>Errors:</strong> ${this.status.errors.length}</p>
        </div>
        <div class="status-actions">
          <button class="sync-btn">Synchronize</button>
          <button class="toggle-connection-btn">${this.status.connected ? 'Disconnect' : 'Connect'}</button>
        </div>
      </div>
    `;
    
    const syncButton = container.querySelector('.sync-btn');
    const toggleButton = container.querySelector('.toggle-connection-btn');
    
    syncButton.addEventListener('click', () => {
      this.synchronize({ force: true })
        .then(() => {
          this._updateStatusComponent(container);
        })
        .catch(error => {
          alert(`Synchronization failed: ${error.message}`);
        });
    });
    
    toggleButton.addEventListener('click', () => {
      if (this.status.connected) {
        this.disconnect()
          .then(() => {
            this._updateStatusComponent(container);
          })
          .catch(error => {
            alert(`Disconnection failed: ${error.message}`);
          });
      } else {
        this.initialize()
          .then(() => {
            this._updateStatusComponent(container);
          })
          .catch(error => {
            alert(`Connection failed: ${error.message}`);
          });
      }
    });
  }

  /**
   * Update the status component
   * @param {HTMLElement} container - Container element
   * @private
   */
  _updateStatusComponent(container) {
    const statusIndicator = container.querySelector('.status-indicator');
    const statusDetails = container.querySelector('.status-details');
    const toggleButton = container.querySelector('.toggle-connection-btn');
    
    statusIndicator.className = `status-indicator ${this.status.connected ? 'connected' : 'disconnected'}`;
    statusIndicator.textContent = this.status.connected ? 'Connected' : 'Disconnected';
    
    statusDetails.innerHTML = `
      <p><strong>Last Sync:</strong> ${this.status.lastSyncTime ? this.status.lastSyncTime.toLocaleString() : 'Never'}</p>
      <p><strong>Pending Operations:</strong> ${this.status.pendingOperations}</p>
      <p><strong>Errors:</strong> ${this.status.errors.length}</p>
    `;
    
    toggleButton.textContent = this.status.connected ? 'Disconnect' : 'Connect';
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationService;
} else if (typeof window !== 'undefined') {
  window.IntegrationService = IntegrationService;
}
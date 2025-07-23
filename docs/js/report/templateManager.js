/**
 * @class TemplateManager
 * @description Manages report templates, including loading, validation, and rendering
 */
class TemplateManager {
  /**
   * @constructor
   * @param {Object} options - Configuration options
   * @param {string} options.templatesPath - Path to templates directory
   * @param {Object} options.defaultTemplate - Default template configuration
   * @param {ConfigManager} options.configManager - Configuration manager instance
   * @param {DataAdapterManager} options.dataAdapterManager - Data adapter manager instance
   */
  constructor(options = {}) {
    this.templatesPath = options.templatesPath || 'templates/';
    this.defaultTemplate = options.defaultTemplate || { id: 'default', name: 'Default Template' };
    this.configManager = options.configManager;
    this.dataAdapterManager = options.dataAdapterManager;
    
    this.templates = new Map();
    this.activeTemplate = null;
    this.listeners = {};
    
    // Template cache
    this.templateCache = new Map();
    this.enableCache = this.configManager ? 
      this.configManager.get('templates.enableTemplateCache', true) : true;
    
    // Statistics
    this.stats = {
      loadCount: 0,
      renderCount: 0,
      errorCount: 0,
      lastLoadTime: null,
      lastRenderTime: null,
      lastErrorTime: null,
      averageRenderTime: 0,
      totalRenderTime: 0,
    };
  }
  
  /**
   * Initialize the template manager
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} - True if initialization was successful
   */
  async initialize(options = {}) {
    try {
      this._dispatchEvent('initializing', { options });
      
      // Load default template
      if (options.loadDefaultTemplate !== false) {
        const defaultTemplateId = this.configManager ? 
          this.configManager.get('templates.defaultTemplate', this.defaultTemplate.id) : 
          this.defaultTemplate.id;
        
        await this.loadTemplate(defaultTemplateId);
        await this.setActiveTemplate(defaultTemplateId);
      }
      
      // Load template registry if available
      if (options.loadRegistry !== false) {
        await this.loadTemplateRegistry();
      }
      
      this._dispatchEvent('initialized', {});
      return true;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'initialization' });
      console.error('[TemplateManager] Initialization error:', error);
      return false;
    }
  }
  
  /**
   * Load the template registry
   * @returns {Promise<Object>} - Template registry data
   */
  async loadTemplateRegistry() {
    try {
      this._dispatchEvent('loading_registry', {});
      
      let registry;
      
      // Try to load from data adapter if available
      if (this.dataAdapterManager) {
        const storageAdapter = this.dataAdapterManager.getAdapter('localStorage');
        if (storageAdapter && storageAdapter.connected) {
          registry = await storageAdapter.fetchData({ key: 'template_registry' });
        }
      }
      
      // If no registry found, create a default one
      if (!registry) {
        registry = {
          templates: [
            {
              id: 'executive-summary',
              name: 'Executive Summary',
              description: 'A concise summary for executives and stakeholders',
              version: '1.0.0',
              author: 'System',
              tags: ['executive', 'summary', 'overview'],
              thumbnail: 'templates/executive-summary/thumbnail.png',
              path: 'templates/executive-summary/',
              mainFile: 'index.html',
              supportedThemes: ['all'],
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            },
            {
              id: 'detailed-report',
              name: 'Detailed Report',
              description: 'A comprehensive report with detailed analysis',
              version: '1.0.0',
              author: 'System',
              tags: ['detailed', 'comprehensive', 'analysis'],
              thumbnail: 'templates/detailed-report/thumbnail.png',
              path: 'templates/detailed-report/',
              mainFile: 'index.html',
              supportedThemes: ['all'],
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            },
            {
              id: 'risk-assessment',
              name: 'Risk Assessment',
              description: 'A template focused on risk assessment and mitigation',
              version: '1.0.0',
              author: 'System',
              tags: ['risk', 'assessment', 'mitigation'],
              thumbnail: 'templates/risk-assessment/thumbnail.png',
              path: 'templates/risk-assessment/',
              mainFile: 'index.html',
              supportedThemes: ['all'],
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            },
          ],
        };
        
        // Save default registry if storage adapter is available
        if (this.dataAdapterManager) {
          const storageAdapter = this.dataAdapterManager.getAdapter('localStorage');
          if (storageAdapter && storageAdapter.connected) {
            await storageAdapter.sendData({
              key: 'template_registry',
              value: registry,
            });
          }
        }
      }
      
      // Register templates from registry
      for (const template of registry.templates) {
        this.registerTemplate(template);
      }
      
      this._dispatchEvent('registry_loaded', { registry });
      return registry;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'loading_registry' });
      console.error('[TemplateManager] Error loading template registry:', error);
      throw error;
    }
  }
  
  /**
   * Save the template registry
   * @returns {Promise<boolean>} - True if save was successful
   */
  async saveTemplateRegistry() {
    try {
      this._dispatchEvent('saving_registry', {});
      
      // Create registry object from templates map
      const registry = {
        templates: Array.from(this.templates.values()),
      };
      
      // Save to data adapter if available
      if (this.dataAdapterManager) {
        const storageAdapter = this.dataAdapterManager.getAdapter('localStorage');
        if (storageAdapter && storageAdapter.connected) {
          await storageAdapter.sendData({
            key: 'template_registry',
            value: registry,
          });
        }
      }
      
      this._dispatchEvent('registry_saved', { registry });
      return true;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'saving_registry' });
      console.error('[TemplateManager] Error saving template registry:', error);
      return false;
    }
  }
  
  /**
   * Register a template
   * @param {Object} template - Template configuration
   * @returns {boolean} - True if registration was successful
   */
  registerTemplate(template) {
    try {
      if (!template.id) {
        throw new Error('Template ID is required');
      }
      
      // Validate template
      this._validateTemplateConfig(template);
      
      // Add to templates map
      this.templates.set(template.id, template);
      
      this._dispatchEvent('template_registered', { template });
      return true;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'registration', template });
      console.error(`[TemplateManager] Error registering template '${template.id || 'unknown'}':`, error);
      return false;
    }
  }
  
  /**
   * Unregister a template
   * @param {string} templateId - Template ID
   * @returns {boolean} - True if unregistration was successful
   */
  unregisterTemplate(templateId) {
    if (!this.templates.has(templateId)) {
      return false;
    }
    
    const template = this.templates.get(templateId);
    this.templates.delete(templateId);
    
    // Remove from cache if present
    this.templateCache.delete(templateId);
    
    // If this was the active template, set to default
    if (this.activeTemplate && this.activeTemplate.id === templateId) {
      this.setActiveTemplate(this.defaultTemplate.id).catch(error => {
        console.error('[TemplateManager] Error setting default template after unregistration:', error);
      });
    }
    
    this._dispatchEvent('template_unregistered', { templateId, template });
    return true;
  }
  
  /**
   * Get a template by ID
   * @param {string} templateId - Template ID
   * @returns {Object|null} - Template configuration or null if not found
   */
  getTemplate(templateId) {
    return this.templates.get(templateId) || null;
  }
  
  /**
   * Get all registered templates
   * @returns {Array<Object>} - Array of template configurations
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }
  
  /**
   * Load a template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} - Loaded template
   */
  async loadTemplate(templateId) {
    try {
      this._dispatchEvent('loading_template', { templateId });
      this.stats.loadCount++;
      this.stats.lastLoadTime = new Date();
      
      // Check if template is registered
      const templateConfig = this.getTemplate(templateId);
      if (!templateConfig) {
        throw new Error(`Template '${templateId}' not found`);
      }
      
      // Check cache if enabled
      if (this.enableCache && this.templateCache.has(templateId)) {
        const cachedTemplate = this.templateCache.get(templateId);
        this._dispatchEvent('template_loaded', { templateId, template: cachedTemplate, cached: true });
        return cachedTemplate;
      }
      
      // Load template content
      const templatePath = templateConfig.path || `${this.templatesPath}${templateId}/`;
      const mainFile = templateConfig.mainFile || 'index.html';
      const fullPath = `${templatePath}${mainFile}`;
      
      // In a real implementation, we would load the template file from the server
      // For this demo, we'll simulate loading with a mock template
      const templateContent = await this._loadTemplateContent(fullPath);
      
      // Parse template
      const template = {
        ...templateConfig,
        content: templateContent,
        loaded: true,
        loadTime: new Date(),
      };
      
      // Cache template if caching is enabled
      if (this.enableCache) {
        this.templateCache.set(templateId, template);
      }
      
      this._dispatchEvent('template_loaded', { templateId, template });
      return template;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this._dispatchEvent('error', { error, phase: 'loading', templateId });
      console.error(`[TemplateManager] Error loading template '${templateId}':`, error);
      throw error;
    }
  }
  
  /**
   * Set the active template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} - Active template
   */
  async setActiveTemplate(templateId) {
    try {
      // Load template if not already loaded
      let template = this.templateCache.get(templateId);
      if (!template) {
        template = await this.loadTemplate(templateId);
      }
      
      this.activeTemplate = template;
      this._dispatchEvent('active_template_changed', { templateId, template });
      return template;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'set_active', templateId });
      console.error(`[TemplateManager] Error setting active template '${templateId}':`, error);
      throw error;
    }
  }
  
  /**
   * Get the active template
   * @returns {Object|null} - Active template or null if none is active
   */
  getActiveTemplate() {
    return this.activeTemplate;
  }
  
  /**
   * Render a template with data
   * @param {string} templateId - Template ID (defaults to active template)
   * @param {Object} data - Data to render the template with
   * @param {Object} options - Render options
   * @returns {Promise<string>} - Rendered template HTML
   */
  async renderTemplate(templateId = null, data = {}, options = {}) {
    try {
      const startTime = performance.now();
      this.stats.renderCount++;
      this.stats.lastRenderTime = new Date();
      
      // Use active template if no ID provided
      const targetTemplateId = templateId || (this.activeTemplate ? this.activeTemplate.id : null);
      if (!targetTemplateId) {
        throw new Error('No template specified and no active template set');
      }
      
      // Load template if not in cache
      let template = this.templateCache.get(targetTemplateId);
      if (!template) {
        template = await this.loadTemplate(targetTemplateId);
      }
      
      // Render template
      const renderedHtml = this._renderTemplateContent(template.content, data, options);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      this.stats.totalRenderTime += renderTime;
      this.stats.averageRenderTime = this.stats.totalRenderTime / this.stats.renderCount;
      
      this._dispatchEvent('template_rendered', {
        templateId: targetTemplateId,
        data,
        options,
        renderTime,
      });
      
      return renderedHtml;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this._dispatchEvent('error', { error, phase: 'rendering', templateId, data, options });
      console.error(`[TemplateManager] Error rendering template '${templateId || 'active'}':`, error);
      throw error;
    }
  }
  
  /**
   * Create a new template
   * @param {Object} templateConfig - Template configuration
   * @param {string} templateContent - Template content
   * @returns {Promise<Object>} - Created template
   */
  async createTemplate(templateConfig, templateContent) {
    try {
      this._dispatchEvent('creating_template', { templateConfig });
      
      // Validate template config
      this._validateTemplateConfig(templateConfig);
      
      // Check if template ID already exists
      if (this.templates.has(templateConfig.id)) {
        throw new Error(`Template with ID '${templateConfig.id}' already exists`);
      }
      
      // Set creation and update timestamps
      const now = new Date().toISOString();
      templateConfig.created = now;
      templateConfig.updated = now;
      
      // Register template
      this.registerTemplate(templateConfig);
      
      // Create template object
      const template = {
        ...templateConfig,
        content: templateContent,
        loaded: true,
        loadTime: new Date(),
      };
      
      // Cache template
      if (this.enableCache) {
        this.templateCache.set(templateConfig.id, template);
      }
      
      // Save template registry
      await this.saveTemplateRegistry();
      
      // In a real implementation, we would save the template file to the server
      // For this demo, we'll just simulate saving
      await this._saveTemplateContent(templateConfig.id, templateContent);
      
      this._dispatchEvent('template_created', { templateId: templateConfig.id, template });
      return template;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'creation', templateConfig });
      console.error(`[TemplateManager] Error creating template '${templateConfig.id || 'unknown'}':`, error);
      throw error;
    }
  }
  
  /**
   * Update an existing template
   * @param {string} templateId - Template ID
   * @param {Object} templateConfig - Updated template configuration
   * @param {string} templateContent - Updated template content
   * @returns {Promise<Object>} - Updated template
   */
  async updateTemplate(templateId, templateConfig, templateContent) {
    try {
      this._dispatchEvent('updating_template', { templateId, templateConfig });
      
      // Check if template exists
      if (!this.templates.has(templateId)) {
        throw new Error(`Template '${templateId}' not found`);
      }
      
      // Get existing template
      const existingTemplate = this.templates.get(templateId);
      
      // Merge configurations
      const updatedConfig = {
        ...existingTemplate,
        ...templateConfig,
        id: templateId, // Ensure ID doesn't change
        updated: new Date().toISOString(),
      };
      
      // Validate updated config
      this._validateTemplateConfig(updatedConfig);
      
      // Update template in registry
      this.templates.set(templateId, updatedConfig);
      
      // Create updated template object
      const template = {
        ...updatedConfig,
        content: templateContent,
        loaded: true,
        loadTime: new Date(),
      };
      
      // Update cache
      if (this.enableCache) {
        this.templateCache.set(templateId, template);
      }
      
      // Save template registry
      await this.saveTemplateRegistry();
      
      // In a real implementation, we would save the template file to the server
      // For this demo, we'll just simulate saving
      await this._saveTemplateContent(templateId, templateContent);
      
      // If this was the active template, update active template
      if (this.activeTemplate && this.activeTemplate.id === templateId) {
        this.activeTemplate = template;
      }
      
      this._dispatchEvent('template_updated', { templateId, template });
      return template;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'update', templateId, templateConfig });
      console.error(`[TemplateManager] Error updating template '${templateId}':`, error);
      throw error;
    }
  }
  
  /**
   * Delete a template
   * @param {string} templateId - Template ID
   * @returns {Promise<boolean>} - True if deletion was successful
   */
  async deleteTemplate(templateId) {
    try {
      this._dispatchEvent('deleting_template', { templateId });
      
      // Check if template exists
      if (!this.templates.has(templateId)) {
        throw new Error(`Template '${templateId}' not found`);
      }
      
      // Check if it's the default template
      if (templateId === this.defaultTemplate.id) {
        throw new Error('Cannot delete the default template');
      }
      
      // Unregister template
      this.unregisterTemplate(templateId);
      
      // Save template registry
      await this.saveTemplateRegistry();
      
      // In a real implementation, we would delete the template files from the server
      // For this demo, we'll just simulate deletion
      await this._deleteTemplateContent(templateId);
      
      this._dispatchEvent('template_deleted', { templateId });
      return true;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'deletion', templateId });
      console.error(`[TemplateManager] Error deleting template '${templateId}':`, error);
      throw error;
    }
  }
  
  /**
   * Import a template from a file or object
   * @param {Object|string} template - Template object or JSON string
   * @returns {Promise<Object>} - Imported template
   */
  async importTemplate(template) {
    try {
      this._dispatchEvent('importing_template', { template });
      
      // Parse template if it's a string
      let templateObj = template;
      if (typeof template === 'string') {
        templateObj = JSON.parse(template);
      }
      
      // Validate template
      if (!templateObj.config || !templateObj.content) {
        throw new Error('Invalid template format: missing config or content');
      }
      
      // Check if template ID already exists
      if (this.templates.has(templateObj.config.id)) {
        // Generate a unique ID by appending a timestamp
        const originalId = templateObj.config.id;
        templateObj.config.id = `${originalId}_${Date.now()}`;
        templateObj.config.name = `${templateObj.config.name} (Imported)`;
      }
      
      // Create template
      const importedTemplate = await this.createTemplate(
        templateObj.config,
        templateObj.content
      );
      
      this._dispatchEvent('template_imported', { template: importedTemplate });
      return importedTemplate;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'import', template });
      console.error('[TemplateManager] Error importing template:', error);
      throw error;
    }
  }
  
  /**
   * Export a template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} - Exported template object
   */
  async exportTemplate(templateId) {
    try {
      this._dispatchEvent('exporting_template', { templateId });
      
      // Check if template exists
      if (!this.templates.has(templateId)) {
        throw new Error(`Template '${templateId}' not found`);
      }
      
      // Load template if not in cache
      let template = this.templateCache.get(templateId);
      if (!template) {
        template = await this.loadTemplate(templateId);
      }
      
      // Create export object
      const exportObj = {
        config: { ...this.templates.get(templateId) },
        content: template.content,
      };
      
      this._dispatchEvent('template_exported', { templateId, export: exportObj });
      return exportObj;
    } catch (error) {
      this._dispatchEvent('error', { error, phase: 'export', templateId });
      console.error(`[TemplateManager] Error exporting template '${templateId}':`, error);
      throw error;
    }
  }
  
  /**
   * Clear the template cache
   */
  clearCache() {
    this.templateCache.clear();
    this._dispatchEvent('cache_cleared', {});
  }
  
  /**
   * Get template manager statistics
   * @returns {Object} - Statistics object
   */
  getStats() {
    return { ...this.stats };
  }
  
  /**
   * Reset template manager statistics
   */
  resetStats() {
    this.stats = {
      loadCount: 0,
      renderCount: 0,
      errorCount: 0,
      lastLoadTime: null,
      lastRenderTime: null,
      lastErrorTime: null,
      averageRenderTime: 0,
      totalRenderTime: 0,
    };
    this._dispatchEvent('stats_reset', {});
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {string} - Listener ID
   */
  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    const id = `${event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.listeners[event].push({ id, callback });
    
    return id;
  }
  
  /**
   * Remove an event listener
   * @param {string} id - Listener ID
   * @returns {boolean} - True if listener was removed
   */
  removeEventListener(id) {
    for (const event of Object.keys(this.listeners)) {
      const index = this.listeners[event].findIndex(listener => listener.id === id);
      if (index !== -1) {
        this.listeners[event].splice(index, 1);
        if (this.listeners[event].length === 0) {
          delete this.listeners[event];
        }
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Create a template selector UI
   * @param {string} containerId - Container element ID
   * @returns {Object} - UI controller object
   */
  createTemplateSelectorUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element not found: ${containerId}`);
    }
    
    // Get all templates
    const templates = this.getAllTemplates();
    
    // Create UI elements
    container.innerHTML = `
      <div class="template-selector">
        <h3>Select Template</h3>
        <div class="template-grid">
          ${templates.map(template => `
            <div class="template-card ${this.activeTemplate && this.activeTemplate.id === template.id ? 'active' : ''}" data-template-id="${template.id}">
              <div class="template-thumbnail">
                <img src="${template.thumbnail || 'assets/default-template-thumbnail.png'}" alt="${template.name}">
              </div>
              <div class="template-info">
                <h4>${template.name}</h4>
                <p>${template.description || ''}</p>
                <div class="template-tags">
                  ${(template.tags || []).map(tag => `<span class="template-tag">${tag}</span>`).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <style>
        .template-selector {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }
        
        .template-selector h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #0066cc;
        }
        
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .template-card {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          background-color: #fff;
        }
        
        .template-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .template-card.active {
          border-color: #0066cc;
          box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.3);
        }
        
        .template-thumbnail {
          height: 150px;
          overflow: hidden;
          background-color: #f8f9fa;
        }
        
        .template-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .template-info {
          padding: 15px;
        }
        
        .template-info h4 {
          margin-top: 0;
          margin-bottom: 5px;
          font-size: 16px;
        }
        
        .template-info p {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 14px;
          color: #6c757d;
        }
        
        .template-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .template-tag {
          background-color: #e9ecef;
          color: #495057;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      </style>
    `;
    
    // Add event listeners
    const templateCards = container.querySelectorAll('.template-card');
    templateCards.forEach(card => {
      card.addEventListener('click', async () => {
        const templateId = card.dataset.templateId;
        try {
          await this.setActiveTemplate(templateId);
          
          // Update UI
          templateCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        } catch (error) {
          console.error(`Error setting template '${templateId}':`, error);
          alert(`Error setting template: ${error.message}`);
        }
      });
    });
    
    // Return UI controller
    return {
      refresh: () => this.createTemplateSelectorUI(containerId),
      getSelectedTemplateId: () => this.activeTemplate ? this.activeTemplate.id : null,
    };
  }
  
  /**
   * Create a template editor UI
   * @param {string} containerId - Container element ID
   * @param {string} templateId - Template ID to edit (optional)
   * @returns {Object} - UI controller object
   */
  createTemplateEditorUI(containerId, templateId = null) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element not found: ${containerId}`);
    }
    
    // Get template if ID provided
    let template = null;
    if (templateId) {
      template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template '${templateId}' not found`);
      }
    }
    
    // Create UI elements
    container.innerHTML = `
      <div class="template-editor">
        <h3>${template ? 'Edit Template' : 'Create Template'}</h3>
        
        <div class="editor-form">
          <div class="form-group">
            <label for="template-id">Template ID</label>
            <input type="text" id="template-id" value="${template ? template.id : ''}" ${template ? 'disabled' : ''}>
            <small>Unique identifier for the template</small>
          </div>
          
          <div class="form-group">
            <label for="template-name">Name</label>
            <input type="text" id="template-name" value="${template ? template.name : ''}">
            <small>Display name for the template</small>
          </div>
          
          <div class="form-group">
            <label for="template-description">Description</label>
            <textarea id="template-description" rows="3">${template ? template.description || '' : ''}</textarea>
            <small>Brief description of the template</small>
          </div>
          
          <div class="form-group">
            <label for="template-tags">Tags</label>
            <input type="text" id="template-tags" value="${template ? (template.tags || []).join(', ') : ''}">
            <small>Comma-separated list of tags</small>
          </div>
          
          <div class="form-group">
            <label for="template-author">Author</label>
            <input type="text" id="template-author" value="${template ? template.author || '' : ''}">
            <small>Template author or organization</small>
          </div>
          
          <div class="form-group">
            <label for="template-version">Version</label>
            <input type="text" id="template-version" value="${template ? template.version || '1.0.0' : '1.0.0'}">
            <small>Template version (semver)</small>
          </div>
          
          <div class="form-group">
            <label for="template-thumbnail">Thumbnail URL</label>
            <input type="text" id="template-thumbnail" value="${template ? template.thumbnail || '' : ''}">
            <small>URL to template thumbnail image</small>
          </div>
          
          <div class="form-group">
            <label for="template-content">HTML Content</label>
            <textarea id="template-content" rows="10" class="code-editor">${template ? (this.templateCache.get(template.id)?.content || '') : ''}</textarea>
            <small>HTML template content with optional placeholders</small>
          </div>
          
          <div class="editor-actions">
            <button id="save-template" class="primary-button">Save Template</button>
            <button id="cancel-edit" class="secondary-button">Cancel</button>
            ${template ? `<button id="delete-template" class="danger-button">Delete Template</button>` : ''}
          </div>
        </div>
      </div>
      
      <style>
        .template-editor {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .template-editor h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #0066cc;
        }
        
        .editor-form {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .form-group small {
          display: block;
          margin-top: 5px;
          color: #6c757d;
          font-size: 12px;
        }
        
        .code-editor {
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
        }
        
        .editor-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .primary-button {
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
        }
        
        .primary-button:hover {
          background-color: #0056b3;
        }
        
        .secondary-button {
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
        }
        
        .secondary-button:hover {
          background-color: #5a6268;
        }
        
        .danger-button {
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          margin-left: auto;
        }
        
        .danger-button:hover {
          background-color: #c82333;
        }
      </style>
    `;
    
    // Add event listeners
    const saveButton = document.getElementById('save-template');
    const cancelButton = document.getElementById('cancel-edit');
    const deleteButton = document.getElementById('delete-template');
    
    saveButton.addEventListener('click', async () => {
      try {
        const id = document.getElementById('template-id').value.trim();
        const name = document.getElementById('template-name').value.trim();
        const description = document.getElementById('template-description').value.trim();
        const tags = document.getElementById('template-tags').value.split(',').map(tag => tag.trim()).filter(Boolean);
        const author = document.getElementById('template-author').value.trim();
        const version = document.getElementById('template-version').value.trim();
        const thumbnail = document.getElementById('template-thumbnail').value.trim();
        const content = document.getElementById('template-content').value;
        
        // Validate required fields
        if (!id) {
          throw new Error('Template ID is required');
        }
        
        if (!name) {
          throw new Error('Template name is required');
        }
        
        if (!content) {
          throw new Error('Template content is required');
        }
        
        // Create template config
        const templateConfig = {
          id,
          name,
          description,
          tags,
          author,
          version,
          thumbnail,
          path: `${this.templatesPath}${id}/`,
          mainFile: 'index.html',
          supportedThemes: ['all'],
        };
        
        // Save template
        if (template) {
          // Update existing template
          await this.updateTemplate(template.id, templateConfig, content);
          alert('Template updated successfully!');
        } else {
          // Create new template
          await this.createTemplate(templateConfig, content);
          alert('Template created successfully!');
        }
        
        // Refresh UI
        this.createTemplateEditorUI(containerId, id);
      } catch (error) {
        console.error('Error saving template:', error);
        alert(`Error saving template: ${error.message}`);
      }
    });
    
    cancelButton.addEventListener('click', () => {
      // Clear the editor
      container.innerHTML = '';
    });
    
    if (deleteButton) {
      deleteButton.addEventListener('click', async () => {
        try {
          if (confirm(`Are you sure you want to delete the template '${template.name}'?`)) {
            await this.deleteTemplate(template.id);
            alert('Template deleted successfully!');
            container.innerHTML = '';
          }
        } catch (error) {
          console.error('Error deleting template:', error);
          alert(`Error deleting template: ${error.message}`);
        }
      });
    }
    
    // Return UI controller
    return {
      refresh: () => this.createTemplateEditorUI(containerId, templateId),
      clear: () => { container.innerHTML = ''; },
    };
  }
  
  /**
   * Validate template configuration
   * @param {Object} templateConfig - Template configuration to validate
   * @throws {Error} - If validation fails
   * @private
   */
  _validateTemplateConfig(templateConfig) {
    // Check required fields
    if (!templateConfig.id) {
      throw new Error('Template ID is required');
    }
    
    if (!templateConfig.name) {
      throw new Error('Template name is required');
    }
    
    // Validate ID format (alphanumeric, hyphens, and underscores only)
    if (!/^[a-zA-Z0-9-_]+$/.test(templateConfig.id)) {
      throw new Error('Template ID can only contain letters, numbers, hyphens, and underscores');
    }
    
    // Validate version format (semver)
    if (templateConfig.version && !/^\d+\.\d+\.\d+$/.test(templateConfig.version)) {
      throw new Error('Template version must be in semver format (e.g., 1.0.0)');
    }
  }
  
  /**
   * Load template content from a file
   * @param {string} path - Template file path
   * @returns {Promise<string>} - Template content
   * @private
   */
  async _loadTemplateContent(path) {
    // In a real implementation, we would load the template file from the server
    // For this demo, we'll return a mock template based on the path
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate mock template content based on template ID
    const templateId = path.split('/').filter(Boolean).slice(-2)[0];
    
    switch (templateId) {
      case 'executive-summary':
        return `
          <div class="report executive-summary">
            <header class="report-header">
              <h1>{{title}}</h1>
              <p class="report-date">{{date}}</p>
              <p class="report-author">Prepared by: {{author}}</p>
            </header>
            
            <section class="executive-summary">
              <h2>Executive Summary</h2>
              <p>{{summary}}</p>
            </section>
            
            <section class="key-findings">
              <h2>Key Findings</h2>
              <ul>
                {{#each findings}}
                  <li>
                    <h3>{{this.title}}</h3>
                    <p>{{this.description}}</p>
                  </li>
                {{/each}}
              </ul>
            </section>
            
            <section class="recommendations">
              <h2>Recommendations</h2>
              <ol>
                {{#each recommendations}}
                  <li>
                    <h3>{{this.title}}</h3>
                    <p>{{this.description}}</p>
                    <p class="priority">Priority: {{this.priority}}</p>
                  </li>
                {{/each}}
              </ol>
            </section>
            
            <footer class="report-footer">
              <p>&copy; {{year}} {{company}}. All rights reserved.</p>
            </footer>
          </div>
        `;
        
      case 'detailed-report':
        return `
          <div class="report detailed-report">
            <header class="report-header">
              <h1>{{title}}</h1>
              <p class="report-date">{{date}}</p>
              <p class="report-author">Prepared by: {{author}}</p>
            </header>
            
            <section class="table-of-contents">
              <h2>Table of Contents</h2>
              <ul>
                <li><a href="#introduction">Introduction</a></li>
                <li><a href="#methodology">Methodology</a></li>
                <li><a href="#findings">Findings</a></li>
                <li><a href="#analysis">Analysis</a></li>
                <li><a href="#recommendations">Recommendations</a></li>
                <li><a href="#conclusion">Conclusion</a></li>
                <li><a href="#appendix">Appendix</a></li>
              </ul>
            </section>
            
            <section id="introduction" class="introduction">
              <h2>Introduction</h2>
              <p>{{introduction}}</p>
            </section>
            
            <section id="methodology" class="methodology">
              <h2>Methodology</h2>
              <p>{{methodology}}</p>
              
              <h3>Data Collection</h3>
              <p>{{dataCollection}}</p>
              
              <h3>Analysis Approach</h3>
              <p>{{analysisApproach}}</p>
            </section>
            
            <section id="findings" class="findings">
              <h2>Findings</h2>
              
              {{#each findings}}
                <div class="finding">
                  <h3>{{this.title}}</h3>
                  <p>{{this.description}}</p>
                  
                  {{#if this.data}}
                    <div class="data-visualization">
                      <h4>Data</h4>
                      <div class="chart-placeholder">[Chart: {{this.data.chartType}}]</div>
                    </div>
                  {{/if}}
                </div>
              {{/each}}
            </section>
            
            <section id="analysis" class="analysis">
              <h2>Analysis</h2>
              <p>{{analysis}}</p>
              
              <h3>Key Insights</h3>
              <ul>
                {{#each insights}}
                  <li>
                    <h4>{{this.title}}</h4>
                    <p>{{this.description}}</p>
                  </li>
                {{/each}}
              </ul>
            </section>
            
            <section id="recommendations" class="recommendations">
              <h2>Recommendations</h2>
              
              {{#each recommendations}}
                <div class="recommendation">
                  <h3>{{this.title}}</h3>
                  <p>{{this.description}}</p>
                  <p class="priority">Priority: {{this.priority}}</p>
                  <p class="timeline">Timeline: {{this.timeline}}</p>
                  <p class="resources">Resources Required: {{this.resources}}</p>
                </div>
              {{/each}}
            </section>
            
            <section id="conclusion" class="conclusion">
              <h2>Conclusion</h2>
              <p>{{conclusion}}</p>
            </section>
            
            <section id="appendix" class="appendix">
              <h2>Appendix</h2>
              
              <h3>References</h3>
              <ul>
                {{#each references}}
                  <li>{{this}}</li>
                {{/each}}
              </ul>
              
              <h3>Glossary</h3>
              <dl>
                {{#each glossary}}
                  <dt>{{this.term}}</dt>
                  <dd>{{this.definition}}</dd>
                {{/each}}
              </dl>
            </section>
            
            <footer class="report-footer">
              <p>&copy; {{year}} {{company}}. All rights reserved.</p>
            </footer>
          </div>
        `;
        
      case 'risk-assessment':
        return `
          <div class="report risk-assessment">
            <header class="report-header">
              <h1>{{title}}</h1>
              <p class="report-date">{{date}}</p>
              <p class="report-author">Prepared by: {{author}}</p>
            </header>
            
            <section class="executive-summary">
              <h2>Executive Summary</h2>
              <p>{{summary}}</p>
            </section>
            
            <section class="risk-matrix">
              <h2>Risk Matrix</h2>
              <div class="matrix-placeholder">[Risk Matrix Visualization]</div>
            </section>
            
            <section class="risk-assessment">
              <h2>Risk Assessment</h2>
              
              {{#each risks}}
                <div class="risk-item">
                  <h3>{{this.title}}</h3>
                  
                  <div class="risk-details">
                    <div class="risk-rating">
                      <p><strong>Likelihood:</strong> {{this.likelihood}}</p>
                      <p><strong>Impact:</strong> {{this.impact}}</p>
                      <p><strong>Risk Level:</strong> <span class="risk-level {{this.level}}">{{this.level}}</span></p>
                    </div>
                    
                    <div class="risk-description">
                      <p>{{this.description}}</p>
                    </div>
                  </div>
                  
                  <div class="risk-mitigation">
                    <h4>Mitigation Strategy</h4>
                    <p>{{this.mitigation}}</p>
                    
                    <h4>Contingency Plan</h4>
                    <p>{{this.contingency}}</p>
                  </div>
                  
                  <div class="risk-ownership">
                    <p><strong>Risk Owner:</strong> {{this.owner}}</p>
                    <p><strong>Review Date:</strong> {{this.reviewDate}}</p>
                  </div>
                </div>
              {{/each}}
            </section>
            
            <section class="risk-summary">
              <h2>Risk Summary</h2>
              
              <div class="summary-stats">
                <div class="stat">
                  <h3>{{highRiskCount}}</h3>
                  <p>High Risks</p>
                </div>
                
                <div class="stat">
                  <h3>{{mediumRiskCount}}</h3>
                  <p>Medium Risks</p>
                </div>
                
                <div class="stat">
                  <h3>{{lowRiskCount}}</h3>
                  <p>Low Risks</p>
                </div>
              </div>
              
              <div class="summary-chart">
                <div class="chart-placeholder">[Risk Distribution Chart]</div>
              </div>
            </section>
            
            <section class="recommendations">
              <h2>Recommendations</h2>
              
              <ol>
                {{#each recommendations}}
                  <li>
                    <h3>{{this.title}}</h3>
                    <p>{{this.description}}</p>
                    <p class="priority">Priority: {{this.priority}}</p>
                  </li>
                {{/each}}
              </ol>
            </section>
            
            <footer class="report-footer">
              <p>&copy; {{year}} {{company}}. All rights reserved.</p>
            </footer>
          </div>
        `;
        
      default:
        return `
          <div class="report default-template">
            <header class="report-header">
              <h1>{{title}}</h1>
              <p class="report-date">{{date}}</p>
              <p class="report-author">Prepared by: {{author}}</p>
            </header>
            
            <section class="content">
              <h2>Content</h2>
              <p>{{content}}</p>
            </section>
            
            <footer class="report-footer">
              <p>&copy; {{year}} {{company}}. All rights reserved.</p>
            </footer>
          </div>
        `;
    }
  }
  
  /**
   * Save template content to a file
   * @param {string} templateId - Template ID
   * @param {string} content - Template content
   * @returns {Promise<boolean>} - True if save was successful
   * @private
   */
  async _saveTemplateContent(templateId, content) {
    // In a real implementation, we would save the template file to the server
    // For this demo, we'll just simulate saving
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate successful save
    return true;
  }
  
  /**
   * Delete template content
   * @param {string} templateId - Template ID
   * @returns {Promise<boolean>} - True if deletion was successful
   * @private
   */
  async _deleteTemplateContent(templateId) {
    // In a real implementation, we would delete the template files from the server
    // For this demo, we'll just simulate deletion
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Simulate successful deletion
    return true;
  }
  
  /**
   * Render template content with data
   * @param {string} templateContent - Template content
   * @param {Object} data - Data to render the template with
   * @param {Object} options - Render options
   * @returns {string} - Rendered template HTML
   * @private
   */
  _renderTemplateContent(templateContent, data, options) {
    // In a real implementation, we would use a template engine like Handlebars
    // For this demo, we'll use a simple placeholder replacement
    
    let renderedContent = templateContent;
    
    // Replace simple placeholders
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' || typeof value === 'number') {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        renderedContent = renderedContent.replace(regex, value);
      }
    }
    
    // Handle each loops (very simplified)
    const eachRegex = /\{\{#each\s+([^\}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    renderedContent = renderedContent.replace(eachRegex, (match, path, template) => {
      const parts = path.trim().split('.');
      let array = data;
      
      for (const part of parts) {
        if (array && typeof array === 'object') {
          array = array[part];
        } else {
          array = null;
          break;
        }
      }
      
      if (!Array.isArray(array)) {
        return '';
      }
      
      return array.map(item => {
        let itemTemplate = template;
        
        // Replace item properties
        for (const [key, value] of Object.entries(item)) {
          if (typeof value === 'string' || typeof value === 'number') {
            const regex = new RegExp(`\\{\\{this\.${key}\\}\\}`, 'g');
            itemTemplate = itemTemplate.replace(regex, value);
          }
        }
        
        return itemTemplate;
      }).join('');
    });
    
    // Handle if conditions (very simplified)
    const ifRegex = /\{\{#if\s+([^\}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    renderedContent = renderedContent.replace(ifRegex, (match, condition, template) => {
      const parts = condition.trim().split('.');
      let value = data;
      
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          value = null;
          break;
        }
      }
      
      return value ? template : '';
    });
    
    return renderedContent;
  }
  
  /**
   * Dispatch an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @private
   */
  _dispatchEvent(event, data = {}) {
    if (this.listeners[event]) {
      for (const listener of this.listeners[event]) {
        try {
          listener.callback({
            event,
            timestamp: new Date(),
            ...data,
          });
        } catch (error) {
          console.error(`[TemplateManager] Event listener error:`, error);
        }
      }
    }
    
    // Also dispatch to 'all' listeners
    if (this.listeners['all']) {
      for (const listener of this.listeners['all']) {
        try {
          listener.callback({
            event,
            timestamp: new Date(),
            ...data,
          });
        } catch (error) {
          console.error(`[TemplateManager] Event listener error:`, error);
        }
      }
    }
  }
}

// Export the TemplateManager class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateManager;
} else if (typeof window !== 'undefined') {
  window.TemplateManager = TemplateManager;
}
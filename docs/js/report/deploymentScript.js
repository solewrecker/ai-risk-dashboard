/**
 * @class DeploymentScript
 * @description Handles the automated deployment of report system components
 * including themes, templates, and configurations.
 */
class DeploymentScript {
  /**
   * @constructor
   * @param {Object} config - Configuration options for the deployment
   * @param {string} config.environment - Target environment (dev, staging, production)
   * @param {string} config.version - Version to deploy
   * @param {Array} config.components - Components to deploy (themes, templates, etc.)
   * @param {Function} config.onProgress - Callback for deployment progress
   * @param {Function} config.onComplete - Callback for deployment completion
   * @param {Function} config.onError - Callback for deployment errors
   */
  constructor(config = {}) {
    this.environment = config.environment || 'dev';
    this.version = config.version || '1.0.0';
    this.components = config.components || ['themes', 'templates', 'configurations'];
    this.onProgress = config.onProgress || (() => {});
    this.onComplete = config.onComplete || (() => {});
    this.onError = config.onError || (() => {});
    
    // Deployment state
    this.isDeploying = false;
    this.deploymentSteps = [];
    this.currentStep = 0;
    this.logs = [];
    this.startTime = null;
    this.endTime = null;
    
    // Environment configurations
    this.environments = {
      dev: {
        baseUrl: 'http://localhost:8000',
        apiEndpoint: '/api/dev',
        requiresAuth: false,
        backupBeforeDeploy: true
      },
      staging: {
        baseUrl: 'https://staging.example.com',
        apiEndpoint: '/api/staging',
        requiresAuth: true,
        backupBeforeDeploy: true
      },
      production: {
        baseUrl: 'https://example.com',
        apiEndpoint: '/api/production',
        requiresAuth: true,
        backupBeforeDeploy: true,
        approvalRequired: true
      }
    };
    
    // Initialize deployment steps based on components
    this._initializeDeploymentSteps();
  }
  
  /**
   * Initialize the deployment steps based on selected components
   * @private
   */
  _initializeDeploymentSteps() {
    this.deploymentSteps = [];
    
    // Add validation step
    this.deploymentSteps.push({
      name: 'Validate deployment configuration',
      status: 'pending',
      action: this._validateDeploymentConfig.bind(this)
    });
    
    // Add environment-specific steps
    if (this.environments[this.environment].backupBeforeDeploy) {
      this.deploymentSteps.push({
        name: 'Create backup',
        status: 'pending',
        action: this._createBackup.bind(this)
      });
    }
    
    if (this.environments[this.environment].requiresAuth) {
      this.deploymentSteps.push({
        name: 'Authenticate',
        status: 'pending',
        action: this._authenticate.bind(this)
      });
    }
    
    if (this.environments[this.environment].approvalRequired) {
      this.deploymentSteps.push({
        name: 'Request approval',
        status: 'pending',
        action: this._requestApproval.bind(this)
      });
    }
    
    // Add component-specific deployment steps
    if (this.components.includes('themes')) {
      this.deploymentSteps.push({
        name: 'Deploy themes',
        status: 'pending',
        action: this._deployThemes.bind(this)
      });
    }
    
    if (this.components.includes('templates')) {
      this.deploymentSteps.push({
        name: 'Deploy templates',
        status: 'pending',
        action: this._deployTemplates.bind(this)
      });
    }
    
    if (this.components.includes('configurations')) {
      this.deploymentSteps.push({
        name: 'Deploy configurations',
        status: 'pending',
        action: this._deployConfigurations.bind(this)
      });
    }
    
    // Add verification step
    this.deploymentSteps.push({
      name: 'Verify deployment',
      status: 'pending',
      action: this._verifyDeployment.bind(this)
    });
  }
  
  /**
   * Start the deployment process
   * @returns {Promise} A promise that resolves when deployment is complete
   */
  async deploy() {
    if (this.isDeploying) {
      throw new Error('Deployment already in progress');
    }
    
    this.isDeploying = true;
    this.startTime = new Date();
    this.currentStep = 0;
    this.logs = [];
    
    this._log('info', `Starting deployment to ${this.environment} environment, version ${this.version}`);
    this._log('info', `Components to deploy: ${this.components.join(', ')}`);
    
    try {
      for (let i = 0; i < this.deploymentSteps.length; i++) {
        this.currentStep = i;
        const step = this.deploymentSteps[i];
        
        this._log('info', `Starting step ${i + 1}/${this.deploymentSteps.length}: ${step.name}`);
        step.status = 'in-progress';
        this.onProgress({
          step: i + 1,
          totalSteps: this.deploymentSteps.length,
          name: step.name,
          status: step.status,
          progress: ((i + 0.5) / this.deploymentSteps.length) * 100
        });
        
        try {
          await step.action();
          step.status = 'completed';
          this._log('success', `Completed step: ${step.name}`);
        } catch (error) {
          step.status = 'failed';
          this._log('error', `Failed step: ${step.name} - ${error.message}`);
          throw error;
        }
        
        this.onProgress({
          step: i + 1,
          totalSteps: this.deploymentSteps.length,
          name: step.name,
          status: step.status,
          progress: ((i + 1) / this.deploymentSteps.length) * 100
        });
      }
      
      this.endTime = new Date();
      const duration = (this.endTime - this.startTime) / 1000;
      this._log('success', `Deployment completed successfully in ${duration.toFixed(2)} seconds`);
      
      this.isDeploying = false;
      this.onComplete({
        success: true,
        environment: this.environment,
        version: this.version,
        components: this.components,
        duration,
        logs: this.logs
      });
      
      return {
        success: true,
        environment: this.environment,
        version: this.version,
        duration
      };
    } catch (error) {
      this.endTime = new Date();
      const duration = (this.endTime - this.startTime) / 1000;
      this._log('error', `Deployment failed after ${duration.toFixed(2)} seconds: ${error.message}`);
      
      this.isDeploying = false;
      this.onError({
        error: error.message,
        environment: this.environment,
        version: this.version,
        components: this.components,
        duration,
        logs: this.logs,
        failedStep: this.deploymentSteps[this.currentStep].name
      });
      
      return {
        success: false,
        error: error.message,
        environment: this.environment,
        version: this.version,
        duration,
        failedStep: this.deploymentSteps[this.currentStep].name
      };
    }
  }
  
  /**
   * Cancel an in-progress deployment
   * @returns {boolean} True if deployment was canceled, false otherwise
   */
  cancelDeployment() {
    if (!this.isDeploying) {
      return false;
    }
    
    this._log('warning', 'Deployment canceled by user');
    this.deploymentSteps[this.currentStep].status = 'canceled';
    this.isDeploying = false;
    
    this.onError({
      error: 'Deployment canceled by user',
      environment: this.environment,
      version: this.version,
      components: this.components,
      duration: ((new Date()) - this.startTime) / 1000,
      logs: this.logs,
      failedStep: this.deploymentSteps[this.currentStep].name
    });
    
    return true;
  }
  
  /**
   * Get the current deployment status
   * @returns {Object} The current deployment status
   */
  getStatus() {
    return {
      isDeploying: this.isDeploying,
      environment: this.environment,
      version: this.version,
      components: this.components,
      currentStep: this.currentStep + 1,
      totalSteps: this.deploymentSteps.length,
      steps: this.deploymentSteps.map(step => ({
        name: step.name,
        status: step.status
      })),
      logs: this.logs,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.startTime ? ((this.endTime || new Date()) - this.startTime) / 1000 : 0
    };
  }
  
  /**
   * Add a log entry
   * @param {string} level - Log level (info, success, warning, error)
   * @param {string} message - Log message
   * @private
   */
  _log(level, message) {
    const log = {
      timestamp: new Date(),
      level,
      message
    };
    
    this.logs.push(log);
    console.log(`[${log.timestamp.toISOString()}] [${level.toUpperCase()}] ${message}`);
    
    return log;
  }
  
  /**
   * Validate the deployment configuration
   * @private
   * @returns {Promise} A promise that resolves when validation is complete
   */
  async _validateDeploymentConfig() {
    // Simulate validation process
    await this._simulateAsyncOperation(500);
    
    // Check if environment is valid
    if (!this.environments[this.environment]) {
      throw new Error(`Invalid environment: ${this.environment}`);
    }
    
    // Check if version is valid
    if (!this.version.match(/^\d+\.\d+\.\d+$/)) {
      throw new Error(`Invalid version format: ${this.version}`);
    }
    
    // Check if components are valid
    const validComponents = ['themes', 'templates', 'configurations'];
    for (const component of this.components) {
      if (!validComponents.includes(component)) {
        throw new Error(`Invalid component: ${component}`);
      }
    }
    
    this._log('info', 'Deployment configuration validated successfully');
    return true;
  }
  
  /**
   * Create a backup before deployment
   * @private
   * @returns {Promise} A promise that resolves when backup is complete
   */
  async _createBackup() {
    this._log('info', `Creating backup for ${this.environment} environment`);
    
    // Simulate backup process
    await this._simulateAsyncOperation(1500);
    
    const backupId = `backup-${this.environment}-${Date.now()}`;
    this._log('success', `Backup created successfully: ${backupId}`);
    
    return backupId;
  }
  
  /**
   * Authenticate with the deployment environment
   * @private
   * @returns {Promise} A promise that resolves when authentication is complete
   */
  async _authenticate() {
    this._log('info', `Authenticating with ${this.environment} environment`);
    
    // Simulate authentication process
    await this._simulateAsyncOperation(800);
    
    // In a real implementation, this would use actual credentials
    const authToken = `token-${this.environment}-${Date.now()}`;
    this._log('success', 'Authentication successful');
    
    return authToken;
  }
  
  /**
   * Request approval for production deployment
   * @private
   * @returns {Promise} A promise that resolves when approval is granted
   */
  async _requestApproval() {
    this._log('info', 'Requesting approval for production deployment');
    
    // Simulate approval process
    // In a real implementation, this might wait for an actual approval
    await this._simulateAsyncOperation(2000);
    
    // For demo purposes, we'll auto-approve
    const approved = true;
    const approver = 'admin@example.com';
    
    if (!approved) {
      throw new Error('Deployment approval rejected');
    }
    
    this._log('success', `Deployment approved by ${approver}`);
    return true;
  }
  
  /**
   * Deploy themes to the target environment
   * @private
   * @returns {Promise} A promise that resolves when themes are deployed
   */
  async _deployThemes() {
    this._log('info', `Deploying themes to ${this.environment} environment`);
    
    // Get themes to deploy
    const themes = await this._getThemesToDeploy();
    this._log('info', `Found ${themes.length} themes to deploy`);
    
    // Deploy each theme
    for (let i = 0; i < themes.length; i++) {
      const theme = themes[i];
      this._log('info', `Deploying theme (${i + 1}/${themes.length}): ${theme.name}`);
      
      // Simulate theme deployment
      await this._simulateAsyncOperation(300);
      
      this._log('success', `Theme deployed: ${theme.name} (v${theme.version})`);
    }
    
    return true;
  }
  
  /**
   * Deploy templates to the target environment
   * @private
   * @returns {Promise} A promise that resolves when templates are deployed
   */
  async _deployTemplates() {
    this._log('info', `Deploying templates to ${this.environment} environment`);
    
    // Get templates to deploy
    const templates = await this._getTemplatesToDeploy();
    this._log('info', `Found ${templates.length} templates to deploy`);
    
    // Deploy each template
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      this._log('info', `Deploying template (${i + 1}/${templates.length}): ${template.name}`);
      
      // Simulate template deployment
      await this._simulateAsyncOperation(400);
      
      this._log('success', `Template deployed: ${template.name} (v${template.version})`);
    }
    
    return true;
  }
  
  /**
   * Deploy configurations to the target environment
   * @private
   * @returns {Promise} A promise that resolves when configurations are deployed
   */
  async _deployConfigurations() {
    this._log('info', `Deploying configurations to ${this.environment} environment`);
    
    // Get configurations to deploy
    const configurations = await this._getConfigurationsToDeploy();
    this._log('info', `Found ${configurations.length} configurations to deploy`);
    
    // Deploy each configuration
    for (let i = 0; i < configurations.length; i++) {
      const config = configurations[i];
      this._log('info', `Deploying configuration (${i + 1}/${configurations.length}): ${config.name}`);
      
      // Simulate configuration deployment
      await this._simulateAsyncOperation(200);
      
      this._log('success', `Configuration deployed: ${config.name}`);
    }
    
    return true;
  }
  
  /**
   * Verify the deployment was successful
   * @private
   * @returns {Promise} A promise that resolves when verification is complete
   */
  async _verifyDeployment() {
    this._log('info', `Verifying deployment in ${this.environment} environment`);
    
    // Simulate verification process
    await this._simulateAsyncOperation(1000);
    
    // Verify each component
    for (const component of this.components) {
      this._log('info', `Verifying ${component}...`);
      await this._simulateAsyncOperation(300);
      this._log('success', `${component} verified successfully`);
    }
    
    this._log('success', 'Deployment verification completed successfully');
    return true;
  }
  
  /**
   * Get themes to deploy
   * @private
   * @returns {Promise<Array>} A promise that resolves with the themes to deploy
   */
  async _getThemesToDeploy() {
    // In a real implementation, this would fetch actual themes from a repository
    // For demo purposes, we'll return mock data
    await this._simulateAsyncOperation(300);
    
    return [
      { name: 'Corporate Blue', version: '1.2.0', files: 5 },
      { name: 'Modern Dark', version: '1.1.0', files: 4 },
      { name: 'Light Mode', version: '1.0.1', files: 3 },
      { name: 'Minimalist', version: '1.3.0', files: 3 },
      { name: 'Technical', version: '1.0.0', files: 4 }
    ];
  }
  
  /**
   * Get templates to deploy
   * @private
   * @returns {Promise<Array>} A promise that resolves with the templates to deploy
   */
  async _getTemplatesToDeploy() {
    // In a real implementation, this would fetch actual templates from a repository
    // For demo purposes, we'll return mock data
    await this._simulateAsyncOperation(300);
    
    return [
      { name: 'Executive Summary', version: '1.1.0', sections: 4 },
      { name: 'Detailed Assessment', version: '1.2.0', sections: 8 },
      { name: 'Technical Report', version: '1.0.1', sections: 6 },
      { name: 'Compliance Report', version: '1.3.0', sections: 5 }
    ];
  }
  
  /**
   * Get configurations to deploy
   * @private
   * @returns {Promise<Array>} A promise that resolves with the configurations to deploy
   */
  async _getConfigurationsToDeploy() {
    // In a real implementation, this would fetch actual configurations from a repository
    // For demo purposes, we'll return mock data
    await this._simulateAsyncOperation(200);
    
    return [
      { name: 'System Settings', type: 'json' },
      { name: 'User Preferences', type: 'json' },
      { name: 'Theme Registry', type: 'json' },
      { name: 'Template Registry', type: 'json' },
      { name: 'API Configuration', type: 'json' }
    ];
  }
  
  /**
   * Simulate an asynchronous operation
   * @param {number} ms - The number of milliseconds to wait
   * @returns {Promise} A promise that resolves after the specified time
   * @private
   */
  _simulateAsyncOperation(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
  
  /**
   * Create a deployment dashboard UI
   * @param {string} containerId - The ID of the container element
   * @returns {Object} The dashboard controller
   */
  createDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element not found: ${containerId}`);
    }
    
    // Create dashboard elements
    container.innerHTML = `
      <div class="deployment-dashboard">
        <div class="dashboard-header">
          <h2>Deployment Dashboard</h2>
          <div class="environment-selector">
            <label for="environment-select">Environment:</label>
            <select id="environment-select">
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
        
        <div class="dashboard-content">
          <div class="deployment-config">
            <div class="config-item">
              <label for="version-input">Version:</label>
              <input type="text" id="version-input" value="${this.version}" />
            </div>
            
            <div class="config-item">
              <label>Components:</label>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" value="themes" ${this.components.includes('themes') ? 'checked' : ''} />
                  Themes
                </label>
                <label>
                  <input type="checkbox" value="templates" ${this.components.includes('templates') ? 'checked' : ''} />
                  Templates
                </label>
                <label>
                  <input type="checkbox" value="configurations" ${this.components.includes('configurations') ? 'checked' : ''} />
                  Configurations
                </label>
              </div>
            </div>
            
            <div class="action-buttons">
              <button id="deploy-button" class="primary-button">Deploy</button>
              <button id="cancel-button" class="secondary-button" disabled>Cancel</button>
            </div>
          </div>
          
          <div class="deployment-progress">
            <div class="progress-header">
              <h3>Deployment Progress</h3>
              <span id="progress-status">Not started</span>
            </div>
            
            <div class="progress-bar-container">
              <div id="progress-bar" class="progress-bar" style="width: 0%;"></div>
            </div>
            
            <div id="steps-container" class="deployment-steps">
              ${this.deploymentSteps.map((step, index) => `
                <div class="deployment-step" data-step="${index}">
                  <div class="step-indicator">${index + 1}</div>
                  <div class="step-details">
                    <div class="step-name">${step.name}</div>
                    <div class="step-status">${step.status}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="deployment-logs">
            <div class="logs-header">
              <h3>Deployment Logs</h3>
              <button id="clear-logs-button" class="text-button">Clear</button>
            </div>
            
            <div id="logs-container" class="logs-container"></div>
          </div>
        </div>
      </div>
      
      <style>
        .deployment-dashboard {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #dee2e6;
        }
        
        .dashboard-header h2 {
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
        
        .dashboard-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          grid-template-rows: auto 1fr;
          gap: 20px;
        }
        
        .deployment-config {
          grid-column: 1;
          grid-row: 1;
          background-color: white;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .config-item {
          margin-bottom: 15px;
        }
        
        .config-item label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          font-size: 0.9rem;
        }
        
        .config-item input[type="text"] {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: normal;
          cursor: pointer;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
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
        
        .primary-button:disabled {
          background-color: #a6c8e7;
          cursor: not-allowed;
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
        
        .secondary-button:disabled {
          background-color: #ced4da;
          cursor: not-allowed;
        }
        
        .text-button {
          background-color: transparent;
          color: #0066cc;
          border: none;
          padding: 5px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .text-button:hover {
          color: #0056b3;
          text-decoration: underline;
        }
        
        .deployment-progress {
          grid-column: 2;
          grid-row: 1;
          background-color: white;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .progress-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #495057;
        }
        
        #progress-status {
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .progress-bar-container {
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #0066cc;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .deployment-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .deployment-step {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        
        .step-indicator {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 600;
        }
        
        .deployment-step[data-status="completed"] .step-indicator {
          background-color: #28a745;
          color: white;
        }
        
        .deployment-step[data-status="in-progress"] .step-indicator {
          background-color: #0066cc;
          color: white;
        }
        
        .deployment-step[data-status="failed"] .step-indicator {
          background-color: #dc3545;
          color: white;
        }
        
        .step-details {
          flex: 1;
        }
        
        .step-name {
          font-size: 0.95rem;
          margin-bottom: 3px;
        }
        
        .step-status {
          font-size: 0.85rem;
          color: #6c757d;
        }
        
        .deployment-logs {
          grid-column: 1 / span 2;
          grid-row: 2;
          background-color: white;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .logs-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #495057;
        }
        
        .logs-container {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 10px;
          height: 300px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        
        .log-entry {
          margin-bottom: 5px;
          padding: 3px 0;
          border-bottom: 1px solid #f1f1f1;
        }
        
        .log-timestamp {
          color: #6c757d;
          margin-right: 8px;
        }
        
        .log-level {
          display: inline-block;
          padding: 1px 5px;
          border-radius: 3px;
          margin-right: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .log-level-info {
          background-color: #e7f5ff;
          color: #0066cc;
        }
        
        .log-level-success {
          background-color: #e8f5e9;
          color: #28a745;
        }
        
        .log-level-warning {
          background-color: #fff8e6;
          color: #ffc107;
        }
        
        .log-level-error {
          background-color: #ffebee;
          color: #dc3545;
        }
        
        .log-message {
          color: #212529;
        }
        
        @media (max-width: 768px) {
          .dashboard-content {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }
          
          .deployment-config,
          .deployment-progress,
          .deployment-logs {
            grid-column: 1;
          }
          
          .deployment-config {
            grid-row: 1;
          }
          
          .deployment-progress {
            grid-row: 2;
          }
          
          .deployment-logs {
            grid-row: 3;
          }
        }
      </style>
    `;
    
    // Get dashboard elements
    const environmentSelect = document.getElementById('environment-select');
    const versionInput = document.getElementById('version-input');
    const componentCheckboxes = container.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const deployButton = document.getElementById('deploy-button');
    const cancelButton = document.getElementById('cancel-button');
    const progressStatus = document.getElementById('progress-status');
    const progressBar = document.getElementById('progress-bar');
    const stepsContainer = document.getElementById('steps-container');
    const logsContainer = document.getElementById('logs-container');
    const clearLogsButton = document.getElementById('clear-logs-button');
    
    // Set initial values
    environmentSelect.value = this.environment;
    versionInput.value = this.version;
    
    // Update deployment steps when environment changes
    environmentSelect.addEventListener('change', () => {
      this.environment = environmentSelect.value;
      this._initializeDeploymentSteps();
      
      // Update steps UI
      stepsContainer.innerHTML = this.deploymentSteps.map((step, index) => `
        <div class="deployment-step" data-step="${index}">
          <div class="step-indicator">${index + 1}</div>
          <div class="step-details">
            <div class="step-name">${step.name}</div>
            <div class="step-status">${step.status}</div>
          </div>
        </div>
      `).join('');
    });
    
    // Deploy button click handler
    deployButton.addEventListener('click', async () => {
      // Update configuration
      this.version = versionInput.value;
      this.components = Array.from(componentCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
      
      // Validate configuration
      if (this.components.length === 0) {
        alert('Please select at least one component to deploy');
        return;
      }
      
      // Update UI
      deployButton.disabled = true;
      cancelButton.disabled = false;
      progressStatus.textContent = 'Deploying...';
      logsContainer.innerHTML = '';
      
      // Initialize deployment steps
      this._initializeDeploymentSteps();
      
      // Update steps UI
      stepsContainer.innerHTML = this.deploymentSteps.map((step, index) => `
        <div class="deployment-step" data-step="${index}" data-status="${step.status}">
          <div class="step-indicator">${index + 1}</div>
          <div class="step-details">
            <div class="step-name">${step.name}</div>
            <div class="step-status">${step.status}</div>
          </div>
        </div>
      `).join('');
      
      // Start deployment
      try {
        await this.deploy();
      } catch (error) {
        console.error('Deployment failed:', error);
      }
    });
    
    // Cancel button click handler
    cancelButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel the deployment?')) {
        this.cancelDeployment();
      }
    });
    
    // Clear logs button click handler
    clearLogsButton.addEventListener('click', () => {
      logsContainer.innerHTML = '';
    });
    
    // Progress callback
    this.onProgress = (progress) => {
      progressBar.style.width = `${progress.progress}%`;
      progressStatus.textContent = `${progress.step}/${progress.totalSteps}: ${progress.name} (${progress.status})`;
      
      // Update step status
      const stepElement = stepsContainer.querySelector(`[data-step="${progress.step - 1}"]`);
      if (stepElement) {
        stepElement.setAttribute('data-status', progress.status);
        stepElement.querySelector('.step-status').textContent = progress.status;
      }
    };
    
    // Complete callback
    this.onComplete = (result) => {
      progressStatus.textContent = `Deployment completed successfully in ${result.duration.toFixed(2)}s`;
      deployButton.disabled = false;
      cancelButton.disabled = true;
    };
    
    // Error callback
    this.onError = (error) => {
      progressStatus.textContent = `Deployment failed: ${error.error}`;
      deployButton.disabled = false;
      cancelButton.disabled = true;
    };
    
    // Log callback
    const originalLog = this._log;
    this._log = (level, message) => {
      const log = originalLog.call(this, level, message);
      
      // Add log to UI
      const logElement = document.createElement('div');
      logElement.className = 'log-entry';
      logElement.innerHTML = `
        <span class="log-timestamp">${log.timestamp.toLocaleTimeString()}</span>
        <span class="log-level log-level-${level}">${level}</span>
        <span class="log-message">${message}</span>
      `;
      
      logsContainer.appendChild(logElement);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      return log;
    };
    
    return {
      deploy: () => deployButton.click(),
      cancel: () => cancelButton.click(),
      setEnvironment: (env) => {
        environmentSelect.value = env;
        environmentSelect.dispatchEvent(new Event('change'));
      },
      setVersion: (version) => {
        versionInput.value = version;
      },
      setComponents: (components) => {
        componentCheckboxes.forEach(checkbox => {
          checkbox.checked = components.includes(checkbox.value);
        });
      },
      clearLogs: () => {
        logsContainer.innerHTML = '';
      }
    };
  }
}

// Export the DeploymentScript class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeploymentScript;
} else if (typeof window !== 'undefined') {
  window.DeploymentScript = DeploymentScript;
}
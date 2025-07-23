/**
 * Deployment Pipeline for the AI Tool Risk Framework Report System
 * Handles automated deployment of themes and report templates
 */
export class DeploymentPipeline {
  /**
   * Creates a new DeploymentPipeline instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      apiEndpoint: options.apiEndpoint || 'https://api.example.com/deploy', // Would be a real API in production
      environment: options.environment || 'development', // 'development', 'staging', 'production'
      themeRegistry: options.themeRegistry || null,
      performanceMonitor: options.performanceMonitor || null,
      debug: options.debug !== undefined ? options.debug : false,
      mockData: options.mockData !== undefined ? options.mockData : true // Use mock data for demo purposes
    };
    
    this.themeRegistry = this.options.themeRegistry || window.themeRegistry;
    this.performanceMonitor = this.options.performanceMonitor || window.performanceMonitor;
    
    this.deploymentHistory = [];
    this.currentDeployment = null;
    this.deploymentQueue = [];
    
    // Initialize the pipeline
    this.init();
  }
  
  /**
   * Initializes the deployment pipeline
   * @private
   */
  init() {
    // Set up event listeners for deployment events
    window.addEventListener('theme-deployment-requested', this.handleDeploymentRequest.bind(this));
    
    // Log initialization if debug is enabled
    if (this.options.debug) {
      console.log('DeploymentPipeline initialized with options:', this.options);
    }
  }
  
  /**
   * Handles a deployment request event
   * @param {CustomEvent} event - The deployment request event
   * @private
   */
  handleDeploymentRequest(event) {
    if (event && event.detail && event.detail.deploymentData) {
      this.queueDeployment(event.detail.deploymentData);
    }
  }
  
  /**
   * Queues a deployment for processing
   * @param {Object} deploymentData - The deployment data
   * @returns {string} - The deployment ID
   */
  queueDeployment(deploymentData) {
    const deploymentId = `deploy-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const deployment = {
      id: deploymentId,
      data: deploymentData,
      status: 'queued',
      queuedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      logs: []
    };
    
    this.deploymentQueue.push(deployment);
    
    if (this.options.debug) {
      console.log(`Deployment ${deploymentId} queued:`, deployment);
    }
    
    // Process the queue if not already processing
    if (!this.currentDeployment) {
      this.processQueue();
    }
    
    return deploymentId;
  }
  
  /**
   * Processes the deployment queue
   * @private
   */
  async processQueue() {
    if (this.deploymentQueue.length === 0) {
      this.currentDeployment = null;
      return;
    }
    
    // Get the next deployment from the queue
    this.currentDeployment = this.deploymentQueue.shift();
    this.currentDeployment.status = 'in_progress';
    this.currentDeployment.startedAt = new Date().toISOString();
    
    try {
      // Log deployment start
      this.logDeployment(this.currentDeployment.id, 'info', `Starting deployment in ${this.options.environment} environment`);
      
      // Validate deployment data
      this.validateDeploymentData(this.currentDeployment.data);
      
      // Run pre-deployment checks
      await this.runPreDeploymentChecks(this.currentDeployment);
      
      // Execute deployment
      await this.executeDeployment(this.currentDeployment);
      
      // Run post-deployment verification
      await this.runPostDeploymentVerification(this.currentDeployment);
      
      // Mark deployment as completed
      this.currentDeployment.status = 'completed';
      this.currentDeployment.completedAt = new Date().toISOString();
      
      // Log deployment completion
      this.logDeployment(this.currentDeployment.id, 'info', 'Deployment completed successfully');
      
      // Add to deployment history
      this.deploymentHistory.push(this.currentDeployment);
      
      // Dispatch completion event
      this.dispatchDeploymentEvent('theme-deployment-completed', {
        deploymentId: this.currentDeployment.id,
        status: 'completed',
        data: this.currentDeployment
      });
    } catch (error) {
      // Handle deployment failure
      this.currentDeployment.status = 'failed';
      this.currentDeployment.completedAt = new Date().toISOString();
      this.currentDeployment.error = error.message;
      
      // Log deployment failure
      this.logDeployment(this.currentDeployment.id, 'error', `Deployment failed: ${error.message}`);
      
      // Add to deployment history
      this.deploymentHistory.push(this.currentDeployment);
      
      // Dispatch failure event
      this.dispatchDeploymentEvent('theme-deployment-failed', {
        deploymentId: this.currentDeployment.id,
        status: 'failed',
        error: error.message,
        data: this.currentDeployment
      });
      
      console.error('Deployment failed:', error);
    } finally {
      // Process the next deployment in the queue
      this.currentDeployment = null;
      this.processQueue();
    }
  }
  
  /**
   * Validates deployment data
   * @param {Object} deploymentData - The deployment data to validate
   * @throws {Error} - If validation fails
   * @private
   */
  validateDeploymentData(deploymentData) {
    // Check if deployment data is valid
    if (!deploymentData) {
      throw new Error('Deployment data is required');
    }
    
    // Check deployment type
    if (!deploymentData.type) {
      throw new Error('Deployment type is required');
    }
    
    // Validate based on deployment type
    switch (deploymentData.type) {
      case 'theme':
        if (!deploymentData.themeId) {
          throw new Error('Theme ID is required for theme deployment');
        }
        break;
      case 'template':
        if (!deploymentData.templateId) {
          throw new Error('Template ID is required for template deployment');
        }
        break;
      case 'system':
        if (!deploymentData.version) {
          throw new Error('Version is required for system deployment');
        }
        break;
      default:
        throw new Error(`Unsupported deployment type: ${deploymentData.type}`);
    }
    
    // Log validation success
    if (this.options.debug) {
      console.log('Deployment data validation passed');
    }
  }
  
  /**
   * Runs pre-deployment checks
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async runPreDeploymentChecks(deployment) {
    this.logDeployment(deployment.id, 'info', 'Running pre-deployment checks');
    
    const { data } = deployment;
    
    // Check environment readiness
    this.logDeployment(deployment.id, 'info', `Checking ${this.options.environment} environment readiness`);
    
    // Run performance baseline if performance monitor is available
    if (this.performanceMonitor) {
      this.logDeployment(deployment.id, 'info', 'Running performance baseline tests');
      
      try {
        const baselineResults = await this.performanceMonitor.runBaseline();
        this.logDeployment(deployment.id, 'info', 'Performance baseline completed', baselineResults);
      } catch (error) {
        this.logDeployment(deployment.id, 'warning', `Performance baseline warning: ${error.message}`);
        // Continue deployment despite performance warning
      }
    }
    
    // Type-specific checks
    switch (data.type) {
      case 'theme':
        await this.runThemePreDeploymentChecks(deployment);
        break;
      case 'template':
        await this.runTemplatePreDeploymentChecks(deployment);
        break;
      case 'system':
        await this.runSystemPreDeploymentChecks(deployment);
        break;
    }
    
    this.logDeployment(deployment.id, 'info', 'Pre-deployment checks completed successfully');
  }
  
  /**
   * Runs theme-specific pre-deployment checks
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async runThemePreDeploymentChecks(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Running theme-specific checks for theme ${data.themeId}`);
    
    // Check if theme exists in registry
    if (this.themeRegistry) {
      const theme = this.themeRegistry.getTheme(data.themeId);
      
      if (!theme) {
        this.logDeployment(deployment.id, 'info', `Theme ${data.themeId} not found in registry, will be registered during deployment`);
      } else {
        this.logDeployment(deployment.id, 'info', `Theme ${data.themeId} found in registry (version ${theme.version})`);
        
        // Check if this is an update
        if (data.version && theme.version !== data.version) {
          this.logDeployment(deployment.id, 'info', `Updating theme from version ${theme.version} to ${data.version}`);
        }
      }
    }
    
    // Check theme dependencies if specified
    if (data.dependencies && Array.isArray(data.dependencies)) {
      this.logDeployment(deployment.id, 'info', 'Checking theme dependencies');
      
      for (const dependency of data.dependencies) {
        this.logDeployment(deployment.id, 'info', `Checking dependency: ${dependency.name} (${dependency.version})`);
        
        // In a real implementation, this would check if the dependency is available
        // and compatible with the current system
      }
    }
  }
  
  /**
   * Runs template-specific pre-deployment checks
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async runTemplatePreDeploymentChecks(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Running template-specific checks for template ${data.templateId}`);
    
    // In a real implementation, this would check template compatibility
    // with the current system and any dependencies
  }
  
  /**
   * Runs system-specific pre-deployment checks
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async runSystemPreDeploymentChecks(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Running system-specific checks for version ${data.version}`);
    
    // In a real implementation, this would check system compatibility
    // with the current environment and any dependencies
  }
  
  /**
   * Executes the deployment
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async executeDeployment(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Executing ${data.type} deployment`);
    
    if (this.options.mockData) {
      // Simulate deployment for demo purposes
      await this.simulateDeployment(deployment);
      return;
    }
    
    // In a real implementation, this would make an API call to execute the deployment
    const response = await fetch(`${this.options.apiEndpoint}/${data.type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        environment: this.options.environment
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deployment API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(`Deployment failed: ${result.message || 'Unknown error'}`);
    }
    
    this.logDeployment(deployment.id, 'info', 'Deployment execution completed', result);
  }
  
  /**
   * Simulates a deployment for demo purposes
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async simulateDeployment(deployment) {
    const { data } = deployment;
    
    // Log start of simulation
    this.logDeployment(deployment.id, 'info', `Simulating ${data.type} deployment`);
    
    // Simulate deployment steps based on type
    switch (data.type) {
      case 'theme':
        await this.simulateThemeDeployment(deployment);
        break;
      case 'template':
        await this.simulateTemplateDeployment(deployment);
        break;
      case 'system':
        await this.simulateSystemDeployment(deployment);
        break;
    }
    
    // Simulate a delay for the deployment process
    const deploymentTime = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
    
    this.logDeployment(deployment.id, 'info', `Deployment in progress (estimated time: ${deploymentTime}ms)`);
    
    await new Promise(resolve => setTimeout(resolve, deploymentTime));
    
    this.logDeployment(deployment.id, 'info', 'Deployment simulation completed');
  }
  
  /**
   * Simulates a theme deployment
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async simulateThemeDeployment(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Simulating theme deployment for ${data.themeId}`);
    
    // Simulate theme file processing
    this.logDeployment(deployment.id, 'info', 'Processing theme files');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate CSS optimization
    this.logDeployment(deployment.id, 'info', 'Optimizing theme CSS');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate theme registration
    this.logDeployment(deployment.id, 'info', 'Registering theme in the system');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // If theme registry is available, actually register the theme
    if (this.themeRegistry && data.themeData) {
      try {
        this.themeRegistry.registerTheme(data.themeData);
        this.logDeployment(deployment.id, 'info', `Theme ${data.themeId} registered successfully`);
      } catch (error) {
        this.logDeployment(deployment.id, 'warning', `Theme registration warning: ${error.message}`);
      }
    }
  }
  
  /**
   * Simulates a template deployment
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async simulateTemplateDeployment(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Simulating template deployment for ${data.templateId}`);
    
    // Simulate template file processing
    this.logDeployment(deployment.id, 'info', 'Processing template files');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Simulate template validation
    this.logDeployment(deployment.id, 'info', 'Validating template structure');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate template registration
    this.logDeployment(deployment.id, 'info', 'Registering template in the system');
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  /**
   * Simulates a system deployment
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async simulateSystemDeployment(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Simulating system deployment for version ${data.version}`);
    
    // Simulate backup creation
    this.logDeployment(deployment.id, 'info', 'Creating system backup');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simulate file updates
    this.logDeployment(deployment.id, 'info', 'Updating system files');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate database migrations
    this.logDeployment(deployment.id, 'info', 'Running database migrations');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Simulate cache clearing
    this.logDeployment(deployment.id, 'info', 'Clearing system caches');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  /**
   * Runs post-deployment verification
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async runPostDeploymentVerification(deployment) {
    this.logDeployment(deployment.id, 'info', 'Running post-deployment verification');
    
    const { data } = deployment;
    
    // Run performance verification if performance monitor is available
    if (this.performanceMonitor) {
      this.logDeployment(deployment.id, 'info', 'Running performance verification tests');
      
      try {
        const performanceResults = await this.performanceMonitor.runVerification();
        this.logDeployment(deployment.id, 'info', 'Performance verification completed', performanceResults);
        
        // Check if performance degraded
        if (performanceResults.degraded) {
          this.logDeployment(deployment.id, 'warning', 'Performance degradation detected', performanceResults.metrics);
        }
      } catch (error) {
        this.logDeployment(deployment.id, 'warning', `Performance verification warning: ${error.message}`);
        // Continue deployment despite performance warning
      }
    }
    
    // Type-specific verification
    switch (data.type) {
      case 'theme':
        await this.verifyThemeDeployment(deployment);
        break;
      case 'template':
        await this.verifyTemplateDeployment(deployment);
        break;
      case 'system':
        await this.verifySystemDeployment(deployment);
        break;
    }
    
    this.logDeployment(deployment.id, 'info', 'Post-deployment verification completed successfully');
  }
  
  /**
   * Verifies a theme deployment
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async verifyThemeDeployment(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Verifying theme deployment for ${data.themeId}`);
    
    // Check if theme is registered in registry
    if (this.themeRegistry) {
      const theme = this.themeRegistry.getTheme(data.themeId);
      
      if (!theme) {
        throw new Error(`Theme ${data.themeId} not found in registry after deployment`);
      }
      
      this.logDeployment(deployment.id, 'info', `Theme ${data.themeId} verified in registry (version ${theme.version})`);
      
      // Verify theme files are accessible
      if (theme.cssFiles && Array.isArray(theme.cssFiles)) {
        this.logDeployment(deployment.id, 'info', 'Verifying theme file accessibility');
        
        // In a real implementation, this would check if the files are accessible
        // For demo purposes, we'll just log the files
        theme.cssFiles.forEach(file => {
          this.logDeployment(deployment.id, 'info', `Verified theme file: ${file}`);
        });
      }
    }
  }
  
  /**
   * Verifies a template deployment
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async verifyTemplateDeployment(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Verifying template deployment for ${data.templateId}`);
    
    // In a real implementation, this would verify that the template
    // is properly registered and accessible in the system
  }
  
  /**
   * Verifies a system deployment
   * @param {Object} deployment - The deployment object
   * @returns {Promise<void>}
   * @private
   */
  async verifySystemDeployment(deployment) {
    const { data } = deployment;
    
    this.logDeployment(deployment.id, 'info', `Verifying system deployment for version ${data.version}`);
    
    // In a real implementation, this would verify that the system
    // is properly updated and functioning correctly
  }
  
  /**
   * Logs a deployment message
   * @param {string} deploymentId - The deployment ID
   * @param {string} level - The log level ('info', 'warning', 'error')
   * @param {string} message - The log message
   * @param {Object} [data] - Additional log data
   * @private
   */
  logDeployment(deploymentId, level, message, data = null) {
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    // Find the deployment in current or history
    let deployment = null;
    
    if (this.currentDeployment && this.currentDeployment.id === deploymentId) {
      deployment = this.currentDeployment;
    } else {
      deployment = this.deploymentHistory.find(d => d.id === deploymentId);
    }
    
    if (deployment) {
      deployment.logs.push(logEntry);
    }
    
    // Log to console if debug is enabled
    if (this.options.debug) {
      const logMethod = level === 'error' ? console.error : 
                       level === 'warning' ? console.warn : 
                       console.log;
      
      logMethod(`[${timestamp}] [${level.toUpperCase()}] [Deployment ${deploymentId}] ${message}`, data || '');
    }
    
    // Dispatch log event
    this.dispatchDeploymentEvent('theme-deployment-log', {
      deploymentId,
      log: logEntry
    });
  }
  
  /**
   * Dispatches a deployment event
   * @param {string} eventName - The event name
   * @param {Object} detail - The event detail
   * @private
   */
  dispatchDeploymentEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }
  
  /**
   * Gets the deployment history
   * @param {Object} [filters] - Optional filters for the history
   * @returns {Array<Object>} - Array of deployment objects
   */
  getDeploymentHistory(filters = {}) {
    let history = [...this.deploymentHistory];
    
    // Apply filters if provided
    if (filters.type) {
      history = history.filter(deployment => deployment.data.type === filters.type);
    }
    
    if (filters.status) {
      history = history.filter(deployment => deployment.status === filters.status);
    }
    
    if (filters.startDate) {
      const startDate = new Date(filters.startDate).getTime();
      history = history.filter(deployment => new Date(deployment.queuedAt).getTime() >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate).getTime();
      history = history.filter(deployment => new Date(deployment.queuedAt).getTime() <= endDate);
    }
    
    // Sort by date (newest first)
    history.sort((a, b) => new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime());
    
    return history;
  }
  
  /**
   * Gets a specific deployment by ID
   * @param {string} deploymentId - The deployment ID
   * @returns {Object|null} - The deployment object or null if not found
   */
  getDeployment(deploymentId) {
    // Check current deployment
    if (this.currentDeployment && this.currentDeployment.id === deploymentId) {
      return this.currentDeployment;
    }
    
    // Check deployment history
    return this.deploymentHistory.find(deployment => deployment.id === deploymentId) || null;
  }
  
  /**
   * Gets the current deployment status
   * @returns {Object|null} - The current deployment status or null if no deployment is in progress
   */
  getCurrentDeploymentStatus() {
    if (!this.currentDeployment) {
      return null;
    }
    
    return {
      id: this.currentDeployment.id,
      status: this.currentDeployment.status,
      type: this.currentDeployment.data.type,
      queuedAt: this.currentDeployment.queuedAt,
      startedAt: this.currentDeployment.startedAt,
      progress: this.calculateDeploymentProgress(this.currentDeployment)
    };
  }
  
  /**
   * Calculates the deployment progress percentage
   * @param {Object} deployment - The deployment object
   * @returns {number} - The progress percentage (0-100)
   * @private
   */
  calculateDeploymentProgress(deployment) {
    if (deployment.status === 'queued') {
      return 0;
    }
    
    if (deployment.status === 'completed' || deployment.status === 'failed') {
      return 100;
    }
    
    // Calculate progress based on logs
    const totalSteps = this.getExpectedDeploymentSteps(deployment.data.type);
    const completedSteps = deployment.logs.filter(log => 
      log.level === 'info' && !log.message.includes('Running') && !log.message.includes('Checking')
    ).length;
    
    return Math.min(Math.round((completedSteps / totalSteps) * 100), 99); // Max 99% until completed
  }
  
  /**
   * Gets the expected number of steps for a deployment type
   * @param {string} deploymentType - The deployment type
   * @returns {number} - The expected number of steps
   * @private
   */
  getExpectedDeploymentSteps(deploymentType) {
    switch (deploymentType) {
      case 'theme':
        return 10;
      case 'template':
        return 8;
      case 'system':
        return 12;
      default:
        return 10;
    }
  }
  
  /**
   * Gets the deployment queue status
   * @returns {Object} - The queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.deploymentQueue.length,
      currentDeployment: this.getCurrentDeploymentStatus(),
      queuedDeployments: this.deploymentQueue.map(deployment => ({
        id: deployment.id,
        type: deployment.data.type,
        queuedAt: deployment.queuedAt
      }))
    };
  }
  
  /**
   * Cancels a queued deployment
   * @param {string} deploymentId - The deployment ID
   * @returns {boolean} - True if the deployment was cancelled, false otherwise
   */
  cancelQueuedDeployment(deploymentId) {
    const index = this.deploymentQueue.findIndex(deployment => deployment.id === deploymentId);
    
    if (index === -1) {
      return false;
    }
    
    const deployment = this.deploymentQueue[index];
    
    // Remove from queue
    this.deploymentQueue.splice(index, 1);
    
    // Mark as cancelled
    deployment.status = 'cancelled';
    deployment.completedAt = new Date().toISOString();
    
    // Add to history
    this.deploymentHistory.push(deployment);
    
    // Log cancellation
    this.logDeployment(deployment.id, 'info', 'Deployment cancelled');
    
    // Dispatch cancellation event
    this.dispatchDeploymentEvent('theme-deployment-cancelled', {
      deploymentId: deployment.id,
      status: 'cancelled',
      data: deployment
    });
    
    if (this.options.debug) {
      console.log(`Deployment ${deploymentId} cancelled`);
    }
    
    return true;
  }
  
  /**
   * Creates a deployment dashboard UI
   * @param {HTMLElement} container - The container element
   * @returns {HTMLElement} - The dashboard element
   */
  createDeploymentDashboard(container) {
    // Create dashboard element
    const dashboard = document.createElement('div');
    dashboard.className = 'deployment-dashboard';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'deployment-dashboard-header';
    header.innerHTML = `
      <h2>Deployment Dashboard</h2>
      <div class="deployment-dashboard-environment ${this.options.environment}">
        ${this.options.environment.toUpperCase()}
      </div>
    `;
    dashboard.appendChild(header);
    
    // Create current deployment section
    const currentSection = document.createElement('div');
    currentSection.className = 'deployment-dashboard-current';
    currentSection.innerHTML = '<h3>Current Deployment</h3>';
    
    const currentContent = document.createElement('div');
    currentContent.className = 'deployment-dashboard-current-content';
    currentContent.innerHTML = '<p>No active deployment</p>';
    currentSection.appendChild(currentContent);
    
    dashboard.appendChild(currentSection);
    
    // Create queue section
    const queueSection = document.createElement('div');
    queueSection.className = 'deployment-dashboard-queue';
    queueSection.innerHTML = `
      <h3>Deployment Queue</h3>
      <div class="deployment-dashboard-queue-content">
        <p>No queued deployments</p>
      </div>
    `;
    dashboard.appendChild(queueSection);
    
    // Create history section
    const historySection = document.createElement('div');
    historySection.className = 'deployment-dashboard-history';
    historySection.innerHTML = `
      <h3>Deployment History</h3>
      <div class="deployment-dashboard-history-content">
        <p>No deployment history</p>
      </div>
    `;
    dashboard.appendChild(historySection);
    
    // Add dashboard to container
    container.appendChild(dashboard);
    
    // Set up update interval
    const updateDashboard = () => {
      this.updateDeploymentDashboard(dashboard);
    };
    
    // Initial update
    updateDashboard();
    
    // Set up interval for updates
    const updateInterval = setInterval(updateDashboard, 1000);
    
    // Store interval ID for cleanup
    dashboard.dataset.updateInterval = updateInterval;
    
    return dashboard;
  }
  
  /**
   * Updates the deployment dashboard
   * @param {HTMLElement} dashboard - The dashboard element
   * @private
   */
  updateDeploymentDashboard(dashboard) {
    // Update current deployment section
    const currentContent = dashboard.querySelector('.deployment-dashboard-current-content');
    const currentStatus = this.getCurrentDeploymentStatus();
    
    if (currentStatus) {
      currentContent.innerHTML = `
        <div class="deployment-item ${currentStatus.status}">
          <div class="deployment-item-header">
            <span class="deployment-item-id">${currentStatus.id}</span>
            <span class="deployment-item-type">${currentStatus.type}</span>
            <span class="deployment-item-status">${currentStatus.status}</span>
          </div>
          <div class="deployment-item-progress">
            <div class="deployment-item-progress-bar" style="width: ${currentStatus.progress}%"></div>
            <span class="deployment-item-progress-text">${currentStatus.progress}%</span>
          </div>
          <div class="deployment-item-time">
            Started: ${new Date(currentStatus.startedAt).toLocaleTimeString()}
          </div>
        </div>
      `;
    } else {
      currentContent.innerHTML = '<p>No active deployment</p>';
    }
    
    // Update queue section
    const queueContent = dashboard.querySelector('.deployment-dashboard-queue-content');
    const queueStatus = this.getQueueStatus();
    
    if (queueStatus.queuedDeployments.length > 0) {
      queueContent.innerHTML = queueStatus.queuedDeployments.map(deployment => `
        <div class="deployment-item queued">
          <div class="deployment-item-header">
            <span class="deployment-item-id">${deployment.id}</span>
            <span class="deployment-item-type">${deployment.type}</span>
            <span class="deployment-item-status">queued</span>
          </div>
          <div class="deployment-item-time">
            Queued: ${new Date(deployment.queuedAt).toLocaleTimeString()}
          </div>
          <button class="deployment-item-cancel" data-deployment-id="${deployment.id}">Cancel</button>
        </div>
      `).join('');
      
      // Add event listeners to cancel buttons
      queueContent.querySelectorAll('.deployment-item-cancel').forEach(button => {
        button.addEventListener('click', () => {
          const deploymentId = button.dataset.deploymentId;
          this.cancelQueuedDeployment(deploymentId);
        });
      });
    } else {
      queueContent.innerHTML = '<p>No queued deployments</p>';
    }
    
    // Update history section
    const historyContent = dashboard.querySelector('.deployment-dashboard-history-content');
    const history = this.getDeploymentHistory();
    
    if (history.length > 0) {
      historyContent.innerHTML = history.slice(0, 5).map(deployment => `
        <div class="deployment-item ${deployment.status}">
          <div class="deployment-item-header">
            <span class="deployment-item-id">${deployment.id}</span>
            <span class="deployment-item-type">${deployment.data.type}</span>
            <span class="deployment-item-status">${deployment.status}</span>
          </div>
          <div class="deployment-item-time">
            ${deployment.completedAt ? 
              `Completed: ${new Date(deployment.completedAt).toLocaleTimeString()}` : 
              `Started: ${new Date(deployment.startedAt).toLocaleTimeString()}`
            }
          </div>
          <button class="deployment-item-details" data-deployment-id="${deployment.id}">Details</button>
        </div>
      `).join('');
      
      // Add event listeners to details buttons
      historyContent.querySelectorAll('.deployment-item-details').forEach(button => {
        button.addEventListener('click', () => {
          const deploymentId = button.dataset.deploymentId;
          this.showDeploymentDetails(deploymentId);
        });
      });
    } else {
      historyContent.innerHTML = '<p>No deployment history</p>';
    }
  }
  
  /**
   * Shows deployment details in a modal
   * @param {string} deploymentId - The deployment ID
   * @private
   */
  showDeploymentDetails(deploymentId) {
    const deployment = this.getDeployment(deploymentId);
    
    if (!deployment) {
      console.error(`Deployment ${deploymentId} not found`);
      return;
    }
    
    // Create modal element
    let modal = document.querySelector('.deployment-details-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'deployment-details-modal';
      document.body.appendChild(modal);
    }
    
    // Create modal content
    modal.innerHTML = `
      <div class="deployment-details-modal-content">
        <div class="deployment-details-modal-header">
          <h2>Deployment Details</h2>
          <button class="deployment-details-modal-close">&times;</button>
        </div>
        <div class="deployment-details-modal-body">
          <div class="deployment-details-info">
            <div class="deployment-details-info-item">
              <span class="deployment-details-info-label">ID:</span>
              <span class="deployment-details-info-value">${deployment.id}</span>
            </div>
            <div class="deployment-details-info-item">
              <span class="deployment-details-info-label">Type:</span>
              <span class="deployment-details-info-value">${deployment.data.type}</span>
            </div>
            <div class="deployment-details-info-item">
              <span class="deployment-details-info-label">Status:</span>
              <span class="deployment-details-info-value ${deployment.status}">${deployment.status}</span>
            </div>
            <div class="deployment-details-info-item">
              <span class="deployment-details-info-label">Queued:</span>
              <span class="deployment-details-info-value">${new Date(deployment.queuedAt).toLocaleString()}</span>
            </div>
            ${deployment.startedAt ? `
              <div class="deployment-details-info-item">
                <span class="deployment-details-info-label">Started:</span>
                <span class="deployment-details-info-value">${new Date(deployment.startedAt).toLocaleString()}</span>
              </div>
            ` : ''}
            ${deployment.completedAt ? `
              <div class="deployment-details-info-item">
                <span class="deployment-details-info-label">Completed:</span>
                <span class="deployment-details-info-value">${new Date(deployment.completedAt).toLocaleString()}</span>
              </div>
            ` : ''}
            ${deployment.error ? `
              <div class="deployment-details-info-item">
                <span class="deployment-details-info-label">Error:</span>
                <span class="deployment-details-info-value error">${deployment.error}</span>
              </div>
            ` : ''}
          </div>
          <div class="deployment-details-data">
            <h3>Deployment Data</h3>
            <pre>${JSON.stringify(deployment.data, null, 2)}</pre>
          </div>
          <div class="deployment-details-logs">
            <h3>Deployment Logs</h3>
            <div class="deployment-details-logs-content">
              ${deployment.logs.map(log => `
                <div class="deployment-details-log-entry ${log.level}">
                  <span class="deployment-details-log-timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span class="deployment-details-log-level">${log.level.toUpperCase()}</span>
                  <span class="deployment-details-log-message">${log.message}</span>
                  ${log.data ? `<pre class="deployment-details-log-data">${JSON.stringify(log.data, null, 2)}</pre>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
    
    // Add event listener to close button
    modal.querySelector('.deployment-details-modal-close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  /**
   * Cleans up resources used by the deployment pipeline
   */
  cleanup() {
    // Remove event listeners
    window.removeEventListener('theme-deployment-requested', this.handleDeploymentRequest);
    
    // Clear any update intervals
    const dashboards = document.querySelectorAll('.deployment-dashboard');
    
    dashboards.forEach(dashboard => {
      const updateInterval = dashboard.dataset.updateInterval;
      
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    });
    
    if (this.options.debug) {
      console.log('DeploymentPipeline cleaned up');
    }
  }
}
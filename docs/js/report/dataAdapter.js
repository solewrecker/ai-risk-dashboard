/**
 * @class DataAdapter
 * @description Base class for data adapters that connect the report system to various data sources
 */
class DataAdapter {
  /**
   * @constructor
   * @param {Object} options - Adapter options
   * @param {string} options.name - Adapter name
   * @param {string} options.type - Adapter type (e.g., 'rest', 'graphql', 'file', 'database')
   * @param {Object} options.config - Adapter-specific configuration
   */
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.type = options.type || 'rest';
    this.config = options.config || {};
    this.status = 'initialized';
    this.lastError = null;
    this.connected = false;
    this.listeners = {};
    
    // Statistics
    this.stats = {
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      lastResponseTime: 0,
      avgResponseTime: 0,
      lastRequestTime: null,
      lastSuccessTime: null,
      lastErrorTime: null,
    };
  }
  
  /**
   * Initialize the adapter
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} - True if initialization was successful
   */
  async initialize(options = {}) {
    try {
      this.status = 'initializing';
      this._dispatchEvent('initializing', { options });
      
      // This method should be overridden by subclasses
      // Perform any necessary setup here
      
      this.status = 'ready';
      this._dispatchEvent('ready', { options });
      return true;
    } catch (error) {
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'initialization' });
      console.error(`[DataAdapter:${this.name}] Initialization error:`, error);
      return false;
    }
  }
  
  /**
   * Connect to the data source
   * @param {Object} options - Connection options
   * @returns {Promise<boolean>} - True if connection was successful
   */
  async connect(options = {}) {
    try {
      this.status = 'connecting';
      this._dispatchEvent('connecting', { options });
      
      // This method should be overridden by subclasses
      // Establish connection to the data source
      
      this.connected = true;
      this.status = 'connected';
      this._dispatchEvent('connected', { options });
      return true;
    } catch (error) {
      this.connected = false;
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'connection' });
      console.error(`[DataAdapter:${this.name}] Connection error:`, error);
      return false;
    }
  }
  
  /**
   * Disconnect from the data source
   * @returns {Promise<boolean>} - True if disconnection was successful
   */
  async disconnect() {
    try {
      if (!this.connected) {
        return true;
      }
      
      this.status = 'disconnecting';
      this._dispatchEvent('disconnecting', {});
      
      // This method should be overridden by subclasses
      // Close connection to the data source
      
      this.connected = false;
      this.status = 'disconnected';
      this._dispatchEvent('disconnected', {});
      return true;
    } catch (error) {
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'disconnection' });
      console.error(`[DataAdapter:${this.name}] Disconnection error:`, error);
      return false;
    }
  }
  
  /**
   * Fetch data from the data source
   * @param {Object} query - Query parameters
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Fetched data
   */
  async fetchData(query = {}, options = {}) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      this.status = 'fetching';
      this._dispatchEvent('fetching', { query, options });
      
      const startTime = performance.now();
      this.stats.requestCount++;
      this.stats.lastRequestTime = new Date();
      
      // This method should be overridden by subclasses
      // Fetch data from the data source
      const result = { success: true, data: [] };
      
      const endTime = performance.now();
      this.stats.lastResponseTime = endTime - startTime;
      this.stats.totalResponseTime += this.stats.lastResponseTime;
      this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.requestCount;
      
      if (result.success) {
        this.stats.successCount++;
        this.stats.lastSuccessTime = new Date();
        this.status = 'connected';
        this._dispatchEvent('data', { query, options, result });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
      return result.data;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'fetch', query, options });
      console.error(`[DataAdapter:${this.name}] Fetch error:`, error);
      throw error;
    }
  }
  
  /**
   * Send data to the data source
   * @param {Object} data - Data to send
   * @param {Object} options - Send options
   * @returns {Promise<Object>} - Response from the data source
   */
  async sendData(data = {}, options = {}) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      this.status = 'sending';
      this._dispatchEvent('sending', { data, options });
      
      const startTime = performance.now();
      this.stats.requestCount++;
      this.stats.lastRequestTime = new Date();
      
      // This method should be overridden by subclasses
      // Send data to the data source
      const result = { success: true, data: { id: 'mock-id' } };
      
      const endTime = performance.now();
      this.stats.lastResponseTime = endTime - startTime;
      this.stats.totalResponseTime += this.stats.lastResponseTime;
      this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.requestCount;
      
      if (result.success) {
        this.stats.successCount++;
        this.stats.lastSuccessTime = new Date();
        this.status = 'connected';
        this._dispatchEvent('sent', { data, options, result });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
      return result.data;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'send', data, options });
      console.error(`[DataAdapter:${this.name}] Send error:`, error);
      throw error;
    }
  }
  
  /**
   * Get the adapter status
   * @returns {Object} - Adapter status information
   */
  getStatus() {
    return {
      name: this.name,
      type: this.type,
      status: this.status,
      connected: this.connected,
      lastError: this.lastError ? this.lastError.message : null,
      stats: { ...this.stats },
    };
  }
  
  /**
   * Reset adapter statistics
   */
  resetStats() {
    this.stats = {
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      lastResponseTime: 0,
      avgResponseTime: 0,
      lastRequestTime: null,
      lastSuccessTime: null,
      lastErrorTime: null,
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
            adapter: this.name,
            type: this.type,
            event,
            timestamp: new Date(),
            ...data,
          });
        } catch (error) {
          console.error(`[DataAdapter:${this.name}] Event listener error:`, error);
        }
      }
    }
    
    // Also dispatch to 'all' listeners
    if (this.listeners['all']) {
      for (const listener of this.listeners['all']) {
        try {
          listener.callback({
            adapter: this.name,
            type: this.type,
            event,
            timestamp: new Date(),
            ...data,
          });
        } catch (error) {
          console.error(`[DataAdapter:${this.name}] Event listener error:`, error);
        }
      }
    }
  }
}

/**
 * @class RestApiAdapter
 * @description Adapter for REST API data sources
 * @extends DataAdapter
 */
class RestApiAdapter extends DataAdapter {
  /**
   * @constructor
   * @param {Object} options - Adapter options
   * @param {string} options.name - Adapter name
   * @param {Object} options.config - Adapter-specific configuration
   * @param {string} options.config.baseUrl - Base URL for the REST API
   * @param {Object} options.config.headers - Default headers for API requests
   * @param {number} options.config.timeout - Request timeout in milliseconds
   * @param {number} options.config.retries - Number of retry attempts for failed requests
   */
  constructor(options = {}) {
    super({
      ...options,
      type: 'rest',
    });
    
    this.config = {
      baseUrl: '',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      retries: 3,
      ...options.config,
    };
    
    this.cache = new Map();
  }
  
  /**
   * Initialize the adapter
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} - True if initialization was successful
   */
  async initialize(options = {}) {
    try {
      this.status = 'initializing';
      this._dispatchEvent('initializing', { options });
      
      // Validate configuration
      if (!this.config.baseUrl) {
        throw new Error('Base URL is required');
      }
      
      // Clear cache
      this.cache.clear();
      
      this.status = 'ready';
      this._dispatchEvent('ready', { options });
      return true;
    } catch (error) {
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'initialization' });
      console.error(`[RestApiAdapter:${this.name}] Initialization error:`, error);
      return false;
    }
  }
  
  /**
   * Connect to the data source
   * @param {Object} options - Connection options
   * @returns {Promise<boolean>} - True if connection was successful
   */
  async connect(options = {}) {
    try {
      this.status = 'connecting';
      this._dispatchEvent('connecting', { options });
      
      // Test connection by making a simple request
      const testUrl = options.testUrl || this.config.baseUrl;
      const response = await this._makeRequest(testUrl, {
        method: 'GET',
        headers: this.config.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status} ${response.statusText}`);
      }
      
      this.connected = true;
      this.status = 'connected';
      this._dispatchEvent('connected', { options });
      return true;
    } catch (error) {
      this.connected = false;
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'connection' });
      console.error(`[RestApiAdapter:${this.name}] Connection error:`, error);
      return false;
    }
  }
  
  /**
   * Fetch data from the REST API
   * @param {Object} query - Query parameters
   * @param {string} query.endpoint - API endpoint
   * @param {string} query.method - HTTP method (GET, POST, etc.)
   * @param {Object} query.params - URL parameters
   * @param {Object} query.data - Request body data
   * @param {Object} options - Fetch options
   * @param {boolean} options.useCache - Whether to use cached data if available
   * @param {number} options.cacheTTL - Cache TTL in milliseconds
   * @returns {Promise<Object>} - Fetched data
   */
  async fetchData(query = {}, options = {}) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      this.status = 'fetching';
      this._dispatchEvent('fetching', { query, options });
      
      const {
        endpoint,
        method = 'GET',
        params = {},
        data = null,
      } = query;
      
      const {
        useCache = true,
        cacheTTL = 60000, // 1 minute
      } = options;
      
      if (!endpoint) {
        throw new Error('Endpoint is required');
      }
      
      // Build URL
      let url = `${this.config.baseUrl}${endpoint}`;
      
      // Add query parameters
      if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          queryParams.append(key, value);
        }
        url += `?${queryParams.toString()}`;
      }
      
      // Check cache
      const cacheKey = `${method}:${url}:${data ? JSON.stringify(data) : ''}`;
      if (useCache && method === 'GET' && this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (cachedData.expires > Date.now()) {
          this.stats.requestCount++;
          this.stats.successCount++;
          this.stats.lastRequestTime = new Date();
          this.stats.lastSuccessTime = new Date();
          this.status = 'connected';
          this._dispatchEvent('data', { query, options, result: { data: cachedData.data, cached: true } });
          return cachedData.data;
        } else {
          this.cache.delete(cacheKey);
        }
      }
      
      const startTime = performance.now();
      this.stats.requestCount++;
      this.stats.lastRequestTime = new Date();
      
      // Make request
      const requestOptions = {
        method,
        headers: { ...this.config.headers },
        timeout: options.timeout || this.config.timeout,
      };
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestOptions.body = JSON.stringify(data);
      }
      
      let response;
      let retries = 0;
      const maxRetries = options.retries || this.config.retries;
      
      while (retries <= maxRetries) {
        try {
          response = await this._makeRequest(url, requestOptions);
          break;
        } catch (error) {
          if (retries === maxRetries) {
            throw error;
          }
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      const endTime = performance.now();
      this.stats.lastResponseTime = endTime - startTime;
      this.stats.totalResponseTime += this.stats.lastResponseTime;
      this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.requestCount;
      this.stats.successCount++;
      this.stats.lastSuccessTime = new Date();
      
      // Cache the result if it's a GET request
      if (useCache && method === 'GET') {
        this.cache.set(cacheKey, {
          data: responseData,
          expires: Date.now() + cacheTTL,
        });
      }
      
      this.status = 'connected';
      this._dispatchEvent('data', { query, options, result: { data: responseData } });
      
      return responseData;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'fetch', query, options });
      console.error(`[RestApiAdapter:${this.name}] Fetch error:`, error);
      throw error;
    }
  }
  
  /**
   * Send data to the REST API
   * @param {Object} data - Data to send
   * @param {string} data.endpoint - API endpoint
   * @param {string} data.method - HTTP method (POST, PUT, PATCH, DELETE)
   * @param {Object} data.params - URL parameters
   * @param {Object} data.body - Request body data
   * @param {Object} options - Send options
   * @returns {Promise<Object>} - Response from the data source
   */
  async sendData(data = {}, options = {}) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      this.status = 'sending';
      this._dispatchEvent('sending', { data, options });
      
      const {
        endpoint,
        method = 'POST',
        params = {},
        body,
      } = data;
      
      if (!endpoint) {
        throw new Error('Endpoint is required');
      }
      
      if (!body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        throw new Error('Request body is required for POST, PUT, and PATCH requests');
      }
      
      // Build URL
      let url = `${this.config.baseUrl}${endpoint}`;
      
      // Add query parameters
      if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          queryParams.append(key, value);
        }
        url += `?${queryParams.toString()}`;
      }
      
      const startTime = performance.now();
      this.stats.requestCount++;
      this.stats.lastRequestTime = new Date();
      
      // Make request
      const requestOptions = {
        method,
        headers: { ...this.config.headers },
        timeout: options.timeout || this.config.timeout,
      };
      
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }
      
      let response;
      let retries = 0;
      const maxRetries = options.retries || this.config.retries;
      
      while (retries <= maxRetries) {
        try {
          response = await this._makeRequest(url, requestOptions);
          break;
        } catch (error) {
          if (retries === maxRetries) {
            throw error;
          }
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      const endTime = performance.now();
      this.stats.lastResponseTime = endTime - startTime;
      this.stats.totalResponseTime += this.stats.lastResponseTime;
      this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.requestCount;
      this.stats.successCount++;
      this.stats.lastSuccessTime = new Date();
      
      // Invalidate cache for affected endpoints
      if (method !== 'GET') {
        this._invalidateCache(endpoint);
      }
      
      this.status = 'connected';
      this._dispatchEvent('sent', { data, options, result: { data: responseData } });
      
      return responseData;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'send', data, options });
      console.error(`[RestApiAdapter:${this.name}] Send error:`, error);
      throw error;
    }
  }
  
  /**
   * Clear the cache
   * @param {string} endpoint - Optional endpoint to clear cache for
   */
  clearCache(endpoint = null) {
    if (endpoint) {
      this._invalidateCache(endpoint);
    } else {
      this.cache.clear();
    }
    this._dispatchEvent('cache_cleared', { endpoint });
  }
  
  /**
   * Make an HTTP request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<Response>} - Fetch response
   * @private
   */
  async _makeRequest(url, options) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }
  
  /**
   * Invalidate cache entries for a specific endpoint
   * @param {string} endpoint - Endpoint to invalidate cache for
   * @private
   */
  _invalidateCache(endpoint) {
    for (const key of this.cache.keys()) {
      if (key.includes(endpoint)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * @class GraphQLAdapter
 * @description Adapter for GraphQL data sources
 * @extends DataAdapter
 */
class GraphQLAdapter extends DataAdapter {
  /**
   * @constructor
   * @param {Object} options - Adapter options
   * @param {string} options.name - Adapter name
   * @param {Object} options.config - Adapter-specific configuration
   * @param {string} options.config.endpoint - GraphQL endpoint URL
   * @param {Object} options.config.headers - Default headers for API requests
   * @param {number} options.config.timeout - Request timeout in milliseconds
   * @param {number} options.config.retries - Number of retry attempts for failed requests
   */
  constructor(options = {}) {
    super({
      ...options,
      type: 'graphql',
    });
    
    this.config = {
      endpoint: '',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      retries: 3,
      ...options.config,
    };
    
    this.cache = new Map();
  }
  
  /**
   * Initialize the adapter
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} - True if initialization was successful
   */
  async initialize(options = {}) {
    try {
      this.status = 'initializing';
      this._dispatchEvent('initializing', { options });
      
      // Validate configuration
      if (!this.config.endpoint) {
        throw new Error('GraphQL endpoint is required');
      }
      
      // Clear cache
      this.cache.clear();
      
      this.status = 'ready';
      this._dispatchEvent('ready', { options });
      return true;
    } catch (error) {
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'initialization' });
      console.error(`[GraphQLAdapter:${this.name}] Initialization error:`, error);
      return false;
    }
  }
  
  /**
   * Connect to the data source
   * @param {Object} options - Connection options
   * @returns {Promise<boolean>} - True if connection was successful
   */
  async connect(options = {}) {
    try {
      this.status = 'connecting';
      this._dispatchEvent('connecting', { options });
      
      // Test connection by making a simple introspection query
      const testQuery = options.testQuery || `{ __schema { queryType { name } } }`;
      
      const response = await this._makeRequest({
        query: testQuery,
      });
      
      if (response.errors) {
        throw new Error(`Connection test failed: ${response.errors[0].message}`);
      }
      
      this.connected = true;
      this.status = 'connected';
      this._dispatchEvent('connected', { options });
      return true;
    } catch (error) {
      this.connected = false;
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'connection' });
      console.error(`[GraphQLAdapter:${this.name}] Connection error:`, error);
      return false;
    }
  }
  
  /**
   * Fetch data from the GraphQL API
   * @param {Object} query - Query parameters
   * @param {string} query.query - GraphQL query
   * @param {Object} query.variables - GraphQL variables
   * @param {string} query.operationName - GraphQL operation name
   * @param {Object} options - Fetch options
   * @param {boolean} options.useCache - Whether to use cached data if available
   * @param {number} options.cacheTTL - Cache TTL in milliseconds
   * @returns {Promise<Object>} - Fetched data
   */
  async fetchData(query = {}, options = {}) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      this.status = 'fetching';
      this._dispatchEvent('fetching', { query, options });
      
      const {
        query: graphqlQuery,
        variables = {},
        operationName = null,
      } = query;
      
      const {
        useCache = true,
        cacheTTL = 60000, // 1 minute
      } = options;
      
      if (!graphqlQuery) {
        throw new Error('GraphQL query is required');
      }
      
      // Check cache
      const cacheKey = `${graphqlQuery}:${JSON.stringify(variables)}:${operationName || ''}`;
      if (useCache && this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (cachedData.expires > Date.now()) {
          this.stats.requestCount++;
          this.stats.successCount++;
          this.stats.lastRequestTime = new Date();
          this.stats.lastSuccessTime = new Date();
          this.status = 'connected';
          this._dispatchEvent('data', { query, options, result: { data: cachedData.data, cached: true } });
          return cachedData.data;
        } else {
          this.cache.delete(cacheKey);
        }
      }
      
      const startTime = performance.now();
      this.stats.requestCount++;
      this.stats.lastRequestTime = new Date();
      
      // Make request
      const requestBody = {
        query: graphqlQuery,
        variables,
      };
      
      if (operationName) {
        requestBody.operationName = operationName;
      }
      
      let response;
      let retries = 0;
      const maxRetries = options.retries || this.config.retries;
      
      while (retries <= maxRetries) {
        try {
          response = await this._makeRequest(requestBody, options);
          break;
        } catch (error) {
          if (retries === maxRetries) {
            throw error;
          }
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (response.errors) {
        throw new Error(`GraphQL query failed: ${response.errors[0].message}`);
      }
      
      const responseData = response.data;
      
      const endTime = performance.now();
      this.stats.lastResponseTime = endTime - startTime;
      this.stats.totalResponseTime += this.stats.lastResponseTime;
      this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.requestCount;
      this.stats.successCount++;
      this.stats.lastSuccessTime = new Date();
      
      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, {
          data: responseData,
          expires: Date.now() + cacheTTL,
        });
      }
      
      this.status = 'connected';
      this._dispatchEvent('data', { query, options, result: { data: responseData } });
      
      return responseData;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'fetch', query, options });
      console.error(`[GraphQLAdapter:${this.name}] Fetch error:`, error);
      throw error;
    }
  }
  
  /**
   * Send data to the GraphQL API (mutation)
   * @param {Object} data - Data to send
   * @param {string} data.mutation - GraphQL mutation
   * @param {Object} data.variables - GraphQL variables
   * @param {string} data.operationName - GraphQL operation name
   * @param {Object} options - Send options
   * @returns {Promise<Object>} - Response from the data source
   */
  async sendData(data = {}, options = {}) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      this.status = 'sending';
      this._dispatchEvent('sending', { data, options });
      
      const {
        mutation,
        variables = {},
        operationName = null,
      } = data;
      
      if (!mutation) {
        throw new Error('GraphQL mutation is required');
      }
      
      const startTime = performance.now();
      this.stats.requestCount++;
      this.stats.lastRequestTime = new Date();
      
      // Make request
      const requestBody = {
        query: mutation,
        variables,
      };
      
      if (operationName) {
        requestBody.operationName = operationName;
      }
      
      let response;
      let retries = 0;
      const maxRetries = options.retries || this.config.retries;
      
      while (retries <= maxRetries) {
        try {
          response = await this._makeRequest(requestBody, options);
          break;
        } catch (error) {
          if (retries === maxRetries) {
            throw error;
          }
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (response.errors) {
        throw new Error(`GraphQL mutation failed: ${response.errors[0].message}`);
      }
      
      const responseData = response.data;
      
      const endTime = performance.now();
      this.stats.lastResponseTime = endTime - startTime;
      this.stats.totalResponseTime += this.stats.lastResponseTime;
      this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.requestCount;
      this.stats.successCount++;
      this.stats.lastSuccessTime = new Date();
      
      // Clear cache as mutation may have changed data
      this.cache.clear();
      
      this.status = 'connected';
      this._dispatchEvent('sent', { data, options, result: { data: responseData } });
      
      return responseData;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'send', data, options });
      console.error(`[GraphQLAdapter:${this.name}] Send error:`, error);
      throw error;
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
    this._dispatchEvent('cache_cleared', {});
  }
  
  /**
   * Make a GraphQL request
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - GraphQL response
   * @private
   */
  async _makeRequest(body, options = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);
    
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { ...this.config.headers },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }
}

/**
 * @class LocalStorageAdapter
 * @description Adapter for localStorage data source
 * @extends DataAdapter
 */
class LocalStorageAdapter extends DataAdapter {
  /**
   * @constructor
   * @param {Object} options - Adapter options
   * @param {string} options.name - Adapter name
   * @param {Object} options.config - Adapter-specific configuration
   * @param {string} options.config.prefix - Key prefix for localStorage items
   */
  constructor(options = {}) {
    super({
      ...options,
      type: 'localStorage',
    });
    
    this.config = {
      prefix: 'report_system_',
      ...options.config,
    };
  }
  
  /**
   * Initialize the adapter
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} - True if initialization was successful
   */
  async initialize(options = {}) {
    try {
      this.status = 'initializing';
      this._dispatchEvent('initializing', { options });
      
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        throw new Error('localStorage is not available');
      }
      
      // Test localStorage
      const testKey = `${this.config.prefix}test`;
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (testValue !== 'test') {
        throw new Error('localStorage test failed');
      }
      
      this.status = 'ready';
      this._dispatchEvent('ready', { options });
      return true;
    } catch (error) {
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'initialization' });
      console.error(`[LocalStorageAdapter:${this.name}] Initialization error:`, error);
      return false;
    }
  }
  
  /**
   * Connect to the data source
   * @param {Object} options - Connection options
   * @returns {Promise<boolean>} - True if connection was successful
   */
  async connect(options = {}) {
    try {
      this.status = 'connecting';
      this._dispatchEvent('connecting', { options });
      
      // No actual connection needed for localStorage
      this.connected = true;
      this.status = 'connected';
      this._dispatchEvent('connected', { options });
      return true;
    } catch (error) {
      this.connected = false;
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'connection' });
      console.error(`[LocalStorageAdapter:${this.name}] Connection error:`, error);
      return false;
    }
  }
  
  /**
   * Fetch data from localStorage
   * @param {Object} query - Query parameters
   * @param {string} query.key - Key to fetch (without prefix)
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Fetched data
   */
  async fetchData(query = {}, options = {}) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      this.status = 'fetching';
      this._dispatchEvent('fetching', { query, options });
      
      const { key } = query;
      
      if (!key) {
        throw new Error('Key is required');
      }
      
      const startTime = performance.now();
      this.stats.requestCount++;
      this.stats.lastRequestTime = new Date();
      
      const fullKey = `${this.config.prefix}${key}`;
      const value = localStorage.getItem(fullKey);
      
      let data = null;
      
      if (value !== null) {
        try {
          data = JSON.parse(value);
        } catch (e) {
          data = value;
        }
      }
      
      const endTime = performance.now();
      this.stats.lastResponseTime = endTime - startTime;
      this.stats.totalResponseTime += this.stats.lastResponseTime;
      this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.requestCount;
      this.stats.successCount++;
      this.stats.lastSuccessTime = new Date();
      
      this.status = 'connected';
      this._dispatchEvent('data', { query, options, result: { data } });
      
      return data;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'fetch', query, options });
      console.error(`[LocalStorageAdapter:${this.name}] Fetch error:`, error);
      throw error;
    }
  }
  
  /**
   * Send data to localStorage
   * @param {Object} data - Data to send
   * @param {string} data.key - Key to set (without prefix)
   * @param {*} data.value - Value to set
   * @param {Object} options - Send options
   * @returns {Promise<Object>} - Response from the data source
   */
  async sendData(data = {}, options = {}) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      this.status = 'sending';
      this._dispatchEvent('sending', { data, options });
      
      const { key, value } = data;
      
      if (!key) {
        throw new Error('Key is required');
      }
      
      if (value === undefined) {
        throw new Error('Value is required');
      }
      
      const startTime = performance.now();
      this.stats.requestCount++;
      this.stats.lastRequestTime = new Date();
      
      const fullKey = `${this.config.prefix}${key}`;
      
      if (value === null) {
        localStorage.removeItem(fullKey);
      } else {
        const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
        localStorage.setItem(fullKey, valueToStore);
      }
      
      const endTime = performance.now();
      this.stats.lastResponseTime = endTime - startTime;
      this.stats.totalResponseTime += this.stats.lastResponseTime;
      this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.requestCount;
      this.stats.successCount++;
      this.stats.lastSuccessTime = new Date();
      
      this.status = 'connected';
      this._dispatchEvent('sent', { data, options, result: { success: true, key } });
      
      return { success: true, key };
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastErrorTime = new Date();
      this.status = 'error';
      this.lastError = error;
      this._dispatchEvent('error', { error, phase: 'send', data, options });
      console.error(`[LocalStorageAdapter:${this.name}] Send error:`, error);
      throw error;
    }
  }
  
  /**
   * List all keys in localStorage with the adapter's prefix
   * @returns {Promise<Array<string>>} - List of keys (without prefix)
   */
  async listKeys() {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      const keys = [];
      const prefixLength = this.config.prefix.length;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.config.prefix)) {
          keys.push(key.substring(prefixLength));
        }
      }
      
      return keys;
    } catch (error) {
      console.error(`[LocalStorageAdapter:${this.name}] List keys error:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all items with the adapter's prefix from localStorage
   * @returns {Promise<boolean>} - True if successful
   */
  async clear() {
    try {
      if (!this.connected) {
        throw new Error('Not connected to data source');
      }
      
      const keys = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.config.prefix)) {
          keys.push(key);
        }
      }
      
      for (const key of keys) {
        localStorage.removeItem(key);
      }
      
      this._dispatchEvent('cleared', { count: keys.length });
      
      return true;
    } catch (error) {
      console.error(`[LocalStorageAdapter:${this.name}] Clear error:`, error);
      throw error;
    }
  }
}

/**
 * @class DataAdapterFactory
 * @description Factory for creating data adapters
 */
class DataAdapterFactory {
  /**
   * Create a data adapter
   * @param {string} type - Adapter type
   * @param {Object} options - Adapter options
   * @returns {DataAdapter} - Data adapter instance
   */
  static createAdapter(type, options = {}) {
    switch (type.toLowerCase()) {
      case 'rest':
        return new RestApiAdapter(options);
      case 'graphql':
        return new GraphQLAdapter(options);
      case 'localstorage':
        return new LocalStorageAdapter(options);
      default:
        throw new Error(`Unsupported adapter type: ${type}`);
    }
  }
}

/**
 * @class DataAdapterManager
 * @description Manages multiple data adapters
 */
class DataAdapterManager {
  /**
   * @constructor
   */
  constructor() {
    this.adapters = new Map();
    this.listeners = {};
  }
  
  /**
   * Register a data adapter
   * @param {string} name - Adapter name
   * @param {DataAdapter} adapter - Data adapter instance
   * @returns {boolean} - True if adapter was registered successfully
   */
  registerAdapter(name, adapter) {
    if (this.adapters.has(name)) {
      console.warn(`Adapter with name '${name}' already exists. Overwriting.`);
    }
    
    this.adapters.set(name, adapter);
    
    // Forward adapter events
    adapter.addEventListener('all', (event) => {
      this._dispatchEvent('adapter_event', {
        adapter: name,
        event,
      });
    });
    
    this._dispatchEvent('adapter_registered', { name, adapter });
    
    return true;
  }
  
  /**
   * Unregister a data adapter
   * @param {string} name - Adapter name
   * @returns {boolean} - True if adapter was unregistered successfully
   */
  unregisterAdapter(name) {
    if (!this.adapters.has(name)) {
      return false;
    }
    
    const adapter = this.adapters.get(name);
    
    // Disconnect adapter if connected
    if (adapter.connected) {
      adapter.disconnect().catch(error => {
        console.error(`Error disconnecting adapter '${name}':`, error);
      });
    }
    
    this.adapters.delete(name);
    
    this._dispatchEvent('adapter_unregistered', { name });
    
    return true;
  }
  
  /**
   * Get a data adapter by name
   * @param {string} name - Adapter name
   * @returns {DataAdapter|null} - Data adapter instance or null if not found
   */
  getAdapter(name) {
    return this.adapters.get(name) || null;
  }
  
  /**
   * Get all registered adapters
   * @returns {Object} - Map of adapter names to adapter instances
   */
  getAdapters() {
    return Object.fromEntries(this.adapters.entries());
  }
  
  /**
   * Initialize all adapters
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} - Map of adapter names to initialization results
   */
  async initializeAll(options = {}) {
    const results = {};
    
    for (const [name, adapter] of this.adapters.entries()) {
      results[name] = await adapter.initialize(options);
    }
    
    return results;
  }
  
  /**
   * Connect all adapters
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} - Map of adapter names to connection results
   */
  async connectAll(options = {}) {
    const results = {};
    
    for (const [name, adapter] of this.adapters.entries()) {
      results[name] = await adapter.connect(options);
    }
    
    return results;
  }
  
  /**
   * Disconnect all adapters
   * @returns {Promise<Object>} - Map of adapter names to disconnection results
   */
  async disconnectAll() {
    const results = {};
    
    for (const [name, adapter] of this.adapters.entries()) {
      results[name] = await adapter.disconnect();
    }
    
    return results;
  }
  
  /**
   * Get status of all adapters
   * @returns {Object} - Map of adapter names to status information
   */
  getStatus() {
    const status = {};
    
    for (const [name, adapter] of this.adapters.entries()) {
      status[name] = adapter.getStatus();
    }
    
    return status;
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
          console.error(`[DataAdapterManager] Event listener error:`, error);
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
          console.error(`[DataAdapterManager] Event listener error:`, error);
        }
      }
    }
  }
}

// Export classes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataAdapter,
    RestApiAdapter,
    GraphQLAdapter,
    LocalStorageAdapter,
    DataAdapterFactory,
    DataAdapterManager,
  };
} else if (typeof window !== 'undefined') {
  window.DataAdapter = DataAdapter;
  window.RestApiAdapter = RestApiAdapter;
  window.GraphQLAdapter = GraphQLAdapter;
  window.LocalStorageAdapter = LocalStorageAdapter;
  window.DataAdapterFactory = DataAdapterFactory;
  window.DataAdapterManager = DataAdapterManager;
}
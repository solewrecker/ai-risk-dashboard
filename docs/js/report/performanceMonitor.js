/**
 * Performance Monitor for the AI Tool Risk Framework Report System
 * Tracks and analyzes performance metrics
 */
export class PerformanceMonitor {
  /**
   * Creates a new PerformanceMonitor instance
   */
  constructor() {
    this.metrics = {
      reportGenerationTime: [],
      themeLoadTime: [],
      renderTime: [],
      memoryUsage: []
    };
    
    this.baselineMetrics = null;
    this.markers = new Map();
    
    // Initialize
    this.init();
  }
  
  /**
   * Initializes the performance monitor
   * @private
   */
  init() {
    // Listen for theme change events to measure performance
    document.addEventListener('themechange', event => {
      const { theme } = event.detail;
      
      // End theme load measurement if it exists
      if (this.markers.has('themeLoad')) {
        const result = this.endMeasurement(this.markers.get('themeLoad'));
        console.log(`Theme ${theme} loaded in ${result.duration.toFixed(2)}ms`);
      }
    });
    
    // Try to load baseline metrics from localStorage
    this.loadBaselineMetrics();
  }
  
  /**
   * Loads baseline metrics from localStorage
   * @private
   */
  loadBaselineMetrics() {
    try {
      const storedBaseline = localStorage.getItem('performance_baseline');
      
      if (storedBaseline) {
        this.baselineMetrics = JSON.parse(storedBaseline);
        console.log('Loaded performance baseline metrics');
      }
    } catch (error) {
      console.error('Failed to load baseline metrics:', error);
    }
  }
  
  /**
   * Saves baseline metrics to localStorage
   * @private
   */
  saveBaselineMetrics() {
    try {
      localStorage.setItem('performance_baseline', JSON.stringify(this.baselineMetrics));
      console.log('Saved performance baseline metrics');
    } catch (error) {
      console.error('Failed to save baseline metrics:', error);
    }
  }
  
  /**
   * Starts monitoring a performance event
   * @param {string} eventName - The name of the event
   * @returns {Object} - The performance marker
   */
  startMeasurement(eventName) {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const marker = {
      eventName,
      startTime,
      startMemory
    };
    
    // Store marker for later reference
    this.markers.set(eventName, marker);
    
    return marker;
  }
  
  /**
   * Ends a performance measurement and records metrics
   * @param {Object} marker - The performance marker from startMeasurement
   * @returns {Object} - The measurement results
   */
  endMeasurement(marker) {
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    const duration = endTime - marker.startTime;
    const memoryDelta = endMemory - marker.startMemory;
    
    // Record metrics
    if (this.metrics[marker.eventName]) {
      this.metrics[marker.eventName].push(duration);
    } else {
      this.metrics[marker.eventName] = [duration];
    }
    
    this.metrics.memoryUsage.push(memoryDelta);
    
    // Remove marker
    this.markers.delete(marker.eventName);
    
    return {
      eventName: marker.eventName,
      duration,
      memoryDelta
    };
  }
  
  /**
   * Gets current memory usage if available
   * @returns {number} - Memory usage in MB
   */
  getMemoryUsage() {
    if (window.performance && window.performance.memory) {
      return window.performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    return 0;
  }
  
  /**
   * Sets the current metrics as the baseline
   */
  setCurrentAsBaseline() {
    this.baselineMetrics = {};
    
    // Calculate average for each metric
    for (const [metricName, values] of Object.entries(this.metrics)) {
      if (values.length > 0) {
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        this.baselineMetrics[metricName] = average;
      }
    }
    
    // Save to localStorage
    this.saveBaselineMetrics();
    
    return this.baselineMetrics;
  }
  
  /**
   * Compares current metrics with baseline
   * @returns {Object} - Comparison results
   */
  compareWithBaseline() {
    if (!this.baselineMetrics) {
      return { available: false };
    }
    
    const results = { available: true, metrics: {} };
    
    // Compare each metric
    for (const [metricName, values] of Object.entries(this.metrics)) {
      if (!values.length) continue;
      
      const currentAvg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const baselineAvg = this.baselineMetrics[metricName];
      
      if (baselineAvg) {
        const percentChange = ((currentAvg - baselineAvg) / baselineAvg) * 100;
        
        results.metrics[metricName] = {
          current: currentAvg,
          baseline: baselineAvg,
          percentChange,
          improved: percentChange < 0
        };
      }
    }
    
    return results;
  }
  
  /**
   * Measures the time it takes to run a function
   * @param {Function} fn - The function to measure
   * @param {string} eventName - The name of the event
   * @returns {any} - The result of the function
   */
  measure(fn, eventName) {
    const marker = this.startMeasurement(eventName);
    
    try {
      return fn();
    } finally {
      this.endMeasurement(marker);
    }
  }
  
  /**
   * Measures the time it takes to run an async function
   * @param {Function} asyncFn - The async function to measure
   * @param {string} eventName - The name of the event
   * @returns {Promise<any>} - The result of the async function
   */
  async measureAsync(asyncFn, eventName) {
    const marker = this.startMeasurement(eventName);
    
    try {
      return await asyncFn();
    } finally {
      this.endMeasurement(marker);
    }
  }
  
  /**
   * Gets the average value for a metric
   * @param {string} metricName - The name of the metric
   * @returns {number|null} - The average value or null if no data
   */
  getAverageMetric(metricName) {
    const values = this.metrics[metricName];
    
    if (!values || values.length === 0) {
      return null;
    }
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  /**
   * Clears all metrics
   */
  clearMetrics() {
    for (const key in this.metrics) {
      this.metrics[key] = [];
    }
  }
  
  /**
   * Creates a performance report
   * @returns {Object} - The performance report
   */
  createReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {},
      comparison: this.compareWithBaseline()
    };
    
    // Add average metrics
    for (const [metricName, values] of Object.entries(this.metrics)) {
      if (values.length > 0) {
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        report.metrics[metricName] = {
          average,
          min: Math.min(...values),
          max: Math.max(...values),
          samples: values.length
        };
      }
    }
    
    return report;
  }
  
  /**
   * Creates a performance dashboard UI
   * @param {HTMLElement} container - The container element
   */
  createPerformanceDashboard(container) {
    // Create dashboard container
    const dashboard = document.createElement('div');
    dashboard.className = 'performance-dashboard';
    
    // Create heading
    const heading = document.createElement('h3');
    heading.textContent = 'Performance Metrics';
    dashboard.appendChild(heading);
    
    // Create metrics container
    const metricsContainer = document.createElement('div');
    metricsContainer.className = 'performance-dashboard__metrics';
    dashboard.appendChild(metricsContainer);
    
    // Create actions container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'performance-dashboard__actions';
    dashboard.appendChild(actionsContainer);
    
    // Create set baseline button
    const setBaselineButton = document.createElement('button');
    setBaselineButton.className = 'performance-dashboard__button';
    setBaselineButton.textContent = 'Set Current as Baseline';
    setBaselineButton.addEventListener('click', () => {
      this.setCurrentAsBaseline();
      this.updateDashboard(metricsContainer);
    });
    actionsContainer.appendChild(setBaselineButton);
    
    // Create clear metrics button
    const clearButton = document.createElement('button');
    clearButton.className = 'performance-dashboard__button';
    clearButton.textContent = 'Clear Metrics';
    clearButton.addEventListener('click', () => {
      this.clearMetrics();
      this.updateDashboard(metricsContainer);
    });
    actionsContainer.appendChild(clearButton);
    
    // Initial update
    this.updateDashboard(metricsContainer);
    
    // Add update interval
    setInterval(() => {
      this.updateDashboard(metricsContainer);
    }, 2000);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .performance-dashboard {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
      }
      
      .performance-dashboard h3 {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      
      .performance-dashboard__metrics {
        margin-bottom: 1rem;
      }
      
      .performance-dashboard__metric {
        margin-bottom: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--color-border-light, #eee);
      }
      
      .performance-dashboard__metric-name {
        font-weight: bold;
        margin-bottom: 0.25rem;
      }
      
      .performance-dashboard__metric-value {
        display: flex;
        align-items: center;
      }
      
      .performance-dashboard__metric-bar {
        height: 8px;
        background: var(--color-primary-light, #e6f0fa);
        border-radius: 4px;
        margin-right: 0.5rem;
        flex-grow: 1;
        position: relative;
      }
      
      .performance-dashboard__metric-bar-fill {
        height: 100%;
        background: var(--color-primary, #0066cc);
        border-radius: 4px;
        width: 0%;
      }
      
      .performance-dashboard__metric-bar-baseline {
        position: absolute;
        height: 100%;
        border-right: 2px dashed var(--color-secondary, #ff6600);
        top: 0;
      }
      
      .performance-dashboard__metric-number {
        min-width: 100px;
        text-align: right;
        font-family: monospace;
      }
      
      .performance-dashboard__metric-change {
        min-width: 80px;
        text-align: right;
        font-family: monospace;
        margin-left: 0.5rem;
      }
      
      .performance-dashboard__metric-change--improved {
        color: var(--color-success, #00aa00);
      }
      
      .performance-dashboard__metric-change--worse {
        color: var(--color-error, #cc0000);
      }
      
      .performance-dashboard__actions {
        display: flex;
        gap: 0.5rem;
      }
      
      .performance-dashboard__button {
        padding: 0.5rem 1rem;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        background: var(--color-background, #fff);
        color: var(--color-text, #333);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .performance-dashboard__button:hover {
        background: var(--color-background-hover, #f5f5f5);
      }
    `;
    document.head.appendChild(style);
    
    container.appendChild(dashboard);
  }
  
  /**
   * Updates the performance dashboard
   * @param {HTMLElement} container - The metrics container element
   * @private
   */
  updateDashboard(container) {
    // Clear container
    container.innerHTML = '';
    
    // Get comparison results
    const comparison = this.compareWithBaseline();
    
    // Create metric elements
    for (const [metricName, values] of Object.entries(this.metrics)) {
      if (values.length === 0) continue;
      
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const max = Math.max(...values);
      
      // Create metric container
      const metricElement = document.createElement('div');
      metricElement.className = 'performance-dashboard__metric';
      
      // Create metric name
      const nameElement = document.createElement('div');
      nameElement.className = 'performance-dashboard__metric-name';
      nameElement.textContent = this.formatMetricName(metricName);
      metricElement.appendChild(nameElement);
      
      // Create metric value
      const valueElement = document.createElement('div');
      valueElement.className = 'performance-dashboard__metric-value';
      
      // Create metric bar
      const barElement = document.createElement('div');
      barElement.className = 'performance-dashboard__metric-bar';
      
      const barFillElement = document.createElement('div');
      barFillElement.className = 'performance-dashboard__metric-bar-fill';
      barFillElement.style.width = `${(average / max) * 100}%`;
      barElement.appendChild(barFillElement);
      
      // Add baseline marker if available
      if (comparison.available && comparison.metrics[metricName]) {
        const baselineValue = comparison.metrics[metricName].baseline;
        const baselinePercent = (baselineValue / max) * 100;
        
        const baselineElement = document.createElement('div');
        baselineElement.className = 'performance-dashboard__metric-bar-baseline';
        baselineElement.style.left = `${baselinePercent}%`;
        barElement.appendChild(baselineElement);
      }
      
      valueElement.appendChild(barElement);
      
      // Create metric number
      const numberElement = document.createElement('div');
      numberElement.className = 'performance-dashboard__metric-number';
      numberElement.textContent = this.formatMetricValue(metricName, average);
      valueElement.appendChild(numberElement);
      
      // Add comparison if available
      if (comparison.available && comparison.metrics[metricName]) {
        const change = comparison.metrics[metricName].percentChange;
        const improved = comparison.metrics[metricName].improved;
        
        const changeElement = document.createElement('div');
        changeElement.className = `performance-dashboard__metric-change ${improved ? 'performance-dashboard__metric-change--improved' : 'performance-dashboard__metric-change--worse'}`;
        changeElement.textContent = `${improved ? '↓' : '↑'} ${Math.abs(change).toFixed(1)}%`;
        valueElement.appendChild(changeElement);
      }
      
      metricElement.appendChild(valueElement);
      container.appendChild(metricElement);
    }
    
    // Show message if no metrics
    if (container.children.length === 0) {
      const message = document.createElement('div');
      message.textContent = 'No performance data available yet.';
      container.appendChild(message);
    }
  }
  
  /**
   * Formats a metric name for display
   * @param {string} metricName - The metric name
   * @returns {string} - The formatted metric name
   * @private
   */
  formatMetricName(metricName) {
    // Convert camelCase to Title Case with spaces
    return metricName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
  
  /**
   * Formats a metric value for display
   * @param {string} metricName - The metric name
   * @param {number} value - The metric value
   * @returns {string} - The formatted metric value
   * @private
   */
  formatMetricValue(metricName, value) {
    if (metricName.includes('Time')) {
      return `${value.toFixed(2)} ms`;
    } else if (metricName.includes('Memory')) {
      return `${value.toFixed(2)} MB`;
    } else {
      return value.toFixed(2);
    }
  }
}
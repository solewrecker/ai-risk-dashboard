/**
 * PerformanceMonitor Class
 * 
 * @class PerformanceMonitor
 * @description Tracks performance metrics for the report system
 */

export class PerformanceMonitor {
  constructor() {
    this.measurements = new Map();
    this.baselines = new Map();
    this.ongoingMeasurements = new Map();
    
    // Initialize with default baselines
    this.initializeBaselines();
  }
  
  /**
   * Initializes baseline performance metrics
   * @private
   */
  initializeBaselines() {
    // Default baselines for common operations
    this.baselines.set('generate_executive_report', {
      duration: 1200, // milliseconds
      memory: 15 // MB
    });
    
    this.baselines.set('generate_technical_report', {
      duration: 1500, // milliseconds
      memory: 20 // MB
    });
    
    this.baselines.set('theme_load', {
      duration: 300, // milliseconds
      memory: 5 // MB
    });
    
    this.baselines.set('report_render', {
      duration: 800, // milliseconds
      memory: 10 // MB
    });
    
    // Try to load custom baselines from storage
    this.loadBaselinesFromStorage();
  }
  
  /**
   * Loads baseline metrics from local storage if available
   * @private
   */
  loadBaselinesFromStorage() {
    try {
      const storedBaselines = localStorage.getItem('performance_baselines');
      if (storedBaselines) {
        const parsedBaselines = JSON.parse(storedBaselines);
        
        // Merge stored baselines with defaults
        for (const [key, value] of Object.entries(parsedBaselines)) {
          this.baselines.set(key, value);
        }
      }
    } catch (error) {
      console.warn('Failed to load performance baselines from storage:', error);
    }
  }
  
  /**
   * Starts a performance measurement
   * @param {string} key - Unique identifier for the measurement
   * @returns {void}
   */
  startMeasurement(key) {
    // Record start time and memory usage
    const startTime = performance.now();
    let memoryUsage = 0;
    
    // Try to get memory usage if available in the browser
    if (performance.memory) {
      memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    
    this.ongoingMeasurements.set(key, {
      startTime,
      startMemory: memoryUsage,
      markers: []
    });
    
    // Create a performance mark if available
    if (typeof performance.mark === 'function') {
      performance.mark(`${key}_start`);
    }
    
    console.debug(`Performance measurement started: ${key}`);
  }
  
  /**
   * Adds a marker within an ongoing measurement
   * @param {string} key - The measurement identifier
   * @param {string} markerName - Name for this marker point
   * @returns {void}
   */
  addMarker(key, markerName) {
    if (!this.ongoingMeasurements.has(key)) {
      console.warn(`Cannot add marker: No ongoing measurement for key '${key}'`);
      return;
    }
    
    const measurement = this.ongoingMeasurements.get(key);
    const markerTime = performance.now();
    let memoryUsage = 0;
    
    // Try to get memory usage if available
    if (performance.memory) {
      memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    
    // Add marker to the measurement
    measurement.markers.push({
      name: markerName,
      time: markerTime,
      elapsedSinceStart: markerTime - measurement.startTime,
      memory: memoryUsage
    });
    
    // Create a performance mark if available
    if (typeof performance.mark === 'function') {
      performance.mark(`${key}_${markerName}`);
    }
    
    console.debug(`Performance marker added: ${key} - ${markerName}`);
  }
  
  /**
   * Ends a performance measurement
   * @param {string} key - The measurement identifier
   * @param {boolean} [error=false] - Whether the operation ended with an error
   * @returns {Object|null} - The measurement results or null if measurement wasn't started
   */
  endMeasurement(key, error = false) {
    if (!this.ongoingMeasurements.has(key)) {
      console.warn(`Cannot end measurement: No ongoing measurement for key '${key}'`);
      return null;
    }
    
    const measurement = this.ongoingMeasurements.get(key);
    const endTime = performance.now();
    let endMemory = 0;
    
    // Try to get memory usage if available
    if (performance.memory) {
      endMemory = performance.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    
    // Calculate duration and memory usage
    const duration = endTime - measurement.startTime;
    const memoryDelta = endMemory - measurement.startMemory;
    
    // Create a performance measure if available
    if (typeof performance.measure === 'function' && typeof performance.mark === 'function') {
      try {
        performance.mark(`${key}_end`);
        performance.measure(key, `${key}_start`, `${key}_end`);
      } catch (e) {
        console.warn('Error creating performance measure:', e);
      }
    }
    
    // Create the final measurement result
    const result = {
      key,
      duration,
      memoryDelta,
      startTime: measurement.startTime,
      endTime,
      startMemory: measurement.startMemory,
      endMemory,
      markers: measurement.markers,
      timestamp: new Date().toISOString(),
      error
    };
    
    // Store the measurement
    this.measurements.set(key, result);
    
    // Remove from ongoing measurements
    this.ongoingMeasurements.delete(key);
    
    // Compare with baseline if available
    const comparison = this.compareWithBaseline(key, result);
    if (comparison) {
      result.comparison = comparison;
    }
    
    console.debug(`Performance measurement ended: ${key}`, {
      duration: `${duration.toFixed(2)}ms`,
      memory: `${memoryDelta.toFixed(2)}MB`
    });
    
    return result;
  }
  
  /**
   * Compares a measurement with its baseline
   * @private
   * @param {string} key - The measurement identifier
   * @param {Object} measurement - The measurement result
   * @returns {Object|null} - Comparison results or null if no baseline exists
   */
  compareWithBaseline(key, measurement) {
    if (!this.baselines.has(key)) {
      return null;
    }
    
    const baseline = this.baselines.get(key);
    
    // Calculate percentage differences
    const durationDiff = ((measurement.duration - baseline.duration) / baseline.duration) * 100;
    let memoryDiff = 0;
    
    if (baseline.memory && measurement.memoryDelta) {
      memoryDiff = ((measurement.memoryDelta - baseline.memory) / baseline.memory) * 100;
    }
    
    // Determine performance status
    let status = 'normal';
    if (durationDiff > 50 || memoryDiff > 50) {
      status = 'critical';
    } else if (durationDiff > 20 || memoryDiff > 20) {
      status = 'warning';
    } else if (durationDiff < -10 || memoryDiff < -10) {
      status = 'improved';
    }
    
    return {
      durationDiff,
      memoryDiff,
      status,
      baseline
    };
  }
  
  /**
   * Gets the last measurement for a specific key
   * @param {string} key - The measurement identifier
   * @returns {Object|null} - The measurement or null if not found
   */
  getLastMeasurement(key) {
    return this.measurements.get(key) || null;
  }
  
  /**
   * Gets all measurements
   * @returns {Object} - Map of all measurements
   */
  getAllMeasurements() {
    return Object.fromEntries(this.measurements);
  }
  
  /**
   * Updates a baseline with a new measurement
   * @param {string} key - The measurement identifier
   * @param {Object} [measurement=null] - The measurement to use, or the last measurement if null
   * @returns {boolean} - Whether the baseline was updated successfully
   */
  updateBaseline(key, measurement = null) {
    // Use provided measurement or get the last one
    const data = measurement || this.getLastMeasurement(key);
    
    if (!data) {
      console.warn(`Cannot update baseline: No measurement found for key '${key}'`);
      return false;
    }
    
    // Don't update baseline with error measurements
    if (data.error) {
      console.warn(`Cannot update baseline: Measurement for key '${key}' ended with an error`);
      return false;
    }
    
    // Update the baseline
    this.baselines.set(key, {
      duration: data.duration,
      memory: data.memoryDelta
    });
    
    // Save to storage
    this.saveBaselinesToStorage();
    
    console.log(`Performance baseline updated for: ${key}`);
    return true;
  }
  
  /**
   * Saves all baselines to local storage
   * @private
   */
  saveBaselinesToStorage() {
    try {
      const baselineObject = Object.fromEntries(this.baselines);
      localStorage.setItem('performance_baselines', JSON.stringify(baselineObject));
    } catch (error) {
      console.error('Failed to save performance baselines to storage:', error);
    }
  }
  
  /**
   * Clears all measurements but keeps baselines
   * @returns {void}
   */
  clearMeasurements() {
    this.measurements.clear();
    console.log('All performance measurements cleared');
  }
  
  /**
   * Generates a performance report for all measurements
   * @returns {Object} - Performance report data
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      measurements: Object.fromEntries(this.measurements),
      baselines: Object.fromEntries(this.baselines),
      summary: {}
    };
    
    // Generate summary statistics
    const categories = {};
    
    for (const [key, measurement] of this.measurements.entries()) {
      // Extract category from key (e.g., 'generate' from 'generate_executive_report')
      const category = key.split('_')[0];
      
      if (!categories[category]) {
        categories[category] = [];
      }
      
      categories[category].push(measurement);
    }
    
    // Calculate averages for each category
    for (const [category, measurements] of Object.entries(categories)) {
      const totalDuration = measurements.reduce((sum, m) => sum + m.duration, 0);
      const totalMemory = measurements.reduce((sum, m) => sum + (m.memoryDelta || 0), 0);
      const errorCount = measurements.filter(m => m.error).length;
      
      report.summary[category] = {
        count: measurements.length,
        avgDuration: totalDuration / measurements.length,
        avgMemory: totalMemory / measurements.length,
        errorRate: (errorCount / measurements.length) * 100
      };
    }
    
    return report;
  }
}
/**
 * ReportSystemIntegration Class
 * 
 * @class ReportSystemIntegration
 * @description Integration layer between legacy and new report systems with feature flags for controlled rollout
 */

import { ReportSystem } from '../mock-report-system.js';
import { PerformanceMonitor } from './PerformanceMonitor.js';

export class ReportSystemIntegration {
  constructor(legacyReportSystem) {
    this.legacySystem = legacyReportSystem;
    this.newSystem = new ReportSystem();
    this.migrationStatus = new Map();
    this.featureFlags = {};
    this.performanceMonitor = new PerformanceMonitor();
    
    // Initialize with default migration status for report types
    this.initializeMigrationStatus();
  }
  
  /**
   * Initializes the integration layer
   * @returns {Promise<void>}
   */
  async initialize() {
    // Register legacy report types with the new system
    this.registerLegacyReportTypes();
    
    // Initialize feature flags for gradual rollout
    await this.initializeFeatureFlags();
    
    // Setup event listeners for cross-system communication
    this.setupEventListeners();
    
    // Initialize error tracking and fallback mechanisms
    this.initializeErrorTracking();
    
    console.log('Report system integration initialized');
    return Promise.resolve();
  }
  
  /**
   * Initializes the migration status for different report types
   * @private
   */
  initializeMigrationStatus() {
    // Set migration status for each report type
    // true = migrated to new system, false = still using legacy system
    this.migrationStatus.set('executive', true);
    this.migrationStatus.set('technical', true);
    this.migrationStatus.set('comparison', false); // Not yet migrated
    this.migrationStatus.set('custom', false);     // Not yet migrated
  }
  
  /**
   * Initializes feature flags from server or local storage
   * @private
   * @returns {Promise<void>}
   */
  async initializeFeatureFlags() {
    try {
      // Try to fetch feature flags from server
      const response = await fetch('/api/feature-flags');
      if (response.ok) {
        this.featureFlags = await response.json();
        return;
      }
    } catch (error) {
      console.warn('Failed to fetch feature flags from server:', error);
    }
    
    // Fallback to local storage
    try {
      const storedFlags = localStorage.getItem('report_feature_flags');
      if (storedFlags) {
        this.featureFlags = JSON.parse(storedFlags);
      } else {
        // Default feature flags
        this.featureFlags = {
          useNewReportSystem: false,
          enableThemeMarketplace: true,
          enableAdvancedCustomization: false
        };
        
        // Store default flags
        localStorage.setItem('report_feature_flags', JSON.stringify(this.featureFlags));
      }
    } catch (error) {
      console.error('Failed to initialize feature flags:', error);
    }
  }
  
  /**
   * Registers legacy report types with the new system
   * @private
   */
  registerLegacyReportTypes() {
    // Map legacy report types to new system equivalents
    const legacyTypes = this.legacySystem.getAvailableReportTypes();
    
    legacyTypes.forEach(type => {
      if (!this.newSystem.hasReportType(type.id)) {
        this.newSystem.registerLegacyReportType(type.id, type.name, type.config);
      }
    });
  }
  
  /**
   * Sets up event listeners for cross-system communication
   * @private
   */
  setupEventListeners() {
    // Listen for theme changes in the new system
    document.addEventListener('themeChanged', (event) => {
      const { themeId } = event.detail;
      // Sync theme with legacy system if needed
      if (this.legacySystem.supportsThemes) {
        this.legacySystem.setTheme(themeId);
      }
    });
    
    // Listen for report generation requests
    document.addEventListener('generateReport', (event) => {
      const { reportType, data, options } = event.detail;
      this.generateReport(reportType, data, options);
    });
  }
  
  /**
   * Initializes error tracking and fallback mechanisms
   * @private
   */
  initializeErrorTracking() {
    // Set up global error handler for the new system
    window.addEventListener('error', (event) => {
      if (this.isNewSystemError(event)) {
        console.error('New report system error detected:', event.error);
        this.recordErrorMetrics(event.error);
      }
    });
    
    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isNewSystemError(event.reason)) {
        console.error('Unhandled promise rejection in new report system:', event.reason);
        this.recordErrorMetrics(event.reason);
      }
    });
  }
  
  /**
   * Determines if an error originated from the new report system
   * @private
   * @param {Error|any} error - The error to check
   * @returns {boolean} - True if the error is from the new system
   */
  isNewSystemError(error) {
    // Check if error stack contains references to new system modules
    if (error && error.stack) {
      return error.stack.includes('/export/') || 
             error.stack.includes('ReportSystem') || 
             error.stack.includes('themeSystem');
    }
    return false;
  }
  
  /**
   * Records error metrics for monitoring and analysis
   * @private
   * @param {Error|any} error - The error to record
   */
  recordErrorMetrics(error) {
    // Record error for monitoring
    try {
      const errorData = {
        timestamp: new Date().toISOString(),
        message: error.message || 'Unknown error',
        stack: error.stack,
        reportSystem: 'new'
      };
      
      // Send to analytics or store locally
      localStorage.setItem('report_system_errors', 
        JSON.stringify([...JSON.parse(localStorage.getItem('report_system_errors') || '[]'), errorData]));
      
      // Increment error count for this session
      const sessionErrors = parseInt(sessionStorage.getItem('new_system_errors') || '0');
      sessionStorage.setItem('new_system_errors', (sessionErrors + 1).toString());
      
      // If too many errors, disable new system for this session
      if (sessionErrors >= 3) {
        console.warn('Too many errors in new report system, falling back to legacy system');
        this.disableNewSystemTemporarily();
      }
    } catch (e) {
      console.error('Failed to record error metrics:', e);
    }
  }
  
  /**
   * Temporarily disables the new system due to errors
   * @private
   */
  disableNewSystemTemporarily() {
    // Disable new system for this session only
    sessionStorage.setItem('use_legacy_report_system', 'true');
    
    // Update runtime feature flags
    this.featureFlags.useNewReportSystem = false;
    
    // Notify user
    this.showFallbackNotification();
  }
  
  /**
   * Shows a notification that the system has fallen back to legacy mode
   * @private
   */
  showFallbackNotification() {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = 'report-system-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">⚠️</span>
        <span class="notification-message">
          We've temporarily switched to the classic report system due to technical issues.
          Your work is safe and you can continue as normal.
        </span>
        <button class="notification-close">×</button>
      </div>
    `;
    
    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 10000);
  }
  
  /**
   * Determines which report system to use based on report type and feature flags
   * @param {string} reportType - The type of report to generate
   * @returns {string} - Either 'new' or 'legacy'
   */
  determineReportSystem(reportType) {
    // Check if we're forced to use legacy system due to errors
    if (sessionStorage.getItem('use_legacy_report_system') === 'true') {
      return 'legacy';
    }
    
    // Check if this report type has been migrated
    if (!this.migrationStatus.get(reportType)) {
      return 'legacy';
    }
    
    // Check feature flags
    if (!this.featureFlags.useNewReportSystem) {
      return 'legacy';
    }
    
    // Check user's rollout group
    const userGroup = this.getUserRolloutGroup();
    if (userGroup === 'control') {
      return 'legacy';
    }
    
    // Default to new system if all checks pass
    return 'new';
  }
  
  /**
   * Gets the user's rollout group for A/B testing
   * @private
   * @returns {string} - The user's rollout group ('test', 'control', or 'full')
   */
  getUserRolloutGroup() {
    // Check if user has an assigned group
    let group = localStorage.getItem('user_rollout_group');
    
    if (!group) {
      // Assign a random group if not already assigned
      const groups = ['test', 'control', 'full'];
      group = groups[Math.floor(Math.random() * groups.length)];
      localStorage.setItem('user_rollout_group', group);
    }
    
    return group;
  }
  
  /**
   * Generates a report using either the new or legacy system
   * @param {string} reportType - The type of report to generate
   * @param {Object} data - The data for the report
   * @param {Object} options - Options for report generation
   * @returns {Promise<Object>} - The generated report
   */
  async generateReport(reportType, data, options = {}) {
    const systemToUse = this.determineReportSystem(reportType);
    
    // Start performance monitoring
    const perfKey = `generate_${reportType}_report`;
    this.performanceMonitor.startMeasurement(perfKey);
    
    try {
      let report;
      
      if (systemToUse === 'new') {
        console.log(`Using new system for ${reportType} report`);
        report = await this.newSystem.generateReport(reportType, data, options);
      } else {
        console.log(`Using legacy system for ${reportType} report`);
        report = await this.legacySystem.generateReport(reportType, data, options);
      }
      
      // End performance monitoring
      this.performanceMonitor.endMeasurement(perfKey);
      
      // Record successful generation
      this.recordSuccessMetrics(reportType, systemToUse);
      
      return report;
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
      
      // End performance monitoring with error flag
      this.performanceMonitor.endMeasurement(perfKey, true);
      
      // If error in new system, try fallback to legacy
      if (systemToUse === 'new') {
        return this.fallbackToLegacySystem(reportType, data, options, error);
      }
      
      // Re-throw the error if no fallback is possible
      throw error;
    }
  }
  
  /**
   * Falls back to the legacy system when the new system fails
   * @private
   * @param {string} reportType - The type of report to generate
   * @param {Object} data - The data for the report
   * @param {Object} options - Options for report generation
   * @param {Error} originalError - The original error from the new system
   * @returns {Promise<Object>} - The generated report from the legacy system
   */
  async fallbackToLegacySystem(reportType, data, options, originalError) {
    console.warn(`Falling back to legacy system for ${reportType} report due to error:`, originalError);
    
    // Record fallback event
    this.recordFallbackMetrics(reportType, originalError);
    
    try {
      // Start performance monitoring for fallback
      const fallbackPerfKey = `fallback_${reportType}_report`;
      this.performanceMonitor.startMeasurement(fallbackPerfKey);
      
      // Generate report using legacy system
      const report = await this.legacySystem.generateReport(reportType, data, options);
      
      // End performance monitoring
      this.performanceMonitor.endMeasurement(fallbackPerfKey);
      
      // Show fallback notification to user
      this.showFallbackNotification();
      
      return report;
    } catch (fallbackError) {
      console.error(`Fallback to legacy system also failed for ${reportType} report:`, fallbackError);
      
      // Both systems failed, throw a combined error
      const combinedError = new Error(`Report generation failed in both systems. Original error: ${originalError.message}. Fallback error: ${fallbackError.message}`);
      combinedError.originalError = originalError;
      combinedError.fallbackError = fallbackError;
      
      throw combinedError;
    }
  }
  
  /**
   * Records metrics for successful report generation
   * @private
   * @param {string} reportType - The type of report generated
   * @param {string} system - The system used ('new' or 'legacy')
   */
  recordSuccessMetrics(reportType, system) {
    // Record success metrics for monitoring and analysis
    const successData = {
      timestamp: new Date().toISOString(),
      reportType,
      system,
      performance: this.performanceMonitor.getLastMeasurement(`generate_${reportType}_report`)
    };
    
    // Store locally or send to analytics
    try {
      const successLog = JSON.parse(localStorage.getItem('report_generation_success') || '[]');
      successLog.push(successData);
      
      // Keep only the last 50 entries
      if (successLog.length > 50) {
        successLog.shift();
      }
      
      localStorage.setItem('report_generation_success', JSON.stringify(successLog));
    } catch (e) {
      console.error('Failed to record success metrics:', e);
    }
  }
  
  /**
   * Records metrics for system fallbacks
   * @private
   * @param {string} reportType - The type of report that failed
   * @param {Error} error - The error that caused the fallback
   */
  recordFallbackMetrics(reportType, error) {
    // Record fallback metrics for monitoring and analysis
    const fallbackData = {
      timestamp: new Date().toISOString(),
      reportType,
      errorMessage: error.message,
      errorStack: error.stack
    };
    
    // Store locally or send to analytics
    try {
      const fallbackLog = JSON.parse(localStorage.getItem('report_system_fallbacks') || '[]');
      fallbackLog.push(fallbackData);
      
      // Keep only the last 20 entries
      if (fallbackLog.length > 20) {
        fallbackLog.shift();
      }
      
      localStorage.setItem('report_system_fallbacks', JSON.stringify(fallbackLog));
    } catch (e) {
      console.error('Failed to record fallback metrics:', e);
    }
  }
}
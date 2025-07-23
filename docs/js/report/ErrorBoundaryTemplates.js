/**
 * ErrorBoundaryTemplates.js
 * 
 * Provides HTML templates for different types of error boundaries
 * that can be used in the report rendering system.
 */

class ErrorBoundaryTemplates {
  /**
   * Get a template error boundary HTML
   * @param {string} message - The error message to display
   * @param {string} helpText - Additional help text
   * @returns {string} HTML for the error boundary
   */
  static templateNotFound(message = 'Template not found', helpText = 'Please check template registration') {
    return `
      <div class="report-error-boundary report-error-boundary--template-not-found">
        <div class="report-error-boundary__icon">⚠️</div>
        <div class="report-error-boundary__message">${message}</div>
        <div class="report-error-boundary__help-text">${helpText}</div>
      </div>
    `;
  }

  /**
   * Get a section render error boundary HTML
   * @param {string} sectionName - The name of the section that failed to render
   * @param {string} message - The error message to display
   * @returns {string} HTML for the error boundary
   */
  static sectionRenderError(sectionName = 'Section', message = 'Failed to render section') {
    return `
      <div class="report-error-boundary report-error-boundary--section-render-error">
        <div class="report-error-boundary__icon">⚠️</div>
        <div class="report-error-boundary__message">Error in ${sectionName}</div>
        <div class="report-error-boundary__help-text">${message}</div>
      </div>
    `;
  }

  /**
   * Get a critical render error boundary HTML
   * @param {string} message - The error message to display
   * @returns {string} HTML for the error boundary
   */
  static criticalRenderError(message = 'Critical error rendering report') {
    return `
      <div class="report-error-boundary report-error-boundary--critical-render-error">
        <div class="report-error-boundary__icon">❌</div>
        <div class="report-error-boundary__message">Critical Rendering Error</div>
        <div class="report-error-boundary__help-text">${message}</div>
      </div>
    `;
  }

  /**
   * Get a data validation error boundary HTML
   * @param {string} field - The field that failed validation
   * @param {string} message - The error message to display
   * @returns {string} HTML for the error boundary
   */
  static dataValidationError(field = 'Data', message = 'Invalid or missing data') {
    return `
      <div class="report-error-boundary report-error-boundary--fallback-render-error">
        <div class="report-error-boundary__icon">ℹ️</div>
        <div class="report-error-boundary__message">Data Issue: ${field}</div>
        <div class="report-error-boundary__help-text">${message}</div>
      </div>
    `;
  }

  /**
   * Get a fallback content error boundary HTML
   * @param {string} message - The error message to display
   * @param {string} fallbackContent - Fallback content to display
   * @returns {string} HTML for the error boundary with fallback content
   */
  static fallbackContent(message = 'Using fallback content', fallbackContent = '') {
    return `
      <div class="report-error-boundary report-error-boundary--fallback-render-error">
        <div class="report-error-boundary__icon">ℹ️</div>
        <div class="report-error-boundary__message">Notice</div>
        <div class="report-error-boundary__help-text">${message}</div>
        ${fallbackContent ? `<div class="report-error-boundary__fallback">${fallbackContent}</div>` : ''}
      </div>
    `;
  }
}

export default ErrorBoundaryTemplates;
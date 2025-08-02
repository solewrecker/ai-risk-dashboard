/**
 * TemplateRegistry.js
 * 
 * This module provides a registry for managing report templates.
 * It allows registration of both component templates and complete templates.
 */


import standardTemplate from './templates/standard-template.js';
import premiumTemplate from './premium-template.js';
import ErrorBoundaryTemplates from './ErrorBoundaryTemplates.js';

class TemplateRegistry {
  constructor() {
    this.componentTemplates = new Map();
    this.completeTemplates = new Map();
    
    // Register Handlebars helpers
    this.registerHandlebarsHelpers();
    
    // Register default templates
    this.registerDefaultTemplates();
  }

  /**
   * Registers a component template
   * @param {string} name - The name of the component
   * @param {string} templateString - The Handlebars template string
   * @param {Object} options - Additional options for the component
   */
  registerComponent(name, templateString, options = {}) {
    try {
      // Validate the component template
      if (!this.validateComponentTemplate(name, templateString)) {
        console.error(`Component template validation failed for '${name}'`);
        return false;
      }
      
      // Compile the template
      const compiledTemplate = Handlebars.compile(templateString);
      
      this.componentTemplates.set(name, {
        template: compiledTemplate,
        options,
        raw: templateString,
        validated: true
      });
      
      return true;
    } catch (error) {
      console.error(`Error registering component template '${name}':`, error);
      return false;
    }
  }

  /**
 * Registers a complete template
 * @param {string} name - The name of the template
 * @param {string} templateString - The Handlebars template string
 * @param {Array} components - Array of component names used in this template
 * @param {Object} options - Additional options for the template
 */
registerTemplate(name, templateString, components = [], options = {}) {
  try {
    // Validate the template before registering
    if (!this.validateTemplate(name, templateString)) {
      console.error(`Template validation failed for '${name}'`);
      return false;
    }
    
    // Compile the template
    const compiledTemplate = Handlebars.compile(templateString);
    
    this.completeTemplates.set(name, {
      template: compiledTemplate,
      components,
      options,
      raw: templateString,
      validated: true
    });
    
    return true;
  } catch (error) {
    console.error(`Error registering complete template '${name}':`, error);
    return false;
  }
}

  /**
   * Renders a component with the provided data
   * @param {string} componentName - The name of the component to render
   * @param {Object} data - The data to render the component with
   * @returns {string} The rendered HTML
   */
  renderComponent(componentName, data) {
    const component = this.componentTemplates.get(componentName);
    
    if (!component) {
      console.error(`Component '${componentName}' not found in registry`);
      return `<!-- Component '${componentName}' not found -->`;
    }
    
    try {
      return component.template(data);
    } catch (error) {
      console.error(`Error rendering component '${componentName}':`, error);
      return `<!-- Error rendering component '${componentName}' -->`;
    }
  }

  /**
   * Renders a complete template with the provided data
   * @param {string} templateName - The name of the template to render
   * @param {Object} data - The data to render the template with
   * @returns {string} The rendered HTML
   */
  renderTemplate(templateName, data) {
    const template = this.completeTemplates.get(templateName);
    
    if (!template) {
      console.error(`Template '${templateName}' not found in registry`);
      return this.renderErrorBoundary(`Template '${templateName}' not found`, 'template-not-found');
    }
    
    try {
      // Validate data against expected schema
      if (!this.validateDataForTemplate(templateName, data)) {
        console.warn(`Data validation failed for template '${templateName}'. Using fallback data.`);
        // Continue with rendering but use fallback data where needed
        data = this.applyFallbackData(templateName, data);
      }
      
      // Register partial for each component used in this template
      template.components.forEach(componentName => {
        const component = this.componentTemplates.get(componentName);
        if (component) {
          Handlebars.registerPartial(componentName, component.raw);
        }
      });
      
      // Wrap the template rendering in a try-catch to handle section-specific errors
      try {
        return template.template(data);
      } catch (sectionError) {
        console.error(`Error rendering template '${templateName}':`, sectionError);
        // Try to render with error boundaries around problematic sections
        return this.renderWithErrorBoundaries(templateName, data, sectionError);
      }
    } catch (error) {
      console.error(`Critical error rendering template '${templateName}':`, error);
      return this.renderErrorBoundary(`Error rendering template '${templateName}'`, 'critical-render-error');
    }
  }

  /**
   * Gets a template by name
   * @param {string} templateName - The name of the template to retrieve
   * @returns {Object|null} The template object or null if not found
   */
  getTemplate(templateName) {
    const template = this.completeTemplates.get(templateName);
    
    if (!template) {
      console.error(`Template '${templateName}' not found in registry`);
      return null;
    }
    
    return template.raw;
  }

  /**
   * Renders a custom template with selected components
   * @param {Array} componentNames - Array of component names to include
   * @param {Object} data - The data to render the components with
   * @returns {string} The rendered HTML
   */
  renderCustomTemplate(componentNames, data) {
    try {
      let renderedHtml = '';
      
      // Render each component and concatenate
      componentNames.forEach(componentName => {
        renderedHtml += this.renderComponent(componentName, data);
      });
      
      return renderedHtml || '<div class="error-message">No components selected</div>';
    } catch (error) {
      console.error('Error rendering custom template:', error);
      return ErrorBoundaryTemplates.criticalRenderError('Error rendering custom template');
    }
  }

  /**
   * Gets a list of all registered component names
   * @returns {Array} Array of component names
   */
  getComponentNames() {
    return Array.from(this.componentTemplates.keys());
  }

  /**
   * Gets a list of all registered template names
   * @returns {Array} Array of template names
   */
  getTemplateNames() {
    return Array.from(this.completeTemplates.keys());
  }
  
  /**
   * Gets a template by name
   * @param {string} name - The name of the template to get
   * @returns {string|null} The template string or null if not found
   */
  getTemplate(name) {
    const template = this.completeTemplates.get(name);
    if (!template) {
      console.error(`Template '${name}' not found in registry`);
      return null;
    }
    return template.raw;
  }
  
  /**
   * Register default templates
   */
  registerDefaultTemplates() {
    this.registerTemplate('standard', standardTemplate, {});
    this.registerTemplate('premium', premiumTemplate, {});
  }
  
  /**
   * Validates a template before registration
   * @param {string} name - The name of the template
   * @param {string} templateString - The template string to validate
   * @returns {boolean} Whether the template is valid
   */
  validateTemplate(name, templateString) {
    // Basic validation
    if (!name || typeof name !== 'string') {
      console.error('Template name must be a non-empty string');
      return false;
    }
    
    if (!templateString || typeof templateString !== 'string') {
      console.error(`Template string for '${name}' must be a non-empty string`);
      return false;
    }
    
    // Check for malicious scripts
    if (templateString.includes('<script>') && !templateString.includes('{{#if') && !templateString.includes('{{#each')) {
      console.error(`Template '${name}' contains potentially unsafe <script> tags`);
      return false;
    }
    
    // Check for required sections in the template
    const requiredSections = [
      'report-header',
      'report-main'
    ];
    
    const missingSections = requiredSections.filter(section => !templateString.includes(section));
    if (missingSections.length > 0) {
      console.error(`Template '${name}' is missing required sections: ${missingSections.join(', ')}`);
      return false;
    }
    
    // Check for required Handlebars expressions
    const requiredExpressions = [
      '{{name}}',
      '{{vendor}}'
    ];
    
    const missingExpressions = requiredExpressions.filter(expr => !templateString.includes(expr));
    if (missingExpressions.length > 0) {
      console.error(`Template '${name}' is missing required expressions: ${missingExpressions.join(', ')}`);
      return false;
    }
    
    // Try to compile the template to catch syntax errors
    try {
      Handlebars.compile(templateString);
    } catch (error) {
      console.error(`Template '${name}' has syntax errors: ${error.message}`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates a component template before registration
   * @param {string} name - The name of the component template
   * @param {string} templateString - The component template string to validate
   * @returns {boolean} Whether the component template is valid
   */
  validateComponentTemplate(name, templateString) {
    // Basic validation
    if (!name || typeof name !== 'string') {
      console.error('Component template name must be a non-empty string');
      return false;
    }
    
    if (!templateString || typeof templateString !== 'string') {
      console.error(`Component template string for '${name}' must be a non-empty string`);
      return false;
    }
    
    // Check for malicious scripts
    if (templateString.includes('<script>') && !templateString.includes('{{#if') && !templateString.includes('{{#each')) {
      console.error(`Component template '${name}' contains potentially unsafe <script> tags`);
      return false;
    }
    
    // Components are more flexible than complete templates, so we don't check for specific sections
    // But we do check for valid Handlebars syntax
    try {
      Handlebars.compile(templateString);
    } catch (error) {
      console.error(`Component template '${name}' has syntax errors: ${error.message}`);
      return false;
    }
    
    return true;
  }

  /**
   * Renders an error boundary with a message
   * @param {string} message - The error message to display
   * @param {string} errorType - The type of error for CSS styling
   * @returns {string} HTML for the error boundary
   */
  renderErrorBoundary(message, errorType = 'critical-render-error') {
    switch (errorType) {
      case 'template-not-found':
        return ErrorBoundaryTemplates.templateNotFound(message);
      case 'section-render-error':
        return ErrorBoundaryTemplates.sectionRenderError('Template Section', message);
      case 'data-validation-error':
        return ErrorBoundaryTemplates.dataValidationError('Template Data', message);
      case 'critical-render-error':
      default:
        return ErrorBoundaryTemplates.criticalRenderError(message);
    }
  }
  
  /**
   * Attempts to render a template with error boundaries around problematic sections
   * @param {string} templateName - The name of the template
   * @param {Object} data - The data to render with
   * @param {Error} originalError - The original error that occurred
   * @returns {string} The template with error boundaries
   */
  renderWithErrorBoundaries(templateName, data, originalError) {
    const template = this.completeTemplates.get(templateName);
    if (!template) return ErrorBoundaryTemplates.templateNotFound(`Template '${templateName}' not found`);
    
    try {
      // Try to identify which section caused the error
      const errorMessage = originalError.message;
      const rawTemplate = template.raw;
      
      // Split the template into sections
      const sectionRegex = /<section[^>]*class="[^"]*report-section[^"]*"[^>]*>([\s\S]*?)<\/section>/g;
      let match;
      let sectionsHtml = '';
      let lastIndex = 0;
      
      while ((match = sectionRegex.exec(rawTemplate)) !== null) {
        // Add content before this section
        sectionsHtml += rawTemplate.substring(lastIndex, match.index);
        
        // Try to render this section
        try {
          const sectionTemplate = Handlebars.compile(match[0]);
          sectionsHtml += sectionTemplate(data);
        } catch (sectionError) {
          // This section has an error, wrap it in an error boundary
          const sectionClass = match[0].match(/class="([^"]*)"/)?.[1] || 'unknown-section';
          sectionsHtml += ErrorBoundaryTemplates.sectionRenderError(
            sectionClass,
            sectionError.message || 'Error rendering section'
          );
        }
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining content
      sectionsHtml += rawTemplate.substring(lastIndex);
      
      // Try to compile and render the modified template
      try {
        const fallbackTemplate = Handlebars.compile(sectionsHtml);
        return fallbackTemplate(data);
      } catch (fallbackError) {
        // If that fails too, return a basic error template
        return ErrorBoundaryTemplates.fallbackContent(
          `Failed to render template with error boundaries: ${fallbackError.message}`
        );
      }
    } catch (error) {
      // If all else fails, return a simple error message
      return ErrorBoundaryTemplates.criticalRenderError(
        `Critical error rendering template: ${error.message}`
      );
    }
  }
  
  /**
   * Validates data against expected schema for a template
   * @param {string} templateName - The name of the template
   * @param {Object} data - The data to validate
   * @returns {boolean} Whether the data is valid
   */
  validateDataForTemplate(templateName, data) {
    // Basic validation
    if (!data || typeof data !== 'object') {
      console.error(`Data for template '${templateName}' must be an object`);
      return false;
    }
    
    // Define required fields for each template
    const requiredFields = {
      'standard': ['name', 'vendor', 'risk_level', 'total_score']
      // Add more templates as needed
    };
    
    // Check if this template has defined requirements
    const requirements = requiredFields[templateName];
    if (!requirements) {
      // No specific requirements defined, consider it valid
      return true;
    }
    
    // Check for missing required fields
    const missingFields = requirements.filter(field => {
      return data[field] === undefined || data[field] === null;
    });
    
    if (missingFields.length > 0) {
      console.warn(`Data for template '${templateName}' is missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Applies fallback data for missing or invalid fields
   * @param {string} templateName - The name of the template
   * @param {Object} data - The original data
   * @returns {Object} The data with fallbacks applied
   */
  applyFallbackData(templateName, data) {
    // Create a copy of the data to avoid modifying the original
    const fallbackData = { ...data };
    
    // Define fallback values for each template
    const fallbacks = {
      'standard': {
        name: 'Unnamed Tool',
        vendor: 'Unknown Vendor',
        risk_level: 'MEDIUM',
        total_score: 50,
        assessment_date: new Date().toISOString().split('T')[0],
        currentDate: new Date().toLocaleDateString(),
        currentYear: new Date().getFullYear(),
        assessor_name: 'System',
        executive_summary: 'No summary available.',
        key_findings: ['No findings available.'],
        risk_categories: [],
        recommendations: [],
        include_detailed_analysis: false
      }
      // Add more templates as needed
    };
    
    // Get fallbacks for this template
    const templateFallbacks = fallbacks[templateName];
    if (!templateFallbacks) {
      // No fallbacks defined for this template
      return fallbackData;
    }
    
    // Apply fallbacks for missing fields
    Object.entries(templateFallbacks).forEach(([field, value]) => {
      if (fallbackData[field] === undefined || fallbackData[field] === null) {
        fallbackData[field] = value;
      }
    });
    
    // Special handling for nested data
    if (templateName === 'standard') {
      // Ensure risk_level_lowercase is set
      if (fallbackData.risk_level) {
        fallbackData.risk_level_lowercase = fallbackData.risk_level.toLowerCase();
      }
      
      // Ensure empty arrays for collections
      ['risk_categories', 'recommendations', 'key_findings'].forEach(field => {
        if (!Array.isArray(fallbackData[field])) {
          fallbackData[field] = [];
        }
      });
    }
    
    return fallbackData;
  }

  /**
   * Registers common Handlebars helpers
   */
  registerHandlebarsHelpers() {
    // Convert string to lowercase
    Handlebars.registerHelper('toLowerCase', function(str) {
      return str ? str.toLowerCase() : '';
    });

    // Check if string contains substring
    Handlebars.registerHelper('contains', function(str, substring, options) {
      if (str && str.includes && str.includes(substring)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Equality check
    Handlebars.registerHelper('eq', function(a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Greater than check
    Handlebars.registerHelper('gt', function(a, b, options) {
      if (a > b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // JSON stringify
    Handlebars.registerHelper('JSONstringify', function(data) {
      return JSON.stringify(data, null, 2);
    });
    
    // Format date
    Handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      try {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString();
      } catch (e) {
        return date;
      }
    });
    
    // Safe access to nested properties
    Handlebars.registerHelper('get', function(obj, path, defaultValue = '') {
      if (!obj || !path) return defaultValue;
      
      try {
        const keys = path.split('.');
        let value = obj;
        
        for (const key of keys) {
          if (value === undefined || value === null) return defaultValue;
          value = value[key];
        }
        
        return value !== undefined && value !== null ? value : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    });
  }
}

export default TemplateRegistry;
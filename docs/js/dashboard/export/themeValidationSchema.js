/**
 * themeValidationSchema.js
 * 
 * This module provides a comprehensive validation schema for themes in the marketplace.
 * It ensures that themes meet all requirements before being installed or activated.
 */

class ThemeValidator {
  constructor() {
    // Schema version for future compatibility checks
    this.schemaVersion = '1.0.0';
    
    // Required theme properties and their validation rules
    this.requiredProperties = {
      id: {
        type: 'string',
        pattern: /^theme-[a-z0-9-]+$/,
        message: 'Theme ID must start with "theme-" followed by lowercase letters, numbers, or hyphens'
      },
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 50,
        message: 'Theme name must be between 3 and 50 characters'
      },
      description: {
        type: 'string',
        minLength: 10,
        maxLength: 200,
        message: 'Theme description must be between 10 and 200 characters'
      },
      version: {
        type: 'string',
        pattern: /^\d+\.\d+\.\d+$/,
        message: 'Version must follow semantic versioning (e.g., 1.0.0)'
      },
      author: {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, required: false },
          url: { type: 'string', pattern: /^https?:\/\//, required: false }
        },
        message: 'Author must include a name and optional email/url'
      },
      license: {
        type: 'string',
        enum: ['MIT', 'GPL-3.0', 'Apache-2.0', 'BSD-3-Clause', 'Proprietary', 'Custom'],
        message: 'License must be a valid license type'
      },
      category: {
        type: 'string',
        enum: ['free', 'premium', 'community'],
        message: 'Category must be one of: free, premium, community'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        maxItems: 10,
        message: 'Tags must be an array of strings (max 10)'
      },
      cssFiles: {
        type: 'array',
        items: { type: 'string', pattern: /\.css$/ },
        minItems: 1,
        message: 'At least one CSS file is required'
      },
      previewImage: {
        type: 'string',
        pattern: /\.(jpg|jpeg|png|svg)$/,
        message: 'Preview image must be a valid image file (jpg, jpeg, png, svg)'
      },
      compatibility: {
        type: 'object',
        properties: {
          minAppVersion: { type: 'string', pattern: /^\d+\.\d+\.\d+$/, required: true },
          maxAppVersion: { type: 'string', pattern: /^\d+\.\d+\.\d+$/, required: false }
        },
        message: 'Compatibility must specify minimum app version'
      }
    };
    
    // Optional properties and their validation rules
    this.optionalProperties = {
      parentTheme: {
        type: 'string',
        pattern: /^theme-[a-z0-9-]+$/,
        message: 'Parent theme ID must start with "theme-" followed by lowercase letters, numbers, or hyphens'
      },
      customStyles: {
        type: 'object',
        message: 'Custom styles must be a valid object'
      },
      screenshots: {
        type: 'array',
        items: { type: 'string', pattern: /\.(jpg|jpeg|png|svg)$/ },
        maxItems: 5,
        message: 'Screenshots must be an array of image files (max 5)'
      },
      dependencies: {
        type: 'array',
        items: { type: 'string' },
        message: 'Dependencies must be an array of strings'
      },
      pricing: {
        type: 'object',
        properties: {
          price: { type: 'number', min: 0, required: true },
          currency: { type: 'string', enum: ['USD', 'EUR', 'GBP'], required: true },
          type: { type: 'string', enum: ['one-time', 'subscription'], required: true }
        },
        message: 'Pricing must include price, currency, and type'
      }
    };
  }

  /**
   * Validates a theme configuration against the schema
   * @param {Object} themeConfig - The theme configuration to validate
   * @returns {Object} Validation result with success status and errors
   */
  validateTheme(themeConfig) {
    if (!themeConfig || typeof themeConfig !== 'object') {
      return {
        valid: false,
        errors: ['Theme configuration must be a valid object']
      };
    }

    const errors = [];
    
    // Validate required properties
    for (const [prop, rules] of Object.entries(this.requiredProperties)) {
      const value = themeConfig[prop];
      
      // Check if property exists
      if (value === undefined) {
        errors.push(`Missing required property: ${prop}`);
        continue;
      }
      
      // Validate property type
      if (!this._validateType(value, rules.type)) {
        errors.push(`${prop}: ${rules.message || `Expected type ${rules.type}`}`);
        continue;
      }
      
      // Validate string patterns and length
      if (rules.type === 'string') {
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${prop}: ${rules.message || 'Invalid format'}`);
        }
        
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${prop}: ${rules.message || `Minimum length is ${rules.minLength}`}`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${prop}: ${rules.message || `Maximum length is ${rules.maxLength}`}`);
        }
        
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${prop}: ${rules.message || `Must be one of: ${rules.enum.join(', ')}`}`);
        }
      }
      
      // Validate arrays
      if (rules.type === 'array') {
        if (rules.minItems && value.length < rules.minItems) {
          errors.push(`${prop}: ${rules.message || `Minimum items is ${rules.minItems}`}`);
        }
        
        if (rules.maxItems && value.length > rules.maxItems) {
          errors.push(`${prop}: ${rules.message || `Maximum items is ${rules.maxItems}`}`);
        }
        
        // Validate array items
        if (rules.items) {
          for (let i = 0; i < value.length; i++) {
            const item = value[i];
            
            if (!this._validateType(item, rules.items.type)) {
              errors.push(`${prop}[${i}]: ${rules.message || `Expected type ${rules.items.type}`}`);
            }
            
            if (rules.items.pattern && !rules.items.pattern.test(item)) {
              errors.push(`${prop}[${i}]: ${rules.message || 'Invalid format'}`);
            }
          }
        }
      }
      
      // Validate objects
      if (rules.type === 'object' && rules.properties) {
        for (const [subProp, subRules] of Object.entries(rules.properties)) {
          const subValue = value[subProp];
          
          // Check if required sub-property exists
          if (subRules.required && subValue === undefined) {
            errors.push(`${prop}.${subProp}: Required property is missing`);
            continue;
          }
          
          // Skip validation if property is not required and not provided
          if (subValue === undefined) {
            continue;
          }
          
          // Validate sub-property type
          if (!this._validateType(subValue, subRules.type)) {
            errors.push(`${prop}.${subProp}: Expected type ${subRules.type}`);
          }
          
          // Validate string patterns
          if (subRules.type === 'string' && subRules.pattern && !subRules.pattern.test(subValue)) {
            errors.push(`${prop}.${subProp}: Invalid format`);
          }
          
          // Validate enums
          if (subRules.enum && !subRules.enum.includes(subValue)) {
            errors.push(`${prop}.${subProp}: Must be one of: ${subRules.enum.join(', ')}`);
          }
        }
      }
    }
    
    // Validate optional properties if they exist
    for (const [prop, rules] of Object.entries(this.optionalProperties)) {
      const value = themeConfig[prop];
      
      // Skip validation if property doesn't exist
      if (value === undefined) {
        continue;
      }
      
      // Validate property type
      if (!this._validateType(value, rules.type)) {
        errors.push(`${prop}: ${rules.message || `Expected type ${rules.type}`}`);
        continue;
      }
      
      // Validate string patterns
      if (rules.type === 'string' && rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${prop}: ${rules.message || 'Invalid format'}`);
      }
      
      // Validate arrays
      if (rules.type === 'array' && rules.items) {
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          
          if (!this._validateType(item, rules.items.type)) {
            errors.push(`${prop}[${i}]: ${rules.message || `Expected type ${rules.items.type}`}`);
          }
          
          if (rules.items.pattern && !rules.items.pattern.test(item)) {
            errors.push(`${prop}[${i}]: ${rules.message || 'Invalid format'}`);
          }
        }
      }
      
      // Validate objects
      if (rules.type === 'object' && rules.properties) {
        for (const [subProp, subRules] of Object.entries(rules.properties)) {
          const subValue = value[subProp];
          
          // Check if required sub-property exists
          if (subRules.required && subValue === undefined) {
            errors.push(`${prop}.${subProp}: Required property is missing`);
            continue;
          }
          
          // Skip validation if property is not required and not provided
          if (subValue === undefined) {
            continue;
          }
          
          // Validate sub-property type
          if (!this._validateType(subValue, subRules.type)) {
            errors.push(`${prop}.${subProp}: Expected type ${subRules.type}`);
          }
          
          // Validate numeric constraints
          if (subRules.type === 'number') {
            if (subRules.min !== undefined && subValue < subRules.min) {
              errors.push(`${prop}.${subProp}: Value must be at least ${subRules.min}`);
            }
            
            if (subRules.max !== undefined && subValue > subRules.max) {
              errors.push(`${prop}.${subProp}: Value must be at most ${subRules.max}`);
            }
          }
          
          // Validate enums
          if (subRules.enum && !subRules.enum.includes(subValue)) {
            errors.push(`${prop}.${subProp}: Must be one of: ${subRules.enum.join(', ')}`);
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Validates the file structure of a theme package
   * @param {Object} fileList - List of files in the theme package
   * @returns {Object} Validation result with success status and errors
   */
  validateThemeFiles(fileList) {
    if (!Array.isArray(fileList)) {
      return {
        valid: false,
        errors: ['File list must be an array']
      };
    }
    
    const errors = [];
    const requiredFiles = [
      'theme.json',
      'preview.png',
      'README.md'
    ];
    
    // Check for required files
    for (const file of requiredFiles) {
      if (!fileList.includes(file)) {
        errors.push(`Missing required file: ${file}`);
      }
    }
    
    // Check for CSS files
    const cssFiles = fileList.filter(file => file.endsWith('.css'));
    if (cssFiles.length === 0) {
      errors.push('Theme package must include at least one CSS file');
    }
    
    // Check for potential security issues
    const suspiciousExtensions = ['.php', '.exe', '.sh', '.bat', '.cmd', '.vbs', '.js'];
    for (const file of fileList) {
      const ext = file.substring(file.lastIndexOf('.'));
      if (suspiciousExtensions.includes(ext) && ext !== '.js') {
        errors.push(`Potentially unsafe file type: ${file}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Validates the CSS content for security and compatibility
   * @param {string} cssContent - The CSS content to validate
   * @returns {Object} Validation result with success status and errors
   */
  validateCSSContent(cssContent) {
    if (typeof cssContent !== 'string') {
      return {
        valid: false,
        errors: ['CSS content must be a string']
      };
    }
    
    const errors = [];
    
    // Check for potentially harmful CSS
    const suspiciousPatterns = [
      { pattern: /@import url\(['"]?https?:\/\//, message: 'External CSS imports are not allowed' },
      { pattern: /url\(['"]?https?:\/\//, message: 'External resource URLs should be avoided' },
      { pattern: /expression\(/, message: 'CSS expressions are not allowed' },
      { pattern: /-moz-binding/, message: 'Mozilla binding is not allowed' },
      { pattern: /behavior:/, message: 'IE behavior property is not allowed' }
    ];
    
    for (const { pattern, message } of suspiciousPatterns) {
      if (pattern.test(cssContent)) {
        errors.push(`CSS security issue: ${message}`);
      }
    }
    
    // Check for browser compatibility issues
    const compatibilityIssues = [
      { pattern: /^[^*]*\\@/, message: 'Avoid using CSS hacks' },
      { pattern: /filter:/, message: 'IE-specific filter property may cause compatibility issues' }
    ];
    
    for (const { pattern, message } of compatibilityIssues) {
      if (pattern.test(cssContent)) {
        errors.push(`CSS compatibility issue: ${message}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Helper method to validate a value's type
   * @param {*} value - The value to validate
   * @param {string} type - The expected type
   * @returns {boolean} Whether the value matches the expected type
   * @private
   */
  _validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return false;
    }
  }
}

export default ThemeValidator;
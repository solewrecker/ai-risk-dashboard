/**
 * Theme Validator for the AI Tool Risk Framework Report System
 * Validates theme packages for marketplace submission
 */
export class ThemeValidator {
  constructor() {
    this.requiredFiles = [
      'variables.css',
      'layout.css',
      'typography.css'
    ];
    
    this.requiredVariables = [
      '--color-primary',
      '--color-secondary',
      '--color-background',
      '--color-text',
      '--font-family',
      '--spacing-md'
    ];
  }
  
  /**
   * Validates a theme package for marketplace submission
   * @param {Object} themePackage - The theme package to validate
   * @returns {Object} - Validation results with errors and warnings
   */
  validateTheme(themePackage) {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      metadata: {}
    };
    
    // Check for required files
    this.validateRequiredFiles(themePackage, results);
    
    // Check CSS variables
    if (themePackage.files['variables.css']) {
      this.validateCssVariables(themePackage.files['variables.css'], results);
    }
    
    // Check for browser compatibility
    this.validateBrowserCompatibility(themePackage, results);
    
    // Check for performance issues
    this.validatePerformance(themePackage, results);
    
    // Set final validation status
    results.isValid = results.errors.length === 0;
    
    return results;
  }

  /**
   * Validates that all required files are present in the theme package
   * @param {Object} themePackage - The theme package to validate
   * @param {Object} results - The validation results object
   */
  validateRequiredFiles(themePackage, results) {
    const missingFiles = [];
    
    this.requiredFiles.forEach(file => {
      if (!themePackage.files[file]) {
        missingFiles.push(file);
      }
    });
    
    if (missingFiles.length > 0) {
      results.errors.push({
        type: 'missing_files',
        message: `Missing required files: ${missingFiles.join(', ')}`,
        files: missingFiles
      });
    }
  }

  /**
   * Validates that all required CSS variables are present in the theme
   * @param {string} cssContent - The content of the variables.css file
   * @param {Object} results - The validation results object
   */
  validateCssVariables(cssContent, results) {
    const missingVariables = [];
    
    this.requiredVariables.forEach(variable => {
      if (!cssContent.includes(variable)) {
        missingVariables.push(variable);
      }
    });
    
    if (missingVariables.length > 0) {
      results.errors.push({
        type: 'missing_variables',
        message: `Missing required CSS variables: ${missingVariables.join(', ')}`,
        variables: missingVariables
      });
    }
  }

  /**
   * Validates browser compatibility of the theme
   * @param {Object} themePackage - The theme package to validate
   * @param {Object} results - The validation results object
   */
  validateBrowserCompatibility(themePackage, results) {
    const incompatibleFeatures = [];
    
    // Check for CSS Grid usage without fallbacks
    Object.values(themePackage.files).forEach(fileContent => {
      if (typeof fileContent === 'string') {
        // Check for CSS Grid without @supports
        if (fileContent.includes('display: grid') && !fileContent.includes('@supports (display: grid)')) {
          incompatibleFeatures.push('CSS Grid without @supports fallback');
        }
        
        // Check for CSS Custom Properties without fallbacks
        if (fileContent.includes('var(--') && !fileContent.includes('@supports (--custom-properties:')) {
          incompatibleFeatures.push('CSS Custom Properties without fallbacks');
        }
      }
    });
    
    if (incompatibleFeatures.length > 0) {
      results.warnings.push({
        type: 'browser_compatibility',
        message: 'Potential browser compatibility issues detected',
        issues: incompatibleFeatures
      });
    }
  }

  /**
   * Validates performance aspects of the theme
   * @param {Object} themePackage - The theme package to validate
   * @param {Object} results - The validation results object
   */
  validatePerformance(themePackage, results) {
    const performanceIssues = [];
    
    // Check CSS file sizes
    Object.entries(themePackage.files).forEach(([filename, content]) => {
      if (filename.endsWith('.css') && typeof content === 'string') {
        const sizeInKB = content.length / 1024;
        
        if (sizeInKB > 50) {
          performanceIssues.push(`${filename} is ${sizeInKB.toFixed(2)}KB (recommended: <50KB)`);
        }
      }
    });
    
    // Check for excessive nesting
    Object.entries(themePackage.files).forEach(([filename, content]) => {
      if (filename.endsWith('.css') && typeof content === 'string') {
        const nestingLevel = this.getMaxNestingLevel(content);
        
        if (nestingLevel > 3) {
          performanceIssues.push(`${filename} has excessive selector nesting (level ${nestingLevel}, recommended: ≤3)`);
        }
      }
    });
    
    if (performanceIssues.length > 0) {
      results.warnings.push({
        type: 'performance',
        message: 'Performance issues detected',
        issues: performanceIssues
      });
    }
  }

  /**
   * Gets the maximum nesting level in CSS content
   * @param {string} cssContent - The CSS content to analyze
   * @returns {number} - The maximum nesting level
   */
  getMaxNestingLevel(cssContent) {
    let maxLevel = 0;
    let currentLevel = 0;
    
    for (let i = 0; i < cssContent.length; i++) {
      if (cssContent[i] === '{') {
        currentLevel++;
        maxLevel = Math.max(maxLevel, currentLevel);
      } else if (cssContent[i] === '}') {
        currentLevel--;
      }
    }
    
    return maxLevel;
  }
}
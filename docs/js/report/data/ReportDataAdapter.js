/**
 * ReportDataAdapter.js
 * 
 * This module is responsible for transforming Supabase data into a standardized format
 * for report templates. It includes validation, error handling, and fallback values.
 */

class ReportDataAdapter {
  constructor() {
    this.validationRules = {
      // Define validation rules for each field
      name: { required: true, type: 'string', fallback: 'Unnamed Tool' },
      vendor: { required: true, type: 'string', fallback: 'Unknown Vendor' },
      risk_level: { required: true, type: 'string', fallback: 'MEDIUM', 
                   allowedValues: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
      total_score: { required: true, type: 'number', fallback: 0, min: 0, max: 100 },
      // Add more validation rules as needed
    };
  }

  /**
   * Transforms assessment data from Supabase into a standardized format
   * @param {Object} primaryAssessment - The primary assessment data from Supabase
   * @param {Array} selectedData - All selected assessments (for comparison reports)
   * @param {Array} sectionsToGenerate - Sections to include in the report
   * @returns {Object} Standardized data for templates
   */
  transformData(primaryAssessment, selectedData = [], sectionsToGenerate = []) {
    try {
      if (!primaryAssessment) {
        throw new Error('Primary assessment data is required');
      }

      // Flatten the data structure by merging nested assessment_data with top-level
      const flattenedData = {
        ...(primaryAssessment.assessment_data || {}),
        ...primaryAssessment,
        currentYear: new Date().getFullYear(),
      };

      // Remove nested data to avoid duplication
      delete flattenedData.assessment_data;

      // Validate and sanitize the data
      const validatedData = this.validateData(flattenedData);

      // Add derived data
      const enhancedData = this.enhanceData(validatedData, selectedData, sectionsToGenerate);

      return enhancedData;
    } catch (error) {
      console.error('Error transforming assessment data:', error);
      // Return a minimal valid data object with fallback values
      return this.createFallbackData(primaryAssessment);
    }
  }

  /**
   * Validates and sanitizes the data according to validation rules
   * @param {Object} data - The flattened assessment data
   * @returns {Object} Validated and sanitized data
   */
  validateData(data) {
    const validatedData = { ...data };

    // Apply validation rules to each field
    Object.entries(this.validationRules).forEach(([field, rules]) => {
      // Check if required field is missing
      if (rules.required && (data[field] === undefined || data[field] === null)) {
        console.warn(`Required field '${field}' is missing. Using fallback value.`);
        validatedData[field] = rules.fallback;
        return;
      }

      // Check type
      if (data[field] !== undefined && typeof data[field] !== rules.type) {
        console.warn(`Field '${field}' has incorrect type. Using fallback value.`);
        validatedData[field] = rules.fallback;
        return;
      }

      // Check allowed values if specified
      if (rules.allowedValues && data[field] !== undefined && 
          !rules.allowedValues.includes(data[field])) {
        console.warn(`Field '${field}' has invalid value. Using fallback value.`);
        validatedData[field] = rules.fallback;
        return;
      }

      // Check min/max for numbers
      if (rules.type === 'number' && data[field] !== undefined) {
        if ((rules.min !== undefined && data[field] < rules.min) || 
            (rules.max !== undefined && data[field] > rules.max)) {
          console.warn(`Field '${field}' is out of range. Using fallback value.`);
          validatedData[field] = rules.fallback;
          return;
        }
      }

      // If field is missing but not required, use fallback
      if (data[field] === undefined && rules.fallback !== undefined) {
        validatedData[field] = rules.fallback;
      }
    });

    return validatedData;
  }

  /**
   * Enhances the data with derived fields and additional information
   * @param {Object} data - The validated data
   * @param {Array} selectedData - All selected assessments
   * @param {Array} sectionsToGenerate - Sections to include in the report
   * @returns {Object} Enhanced data
   */
  enhanceData(data, selectedData, sectionsToGenerate) {
    const enhancedData = { ...data };

    // Add metadata about the report
    enhancedData.generatedAt = new Date().toISOString();
    enhancedData.reportVersion = '1.0.0';
    
    // Add section information
    enhancedData.sections = sectionsToGenerate;
    enhancedData.hasMultipleAssessments = selectedData.length > 1;
    
    // Add comparison data if multiple assessments are selected
    if (enhancedData.hasMultipleAssessments) {
      enhancedData.comparisonData = selectedData.map(assessment => ({
        id: assessment.id,
        name: assessment.name || 'Unnamed Tool',
        vendor: assessment.vendor || 'Unknown Vendor',
        risk_level: assessment.risk_level || 'MEDIUM',
        total_score: assessment.total_score || 0,
        // Add more fields as needed for comparison
      }));
    }

    // Add risk color based on risk level
    enhancedData.riskColor = this.getRiskColor(enhancedData.risk_level);
    
    return enhancedData;
  }

  /**
   * Creates fallback data when transformation fails
   * @param {Object} originalData - The original assessment data
   * @returns {Object} Minimal valid data with fallback values
   */
  createFallbackData(originalData = {}) {
    const fallbackData = {};
    
    // Use fallback values from validation rules
    Object.entries(this.validationRules).forEach(([field, rules]) => {
      fallbackData[field] = rules.fallback;
    });
    
    // Try to salvage some data from the original object
    if (originalData && typeof originalData === 'object') {
      // Extract ID if available
      if (originalData.id) {
        fallbackData.id = originalData.id;
      }
      
      // Try to extract assessment_data if available
      if (originalData.assessment_data && typeof originalData.assessment_data === 'object') {
        Object.entries(this.validationRules).forEach(([field, rules]) => {
          if (originalData.assessment_data[field] !== undefined) {
            fallbackData[field] = originalData.assessment_data[field];
          }
        });
      }
    }
    
    // Add metadata
    fallbackData.generatedAt = new Date().toISOString();
    fallbackData.reportVersion = '1.0.0';
    fallbackData.isErrorRecovery = true;
    
    return fallbackData;
  }

  /**
   * Gets the color associated with a risk level
   * @param {string} riskLevel - The risk level (LOW, MEDIUM, HIGH, CRITICAL)
   * @returns {string} The color associated with the risk level
   */
  getRiskColor(riskLevel) {
    const riskColors = {
      'LOW': '#10b981', // Green
      'MEDIUM': '#f59e0b', // Amber
      'HIGH': '#ef4444', // Red
      'CRITICAL': '#dc2626', // Dark Red
    };
    
    return riskColors[riskLevel] || riskColors['MEDIUM'];
  }
}

export default ReportDataAdapter;
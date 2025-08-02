/**
 * ReportDataAdapter.js
 * 
 * This module is responsible for transforming Supabase data into a standardized format
 * for report templates. It includes validation, error handling, and fallback values.
 */

class ReportDataAdapter {
  constructor() {
    this.validationRules = {
      // Define validation rules for actual assessment data fields - NO FALLBACKS
      id: { required: true, type: 'string' },
      name: { required: false, type: 'string' },
      user_id: { required: false, type: 'string' },
      created_at: { required: false, type: 'string' },
      assessed_by: { required: false, type: 'string' },
      category: { required: false, type: 'string' },
      license_type: { required: false, type: 'string' },
      data_classification: { required: false, type: 'string' },
      documentation_tier: { required: false, type: 'string' },
      confidence: { required: false, type: 'number', min: 0, max: 1 },
      access_controls_score: { required: false, type: 'number', min: 0, max: 100 },
      compliance_score: { required: false, type: 'number', min: 0, max: 100 },
      data_storage_score: { required: false, type: 'number', min: 0, max: 100 },
      is_public: { required: false, type: 'boolean' },
      assessment_notes: { required: false, type: 'string' },
      // Nested objects - handle separately
      assessment_data: { required: false, type: 'object' },
      detailedAssessment: { required: false, type: 'object' },
      azure_permissions: { required: false, type: 'object' },
      compliance_certifications: { required: false, type: 'object' }
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
    if (!primaryAssessment) {
      throw new Error('Primary assessment data is required and no fallback data is allowed.');
    }

    console.log('ReportDataAdapter: Transforming data for:', primaryAssessment.name || primaryAssessment.id);
    console.log('ReportDataAdapter: Primary assessment data:', primaryAssessment);

    // Flatten the data structure by merging nested assessment_data with top-level
    const flattenedData = {
      ...(primaryAssessment.assessment_data || {}),
      ...primaryAssessment,
      currentYear: new Date().getFullYear(),
    };

    // Remove nested data to avoid duplication
    delete flattenedData.assessment_data;

    console.log('ReportDataAdapter: Flattened data:', flattenedData);

    // Validate and sanitize the data (but don't fail on validation warnings)
    const validatedData = this.validateData(flattenedData);

    console.log('ReportDataAdapter: Validated data:', validatedData);

    // Add derived data
    const enhancedData = this.enhanceData(validatedData, selectedData, sectionsToGenerate);

    console.log('ReportDataAdapter: Enhanced data:', enhancedData);

    return enhancedData;
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
        throw new Error(`Required field '${field}' is missing and no fallback data is allowed.`);
      }

      // Check type (skip type checking for objects and handle them separately)
      if (data[field] !== undefined && rules.type !== 'object' && typeof data[field] !== rules.type) {
        console.warn(`Field '${field}' has incorrect type. Expected ${rules.type}, got ${typeof data[field]}. Keeping original value.`);
        // Keep original value, don't use fallback
        return;
      }

      // Handle object types separately
      if (rules.type === 'object' && data[field] !== undefined) {
        if (typeof data[field] !== 'object' || data[field] === null) {
          console.warn(`Field '${field}' should be an object. Keeping original value.`);
          // Keep original value, don't use fallback
          return;
        }
      }

      // Check allowed values if specified
      if (rules.allowedValues && data[field] !== undefined) {
        const value = typeof data[field] === 'string' ? data[field].toUpperCase() : data[field];
        if (!rules.allowedValues.includes(value)) {
          console.warn(`Field '${field}' has invalid value. Keeping original value.`);
          // Keep original value, don't use fallback
          return;
        } else {
          validatedData[field] = value;
        }
      }

      // Check min/max for numbers
      if (rules.type === 'number' && data[field] !== undefined) {
        if ((rules.min !== undefined && data[field] < rules.min) || 
            (rules.max !== undefined && data[field] > rules.max)) {
          console.warn(`Field '${field}' is out of range. Keeping original value.`);
          // Keep original value, don't use fallback
          return;
        }
      }

      // If field is missing but not required, leave it undefined (no fallback)
      // Fields will only exist if they have actual data
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
    
    // Calculate total risk score from individual scores
    const totalScore = (data.access_controls_score ?? 0) + (data.compliance_score ?? 0) + (data.data_storage_score ?? 0);
    enhancedData.total_score = totalScore;
    
    // Determine risk level based on total score
    let riskLevel = 'LOW';
    if (totalScore > 200) riskLevel = 'CRITICAL';
    else if (totalScore > 150) riskLevel = 'HIGH';
    else if (totalScore > 75) riskLevel = 'MEDIUM';
    enhancedData.risk_level = riskLevel;
    
    // Add comparison data if multiple assessments are selected
    if (enhancedData.hasMultipleAssessments) {
      enhancedData.comparisonData = selectedData.map(assessment => {
        const assessmentTotalScore = (assessment.access_controls_score ?? 0) + (assessment.compliance_score ?? 0) + (assessment.data_storage_score ?? 0);
        let assessmentRiskLevel = 'LOW';
        if (assessmentTotalScore > 200) assessmentRiskLevel = 'CRITICAL';
        else if (assessmentTotalScore > 150) assessmentRiskLevel = 'HIGH';
        else if (assessmentTotalScore > 75) assessmentRiskLevel = 'MEDIUM';
        
        return {
          id: assessment.id,
          name: assessment.name,
          category: assessment.category,
          risk_level: assessmentRiskLevel,
          total_score: assessmentTotalScore,
          access_controls_score: assessment.access_controls_score,
          compliance_score: assessment.compliance_score,
          data_storage_score: assessment.data_storage_score
        };
      });
    }

    // Add risk color based on risk level
    enhancedData.riskColor = this.getRiskColor(enhancedData.risk_level);
    
    // Extract recommendations from assessment_data if available
    if (data.assessment_data && data.assessment_data.recommendations && Array.isArray(data.assessment_data.recommendations)) {
      enhancedData.recommendations = data.assessment_data.recommendations;
    } else if (data.detailedAssessment && data.detailedAssessment.recommendations && Array.isArray(data.detailedAssessment.recommendations)) {
      enhancedData.recommendations = data.detailedAssessment.recommendations;
    } else {
      enhancedData.recommendations = [];
    }
    
    // Extract summary from assessment_data if available
    if (data.assessment_data && data.assessment_data.summary_and_recommendation) {
      enhancedData.summary_and_recommendation = data.assessment_data.summary_and_recommendation;
    } else if (data.detailedAssessment && data.detailedAssessment.compliance_summary) {
      enhancedData.summary_and_recommendation = data.detailedAssessment.compliance_summary;
    }
    
    // Create categories from the score breakdown - only if scores exist
    enhancedData.categories = [];
    if (data.access_controls_score !== undefined) {
      enhancedData.categories.push({
        name: 'Access Controls',
        score: data.access_controls_score,
        risk_level: data.access_controls_score > 50 ? 'HIGH' : data.access_controls_score > 25 ? 'MEDIUM' : 'LOW',
        riskColor: this.getRiskColor(data.access_controls_score > 50 ? 'HIGH' : data.access_controls_score > 25 ? 'MEDIUM' : 'LOW')
      });
    }
    if (data.compliance_score !== undefined) {
      enhancedData.categories.push({
        name: 'Compliance',
        score: data.compliance_score,
        risk_level: data.compliance_score > 50 ? 'HIGH' : data.compliance_score > 25 ? 'MEDIUM' : 'LOW',
        riskColor: this.getRiskColor(data.compliance_score > 50 ? 'HIGH' : data.compliance_score > 25 ? 'MEDIUM' : 'LOW')
      });
    }
    if (data.data_storage_score !== undefined) {
      enhancedData.categories.push({
        name: 'Data Storage',
        score: data.data_storage_score,
        risk_level: data.data_storage_score > 50 ? 'HIGH' : data.data_storage_score > 25 ? 'MEDIUM' : 'LOW',
        riskColor: this.getRiskColor(data.data_storage_score > 50 ? 'HIGH' : data.data_storage_score > 25 ? 'MEDIUM' : 'LOW')
      });
    }
    
    // Add derived fields for template convenience
    enhancedData.risk_level_lowercase = enhancedData.risk_level ? enhancedData.risk_level.toLowerCase() : 'medium';
    enhancedData.hasCategories = enhancedData.categories && enhancedData.categories.length > 0;
    enhancedData.hasRecommendations = enhancedData.recommendations && enhancedData.recommendations.length > 0;
    enhancedData.hasSummary = !!enhancedData.summary_and_recommendation;
    
    // Add vendor information if available
    if (data.detailedAssessment && data.detailedAssessment.tool_name) {
      enhancedData.vendor = data.detailedAssessment.tool_name;
    }
    
    return enhancedData;
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
/**
 * TemplateValidator.js
 * A component for validating report templates before publishing
 */

class TemplateValidator {
    /**
     * Initialize the template validator
     * @param {Object} options - Configuration options
     * @param {TemplateEngine} options.templateEngine - Instance of TemplateEngine
     * @param {Object} options.sampleData - Sample data for template validation
     */
    constructor(options = {}) {
        this.templateEngine = options.templateEngine || null;
        this.sampleData = options.sampleData || {};
        this.validationRules = this.getDefaultValidationRules();
        this.customRules = [];
    }

    /**
     * Get the default validation rules
     * @returns {Array} Array of validation rule objects
     */
    getDefaultValidationRules() {
        return [
            {
                id: 'required-fields',
                name: 'Required Fields',
                description: 'Template must have all required fields',
                severity: 'error',
                validate: (template) => {
                    const requiredFields = ['name', 'content', 'version'];
                    const missingFields = requiredFields.filter(field => !template[field]);
                    
                    return {
                        valid: missingFields.length === 0,
                        message: missingFields.length > 0 ? 
                            `Missing required fields: ${missingFields.join(', ')}` : 
                            'All required fields present',
                        details: { missingFields }
                    };
                }
            },
            {
                id: 'content-not-empty',
                name: 'Content Not Empty',
                description: 'Template content must not be empty',
                severity: 'error',
                validate: (template) => {
                    const contentLength = (template.content || '').trim().length;
                    
                    return {
                        valid: contentLength > 0,
                        message: contentLength > 0 ? 
                            'Template content is not empty' : 
                            'Template content is empty',
                        details: { contentLength }
                    };
                }
            },
            {
                id: 'valid-syntax',
                name: 'Valid Template Syntax',
                description: 'Template must have valid syntax',
                severity: 'error',
                validate: (template) => {
                    if (!this.templateEngine) {
                        return {
                            valid: true,
                            message: 'Syntax validation skipped (no template engine provided)',
                            details: { skipped: true }
                        };
                    }
                    
                    try {
                        this.templateEngine.compile(template.content);
                        return {
                            valid: true,
                            message: 'Template syntax is valid',
                            details: { syntaxValid: true }
                        };
                    } catch (error) {
                        return {
                            valid: false,
                            message: `Template syntax error: ${error.message}`,
                            details: { 
                                syntaxValid: false,
                                error: error.message,
                                line: error.line,
                                column: error.column
                            }
                        };
                    }
                }
            },
            {
                id: 'renders-with-sample-data',
                name: 'Renders With Sample Data',
                description: 'Template must render successfully with sample data',
                severity: 'error',
                validate: (template) => {
                    if (!this.templateEngine || !this.sampleData) {
                        return {
                            valid: true,
                            message: 'Render validation skipped (no template engine or sample data provided)',
                            details: { skipped: true }
                        };
                    }
                    
                    try {
                        this.templateEngine.render(template.content, this.sampleData);
                        return {
                            valid: true,
                            message: 'Template renders successfully with sample data',
                            details: { renderValid: true }
                        };
                    } catch (error) {
                        return {
                            valid: false,
                            message: `Template render error: ${error.message}`,
                            details: { 
                                renderValid: false,
                                error: error.message
                            }
                        };
                    }
                }
            },
            {
                id: 'semantic-html',
                name: 'Semantic HTML',
                description: 'Template should use semantic HTML elements',
                severity: 'warning',
                validate: (template) => {
                    const content = template.content || '';
                    const semanticElements = ['header', 'footer', 'main', 'section', 'article', 'aside', 'nav', 'figure', 'figcaption', 'time'];
                    
                    // Check if at least some semantic elements are used
                    const usedSemanticElements = semanticElements.filter(element => 
                        content.includes(`<${element}`) || content.includes(`<${element} `));
                    
                    return {
                        valid: usedSemanticElements.length > 0,
                        message: usedSemanticElements.length > 0 ? 
                            `Template uses semantic HTML (${usedSemanticElements.length} types)` : 
                            'Template does not use semantic HTML elements',
                        details: { 
                            usedSemanticElements,
                            semanticElementCount: usedSemanticElements.length
                        }
                    };
                }
            },
            {
                id: 'accessibility',
                name: 'Accessibility',
                description: 'Template should include accessibility features',
                severity: 'warning',
                validate: (template) => {
                    const content = template.content || '';
                    const accessibilityFeatures = [
                        { name: 'alt attributes', regex: /alt=["'][^"']*["']/g },
                        { name: 'aria attributes', regex: /aria-[a-z]+=["'][^"']*["']/g },
                        { name: 'role attributes', regex: /role=["'][^"']*["']/g },
                        { name: 'label elements', regex: /<label[^>]*>/g },
                        { name: 'heading hierarchy', regex: /<h[1-6][^>]*>/g }
                    ];
                    
                    const foundFeatures = accessibilityFeatures.map(feature => {
                        const matches = content.match(feature.regex) || [];
                        return {
                            name: feature.name,
                            count: matches.length,
                            found: matches.length > 0
                        };
                    });
                    
                    const foundCount = foundFeatures.filter(f => f.found).length;
                    
                    return {
                        valid: foundCount > 0,
                        message: foundCount > 0 ? 
                            `Template includes ${foundCount}/${accessibilityFeatures.length} accessibility features` : 
                            'Template does not include accessibility features',
                        details: { foundFeatures, foundCount }
                    };
                }
            },
            {
                id: 'content-length',
                name: 'Content Length',
                description: 'Template content should not be excessively long',
                severity: 'warning',
                validate: (template) => {
                    const contentLength = (template.content || '').length;
                    const maxRecommendedLength = 50000; // 50KB
                    
                    return {
                        valid: contentLength <= maxRecommendedLength,
                        message: contentLength <= maxRecommendedLength ? 
                            `Template content length is acceptable (${Math.round(contentLength / 1024)} KB)` : 
                            `Template content is too long (${Math.round(contentLength / 1024)} KB)`,
                        details: { 
                            contentLength,
                            maxRecommendedLength,
                            sizeInKB: Math.round(contentLength / 1024)
                        }
                    };
                }
            },
            {
                id: 'description-quality',
                name: 'Description Quality',
                description: 'Template should have a meaningful description',
                severity: 'warning',
                validate: (template) => {
                    const description = template.description || '';
                    const minRecommendedLength = 20;
                    
                    return {
                        valid: description.length >= minRecommendedLength,
                        message: description.length >= minRecommendedLength ? 
                            'Template has a meaningful description' : 
                            'Template description is too short or missing',
                        details: { 
                            descriptionLength: description.length,
                            minRecommendedLength
                        }
                    };
                }
            },
            {
                id: 'has-tags',
                name: 'Has Tags',
                description: 'Template should have at least one tag',
                severity: 'info',
                validate: (template) => {
                    const tags = template.tags || [];
                    
                    return {
                        valid: tags.length > 0,
                        message: tags.length > 0 ? 
                            `Template has ${tags.length} tags` : 
                            'Template has no tags',
                        details: { tagCount: tags.length, tags }
                    };
                }
            }
        ];
    }

    /**
     * Add a custom validation rule
     * @param {Object} rule - Validation rule object
     * @param {string} rule.id - Unique identifier for the rule
     * @param {string} rule.name - Display name for the rule
     * @param {string} rule.description - Description of what the rule checks
     * @param {string} rule.severity - Severity level ('error', 'warning', or 'info')
     * @param {Function} rule.validate - Function that validates a template and returns a result object
     */
    addValidationRule(rule) {
        if (!rule.id || !rule.name || !rule.description || !rule.severity || !rule.validate) {
            throw new Error('Invalid validation rule format');
        }
        
        // Check if rule with this ID already exists
        const existingRuleIndex = this.validationRules.findIndex(r => r.id === rule.id);
        if (existingRuleIndex !== -1) {
            // Replace existing rule
            this.validationRules[existingRuleIndex] = rule;
        } else {
            // Add new rule
            this.validationRules.push(rule);
            this.customRules.push(rule.id);
        }
    }

    /**
     * Remove a validation rule by ID
     * @param {string} ruleId - ID of the rule to remove
     * @returns {boolean} True if rule was removed, false if not found
     */
    removeValidationRule(ruleId) {
        const initialLength = this.validationRules.length;
        this.validationRules = this.validationRules.filter(rule => rule.id !== ruleId);
        
        // Also remove from custom rules if it was a custom rule
        const customRuleIndex = this.customRules.indexOf(ruleId);
        if (customRuleIndex !== -1) {
            this.customRules.splice(customRuleIndex, 1);
        }
        
        return this.validationRules.length < initialLength;
    }

    /**
     * Reset validation rules to defaults
     */
    resetValidationRules() {
        this.validationRules = this.getDefaultValidationRules();
        this.customRules = [];
    }

    /**
     * Validate a template against all rules
     * @param {Object} template - Template object to validate
     * @param {Array} ruleIds - Optional array of rule IDs to validate against (if not provided, all rules are used)
     * @returns {Object} Validation results
     */
    validateTemplate(template, ruleIds = null) {
        // Determine which rules to run
        const rulesToRun = ruleIds ? 
            this.validationRules.filter(rule => ruleIds.includes(rule.id)) : 
            this.validationRules;
        
        // Run each validation rule
        const results = rulesToRun.map(rule => {
            try {
                const result = rule.validate(template);
                return {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    description: rule.description,
                    severity: rule.severity,
                    valid: result.valid,
                    message: result.message,
                    details: result.details || {}
                };
            } catch (error) {
                // If a validation rule throws an error, treat it as a failed validation
                return {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    description: rule.description,
                    severity: rule.severity,
                    valid: false,
                    message: `Validation rule error: ${error.message}`,
                    details: { error: error.message }
                };
            }
        });
        
        // Calculate overall validation status
        const errorResults = results.filter(r => r.severity === 'error' && !r.valid);
        const warningResults = results.filter(r => r.severity === 'warning' && !r.valid);
        const infoResults = results.filter(r => r.severity === 'info' && !r.valid);
        
        const isValid = errorResults.length === 0;
        const hasWarnings = warningResults.length > 0;
        const hasInfoIssues = infoResults.length > 0;
        
        return {
            isValid,
            hasWarnings,
            hasInfoIssues,
            errorCount: errorResults.length,
            warningCount: warningResults.length,
            infoCount: infoResults.length,
            results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Create a validation report UI
     * @param {Object} validationResults - Results from validateTemplate()
     * @param {string} containerId - ID of container element to render the report in
     */
    createValidationReport(validationResults, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with ID ${containerId} not found`);
        }
        
        // Clear the container
        container.innerHTML = '';
        
        // Create the report container
        const reportContainer = document.createElement('div');
        reportContainer.className = 'template-validation-report';
        
        // Create the report header
        const reportHeader = document.createElement('div');
        reportHeader.className = 'validation-report-header';
        
        const reportTitle = document.createElement('h3');
        reportTitle.className = 'validation-report-title';
        reportTitle.textContent = 'Template Validation Report';
        
        const reportSummary = document.createElement('div');
        reportSummary.className = 'validation-report-summary';
        
        const statusClass = validationResults.isValid ? 
            (validationResults.hasWarnings ? 'warning' : 'success') : 
            'error';
        
        const statusText = validationResults.isValid ? 
            (validationResults.hasWarnings ? 'Valid with warnings' : 'Valid') : 
            'Invalid';
        
        reportSummary.innerHTML = `
            <div class="validation-status ${statusClass}">${statusText}</div>
            <div class="validation-counts">
                <span class="error-count">${validationResults.errorCount} errors</span>
                <span class="warning-count">${validationResults.warningCount} warnings</span>
                <span class="info-count">${validationResults.infoCount} suggestions</span>
            </div>
            <div class="validation-timestamp">Validated at ${new Date(validationResults.timestamp).toLocaleString()}</div>
        `;
        
        reportHeader.appendChild(reportTitle);
        reportHeader.appendChild(reportSummary);
        
        // Create the results list
        const resultsList = document.createElement('div');
        resultsList.className = 'validation-results-list';
        
        // Group results by severity
        const errorResults = validationResults.results.filter(r => r.severity === 'error');
        const warningResults = validationResults.results.filter(r => r.severity === 'warning');
        const infoResults = validationResults.results.filter(r => r.severity === 'info');
        
        // Add error results
        if (errorResults.length > 0) {
            const errorSection = this.createResultsSection('Errors', errorResults, 'error');
            resultsList.appendChild(errorSection);
        }
        
        // Add warning results
        if (warningResults.length > 0) {
            const warningSection = this.createResultsSection('Warnings', warningResults, 'warning');
            resultsList.appendChild(warningSection);
        }
        
        // Add info results
        if (infoResults.length > 0) {
            const infoSection = this.createResultsSection('Suggestions', infoResults, 'info');
            resultsList.appendChild(infoSection);
        }
        
        // Add all elements to the report container
        reportContainer.appendChild(reportHeader);
        reportContainer.appendChild(resultsList);
        
        // Add the report container to the main container
        container.appendChild(reportContainer);
        
        // Add styles
        this.addValidationReportStyles();
    }

    /**
     * Create a section of validation results
     * @param {string} title - Section title
     * @param {Array} results - Array of validation results
     * @param {string} severityClass - CSS class for the severity
     * @returns {HTMLElement} Section element
     */
    createResultsSection(title, results, severityClass) {
        const section = document.createElement('div');
        section.className = `validation-results-section ${severityClass}-section`;
        
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'results-section-header';
        sectionHeader.innerHTML = `
            <h4 class="results-section-title">${title} (${results.length})</h4>
            <button class="toggle-section-button">Hide</button>
        `;
        
        const sectionContent = document.createElement('div');
        sectionContent.className = 'results-section-content';
        
        // Add each result item
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = `validation-result-item ${result.valid ? 'valid' : 'invalid'}`;
            
            const resultHeader = document.createElement('div');
            resultHeader.className = 'result-item-header';
            resultHeader.innerHTML = `
                <div class="result-item-status ${result.valid ? 'valid' : 'invalid'}">
                    <span class="status-icon">${result.valid ? '✓' : '✗'}</span>
                </div>
                <div class="result-item-title">${result.ruleName}</div>
                <button class="toggle-details-button">Details</button>
            `;
            
            const resultMessage = document.createElement('div');
            resultMessage.className = 'result-item-message';
            resultMessage.textContent = result.message;
            
            const resultDetails = document.createElement('div');
            resultDetails.className = 'result-item-details';
            resultDetails.style.display = 'none';
            
            // Format the details
            let detailsHtml = '<dl class="details-list">';
            for (const [key, value] of Object.entries(result.details)) {
                const formattedValue = typeof value === 'object' ? 
                    JSON.stringify(value, null, 2) : 
                    value.toString();
                
                detailsHtml += `
                    <dt>${this.formatDetailKey(key)}</dt>
                    <dd>${this.formatDetailValue(formattedValue)}</dd>
                `;
            }
            detailsHtml += '</dl>';
            
            resultDetails.innerHTML = `
                <div class="details-description">${result.description}</div>
                ${detailsHtml}
            `;
            
            resultItem.appendChild(resultHeader);
            resultItem.appendChild(resultMessage);
            resultItem.appendChild(resultDetails);
            
            // Add toggle details functionality
            const toggleButton = resultItem.querySelector('.toggle-details-button');
            toggleButton.addEventListener('click', () => {
                const details = resultItem.querySelector('.result-item-details');
                const isHidden = details.style.display === 'none';
                details.style.display = isHidden ? 'block' : 'none';
                toggleButton.textContent = isHidden ? 'Hide Details' : 'Details';
            });
            
            sectionContent.appendChild(resultItem);
        });
        
        section.appendChild(sectionHeader);
        section.appendChild(sectionContent);
        
        // Add toggle section functionality
        const toggleButton = section.querySelector('.toggle-section-button');
        toggleButton.addEventListener('click', () => {
            const content = section.querySelector('.results-section-content');
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            toggleButton.textContent = isHidden ? 'Hide' : 'Show';
        });
        
        return section;
    }

    /**
     * Format a detail key for display
     * @param {string} key - Detail key
     * @returns {string} Formatted key
     */
    formatDetailKey(key) {
        // Convert camelCase to Title Case with Spaces
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    /**
     * Format a detail value for display
     * @param {string} value - Detail value
     * @returns {string} Formatted value
     */
    formatDetailValue(value) {
        // If it looks like JSON, format it as a code block
        if (value.startsWith('{') || value.startsWith('[')) {
            return `<pre class="details-code">${value}</pre>`;
        }
        
        // If it's a boolean, format it as a badge
        if (value === 'true' || value === 'false') {
            return `<span class="details-badge ${value === 'true' ? 'true' : 'false'}">${value}</span>`;
        }
        
        // Otherwise, return as is
        return value;
    }

    /**
     * Add CSS styles for the validation report
     */
    addValidationReportStyles() {
        // Check if styles are already added
        if (document.getElementById('template-validator-styles')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'template-validator-styles';
        styleElement.textContent = `
            .template-validation-report {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #333;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .validation-report-header {
                margin-bottom: 20px;
            }
            
            .validation-report-title {
                margin: 0 0 10px 0;
                font-size: 20px;
                font-weight: 600;
            }
            
            .validation-report-summary {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #fff;
                padding: 15px;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .validation-status {
                font-weight: 600;
                padding: 5px 10px;
                border-radius: 4px;
            }
            
            .validation-status.success {
                background-color: #d4edda;
                color: #155724;
            }
            
            .validation-status.warning {
                background-color: #fff3cd;
                color: #856404;
            }
            
            .validation-status.error {
                background-color: #f8d7da;
                color: #721c24;
            }
            
            .validation-counts {
                display: flex;
                gap: 15px;
            }
            
            .error-count {
                color: #dc3545;
            }
            
            .warning-count {
                color: #ffc107;
            }
            
            .info-count {
                color: #17a2b8;
            }
            
            .validation-timestamp {
                color: #6c757d;
                font-size: 14px;
            }
            
            .validation-results-section {
                margin-bottom: 20px;
                background-color: #fff;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .results-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #ddd;
            }
            
            .error-section .results-section-header {
                background-color: #f8d7da;
                color: #721c24;
            }
            
            .warning-section .results-section-header {
                background-color: #fff3cd;
                color: #856404;
            }
            
            .info-section .results-section-header {
                background-color: #d1ecf1;
                color: #0c5460;
            }
            
            .results-section-title {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .toggle-section-button {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                font-weight: 600;
                padding: 5px 10px;
                border-radius: 4px;
            }
            
            .error-section .toggle-section-button:hover {
                background-color: rgba(114, 28, 36, 0.1);
            }
            
            .warning-section .toggle-section-button:hover {
                background-color: rgba(133, 100, 4, 0.1);
            }
            
            .info-section .toggle-section-button:hover {
                background-color: rgba(12, 84, 96, 0.1);
            }
            
            .results-section-content {
                padding: 0;
            }
            
            .validation-result-item {
                padding: 15px;
                border-bottom: 1px solid #ddd;
            }
            
            .validation-result-item:last-child {
                border-bottom: none;
            }
            
            .result-item-header {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .result-item-status {
                margin-right: 10px;
            }
            
            .status-icon {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                font-weight: bold;
            }
            
            .result-item-status.valid .status-icon {
                background-color: #d4edda;
                color: #155724;
            }
            
            .result-item-status.invalid .status-icon {
                background-color: #f8d7da;
                color: #721c24;
            }
            
            .result-item-title {
                flex: 1;
                font-weight: 600;
            }
            
            .toggle-details-button {
                background: none;
                border: 1px solid #ddd;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                color: #6c757d;
            }
            
            .toggle-details-button:hover {
                background-color: #f8f9fa;
            }
            
            .result-item-message {
                margin-bottom: 10px;
                padding-left: 34px;
            }
            
            .result-item-details {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
                margin-top: 10px;
            }
            
            .details-description {
                margin-bottom: 10px;
                font-style: italic;
                color: #6c757d;
            }
            
            .details-list {
                margin: 0;
                padding: 0;
            }
            
            .details-list dt {
                font-weight: 600;
                margin-top: 10px;
            }
            
            .details-list dd {
                margin-left: 0;
                margin-bottom: 5px;
            }
            
            .details-code {
                background-color: #f1f1f1;
                padding: 10px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                overflow-x: auto;
                margin: 5px 0;
            }
            
            .details-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .details-badge.true {
                background-color: #d4edda;
                color: #155724;
            }
            
            .details-badge.false {
                background-color: #f8d7da;
                color: #721c24;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
}
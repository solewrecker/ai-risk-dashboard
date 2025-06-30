/**
 * AI Risk Assessment Template Binding System
 * Connects database data with the export template
 */
class TemplateBindingEngine {
    constructor() {
        this.templateCache = new Map();
        
        // Risk level configurations
        this.riskConfig = {
            low: {
                color: '#16a34a',
                bgColor: '#dcfce7',
                degrees: 90,
                description: 'Acceptable with monitoring'
            },
            medium: {
                color: '#f59e0b',
                bgColor: '#fef3c7',
                degrees: 180,
                description: 'Standard controls required'
            },
            high: {
                color: '#ef4444',
                bgColor: '#fecaca',
                degrees: 270,
                description: 'Enhanced controls needed'
            },
            critical: {
                color: '#dc2626',
                bgColor: '#fecaca',
                degrees: 340,
                description: 'Immediate action required'
            }
        };

        // Category display names mapping
        this.categoryNames = {
            'dataStorage': 'Data Storage & Security',
            'trainingUsage': 'Training Data Usage',
            'accessControls': 'Access Controls',
            'complianceRisk': 'Compliance Risk',
            'vendorTransparency': 'Vendor Transparency'
        };

        // Data classification mappings
        this.dataClassifications = {
            'phi': { label: 'Protected Health Information (PHI)', class: 'critical' },
            'financial': { label: 'Financial/Payment Data', class: 'critical' },
            'trade-secrets': { label: 'Trade Secrets/IP', class: 'critical' },
            'pii': { label: 'Personally Identifiable Information', class: 'critical' },
            'public': { label: 'Public/Marketing Data', class: '' }
        };

        // Use case labels
        this.useCaseLabels = {
            'marketing': 'Marketing & Communications',
            'operations': 'Business Operations',
            'development': 'Software Development',
            'research': 'Research & Analysis',
            'legal': 'Legal/Compliance/Audit',
            'hr': 'Human Resources',
            'finance': 'Finance & Accounting'
        };
    }

    /**
     * Load template from file
     */
    async loadTemplate(templatePath = './templates/export-template.html') {
        if (this.templateCache.has(templatePath)) {
            return this.templateCache.get(templatePath);
        }

        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status}`);
            }
            const template = await response.text();
            this.templateCache.set(templatePath, template);
            return template;
        } catch (error) {
            console.error('Template loading error:', error);
            throw error;
        }
    }

    /**
     * Convert database breakdown format to display format
     */
    convertDatabaseBreakdown(breakdown) {
        if (!breakdown || !breakdown.scores) {
            return {};
        }

        const converted = {};
        
        Object.entries(breakdown.scores).forEach(([key, score]) => {
            const displayName = this.categoryNames[key] || key;
            const riskLevel = this.determineRiskLevel(score);
            
            converted[displayName] = {
                score: `${score}/25`,
                riskLevel: riskLevel,
                description: this.generateCategoryDescription(key, score, riskLevel)
            };
        });

        return converted;
    }

    /**
     * Determine risk level based on score
     */
    determineRiskLevel(score) {
        if (score <= 6) return 'low';
        if (score <= 12) return 'medium';
        if (score <= 18) return 'high';
        return 'critical';
    }

    /**
     * Generate category descriptions based on score and category
     */
    generateCategoryDescription(category, score, riskLevel) {
        const descriptions = {
            'dataStorage': {
                low: 'Data storage practices meet security standards with adequate encryption and access controls.',
                medium: 'Enhanced encryption and access controls recommended for sensitive data protection.',
                high: 'Significant data security improvements required. Review storage policies and compliance.',
                critical: 'Critical data security gaps identified. Immediate remediation required.'
            },
            'trainingUsage': {
                low: 'Training data policies are acceptable with standard privacy protections.',
                medium: 'Review required for training data policies to ensure compliance with privacy requirements.',
                high: 'Training data usage requires significant policy improvements and compliance verification.',
                critical: 'Critical issues with training data usage. Immediate policy review required.'
            },
            'accessControls': {
                low: 'Access control mechanisms meet enterprise security standards.',
                medium: 'Enhanced access controls recommended for improved security.',
                high: 'Access control weaknesses identified. Significant improvements needed.',
                critical: 'Critical access control failures. Immediate security review required.'
            },
            'complianceRisk': {
                low: 'Compliance requirements are adequately addressed.',
                medium: 'Additional compliance verification recommended for regulatory requirements.',
                high: 'Compliance gaps identified. Enhanced controls needed for regulatory adherence.',
                critical: 'Critical compliance failures. Immediate regulatory review required.'
            },
            'vendorTransparency': {
                low: 'Vendor documentation and transparency meet standard requirements.',
                medium: 'Enhanced vendor transparency and documentation recommended.',
                high: 'Vendor transparency gaps require attention. Additional documentation needed.',
                critical: 'Critical vendor transparency issues. Immediate review of vendor agreements required.'
            }
        };

        return descriptions[category]?.[riskLevel] || `${riskLevel.toUpperCase()} risk identified in ${category} category.`;
    }

    /**
     * Generate Azure permissions HTML based on assessment data
     */
    generateAzurePermissions(assessmentData) {
        // Example permissions based on tool category and use case
        const permissions = [
            { name: 'User.Read', status: 'granted' },
            { name: 'Profile.Read', status: 'granted' },
            { name: 'Files.Read', status: assessmentData.formData?.dataClassification === 'public' ? 'granted' : 'limited' },
            { name: 'Mail.Send', status: 'denied' },
            { name: 'Calendar.Read', status: 'limited' },
            { name: 'Directory.Read', status: 'denied' }
        ];

        return permissions.map(perm => `
            <div class="permission-item ${perm.status}">
                <div class="permission-title">${perm.name}</div>
                <div class="permission-status">${perm.status}</div>
            </div>
        `).join('');
    }

    /**
     * Generate category breakdown HTML
     */
    generateCategoryBreakdown(breakdown) {
        return Object.entries(breakdown).map(([name, data]) => `
            <div class="category-card ${data.riskLevel}">
                <div class="category-header">
                    <div class="category-name">${name}</div>
                    <div class="category-score ${data.riskLevel}">${data.score}</div>
                </div>
                <div class="category-description">
                    ${data.description}
                </div>
            </div>
        `).join('');
    }

    /**
     * Generate recommendations HTML
     */
    generateRecommendations(assessmentData) {
        const recommendations = this.generateSmartRecommendations(assessmentData);
        
        return recommendations.map(rec => `
            <div class="recommendation-card priority-${rec.priority}">
                <div class="recommendation-header">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="priority-badge priority-${rec.priority}">${rec.priority.toUpperCase()}</div>
                </div>
                <div class="recommendation-text">
                    ${rec.description}
                    ${rec.timeline ? `<br><br><strong>Timeline:</strong> ${rec.timeline} | <strong>Owner:</strong> ${rec.owner}` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * Generate smart recommendations based on assessment
     */
    generateSmartRecommendations(assessmentData) {
        const recommendations = [];
        const { formData, results } = assessmentData;
        
        // High-priority recommendations based on data classification
        if (formData.dataClassification === 'financial') {
            recommendations.push({
                title: 'PCI-DSS Compliance Verification',
                priority: 'high',
                description: '💳 Conduct comprehensive PCI-DSS compliance audit to ensure financial data handling meets regulatory requirements. Verify data encryption, access logging, and secure transmission protocols.',
                timeline: '30 days',
                owner: 'Security Team'
            });

            recommendations.push({
                title: 'SOX Controls Implementation',
                priority: 'high',
                description: '📊 Implement Sarbanes-Oxley controls for financial reporting data processed through the AI tool. Establish audit trails, data integrity checks, and access accountability measures.',
                timeline: '45 days',
                owner: 'Compliance Team'
            });
        }

        if (formData.dataClassification === 'phi') {
            recommendations.push({
                title: 'HIPAA Compliance Review',
                priority: 'high',
                description: '🏥 Conduct HIPAA compliance assessment to ensure protected health information handling meets regulatory standards.',
                timeline: '30 days',
                owner: 'Compliance Team'
            });
        }

        // Medium-priority recommendations based on risk score
        if (results.finalScore > 40) {
            recommendations.push({
                title: 'Enhanced Data Loss Prevention (DLP)',
                priority: 'medium',
                description: '🛡️ Configure advanced DLP policies to monitor and prevent sensitive data from being inadvertently shared through AI interactions.',
                timeline: '60 days',
                owner: 'IT Security'
            });
        }

        // Standard recommendations
        recommendations.push({
            title: 'AI Governance Committee',
            priority: 'medium',
            description: '👥 Create a cross-functional AI governance committee to oversee AI tool usage, establish usage policies, and conduct regular risk assessments.',
            timeline: '90 days',
            owner: 'Executive Team'
        });

        recommendations.push({
            title: 'Usage Analytics Dashboard',
            priority: 'low',
            description: '📈 Deploy comprehensive usage analytics to track AI tool utilization patterns, identify potential security anomalies, and generate compliance reports.',
            timeline: '120 days',
            owner: 'IT Operations'
        });

        return recommendations.slice(0, 5); // Limit to top 5 recommendations
    }

    /**
     * Generate key findings based on assessment
     */
    generateKeyFindings(assessmentData) {
        const findings = [];
        const { formData, results } = assessmentData;

        if (formData.dataClassification === 'financial') {
            findings.push('• Financial/Payment data classification requires enhanced security controls');
        }

        if (formData.dataClassification === 'phi') {
            findings.push('• PHI data handling requires HIPAA compliance verification');
        }

        if (results.finalScore > 50) {
            findings.push('• Elevated risk score requires additional security measures');
        }

        findings.push('• Data storage practices need compliance verification');
        findings.push('• Access controls and vendor transparency assessments recommended');

        return findings.join('<br>');
    }

    /**
     * Main binding function - converts assessment data to template variables
     */
    bindAssessmentData(assessmentData) {
        const { formData, results } = assessmentData;
        const riskLevel = results.riskLevel || 'medium';
        const riskConfig = this.riskConfig[riskLevel];
        
        // Convert database breakdown format
        const breakdown = this.convertDatabaseBreakdown(results.breakdown);
        
        // Tool name with version
        const toolName = results.toolName + 
            (formData.toolVersion === 'enterprise' && 
             !results.toolName.toLowerCase().includes('enterprise') ? ' Enterprise' : '');

        // Get data classification info
        const dataClassInfo = this.dataClassifications[formData.dataClassification] || 
            { label: 'Unknown', class: '' };

        const templateData = {
            // Basic info
            toolName: toolName,
            toolIconText: this.getToolIcon(toolName),
            toolCategory: formData.toolCategory || 'AI Tool',
            assessmentId: Date.now(),
            generatedDate: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            }),
            assessmentDate: new Date().toLocaleDateString(),
            nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            }),
            
            // Risk scoring
            riskScore: results.finalScore,
            riskLevel: riskLevel.toUpperCase() + ' RISK',
            riskColor: riskConfig.color,
            riskDegrees: riskConfig.degrees,
            riskDescription: riskConfig.description,
            currentRiskClass: riskLevel === 'low' ? 'current-risk' : '',
            
            // Tool details
            primaryUseCase: this.useCaseLabels[formData.useCase] || formData.useCase,
            dataClassification: dataClassInfo.label,
            dataClassificationClass: dataClassInfo.class,
            riskCategory: 'AI Security Assessment',
            vendor: this.extractVendor(toolName),
            licenseType: formData.toolVersion === 'enterprise' ? 'Enterprise SaaS' : 'Standard SaaS',
            
            // Summary insights
            securityStatusText: this.generateSecurityStatus(results),
            complianceImpactText: this.generateComplianceImpact(formData),
            mainRecommendationText: this.generateMainRecommendation(assessmentData),
            keyFindings: this.generateKeyFindings(assessmentData),
            
            // Dynamic content
            azurePermissions: this.generateAzurePermissions(assessmentData),
            categoryBreakdown: this.generateCategoryBreakdown(breakdown),
            recommendations: this.generateRecommendations(assessmentData)
        };

        return templateData;
    }

    /**
     * Get tool icon text based on tool name
     */
    getToolIcon(toolName) {
        const name = toolName.toLowerCase();
        if (name.includes('chatgpt') || name.includes('gpt')) return 'GPT';
        if (name.includes('claude')) return 'AI';
        if (name.includes('copilot')) return 'CP';
        if (name.includes('gemini')) return 'GM';
        return 'AI';
    }

    /**
     * Extract vendor from tool name
     */
    extractVendor(toolName) {
        const name = toolName.toLowerCase();
        if (name.includes('chatgpt') || name.includes('gpt')) return 'OpenAI';
        if (name.includes('claude')) return 'Anthropic';
        if (name.includes('copilot')) return 'Microsoft';
        if (name.includes('gemini')) return 'Google';
        return 'Unknown';
    }

    /**
     * Generate security status text
     */
    generateSecurityStatus(results) {
        const score = results.finalScore;
        if (score <= 25) return 'Tool meets security standards with minimal risk concerns.';
        if (score <= 50) return 'Tool meets basic security standards with some areas requiring attention.';
        if (score <= 75) return 'Tool requires enhanced security controls before deployment.';
        return 'Tool poses significant security risks requiring immediate attention.';
    }

    /**
     * Generate compliance impact text
     */
    generateComplianceImpact(formData) {
        const dataType = formData.dataClassification;
        if (dataType === 'financial') return 'PCI-DSS and SOX compliance verification needed due to financial data classification.';
        if (dataType === 'phi') return 'HIPAA compliance review required for protected health information handling.';
        if (dataType === 'pii') return 'Privacy compliance review recommended for personal data handling.';
        return 'Standard enterprise compliance controls are sufficient for current data classification.';
    }

    /**
     * Generate main recommendation text
     */
    generateMainRecommendation(assessmentData) {
        const score = assessmentData.results.finalScore;
        const dataType = assessmentData.formData.dataClassification;
        
        if (score > 75) return 'Immediate security review required before deployment authorization.';
        if (dataType === 'financial' || dataType === 'phi') return 'Implement enhanced compliance controls before full deployment.';
        if (score > 50) return 'Deploy additional security monitoring and controls before full rollout.';
        return 'Proceed with standard enterprise monitoring and periodic reviews.';
    }

    /**
     * Replace template variables in HTML
     */
    replaceTemplateVariables(template, data) {
        let result = template;
        
        // Replace all {{variable}} patterns
        Object.entries(data).forEach(([key, value]) => {
            const pattern = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(pattern, value || '');
        });
        
        // Clean up any remaining unreplaced variables
        result = result.replace(/{{[^}]+}}/g, '');
        
        return result;
    }

    /**
     * Embed just the tool name and version - let export template query database directly
     */
    embedAssessmentData(template, assessmentData) {
        // Simple approach: just pass tool name and version, let export do its own database query
        const embeddedData = {
            toolName: assessmentData.results.toolName,
            toolVersion: assessmentData.formData.toolVersion
        };

        // Inject this data into the template's JavaScript
        const dataScript = `
        <script>
        // Tool identification from index.html assessment - export will query database directly
        window.EMBEDDED_TOOL_INFO = ${JSON.stringify(embeddedData, null, 2)};
        console.log('✅ Tool info from index.html:', window.EMBEDDED_TOOL_INFO);
        </script>`;

        // Insert the script before the closing head tag
        const result = template.replace('</head>', dataScript + '\n</head>');
        
        return result;
    }

    /**
     * Main function: Generate complete HTML report
     */
    async generateHTMLReport(assessmentData, templatePath) {
        try {
            // Load template
            const template = await this.loadTemplate(templatePath);
            
            // Embed just tool name and version into template JavaScript
            const templateWithData = this.embedAssessmentData(template, assessmentData);
            
            // Bind assessment data to template variables (for any remaining {{}} placeholders)
            const templateData = this.bindAssessmentData(assessmentData);
            
            // Replace variables in template
            const finalHTML = this.replaceTemplateVariables(templateWithData, templateData);
            
            return finalHTML;
        } catch (error) {
            console.error('Template binding error:', error);
            throw new Error(`Failed to generate HTML report: ${error.message}`);
        }
    }

    /**
     * Export HTML report as file
     */
    async exportHTMLReport(assessmentData, templatePath = './templates/export-template.html') {
        try {
            const html = await this.generateHTMLReport(assessmentData, templatePath);
            return html;
        } catch (error) {
            console.error('HTML export failed:', error);
            throw error;
        }
    }
}

// Global instance for use in main application
window.TemplateBindingEngine = TemplateBindingEngine;
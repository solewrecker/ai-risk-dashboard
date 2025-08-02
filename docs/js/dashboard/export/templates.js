// Define the base template for reports
// Define templates as global window properties to avoid module resolution issues
window.baseTemplate = `
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>{{name}}</h1>
            <p class="subtitle">AI Tool Security Assessment Report</p>
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary">
            <div class="risk-badge">{{risk_level}} RISK</div>
            <h2>Executive Summary</h2>
            <p style="margin: 15px 0; font-size: 1.1rem;">
                <strong>{{summary_and_recommendation}}</strong>
            </p>

            <div class="tool-info">
                <div class="info-card">
                    <h3>Vendor</h3>
                    <p>{{vendor}}</p>
                </div>
                <div class="info-card">
                    <h3>License Type</h3>
                    <p>{{license_type}}</p>
                </div>
                <div class="info-card">
                    <h3>Category</h3>
                    <p>{{category}}</p>
                </div>
                <div class="info-card">
                    <h3>Data Classification</h3>
                    <p>{{data_classification}}</p>
                </div>
                <div class="info-card">
                    <h3>Assessment Confidence</h3>
                    <p>{{confidence}}%</p>
                </div>
                <div class="info-card">
                    <h3>Documentation Tier</h3>
                    <p>{{documentation_tier}}</p>
                </div>
            </div>
        </div>

        {{{sectionsHtml}}}

        <!-- All Data Section (for debugging/verification) -->
        <div class="all-data-section">
            <h2>All Available Data (Flattened)</h2>
            <ul>
                <li><strong>Name:</strong> {{name}}</li>
                <li><strong>Vendor:</strong> {{vendor}}</li>
                <li><strong>Risk Level:</strong> {{risk_level}}</li>
                <li><strong>Total Score:</strong> {{total_score}}</li>
                <li><strong>Data Storage Score:</strong> {{data_storage_score}}</li>
                <li><strong>Training Usage Score:</strong> {{training_usage_score}}</li>
                <li><strong>Access Controls Score:</strong> {{access_controls_score}}</li>
                <li><strong>Compliance Score:</strong> {{compliance_score}}</li>
                <li><strong>Vendor Transparency Score:</strong> {{vendor_transparency_score}}</li>
                <li><strong>Category:</strong> {{category}}</li>
                <li><strong>Data Classification:</strong> {{data_classification}}</li>
                <li><strong>Is Public:</strong> {{is_public}}</li>
                <li><strong>Primary Use Case:</strong> {{primary_use_case}}</li>
                <li><strong>Assessed By:</strong> {{assessed_by}}</li>
                <li><strong>Documentation Tier:</strong> {{documentation_tier}}</li>
                <li><strong>Assessment Notes:</strong> {{assessment_notes}}</li>
                <li><strong>License Type:</strong> {{license_type}}</li>
                <li><strong>Summary and Recommendation:</strong> {{summary_and_recommendation}}</li>
                <li><strong>Compliance Summary:</strong> {{compliance_summary}}</li>
                <li><strong>Final Risk Category:</strong> {{final_risk_category}}</li>
                <li><strong>Final Score with Multiplier:</strong> {{final_score_with_multiplier}}</li>
                <li><strong>Use Case Multiplier Applied:</strong> {{use_case_multiplier_applied}}</li>
                <li><strong>Confidence:</strong> {{confidence}}</li>
                <li><strong>Recommendations:</strong>
                    <ul>
                    {{#each recommendations}}
                        <li>{{this}}</li>
                    {{/each}}
                    </ul>
                </li>
                <li><strong>Compliance Certifications:</strong> {{compliance_certifications}}</li>
                <li><strong>Sources:</strong>
                    <ul>
                    {{#each sources}}
                        <li><a href="{{this.url}}" target="_blank">{{this.name}}</a></li>
                    {{/each}}
                    </ul>
                </li>
                <li><strong>Azure Permissions:</strong> {{azure_permissions}}</li>
                <li><strong>Detailed Assessment:</strong> <pre>{{JSONstringify detailed_assessment}}</pre></li>
            </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; {{currentYear}} AI Security Council. All rights reserved. | <a href="/">Back to Dashboard</a></p>
        </div>

        <div class="premium-feature">
            <div class="premium-feature__icon">⚖️</div>
            <div class="premium-feature__content">
                <h3 class="premium-feature__title">Legal & Compliance Deep Dive</h3>
                <p class="premium-feature__description">Comprehensive regulatory compliance analysis</p>
            </div>
        </div>
        <div class="premium-feature">
            <div class="premium-feature__icon">📈</div>
            <div class="premium-feature__content">
                <h3 class="premium-feature__title">Industry Benchmarking</h3>
                <p class="premium-feature__description">Compare against industry peers and best practices</p>
            </div>
        </div>
    </div>
`;

// Footer template with legal disclaimers and documentation tier
export const footerTemplate = `<footer class="report-footer">
    <div class="report-footer__content">
        <div class="report-footer__section">
            <h3 class="report-footer__title">📋 Assessment Sources</h3>
            <div class="report-footer__sources">
                {{#if sources}}
                    {{#each sources}}
                    <div class="source-item">
                        <span class="source-item__type">{{type}}</span>
                        <span class="source-item__description">{{description}}</span>
                        {{#if url}}<a href="{{url}}" class="source-item__link" target="_blank">View Source</a>{{/if}}
                    </div>
                    {{/each}}
                {{else}}
                    <p class="report-footer__text">Assessment based on publicly available information and vendor documentation.</p>
                {{/if}}
            </div>
        </div>
        
        {{#if azurePermissions}}
        <div class="report-footer__section">
            <h3 class="report-footer__title">☁️ Azure Integration & Restrictions</h3>
            <div class="azure-permissions">
                {{#if azurePermissions.recommended_restrictions}}
                <div class="azure-permissions__item">
                    <h4 class="azure-permissions__subtitle">Recommended Restrictions</h4>
                    <ul class="azure-permissions__list">
                        {{#each azurePermissions.recommended_restrictions}}
                        <li class="azure-permissions__restriction">{{this}}</li>
                        {{/each}}
                    </ul>
                </div>
                {{/if}}
                
                {{#if azurePermissions.conditional_access}}
                <div class="azure-permissions__item">
                    <h4 class="azure-permissions__subtitle">Conditional Access Requirements</h4>
                    <p class="azure-permissions__text">{{azurePermissions.conditional_access}}</p>
                </div>
                {{/if}}
            </div>
        </div>
        {{/if}}
        
        <div class="report-footer__section">
            <h3 class="report-footer__title">📊 Documentation Tier</h3>
            <div class="documentation-tier">
                <div class="documentation-tier__badge documentation-tier__badge--{{#contains documentationTier 'Public'}}public{{else}}{{#contains documentationTier 'Vendor'}}vendor{{else}}comprehensive{{/contains}}{{/contains}}">
                    {{documentationTier}}
                </div>
                <p class="documentation-tier__description">{{assessmentNotes}}</p>
            </div>
        </div>
        
        <div class="report-footer__section">
            <h3 class="report-footer__title">⚖️ Legal Disclaimer</h3>
            <div class="legal-disclaimer">
                <p class="legal-disclaimer__text">
                    <strong>Important:</strong> This assessment is provided for informational purposes only and should not be considered as legal, compliance, or security advice. Organizations should conduct their own due diligence and consult with qualified professionals before making decisions based on this assessment.
                </p>
                <p class="legal-disclaimer__text">
                    The information contained in this report is based on publicly available sources and vendor-provided documentation as of the assessment date. Security postures and compliance statuses may change over time. Users are advised to verify current information directly with vendors.
                </p>
                <p class="legal-disclaimer__text">
                    <strong>Limitation of Liability:</strong> The AI Security Council and its contributors shall not be liable for any damages arising from the use of this assessment or any decisions made based on its contents.
                </p>
            </div>
        </div>
        
        <div class="report-footer__meta">
            <div class="report-footer__generated">
                <span class="report-footer__label">Generated:</span>
                <span class="report-footer__value">{{reportDate}}</span>
            </div>
            <div class="report-footer__assessed-by">
                <span class="report-footer__label">Assessed by:</span>
                <span class="report-footer__value">{{assessedBy}}</span>
            </div>
            <div class="report-footer__id">
                <span class="report-footer__label">Assessment ID:</span>
                <span class="report-footer__value">{{assessmentIdShort}}</span>
            </div>
        </div>
    </div>
</footer>`;

// Report type configurations
window.reportConfigs = {
    'executive': {
        title: 'Executive Summary Report',
        sections: ['summary-section'],
        description: 'High-level overview for executives and decision makers'
    },
    'detailed': {
        title: 'Detailed Technical Report', 
        sections: ['summary-section', 'detailed-breakdown-section', 'recommendations-section'],
        description: 'Comprehensive technical analysis with detailed recommendations'
    },
    'premium': {
        title: 'Premium Security Assessment',
        sections: ['summary-section', 'premium-features-section', 'detailed-breakdown-section', 'recommendations-section', 'compliance-section'],
        description: 'Complete assessment with premium features and compliance analysis'
    },
    'comparison': {
        title: 'Comparison Analysis Report',
        sections: ['summary-section', 'comparison-table-section'],
        description: 'Side-by-side comparison of multiple assessments'
    }
};

// No need to export baseTemplate as it's now a global window property

// Available themes configuration
window.themeConfigs = {
    'theme-professional': {
        name: 'Professional',
        description: 'Clean corporate design with blue accents',
        primaryColor: '#3b82f6',
        category: 'business'
    },
    'theme-executive': {
        name: 'Executive',
        description: 'Sophisticated dark blue and gold for high-level presentations',
        primaryColor: '#1e3a8a',
        category: 'premium'
    },
    'theme-modern': {
        name: 'Modern',
        description: 'Vibrant purple and teal with contemporary styling',
        primaryColor: '#8b5cf6',
        category: 'creative'
    },
    'theme-dark': {
        name: 'Dark',
        description: 'Sophisticated dark mode with purple accents',
        primaryColor: '#374151',
        category: 'modern'
    }
};
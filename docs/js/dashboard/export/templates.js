// Unified template system - all templates use external CSS for theming
// Only data changes between report types, styling is handled by themes

export const baseTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{reportTitle}} - {{toolName}}</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/components/report-base.css">
    <link rel="stylesheet" href="/css/components/report-header.css">
    <link rel="stylesheet" href="/css/components/report-cards.css">
    <link rel="stylesheet" href="/css/components/report-sections.css">
    <link rel="stylesheet" href="/css/components/report-main.css">
    <link rel="stylesheet" href="/css/components/report-footer.css">
    <link id="theme-stylesheet" rel="stylesheet" href="/css/themes/{{selectedTheme}}.css">
</head>
<body>
    <div class="report-container">
        <header class="report-header">
            <div class="report-header__content">
                <h1 class="report-header__title">{{reportTitle}}</h1>
                <div class="report-header__tool-highlight">
                    <h2 class="report-header__tool-name report-header__tool-name--centered">{{toolName}}</h2>
                    <p class="report-header__tool-subtitle">{{toolSubtitle}}</p>
                </div>
                <div class="report-header__meta">
                    <span>📅 Report Date: {{reportDate}}</span>
                    <span>🔍 Assessment ID: {{assessmentIdShort}}</span>
                    <span>👤 Assessed by: {{assessedBy}}</span>
                </div>
            </div>
        </header>
        <main class="report-main">
            <div class="report-main__content">
                {{{sectionsHtml}}}
            </div>
        </main>
        {{{footerHtml}}}
    </div>
</body>
</html>`;

export const summarySectionTemplate = `<section class="summary-section">
    <div class="summary-section__score-container">
        <div class="summary-section__score-display summary-section__score-display--{{riskLevelLower}}">
            <div class="summary-section__score-number">{{overallScore}}</div>
            <div class="summary-section__score-total">out of {{maxScore}}</div>
            <div class="summary-section__risk-badge summary-section__risk-badge--{{riskLevelLower}}">{{riskLevel}} RISK</div>
            <p class="summary-section__risk-description">{{riskDescription}}</p>
        </div>
    </div>

    <div class="summary-section__content">
        <div class="summary-section__insights">
            <div class="summary-section__insight-item">
                <h3 class="summary-section__insight-title">💪 Key Strengths</h3>
                <p class="summary-section__insight-text">{{keyStrengths}}</p>
            </div>
            
            <div class="summary-section__insight-item">
                <h3 class="summary-section__insight-title">⚠️ Areas for Improvement</h3>
                <p class="summary-section__insight-text">{{areasForImprovement}}</p>
            </div>
            
            <div class="summary-section__insight-item">
                <h3 class="summary-section__insight-title">🔍 Key Findings</h3>
                <ul class="summary-section__findings-list">
                    {{#each findings}}
                    <li class="summary-section__finding-item">{{this.text}}</li>
                    {{/each}}
                </ul>
            </div>
        </div>
    </div>
</section>`;

export const detailedBreakdownSectionTemplate = `<section class="detailed-breakdown-section">
    <div class="detailed-breakdown-section__header">
        <h2 class="detailed-breakdown-section__title">
            🛡️ Detailed Breakdown of Risks
        </h2>
    </div>
    <div class="detailed-breakdown-section__grid">
        {{#each detailedAssessmentDetails}}
        <div class="detailed-breakdown-card detailed-breakdown-card--{{this.risk_level}}">
            <div class="detailed-breakdown-card__header">
                <h3 class="detailed-breakdown-card__title">{{this.displayName}}</h3>
                <div class="detailed-breakdown-card__score detailed-breakdown-card__score--{{this.risk_level}}">{{this.category_score}}</div>
            </div>
            <div class="detailed-breakdown-card__content">
                <p class="detailed-breakdown-card__description">{{this.description}}</p>
                {{#if this.criteria}}
                <div class="detailed-breakdown-card__criteria">
                    {{#each this.criteria}}
                    <div class="detailed-breakdown-card__criterion">
                        <h4 class="detailed-breakdown-card__criterion-title">{{this.key}} <span class="detailed-breakdown-card__criterion-score">{{this.score}}</span></h4>
                        <p class="detailed-breakdown-card__criterion-text">{{this.justification}}</p>
                    </div>
                    {{/each}}
                </div>
                {{/if}}
            </div>
        </div>
        {{/each}}
    </div>
</section>`;

export const recommendationsSectionTemplate = `<section class="recommendations-section">
    <div class="recommendations-section__header">
        <h2 class="recommendations-section__title">
            💡 Key Recommendations
        </h2>
    </div>
    <div class="recommendations-section__grid">
        {{#each recommendationsList}}
        <div class="recommendations-item recommendations-item--{{this.priority}}">
            <div class="recommendations-item__priority">{{this.priority}}</div>
            <div class="recommendations-item__content">
                <h3 class="recommendations-item__title">{{this.title}}</h3>
                <p class="recommendations-item__description">{{this.description}}</p>
            </div>
        </div>
        {{/each}}
    </div>
</section>`;

export const complianceSectionTemplate = `<section class="compliance-section">
    <div class="compliance-section__header">
        <h2 class="compliance-section__title">
            ⚖️ Compliance & Certifications
        </h2>
    </div>
    <div class="compliance-section__grid">
        {{#each complianceCertifications}}
        <div class="compliance-item compliance-item--{{this.status}}">
            <div class="compliance-item__icon">{{this.icon}}</div>
            <div class="compliance-item__content">
                <h3 class="compliance-item__title">{{this.name}}</h3>
                <p class="compliance-item__status">{{this.status}}</p>
                <p class="compliance-item__description">{{this.description}}</p>
            </div>
        </div>
        {{/each}}
    </div>
</section>`;

export const comparisonTableSectionTemplate = `<section class="comparison-section">
    <div class="comparison-section__header">
        <h2 class="comparison-section__title">
            📊 Comparison Analysis
        </h2>
    </div>
    <div class="comparison-section__table-container">
        <table class="comparison-table">
            <thead class="comparison-table__head">
                <tr class="comparison-table__row">
                    <th class="comparison-table__header">Assessment</th>
                    <th class="comparison-table__header">Total Score</th>
                    <th class="comparison-table__header">Risk Level</th>
                </tr>
            </thead>
            <tbody class="comparison-table__body">
                {{#each comparisonData}}
                <tr class="comparison-table__row">
                    <td class="comparison-table__cell comparison-table__cell--name">{{this.name}}</td>
                    <td class="comparison-table__cell comparison-table__cell--score">{{this.total_score}}</td>
                    <td class="comparison-table__cell comparison-table__cell--risk comparison-table__cell--{{this.risk_level}}">{{this.risk_level}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
</section>`;

// Premium features section - only shown in premium reports
export const premiumFeaturesTemplate = `<section class="premium-features-section">
    <div class="premium-features-section__header">
        <h2 class="premium-features-section__title">
            ⭐ Premium Analysis Features
        </h2>
    </div>
    <div class="premium-features-section__grid">
        <div class="premium-feature">
            <div class="premium-feature__icon">🛡️</div>
            <div class="premium-feature__content">
                <h3 class="premium-feature__title">Advanced Threat Intelligence</h3>
                <p class="premium-feature__description">In-depth analysis with real-time threat data integration</p>
            </div>
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
</section>`;

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
        
        <div class="report-footer__section report-footer__section--legal">
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
export const reportConfigs = {
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

// Available themes configuration
export const themeConfigs = {
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
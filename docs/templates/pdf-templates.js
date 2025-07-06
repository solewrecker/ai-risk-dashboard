// ==========================================
// PDF TEMPLATE MANAGEMENT SYSTEM
// ==========================================

/**
 * Template Manager - Handles multiple PDF templates
 * Best practices for frontend template management
 */
class PDFTemplateManager {
    constructor() {
        this.templates = new Map();
        this.currentTemplate = 'enterprise-report';
        this.loadDefaultTemplates();
    }

    loadDefaultTemplates() {
        // Register built-in templates
        this.register('enterprise-report', new EnterpriseReportTemplate());
        this.register('executive-summary', new ExecutiveSummaryTemplate());
        this.register('compliance-audit', new ComplianceAuditTemplate());
    }

    register(name, template) {
        this.templates.set(name, template);
    }

    get(name = null) {
        const templateName = name || this.currentTemplate;
        return this.templates.get(templateName) || this.templates.get('enterprise-report');
    }

    setDefault(name) {
        if (this.templates.has(name)) {
            this.currentTemplate = name;
            return true;
        }
        return false;
    }

    list() {
        return Array.from(this.templates.keys());
    }

    generateReport(data, templateName = null) {
        const template = this.get(templateName);
        return template.render(data);
    }
}

/**
 * Base Template Class - Foundation for all PDF templates
 */
class BaseTemplate {
    constructor() {
        this.name = 'base';
        this.version = '1.0';
        this.author = 'AI Risk Framework';
    }

    render(data) {
        const processedData = this.preprocessData(data);
        const html = this.getTemplate();
        return this.bindData(html, processedData);
    }

    preprocessData(data) {
        // Add computed fields, format data, etc.
        const baseData = {
            ...data,
            generatedDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            }),
            assessmentId: Date.now(),
            riskColors: this.getRiskColors()[data.riskLevel?.toLowerCase()] || this.getRiskColors()['medium']
        };
        
        // Add additional fields for the new template
        return {
            ...baseData,
            currentYear: new Date().getFullYear(),
            riskLevel: baseData.riskLevel?.toUpperCase() || 'MEDIUM',
            // Ensure we have proper category data
            categories: baseData.categories || [],
            recommendations: baseData.recommendations || ['Follow security best practices'],
        };
    }

    bindData(html, data) {
        // Replace all simple template variables first
        html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return this.getValue(data, key) || match;
        });

        // Handle categories loop
        if (data.categories) {
            const categoriesHTML = data.categories.map(category => {
                const riskClass = this.getRiskClass(category.score, 25); // Max score is typically 25
                return `
                    <div class="category-item ${riskClass}">
                        <div class="category-name">${category.name}</div>
                        <div class="category-score">${category.score}/25</div>
                        <div class="category-description">${category.description}</div>
                    </div>
                `;
            }).join('');
            
            html = html.replace(/\{\{#each categories\}\}.*?\{\{\/each\}\}/gs, categoriesHTML);
        }

        // Handle recommendations loop
        if (data.recommendations) {
            const recommendationsHTML = data.recommendations.map(rec => {
                const priority = this.getRecommendationPriority(rec);
                return `
                    <div class="recommendation-item ${priority}">
                        <div class="recommendation-text">${rec}</div>
                    </div>
                `;
            }).join('');
            
            html = html.replace(/\{\{#each recommendations\}\}.*?\{\{\/each\}\}/gs, recommendationsHTML);
        }

        return html;
    }

    getRiskClass(score, maxScore) {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'critical';
        if (percentage >= 60) return 'high';
        if (percentage >= 35) return 'medium';
        return 'low';
    }

    getRecommendationPriority(recommendation) {
        const text = recommendation.toLowerCase();
        if (text.includes('immediate') || text.includes('critical') || text.includes('urgent')) {
            return 'critical';
        }
        if (text.includes('significant') || text.includes('important')) {
            return 'high';
        }
        return 'medium';
    }

    getValue(data, key) {
        // Support nested object access like "risk.score"
        return key.split('.').reduce((obj, k) => obj?.[k], data);
    }

    getRiskColors() {
        return {
            'critical': { color: '#dc3545', bg: '#fef2f2', border: '#dc3545' },
            'high': { color: '#fd7e14', bg: '#fff7ed', border: '#fd7e14' },
            'medium': { color: '#ffc107', bg: '#fefce8', border: '#ffc107' },
            'low': { color: '#28a745', bg: '#f0fdf4', border: '#28a745' }
        };
    }

    // Override in subclasses
    getTemplate() {
        throw new Error('getTemplate() must be implemented by subclass');
    }
}

/**
 * Enterprise Report Template - Professional multi-page report
 * Updated to match export-template.html design
 */
class EnterpriseReportTemplate extends BaseTemplate {
    constructor() {
        super();
        this.name = 'enterprise-report';
        this.description = 'Professional enterprise security assessment report';
    }

    getTemplate() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Risk Assessment Report - {{toolName}}</title>
            <style>
                ${this.getCSS()}
            </style>
        </head>
        <body>
            ${this.getHTML()}
        </body>
        </html>`;
    }

    getCSS() {
        return `
        /* === PDF PAGE SETUP === */
        @page {
            size: A4;
            margin: 0.75in;
        }

        /* === DYNAMIC VARIABLES === */
        :root {
            --risk-color: {{riskColors.color}};
            --risk-degrees: calc({{riskScore}} * 3.6deg);
        }

        /* === BASE STYLES === */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: white;
            font-size: 11pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .report-container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
        }

        /* === HEADER === */
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 3rem 2rem;
            position: relative;
            overflow: hidden;
            page-break-inside: avoid;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(50px, -50px);
        }

        .header-content {
            position: relative;
            z-index: 2;
            text-align: center;
        }

        .report-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
        }

        .report-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            font-weight: 300;
            margin-bottom: 1.5rem;
        }

        .tool-highlight {
            background: rgba(255, 255, 255, 0.15);
            padding: 1rem;
            border-radius: 8px;
            margin: 1.5rem 0;
        }

        .tool-highlight .tool-name {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .tool-highlight .tool-subtitle {
            font-size: 1rem;
            opacity: 0.9;
        }

        .report-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 0.9rem;
        }

        /* === EXECUTIVE SUMMARY === */
        .executive-summary {
            padding: 2rem;
            background: white;
            border-bottom: 1px solid #e2e8f0;
            page-break-inside: avoid;
        }

        .summary-header {
            margin-bottom: 2rem;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 3rem;
            margin-bottom: 2rem;
            align-items: center;
        }

        /* Enhanced Circular Risk Score */
        .risk-score-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .risk-score-circle {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background: conic-gradient(var(--risk-color) 0deg, var(--risk-color) var(--risk-degrees), #e8f4f8 var(--risk-degrees), #e8f4f8 360deg);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .risk-score-inner {
            width: 110px;
            height: 110px;
            border-radius: 50%;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .risk-score-number {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--risk-color);
            line-height: 1;
        }

        .risk-score-total {
            font-size: 0.9rem;
            color: #64748b;
            margin-top: 0.25rem;
        }

        .risk-status {
            text-align: left;
        }

        .risk-level-badge {
            background: var(--risk-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.9rem;
            display: inline-block;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .risk-description {
            color: #64748b;
            font-size: 0.9rem;
            line-height: 1.5;
        }

        /* === TOOL INFORMATION === */
        .tool-info {
            padding: 2rem;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
        }

        .info-item {
            display: flex;
            flex-direction: column;
        }

        .info-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .info-value {
            font-size: 1rem;
            font-weight: 600;
            color: #1e293b;
        }

        .info-value.critical {
            color: #dc2626;
        }

        /* === CATEGORY BREAKDOWN === */
        .category-breakdown {
            padding: 2rem;
        }

        .categories-grid {
            display: grid;
            gap: 1.5rem;
            margin-top: 2rem;
        }

        .category-item {
            display: grid;
            grid-template-columns: 1fr auto 2fr;
            gap: 1.5rem;
            align-items: center;
            padding: 1.5rem;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #e2e8f0;
        }

        .category-item.critical { border-left-color: #dc2626; }
        .category-item.high { border-left-color: #ea580c; }
        .category-item.medium { border-left-color: #ca8a04; }
        .category-item.low { border-left-color: #16a34a; }

        .category-name {
            font-weight: 600;
            color: #1e293b;
        }

        .category-score {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1e293b;
            text-align: center;
            padding: 0.5rem 1rem;
            background: white;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
        }

        .category-description {
            font-size: 0.9rem;
            color: #64748b;
            line-height: 1.5;
        }

        /* === RECOMMENDATIONS === */
        .recommendations {
            padding: 2rem;
            background: #f8fafc;
        }

        .recommendation-item {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border-left: 4px solid;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            page-break-inside: avoid;
        }

        .recommendation-item.critical { border-left-color: #dc2626; }
        .recommendation-item.high { border-left-color: #ea580c; }
        .recommendation-item.medium { border-left-color: #ca8a04; }

        .recommendation-text {
            font-size: 0.95rem;
            color: #374151;
            line-height: 1.6;
        }

        /* === FOOTER === */
        .footer {
            padding: 2rem;
            background: #1e293b;
            color: white;
            text-align: center;
            font-size: 0.9rem;
        }

        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* === PRINT OPTIMIZATIONS === */
        @media print {
            body { 
                font-size: 10pt;
                line-height: 1.4;
            }
            
            .header {
                padding: 2rem 1.5rem;
            }
            
            .report-title {
                font-size: 2rem;
            }
            
            .executive-summary,
            .tool-info,
            .category-breakdown,
            .recommendations {
                padding: 1.5rem;
            }
            
            .risk-score-circle {
                width: 120px;
                height: 120px;
            }
            
            .risk-score-inner {
                width: 95px;
                height: 95px;
            }
            
            .risk-score-number {
                font-size: 2rem;
            }
            
            .no-print {
                display: none !important;
            }
        }
        `;
    }

    getHTML() {
        return `
            <div class="report-container">
                <!-- === HEADER === -->
                <div class="header">
                    <div class="header-content">
                        <h1 class="report-title">AI TOOL SECURITY RISK ASSESSMENT</h1>
                        <p class="report-subtitle">Enterprise Security Analysis Report</p>
                        
                        <div class="tool-highlight">
                            <div class="tool-name">{{toolName}}</div>
                            <div class="tool-subtitle">{{category}} • {{useCase}}</div>
                        </div>
                        
                        <div class="report-meta">
                            <div>Generated: {{generatedDate}}</div>
                            <div>Assessment ID: {{assessmentId}}</div>
                        </div>
                    </div>
                </div>

                <!-- === EXECUTIVE SUMMARY === -->
                <div class="executive-summary">
                    <div class="summary-header">
                        <h2 class="section-title">📊 Executive Summary</h2>
                    </div>
                    
                    <div class="summary-grid">
                        <div class="risk-score-display">
                            <div class="risk-score-circle">
                                <div class="risk-score-inner">
                                    <div class="risk-score-number">{{riskScore}}</div>
                                    <div class="risk-score-total">/100</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="risk-status">
                            <div class="risk-level-badge">{{riskLevel}} RISK</div>
                            <p class="risk-description">{{riskDescription}}</p>
                        </div>
                    </div>
                </div>

                <!-- === TOOL INFORMATION === -->
                <div class="tool-info">
                    <h2 class="section-title">🔧 Tool Information</h2>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Tool Name</div>
                            <div class="info-value">{{toolName}}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Category</div>
                            <div class="info-value">{{category}}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Use Case</div>
                            <div class="info-value">{{useCase}}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Data Classification</div>
                            <div class="info-value critical">{{dataClassification}}</div>
                        </div>
                    </div>
                </div>

                <!-- === SECURITY CATEGORY BREAKDOWN === -->
                <div class="category-breakdown">
                    <h2 class="section-title">🛡️ Security Category Breakdown</h2>
                    
                    <div class="categories-grid">
                        {{#each categories}}
                        <div class="category-item {{riskClass}}">
                            <div class="category-name">{{name}}</div>
                            <div class="category-score">{{score}}/{{maxScore}}</div>
                            <div class="category-description">{{description}}</div>
                        </div>
                        {{/each}}
                    </div>
                </div>

                <!-- === RECOMMENDATIONS === -->
                <div class="recommendations">
                    <h2 class="section-title">💡 Recommendations</h2>
                    
                    {{#each recommendations}}
                    <div class="recommendation-item {{priority}}">
                        <div class="recommendation-text">{{text}}</div>
                    </div>
                    {{/each}}
                </div>

                <!-- === FOOTER === -->
                <div class="footer">
                    <div class="footer-content">
                        <div>AI Risk Framework © {{currentYear}}</div>
                        <div>Confidential Security Assessment</div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Executive Summary Template - Concise single-page report
 */
class ExecutiveSummaryTemplate extends BaseTemplate {
    constructor() {
        super();
        this.name = 'executive-summary';
        this.description = 'Concise executive summary for leadership';
    }

    getTemplate() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Executive Risk Summary</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .exec-header { background: #1a365d; color: white; padding: 20px; text-align: center; }
                .risk-box { background: #f8f9fa; border: 3px solid {{riskColors.border}}; padding: 30px; margin: 20px 0; text-align: center; }
                .risk-score { font-size: 60pt; color: {{riskColors.color}}; font-weight: bold; }
                .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .summary-table th, .summary-table td { padding: 12px; border: 1px solid #ddd; }
                .summary-table th { background: #1a365d; color: white; }
            </style>
        </head>
        <body>
            <div class="exec-header">
                <h1>EXECUTIVE RISK SUMMARY</h1>
                <p>{{toolName}} Security Assessment</p>
            </div>
            
            <div class="risk-box">
                <div class="risk-score">{{riskScore}}</div>
                <h2>{{riskLevel}} RISK</h2>
                <p>{{riskDescription}}</p>
            </div>

            <table class="summary-table">
                <tr><th>Tool</th><td>{{toolName}}</td></tr>
                <tr><th>Data Type</th><td>{{dataClassification}}</td></tr>
                <tr><th>Recommendation</th><td>{{primaryRecommendation}}</td></tr>
                <tr><th>Assessment Date</th><td>{{generatedDate}}</td></tr>
            </table>
        </body>
        </html>`;
    }
}

/**
 * Compliance Audit Template - Detailed compliance-focused report
 */
class ComplianceAuditTemplate extends BaseTemplate {
    constructor() {
        super();
        this.name = 'compliance-audit';
        this.description = 'Detailed compliance and audit documentation';
    }

    getTemplate() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Compliance Audit Report</title>
            <style>
                body { font-family: 'Times New Roman', serif; margin: 1in; line-height: 1.6; }
                .audit-header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                .compliance-section { margin: 30px 0; page-break-inside: avoid; }
                .audit-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .audit-table th, .audit-table td { padding: 8px; border: 1px solid #000; }
                .audit-table th { background: #f0f0f0; }
                .finding { background: #fff3cd; border-left: 5px solid #ffc107; padding: 15px; margin: 10px 0; }
                .signature-box { margin-top: 50px; border: 1px solid #000; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="audit-header">
                <h1>COMPLIANCE AUDIT REPORT</h1>
                <p><strong>Subject:</strong> {{toolName}} Security Assessment</p>
                <p><strong>Date:</strong> {{generatedDate}}</p>
                <p><strong>Auditor:</strong> AI Risk Framework System</p>
            </div>

            <div class="compliance-section">
                <h2>EXECUTIVE SUMMARY</h2>
                <p>Risk Score: <strong>{{riskScore}}</strong> ({{riskLevel}})</p>
                <p>{{riskDescription}}</p>
            </div>

            <!-- Detailed compliance sections would go here -->

            <div class="signature-box">
                <p><strong>Audit Certification:</strong></p>
                <p>This assessment was conducted in accordance with enterprise security standards.</p>
                <br><br>
                <p>Signature: _________________________ Date: _____________</p>
            </div>
        </body>
        </html>`;
    }
}

// ==========================================
// TEMPLATE STORAGE & PERSISTENCE
// ==========================================

/**
 * Template Storage - Save/load custom templates
 */
class TemplateStorage {
    constructor() {
        this.storageKey = 'pdf-templates';
        this.version = '1.0';
    }

    save(name, template) {
        const templates = this.loadAll();
        templates[name] = {
            content: template,
            created: new Date().toISOString(),
            version: this.version
        };
        localStorage.setItem(this.storageKey, JSON.stringify(templates));
    }

    load(name) {
        const templates = this.loadAll();
        return templates[name]?.content || null;
    }

    loadAll() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch (e) {
            return {};
        }
    }

    delete(name) {
        const templates = this.loadAll();
        delete templates[name];
        localStorage.setItem(this.storageKey, JSON.stringify(templates));
    }

    list() {
        return Object.keys(this.loadAll());
    }

    export() {
        return JSON.stringify(this.loadAll(), null, 2);
    }

    import(jsonData) {
        try {
            const templates = JSON.parse(jsonData);
            localStorage.setItem(this.storageKey, JSON.stringify(templates));
            return true;
        } catch (e) {
            return false;
        }
    }
}

// ==========================================
// USAGE EXAMPLES
// ==========================================

// Initialize the system
const templateManager = new PDFTemplateManager();
const templateStorage = new TemplateStorage();

// Generate a report
const sampleData = {
    toolName: 'Claude Free',
    riskScore: 86,
    riskLevel: 'critical',
    riskDescription: 'This tool poses severe security risks',
    category: 'Code Assistant',
    useCase: 'Legal/Compliance',
    dataClassification: 'Trade Secrets'
};

// Use different templates
const enterpriseReport = templateManager.generateReport(sampleData, 'enterprise-report');
const executiveSummary = templateManager.generateReport(sampleData, 'executive-summary');
const complianceAudit = templateManager.generateReport(sampleData, 'compliance-audit');

// Export the template manager for use in your main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PDFTemplateManager, TemplateStorage };
} else {
    window.PDFTemplateManager = PDFTemplateManager;
    window.TemplateStorage = TemplateStorage;
} 
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
        return {
            ...data,
            generatedDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            }),
            assessmentId: Date.now(),
            riskColors: this.getRiskColors()[data.riskLevel?.toLowerCase()] || this.getRiskColors()['medium']
        };
    }

    bindData(html, data) {
        // Replace all template variables
        return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return this.getValue(data, key) || match;
        });
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
        <html>
        <head>
            <meta charset="UTF-8">
            <title>AI Risk Assessment Report</title>
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

        * { box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.5;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            font-size: 11pt;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .report-container {
            max-width: 100%;
            margin: 0 auto;
            position: relative;
        }

        /* === HEADER === */
        .header {
            background: #1a365d;
            color: white;
            padding: 40px 30px;
            text-align: center;
            margin-bottom: 0;
            page-break-inside: avoid;
        }

        .report-title {
            font-size: 28pt;
            font-weight: bold;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }

        .report-subtitle {
            font-size: 14pt;
            font-weight: normal;
            opacity: 0.9;
        }

        .report-date {
            font-size: 10pt;
            margin-top: 15px;
            opacity: 0.8;
        }

        /* === EXECUTIVE SUMMARY === */
        .executive-summary {
            background: #f8f9fa;
            border: 2px solid {{riskColors.border}};
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            page-break-inside: avoid;
        }

        .summary-title {
            font-size: 16pt;
            font-weight: bold;
            color: {{riskColors.color}};
            margin-bottom: 15px;
            text-transform: uppercase;
        }

        .risk-score-summary {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .risk-score-large {
            font-size: 48pt;
            font-weight: bold;
            color: {{riskColors.color}};
            line-height: 1;
        }

        .risk-level-badge {
            background: {{riskColors.color}};
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12pt;
            display: inline-block;
            margin-bottom: 8px;
        }

        /* === TABLES === */
        .section-header {
            font-size: 14pt;
            font-weight: bold;
            color: #1a365d;
            margin: 30px 0 15px 0;
            border-bottom: 2px solid #1a365d;
            padding-bottom: 5px;
        }

        .info-table, .categories-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10pt;
        }

        .info-table th, .info-table td,
        .categories-table th, .categories-table td {
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
        }

        .info-table th, .categories-table th {
            background: #1a365d;
            color: white;
            font-weight: bold;
        }

        .categories-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        .score-critical { background: #dc3545 !important; color: white; }
        .score-high { background: #fd7e14 !important; color: white; }
        .score-medium { background: #ffc107 !important; color: #333; }
        .score-low { background: #28a745 !important; color: white; }

        /* === RISK MATRIX === */
        .matrix-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        .matrix-table th, .matrix-table td {
            padding: 8px;
            text-align: center;
            border: 1px solid #333;
            font-size: 9pt;
            font-weight: bold;
        }

        .matrix-table th { background: #333; color: white; }
        .matrix-low { background: #d4edda; }
        .matrix-medium { background: #fff3cd; }
        .matrix-high { background: #f8d7da; }
        .matrix-critical { background: #dc3545; color: white; }

        /* === RECOMMENDATIONS === */
        .recommendation-item {
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid;
            page-break-inside: avoid;
        }

        .priority-critical { background: #fef2f2; border-color: #dc3545; }
        .priority-high { background: #fff7ed; border-color: #fd7e14; }
        .priority-medium { background: #fefce8; border-color: #ffc107; }

        .recommendation-header {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 8px;
        }

        /* === FOOTER === */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 9pt;
            color: #666;
        }

        .confidential-marking {
            font-weight: bold;
            color: #dc3545;
            margin-bottom: 10px;
        }

        @media print {
            .no-print { display: none !important; }
            body { print-color-adjust: exact; }
        }
        `;
    }

    getHTML() {
        return `
        <div class="report-container">
            <div class="header">
                <h1 class="report-title">AI RISK FRAMEWORK</h1>
                <p class="report-subtitle">Enterprise Security Analysis Report</p>
                <p class="report-date">Generated: {{generatedDate}}</p>
            </div>

            <div class="executive-summary">
                <h2 class="summary-title">Executive Summary</h2>
                <div class="risk-score-summary">
                    <div class="risk-score-large">{{riskScore}}</div>
                    <div class="risk-classification">
                        <div class="risk-level-badge">{{riskLevel}}</div>
                        <div class="risk-description">Immediate Action Required</div>
                    </div>
                </div>
                <div class="critical-alert">
                    <div class="alert-text">⚠️ WARNING: {{riskDescription}}</div>
                </div>
            </div>

            <h2 class="section-header">Tool Information</h2>
            <table class="info-table">
                <tr><th>Tool Name</th><td>{{toolName}}</td></tr>
                <tr><th>Category</th><td>{{category}}</td></tr>
                <tr><th>Use Case</th><td>{{useCase}}</td></tr>
                <tr><th>Data Classification</th><td><strong style="color: #dc2626;">{{dataClassification}}</strong></td></tr>
                <tr><th>Assessment Date</th><td>{{generatedDate}}</td></tr>
                <tr><th>Assessment ID</th><td>{{assessmentId}}</td></tr>
            </table>

            <!-- Risk Matrix, Categories, Recommendations would go here -->
            <!-- {{DYNAMIC_CONTENT}} -->

            <div class="footer">
                <div class="confidential-marking">CONFIDENTIAL - INTERNAL USE ONLY</div>
                <div>AI Tool Risk Assessment Framework v2.0</div>
                <div>Assessment ID: {{assessmentId}} | Generated: {{generatedDate}}</div>
            </div>
        </div>`;
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
// ====================================
// APPROACH 1: Template-Based Generation
// ====================================

class AIRiskReportGenerator {
    constructor() {
        this.template = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>AI Risk Assessment Report</title>
            <style>
                /* Include the CSS from the artifact here */
                @page { size: A4; margin: 0.75in; }
                /* ... rest of CSS ... */
            </style>
        </head>
        <body>
            <!-- Template with placeholders -->
            <div class="report-container">
                <div class="header">
                    <h1 class="report-title">{{REPORT_TITLE}}</h1>
                    <p class="report-date">Generated: {{REPORT_DATE}}</p>
                </div>
                
                <div class="executive-summary">
                    <div class="risk-score-large">{{RISK_SCORE}}</div>
                    <div class="risk-level-badge">{{RISK_LEVEL}}</div>
                </div>
                
                <table class="info-table">
                    <tr><th>Tool Name</th><td>{{TOOL_NAME}}</td></tr>
                    <tr><th>Category</th><td>{{CATEGORY}}</td></tr>
                    <tr><th>Use Case</th><td>{{USE_CASE}}</td></tr>
                    <tr><th>Data Classification</th><td>{{DATA_CLASSIFICATION}}</td></tr>
                </table>
                
                <table class="categories-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Score</th>
                            <th>Risk Level</th>
                            <th>Assessment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{RISK_CATEGORIES}}
                    </tbody>
                </table>
                
                <div class="recommendations-section">
                    {{RECOMMENDATIONS}}
                </div>
            </div>
        </body>
        </html>`;
    }

    generateReport(data) {
        let html = this.template;
        
        // Replace basic placeholders
        html = html.replace('{{REPORT_TITLE}}', data.title || 'AI RISK FRAMEWORK');
        html = html.replace('{{REPORT_DATE}}', new Date().toLocaleDateString());
        html = html.replace('{{RISK_SCORE}}', data.riskScore);
        html = html.replace('{{RISK_LEVEL}}', data.riskLevel);
        html = html.replace('{{TOOL_NAME}}', data.toolName);
        html = html.replace('{{CATEGORY}}', data.category);
        html = html.replace('{{USE_CASE}}', data.useCase);
        html = html.replace('{{DATA_CLASSIFICATION}}', data.dataClassification);
        
        // Generate risk categories table
        const categoriesHtml = data.categories.map(cat => `
            <tr>
                <td><strong>${cat.name}</strong></td>
                <td class="score-cell score-${cat.level.toLowerCase()}">${cat.score}</td>
                <td class="score-cell score-${cat.level.toLowerCase()}">${cat.level}</td>
                <td>${cat.description}</td>
            </tr>
        `).join('');
        html = html.replace('{{RISK_CATEGORIES}}', categoriesHtml);
        
        // Generate recommendations
        const recommendationsHtml = data.recommendations.map((rec, index) => `
            <div class="recommendation-item priority-${rec.priority.toLowerCase()}">
                <div class="recommendation-header">${index + 1}. ${rec.title} (Priority: ${rec.priority})</div>
                <div class="recommendation-text">${rec.description}</div>
            </div>
        `).join('');
        html = html.replace('{{RECOMMENDATIONS}}', recommendationsHtml);
        
        return html;
    }
}

// ====================================
// APPROACH 2: Frontend PDF Generation
// ====================================

// Using Puppeteer (Node.js) or jsPDF (Browser)
class PDFExporter {
    
    // Method 1: Browser-based with window.print()
    exportToPDF_Browser(reportData) {
        const generator = new AIRiskReportGenerator();
        const html = generator.generateReport(reportData);
        
        // Create a new window with the report
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Trigger print dialog
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
    
    // Method 2: Using jsPDF (client-side)
    async exportToPDF_jsPDF(reportData) {
        // Note: jsPDF has limited HTML support
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Manual PDF construction (more control but more work)
        doc.setFontSize(20);
        doc.text('AI RISK FRAMEWORK', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Tool Name: ${reportData.toolName}`, 20, 40);
        doc.text(`Risk Score: ${reportData.riskScore}`, 20, 50);
        doc.text(`Risk Level: ${reportData.riskLevel}`, 20, 60);
        
        // Add table data
        let yPosition = 80;
        reportData.categories.forEach((cat, index) => {
            doc.text(`${cat.name}: ${cat.score} (${cat.level})`, 20, yPosition + (index * 10));
        });
        
        doc.save('ai-risk-assessment.pdf');
    }
    
    // Method 3: Server-side with API call
    async exportToPDF_API(reportData) {
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData)
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-risk-report-${Date.now()}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }
}

// ====================================
// APPROACH 3: React Component Version
// ====================================

// If you're using React
const AIRiskReport = ({ reportData }) => {
    const exportToPDF = () => {
        window.print(); // Simple approach
    };

    return (
        <div className="report-container">
            <div className="header">
                <h1>{reportData.title}</h1>
                <p>Generated: {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="executive-summary">
                <div className="risk-score-large">{reportData.riskScore}</div>
                <div className="risk-level-badge">{reportData.riskLevel}</div>
            </div>
            
            <table className="info-table">
                <tbody>
                    <tr><th>Tool Name</th><td>{reportData.toolName}</td></tr>
                    <tr><th>Category</th><td>{reportData.category}</td></tr>
                    <tr><th>Use Case</th><td>{reportData.useCase}</td></tr>
                </tbody>
            </table>
            
            <table className="categories-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Score</th>
                        <th>Risk Level</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.categories.map((cat, index) => (
                        <tr key={index}>
                            <td><strong>{cat.name}</strong></td>
                            <td className={`score-cell score-${cat.level.toLowerCase()}`}>
                                {cat.score}
                            </td>
                            <td className={`score-cell score-${cat.level.toLowerCase()}`}>
                                {cat.level}
                            </td>
                            <td>{cat.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="recommendations-section">
                {reportData.recommendations.map((rec, index) => (
                    <div key={index} className={`recommendation-item priority-${rec.priority.toLowerCase()}`}>
                        <div className="recommendation-header">
                            {index + 1}. {rec.title} (Priority: {rec.priority})
                        </div>
                        <div className="recommendation-text">{rec.description}</div>
                    </div>
                ))}
            </div>
            
            <button onClick={exportToPDF} className="export-btn">
                Export to PDF
            </button>
        </div>
    );
};

// ====================================
// APPROACH 4: Server-Side Generation (Node.js)
// ====================================

// Using Puppeteer for server-side PDF generation
const puppeteer = require('puppeteer');

class ServerPDFGenerator {
    async generatePDF(reportData) {
        const generator = new AIRiskReportGenerator();
        const html = generator.generateReport(reportData);
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdf = await page.pdf({
            format: 'A4',
            margin: {
                top: '0.75in',
                right: '0.75in',
                bottom: '0.75in',
                left: '0.75in'
            },
            printBackground: true
        });
        
        await browser.close();
        return pdf;
    }
}

// Express.js API endpoint
app.post('/api/generate-pdf', async (req, res) => {
    try {
        const reportData = req.body;
        const generator = new ServerPDFGenerator();
        const pdf = await generator.generatePDF(reportData);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=ai-risk-report.pdf');
        res.send(pdf);
    } catch (error) {
        res.status(500).json({ error: 'PDF generation failed' });
    }
});

// ====================================
// USAGE EXAMPLES
// ====================================

// Example data structure
const sampleReportData = {
    title: 'AI RISK FRAMEWORK',
    toolName: 'Claude Free',
    category: 'Code Assistant',
    useCase: 'Legal/Compliance/Audit',
    dataClassification: 'Trade Secrets/IP',
    riskScore: 86,
    riskLevel: 'CRITICAL RISK',
    categories: [
        {
            name: 'Data Storage & Security',
            score: '21/25',
            level: 'HIGH',
            description: 'Limited visibility into data storage practices.'
        },
        {
            name: 'Training Data Usage',
            score: '17/25',
            level: 'CRITICAL',
            description: 'High risk - data may be used for model training.'
        }
        // ... more categories
    ],
    recommendations: [
        {
            title: 'IMMEDIATE ACTION REQUIRED',
            priority: 'CRITICAL',
            description: 'This tool should not be used with trade secrets.'
        }
        // ... more recommendations
    ]
};

// Usage
const exporter = new PDFExporter();
exporter.exportToPDF_Browser(sampleReportData);
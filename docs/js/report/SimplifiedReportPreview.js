/**
 * Simplified Report Preview for Professional Theme Only
 * This replaces the complex theme system with a focused implementation
 */

class SimplifiedReportPreview {
  constructor() {
    this.reportContainer = document.getElementById('report-main');
    this.init();
  }

  async init() {
    console.log('Initializing Simplified Report Preview...');
    
    // Check if we have report data from localStorage (from export.html)
    const reportData = this.getReportData();
    
    if (reportData) {
      await this.renderReport(reportData);
    } else {
      this.showNoDataMessage();
    }
    
    // Setup download button handlers
    this.setupDownloadHandlers();
  }

  getReportData() {
    try {
      const storedData = localStorage.getItem('reportData');
      if (storedData) {
        console.log('Found report data in localStorage');
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error parsing report data from localStorage:', error);
    }
    
    console.log('No valid report data found in localStorage');
    return null;
  }

  async renderReport(reportData) {
    console.log('Rendering report with data:', reportData);
    
    try {
      // Show loading state
      this.reportContainer.innerHTML = `
        <div class="loader"></div>
        <p style="text-align: center; margin-top: 20px;">Generating report...</p>
      `;
      
      // Generate the report HTML
      const reportHtml = this.generateReportHtml(reportData);
      
      // Update the container
      this.reportContainer.innerHTML = reportHtml;
      
      // Initialize Lucide icons if available
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }
      
      console.log('Report rendered successfully');
      
    } catch (error) {
      console.error('Error rendering report:', error);
      this.reportContainer.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h2 style="color: #dc2626;">Error Rendering Report</h2>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  generateReportHtml(reportData) {
    const {
      selectedAssessmentIds = [],
      selectedTemplate = 'executive',
      mode = 'template',
      customSelectedSections = [],
      selectedTheme = 'professional',
      timestamp
    } = reportData;

    // For now, create a basic report structure
    // In a real implementation, you would fetch assessment data and generate content
    return `
      <div class="report-header">
        <div class="report-header-content">
          <h1>AI Tool Risk Assessment Report</h1>
          <p class="report-subtitle">Professional Analysis & Recommendations</p>
          <div class="report-meta">
            <span>Generated: ${new Date(timestamp).toLocaleDateString()}</span>
            <span>Template: ${selectedTemplate}</span>
            <span>Theme: ${selectedTheme}</span>
          </div>
        </div>
      </div>
      
      <div class="report-content">
        <div class="report-section">
          <h2>Executive Summary</h2>
          <div class="section-content">
            <p>This report provides a comprehensive analysis of AI tool risks based on the selected assessments and criteria.</p>
            <div class="summary-stats">
              <div class="stat-card">
                <h3>Assessments Analyzed</h3>
                <div class="stat-value">${selectedAssessmentIds.length}</div>
              </div>
              <div class="stat-card">
                <h3>Report Mode</h3>
                <div class="stat-value">${mode}</div>
              </div>
              <div class="stat-card">
                <h3>Custom Sections</h3>
                <div class="stat-value">${customSelectedSections.length}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="report-section">
          <h2>Assessment Details</h2>
          <div class="section-content">
            ${selectedAssessmentIds.length > 0 
              ? `<p>Selected Assessment IDs: ${selectedAssessmentIds.join(', ')}</p>`
              : '<p>No specific assessments selected.</p>'
            }
            ${customSelectedSections.length > 0 
              ? `<p>Custom Sections: ${customSelectedSections.join(', ')}</p>`
              : ''
            }
          </div>
        </div>
        
        <div class="report-section">
          <h2>Risk Analysis</h2>
          <div class="section-content">
            <p>Detailed risk analysis would be generated here based on the selected assessments and template.</p>
            <div class="risk-matrix">
              <div class="risk-item high">
                <span class="risk-label">High Risk</span>
                <span class="risk-description">Critical issues requiring immediate attention</span>
              </div>
              <div class="risk-item medium">
                <span class="risk-label">Medium Risk</span>
                <span class="risk-description">Important issues requiring monitoring</span>
              </div>
              <div class="risk-item low">
                <span class="risk-label">Low Risk</span>
                <span class="risk-description">Minor issues for future consideration</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="report-section">
          <h2>Recommendations</h2>
          <div class="section-content">
            <ul class="recommendations-list">
              <li>Implement regular risk assessment procedures</li>
              <li>Establish monitoring protocols for AI tool usage</li>
              <li>Develop incident response procedures</li>
              <li>Provide training for staff on AI tool risks</li>
            </ul>
          </div>
        </div>
      </div>
      
      <style>
        .report-header {
          background: linear-gradient(135deg, var(--theme-primary-start, #1e40af) 0%, var(--theme-primary-end, #3b82f6) 100%);
          color: var(--theme-header-text, #ffffff);
          padding: 40px;
          text-align: center;
        }
        
        .report-header-content h1 {
          margin: 0 0 10px 0;
          font-size: 2.5rem;
          font-weight: 700;
        }
        
        .report-subtitle {
          font-size: 1.2rem;
          margin: 0 0 20px 0;
          opacity: 0.9;
        }
        
        .report-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .report-content {
          padding: 40px;
        }
        
        .report-section {
          margin-bottom: 40px;
          border-bottom: 1px solid var(--theme-border, #e2e8f0);
          padding-bottom: 30px;
        }
        
        .report-section:last-child {
          border-bottom: none;
        }
        
        .report-section h2 {
          color: var(--theme-accent, #3b82f6);
          font-size: 1.8rem;
          margin-bottom: 20px;
          border-left: 4px solid var(--theme-accent, #3b82f6);
          padding-left: 15px;
        }
        
        .section-content {
          line-height: 1.6;
        }
        
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .stat-card {
          background: var(--theme-card-header, #f8fafc);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid var(--theme-border, #e2e8f0);
        }
        
        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          color: var(--theme-text-secondary, #475569);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--theme-accent, #3b82f6);
        }
        
        .risk-matrix {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 20px;
        }
        
        .risk-item {
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid;
        }
        
        .risk-item.high {
          background: #fef2f2;
          border-left-color: #dc2626;
        }
        
        .risk-item.medium {
          background: #fffbeb;
          border-left-color: #d97706;
        }
        
        .risk-item.low {
          background: #f0fdf4;
          border-left-color: #16a34a;
        }
        
        .risk-label {
          font-weight: 600;
          min-width: 100px;
          margin-right: 15px;
        }
        
        .risk-item.high .risk-label {
          color: #dc2626;
        }
        
        .risk-item.medium .risk-label {
          color: #d97706;
        }
        
        .risk-item.low .risk-label {
          color: #16a34a;
        }
        
        .recommendations-list {
          list-style: none;
          padding: 0;
        }
        
        .recommendations-list li {
          padding: 10px 0;
          border-bottom: 1px solid var(--theme-border-light, #f1f5f9);
          position: relative;
          padding-left: 25px;
        }
        
        .recommendations-list li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--theme-accent, #3b82f6);
          font-weight: bold;
        }
        
        .recommendations-list li:last-child {
          border-bottom: none;
        }
        
        @media (max-width: 768px) {
          .report-header {
            padding: 20px;
          }
          
          .report-header-content h1 {
            font-size: 2rem;
          }
          
          .report-meta {
            flex-direction: column;
            gap: 10px;
          }
          
          .report-content {
            padding: 20px;
          }
          
          .summary-stats {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }

  showNoDataMessage() {
    this.reportContainer.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2>No Report Data Found</h2>
        <p>Please go back to the <a href="export.html">Export page</a> and select your options before previewing the report.</p>
      </div>
    `;
  }

  setupDownloadHandlers() {
    const downloadPdfBtn = document.getElementById('download-pdf');
    const downloadHtmlBtn = document.getElementById('download-html');
    
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => {
        // For now, just show an alert. In a real implementation, you'd use html2canvas + jsPDF
        alert('PDF download functionality would be implemented here using html2canvas and jsPDF libraries.');
      });
    }
    
    if (downloadHtmlBtn) {
      downloadHtmlBtn.addEventListener('click', () => {
        this.downloadAsHtml();
      });
    }
  }

  downloadAsHtml() {
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Risk Assessment Report</title>
        <link rel="stylesheet" href="./css/themes/theme-professional.css">
      </head>
      <body>
        ${this.reportContainer.innerHTML}
      </body>
      </html>
    `;
    
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-risk-assessment-report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SimplifiedReportPreview();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SimplifiedReportPreview();
  });
} else {
  new SimplifiedReportPreview();
}
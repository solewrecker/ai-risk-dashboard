import { supabase } from '../../supabase-client.js';
import Handlebars from 'handlebars';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { createIcons, icons } from 'lucide';
import { 
    baseTemplate, 
    summarySectionTemplate, 
    detailedBreakdownSectionTemplate, 
    recommendationsSectionTemplate,
    complianceSectionTemplate,
    premiumFeaturesTemplate,
    comparisonTableSectionTemplate,
    footerTemplate,
    reportConfigs,
    themeConfigs
} from './templates.js';
// Old template imports removed - now using unified template system

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('contains', function(str, substring, options) {
    if (str && str.includes && str.includes(substring)) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('eq', function(a, b, options) {
    if (a === b) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('gt', function(a, b, options) {
    if (a > b) {
        return options.fn(this);
    }
    return options.inverse(this);
});

console.log('report-preview.js loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired.');
    const reportDataString = localStorage.getItem('reportData');
    console.log('Report data string from sessionStorage:', reportDataString);
    if (!reportDataString) {
        document.getElementById('report-main').innerHTML = '<p>No report data found. Please generate a report first.</p>';
        return;
    }

    try {
        const reportData = JSON.parse(reportDataString);
        console.log('Parsed report data:', reportData);
        renderReport(reportData);
    } catch (error) {
        console.error('Failed to parse report data:', error);
        document.getElementById('report-main').innerHTML = '<p>Error: Could not parse report data. Please try again.</p>';
    }
});

async function renderReport({ primaryAssessment, selectedData, sectionsToGenerate, selectedTemplate, selectedTheme }) {
    console.log('renderReport function called with:', { primaryAssessment, selectedData, sectionsToGenerate, selectedTemplate, selectedTheme });
    const reportContentEl = document.getElementById('report-main');
    reportContentEl.innerHTML = '<div class="loader"></div> <p>Loading report...</p>';

    try {
        // Load the selected theme CSS dynamically
        loadThemeCSS(selectedTheme || 'theme-professional');
        
        const templateData = prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate);

        // Get report configuration
         const config = reportConfigs[selectedTemplate] || reportConfigs['executive'];
        
        // Render sections based on configuration
        let sectionsHtml = '';
        
        for (const sectionType of sectionsToGenerate) {
            switch (sectionType) {
                case 'summary-section':
                    sectionsHtml += renderSummarySection(templateData);
                    break;
                case 'premium-features-section':
                    sectionsHtml += renderPremiumFeaturesSection(templateData);
                    break;
                case 'detailed-breakdown-section':
                    sectionsHtml += renderDetailedBreakdownSection(templateData);
                    break;
                case 'recommendations-section':
                    sectionsHtml += renderRecommendationsSection(templateData);
                    break;
                case 'compliance-section':
                    sectionsHtml += renderComplianceSection(templateData);
                    break;
                case 'comparison-table-section':
                    sectionsHtml += renderComparisonTableSection(templateData);
                    break;
            }
        }
        
        // Add footer
        const footerHtml = renderFooterSection(templateData);
        
        const template = Handlebars.compile(baseTemplate);
          
         const fullReportHtml = template({ 
             ...templateData, 
             reportTitle: config.title,
             sectionsHtml,
             footerHtml
         });

        console.log('Final HTML to be injected:', fullReportHtml);
        reportContentEl.innerHTML = fullReportHtml;
        createIcons({ icons });
        


        // Render functions for sections
        function renderSummarySection(data) {
            const template = Handlebars.compile(summarySectionTemplate);
            return template(data);
        }

        function renderDetailedBreakdownSection(data) {
            const template = Handlebars.compile(detailedBreakdownSectionTemplate);
            return template(data);
        }

        function renderRecommendationsSection(data) {
            const template = Handlebars.compile(recommendationsSectionTemplate);
            return template(data);
        }

        function renderComparisonTableSection(data) {
            const template = Handlebars.compile(comparisonTableSectionTemplate);
            return template(data);
        }

        function renderComplianceSection(data) {
            const template = Handlebars.compile(complianceSectionTemplate);
            return template(data);
        }

        function renderPremiumFeaturesSection(data) {
            const template = Handlebars.compile(premiumFeaturesTemplate);
            return template(data);
        }

        function renderFooterSection(data) {
            const template = Handlebars.compile(footerTemplate);
            return template(data);
        }

        // Add event listeners for download buttons
        document.getElementById('download-pdf').addEventListener('click', () => createPdf(reportContentEl));
        document.getElementById('download-html').addEventListener('click', () => createHtml(reportContentEl, templateData, selectedTheme));

    } catch (error) {
        console.error('Error rendering report:', error);
        reportContentEl.innerHTML = `<p class="text-red-500">Error rendering report: ${error.message}</p>`;
    }
}

function prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate) {
    // Extract data from assessment_data if it exists (Supabase structure)
    const assessmentData = primaryAssessment.assessment_data || primaryAssessment;
    const detailedAssessment = assessmentData.detailed_assessment || assessmentData.detailedAssessment || {};
    
    const summaryText = assessmentData.summary_and_recommendation || detailedAssessment.summary_and_recommendation || 'No description provided.';
    const recommendations = assessmentData.recommendations || [];
    const complianceCertifications = assessmentData.compliance_certifications || {};
    const sources = assessmentData.sources || [];
    const azurePermissions = assessmentData.azure_permissions || {};
    
    // Process compliance certifications for template
    const complianceCertificationsList = Object.entries(complianceCertifications).map(([key, cert]) => ({
        name: key.replace(/_/g, ' ').toUpperCase(),
        status: cert.status || 'Unknown',
        description: cert.details || 'No details available',
        icon: getComplianceIcon(cert.status),
        evidence: cert.evidence || 'Not specified',
        limitations: cert.limitations || 'None specified',
        lastVerified: cert.last_verified || 'Not verified'
    }));
    
    // Process recommendations with proper priority mapping
    const recommendationsList = recommendations.map(rec => ({
        title: rec.title || 'Untitled Recommendation',
        description: rec.description || 'No description provided',
        priority: rec.priority || 'medium',
        category: rec.category || 'general'
    }));
    
    // Process detailed assessment details
    const detailedAssessmentDetails = detailedAssessment.assessment_details ? 
        Object.entries(detailedAssessment.assessment_details).map(([key, value]) => ({
            key: key,
            displayName: key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            category_score: value.category_score || value.score || '0',
            risk_level: (value.final_risk_category || value.risk_level || assessmentData.risk_level || 'medium').toLowerCase().replace(/\s+/g, '-'),
            description: value.summary_and_recommendation || value.summary || value.description || 'No description provided.',
            criteria: value.criteria ? Object.entries(value.criteria).map(([critKey, critValue]) => ({
                key: critKey.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                score: critValue.score || '0',
                justification: critValue.justification || 'No justification provided.'
            })) : []
        })) : [];
    
    // Generate findings from summary text
    const findings = summaryText.split(/[.!?]+/)
        .filter(f => f.trim().length > 10)
        .slice(0, 5) // Limit to 5 key findings
        .map((f, i) => ({ text: f.trim(), index: i + 1 }));
    
    return {
        // Report metadata
        reportTitle: `AI Tool Security Assessment`,
        reportDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        assessmentIdShort: primaryAssessment.id ? primaryAssessment.id.substring(0, 8) : 'N/A',
        assessedBy: assessmentData.assessed_by || 'AI Security Council',
        
        // Tool information
        toolName: assessmentData.name || 'N/A',
        toolSubtitle: assessmentData.vendor || 'N/A',
        primaryUseCase: assessmentData.primary_use_case || 'Not specified',
        dataClassification: assessmentData.data_classification || 'Not specified',
        category: assessmentData.category || 'Not specified',
        licenseType: assessmentData.license_type || 'Not specified',
        
        // Scoring and risk
        overallScore: assessmentData.total_score || '0',
        maxScore: '100',
        riskLevel: assessmentData.risk_level || 'N/A',
        riskLevelLower: (assessmentData.risk_level || 'N/A').toLowerCase().replace(/\s+/g, '-'),
        riskDescription: summaryText,
        confidence: Math.round((assessmentData.confidence || 0.8) * 100),
        
        // Individual category scores
        dataStorageScore: assessmentData.data_storage_score || '0',
        trainingUsageScore: assessmentData.training_usage_score || '0',
        accessControlsScore: assessmentData.access_controls_score || '0',
        complianceScore: assessmentData.compliance_score || '0',
        vendorTransparencyScore: assessmentData.vendor_transparency_score || '0',
        
        // Analysis content
        keyStrengths: recommendations.filter(rec => rec?.category === 'strength').map(rec => rec?.description).filter(Boolean).join(' ') || 'No key strengths identified.',
        areasForImprovement: recommendations.filter(rec => rec?.category && rec.category !== 'strength').map(rec => rec?.description).filter(Boolean).join(' ') || 'No areas for improvement identified.',
        findings: findings,
        
        // Detailed sections
        detailedAssessmentDetails: detailedAssessmentDetails,
        recommendationsList: recommendationsList,
        complianceCertifications: complianceCertificationsList,
        
        // Comparison data
        comparisonData: selectedData.length > 1 ? selectedData.map(assessment => {
            const data = assessment.assessment_data || assessment;
            return {
                name: data.name || 'Unnamed Assessment',
                total_score: data.total_score || '0',
                risk_level: (data.risk_level || 'N/A').toLowerCase().replace(/\s+/g, '-')
            };
        }) : [],
        
        // Footer information
        documentationTier: assessmentData.documentation_tier || 'Tier 1: Public Only',
        assessmentNotes: assessmentData.assessment_notes || 'Assessment based on publicly available information.',
        sources: sources,
        azurePermissions: azurePermissions,
        
        // Raw data for advanced processing
        primaryAssessment: primaryAssessment,
        allSelectedData: selectedData,
        sectionsToGenerate: sectionsToGenerate
    };
}

// Helper function to get compliance status icons
function getComplianceIcon(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('compliant') || statusLower === 'yes' || statusLower.includes('type ii')) {
        return '✅';
    } else if (statusLower.includes('conditional') || statusLower.includes('partial')) {
        return '⚠️';
    } else if (statusLower === 'no' || statusLower.includes('not applicable')) {
        return '❌';
    }
    return '❓';
}

async function createPdf(reportContentEl) {
    const canvas = await html2canvas(reportContentEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: true,
        useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('ai-risk-assessment-report.pdf');
}

async function createHtml(reportContentEl, templateData, selectedTheme) {
    const themeName = selectedTheme || 'theme-professional';
    const cssPromises = [
        fetch('/css/style.css').then(res => res.text()),
        fetch(`/css/themes/${themeName}.css`).then(res => res.text()),
        fetch('/css/pages/report.css').then(res => res.text()),
        fetch('/css/themes/theme-base.css').then(res => res.text())
    ];

    const cssContents = await Promise.all(cssPromises.map(p => p.catch(e => console.error(e) || '')));

    const reportHtml = reportContentEl.innerHTML;
    const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${templateData.toolName} Report</title>
            <style>
                ${cssContents.join('\n')}
            </style>
        </head>
        <body>
            <div id="report-container" class="report-container">
                 ${reportHtml}
            </div>
        </body>
        </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateData.toolName}-risk-assessment-report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to dynamically load theme CSS by enabling/disabling stylesheet links
function loadThemeCSS(themeName) {
    // Disable all theme stylesheets
    const allThemeLinks = document.querySelectorAll('link[data-theme]');
    allThemeLinks.forEach(link => {
        link.disabled = true;
    });
    
    // Enable the selected theme stylesheet
    const selectedThemeLink = document.querySelector(`link[data-theme="${themeName}"]`);
    if (selectedThemeLink) {
        selectedThemeLink.disabled = false;
        console.log(`Theme CSS enabled: ${themeName}`);
    } else {
        console.warn(`Theme stylesheet not found: ${themeName}, falling back to CSS custom properties`);
        // Fallback: Apply theme using CSS custom properties
        updateThemeCSS(themeName);
    }
    
    return Promise.resolve();
}

// Function to dynamically update theme CSS using CSS custom properties
function updateThemeCSS(themeName) {
    // Define theme configurations that match the CSS files
    const themeConfigs = {
        'theme-professional': {
            '--theme-primary-start': '#1e40af',
            '--theme-primary-end': '#3b82f6',
            '--theme-accent': '#3b82f6',
            '--theme-accent-light': '#dbeafe'
        },
        'theme-executive': {
            '--theme-primary-start': '#1e3a8a',
            '--theme-primary-end': '#1e40af',
            '--theme-accent': '#d97706',
            '--theme-accent-light': '#fef3c7'
        },
        'theme-modern': {
            '--theme-primary-start': '#059669',
            '--theme-primary-end': '#10b981',
            '--theme-accent': '#10b981',
            '--theme-accent-light': '#d1fae5'
        },
        'theme-dark': {
            '--theme-primary-start': '#374151',
            '--theme-primary-end': '#4b5563',
            '--theme-accent': '#8b5cf6',
            '--theme-accent-light': '#e0e7ff'
        }
    };

    const config = themeConfigs[themeName] || themeConfigs['theme-professional'];
    const root = document.documentElement;
    
    // Apply theme variables to the document root
    Object.entries(config).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
}
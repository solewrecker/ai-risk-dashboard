import { createClient } from '@supabase/supabase-js';
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
    reportConfigs,
    themeConfigs
} from './templates.js';
// Old template imports removed - now using unified template system

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

document.addEventListener('DOMContentLoaded', () => {
    const reportDataString = sessionStorage.getItem('reportData');
    if (!reportDataString) {
        document.getElementById('report-container').innerHTML = '<p>No report data found. Please generate a report first.</p>';
        return;
    }

    const reportData = JSON.parse(reportDataString);
    renderReport(reportData);
});

async function renderReport({ primaryAssessment, selectedData, sectionsToGenerate, selectedTemplate, selectedTheme }) {
    const reportContentEl = document.getElementById('report-container');
    reportContentEl.innerHTML = '<div class="loader"></div> <p>Loading report...</p>';

    try {
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
        
        // Use the unified base template with theme support
         const template = Handlebars.compile(baseTemplate);
         
         const fullReportHtml = template({ 
             ...templateData, 
             reportTitle: config.title,
             selectedTheme: selectedTheme || 'theme-professional',
             sectionsHtml 
         });

        reportContentEl.innerHTML = fullReportHtml;
        createIcons({ icons });
        
        // Update theme CSS dynamically
        updateThemeCSS(selectedTheme || 'theme-professional');

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

        // Add event listeners for download buttons
        document.getElementById('download-pdf').addEventListener('click', () => createPdf(reportContentEl));
        document.getElementById('download-html').addEventListener('click', () => createHtml(reportContentEl, templateData, selectedTheme));

    } catch (error) {
        console.error('Error rendering report:', error);
        reportContentEl.innerHTML = `<p class="text-red-500">Error rendering report: ${error.message}</p>`;
    }
}

function prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate) {
    const summaryText = primaryAssessment.summary_and_recommendation || primaryAssessment.detailedAssessment?.summary_and_recommendation || 'No description provided.';
    const recommendations = primaryAssessment.recommendations || [];
    const complianceCertifications = primaryAssessment.compliance_certifications ? Object.entries(primaryAssessment.compliance_certifications).map(([key, value]) => ({ name: key, ...value })) : [];

    return {
        primaryAssessment: primaryAssessment,
        allSelectedData: selectedData,
        sectionsToGenerate: sectionsToGenerate,
        reportDate: new Date().toLocaleDateString(),
        assessmentIdShort: primaryAssessment.id ? primaryAssessment.id.substring(0, 8) : 'N/A',
        toolName: primaryAssessment.name || 'N/A',
        toolSubtitle: primaryAssessment.vendor || 'N/A',
        overallScore: primaryAssessment.total_score || '0',
        maxScore: '100',
        riskLevel: primaryAssessment.risk_level || 'N/A',
        riskLevelLower: (primaryAssessment.risk_level || 'N/A').toLowerCase().replace(' ', '-'),
        riskDescription: summaryText,
        primaryUseCase: primaryAssessment.primary_use_case || 'N/A',
        dataClassification: primaryAssessment.data_classification || 'N/A',
        assessedBy: primaryAssessment.assessed_by || 'N/A',
        confidence: primaryAssessment.confidence || 'N/A',
        documentationTier: primaryAssessment.documentation_tier || 'N/A',
        assessmentNotes: primaryAssessment.assessment_notes || 'N/A',
        azurePermissions: primaryAssessment.azure_permissions || { required_permissions: [], recommended_restrictions: [] },
        sources: primaryAssessment.sources || [],
        complianceCertifications: complianceCertifications,
        keyStrengths: recommendations.filter(rec => rec?.category === 'strength').map(rec => rec?.description).filter(Boolean).join(' ') || 'No key strengths identified.',
        areasForImprovement: recommendations.filter(rec => rec?.category && rec.category !== 'strength').map(rec => rec?.description).filter(Boolean).join(' ') || 'No areas for improvement identified.',
        findings: summaryText.split(/[.!?]+/).filter(f => f.trim().length > 10).map((f, i) => ({ text: f.trim(), index: i + 1 })),
        detailedAssessmentDetails: primaryAssessment.detailedAssessment?.assessment_details ? Object.entries(primaryAssessment.detailedAssessment.assessment_details).map(([key, value]) => ({
            key: key,
            displayName: key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            category_score: value.category_score || value.score || '0',
            risk_level: (value.final_risk_category || value.risk_level || primaryAssessment.risk_level || 'medium').toLowerCase().replace(/\s+/g, '-'),
            description: value.summary_and_recommendation || value.summary || value.description || 'No description provided.',
            criteria: value.criteria ? Object.entries(value.criteria).map(([critKey, critValue]) => ({
                key: critKey,
                score: critValue.score || '0',
                justification: critValue.justification || 'No justification provided.'
            })) : []
        })) : [],
        recommendationsList: recommendations,
        comparisonData: selectedData.length > 1 ? selectedData.map(assessment => ({
            name: assessment.name || 'Unnamed Assessment',
            total_score: assessment.total_score || '0',
            risk_level: (assessment.risk_level || 'N/A').toLowerCase().replace(/\s+/g, '-')
        })) : []
    };
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
    const cssPromises = [
        fetch('./css/style.css').then(res => res.text()),
        fetch('./css/pages/report.css').then(res => res.text()),
        fetch('./css/themes/theme-base.css').then(res => res.text())
    ];

    // Add the selected theme CSS
    const themeFile = selectedTheme || 'theme-professional';
    cssPromises.push(fetch(`./css/themes/${themeFile}.css`).then(res => res.text()));

    const cssContents = await Promise.all(cssPromises);

    const html = reportContentEl.innerHTML;
    const blob = new Blob([`
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
            ${html}
        </body>
        </html>
    `], { type: 'text/html' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-risk-assessment-report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
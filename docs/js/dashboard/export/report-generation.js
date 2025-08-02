// docs/js/dashboard/export/report-generation.js

// Import libraries from CDN (already loaded in HTML)
const Handlebars = window.Handlebars;
const jsPDF = window.jspdf.jsPDF;
const html2canvas = window.html2canvas;
const QRCode = window.QRCode;
const { createIcons, icons } = window.lucide;

// Use the global Supabase client initialized in export.html
const supabase = window.supabaseClient;
// Access templates from global window object
// Templates are now defined in templates.js as window properties
const baseTemplate = window.baseTemplate;

// Import ReportDataAdapter for proper data transformation
import ReportDataAdapter from '../../report/data/ReportDataAdapter.js';


// Data preparation for Handlebars templates
function prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate) {
    // Use ReportDataAdapter to properly transform and enhance the data
    const adapter = new ReportDataAdapter();
    const transformedData = adapter.transformData(primaryAssessment);
    
    // Add additional template-specific data
    const templateData = {
        ...transformedData,
        currentYear: new Date().getFullYear(),
        sectionsHtml: '<!-- Sections would be rendered here if configured -->',
        selectedData: selectedData, // Include all selected assessments for comparison
        sectionsToGenerate: sectionsToGenerate // Include sections configuration
    };

    console.log('Template data prepared by ReportDataAdapter:', templateData);
    return templateData;
}


async function prepareReportData(selectedAssessmentIds, allAssessments, quickTemplates, selectedTemplate, currentMode, customSelectedSections, selectedTheme) {
    if (selectedAssessmentIds.size === 0 || (currentMode === 'template' && !selectedTemplate) || (currentMode === 'custom' && customSelectedSections.size === 0)) {
        alert('Please select at least one assessment and either a quick template or custom sections.');
        return;
    }

    const previewReportBtn = document.getElementById('previewReportBtn');
    previewReportBtn.disabled = true;
    previewReportBtn.innerHTML = '<i class="loader"></i> Generating...';

    try {
        const selectedData = allAssessments.filter(a => selectedAssessmentIds.has(a.id));
        const primaryAssessment = selectedData[0];


        let sectionsToGenerate = [];
        if (currentMode === 'template' && selectedTemplate) {
            sectionsToGenerate = quickTemplates[selectedTemplate].sections;
        } else if (currentMode === 'custom') {
            sectionsToGenerate = Array.from(customSelectedSections);
        }

        // Get theme data from ThemeConnector if available
        let themeData = { themeId: selectedTheme };
        if (window.themeConnector) {
            themeData = window.themeConnector.getThemeDataForReport();
        }
        
        // Store data in localStorage to pass to the preview page
        const reportData = {
            primaryAssessment,
            selectedData,
            sectionsToGenerate,
            selectedTemplate,
            selectedTheme: themeData.themeId,
            themeData // Additional theme data for the new theme system
        };
        localStorage.setItem('reportData', JSON.stringify(reportData));

        // Open the preview page in a new tab
        // Use the correct path to report-preview.html (not in dist folder)
        window.open('dist/report-preview.html', '_blank');

    } catch (error) {
        console.error('Error preparing report data:', error);
        alert('Failed to prepare report data. Please check the console for details.');
    } finally {
        previewReportBtn.disabled = false;
        previewReportBtn.innerHTML = '<i data-lucide="eye" class="w-5 h-5 mr-2"></i><span>Preview Report</span>';
        createIcons({ icons: icons });
    }
}

// Export functions for use in other modules
export { prepareTemplateData, prepareReportData };
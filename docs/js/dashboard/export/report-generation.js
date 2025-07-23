// docs/js/dashboard/export/report-generation.js

import { supabase } from '../../supabase-client.js';
import Handlebars from 'handlebars';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode'; // Using the 'qrcode' package
import { createIcons, icons } from 'lucide';
import { baseTemplate } from './templates.js';


// Data preparation for Handlebars templates
export function prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate) {
    // Flatten the data structure for the template by merging the nested assessment_data
    // object with the top-level assessment object. This provides a clean, flat data structure
    // for the Handlebars template, making it easier and less error-prone.
    const templateData = {
        ...(primaryAssessment.assessment_data || {}), // Spread nested data first
        ...primaryAssessment, // Then spread root, overwriting any duplicates (like 'name')
        currentYear: new Date().getFullYear(),
        sectionsHtml: '<!-- Sections would be rendered here if configured -->',
    };

    // Delete the nested object to avoid confusion in the template
    delete templateData.assessment_data;

    return templateData;
}


export async function prepareReportData(selectedAssessmentIds, allAssessments, quickTemplates, selectedTemplate, currentMode, customSelectedSections, selectedTheme) {
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
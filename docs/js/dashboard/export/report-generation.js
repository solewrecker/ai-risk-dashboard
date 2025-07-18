// docs/js/dashboard/export/report-generation.js

import { supabase } from '../../supabase-client.js';
import Handlebars from 'handlebars';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode'; // Using the 'qrcode' package
import { createIcons, icons } from 'lucide';
import { baseTemplate, summarySectionTemplate, detailedBreakdownSectionTemplate, recommendationsSectionTemplate, comparisonTableSectionTemplate, complianceSectionTemplate, premiumFeaturesTemplate, reportConfigs } from './templates.js';

// Removed: waitUntilHandlebarsIsReady, no longer needed with Parcel bundling

export async function fetchTemplate(templateName) {
    // Instead of fetching, directly return the template string from the imported templates
    let templateString;
    switch (templateName) {
        case 'base':
            templateString = baseTemplate;
            break;
        case 'summary-section':
            templateString = summarySectionTemplate;
            break;
        case 'detailed-breakdown-section':
            templateString = detailedBreakdownSectionTemplate;
            break;
        case 'recommendations-section':
            templateString = recommendationsSectionTemplate;
            break;
        case 'comparison-table-section':
            templateString = comparisonTableSectionTemplate;
            break;
        case 'compliance-section':
            templateString = complianceSectionTemplate;
            break;
        case 'premium-features-section':
            templateString = premiumFeaturesTemplate;
            break;
        default:
            throw new Error(`Unknown template: ${templateName}`);
    }

    console.log(`fetchTemplate(): Using embedded template string for ${templateName}:`, templateString.substring(0, 200) + '...'); // Log first 200 chars
    return Handlebars.compile(templateString);
}

// Data preparation for Handlebars templates
function prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate) {
    const summaryText = primaryAssessment.summary_and_recommendation || primaryAssessment.detailedAssessment?.summary_and_recommendation || 'No description provided.';
    const recommendations = primaryAssessment.recommendations || [];

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

        // Store data in sessionStorage to pass to the preview page
        const reportData = {
            primaryAssessment,
            selectedData,
            sectionsToGenerate,
            selectedTemplate,
            selectedTheme
        };
        localStorage.setItem('reportData', JSON.stringify(reportData));

        // Open the preview page in a new tab
        window.open('report-preview.html', '_blank');

    } catch (error) {
        console.error('Error preparing report data:', error);
        alert('Failed to prepare report data. Please check the console for details.');
    } finally {
        previewReportBtn.disabled = false;
        previewReportBtn.innerHTML = '<i data-lucide="eye" class="w-5 h-5 mr-2"></i><span>Preview Report</span>';
        createIcons({ icons: icons });
    }
}
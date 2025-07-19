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
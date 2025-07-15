// docs/js/dashboard/export/report-generation.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
// import Handlebars from 'https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js'; // No longer needed

// Supabase Client (might be imported from a shared API module later)
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


export async function fetchTemplate(templateName) {
    // Get the base path - will be '/ai-risk-dashboard' on GitHub Pages, '' locally
    const basePath = window.location.pathname.includes('/ai-risk-dashboard') ? '/ai-risk-dashboard' : '';
    
    const response = await fetch(`${basePath}/templates/template-${templateName}.html`);
    if (!response.ok) {
        throw new Error(`Failed to fetch template: ${templateName}`);
    }
    const templateString = await response.text();
    return window.Handlebars.compile(templateString);
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


export async function generateReport(selectedAssessmentIds, allAssessments, quickTemplates, selectedTemplate, currentMode, customSelectedSections) {
    if (selectedAssessmentIds.size === 0 || (currentMode === 'template' && !selectedTemplate) || (currentMode === 'custom' && customSelectedSections.size === 0)) {
        alert('Please select at least one assessment and either a quick template or custom sections.');
        return;
    }

    const generateReportBtn = document.getElementById('generateReportBtn');
    generateReportBtn.disabled = true;
    generateReportBtn.innerHTML = '<i class="loader"></i> Generating...';

    try {
        const selectedData = allAssessments.filter(a => selectedAssessmentIds.has(a.id));
        const primaryAssessment = selectedData[0];

        let sectionsToGenerate = [];
        if (currentMode === 'template' && selectedTemplate) {
            sectionsToGenerate = quickTemplates[selectedTemplate].sections;
        } else if (currentMode === 'custom') {
            sectionsToGenerate = Array.from(customSelectedSections);
        }

        const baseTemplate = await fetchTemplate('base');
        const compiledSectionTemplates = {};
        for (const section of sectionsToGenerate) {
            compiledSectionTemplates[section] = await fetchTemplate(section);
        }

        const templateData = prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate);

        let sectionsHtml = '';
        for (const section of sectionsToGenerate) {
            const sectionTemplate = compiledSectionTemplates[section];
            sectionsHtml += sectionTemplate(templateData);
        }

        let fullReportHtml = baseTemplate({
            ...templateData,
            sectionsHtml: sectionsHtml
        });
        
        const shareUrl = `${window.location.origin}/assessment-detail.html?id=${primaryAssessment.id}`;

        const qrContainer = document.createElement('div');
        qrContainer.style.textAlign = 'center';
        qrContainer.style.marginTop = '20px';
        qrContainer.innerHTML = `<p>Scan to view assessment: </p><div id="qrcode"></div>`;

        let finalHtmlWithQr = fullReportHtml.replace('</body>', `${qrContainer.outerHTML}</body>`);

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '1000px';
        container.innerHTML = finalHtmlWithQr;
        document.body.appendChild(container);

        new window.QRCode(container.querySelector('#qrcode'), {
            text: shareUrl,
            width: 128,
            height: 128
        });
        document.body.removeChild(container);

        await createPdf(finalHtmlWithQr);

    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report. Please check the console for details.');
    } finally {
        generateReportBtn.disabled = false;
        generateReportBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5 mr-2"></i><span>Generate Report</span>';
        lucide.createIcons();
    }
}

export async function generateHtmlReport(selectedAssessmentIds, allAssessments, quickTemplates, selectedTemplate, currentMode, customSelectedSections) {
    if (selectedAssessmentIds.size === 0 || (currentMode === 'template' && !selectedTemplate) || (currentMode === 'custom' && customSelectedSections.size === 0)) {
        alert('Please select at least one assessment and either a quick template or custom sections.');
        return;
    }

    const generateHtmlBtn = document.getElementById('generateHtmlBtn');
    generateHtmlBtn.disabled = true;
    generateHtmlBtn.innerHTML = `<i class="loader"></i> Generating HTML...`;

    let reportTitleForButton = 'Generate Report';
    if (currentMode === 'template' && selectedTemplate) {
        const templateInfo = quickTemplates[selectedTemplate];
        reportTitleForButton = `📄 Generate ${templateInfo.name} Report`;
    } else if (currentMode === 'custom' && customSelectedSections.size > 0) {
        reportTitleForButton = '📄 Generate Custom Report';
    }

    try {
        const selectedData = allAssessments.filter(a => selectedAssessmentIds.has(a.id));
        const primaryAssessment = selectedData[0];

        let sectionsToGenerate = [];
        if (currentMode === 'template' && selectedTemplate) {
            sectionsToGenerate = quickTemplates[selectedTemplate].sections;
        } else if (currentMode === 'custom') {
            sectionsToGenerate = Array.from(customSelectedSections);
        }

        const baseTemplate = await fetchTemplate('base');
        const compiledSectionTemplates = {};
        for (const section of sectionsToGenerate) {
            compiledSectionTemplates[section] = await fetchTemplate(section);
        }

        const templateData = prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate);

        let sectionsHtmlString = '';
        for (const section of sectionsToGenerate) {
            const sectionTemplate = compiledSectionTemplates[section];
            sectionsHtmlString += sectionTemplate(templateData);
        }

        let fullReportHtmlString = baseTemplate({
            ...templateData,
            sectionsHtml: sectionsHtmlString
        });

        const parser = new DOMParser();
        let doc = parser.parseFromString(fullReportHtmlString, 'text/html');

        const mainContentElement = doc.querySelector('main#report-content');
        if (mainContentElement) {
            mainContentElement.innerHTML = sectionsHtmlString;
        }

        const basePath = window.location.pathname.includes('/ai-risk-dashboard') ? '/ai-risk-dashboard' : '';

        const cssResponse = await fetch(`${basePath}/css/pages/export-page.css`);
        const cssContent = await cssResponse.text();
        const styleElement = doc.createElement('style');
        styleElement.textContent = cssContent;
        doc.head.appendChild(styleElement);

        let externalCssLink1 = doc.querySelector('link[href="../css/pages/export-page.css"]');
        if (externalCssLink1) externalCssLink1.remove();
        let externalCssLink2 = doc.querySelector('link[href="css/style.css"]');
        if (externalCssLink2) externalCssLink2.remove();

        let collapsibleScriptContent = '';
        if (sectionsToGenerate.includes('detailed-breakdown-section')) {
            collapsibleScriptContent = `
            document.addEventListener('DOMContentLoaded', function() {
                const collapsibleHeaders = document.querySelectorAll('.detailed-breakdown__collapsible-header');
                collapsibleHeaders.forEach(header => {
                    header.addEventListener('click', function() {
                        const content = this.nextElementSibling;
                        const button = this.querySelector('.detailed-breakdown__toggle-button');
                        const isExpanded = button.getAttribute('aria-expanded') === 'true';

                        if (isExpanded) {
                            content.style.maxHeight = null;
                            button.setAttribute('aria-expanded', 'false');
                            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucude-chevron-down"><path d="m6 9 6 6 6-6"/></svg>';
                        } else {
                            content.style.maxHeight = content.scrollHeight + "px";
                            button.setAttribute('aria-expanded', 'true');
                            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>';
                        }
                    });
                });
            });
            `;
            const collapsibleScriptElement = doc.createElement('script');
            collapsibleScriptElement.textContent = collapsibleScriptContent;
            doc.body.appendChild(collapsibleScriptElement);
        }

        let externalJsLink1 = doc.querySelector('script[src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"]');
        if (externalJsLink1) externalJsLink1.remove();
        let externalJsLink2 = doc.querySelector('script[src="https://cdn.jsdelivr.net/npm/lucide/dist/umd/lucide.min.js"]');
        if (externalJsLink2) externalJsLink2.remove();
        let externalJsLink3 = doc.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"]');
        if (externalJsLink3) externalJsLink3.remove();
        let externalJsLink4 = doc.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"]');
        if (externalJsLink4) externalJsLink4.remove();
        let externalJsLink5 = doc.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"]');
        if (externalJsLink5) externalJsLink5.remove();
        let externalJsLink6 = doc.querySelector('script[type="module"][src="js/dashboard/export.js"]');
        if (externalJsLink6) externalJsLink6.remove();

        const inlineScripts = doc.querySelectorAll('script:not([src])');
        inlineScripts.forEach(script => {
            if (script.textContent.includes('lucide.createIcons()') && !script.textContent.includes('collapsibleHeaders')) {
                script.remove();
            }
        });

        const titleElement = doc.querySelector('title');
        if (titleElement) {
            titleElement.textContent = `${primaryAssessment.name || 'AI Risk Assessment'} Report`;
        }

        const shareUrl = `${window.location.origin}/assessment-detail.html?id=${primaryAssessment.id}`;

        const qrContainerDiv = doc.createElement('div');
        qrContainerDiv.id = 'qrcode-container';
        qrContainerDiv.style.textAlign = 'center';
        qrContainerDiv.style.marginTop = '20px';
        qrContainerDiv.innerHTML = `<p>Scan to view assessment: </p><div id="qrcode"></div>`;
        doc.body.appendChild(qrContainerDiv);

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        iframe.srcdoc = `<!DOCTYPE html>${doc.documentElement.outerHTML}`;

        await new Promise(resolve => {
            iframe.onload = () => resolve();
        });

        const iframeDoc = iframe.contentWindow.document;

        if (iframe.contentWindow.lucide && typeof iframe.contentWindow.lucide.createIcons === 'function') {
            iframe.contentWindow.lucide.createIcons({
                container: iframeDoc.body
            });
        }

        new iframe.contentWindow.QRCode(iframeDoc.querySelector('#qrcode'), {
            text: shareUrl,
            width: 128,
            height: 128
        });

        const finalHtmlContent = `<!DOCTYPE html>${iframeDoc.documentElement.outerHTML}`;
        document.body.removeChild(iframe);

        const blob = new Blob([finalHtmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-risk-assessment-report-${new Date().toISOString().substring(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
        const fileName = `report-${primaryAssessment.id}-${timestamp}.html`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('exported-html-reports')
            .upload(fileName, blob, {
                contentType: 'text/html',
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from('exported-html-reports')
            .getPublicUrl(fileName);

        if (publicUrlData && publicUrlData.publicUrl) {
            alert(`HTML report generated and uploaded! You can share it via: ${publicUrlData.publicUrl}`);
        } else {
            alert('HTML report generated, but failed to get a shareable link.');
        }

    } catch (error) {
        console.error('Error generating HTML report:', error);
        alert('Failed to generate HTML report. Please check the console for details.');
    } finally {
        generateHtmlBtn.disabled = false;
        generateHtmlBtn.innerHTML = `<i data-lucide="code" class="w-5 h-5 mr-2"></i><span>${reportTitleForButton.replace('Generate', 'Generate HTML')}</span>`;
    }
}

async function createPdf(htmlContent) {
    const { jsPDF } = window.jspdf;
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1000px';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: true
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('ai-risk-assessment-report.pdf');
} 
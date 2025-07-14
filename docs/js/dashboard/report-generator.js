import { supabase } from './supabase-api.js';

// Add validation and fallbacks
const safeGet = (obj, path, fallback = 'N/A') => {
    try {
        return path.split('.').reduce((o, p) => o?.[p], obj) || fallback;
    } catch {
        return fallback;
    }
};

// Define template sections for quick select (copied for now, will be passed as param)
const quickTemplates = {
    summary: {
        name: 'Executive Summary',
        sections: ['summary-section'],
        pages: '3-4 pages'
    },
    detailed: {
        name: 'Detailed Technical Report',
        sections: ['summary-section', 'detailed-breakdown-section', 'recommendations-section', 'compliance-section'],
        pages: '8-12 pages'
    },
    comparison: {
        name: 'Comparison Report',
        sections: ['summary-section', 'comparison-table-section'],
        pages: '5-7 pages'
    }
};

/*
 * Toggles the visibility of detailed breakdown categories.
 * This function is directly included in the generated HTML for export and also used here for preview.
 */
export function toggleCategory(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.breakdown-category__toggle');
    
    const isActive = content.classList.contains('breakdown-category__content--active');
    
    if (isActive) {
        content.classList.remove('breakdown-category__content--active');
        toggle.classList.remove('breakdown-category__toggle--active');
        header.classList.remove('breakdown-category__header--active');
    } else {
        content.classList.add('breakdown-category__content--active');
        toggle.classList.add('breakdown-category__toggle--active');
        header.classList.add('breakdown-category__header--active');
    }
}

export async function generateReport(selectedAssessmentIds, allAssessments, currentMode, selectedTemplate, customSelectedSections) {
    // Adjust validation based on currentMode
    if (selectedAssessmentIds.size === 0 || (currentMode === 'template' && !selectedTemplate) || (currentMode === 'custom' && customSelectedSections.size === 0)) {
        alert('Please select at least one assessment and either a quick template or custom sections.');
        return;
    }

    // Assume these elements are handled by the calling UI module
    // generateReportBtn.disabled = true;
    // generateReportBtn.innerHTML = '<i class="loader"></i> Generating...';

    try {
        const selectedData = allAssessments.filter(a => selectedAssessmentIds.has(a.id));
        const primaryAssessment = selectedData[0]; 

        let sectionsToGenerate = [];
        if (currentMode === 'template' && selectedTemplate) {
            sectionsToGenerate = quickTemplates[selectedTemplate].sections;
        } else if (currentMode === 'custom') {
            sectionsToGenerate = Array.from(customSelectedSections);
        }

        // Start with the base template
        let fullReportHtml = await fetchTemplate('base');
        let sectionsHtml = '';

        for (const section of sectionsToGenerate) {
            sectionsHtml += await fetchTemplate(section); // Fetch each selected section
        }

        // Inject all selected sections into the main content area of the base template
        fullReportHtml = fullReportHtml.replace('<main id="report-content"></main>', `<main id="report-content">${sectionsHtml}</main>`);

        const populatedHtml = bindDataToTemplate(fullReportHtml, primaryAssessment, selectedData, sectionsToGenerate);
        
        // Generate shareable URL (example: link to view the assessment)
        const shareUrl = `${window.location.origin}/assessment-detail.html?id=${primaryAssessment.id}`;

        // Create QR code container
        const qrContainer = document.createElement('div');
        qrContainer.style.textAlign = 'center';
        qrContainer.style.marginTop = '20px';
        qrContainer.innerHTML = `<p>Scan to view assessment: </p><div id="qrcode"></div>`;

        // Append to populated HTML (assume there's a footer or body)
        let finalHtmlWithQr = populatedHtml.replace('</body>', `${qrContainer.outerHTML}</body>`);

        // Now, after rendering to container, generate the QR code
        // But since container is off-screen, we need to generate QR after setting innerHTML
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '1000px'; // Standard width for our reports
        container.innerHTML = finalHtmlWithQr;
        document.body.appendChild(container);

        new QRCode(container.querySelector('#qrcode'), {
            text: shareUrl,
            width: 128,
            height: 128
        });
        document.body.removeChild(container);

        await createPdf(finalHtmlWithQr);
        return { success: true };

    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report. Please check the console for details.');
        return { success: false, error: error };
    } finally {
        // generateReportBtn.disabled = false;
        // generateReportBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5 mr-2"></i><span>Generate Report</span>';
        // lucide.createIcons(); // Assume UI handles this
    }
}

export async function generateHtmlReport(selectedAssessmentIds, allAssessments, currentMode, selectedTemplate, customSelectedSections) {
    // Similar validation as generateReport
    if (selectedAssessmentIds.size === 0 || (currentMode === 'template' && !selectedTemplate) || (currentMode === 'custom' && customSelectedSections.size === 0)) {
        alert('Please select at least one assessment and either a quick template or custom sections.');
        return;
    }

    // Assume UI handles button state
    // generateHtmlBtn.disabled = true;
    // generateHtmlBtn.innerHTML = '<i class="loader"></i> Generating HTML...';

    try {
        const selectedData = allAssessments.filter(a => selectedAssessmentIds.has(a.id));
        const primaryAssessment = selectedData[0];

        let sectionsToGenerate = [];
        if (currentMode === 'template' && selectedTemplate) {
            sectionsToGenerate = quickTemplates[selectedTemplate].sections;
        } else if (currentMode === 'custom') {
            sectionsToGenerate = Array.from(customSelectedSections);
        }

        let fullReportHtmlString = await fetchTemplate('base'); // This fetches the string including <!DOCTYPE html><html><head><body>...
        let sectionsHtmlString = '';
        for (const section of sectionsToGenerate) {
            sectionsHtmlString += await fetchTemplate(section);
        }

        // Use a temporary DOM element to parse the fullReportHtml and safely manipulate it.
        // This preserves the DOCTYPE and allows proper DOM operations.
        const parser = new DOMParser();
        let doc = parser.parseFromString(fullReportHtmlString, 'text/html');

        const mainContentElement = doc.querySelector('main#report-content');
        if (mainContentElement) {
            mainContentElement.innerHTML = sectionsHtmlString;
        }

        // Get the updated HTML string (which still contains doctype, head, body etc.)
        let processedHtmlString = doc.documentElement.outerHTML; // Get outerHTML of <html>

        // Apply data binding to the string
        processedHtmlString = bindDataToTemplate(processedHtmlString, primaryAssessment, selectedData, sectionsToGenerate);

        // Re-parse the string to update the DOM object after string replacements from bindDataToTemplate
        doc = parser.parseFromString(processedHtmlString, 'text/html');

        // --- Inline CSS and JS for self-contained HTML ---
        const basePath = window.location.pathname.includes('/ai-risk-dashboard') ? '/ai-risk-dashboard' : '';

        // Fetch CSS
        const cssResponse = await fetch(`${basePath}/css/pages/export-page-default-theme.css`);
        const cssContent = await cssResponse.text();
        const styleElement = doc.createElement('style');
        styleElement.textContent = cssContent;
        doc.head.appendChild(styleElement);

        // Remove external CSS links from the head (using querySelector for robustness)
        let externalCssLink1 = doc.querySelector('link[href="../css/pages/export-page.css"]');
        if (externalCssLink1) externalCssLink1.remove();
        let externalCssLink2 = doc.querySelector('link[href="css/style.css"]');
        if (externalCssLink2) externalCssLink2.remove();

        // Fetch Lucide Icons JS
        const lucideResponse = await fetch('https://cdn.jsdelivr.net/npm/lucide/dist/umd/lucide.min.js');
        const lucideContent = await lucideResponse.text();
        const lucideScript = doc.createElement('script');
        lucideScript.textContent = lucideContent;
        doc.body.appendChild(lucideScript); // Append to body for execution after DOM parsing

        // Fetch QRCode.js
        const qrcodeResponse = await fetch('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js');
        const qrcodeContent = await qrcodeResponse.text();
        const qrcodeScript = doc.createElement('script');
        qrcodeScript.textContent = qrcodeContent;
        doc.body.appendChild(qrcodeScript); // Append to body

        // Extract and inject collapsible script content (hardcoded)
        let collapsibleScriptContent = '';
        if (sectionsToGenerate.includes('detailed-breakdown-section')) {
            collapsibleScriptContent = `
            document.addEventListener('DOMContentLoaded', function() {
                const collapsibleHeaders = document.querySelectorAll('.breakdown-category__header');
                collapsibleHeaders.forEach(header => {
                    header.addEventListener('click', function() {
                        toggleCategory(this); // Use the exported toggleCategory function
                    });
                });
            });
            `;
            const collapsibleScriptElement = doc.createElement('script');
            collapsibleScriptElement.textContent = collapsibleScriptContent;
            doc.body.appendChild(collapsibleScriptElement);
        }

        // Remove external JS links from the head (those in original export.html)
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

        // Find and remove the inline Lucide initialization script by checking its content
        const inlineScripts = doc.querySelectorAll('script:not([src])');
        inlineScripts.forEach(script => {
            if (script.textContent.includes('lucide.createIcons()') && !script.textContent.includes('collapsibleHeaders')) {
                script.remove();
            }
        });


        // Update the title dynamically
        const titleElement = doc.querySelector('title');
        if (titleElement) {
            titleElement.textContent = `${primaryAssessment.name || 'AI Risk Assessment'} Report`;
        }

        // Generate shareable URL for QR code
        const shareUrl = `${window.location.origin}/assessment-detail.html?id=${primaryAssessment.id}`;

        // Create QR code container element and append to body
        const qrContainerDiv = doc.createElement('div'); // Use a different name to avoid conflict with existing qrContainer
        qrContainerDiv.id = 'qrcode-container';
        qrContainerDiv.style.textAlign = 'center';
        qrContainerDiv.style.marginTop = '20px';
        qrContainerDiv.innerHTML = `<p>Scan to view assessment: </p><div id="qrcode"></div>`;
        doc.body.appendChild(qrContainerDiv); // Append to the document body object

        // This part needs careful handling as QRCode.js and Lucide icons require a live DOM element to render.
        // We will create a temporary iframe, load the document into it, then manipulate its DOM, and finally extract its content.
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none'; // Hide the iframe
        document.body.appendChild(iframe); // Append to main document to allow script execution

        // Load the modified document (doc.documentElement.outerHTML) into the iframe's srcdoc
        // The doctype will be correctly transferred by srcdoc.
        // Using srcdoc is critical for preserving the doctype and allowing script execution within the iframe.
        iframe.srcdoc = `<!DOCTYPE html>${doc.documentElement.outerHTML}`;

        // Wait for iframe to load (important for script execution within iframe)
        await new Promise(resolve => {
            iframe.onload = () => resolve();
        });

        const iframeDoc = iframe.contentWindow.document;

        // Render Lucide icons in the iframe's document
        if (iframe.contentWindow.lucide && typeof iframe.contentWindow.lucide.createIcons === 'function') {
            iframe.contentWindow.lucide.createIcons({
                container: iframeDoc.body // Target the iframe's body for icon rendering
            });
        }

        // Generate QR code in the iframe's document
        new iframe.contentWindow.QRCode(iframeDoc.querySelector('#qrcode'), {
            text: shareUrl,
            width: 128,
            height: 128
        });

        // Get the final HTML content including the DOCTYPE from the iframe
        const finalHtmlContent = `<!DOCTYPE html>${iframeDoc.documentElement.outerHTML}`;
        document.body.removeChild(iframe); // Clean up iframe

        // Create a Blob from the HTML content
        const blob = new Blob([finalHtmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-risk-assessment-report-${new Date().toISOString().substring(0, 10)}.html`; // Dynamic filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Debugging: Check current session before upload
        const { session, error: sessionError } = await getSessionApi();
        if (sessionError) {
            console.error('Error getting session before upload:', sessionError);
        }
        console.log('Session before upload:', session);
        console.log('User before upload:', session?.user);

        debugDataStructure(primaryAssessment, selectedData);

        // Upload to Supabase Storage and get shareable link
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '_'); // Create a clean timestamp
        const fileName = `report-${primaryAssessment.id}-${timestamp}.html`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('exported-html-reports')
            .upload(fileName, blob, {
                contentType: 'text/html',
                upsert: false // Set upsert to false to create new unique files
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
        return { success: true };

    } catch (error) {
        console.error('Error generating HTML report:', error);
        alert('Failed to generate HTML report. Please check the console for details.');
        return { success: false, error: error };
    } finally {
        // generateHtmlBtn.disabled = false;
        // generateHtmlBtn.innerHTML = '<i data-lucide="code" class="w-5 h-5 mr-2"></i><span>Generate HTML</span>';
        // lucide.createIcons(); // No need to re-create icons after download
    }
}

export async function fetchTemplate(templateName) {
    // Get the base path - will be '/ai-risk-dashboard' on GitHub Pages, '' locally
    const basePath = window.location.pathname.includes('/ai-risk-dashboard') ? '/ai-risk-dashboard' : '';
    
    const response = await fetch(`${basePath}/templates/template-${templateName}.html`);
    if (!response.ok) {
        throw new Error(`Failed to fetch template: ${templateName}`);
    }
    return await response.text();
}

function bindDataToTemplate(html, primaryAssessment, allSelectedData, sectionsToGenerate) {
    let populated = html;

    // Add validation and fallbacks
    const safeGet = (obj, path, fallback = 'N/A') => {
        try {
            return path.split('.').reduce((o, p) => o?.[p], obj) || fallback;
        } catch {
            return fallback;
        }
    };

    // General replacements for base template
    populated = populated.replace(/{{toolName}}/g, safeGet(primaryAssessment, 'name'));
    populated = populated.replace(/{{vendor}}/g, safeGet(primaryAssessment, 'vendor'));
    populated = populated.replace(/{{reportDate}}/g, new Date().toLocaleDateString());
    populated = populated.replace(/{{assessed_by}}/g, safeGet(primaryAssessment, 'assessed_by'));
    populated = populated.replace(/{{category}}/g, safeGet(primaryAssessment, 'category'));
    populated = populated.replace(/{{data_classification}}/g, safeGet(primaryAssessment, 'data_classification'));

    // Footer replacements
    populated = populated.replace(/{{assessment_notes}}/g, safeGet(primaryAssessment, 'assessment_notes'));
    populated = populated.replace(/{{documentation_tier}}/g, safeGet(primaryAssessment, 'documentation_tier'));
    populated = populated.replace(/{{license_type}}/g, safeGet(primaryAssessment, 'license_type'));

    const sourcesList = safeGet(primaryAssessment, 'sources', []).map(s => s.title).join(', ') || 'N/A';
    populated = populated.replace(/{{sources_list}}/g, sourcesList);

    const azureRequired = safeGet(primaryAssessment, 'azure_permissions.required_permissions', []).join(', ') || 'N/A';
    populated = populated.replace(/{{azure_permissions_required}}/g, azureRequired);

    const azureRestrictions = safeGet(primaryAssessment, 'azure_permissions.recommended_restrictions', []).join(', ') || 'N/A';
    populated = populated.replace(/{{azure_permissions_restrictions}}/g, azureRestrictions);

    // Executive Summary Section replacements
    if (sectionsToGenerate.includes('summary-section')) {
        populated = populated.replace(/{{overallScore}}/g, safeGet(primaryAssessment, 'total_score', '0'));
        populated = populated.replace(/{{maxScore}}/g, '100'); // Max score is always 100
        populated = populated.replace(/{{riskLevel}}/g, safeGet(primaryAssessment, 'risk_level', 'N/A'));
        populated = populated.replace(/{{riskLevelLower}}/g, (safeGet(primaryAssessment, 'risk_level', 'N/A')).toLowerCase().replace(' ', '-'));
        
        const summaryText = safeGet(primaryAssessment, 'summary_and_recommendation') ||
                            safeGet(primaryAssessment, 'detailedAssessment.summary_and_recommendation') ||
                            'No description provided.';
        populated = populated.replace(/{{riskDescription}}/g, summaryText);

        populated = populated.replace(/{{primary_use_case}}/g, safeGet(primaryAssessment, 'primary_use_case', 'N/A'));
        const confidence = safeGet(primaryAssessment, 'confidence', 0) * 100;
        populated = populated.replace(/{{confidence_percentage}}/g, `${confidence}%`);

    }

    // Detailed Breakdown Section
    if (sectionsToGenerate.includes('detailed-breakdown-section')) {
        let categoriesHtml = '';
        const assessmentDetails = safeGet(primaryAssessment, 'detailedAssessment.assessment_details', {});
        
        if (assessmentDetails && typeof assessmentDetails === 'object') {
            for (const [categoryKey, category] of Object.entries(assessmentDetails)) {
                if (!category || typeof category !== 'object') continue;
                
                const displayName = categoryKey.replace(/_/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                    
                const categoryRiskLevel = safeGet(category, 'final_risk_category') || 
                                        safeGet(category, 'risk_level') || 
                                        safeGet(primaryAssessment, 'risk_level') || 
                                        'medium';
                const riskLevelLower = categoryRiskLevel.toLowerCase().replace(/\s+/g, '-');
                
                categoriesHtml += `
                    <div class="breakdown-category">
                        <div class="breakdown-category__header" onclick="toggleCategory(this)">
                            <h3 class="breakdown-category__name">${displayName}</h3>
                            <div class="breakdown-category__score">
                                <span class="breakdown-category__score-value">${safeGet(category, 'category_score', '0')}</span>
                                <button class="breakdown-category__toggle">▼</button>
                            </div>
                        </div>
                        <div class="breakdown-category__content">
                            <p class="breakdown-category__description">
                                ${safeGet(category, 'summary_and_recommendation') || safeGet(category, 'summary') || safeGet(category, 'description') || 'No description provided.'}
                            </p>
                        </div>
                    </div>
                `;
            }
        } else {
            categoriesHtml = '<p class="text-gray-400">No detailed breakdown available.</p>';
        }
        
        populated = populated.replace(/{{#each detailedAssessment\.assessment_details}}[\\s\\S]*?{{\/each}}/g, categoriesHtml);
    }

    // Recommendations Section
    if (sectionsToGenerate.includes('recommendations-section')) {
        let recommendationsHtml = '';
        const recommendations = safeGet(primaryAssessment, 'recommendations', []);
        
        if (recommendations && Array.isArray(recommendations) && recommendations.length > 0) {
            recommendations.forEach(rec => {
                if (!rec || typeof rec !== 'object') return;
                
                const priority = safeGet(rec, 'priority', 'medium');
                recommendationsHtml += `
                    <div class="recommendation-item recommendation-item--${priority}">
                        <div class="recommendation-item__content">
                            <h3 class="recommendation-item__title">${safeGet(rec, 'title', 'Recommendation')}</h3>
                            <p class="recommendation-item__description">
                                ${safeGet(rec, 'description', 'No description provided.')}
                            </p>
                        </div>
                        <div class="priority-badge priority-badge--${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</div>
                    </div>
                `;
            });
        } else {
            recommendationsHtml = '<p class="text-gray-400">No recommendations available.</p>';
        }
        
        populated = populated.replace(/{{#each recommendations}}[\\s\\S]*?{{\/each}}/g, recommendationsHtml);
    }

    // New: Compliance Section
    if (sectionsToGenerate.includes('compliance-section')) {
        let complianceHtml = '';
        const complianceCertifications = safeGet(primaryAssessment, 'compliance_certifications', {});

        if (complianceCertifications && typeof complianceCertifications === 'object') {
            for (const [certKey, cert] of Object.entries(complianceCertifications)) {
                if (!cert || typeof cert !== 'object') continue;

                const statusLower = safeGet(cert, 'status', 'N/A').toLowerCase().replace(' ', '-');
                complianceHtml += `
                    <div class="compliance-item">
                        <div class="compliance-item__header">
                            <span class="compliance-item__name">${certKey}</span>
                            <span class="compliance-status compliance-status--${statusLower}">${safeGet(cert, 'status', 'N/A')}</span>
                        </div>
                    </div>
                `;
            }
        } else {
            complianceHtml = '<p class="text-gray-400">No compliance certifications available.</p>';
        }

        populated = populated.replace(/{{#each compliance_certifications}}[\\s\\S]*?{{\/each}}/g, complianceHtml);
    }


    // Comparison Table Section (remains mostly same, just ensuring data access is correct)
    if (sectionsToGenerate.includes('comparison-table-section')) {
        let comparisonHtml = '';
        if (allSelectedData && allSelectedData.length > 1) {
            comparisonHtml = `
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th class="comparison-table__header-cell">Assessment</th>
                            <th class="comparison-table__header-cell">Total Score</th>
                            <th class="comparison-table__header-cell">Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            allSelectedData.forEach(assessment => {
                if (!assessment) return;
                
                const riskLevel = safeGet(assessment, 'risk_level', 'N/A');
                const riskLevelLower = riskLevel.toLowerCase().replace(/\s+/g, '-');
                comparisonHtml += `
                    <tr>
                        <td class="comparison-table__data-cell">${safeGet(assessment, 'name', 'Unnamed Assessment')}</td>
                        <td class="comparison-table__data-cell comparison-table__score-cell">${safeGet(assessment, 'total_score', '0')}</td>
                        <td class="comparison-table__data-cell comparison-table__risk-cell comparison-table__risk-cell--${riskLevelLower}">${riskLevel}</td>
                    </tr>
                `;
            });
            
            comparisonHtml += '</tbody></table>';
        } else {
            comparisonHtml = '<p class="comparison-table__no-data-message">Please select at least two assessments for comparison.</p>';
        }
        
        populated = populated.replace(/{{#each allSelectedData}}[\\s\\S]*?{{\/each}}/g, comparisonHtml);
    }
    
    return populated;
}

export async function createPdf(htmlContent) {
    const { jsPDF } = window.jspdf;
    
    // Create a temporary container to render the HTML for conversion
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1000px'; // Standard width for our reports
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#ffffff', // Add background color
        allowTaint: true // Allow taint for better fidelity
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

// Add this to your generateHtmlReport function right after getting selectedData
function debugDataStructure(primaryAssessment, selectedData) {
    console.log('=== DEBUG: Data Structure Analysis ===');
    console.log('Primary Assessment:', primaryAssessment);
    console.log('Selected Data Count:', selectedData.length);
    
    // Check key fields directly from primaryAssessment (top-level properties)
    const topLevelKeyFields = [
        'name', 'vendor', 'total_score', 'risk_level'
    ];
    
    topLevelKeyFields.forEach(field => {
        const value = primaryAssessment[field];
        console.log(`${field} (top-level):`, value ? 'EXISTS' : 'MISSING', typeof value, value);
    });

    // Check assessment_data structure
    if (primaryAssessment.assessment_data) {
        console.log('primaryAssessment.assessment_data EXISTS');
        const assessmentData = primaryAssessment.assessment_data;

        const nestedKeyFields = [
            'summary_and_recommendation',
            'recommendations',
            'detailedAssessment' // Note: camelCase as per your JSON structure
        ];

        nestedKeyFields.forEach(field => {
            const value = assessmentData[field];
            console.log(`${field} (nested under assessment_data):`, value ? 'EXISTS' : 'MISSING', typeof value, value);
        });
        
        // Check detailedAssessment structure more deeply
        if (assessmentData.detailedAssessment) {
            console.log('Detailed Assessment (nested) Keys:', Object.keys(assessmentData.detailedAssessment));
            
            if (assessmentData.detailedAssessment.assessment_details) {
                console.log('Assessment Details (nested) Keys:', Object.keys(assessmentData.detailedAssessment.assessment_details));
                
                // Check first category structure
                const firstCategoryKey = Object.keys(assessmentData.detailedAssessment.assessment_details)[0];
                if (firstCategoryKey) {
                    console.log('First Category Structure (nested):', assessmentData.detailedAssessment.assessment_details[firstCategoryKey]);
                }
            }
        }
        
        // Check recommendations structure more deeply
        if (assessmentData.recommendations) {
            console.log('Recommendations (nested) Count:', assessmentData.recommendations.length);
            if (assessmentData.recommendations[0]) {
                console.log('First Recommendation Structure (nested):', assessmentData.recommendations[0]);
            }
        }

    } else {
        console.log('primaryAssessment.assessment_data MISSING or empty');
    }
    
    console.log('=== END DEBUG ===');
} 
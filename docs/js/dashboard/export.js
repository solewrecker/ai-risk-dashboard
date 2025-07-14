// docs/js/dashboard/export.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- Supabase Client ---
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- State ---
let allAssessments = [];
const selectedAssessmentIds = new Set();
let selectedTemplate = 'summary'; // Default to summary template
let currentMode = 'template'; // 'template' or 'custom'
let customSelectedSections = new Set(); // For mix-and-match

// Define template sections for quick select
const quickTemplates = {
    summary: {
        name: 'Executive Summary',
        sections: ['summary-section'], // Maps to template-summary-section.html
        pages: '3-4 pages'
    },
    detailed: {
        name: 'Detailed Technical Report',
        sections: ['summary-section', 'detailed-breakdown-section', 'recommendations-section'], // Example sections
        pages: '8-12 pages'
    },
    comparison: {
        name: 'Comparison Report',
        sections: ['summary-section', 'comparison-table-section'], // Example sections
        pages: '5-7 pages'
    }
};

// Map for data-section to display name (for custom selections)
const sectionDisplayNames = {
    summary: 'Executive Summary',
    detailed: 'Detailed Breakdown',
    recommendations: 'Recommendations',
    comparison: 'Comparison Table',
    // Add display names for new sections
    'detailed-breakdown-section': 'Detailed Breakdown',
    'recommendations-section': 'Key Recommendations',
    'comparison-table-section': 'Comparison Table'
};

// --- DOM Elements ---
const assessmentSelector = document.getElementById('assessment-selector');
const templateSelector = document.querySelector('.template-selector--quick-select'); // This is now the quick-select container
const mixMatchSelector = document.querySelector('.mix-match-selector'); // This is for custom sections
const generateReportBtn = document.getElementById('generateReportBtn');
const generateHtmlBtn = document.getElementById('generateHtmlBtn'); // New HTML button
const generateHelpText = document.getElementById('generateHelpText');
const customNotice = document.getElementById('custom-notice');
const modeIndicator = document.querySelector('.export-mode-indicator');
const previewSectionsContainer = document.getElementById('preview-sections');
const previewStatus = document.querySelector('.export-preview-status');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    console.log('init(): Starting initialization...');
    // Perform initial session check immediately
    const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

    if (getSessionError) {
        console.error('init(): Error getting session:', getSessionError);
        handleAuthError('Error fetching user session.');
        return;
    }

    if (session) {
        console.log('init(): User session found.', session.user);
        // User is logged in initially
        await loadAssessments();
        setupEventListeners();
    } else {
        console.log('init(): No user session found.');
        // User is not logged in initially
        handleAuthError('No active user session. Please log in.');
    }

    // Set up listener for subsequent auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('onAuthStateChange event:', event, 'session:', session);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            if (session) {
                console.log('onAuthStateChange: User session active or refreshed.');
                // Only load if assessments haven't been loaded yet OR if the session changes to logged in
                // This prevents re-loading if already successfully loaded on init()
                if (allAssessments.length === 0 || generateReportBtn.disabled) { // Check if assessments are empty or if buttons are disabled (implying auth issue)
                    await loadAssessments();
                    setupEventListeners(); // Re-set up listeners if elements changed/re-rendered
                }
            }
        } else if (event === 'SIGNED_OUT') {
            console.log('onAuthStateChange: User signed out.');
            handleAuthError('User signed out. Please log in again.');
        }
    });
}

function handleAuthError(message) {
    console.log('handleAuthError:', message);
    assessmentSelector.innerHTML = `<p class="text-red-400">${message}</p>`;
    generateReportBtn.disabled = true;
    generateHelpText.textContent = 'Please log in to enable export features.';
    allAssessments = [];
    selectedAssessmentIds.clear();
    renderAssessmentSelector(); // Clear any rendered items
    updateUI(); // Update overall UI state
}

// --- Data Loading ---
async function loadAssessments() {
    console.log('loadAssessments(): Attempting to fetch assessments...');
    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('loadAssessments(): Supabase fetch error:', error);
            throw error;
        }
        
        if (data) {
            console.log('loadAssessments(): Assessments fetched successfully.', data.length, 'items.');
            allAssessments = data;
            parseURLParams();
            renderAssessmentSelector();
            updateUI();
        } else {
            console.log('loadAssessments(): No data received from Supabase.');
            assessmentSelector.innerHTML = '<p class="text-gray-400">No assessments found.</p>';
            updateUI();
        }

    } catch (error) {
        console.error('loadAssessments(): Error loading assessments:', error);
        assessmentSelector.innerHTML = '<p class="text-red-400">Error loading assessments. Please try again later.</p>';
        updateUI();
    }
}

function parseURLParams() {
    console.log('parseURLParams(): Parsing URL parameters...');
    const params = new URLSearchParams(window.location.search);
    const ids = params.get('ids');
    if (ids) {
        ids.split(',').forEach(id => selectedAssessmentIds.add(id));
    }
}

// --- UI Rendering ---
function renderAssessmentSelector() {
    console.log('renderAssessmentSelector(): Rendering assessment selector with', allAssessments.length, 'assessments.');
    if (!allAssessments.length) {
        assessmentSelector.innerHTML = '<p class="text-gray-400">No assessments found.</p>';
        return;
    }

    const html = allAssessments.map(assessment => {
        const isChecked = selectedAssessmentIds.has(assessment.id);
        return `
            <div class="assessment-item-row">
                <input type="checkbox" id="assessment-${assessment.id}" data-id="${assessment.id}" ${isChecked ? 'checked' : ''}>
                <label for="assessment-${assessment.id}" class="assessment-item-info">
                    <div class="assessment-item-name">${assessment.name}</div>
                    <div class="assessment-item-category">${assessment.category || 'N/A'}</div>
                </label>
                <span class="assessment-item-score risk-${assessment.risk_level}">${assessment.total_score}</span>
            </div>
        `;
    }).join('');

    assessmentSelector.innerHTML = html;
}

// --- Event Listeners ---
function setupEventListeners() {
    // Quick Select Template selection
    templateSelector.addEventListener('click', (e) => {
        const card = e.target.closest('.template-card');
        if (!card || card.classList.contains('disabled')) return; // Ignore clicks on disabled cards

        // Clear previous template selection
        templateSelector.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        
        // Add new selection
        card.classList.add('selected');
        selectedTemplate = card.dataset.template;
        currentMode = 'template';

        // Clear custom sections when a quick template is selected
        mixMatchSelector.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        customSelectedSections.clear();

        updateUI();
    });

    // Assessment selection (remains the same)
    assessmentSelector.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const id = e.target.dataset.id;
            if (e.target.checked) {
                selectedAssessmentIds.add(id);
            } else {
                selectedAssessmentIds.delete(id);
            }
            updateUI();
        }
    });

    // Generate button (remains the same)
    generateReportBtn.addEventListener('click', generateReport);

    // New: Generate HTML button
    generateHtmlBtn.addEventListener('click', generateHtmlReport);

    // Mix-and-match sections selection
    mixMatchSelector.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const sectionId = e.target.dataset.section;
            // We store the filename-friendly ID in the set
            const sectionFilename = `${sectionId}-section`; // e.g., 'summary-section'

            if (e.target.checked) {
                customSelectedSections.add(sectionFilename);
            } else {
                customSelectedSections.delete(sectionFilename);
            }

            if (customSelectedSections.size > 0) {
                currentMode = 'custom';
                // Deselect quick template if custom section is chosen
                templateSelector.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
                selectedTemplate = null; // No quick template selected
            } else {
                // If no custom sections, revert to default quick template
                currentMode = 'template';
                selectedTemplate = 'summary';
                templateSelector.querySelector('[data-template="summary"]').classList.add('selected');
            }
            updateUI();
        }
    });
}

// --- Report Generation ---
async function generateReport() {
    // Adjust validation based on currentMode
    if (selectedAssessmentIds.size === 0 || (currentMode === 'template' && !selectedTemplate) || (currentMode === 'custom' && customSelectedSections.size === 0)) {
        alert('Please select at least one assessment and either a quick template or custom sections.');
        return;
    }

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

    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report. Please check the console for details.');
    } finally {
        generateReportBtn.disabled = false;
        generateReportBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5 mr-2"></i><span>Generate Report</span>';
        lucide.createIcons();
    }
}

async function fetchTemplate(templateName) {
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

    // General replacements for base template
    populated = populated.replace(/{{toolName}}/g, primaryAssessment.name || 'N/A');
    populated = populated.replace(/{{toolSubtitle}}/g, primaryAssessment.vendor || 'N/A');
    populated = populated.replace(/{{reportDate}}/g, new Date().toLocaleDateString());
    populated = populated.replace(/{{assessmentId}}/g, primaryAssessment.id ? primaryAssessment.id.substring(0, 8) : 'N/A');

    // Executive Summary Section replacements (if summary section is selected)
    if (sectionsToGenerate.includes('summary-section')) {
        populated = populated.replace(/{{overallScore}}/g, primaryAssessment.total_score || '0');
        populated = populated.replace(/{{maxScore}}/g, '100'); // Assuming max score is 100
        populated = populated.replace(/{{riskLevel}}/g, primaryAssessment.risk_level || 'N/A');
        populated = populated.replace(/{{riskLevelLower}}/g, (primaryAssessment.risk_level || 'N/A').toLowerCase().replace(' ', '-'));
        
        // Use summary_and_recommendation directly from the primaryAssessment for high-level
        populated = populated.replace(/{{riskDescription}}/g, primaryAssessment.summary_and_recommendation || 'No description provided.');

        // Key Strengths and Areas for Improvement
        // These are often derived from the recommendations or the overall summary
        // For now, let's derive them from the general summary or specific recommendation categories if available
        const recommendations = primaryAssessment.recommendations || [];
        const keyStrengths = recommendations.filter(rec => rec.category === 'strength').map(rec => rec.description).join(' ');
        const areasForImprovement = recommendations.filter(rec => rec.category !== 'strength').map(rec => rec.description).join(' ');

        populated = populated.replace(/{{keyStrengths}}/g, keyStrengths || 'No key strengths identified.');
        populated = populated.replace(/{{areasForImprovement}}/g, areasForImprovement || 'No areas for improvement identified.');

        // Findings - these are usually specific points derived from the overall summary or detailed assessment
        // If assessmentData.detailed_assessment?.summary_and_recommendation contains distinct sentences, parse them.
        // Otherwise, use a fallback.
        const summaryAndRecommendation = primaryAssessment.detailed_assessment?.summary_and_recommendation || '';
        const findings = summaryAndRecommendation.split('. ').filter(f => f.trim() !== '');
        
        populated = populated.replace(/{{finding1}}/g, findings[0] || 'No finding 1 provided.');
        populated = populated.replace(/{{finding2}}/g, findings[1] || 'No finding 2 provided.');
        populated = populated.replace(/{{finding3}}/g, findings[2] || 'No finding 3 provided.');
        populated = populated.replace(/{{finding4}}/g, findings[3] || 'No finding 4 provided.');
    }

    // Detailed Breakdown Section replacements
    if (sectionsToGenerate.includes('detailed-breakdown-section')) {
        let categoriesHtml = '';
        if (primaryAssessment.detailed_assessment?.assessment_details) {
            for (const categoryKey in primaryAssessment.detailed_assessment.assessment_details) {
                const category = primaryAssessment.detailed_assessment.assessment_details[categoryKey];
                // Normalize categoryKey for display (e.g., data_storage_and_security to Data Storage and Security)
                const displayName = categoryKey.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                // Ensure risk level is correctly extracted and formatted for class
                const categoryRiskLevel = category.final_risk_category || primaryAssessment.risk_level || 'N/A';
                const riskLevelLower = categoryRiskLevel.toLowerCase().replace(' ', '-');
                categoriesHtml += `
                    <div class="detailed-breakdown__category-card detailed-breakdown__category-card--${riskLevelLower}">
                        <div class="detailed-breakdown__category-header">
                            <h3 class="detailed-breakdown__category-name">${displayName}</h3>
                            <div class="detailed-breakdown__category-score detailed-breakdown__category-score--${riskLevelLower}">${category.category_score || '0'}</div>
                        </div>
                        <p class="detailed-breakdown__category-description">${category.summary_and_recommendation || 'No description provided.'}</p>
                    </div>
                `;
            }
        }
        populated = populated.replace(/{{#each detailed_assessment.assessment_details}}/g, categoriesHtml);
        populated = populated.replace(/{{\/each}}/g, ''); // Remove the closing Handlebars tag
    }

    // Recommendations Section replacements
    if (sectionsToGenerate.includes('recommendations-section')) {
        let recommendationsHtml = '';
        // Use primaryAssessment.recommendations directly
        if (primaryAssessment.recommendations && primaryAssessment.recommendations.length > 0) {
            primaryAssessment.recommendations.forEach(rec => {
                recommendationsHtml += `
                    <div class="recommendations__card recommendations__card--priority-${rec.priority}">
                        <div class="recommendations__header">
                            <h3 class="recommendations__title">${rec.title || 'N/A'}</h3>
                            <div class="recommendations__priority-badge recommendations__priority-badge--${rec.priority}">${rec.priority || 'N/A'}</div>
                        </div>
                        <p class="recommendations__text">${rec.description || 'No description provided.'}</p>
                    </div>
                `;
            });
        }
        populated = populated.replace(/{{#each recommendations}}/g, recommendationsHtml);
        populated = populated.replace(/{{\/each}}/g, ''); // Remove the closing Handlebars tag
    }

    // Comparison Table Section replacements
    if (sectionsToGenerate.includes('comparison-table-section')) {
        let comparisonHtml = '';
        if (allSelectedData.length > 1) {
            comparisonHtml += `
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
                const riskLevelLower = (assessment.risk_level || 'N/A').toLowerCase().replace(' ', '-');
                comparisonHtml += `
                    <tr>
                        <td class="comparison-table__data-cell">${assessment.name}</td>
                        <td class="comparison-table__data-cell comparison-table__score-cell">${assessment.total_score || '0'}</td>
                        <td class="comparison-table__data-cell comparison-table__risk-cell comparison-table__risk-cell--${riskLevelLower}">${assessment.risk_level || 'N/A'}</td>
                    </tr>
                `;
            });
            comparisonHtml += `
                    </tbody>
                </table>
            `;
        } else {
            comparisonHtml = '<p class="comparison-table__no-data-message">Please select at least two assessments for comparison.</p>';
        }
        populated = populated.replace(/{{#each allSelectedData}}/g, comparisonHtml);
        populated = populated.replace(/{{\/each}}/g, ''); // Remove the closing Handlebars tag
    }
    
    return populated;
}

async function createPdf(htmlContent) {
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

async function generateHtmlReport() {
    // Similar validation as generateReport
    if (selectedAssessmentIds.size === 0 || (currentMode === 'template' && !selectedTemplate) || (currentMode === 'custom' && customSelectedSections.size === 0)) {
        alert('Please select at least one assessment and either a quick template or custom sections.');
        return;
    }

    generateHtmlBtn.disabled = true;
    generateHtmlBtn.innerHTML = '<i class="loader"></i> Generating HTML...';

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
        const cssResponse = await fetch(`${basePath}/css/pages/export-page.css`);
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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Error getting session before upload:', sessionError);
        }
        console.log('Session before upload:', session);
        console.log('User before upload:', session?.user);

        // ADD THIS LINE:
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

    } catch (error) {
        console.error('Error generating HTML report:', error);
        alert('Failed to generate HTML report. Please check the console for details.');
    } finally {
        generateHtmlBtn.disabled = false;
        generateHtmlBtn.innerHTML = '<i data-lucide="code" class="w-5 h-5 mr-2"></i><span>Generate HTML</span>';
        // lucide.createIcons(); // No need to re-create icons after download
    }
}

// Add this to your generateHtmlReport function right after getting selectedData
function debugDataStructure(primaryAssessment, selectedData) {
    console.log('=== DEBUG: Data Structure Analysis ===');
    console.log('Primary Assessment:', primaryAssessment);
    console.log('Selected Data Count:', selectedData.length);
    
    // Check key fields
    const keyFields = [
        'name', 'vendor', 'total_score', 'risk_level', 
        'summary_and_recommendation', 'recommendations', 'detailed_assessment'
    ];
    
    keyFields.forEach(field => {
        const value = primaryAssessment[field];
        console.log(`${field}:`, value ? 'EXISTS' : 'MISSING', typeof value, value);
    });
    
    // Check detailed_assessment structure
    if (primaryAssessment.detailed_assessment) {
        console.log('Detailed Assessment Keys:', Object.keys(primaryAssessment.detailed_assessment));
        
        if (primaryAssessment.detailed_assessment.assessment_details) {
            console.log('Assessment Details Keys:', Object.keys(primaryAssessment.detailed_assessment.assessment_details));
            
            // Check first category structure
            const firstCategoryKey = Object.keys(primaryAssessment.detailed_assessment.assessment_details)[0];
            if (firstCategoryKey) {
                console.log('First Category Structure:', primaryAssessment.detailed_assessment.assessment_details[firstCategoryKey]);
            }
        }
    }
    
    // Check recommendations structure
    if (primaryAssessment.recommendations) {
        console.log('Recommendations Count:', primaryAssessment.recommendations.length);
        if (primaryAssessment.recommendations[0]) {
            console.log('First Recommendation Structure:', primaryAssessment.recommendations[0]);
        }
    }
    
    console.log('=== END DEBUG ===');
}

// --- UI State Management ---
function updateUI() {
    console.log('updateUI(): Updating UI based on current state.');
    let canGenerate = true;
    let helpText = '';

    const selectedAssessmentsCount = selectedAssessmentIds.size;

    // Determine if a template or custom sections are selected
    const isTemplateSelected = currentMode === 'template' && selectedTemplate;
    const isCustomSectionSelected = currentMode === 'custom' && customSelectedSections.size > 0;

    if (selectedAssessmentsCount === 0) {
        canGenerate = false;
        helpText = 'Please select at least one assessment.';
    } else if (!isTemplateSelected && !isCustomSectionSelected) {
        canGenerate = false;
        helpText = 'Please choose a quick template or select custom sections.';
    } else if (selectedTemplate === 'comparison' && selectedAssessmentsCount < 2) {
        canGenerate = false;
        helpText = 'The Comparison Report requires at least two assessments.';
    } else {
        let reportTypeName = '';
        if (currentMode === 'template' && selectedTemplate) {
            reportTypeName = quickTemplates[selectedTemplate].name;
        } else if (currentMode === 'custom') {
            reportTypeName = `Custom Report with ${customSelectedSections.size} section${customSelectedSections.size !== 1 ? 's' : ''}`;
        }
        helpText = `Ready to generate a ${reportTypeName} for ${selectedAssessmentsCount} assessment(s).`;
    }

    generateReportBtn.disabled = !canGenerate;
    generateHtmlBtn.disabled = !canGenerate; // Enable/disable HTML button as well
    generateHelpText.textContent = helpText;

    // Update custom notice visibility/text
    if (currentMode === 'custom') {
        customNotice.classList.add('active');
        customNotice.textContent = `Custom report with ${customSelectedSections.size} section${customSelectedSections.size !== 1 ? 's' : ''} selected.`;
    } else {
        customNotice.classList.remove('active');
        customNotice.textContent = 'Select sections below to create a custom report';
    }

    // Update Preview Section
    previewSectionsContainer.innerHTML = ''; // Clear previous items
    let sectionsToDisplay = [];
    let estimatedPagesText = '';
    let reportTitleForButton = 'Generate Report';

    if (currentMode === 'template' && selectedTemplate) {
        const templateInfo = quickTemplates[selectedTemplate];
        // Use the sections array from quickTemplates as they are already display-friendly
        sectionsToDisplay = templateInfo.sections.map(sectionId => sectionDisplayNames[sectionId.replace('-section', '')] || sectionId); // Map filename to display name
        estimatedPagesText = templateInfo.pages;
        modeIndicator.className = 'export-mode-indicator template';
        modeIndicator.innerHTML = `📋 Using ${templateInfo.name} Template`;
        reportTitleForButton = `📄 Generate ${templateInfo.name} Report`;
    } else if (currentMode === 'custom' && customSelectedSections.size > 0) {
        // Map custom selected section filenames to display names for preview
        sectionsToDisplay = Array.from(customSelectedSections).map(sectionFilename => {
            const sectionId = sectionFilename.replace('-section', '');
            return sectionDisplayNames[sectionId] || sectionId; // Fallback to ID if no display name
        });
        const estimatedPages = Math.max(2, sectionsToDisplay.length); // Minimum 2 pages for custom
        estimatedPagesText = `${estimatedPages} page${estimatedPages !== 1 ? 's' : ''}`;
        modeIndicator.className = 'export-mode-indicator custom';
        modeIndicator.innerHTML = '⚙️ Using Custom Configuration';
        reportTitleForButton = '📄 Generate Custom Report';
    } else {
        // Default state when nothing is selected or an invalid state
        modeIndicator.className = 'export-mode-indicator';
        modeIndicator.textContent = '';
        estimatedPagesText = '';
        reportTitleForButton = 'Generate Report';
    }

    sectionsToDisplay.forEach(section => {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `✓ ${section}`;
        previewSectionsContainer.appendChild(item);
    });

    previewStatus.innerHTML = `<strong>${currentMode === 'template' && selectedTemplate ? quickTemplates[selectedTemplate].name + ' Template' : 'Custom Report'}</strong> • Estimated length: ${estimatedPagesText}`;
    generateReportBtn.innerHTML = `<i data-lucide="download" class="w-5 h-5 mr-2"></i><span>${reportTitleForButton}</span>`;
    generateHtmlBtn.innerHTML = `<i data-lucide="code" class="w-5 h-5 mr-2"></i><span>${reportTitleForButton.replace('Generate', 'Generate HTML')}</span>`;

    // Disable comparison template if less than 2 assessments are selected
    const comparisonCard = templateSelector.querySelector('[data-template="comparison"]');
    if (comparisonCard) {
        if (selectedAssessmentsCount < 2) {
            comparisonCard.classList.add('disabled');
            // If it was selected, unselect it and revert to summary if no custom sections
            if (selectedTemplate === 'comparison') {
                selectedTemplate = 'summary';
                currentMode = 'template'; // Revert mode to template as a summary is now selected
                templateSelector.querySelector('[data-template="summary"]').classList.add('selected');
                comparisonCard.classList.remove('selected');
                mixMatchSelector.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
                customSelectedSections.clear();
            }
        } else {
            comparisonCard.classList.remove('disabled');
        }
    }
    // Ensure the default template is selected initially if no custom sections are active
    if (currentMode === 'template' && !selectedTemplate && templateSelector.querySelector('[data-template="summary"]')) {
        templateSelector.querySelector('[data-template="summary"]').classList.add('selected');
        selectedTemplate = 'summary';
    }
    lucide.createIcons();
} 
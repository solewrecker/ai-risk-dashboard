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
        sections: ['summary-section', 'detailed-breakdown-section', 'recommendations-section', 'compliance-section'], // Added compliance-section
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
    compliance: 'Compliance Status',
    // Add display names for new sections
    'detailed-breakdown-section': 'Detailed Breakdown',
    'recommendations-section': 'Key Recommendations',
    'comparison-table-section': 'Comparison Table',
    'compliance-section': 'Compliance Status'
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
            // Process fetched data to merge nested assessment_data properties
            allAssessments = data.map(assessment => {
                if (assessment.assessment_data && typeof assessment.assessment_data === 'object') {
                    // Merge assessment_data properties into the top-level assessment object
                    return { ...assessment, ...assessment.assessment_data };
                }
                return assessment;
            });
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
        
        populated = populated.replace(/{{#each detailedAssessment\.assessment_details}}[\s\S]*?{{\/each}}/g, categoriesHtml);
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
        
        populated = populated.replace(/{{#each recommendations}}[\s\S]*?{{\/each}}/g, recommendationsHtml);
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

        populated = populated.replace(/{{#each compliance_certifications}}[\s\S]*?{{\/each}}/g, complianceHtml);
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
        
        populated = populated.replace(/{{#each allSelectedData}}[\s\S]*?{{\/each}}/g, comparisonHtml);
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

/*
 * Toggles the visibility of detailed breakdown categories.
 * This function is directly included in the generated HTML for export and also used here for preview.
 */
function toggleCategory(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.breakdown-category__toggle'); // Updated class name
    
    const isActive = content.classList.contains('breakdown-category__content--active'); // Updated class name
    
    if (isActive) {
        content.classList.remove('breakdown-category__content--active'); // Updated class name
        toggle.classList.remove('breakdown-category__toggle--active');
        header.classList.remove('breakdown-category__header--active');
    } else {
        content.classList.add('breakdown-category__content--active'); // Updated class name
        toggle.classList.add('breakdown-category__toggle--active');
        header.classList.add('breakdown-category__header--active');
    }
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
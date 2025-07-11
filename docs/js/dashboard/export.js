// docs/js/dashboard/export.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- Supabase Client ---
const SUPABASE_URL = 'https://tnrvvgnbfxusqkhjzzqm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucnZ2Z25iZnh1c3FraGp6enFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTczNTQzMjYsImV4cCI6MjAzMjkzMDMyNn0.8D93jH2D9g9iHk5s_1_jC2iS6k6pL8sP233f2-z3gJM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- State ---
let allAssessments = [];
const selectedAssessmentIds = new Set();
let selectedTemplate = null;

// --- DOM Elements ---
const assessmentSelector = document.getElementById('assessment-selector');
const templateSelector = document.querySelector('.template-selector');
const generateReportBtn = document.getElementById('generateReportBtn');
const generateHelpText = document.getElementById('generateHelpText');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    await loadAssessments();
    setupEventListeners();
}

// --- Data Loading ---
async function loadAssessments() {
    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        allAssessments = data;
        parseURLParams();
        renderAssessmentSelector();
        updateUI();

    } catch (error) {
        console.error('Error loading assessments:', error);
        assessmentSelector.innerHTML = '<p class="text-red-400">Error loading assessments. Please try again later.</p>';
    }
}

function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    const ids = params.get('ids');
    if (ids) {
        ids.split(',').forEach(id => selectedAssessmentIds.add(id));
    }
}

// --- UI Rendering ---
function renderAssessmentSelector() {
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
    // Template selection
    templateSelector.addEventListener('click', (e) => {
        const card = e.target.closest('.template-card');
        if (!card) return;

        // Clear previous selection
        templateSelector.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        
        // Add new selection
        card.classList.add('selected');
        selectedTemplate = card.dataset.template;

        updateUI();
    });

    // Assessment selection
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

    // Generate button
    generateReportBtn.addEventListener('click', generateReport);

    // Mix-and-match sections
    const mixMatchSelector = document.querySelector('.mix-match-selector');
    if (mixMatchSelector) {
        mixMatchSelector.addEventListener('change', updateUI);
    }
}

// --- Report Generation ---
async function generateReport() {
    if (!selectedTemplate || selectedAssessmentIds.size === 0) {
        alert('Please select a template and at least one assessment.');
        return;
    }

    generateReportBtn.disabled = true;
    generateReportBtn.innerHTML = '<i class="loader"></i> Generating...';

    try {
        const selectedData = allAssessments.filter(a => selectedAssessmentIds.has(a.id));
        
        // For now, we'll just use the first selected assessment for the summary/detailed reports
        const primaryAssessment = selectedData[0]; 

        const selectedSections = Array.from(mixMatchSelector.querySelectorAll('input:checked')).map(input => input.dataset.section);

        // For mix-and-match, start with a base template and add sections
        let templateHtml = await fetchTemplate('base'); // Assume a base.html exists
        if (selectedSections.includes('summary')) {
            templateHtml += await fetchTemplate('summary-section');
        }
        // Similarly for other sections

        const populatedHtml = bindDataToTemplate(templateHtml, primaryAssessment, selectedData, selectedSections);
        
        // Generate shareable URL (example: link to view the assessment)
        const shareUrl = `${window.location.origin}/assessment-detail.html?id=${primaryAssessment.id}`;

        // Create QR code container
        const qrContainer = document.createElement('div');
        qrContainer.style.textAlign = 'center';
        qrContainer.style.marginTop = '20px';
        qrContainer.innerHTML = `<p>Scan to view assessment: </p><div id="qrcode"></div>`;

        // Append to populated HTML (assume there's a footer or body)
        populated = populated.replace('</body>', `${qrContainer.outerHTML}</body>`);

        // Now, after rendering to container, generate the QR code
        // But since container is off-screen, we need to generate QR after setting innerHTML
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '1000px'; // Standard width for our reports
        container.innerHTML = populated;
        document.body.appendChild(container);

        new QRCode(container.querySelector('#qrcode'), {
            text: shareUrl,
            width: 128,
            height: 128
        });
        document.body.removeChild(container);

        await createPdf(populated);

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
    const response = await fetch(`../templates/template-${templateName}.html`);
    if (!response.ok) {
        throw new Error(`Failed to fetch template: ${templateName}`);
    }
    return await response.text();
}

function bindDataToTemplate(html, primaryAssessment, allSelectedData, selectedSections) {
    // This is a simplified binding function.
    // A more robust solution would use a templating engine like Handlebars.
    let populated = html.replace(/{{\s*tool_name\s*}}/gi, primaryAssessment.name);
    populated = populated.replace(/{{\s*total_score\s*}}/gi, primaryAssessment.total_score);
    populated = populated.replace(/{{\s*risk_level\s*}}/gi, primaryAssessment.risk_level);
    
    // Add more replacements as needed for the detailed template
    // For example:
    const recommendations = primaryAssessment.assessment_data?.recommendations || [];
    const recsHtml = recommendations.map(rec => `<li><strong>${rec.title}:</strong> ${rec.description}</li>`).join('');
    populated = populated.replace(/{{\s*recommendations_list\s*}}/gi, recsHtml);

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


// --- UI State Management ---
function updateUI() {
    let canGenerate = true;
    let helpText = '';

    if (selectedAssessmentIds.size === 0) {
        canGenerate = false;
        helpText = 'Please select at least one assessment.';
    } else if (!selectedTemplate) {
        canGenerate = false;
        helpText = 'Please choose a report template.';
    } else if (selectedTemplate === 'comparison' && selectedAssessmentIds.size < 2) {
        canGenerate = false;
        helpText = 'The Comparison Report requires at least two assessments.';
    } else {
        helpText = `Ready to generate a ${selectedTemplate} report for ${selectedAssessmentIds.size} assessment(s).`;
    }

    generateReportBtn.disabled = !canGenerate;
    generateHelpText.textContent = helpText;

    // Disable comparison template if less than 2 assessments are selected
    const comparisonCard = templateSelector.querySelector('[data-template="comparison"]');
    if (comparisonCard) {
        if (selectedAssessmentIds.size < 2) {
            comparisonCard.classList.add('disabled');
            // If it was selected, unselect it
            if (selectedTemplate === 'comparison') {
                selectedTemplate = null;
                comparisonCard.classList.remove('selected');
                updateUI(); // Re-run checks
            }
        } else {
            comparisonCard.classList.remove('disabled');
        }
    }
} 
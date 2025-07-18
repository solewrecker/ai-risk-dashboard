// docs/js/dashboard/export.js

import { supabase } from '../supabase-client.js';
import { prepareReportData } from './export/report-generation.js';

// --- State ---
let allAssessments = [];
const selectedAssessmentIds = new Set();
let selectedTemplate = 'summary'; // Default to summary template
let currentMode = 'template'; // 'template' or 'custom'
let selectedTheme = 'theme-professional'; // Default to professional theme
let customSelectedSections = new Set(); // For mix-and-match

// Flag to ensure event listeners are attached only once
let listenersAttached = false;

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
    },
    premium: {
        name: 'Premium Report',
        sections: ['summary-section', 'detailed-breakdown-section', 'recommendations-section', 'premium-section'],
        pages: '12-15 pages'
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
const previewReportBtn = document.getElementById('previewReportBtn');
const generateHelpText = document.getElementById('generateHelpText');
const customNotice = document.getElementById('custom-notice');
const modeIndicator = document.querySelector('.export-mode-indicator');
const previewSectionsContainer = document.getElementById('preview-sections');
const previewStatus = document.querySelector('.export-preview-status');
// themeSelector removed - now using theme gallery system

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

    // Initialize tab navigation and theme gallery
    initializeTabNavigation();
    initializeThemeGallery();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Set up listener for subsequent auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('onAuthStateChange event:', event, 'session:', session);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            if (session) {
                console.log('onAuthStateChange: User session active or refreshed.');
                // Only load if assessments haven't been loaded yet OR if the session changes to logged in
                // This prevents re-loading if already successfully loaded on init()
                if (allAssessments.length === 0) {
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

// Initialize tab navigation
function initializeTabNavigation() {
    const tabs = document.querySelectorAll('.export-nav__tab');
    const tabContents = document.querySelectorAll('.export-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('export-nav__tab--disabled')) {
                return;
            }

            const targetTab = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('export-nav__tab--active'));
            tab.classList.add('export-nav__tab--active');

            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('export-tab-content--active');
            });
            
            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('export-tab-content--active');
            }

            // Re-initialize Lucide icons for new content
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });
}

// Initialize theme gallery
function initializeThemeGallery() {
    const themeCards = document.querySelectorAll('.theme-card');
    const previewMock = document.getElementById('theme-preview-mock');
    const currentThemeName = document.getElementById('current-theme-name');
    const applyThemeBtn = document.getElementById('apply-theme-btn');
    const previewWithThemeBtn = document.getElementById('preview-with-theme-btn');

    // Theme configurations for preview updates
    const themeConfigs = {
        'theme-professional': {
            name: 'Professional Theme',
            headerColor: '#1e40af',
            scoreColor: '#1e40af',
            scoreBg: '#eff6ff'
        },
        'theme-executive': {
            name: 'Executive Theme',
            headerColor: '#1e3a8a',
            scoreColor: '#1e3a8a',
            scoreBg: '#eff6ff'
        },
        'theme-modern': {
            name: 'Modern Theme',
            headerColor: '#7c3aed',
            scoreColor: '#7c3aed',
            scoreBg: '#f3e8ff'
        },
        'theme-dark': {
            name: 'Dark Theme',
            headerColor: '#111827',
            scoreColor: '#a855f7',
            scoreBg: '#1f2937'
        }
    };

    // Handle theme card selection
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            const themeId = card.dataset.theme;
            
            // Update selected state
            themeCards.forEach(c => c.classList.remove('theme-card--selected'));
            card.classList.add('theme-card--selected');

            // Update global selected theme
            selectedTheme = themeId;

            // Update live preview
            updateThemePreview(themeId, themeConfigs[themeId]);
        });
    });

    // Apply theme button
    if (applyThemeBtn) {
        applyThemeBtn.addEventListener('click', () => {
            // Switch to configure tab
            const configureTab = document.getElementById('configure-tab');
            if (configureTab) {
                configureTab.click();
            }
            
            // Show success message or update UI to indicate theme applied
            showThemeAppliedMessage();
        });
    }

    // Preview with theme button
    if (previewWithThemeBtn) {
        previewWithThemeBtn.addEventListener('click', () => {
            // Generate preview with selected theme
            generatePreview();
        });
    }

    // Initialize with default theme
    updateThemePreview('theme-professional', themeConfigs['theme-professional']);
}

// Update theme preview mock
function updateThemePreview(themeId, config) {
    const previewMock = document.getElementById('theme-preview-mock');
    const currentThemeName = document.getElementById('current-theme-name');
    const selectedThemeName = document.getElementById('selected-theme-name');
    
    if (!config) return;

    // Update theme name in both locations
    if (currentThemeName) {
        currentThemeName.textContent = config.name;
    }
    if (selectedThemeName) {
        selectedThemeName.textContent = config.name;
    }

    // Update preview mock colors
    if (previewMock) {
        const header = previewMock.querySelector('.theme-preview-mock__header');
        const score = previewMock.querySelector('.theme-preview-mock__score');
        
        if (header) {
            header.style.backgroundColor = config.headerColor;
        }
        
        if (score) {
            score.style.color = config.scoreColor;
            score.style.backgroundColor = config.scoreBg;
        }
    }
}

// Show theme applied message
function showThemeAppliedMessage() {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'theme-applied-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 500;
        ">
            ✓ Theme applied successfully!
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function handleAuthError(message) {
    console.log('handleAuthError:', message);
    assessmentSelector.innerHTML = `<p class="text-red-400">${message}</p>`;
    previewReportBtn.disabled = true;
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
    if (listenersAttached) {
        console.log('setupEventListeners(): Listeners already attached, skipping.');
        return;
    }
    console.log('setupEventListeners(): Attaching event listeners...');

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

    // Generate button
    previewReportBtn.addEventListener('click', () => prepareReportData(selectedAssessmentIds, allAssessments, quickTemplates, selectedTemplate, currentMode, customSelectedSections, selectedTheme));

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

    // Theme selector functionality is now handled by initializeThemeGallery()

    // After all listeners are set up, set the flag to true
    listenersAttached = true;
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

    previewReportBtn.disabled = !canGenerate;
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
    previewReportBtn.innerHTML = `<i data-lucide="eye" class="w-5 h-5 mr-2"></i><span>Preview Report</span>`;

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
}
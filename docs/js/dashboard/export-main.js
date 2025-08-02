// docs/js/dashboard/export-main.js

// Use the global Supabase client initialized in export.html
const supabase = window.supabaseClient;

// Ensure consistent access to Supabase client
if (!supabase) {
    console.error('Supabase client not found. Make sure it is initialized in export.html');
}

// Module-level variables to store imported modules
let prepareReportData;
let ScalableThemeSystem;
let themes;
let ThemeConnector;
let ThemeMarketplace;

// Function to dynamically import ES modules and handle errors
async function importModules() {
    try {
        // Dynamically import modules one by one to better handle errors
        console.log('Importing report-generation.js...');
        const reportGenModule = await import('./export/report-generation.js')
            .catch(err => {
                console.error('Error importing report-generation.js:', err);
                throw new Error('Failed to load report generation module');
            });
        
        console.log('Importing themeSystem.js...');
        const themeSystemModule = await import('./export/themeSystem.js')
            .catch(err => {
                console.error('Error importing themeSystem.js:', err);
                throw new Error('Failed to load theme system module');
            });
        
        console.log('Importing themeConfig.js...');
        const themeConfigModule = await import('./export/themes/themeConfig.js')
            .catch(err => {
                console.error('Error importing themeConfig.js:', err);
                throw new Error('Failed to load theme config module');
            });
        
        console.log('Importing themeConnector.js...');
        const connectorModule = await import('./export/themeConnector.js')
            .catch(err => {
                console.error('Error importing themeConnector.js:', err);
                throw new Error('Failed to load theme connector module');
            });
        
        console.log('Importing themeMarketplace.js...');
        const marketplaceModule = await import('./export/themeMarketplace.js')
            .catch(err => {
                console.error('Error importing themeMarketplace.js:', err);
                throw new Error('Failed to load theme marketplace module');
            });
        
        // Assign imported modules to variables
        prepareReportData = reportGenModule.prepareReportData;
        ScalableThemeSystem = themeSystemModule.ScalableThemeSystem;
        themes = themeConfigModule.themes;
        ThemeConnector = connectorModule.default;
        ThemeMarketplace = marketplaceModule.default;
        
        console.log('All modules imported successfully');
        return true;
    } catch (error) {
        console.error('Error importing modules:', error);
        return false;
    }
}

// --- State ---
let allAssessments = [];
const selectedAssessmentIds = new Set();
let selectedTemplate = 'executive'; // Default to executive template
let currentMode = 'template'; // 'template' or 'custom'
let selectedTheme = 'theme-professional'; // Default to professional theme
let customSelectedSections = new Set(); // For mix-and-match

// Flag to ensure event listeners are attached only once
let listenersAttached = false;

// Use the global window properties for templates
const quickTemplates = window.reportConfigs || {
    executive: {
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
let assessmentSelector;
let templateSelector;
let mixMatchSelector;
let previewReportBtn;
let generateHelpText;
let customNotice;
let modeIndicator;
let previewSectionsContainer;
let previewStatus;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    console.log('init(): Starting export system initialization...');
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Initialize tab navigation
    initializeTabNavigation();
    
    // Set default template selection
    setDefaultTemplateSelection();
    
    // Import required modules
    try {
        // Import all required modules
        const modulesLoaded = await importModules();
        if (!modulesLoaded) {
            console.error('init(): Failed to import required modules');
            handleAuthError('Failed to load required modules. Please refresh the page.');
            return;
        }
        
        // Initialize marketplace and theme listener after modules are loaded
        initializeThemeMarketplace();
        setupThemeChangeListener();
    } catch (error) {
        console.error('init(): Error importing modules:', error);
        handleAuthError('Failed to load required modules. Please refresh the page.');
        return;
    }
    
    // Check if Supabase client is available
    if (!supabase) {
        console.error('init(): Supabase client not available');
        handleAuthError('Unable to connect to database. Please refresh the page.');
        return;
    }
    
    try {
        // Check authentication status
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            console.log('init(): User is authenticated, loading assessments...');
            await loadAssessments();
            setupEventListeners();
        } else {
            console.log('init(): User is not authenticated.');
            handleAuthError('Please log in to access export features.');
        }
    } catch (error) {
        console.error('init(): Error checking authentication:', error);
        handleAuthError('Error connecting to authentication service. Please refresh the page.');
    }
    
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

// Initialize DOM elements
function initializeDOMElements() {
    assessmentSelector = document.getElementById('assessment-selector');
    templateSelector = document.querySelector('.template-selector--quick-select'); // This is now the quick-select container
    mixMatchSelector = document.querySelector('.custom-sections__selector'); // This is for custom sections
    previewReportBtn = document.getElementById('previewReportBtn');
    generateHelpText = document.getElementById('generateHelpText');
    customNotice = document.getElementById('custom-notice');
    modeIndicator = document.querySelector('.export-mode-indicator');
    previewSectionsContainer = document.getElementById('preview-sections');
    previewStatus = document.querySelector('.export-preview-status');
}

// Set default template selection
function setDefaultTemplateSelection() {
    const defaultTemplateCard = document.querySelector('.template-card[data-template="executive"]');
    if (defaultTemplateCard) {
        defaultTemplateCard.classList.add('template-card--selected');
        console.log('Default template (executive) selected');
    }
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

// Theme change event listener
function setupThemeChangeListener() {
    try {
        // Update the selected theme variable when a theme is selected
        window.addEventListener('themeChanged', (e) => {
            console.log(`Switched to theme: ${e.detail.themeName}`);
            selectedTheme = e.detail.themeName;
        });
        console.log('Theme change listener set up successfully');
    } catch (error) {
        console.error('Error setting up theme change listener:', error);
    }
}

// Initialize theme marketplace
function initializeThemeMarketplace() {
    // Check if ThemeMarketplace is available
    if (!ThemeMarketplace) {
        console.error('initializeThemeMarketplace(): ThemeMarketplace module not loaded');
        return;
    }
    
    try {
        // Create a new ThemeMarketplace instance
        const themeMarketplace = new ThemeMarketplace();
        
        // Store the ThemeMarketplace instance globally for access in other functions
        window.themeMarketplace = themeMarketplace;
        
        // Enable the marketplace tab
        const marketplaceTab = document.getElementById('marketplace-tab');
        if (marketplaceTab) {
            marketplaceTab.classList.remove('export-nav__tab--disabled');
            const badge = marketplaceTab.querySelector('.export-nav__badge');
            if (badge) {
                badge.remove();
            }
        }
        
        // Add event listener to initialize marketplace when tab is clicked
        marketplaceTab.addEventListener('click', () => {
            themeMarketplace.initMarketplace();
        });
        
        console.log('Theme marketplace initialized successfully');
    } catch (error) {
        console.error('Error initializing theme marketplace:', error);
    }
}

function handleAuthError(message) {
    console.log('handleAuthError:', message);
    if (assessmentSelector) {
        assessmentSelector.innerHTML = `<p class="text-red-400">${message}</p>`;
    }
    if (previewReportBtn) {
        previewReportBtn.disabled = true;
    }
    if (generateHelpText) {
        generateHelpText.textContent = 'Please log in to enable export features.';
    }
    allAssessments = [];
    selectedAssessmentIds.clear();
    renderAssessmentSelector(); // Clear any rendered items
    updateUI(); // Update overall UI state
}

// --- Data Loading ---
async function loadAssessments() {
    console.log('loadAssessments(): Attempting to fetch assessments...');
    try {
        // Check if Supabase client is available
        if (!supabase) {
            console.error('loadAssessments(): Supabase client not available');
            throw new Error('Database connection not available');
        }
        
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
            if (assessmentSelector) {
                assessmentSelector.innerHTML = '<p class="text-gray-400">No assessments found.</p>';
            }
            updateUI();
        }

    } catch (error) {
        console.error('loadAssessments(): Error loading assessments:', error);
        if (assessmentSelector) {
            assessmentSelector.innerHTML = '<p class="text-red-400">Error loading assessments. Please try again later.</p>';
        }
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
    if (!assessmentSelector) return;
    
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

    console.log('setupEventListeners(): Setting up event listeners...');

    // Assessment selection
    if (assessmentSelector) {
        assessmentSelector.addEventListener('change', (e) => {
            if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
                const assessmentId = e.target.dataset.id;
                if (e.target.checked) {
                    selectedAssessmentIds.add(assessmentId);
                } else {
                    selectedAssessmentIds.delete(assessmentId);
                }
                updateUI();
            }
        });
    }

    // Template selection
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const templateType = card.dataset.template;
            if (templateType) {
                // Remove active class from all template cards
                templateCards.forEach(c => c.classList.remove('template-card--selected'));
                // Add active class to clicked card
                card.classList.add('template-card--selected');
                // Update selected template
                selectedTemplate = templateType;
                currentMode = 'template';
                // Clear custom sections when template is selected
                customSelectedSections.clear();
                // Update custom section checkboxes
                const customCheckboxes = document.querySelectorAll('.custom-sections__toggle input');
                customCheckboxes.forEach(checkbox => checkbox.checked = false);
                console.log('Template selected:', templateType);
                updateUI();
            }
        });
    });

    // Custom sections selection
    const customSectionCheckboxes = document.querySelectorAll('.custom-sections__toggle input');
    customSectionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const sectionId = e.target.dataset.section;
            if (e.target.checked) {
                customSelectedSections.add(sectionId + '-section');
                currentMode = 'custom';
                // Clear template selection when custom sections are selected
                selectedTemplate = null;
                templateCards.forEach(c => c.classList.remove('template-card--selected'));
            } else {
                customSelectedSections.delete(sectionId + '-section');
                if (customSelectedSections.size === 0) {
                    currentMode = 'template';
                    selectedTemplate = 'executive'; // Default back to executive
                }
            }
            console.log('Custom sections:', Array.from(customSelectedSections));
            updateUI();
        });
    });

    // Preview Report button
    if (previewReportBtn) {
        previewReportBtn.addEventListener('click', async () => {
            console.log('Preview Report button clicked');
            
            if (selectedAssessmentIds.size === 0) {
                alert('Please select at least one assessment to preview.');
                return;
            }
            
            try {
                // Get the actual assessment data
                const selectedData = allAssessments.filter(a => selectedAssessmentIds.has(a.id));
                const primaryAssessment = selectedData[0];
                
                // Force premium template and professional theme for preview
                const sectionsToGenerate = ['summary', 'risk_assessment', 'recommendations', 'detailed_analysis'];
                
                // Prepare report data with actual assessment data
                const reportData = {
                    primaryAssessment,
                    selectedData,
                    sectionsToGenerate,
                    selectedTemplate: 'premium', // Always use premium template for preview
                    selectedTheme: 'theme-professional', // Force professional theme
                    timestamp: new Date().toISOString()
                };
                
                console.log('Storing report data for premium preview:', reportData);
                
                // Store data in localStorage for the preview page
                localStorage.setItem('reportData', JSON.stringify(reportData));
                
                // Open preview in a new window/tab for better UX
                window.open('./report-preview.html', '_blank');
            } catch (error) {
                console.error('Error preparing preview data:', error);
                alert('Error preparing report preview. Please try again.');
            }
        });
    }

    // Mark listeners as attached
    listenersAttached = true;
}

// --- UI State Management ---
function updateUI() {
    console.log('updateUI(): Updating UI based on current state.');
    if (!previewReportBtn || !generateHelpText) return;
    
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

    // Update UI elements
    previewReportBtn.disabled = !canGenerate;
    generateHelpText.textContent = helpText;

    // Update preview section
    updatePreviewSection();
}

// Update the preview section with selected template/sections
function updatePreviewSection() {
    if (!previewSectionsContainer || !previewStatus || !modeIndicator) return;
    
    // Clear previous content
    previewSectionsContainer.innerHTML = '';
    
    let sectionsToDisplay = [];
    let estimatedPagesText = '';
    let reportTitleForButton = 'Generate Report';
    
    if (currentMode === 'template' && selectedTemplate) {
        // Display template sections
        sectionsToDisplay = quickTemplates[selectedTemplate].sections.map(sectionId => {
            const displayName = sectionDisplayNames[sectionId.replace('-section', '')] || sectionId;
            return displayName;
        });
        estimatedPagesText = quickTemplates[selectedTemplate].pages;
        modeIndicator.className = 'export-mode-indicator template';
        modeIndicator.innerHTML = '📋 Using Template';
        reportTitleForButton = `📄 Generate ${quickTemplates[selectedTemplate].name}`;
    } else if (currentMode === 'custom' && customSelectedSections.size > 0) {
        // Display custom selected sections
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
    
    // Update button text
    if (previewReportBtn) {
        previewReportBtn.innerHTML = reportTitleForButton;
    }
}

// Export functions for use in other modules
export {
    loadAssessments,
    renderAssessmentSelector,
    updateUI
};

// Also expose loadAssessments to the global scope for direct access
window.loadAssessments = loadAssessments;
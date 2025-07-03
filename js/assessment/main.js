// js/assessment/main.js
// Main entry point for the assessment tool.
// Orchestrates all modules and handles the main application state.

import { initAuth, getCurrentUser, signOut } from './auth.js';
import { 
    initUI, 
    navigateToStep, 
    showError, 
    showSuccess,
    setupEventListeners as setupUIEventListeners,
    showAuthModal,
    closeAuthModal
} from './ui.js';
import { calculateScore } from './scoring.js';
import { fetchToolFromDatabase, saveAssessment } from './api.js';
import { displayResults } from './results.js';

// Global state
let currentAssessmentId = null;
let currentAssessmentData = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initAuth();
        initUI();
        setupEventListeners();
        setupUIEventListeners({
            signOut,
            showAuthModal,
            closeAuthModal
        });
        checkForSharedAssessment();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
});

function setupEventListeners() {
    // Tool search functionality
    const toolSearchInput = document.getElementById('toolSearchInput');
    const searchButton = document.getElementById('searchToolBtn');
    
    if (toolSearchInput && searchButton) {
        searchButton.addEventListener('click', handleToolSearch);
        toolSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleToolSearch();
            }
        });
    }
    
    // Form submission
    const assessmentForm = document.getElementById('assessmentForm');
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetStep = parseInt(e.target.dataset.step);
            if (!isNaN(targetStep)) {
                navigateToStep(targetStep);
            }
        });
    });
    
    // Specific step navigation buttons
    const nextStepBtn1 = document.getElementById('nextStepBtn1');
    if (nextStepBtn1) {
        nextStepBtn1.addEventListener('click', () => {
            navigateToStep(2);
        });
    }
    
    const nextStepBtn2 = document.getElementById('nextStepBtn2');
    if (nextStepBtn2) {
        nextStepBtn2.addEventListener('click', () => {
            navigateToStep(3);
            // Start the assessment process
            setTimeout(() => {
                const formData = new FormData(document.getElementById('assessmentForm'));
                const assessmentData = collectFormData(formData);
                processAssessment(assessmentData);
            }, 500);
        });
    }
    
    const prevStepBtn2 = document.getElementById('prevStepBtn2');
    if (prevStepBtn2) {
        prevStepBtn2.addEventListener('click', () => {
            navigateToStep(1);
        });
    }
    
    // Sign out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    }
    
    // Dashboard button
    const dashboardBtn = document.getElementById('dashboardBtn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
}

async function handleToolSearch() {
    const toolSearchInput = document.getElementById('toolSearchInput');
    const toolName = toolSearchInput.value.trim();
    
    if (!toolName) {
        showError('Please enter a tool name to search');
        return;
    }
    
    try {
        const tool = await fetchToolFromDatabase(toolName);
        if (tool) {
            // Pre-fill form with tool data
            document.getElementById('toolName').value = tool.tool_name;
            document.getElementById('toolDescription').value = tool.description || '';
            document.getElementById('toolVendor').value = tool.vendor || '';
            document.getElementById('toolWebsite').value = tool.website || '';
            
            // If there's a version dropdown, try to select the right option
            const versionSelect = document.getElementById('toolVersion');
            if (versionSelect) {
                // Add "Pro" option if it doesn't exist
                let hasProOption = false;
                for (let i = 0; i < versionSelect.options.length; i++) {
                    if (versionSelect.options[i].value === 'Pro') {
                        hasProOption = true;
                        break;
                    }
                }
                
                if (!hasProOption) {
                    const proOption = document.createElement('option');
                    proOption.value = 'Pro';
                    proOption.textContent = 'Pro';
                    versionSelect.appendChild(proOption);
                }
                
                // Try to select the matching version
                if (tool.version) {
                    for (let i = 0; i < versionSelect.options.length; i++) {
                        if (versionSelect.options[i].value.toLowerCase() === tool.version.toLowerCase()) {
                            versionSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
            
            showSuccess(`Found "${tool.tool_name}" in the database`);
            navigateToStep(2);
        } else {
            showError(`No matching tool found for "${toolName}"`);
        }
    } catch (error) {
        console.error('Error searching for tool:', error);
        showError('Failed to search for tool. Please try again.');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(e.target);
    const assessmentData = {
        tool_name: formData.get('toolName'),
        description: formData.get('toolDescription'),
        vendor: formData.get('toolVendor'),
        website: formData.get('toolWebsite'),
        version: formData.get('toolVersion'),
        data_classification: formData.get('dataClassification'),
        data_storage_location: formData.get('dataStorageLocation'),
        data_retention: formData.get('dataRetention'),
        authentication_method: formData.get('authMethod'),
        user_roles: formData.get('userRoles'),
        admin_controls: formData.get('adminControls'),
        training_data_usage: formData.get('trainingDataUsage'),
        model_transparency: formData.get('modelTransparency'),
        compliance_certifications: formData.get('complianceCerts'),
        dpa_available: formData.get('dpaAvailable'),
        additional_notes: formData.get('additionalNotes')
    };
    
    // Calculate risk score
    const scoringResult = calculateScore(assessmentData);
    
    // Combine all data
    currentAssessmentData = {
        ...assessmentData,
        score: scoringResult.finalScore,
        risk_level: scoringResult.riskLevel,
        categories: scoringResult.categoryScores,
        recommendations: scoringResult.recommendations,
        detailed_assessment: scoringResult.detailedAssessment,
        timestamp: new Date().toISOString(),
        user_id: getCurrentUser()?.id || null,
        source: 'heuristic'
    };
    
    // Display results
    displayResults(currentAssessmentData);
    navigateToStep(4);
}

async function checkForSharedAssessment() {
    const urlParams = new URLSearchParams(window.location.search);
    const assessmentId = urlParams.get('assessment');
    
    if (assessmentId) {
        try {
            const assessment = await fetchAssessmentById(assessmentId);
            if (assessment) {
                currentAssessmentId = assessmentId;
                currentAssessmentData = assessment;
                displayResults(assessment);
                navigateToStep(4);
            }
        } catch (error) {
            console.error('Error fetching shared assessment:', error);
            showError('Failed to load the shared assessment.');
        }
    }
}

async function fetchAssessmentById(id) {
    // Implementation will depend on your API structure
    try {
        const response = await fetch(`/api/assessments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch assessment');
        return await response.json();
    } catch (error) {
        console.error('Error fetching assessment:', error);
        throw error;
    }
}

function collectFormData(formData) {
    return {
        toolName: formData.get('toolName') || document.getElementById('toolName')?.value,
        toolVersion: formData.get('toolVersion') || document.getElementById('toolVersion')?.value,
        toolCategory: formData.get('toolCategory') || document.getElementById('toolCategory')?.value,
        useCase: formData.get('useCase') || document.getElementById('useCase')?.value,
        toolUrl: formData.get('toolUrl') || document.getElementById('toolUrl')?.value,
        additionalContext: formData.get('additionalContext') || document.getElementById('additionalContext')?.value,
        dataClassification: formData.get('dataClassification') || document.querySelector('input[name="dataClassification"]:checked')?.value
    };
}

async function processAssessment(assessmentData) {
    try {
        // Update analysis status
        const statusElement = document.getElementById('analysisStatus');
        if (statusElement) {
            statusElement.textContent = 'Checking database for existing assessment...';
        }
        
        // First try to get from database
        let toolData = await fetchToolFromDatabase(assessmentData);
        
        if (toolData) {
            if (statusElement) {
                statusElement.textContent = 'Found in database! Applying your specific context...';
            }
            currentAssessmentData = toolData;
        } else {
            if (statusElement) {
                statusElement.textContent = 'Calculating heuristic risk score...';
            }
            // Calculate heuristic score
            const scoringResult = calculateScore(assessmentData);
            currentAssessmentData = {
                ...assessmentData,
                ...scoringResult,
                timestamp: new Date().toISOString(),
                source: 'heuristic'
            };
        }
        
        // Display results
        setTimeout(() => {
            displayResults(currentAssessmentData);
            navigateToStep(4);
        }, 1000);
        
    } catch (error) {
        console.error('Error processing assessment:', error);
        showError('Failed to process assessment. Please try again.');
        navigateToStep(1);
    }
}

// Export functions and variables that need to be accessed from other modules
export {
    navigateToStep,
    currentAssessmentId,
    currentAssessmentData
}; 
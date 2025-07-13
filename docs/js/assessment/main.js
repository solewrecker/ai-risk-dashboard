// js/assessment/main.js
// Main entry point for the assessment tool.
// Orchestrates all modules and handles the main application state.

import * as Auth from './auth.js';
import * as UI from './ui.js';
import * as API from './api.js';
import * as Scoring from './scoring.js';
import * as Results from './results.js';

// --- State ---
let currentAssessment = {};

// --- Core Functions ---
async function startAssessment() {
    UI.showStep(3); // Show loading/analysis step
    const formData = getFormData();
    let toolData = await API.getToolFromDatabase(formData);

    if (toolData) {
        console.log('toolData from DB:', toolData); // Debug log
        // Ensure compliance_certifications is always an array of key-value strings
        let certs = [];
        if (Array.isArray(toolData.compliance_certifications)) {
            certs = toolData.compliance_certifications;
        } else if (toolData.compliance_certifications && typeof toolData.compliance_certifications === 'object') {
            certs = Object.entries(toolData.compliance_certifications).map(([key, value]) => `${key}: ${value}`);
        }
        currentAssessment = {
            formData: formData,
            finalScore: toolData.total_score,
            riskLevel: toolData.risk_level,
            source: 'database',
            breakdown: toolData.breakdown,
            recommendations: toolData.recommendations,
            detailedAssessment: toolData.detailed_assessment,
            // Add new fields from ai_tools
            vendor: toolData.vendor || null,
            license_type: toolData.license_type || null,
            primary_use_case: toolData.primary_use_case || null,
            assessed_by: toolData.assessed_by || null,
            confidence: toolData.confidence || null,
            documentation_tier: toolData.documentation_tier || null,
            assessment_notes: toolData.assessment_notes || null,
            azure_permissions: toolData.azure_permissions || null,
            sources: toolData.sources || null,
            // compliance_certifications is handled in API.saveToDatabase for the root level, 
            // but we ensure detailedAssessment.compliance_certifications is present for assessment_data
            compliance_certifications: toolData.compliance_certifications // Keep the object structure from ai_tools for detailedAssessment
        };
    } else {
        // Generate heuristic score
        const baseScore = Scoring.generateHeuristicScore(formData);
        const finalScore = Scoring.applyMultipliers(baseScore, formData);
        currentAssessment = {
            formData: formData,
            finalScore: finalScore,
            riskLevel: Scoring.getRiskLevel(finalScore),
            source: 'heuristic',
            breakdown: { scores: { /* Basic heuristic scores could go here */ } },
            recommendations: Scoring.generateRecommendations(finalScore, formData),
            // For heuristic, create a placeholder for detailedAssessment.compliance_certifications as an object
            detailedAssessment: {
                compliance_certifications: {
                    "HIPAA": { "status": "Not Applicable" },
                    "GDPR": { "status": "Not Applicable" },
                    "SOC_2": { "status": "No" },
                    "ISO_27001": { "status": "No" },
                    "PCI_DSS": { "status": "Not Applicable" },
                    "CCPA": { "status": "Not Applicable" },
                    "FedRAMP": { "status": "Not Applicable" }
                }
            },
            // Initialize other new fields for heuristic assessments
            vendor: null,
            license_type: null,
            primary_use_case: null,
            assessed_by: null,
            confidence: null,
            documentation_tier: null,
            assessment_notes: null,
            azure_permissions: null,
            sources: null
        };
    }

    simulateAnalysisSteps(async () => {
        // --- Auto-save to database ---
        console.log('Automatically saving assessment to database...');
        const { data: savedData, error: saveError } = await API.saveToDatabase(currentAssessment);
        if (saveError) {
            console.error('Auto-save failed:', saveError);
            UI.showMessage(`Could not save assessment to your history: ${saveError.message}`, 'error');
        } else {
            console.log('Auto-save successful:', savedData);
        }

        // --- Show Results ---
        UI.showStep(4);
        Results.displayResults(currentAssessment);
    });
}

// This function is no longer needed with auto-saving
/*
async function handleSaveToDatabase() {
    if (!Auth.getIsAdmin()) {
        UI.showMessage('You must be an admin to save assessments.', 'error');
        return;
    }
    if (!currentAssessment || !currentAssessment.results) {
        UI.showMessage('No assessment results to save.', 'error');
        return;
    }
    
    UI.showMessage('Saving...', 'info');
    const { data, error } = await API.saveToDatabase(currentAssessment);

    if (error) {
        UI.showMessage(`Error: ${error.message}`, 'error');
    } else {
        UI.showMessage('Assessment saved successfully!', 'success');
    }
}
*/

// --- Helper Functions ---
function getFormData() {
    const form = document.getElementById('assessmentForm');
    const formData = new FormData(form);
    return {
        toolName: formData.get('toolName'),
        toolVersion: formData.get('toolVersion'),
        toolCategory: formData.get('toolCategory'),
        dataClassification: formData.get('dataClassification'),
        useCase: formData.get('useCase')
    };
}

function simulateAnalysisSteps(callback) {
    const steps = [
        "Analyzing tool policies...",
        "Assessing data handling protocols...",
        "Evaluating vendor reputation...",
        "Cross-referencing compliance databases...",
        "Finalizing risk score..."
    ];
    let index = 0;
    const interval = setInterval(() => {
        if (index < steps.length) {
            document.getElementById('analysisStatus').textContent = steps[index];
            index++;
        } else {
            clearInterval(interval);
            callback();
        }
    }, 600);
}

// --- Initialization ---
function addEventListeners() {
    // Auth
    document.getElementById('signInTab')?.addEventListener('click', () => Auth.switchAuthTab('signin'));
    document.getElementById('signUpTab')?.addEventListener('click', () => Auth.switchAuthTab('signup'));
    document.getElementById('signInBtn')?.addEventListener('click', Auth.signInUser);
    document.getElementById('signUpBtn')?.addEventListener('click', Auth.signUpUser);
    document.getElementById('closeAuthModalBtn')?.addEventListener('click', Auth.closeAuthModal);

    // Step Navigation
    document.getElementById('nextStepBtn1')?.addEventListener('click', () => UI.nextStep(startAssessment));
    document.getElementById('nextStepBtn2')?.addEventListener('click', () => UI.nextStep(startAssessment));
    document.getElementById('prevStepBtn2')?.addEventListener('click', UI.prevStep);
    
    // Results and Exports
    document.getElementById('newAssessmentBtn')?.addEventListener('click', UI.startNewAssessment);
    
    // The dynamic save button and its handler are no longer needed
    /*
    document.querySelector('.form-content').addEventListener('click', (e) => {
        if (e.target.matches('#saveToDbBtn') || e.target.closest('#saveToDbBtn')) {
            handleSaveToDatabase();
        }
    });
    */

    document.getElementById('exportMainBtn')?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent body click from hiding menu immediately
        // Results.toggleExportMenu(); // REMOVE: No longer exists
    });
    document.getElementById('exportJsonBtn')?.addEventListener('click', Results.exportAssessmentJSON);
    document.getElementById('exportFreePdfBtn')?.addEventListener('click', Results.exportFreePDF);
    document.getElementById('exportPremiumPdfBtn')?.addEventListener('click', Results.exportPremiumPDF);
    // Add other export buttons if they exist, e.g., exportHtmlBtn
    
    // Global listeners
    // REMOVE: Results.hideExportMenu, as it no longer exists
    // document.body.addEventListener('click', (e) => {
    //     if (!document.getElementById('exportMenu')?.contains(e.target) && !document.getElementById('exportMainBtn')?.contains(e.target)) {
    //         Results.hideExportMenu();
    //     }
    // });
}

function initialize() {
    // Event Listeners
    UI.setupEventListeners({
        onStartAssessment: startAssessment,
        onStartNew: UI.startNewAssessment,
        onLogin: Auth.showAuthModal,
        signOut: Auth.signOut,
        showAuthModal: Auth.showAuthModal,
        closeAuthModal: Auth.closeAuthModal
    });

    // Initialize Supabase and handle auth changes
    Auth.initializeSupabase((user) => {
        UI.updateUIForAuth(user);
    });

    UI.showStep(1);
    addEventListeners();
}

document.addEventListener('DOMContentLoaded', initialize); 
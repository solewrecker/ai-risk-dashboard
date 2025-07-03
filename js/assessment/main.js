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
        // Use database data
        currentAssessment = {
            formData: formData,
            finalScore: toolData.total_score,
            riskLevel: toolData.risk_level,
            source: 'database',
            breakdown: toolData.breakdown,
            recommendations: toolData.recommendations
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
            recommendations: Scoring.generateRecommendations(finalScore, formData)
        };
    }

    simulateAnalysisSteps(() => {
        UI.showStep(4);
        Results.displayResults(currentAssessment);
    });
}

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
    document.getElementById('saveToDbBtn')?.addEventListener('click', handleSaveToDatabase);
    document.getElementById('exportMainBtn')?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent body click from hiding menu immediately
        Results.toggleExportMenu();
    });
    document.getElementById('exportJsonBtn')?.addEventListener('click', Results.exportAssessmentJSON);
    document.getElementById('exportFreePdfBtn')?.addEventListener('click', Results.exportFreePDF);
    document.getElementById('exportPremiumPdfBtn')?.addEventListener('click', Results.exportPremiumPDF);
    // Add other export buttons if they exist, e.g., exportHtmlBtn
    
    // Global listeners
    document.body.addEventListener('click', (e) => {
        // Hide export menu if click is outside
        if (!document.getElementById('exportMenu')?.contains(e.target) && !document.getElementById('exportMainBtn')?.contains(e.target)) {
            Results.hideExportMenu();
        }
    });
}

function initialize() {
    Auth.initializeSupabase(UI.updateUIForAuth);
    UI.setupEventListeners({ // For listeners that need to be setup in UI module
        closeAuthModal: Auth.closeAuthModal,
        signOut: Auth.signOut,
        showAuthModal: Auth.showAuthModal
    });
    UI.updateUIForAuth();
    UI.showStep(1);
    addEventListeners();
}

document.addEventListener('DOMContentLoaded', initialize); 
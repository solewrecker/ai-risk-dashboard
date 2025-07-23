// js/assessment/main.js - Fixed version
import * as Auth from './auth.js';
import * as UI from './ui.js';
import * as API from './api.js';
import * as Scoring from './scoring.js';
import * as Results from './results.js';

// --- State ---
let currentAssessment = {};
let analysisInterval = null; // Track interval for cleanup

// --- Core Functions ---
async function startAssessment() {
    try {
        UI.showStep(3); // Show loading/analysis step
        const formData = getFormData();
        
        // Validate form data
        if (!formData.toolName?.trim()) {
            throw new Error('Tool name is required');
        }
        
        let toolData = await API.getToolFromDatabase(formData);

        if (toolData) {
            console.log('toolData from DB (after multipliers applied):', toolData);
            currentAssessment = createDatabaseAssessment(toolData, formData);
        } else {
            currentAssessment = createHeuristicAssessment(formData);
        }

        await simulateAnalysisSteps(async () => {
            try {
                // Auto-save to database
                console.log('Automatically saving assessment to database...');
                console.log('Assessment data being saved:', currentAssessment);
                const { data: savedData, error: saveError } = await API.saveToDatabase(currentAssessment);
                
                if (saveError) {
                    console.error('Auto-save failed:', saveError);
                    if (saveError.code !== 'DUPLICATE_ENTRY') {
                        UI.showMessage(`Could not save assessment: ${saveError.message}`, 'warning');
                    }
                } else {
                    console.log('Auto-save successful:', savedData);
                }

                // Show Results regardless of save status
                UI.showStep(4);
                Results.displayResults(currentAssessment);
            } catch (error) {
                console.error('Error in post-analysis phase:', error);
                UI.showMessage('Assessment completed but could not be saved', 'warning');
                UI.showStep(4);
                Results.displayResults(currentAssessment);
            }
        });

    } catch (error) {
        console.error('Error starting assessment:', error);
        UI.showMessage(`Assessment failed: ${error.message}`, 'error');
        UI.showStep(2); // Go back to form
    }
}

function createDatabaseAssessment(toolData, formData) {
    // toolData.total_score is already the recalculated score from applyClientSideMultipliers
    // toolData.breakdown.scores contains the recalculated individual scores
    
    return {
        formData: formData,
        finalScore: toolData.total_score, // This is the recalculated total score
        riskLevel: Scoring.getRiskLevel(toolData.total_score),
        source: 'database',
        
        // Use the recalculated breakdown from applyClientSideMultipliers
        breakdown: toolData.breakdown || { 
            scores: {
                dataStorage: toolData.data_storage_score || 0,
                trainingUsage: toolData.training_usage_score || 0,
                accessControls: toolData.access_controls_score || 0,
                complianceRisk: toolData.compliance_score || 0,
                vendorTransparency: toolData.vendor_transparency_score || 0
            }
        },
        recommendations: toolData.recommendations || [],
        
        // Additional database fields
        vendor: toolData.vendor || null,
        license_type: toolData.license_type || null,
        primary_use_case: toolData.primary_use_case || null,
        assessed_by: toolData.assessed_by || null,
        confidence: toolData.confidence || null,
        documentation_tier: toolData.documentation_tier || null,
        assessment_notes: toolData.assessment_notes || null,
        azure_permissions: toolData.azure_permissions || null,
        sources: toolData.sources || null,
        summary_and_recommendation: toolData.summary_and_recommendation || null,
        compliance_certifications: toolData.compliance_certifications || [],
        
        // Standardize detailed assessment structure
        detailedAssessment: normalizeDetailedAssessment(toolData.detailed_assessment),
    };
}

function createHeuristicAssessment(formData) {
    const baseScore = Scoring.generateHeuristicScore(formData);
    const finalScore = Scoring.applyMultipliers(baseScore, formData);
    const riskLevel = Scoring.getRiskLevel(finalScore);
    
    return {
        formData: formData,
        finalScore: finalScore,
        riskLevel: riskLevel,
        source: 'heuristic',
        breakdown: { 
            scores: {
                dataStorage: Math.round(finalScore * 0.2),
                trainingUsage: Math.round(finalScore * 0.25),
                accessControls: Math.round(finalScore * 0.2),
                complianceRisk: Math.round(finalScore * 0.2),
                vendorTransparency: Math.round(finalScore * 0.15)
            }
        },
        recommendations: Scoring.generateRecommendations(finalScore, formData),
        
        // Initialize other fields for consistency
        vendor: null,
        license_type: license_type,
        primary_use_case: null,
        assessed_by: 'Heuristic Analysis',
        confidence: 'Medium',
        documentation_tier: 'Basic',
        assessment_notes: 'Generated using heuristic analysis based on tool category and data classification.',
        azure_permissions: null,
        sources: null,
        summary_and_recommendation: generateHeuristicSummary(riskLevel, formData.toolName),
        compliance_certifications: [],
        detailedAssessment: {
            final_risk_score: finalScore,
            final_risk_category: riskLevel,
            assessment_details: {}
        }
    };
}

function normalizeDetailedAssessment(detailedAssessment) {
    if (!detailedAssessment || typeof detailedAssessment !== 'object') {
        return {
            assessment_details: {}
        };
    }
    
    // Ensure consistent structure
    return {
        ...detailedAssessment,
        assessment_details: detailedAssessment.assessment_details || {}
    };
}

function generateHeuristicSummary(riskLevel, toolName) {
    const riskLower = riskLevel.toLowerCase();
    if (riskLower === 'critical' || riskLower === 'high') {
        return `High-risk assessment for ${toolName} based on heuristic analysis. Review required before deployment.`;
    }
    return `${toolName} assessment completed using heuristic analysis. Standard security practices recommended.`;
}

// --- Helper Functions ---
function getFormData() {
    const form = document.getElementById('assessmentForm');
    if (!form) {
        throw new Error('Assessment form not found');
    }
    
    const formData = new FormData(form);
    return {
        toolName: formData.get('toolName')?.trim() || '',
        toolVersion: formData.get('toolVersion')?.trim() || '',
        toolCategory: formData.get('toolCategory') || '',
        dataClassification: formData.get('dataClassification') || '',
        useCase: formData.get('useCase') || 'general'
    };
}

function simulateAnalysisSteps(callback) {
    return new Promise((resolve) => {
        const steps = [
            "Analyzing tool policies...",
            "Assessing data handling protocols...",
            "Evaluating vendor reputation...",
            "Cross-referencing compliance databases...",
            "Finalizing risk score..."
        ];
        
        let index = 0;
        const statusElement = document.getElementById('analysisStatus');
        
        // Clear any existing interval
        if (analysisInterval) {
            clearInterval(analysisInterval);
        }
        
        analysisInterval = setInterval(() => {
            if (index < steps.length && statusElement) {
                statusElement.textContent = steps[index];
                index++;
            } else {
                clearInterval(analysisInterval);
                analysisInterval = null;
                callback().finally(() => resolve());
            }
        }, 600);
    });
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
    
    // Results and Navigation
    document.getElementById('newAssessmentBtn')?.addEventListener('click', UI.startNewAssessment);
}

function initialize() {
    try {
        UI.setupEventListeners({
            onStartAssessment: startAssessment,
            onStartNew: UI.startNewAssessment,
            onLogin: Auth.showAuthModal,
            signOut: Auth.signOut,
            showAuthModal: Auth.showAuthModal,
            closeAuthModal: Auth.closeAuthModal
        });

        Auth.initializeSupabase((user) => {
            UI.updateUIForAuth(user);
        });

        UI.showStep(1);
        addEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (analysisInterval) {
        clearInterval(analysisInterval);
    }
});

document.addEventListener('DOMContentLoaded', initialize);
// js/assessment-detail.js

// Supabase Connection (replace with your details)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loadingState = document.getElementById('loading-state');
const resultsContent = document.getElementById('resultsContent');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('errorMessage');

document.addEventListener('DOMContentLoaded', async () => {
    // Check user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        showError('You must be logged in to view this page.');
        return;
    }

    // Get assessment ID from URL
    const params = new URLSearchParams(window.location.search);
    const assessmentId = params.get('id');

    if (!assessmentId) {
        showError('No assessment ID provided.');
        return;
    }

    loadAssessmentDetails(assessmentId);
});

async function loadAssessmentDetails(assessmentId) {
    loadingState.style.display = 'block';
    resultsContent.style.display = 'none';
    errorState.style.display = 'none';

    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('assessment_data')
            .eq('id', assessmentId)
            .single(); // We expect only one result

        if (error) {
            // RLS will return an error if the user doesn't own the row
            throw new Error('Assessment not found or you do not have permission to view it.');
        }

        if (data && data.assessment_data) {
            // We have the data, now render it
            renderResults(data.assessment_data);
            resultsContent.style.display = 'block';
        } else {
            throw new Error('Assessment data is missing or invalid.');
        }

    } catch (error) {
        showError(error.message);
    } finally {
        loadingState.style.display = 'none';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    loadingState.style.display = 'none';
    resultsContent.style.display = 'none';
    errorState.style.display = 'block';
}


// --- Rendering functions (copied from app.js for now) ---
// In the future, this could be refactored into a shared module.

function renderResults(assessment) {
    const { formData, results } = assessment;
    const riskLevelClass = results.riskLevel.toLowerCase();

    resultsContent.innerHTML = `
        <div class="results-header ${riskLevelClass}">
            <div class="results-score-container">
                <div class="results-score">${results.finalScore}</div>
                <div class="results-score-label">Risk Score</div>
            </div>
            <div class="results-summary">
                <h2>${results.toolName} - ${results.riskLevel} RISK</h2>
                <p>${getRiskSummary(results.riskLevel)}</p>
            </div>
        </div>

        <div class="results-body">
            <h3><i class="fas fa-clipboard-check"></i> Assessment Breakdown</h3>
            <div class="breakdown-grid">
                ${Object.entries(results.breakdown).map(([category, details]) => `
                    <div class="breakdown-item">
                        <h4>${category}</h4>
                        <div class="breakdown-score">${details.score}</div>
                        <p>${details.description}</p>
                    </div>
                `).join('')}
            </div>

            <h3><i class="fas fa-lightbulb"></i> Key Recommendations</h3>
            <ul class="recommendations-list">
                ${results.recommendations.map(rec => `
                    <li class="priority-${rec.priority}">
                        <strong>${rec.title}</strong>
                        <p>${rec.description}</p>
                    </li>
                `).join('')}
            </ul>

            <h3><i class="fas fa-info-circle"></i> Original Inputs</h3>
            <div class="input-summary">
                <p><strong>Tool Version:</strong> ${formData.toolVersion}</p>
                <p><strong>Category:</strong> ${formData.toolCategory}</p>
                <p><strong>Use Case:</strong> ${formData.useCase}</p>
                <p><strong>Data Classification:</strong> ${formData.dataClassification}</p>
            </div>
        </div>
    `;
}

function getRiskSummary(riskLevel) {
    switch (riskLevel) {
        case 'LOW':
            return 'This tool poses a low security risk and is likely safe for enterprise use with standard precautions.';
        case 'MEDIUM':
            return 'This tool presents a moderate security risk. Additional controls and a thorough review are recommended before widespread deployment.';
        case 'HIGH':
            return 'This tool has significant security risks. Use should be restricted, and strong mitigating controls are required.';
        case 'CRITICAL':
            return 'This tool poses a critical security risk and should not be used until a full security review and remediation are complete.';
        default:
            return 'The risk level could not be determined.';
    }
} 
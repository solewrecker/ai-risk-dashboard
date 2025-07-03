// js/assessment/results.js
// Handles rendering the results page and managing export functions.
import { getRiskLevel, generateRecommendations } from './scoring.js';
import { supabase } from './auth.js';

let currentAssessment = null;

export function displayResults(results) {
    currentAssessment = results; // Cache the full results object
    const resultsCard = document.getElementById('resultsCard');
    if (!resultsCard) {
        console.error("Could not find resultsCard element to display results.");
        return;
    }

    const { formData, finalScore, riskLevel, source, recommendations, breakdown } = results;
    const toolName = formData.toolName || 'Unknown Tool';

    document.getElementById('toolNameResults').textContent = toolName;
    document.getElementById('mainScore').textContent = finalScore;
    document.getElementById('riskLevel').textContent = riskLevel;

    const scoreCard = document.querySelector('.main-score-card');
    scoreCard.className = `main-score-card risk-${riskLevel.toLowerCase()}`;
    
    document.getElementById('scoreDescription').innerHTML = getScoreDescription(finalScore, riskLevel, toolName);
    
    const dataSourceEl = document.getElementById('dataSource');
    dataSourceEl.textContent = source === 'database' ? 'Based on Verified Assessment' : 'Based on Heuristic Analysis';
    dataSourceEl.className = `data-source ${source}`;

    renderInsights(breakdown);
    renderRecommendations(recommendations, finalScore, formData);
    renderDetailedBreakdown(breakdown, formData);

    const exportMenu = document.getElementById('exportMenu');
    if (exportMenu) {
        exportMenu.style.visibility = 'visible';
    }
}

function renderInsights(breakdown) {
    const insightsGrid = document.getElementById('insightsGrid');
    const scores = breakdown?.scores || {};
    const insights = [
        { title: 'Data Storage & Security', score: scores.dataStorage, icon: 'database' },
        { title: 'Training Data Usage', score: scores.trainingUsage, icon: 'robot' },
        { title: 'Access Controls', score: scores.accessControls, icon: 'key' },
        { title: 'Compliance & Legal', score: scores.complianceRisk, icon: 'gavel' },
        { title: 'Vendor Transparency', score: scores.vendorTransparency, icon: 'eye' }
    ];

    insightsGrid.innerHTML = insights.map(item => `
        <div class="insight-card risk-${getRiskLevel(item.score ?? 0).toLowerCase()}">
            <div class="insight-icon"><i class="fas fa-${item.icon}"></i></div>
            <div class="insight-content">
                <span class="insight-title">${item.title}</span>
                <span class="insight-value">${item.score ?? 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

function renderRecommendations(recommendations, finalScore, formData) {
    const recommendationsList = document.getElementById('recommendationsList');
    const recs = recommendations || generateRecommendations(finalScore, formData);
    recommendationsList.innerHTML = recs.map(rec => `
        <li class="recommendation-item"><span class="rec-bullet"></span><span class="rec-text">${rec}</span></li>
    `).join('');
}

function renderDetailedBreakdown(breakdown, formData) {
    const detailedBreakdownContainer = document.getElementById('detailedBreakdown');
    if (!breakdown || !breakdown.subScores) {
        detailedBreakdownContainer.innerHTML = '<h3>Detailed Breakdown</h3><p>No detailed breakdown available for this assessment.</p>';
        return;
    }
    
    // This is a simplified version of the detailed breakdown.
    // A full implementation would be much larger.
    let html = '<h3>Detailed Breakdown</h3>';
    for (const [category, subScores] of Object.entries(breakdown.subScores)) {
        html += `<p><strong>${category}:</strong></p><ul>`;
        for (const [key, value] of Object.entries(subScores)) {
            html += `<li>${key}: ${value.note} (Score: ${value.score})</li>`;
        }
        html += `</ul>`;
    }
    detailedBreakdownContainer.innerHTML = html;
}

function getScoreDescription(score, level, toolName) {
    let description = '';
    if (level === 'Critical') description = `<strong>Immediate Action Required.</strong> With a score of ${score}, ${toolName} poses a critical risk.`;
    else if (level === 'High') description = `<strong>Requires Review.</strong> With a score of ${score}, ${toolName} poses a high risk.`;
    else if (level === 'Medium') description = `<strong>Use With Caution.</strong> With a score of ${score}, ${toolName} presents a medium risk.`;
    else description = `<strong>Approved for General Use.</strong> With a score of ${score}, ${toolName} is considered low risk.`;
    return `<p>${description}</p>`;
}

// --- Export Functions ---
export function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    if(menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

export function hideExportMenu() {
    const menu = document.getElementById('exportMenu');
    if (menu) menu.style.display = 'none';
}

export function exportAssessmentJSON() {
    if (!currentAssessment) { alert('No assessment data to export.'); return; }
    const jsonString = JSON.stringify(currentAssessment, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-${currentAssessment.formData.toolName.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function exportFreePDF() {
    alert('Free PDF export functionality is being refactored.');
}

export async function exportPremiumPDF() {
    alert('Premium PDF export functionality is being refactored.');
} 
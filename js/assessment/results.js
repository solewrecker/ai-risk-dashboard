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

    const { formData, finalScore, riskLevel, source, recommendations, breakdown, detailedAssessment } = results;
    const toolName = formData.toolName || 'Unknown Tool';

    document.getElementById('toolNameResults').textContent = toolName;
    document.getElementById('mainScore').textContent = finalScore;
    document.getElementById('riskLevel').textContent = riskLevel;

    const scoreCard = document.querySelector('.main-score-card');
    scoreCard.className = `main-score-card risk-${riskLevel.toLowerCase()}`;
    
    document.getElementById('scoreDescription').querySelector('p').innerHTML = getScoreDescription(finalScore, riskLevel, toolName);
    
    const dataSourceEl = document.getElementById('dataSource');
    dataSourceEl.textContent = source === 'database' ? 'Based on Verified Assessment' : 'Based on Heuristic Analysis';
    dataSourceEl.className = `data-source ${source}`;

    renderInsights(breakdown);
    renderRecommendations(recommendations, finalScore, formData);

    // Prioritize the complete 'detailedAssessment' object, but fall back to 'breakdown.subScores'
    const breakdownData = detailedAssessment || (breakdown ? breakdown.subScores : null);
    renderDetailedBreakdown(breakdownData);

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
    let recs = recommendations || generateRecommendations(finalScore, formData);
    
    // Handle the case where recommendations might be objects or strings
    if (recs && Array.isArray(recs)) {
        recs = recs.map(rec => {
            if (typeof rec === 'string') {
                return rec;
            } else if (typeof rec === 'object' && rec !== null) {
                // Handle recommendation objects - try common property names
                return rec.text || rec.description || rec.title || rec.recommendation || JSON.stringify(rec);
            }
            return String(rec);
        });
    } else if (typeof recs === 'object' && recs !== null) {
        // If recommendations is a single object, convert to array
        recs = [recs.text || recs.description || recs.title || JSON.stringify(recs)];
    } else {
        // Fallback to generating new recommendations
        recs = generateRecommendations(finalScore, formData);
    }
    
    recommendationsList.innerHTML = recs.map(rec => `
        <li class="recommendation-item">
            <span class="rec-bullet">•</span>
            <span class="rec-text">${rec}</span>
        </li>
    `).join('');
}

function renderDetailedBreakdown(breakdownData) {
    const container = document.getElementById('detailedBreakdown');
    const details = breakdownData?.Assessment_details;

    if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
        container.innerHTML = `
            <h3>Detailed Breakdown</h3>
            <p class="no-breakdown">No detailed breakdown available for this assessment.</p>
        `;
        return;
    }

    let html = '<h3>Detailed Breakdown</h3><div class="breakdown-categories">';

    // `categoryName` is e.g., "Data_storage_and_security"
    // `categoryObject` is the object containing sub-points like "Encryption"
    for (const [categoryName, categoryObject] of Object.entries(details)) {
        if (!categoryObject || typeof categoryObject !== 'object') continue;

        html += `
            <div class="breakdown-card">
                <div class="breakdown-header">
                    <h4 class="breakdown-title">${formatCategoryName(categoryName)}</h4>
                </div>
                <div class="breakdown-content">
        `;

        let hasContent = false;
        // `itemName` is e.g., "Encryption"
        // `itemObject` is the final object with { score, note }
        for (const [itemName, itemObject] of Object.entries(categoryObject)) {
            if (itemObject && typeof itemObject === 'object') {
                hasContent = true;
                html += `
                    <div class="breakdown-item">
                        <div class="breakdown-item-header">
                            <span class="breakdown-item-title">${formatItemName(itemName)}</span>
                            <span class="breakdown-score">${itemObject.score ?? 'N/A'}</span>
                        </div>
                        <div class="breakdown-item-note">${itemObject.note || itemObject.description || 'No details available'}</div>
                    </div>
                `;
            }
        }

        if (!hasContent) {
            html += `<div class="breakdown-item-note">No detailed points available for this category.</div>`;
        }

        html += `</div></div>`; // Close content and card
    }

    html += '</div>'; // Close categories
    container.innerHTML = html;
}

// Helper functions for formatting
function formatCategoryName(category) {
    return category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
}

function formatItemName(item) {
    return item
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

function getScoreDescription(score, level, toolName) {
    let description = '';
    const risk = level.toLowerCase();
    if (risk === 'critical') description = `<strong>Immediate Action Required.</strong> With a score of ${score}, ${toolName} poses a critical risk.`;
    else if (risk === 'high') description = `<strong>Requires Review.</strong> With a score of ${score}, ${toolName} poses a high risk.`;
    else if (risk === 'medium') description = `<strong>Use With Caution.</strong> With a score of ${score}, ${toolName} presents a medium risk.`;
    else description = `<strong>Approved for General Use.</strong> With a score of ${score}, ${toolName} is considered low risk.`;
    return description;
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
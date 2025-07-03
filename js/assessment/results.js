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
    const detailedBreakdownContainer = document.getElementById('detailedBreakdown');

    // Determine the correct object to iterate over. Prioritize 'Assessment_details'.
    const categories = breakdownData?.Assessment_details || breakdownData;
    
    if (!categories || typeof categories !== 'object' || Object.keys(categories).length === 0) {
        detailedBreakdownContainer.innerHTML = `
            <h3>Detailed Breakdown</h3>
            <p class="no-breakdown">No detailed breakdown available for this assessment.</p>
        `;
        return;
    }
    
    let html = '<h3>Detailed Breakdown</h3>';
    html += '<div class="breakdown-categories">';

    for (const [category, subScores] of Object.entries(categories)) {
        // Skip any top-level entries that aren't objects (like Tool_name)
        if (typeof subScores !== 'object' || subScores === null) continue;

        html += `
            <div class="breakdown-card">
                <div class="breakdown-header">
                    <h4 class="breakdown-title">${formatCategoryName(category)}</h4>
                </div>
                <div class="breakdown-content">
        `;
        
        if (typeof subScores === 'object' && subScores !== null) {
            for (const [key, value] of Object.entries(subScores)) {
                if (typeof value === 'object' && value !== null) {
                    html += `
                        <div class="breakdown-item">
                            <div class="breakdown-item-header">
                                <span class="breakdown-item-title">${formatItemName(key)}</span>
                                <span class="breakdown-score">${value.score ?? 'N/A'}</span>
                            </div>
                            <div class="breakdown-item-note">${value.note || value.description || 'No details available'}</div>
                        </div>
                    `;
                }
            }
        }
        
        html += `
                </div>
            </div>
        `;
    }
    html += '</div>';
    
    detailedBreakdownContainer.innerHTML = html;
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
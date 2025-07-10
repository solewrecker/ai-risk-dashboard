// js/assessment/results.js
// Handles rendering the results page and managing export functions.
import { getRiskLevel, generateRecommendations } from './scoring.js';
import { supabase } from './auth.js';

let currentAssessment = null;

export function displayResults(results) {
    currentAssessment = results; // Cache the full results object
    const resultsContainer = document.getElementById('resultsContent');
    if (!resultsContainer) {
        console.error("Could not find resultsContent element to display results.");
        return;
    }

    // Clear loading state
    resultsContainer.innerHTML = '';

    const { formData, finalScore, riskLevel, source, recommendations, breakdown, detailedAssessment } = results;
    const toolName = formData.toolName || 'Unknown Tool';
    const toolVersion = formData.toolVersion || '';
    const fullToolName = toolVersion ? `${toolName} (${toolVersion})` : toolName;

    // Build the results HTML
    const resultsHTML = `
        <!-- Main Score Card -->
        <div class="main-score-card risk-${riskLevel.toLowerCase()}">
            <div class="tool-title" style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;">${fullToolName}</div>
            <div class="score-section">
                <div id="mainScore" class="score-number">${finalScore}</div>
                <div id="riskLevel" class="score-label">${riskLevel}</div>
            </div>
            <div id="scoreDescription" class="score-description">
                <p>${getScoreDescription(finalScore, riskLevel, toolName)}</p>
                <div id="dataSource" class="data-source ${source}">
                    ${source === 'database' ? 'Based on Verified Assessment' : 'Based on Heuristic Analysis'}
                </div>
            </div>
        </div>
        
        <!-- Insights Grid -->
        <div id="insightsGrid" class="insights-grid">
            <!-- Insight cards will be populated here -->
        </div>
        
        <!-- Recommendations Section -->
        <div class="recommendations-section">
            <h3>Recommendations</h3>
            <ul id="recommendationsList" class="recommendations-list">
                <!-- Recommendations will be populated here -->
            </ul>
        </div>
        
        <!-- Detailed Breakdown -->
        <div id="detailedBreakdown" class="detailed-breakdown-section">
            <!-- Detailed breakdown will be populated here -->
        </div>
    `;

    resultsContainer.innerHTML = resultsHTML;

    // Now that the DOM is updated, render the components
    renderInsights(breakdown);
    renderRecommendations(recommendations, finalScore, formData);

    // Prioritize the complete 'detailedAssessment' object, but fall back to 'breakdown.subScores'
    const breakdownData = detailedAssessment || (breakdown ? breakdown.subScores : null);
    renderDetailedBreakdown(breakdownData);

    // All old export functions will be removed from this file.
    // New export functionality is handled by docs/js/dashboard/export.js
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
            <div class="insight-icon"><i data-lucide="${item.icon}" class="w-5 h-5"></i></div>
            <div class="insight-content">
                <span class="insight-title">${item.title}</span>
                <span class="insight-value">${item.score ?? 'N/A'}</span>
            </div>
        </div>
    `).join('');
    
    // Reinitialize Lucide icons after dynamic content creation
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
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
    const details = breakdownData?.assessment_details;

    if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
        container.innerHTML = `
            <h3>Detailed Breakdown</h3>
            <p class="no-breakdown">No detailed breakdown available for this assessment.</p>
        `;
        return;
    }

    let html = '<h3>Detailed Breakdown</h3><div class="breakdown-categories">';

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
        for (const [itemName, itemObject] of Object.entries(categoryObject.criteria || categoryObject)) {
            if (itemObject && typeof itemObject === 'object') {
                hasContent = true;
                html += `
                    <div class="breakdown-item">
                        <div class="breakdown-item-header">
                            <span class="breakdown-item-title">${formatItemName(itemName)}</span>
                            <span class="breakdown-score">${itemObject.score ?? 'N/A'}</span>
                        </div>
                        <div class="breakdown-item-note">${itemObject.justification || itemObject.note || itemObject.description || 'No details available'}</div>
                    </div>
                `;
            }
        }

        if (!hasContent) {
            html += `<div class="breakdown-item-note">No detailed points available for this category.</div>`;
        }

        html += `</div></div>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

// Helper functions for formatting
function formatCategoryName(category) {
    // Replace underscores with spaces and title-case each word
    return category
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
        .trim();
}

function formatItemName(item) {
    // Similar humanization for item names
    return item
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
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
// All old export functions will be removed from this file.
// New export functionality is handled by docs/js/dashboard/export.js 
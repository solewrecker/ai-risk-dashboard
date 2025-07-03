// js/assessment/results.js
// Handles rendering the results page and managing export functions.
import { getRiskLevel, generateRecommendations } from './scoring.js';
import { supabase } from './auth.js';

let currentAssessment = null;

export function displayResults(data) {
    if (!data) {
        console.error('No assessment data provided to display results');
        return;
    }

    // Set tool name and basic info
    document.getElementById('resultToolName').textContent = data.tool_name || 'Unknown Tool';
    document.getElementById('resultScore').textContent = data.score || '--';
    
    // Set risk level and approval status
    let riskLevel = '';
    let approvalText = '';
    
    if (data.score >= 80) {
        riskLevel = 'LOW RISK';
        approvalText = `Approved for General Use. With a score of ${data.score}, ${data.tool_name} is considered low risk.`;
    } else if (data.score >= 60) {
        riskLevel = 'MEDIUM RISK';
        approvalText = `Limited Approval. With a score of ${data.score}, ${data.tool_name} requires supervision.`;
    } else {
        riskLevel = 'HIGH RISK';
        approvalText = `Not Approved. With a score of ${data.score}, ${data.tool_name} poses significant security risks.`;
    }
    
    document.getElementById('resultRiskLevel').textContent = riskLevel;
    document.getElementById('resultApproval').textContent = approvalText;
    document.getElementById('resultSummary').textContent = data.summary || `This assessment evaluates the security and compliance risks of ${data.tool_name}.`;
    
    // Set data source indicator
    const sourceElement = document.getElementById('resultSource');
    if (data.source === 'database') {
        sourceElement.textContent = 'Based on Verified Assessment';
        sourceElement.className = 'data-source database';
    } else {
        sourceElement.textContent = 'Based on Heuristic Analysis';
        sourceElement.className = 'data-source heuristic';
    }

    // Display category scores
    displayCategoryScores(data);
    
    // Display recommendations
    displayRecommendations(data.recommendations);
    
    // Display detailed breakdown
    if (data.detailed_assessment) {
        renderDetailedBreakdown(data.detailed_assessment);
    } else {
        document.getElementById('detailedBreakdown').innerHTML = `
            <h3>Detailed Breakdown</h3>
            <p class="no-breakdown">No detailed breakdown available for this assessment.</p>
        `;
    }

    // Set up export button functionality
    setupExportMenu();
}

function displayCategoryScores(data) {
    // Map our category IDs to the data structure keys
    const categoryMap = {
        'dataStorageScore': 'data_storage_and_security',
        'accessControlsScore': 'access_controls',
        'trainingDataScore': 'training_data_usage',
        'complianceScore': 'compliance_and_legal_risk',
        'vendorScore': 'vendor_transparency'
    };
    
    // Get scores from the detailed assessment if available
    const details = data.detailed_assessment?.assessment_details || {};
    
    // Update each category score
    for (const [elementId, categoryKey] of Object.entries(categoryMap)) {
        const scoreElement = document.getElementById(elementId);
        let score = '--';
        
        // Try to get the score from the detailed assessment
        if (details[categoryKey] && details[categoryKey].category_score !== undefined) {
            score = details[categoryKey].category_score;
        }
        // If not found, try the legacy categories object
        else if (data.categories && data.categories[categoryKey] !== undefined) {
            score = data.categories[categoryKey];
        }
        
        scoreElement.textContent = score;
        
        // Update the card style based on score
        const card = scoreElement.closest('.insight-card');
        if (card) {
            updateCardStyle(card, score);
        }
    }
}

function updateCardStyle(card, score) {
    // Remove any existing classes
    card.classList.remove('high-risk', 'medium-risk', 'low-risk');
    
    // Add appropriate class based on score
    if (score < 60) {
        card.classList.add('high-risk');
    } else if (score < 80) {
        card.classList.add('medium-risk');
    } else {
        card.classList.add('low-risk');
    }
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations');
    
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
        container.innerHTML = `
            <li class="recommendation-item">
                <span class="rec-bullet">•</span>
                <span class="rec-text">No specific recommendations available for this tool.</span>
            </li>
        `;
        return;
    }
    
    let html = '';
    recommendations.forEach(rec => {
        if (typeof rec === 'string') {
            html += `
                <li class="recommendation-item">
                    <span class="rec-bullet">•</span>
                    <span class="rec-text">${rec}</span>
                </li>
            `;
        } else if (rec && typeof rec === 'object') {
            // Handle object format recommendations
            const text = rec.text || rec.recommendation || JSON.stringify(rec);
            html += `
                <li class="recommendation-item">
                    <span class="rec-bullet">•</span>
                    <span class="rec-text">${text}</span>
                </li>
            `;
        }
    });
    
    container.innerHTML = html;
}

function formatCategoryName(name) {
    if (!name) return '';
    
    // Replace underscores with spaces
    let formatted = name.replace(/_/g, ' ');
    
    // Capitalize each word
    formatted = formatted.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
    return formatted;
}

function formatItemName(name) {
    if (!name) return '';
    
    // Replace underscores with spaces
    let formatted = name.replace(/_/g, ' ');
    
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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

    // Sort categories in a logical order
    const categoryOrder = [
        'data_storage_and_security',
        'access_controls',
        'training_data_usage',
        'compliance_and_legal_risk',
        'vendor_transparency'
    ];
    
    // Get all categories and sort them according to our preferred order
    const sortedCategories = Object.keys(details).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        return (indexA > -1 ? indexA : 999) - (indexB > -1 ? indexB : 999);
    });

    for (const categoryName of sortedCategories) {
        const categoryObject = details[categoryName];
        if (!categoryObject || typeof categoryObject !== 'object') continue;

        const formattedCategoryName = formatCategoryName(categoryName);
        
        html += `
            <div class="breakdown-card">
                <div class="breakdown-header">
                    <h4 class="breakdown-title" data-category="${formattedCategoryName}">${formattedCategoryName}</h4>
                    <span class="category-score">${categoryObject.category_score || ''}</span>
                </div>
                <div class="breakdown-content">
        `;

        let hasContent = false;
        // Get criteria if it exists, otherwise use the category object itself
        const criteriaItems = categoryObject.criteria || categoryObject;
        
        // Skip category_score and other non-object properties
        const itemEntries = Object.entries(criteriaItems).filter(
            ([key, value]) => typeof value === 'object' && value !== null && key !== 'category_score'
        );

        for (const [itemName, itemObject] of itemEntries) {
            if (itemObject && typeof itemObject === 'object') {
                hasContent = true;
                
                // Determine score level for styling
                let scoreLevel = "medium";
                const score = itemObject.score || 0;
                if (score >= 8) {
                    scoreLevel = "high";
                } else if (score <= 3) {
                    scoreLevel = "low";
                }
                
                html += `
                    <div class="breakdown-item">
                        <div class="breakdown-item-header">
                            <span class="breakdown-item-title">${formatItemName(itemName)}</span>
                            <span class="breakdown-score" data-score="${scoreLevel}">${score}</span>
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

function setupExportMenu() {
    const exportBtn = document.getElementById('exportBtn');
    const exportMenu = document.getElementById('exportMenu');
    
    // Toggle export menu
    exportBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportMenu.classList.toggle('hidden');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
            exportMenu.classList.add('hidden');
        }
    });
    
    // Set up export options
    document.getElementById('exportPDF').addEventListener('click', function(e) {
        e.preventDefault();
        exportMenu.classList.add('hidden');
        exportAsPDF();
    });
    
    document.getElementById('exportCSV').addEventListener('click', function(e) {
        e.preventDefault();
        exportMenu.classList.add('hidden');
        exportAsCSV();
    });
    
    document.getElementById('shareLink').addEventListener('click', function(e) {
        e.preventDefault();
        exportMenu.classList.add('hidden');
        shareAssessmentLink();
    });
    
    // Back button functionality
    document.getElementById('backToAnalysis').addEventListener('click', function() {
        navigateToStep(3);
    });
}

function exportAsPDF() {
    // Implementation for PDF export
    alert('PDF export will be implemented soon!');
}

function exportAsCSV() {
    // Implementation for CSV export
    alert('CSV export will be implemented soon!');
}

function shareAssessmentLink() {
    // Implementation for sharing link
    const shareUrl = window.location.origin + window.location.pathname + '?assessment=' + currentAssessmentId;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                alert('Assessment link copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy link: ', err);
                alert('Failed to copy link. Please copy manually: ' + shareUrl);
            });
    } else {
        // Fallback for browsers that don't support clipboard API
        prompt('Copy this assessment link:', shareUrl);
    }
} 
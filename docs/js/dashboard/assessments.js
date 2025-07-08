// js/dashboard/assessments.js
// Handles fetching, rendering, filtering, and managing assessments. 

import { getIsAdmin, getCurrentUser } from './auth.js';
import { updateDashboardStats, updateProgressTracking } from './gamification.js';

let supabaseClient = null;
let assessments = [];

export function initAssessments(client) {
    supabaseClient = client;
}

export function getAssessments() {
    return assessments;
}

export async function loadAssessments() {
    const user = getCurrentUser();
    const container = document.getElementById('assessment-list');
    const resultsCount = document.getElementById('resultsCount');

    if (!container) return;

    // 1. Show Loader using the correct CSS classes from results.css
    container.innerHTML = `
        <div class="loading-state-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading AI tool database...</p>
        </div>
    `;
    if (resultsCount) {
        resultsCount.textContent = 'Loading assessments...';
    }

    if (!user) {
        console.log('No user found, cannot load assessments.');
        assessments = [];
        renderAssessmentList();
        renderRecentAssessments();
        document.dispatchEvent(new Event('assessmentsUpdated'));
        return;
    }

    try {
        // Query the ai_tools table which contains the detailed assessment data
        const query = supabaseClient
            .from('ai_tools')
            .select('*')
            .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        assessments = data || [];
        console.log(`Loaded ${assessments.length} AI tools`);
        console.log('Sample assessment data:', assessments[0]); // Debug: check data structure
        
        renderAssessmentList();
        renderRecentAssessments();
        document.dispatchEvent(new Event('assessmentsUpdated'));
        
    } catch (error) {
        console.error('Error loading assessments:', error);
        assessments = [];
        // Render error state
        container.innerHTML = `
            <div class="error-state-container">
                <i data-lucide="alert-triangle" class="error-icon"></i>
                <h3 class="error-title">Failed to Load Assessments</h3>
                <p class="error-message">Could not fetch the assessment data. Please try again later.</p>
                <button onclick="loadAssessments()" class="btn btn-secondary">
                    <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i>
                    Retry
                </button>
            </div>
        `;
        
        // Reinitialize Lucide icons after dynamic content creation
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 100);
        }
        if (resultsCount) {
            resultsCount.textContent = 'Error loading assessments';
        }
    }
}

function renderRecentAssessments() {
    const container = document.getElementById('assessmentsList');
    if (!container) return;
    
    const recentAssessments = assessments.slice(0, 5);
    
    if (recentAssessments.length === 0) {
        container.innerHTML = `
            <div class="recent-assessments-empty">
                <p>No assessments yet</p>
                <button class="btn btn-primary mt-2" onclick="window.location.href='index.html'">
                    Create your first assessment →
                </button>
            </div>
        `;
        return;
    }
    
    const assessmentHTML = recentAssessments.map(assessment => {
        const date = new Date(assessment.created_at).toLocaleDateString();
        const riskColors = {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-red-500',
            critical: 'bg-purple-500'
        };
        const riskColor = riskColors[assessment.risk_level?.toLowerCase()] || 'bg-gray-500';
        const scoreColorClass = assessment.total_score >= 75 ? 'risk-critical' : 
                              assessment.total_score >= 50 ? 'risk-high' : 
                              assessment.total_score >= 25 ? 'risk-medium' : 'risk-low';
        
        return `
            <div class="dashboard-summary-assessments__item">
                <div class="dashboard-summary-assessments__content">
                    <div class="dashboard-assessment-icon">
                        <i data-lucide="bot" class="w-6 h-6 text-blue-400"></i>
                        <div class="dashboard-assessment-risk-indicator ${riskColor}"></div>
                    </div>
                    <div class="dashboard-summary-assessments__info">
                        <div class="dashboard-summary-assessments__name">${assessment.name}</div>
                        <div class="dashboard-summary-assessments__meta">
                            <span>${date}</span>
                            <span class="dashboard-assessment-meta-divider">•</span>
                            <span>by ${assessment.created_by || 'Anonymous'}</span>
                            <span class="dashboard-assessment-meta-divider">•</span>
                            <span>${assessment.category || 'General'}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="dashboard-assessment-score">
                        <div class="score-value ${scoreColorClass}">${assessment.total_score}</div>
                        <div class="score-label">Risk Score</div>
                    </div>
                    <div class="dashboard-assessment-actions">
                        <button onclick="viewAssessment('${assessment.id}')" class="action-button" title="View Details">
                            <i data-lucide="chevron-right" class="w-5 h-5"></i>
                        </button>
                        <button class="action-button" title="Export PDF">
                            <i data-lucide="download" class="w-5 h-5"></i>
                        </button>
                        <button class="action-button" title="Share">
                            <i data-lucide="share-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = assessmentHTML;
    
    // Reinitialize Lucide icons after dynamic content creation
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 100);
    }
}

function renderAssessmentList() {
    const container = document.getElementById('assessment-list');
    const resultsCount = document.getElementById('resultsCount');

    if (!container) return;

    // Clear loading state
    container.innerHTML = '';

    if (assessments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No assessments found</h3>
                <p>Start by creating your first AI tool risk assessment.</p>
                <a href="index.html" class="btn btn-primary">Create Assessment</a>
            </div>
        `;
        if (resultsCount) {
            resultsCount.textContent = '0 assessments found';
        }
        return;
    }

    const listContent = assessments.map(assessment => {
        const date = new Date(assessment.created_at).toLocaleDateString();
        
        return `
            <div class="assessments-page__list-item">
                <div class="assessments-page__col assessments-page__col--tool" data-label="Tool">
                    <div class="assessments-page__tool-info">
                        <h4>${assessment.name}</h4>
                        <p>${assessment.category || 'General'}</p>
                    </div>
                </div>
                <div class="assessments-page__col assessments-page__col--score" data-label="Score">
                    <span class="assessments-page__score-badge">${assessment.total_score}/100</span>
                </div>
                <div class="assessments-page__col assessments-page__col--level" data-label="Risk Level">
                    <span class="risk-badge risk-${assessment.risk_level}">${assessment.risk_level?.toUpperCase()}</span>
                </div>
                <div class="assessments-page__col assessments-page__col--date" data-label="Date">
                    <span>${date}</span>
                </div>
                <div class="assessments-page__col assessments-page__col--actions" data-label="Actions">
                    <button class="btn-icon" title="View Details" onclick="toggleAssessmentDetails('${assessment.id}')">
                        <i data-lucide="chevron-down" class="w-5 h-5 assessments-page__expand-icon" id="expand-icon-${assessment.id}"></i>
                    </button>
                    <button class="btn-icon" title="Full Report" onclick="viewAssessment('${assessment.id}')">
                        <i data-lucide="external-link" class="w-5 h-5"></i>
                    </button>
                    ${getIsAdmin() ? `
                        <button class="btn-icon" title="Delete" onclick="deleteAssessment('${assessment.id}')">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="assessments-page__details" id="details-${assessment.id}" style="display: none;">
                ${renderAssessmentDetails(assessment)}
            </div>
        `;
    }).join('');
    
    container.innerHTML = listContent;
    
    // Reinitialize Lucide icons after dynamic content creation
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 100);
    }
    
    if (resultsCount) {
        resultsCount.textContent = `${assessments.length} assessments found`;
    }
}

export function viewAssessment(id) {
    window.location.href = `assessment-detail.html?id=${id}`;
}

// Make functions available globally for onclick handlers
window.toggleAssessmentDetails = toggleAssessmentDetails;
window.viewAssessment = viewAssessment;
window.deleteAssessment = deleteAssessment;

export function toggleAssessmentDetails(id) {
    const detailsElement = document.getElementById(`details-${id}`);
    const expandIcon = document.getElementById(`expand-icon-${id}`);
    
    if (!detailsElement || !expandIcon) return;
    
    const isVisible = detailsElement.style.display !== 'none';
    
    if (isVisible) {
        // Hide details
        detailsElement.style.display = 'none';
        expandIcon.style.transform = 'rotate(0deg)';
        detailsElement.classList.remove('assessments-page__details--expanded');
    } else {
        // Show details
        detailsElement.style.display = 'block';
        expandIcon.style.transform = 'rotate(180deg)';
        detailsElement.classList.add('assessments-page__details--expanded');
        
        // Close other expanded details
        document.querySelectorAll('.assessments-page__details').forEach(el => {
            if (el.id !== `details-${id}`) {
                el.style.display = 'none';
                el.classList.remove('assessments-page__details--expanded');
            }
        });
        document.querySelectorAll('.assessments-page__expand-icon').forEach(icon => {
            if (icon.id !== `expand-icon-${id}`) {
                icon.style.transform = 'rotate(0deg)';
            }
        });
    }
    
    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 100);
    }
}

function renderAssessmentDetails(assessment) {
    // Handle ai_tools table structure
    const detailedAssessment = assessment.detailed_assessment || assessment;
    const recommendations = assessment.recommendations || [];
    
    console.log('Rendering details for:', assessment.name, detailedAssessment); // Debug
    
    if (!detailedAssessment || !detailedAssessment.assessment_details) {
        return `
            <div class="assessments-page__details-content">
                <div class="assessments-page__details-section">
                    <p class="assessments-page__details-error">Assessment details not available for this item.</p>
                    <p class="assessments-page__details-error">Data structure: ${JSON.stringify(Object.keys(assessment), null, 2)}</p>
                </div>
            </div>
        `;
    }
    
    const assessmentDetails = detailedAssessment.assessment_details || {};
    
    return `
        <div class="assessments-page__details-content">
            ${Object.entries(assessmentDetails).map(([categoryKey, categoryData]) => {
                const categoryName = formatCategoryName(categoryKey);
                const score = categoryData.category_score || 0;
                const riskLevel = getRiskLevelFromScore(score);
                
                return `
                    <div class="assessments-page__details-section">
                        <div class="assessments-page__details-header">
                            <h4 class="assessments-page__details-title">${categoryName}</h4>
                            <div class="assessments-page__details-meta">
                                <span class="assessments-page__details-score assessments-page__details-score--${riskLevel}">${score}</span>
                                <span class="assessments-page__details-max">/25</span>
                            </div>
                        </div>
                        <div class="assessments-page__details-body">
                            ${Object.entries(categoryData.criteria || {}).map(([criteriaKey, criteriaData]) => `
                                <div class="assessments-page__details-criteria">
                                    <div class="assessments-page__details-criteria-header">
                                        <span class="assessments-page__details-criteria-name">${formatCriteriaName(criteriaKey)}</span>
                                        <span class="assessments-page__details-criteria-score">${criteriaData.score || 0}</span>
                                    </div>
                                    <p class="assessments-page__details-criteria-desc">${criteriaData.justification || 'No description available'}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
            
            ${recommendations.length > 0 ? `
                <div class="assessments-page__details-section">
                    <div class="assessments-page__details-header">
                        <h4 class="assessments-page__details-title">
                            <i data-lucide="lightbulb" class="w-4 h-4"></i>
                            Key Recommendations
                        </h4>
                    </div>
                    <div class="assessments-page__details-body">
                        ${recommendations.slice(0, 3).map(rec => `
                            <div class="assessments-page__details-recommendation assessments-page__details-recommendation--${rec.priority}">
                                <div class="assessments-page__details-recommendation-header">
                                    <span class="assessments-page__details-recommendation-title">${rec.title}</span>
                                    <span class="assessments-page__details-recommendation-priority">${rec.priority?.toUpperCase()}</span>
                                </div>
                                <p class="assessments-page__details-recommendation-desc">${rec.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function formatCategoryName(categoryKey) {
    const nameMap = {
        'data_storage_and_security': 'Data Storage & Security',
        'training_data_usage': 'Training Data Usage',
        'access_controls': 'Access Controls',
        'compliance_and_legal_risk': 'Compliance & Legal Risk',
        'vendor_transparency': 'Vendor Transparency'
    };
    return nameMap[categoryKey] || categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatCriteriaName(criteriaKey) {
    const nameMap = {
        'geographic_control': 'Geographic Control',
        'encryption_standards': 'Encryption Standards', 
        'data_retention': 'Data Retention',
        'model_training': 'Model Training',
        'data_sharing': 'Data Sharing',
        'admin_management': 'Admin Management',
        'audit_capabilities': 'Audit Capabilities',
        'integration': 'Enterprise Integration',
        'regulatory_violations': 'Regulatory Compliance',
        'data_processing_transparency': 'Data Processing Transparency',
        'documentation_and_support': 'Documentation & Support'
    };
    return nameMap[criteriaKey] || criteriaKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getRiskLevelFromScore(score) {
    if (score >= 20) return 'low';
    if (score >= 15) return 'medium';
    if (score >= 10) return 'high';
    return 'critical';
}

export async function deleteAssessment(id) {
    if (!getIsAdmin()) {
        alert('Access denied. Only admins can delete AI tools from the master database.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('ai_tools')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Refresh the list after deletion
        loadAssessments();
        // Optionally, show a success message
        // showToast('Assessment deleted successfully.');

    } catch (error) {
        console.error('Error deleting assessment:', error);
        // showToast('Error deleting assessment.', 'error');
    }
}

export function filterAssessments() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const riskFilter = document.getElementById('riskFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const sortBy = document.getElementById('sortSelect')?.value || 'date_desc';
    
    let filteredAssessments = [...assessments];
    
    if (searchTerm) {
        filteredAssessments = filteredAssessments.filter(a => a.name.toLowerCase().includes(searchTerm));
    }
    
    if (riskFilter !== 'all') {
        filteredAssessments = filteredAssessments.filter(a => a.risk_level === riskFilter);
    }
    
    if (categoryFilter !== 'all') {
        filteredAssessments = filteredAssessments.filter(a => a.category === categoryFilter);
    }
    
    filteredAssessments.sort((a, b) => {
        switch (sortBy) {
            case 'date_asc': return new Date(a.created_at) - new Date(b.created_at);
            case 'date_desc': return new Date(b.created_at) - new Date(a.created_at);
            case 'score_asc': return (a.total_score || 0) - (b.total_score || 0);
            case 'score_desc': return (b.total_score || 0) - (a.total_score || 0);
            case 'name_asc': return a.name.localeCompare(b.name);
            case 'name_desc': return b.name.localeCompare(a.name);
            default: return 0;
        }
    });
    
    renderFilteredAssessments(filteredAssessments);
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${filteredAssessments.length} assessments found`;
    }
    
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        const hasFilters = searchTerm || riskFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'date_desc';
        clearFiltersBtn.style.display = hasFilters ? 'inline-block' : 'none';
    }
}

function renderFilteredAssessments(filteredData) {
    const container = document.getElementById('assessment-list');
    const resultsCount = document.getElementById('resultsCount');

    if (!container) return;
    container.innerHTML = ''; 

    if (filteredData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No matching assessments found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button onclick="clearAllFilters()" class="btn btn-secondary">Clear Filters</button>
            </div>
        `;
    } else {
        filteredData.forEach(assessment => {
            const item = renderAssessmentItem(assessment);
            container.insertAdjacentHTML('beforeend', item);
        });
        
        // Reinitialize Lucide icons after dynamic content creation
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 100);
        }
    }
    
    if (resultsCount) {
        resultsCount.textContent = `${filteredData.length} of ${assessments.length} assessments shown`;
    }

     // Re-initialize any dynamic components like tooltips if needed
}

export function clearAllFilters() {
    const searchInput = document.getElementById('searchInput');
    const riskFilter = document.getElementById('riskFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    
    if (searchInput) searchInput.value = '';
    if (riskFilter) riskFilter.value = 'all';
    if (categoryFilter) categoryFilter.value = 'all';
    if (sortSelect) sortSelect.value = 'date_desc';
    
    filterAssessments();
}

function renderAssessmentItem(assessment) {
    const riskLevelClass = getRiskLevelClass(assessment.total_score);
    const riskLevelText = getRiskLevelText(assessment.total_score);
    
    return `
        <div class="dashboard-summary-assessments__item">
            <div class="dashboard-summary-assessments__item-content">
                <div class="dashboard-summary-assessments__item-icon">
                    <i data-lucide="${getToolIcon(assessment.category)}" class="w-5 h-5"></i>
                </div>
                <div class="dashboard-summary-assessments__item-info">
                    <h3 class="dashboard-summary-assessments__item-name">${assessment.name}</h3>
                    <p class="dashboard-summary-assessments__item-category">${assessment.category || 'General'}</p>
                </div>
            </div>
            <div class="dashboard-summary-assessments__item-meta">
                <span class="dashboard-summary-assessments__item-risk risk-${riskLevelClass.toLowerCase()}">${riskLevelText}</span>
                <span class="dashboard-summary-assessments__item-score">${assessment.total_score}/100</span>
                <span class="dashboard-summary-assessments__item-date">${formatDate(assessment.created_at)}</span>
                <button class="dashboard-summary-assessments__item-action" onclick="viewAssessment('${assessment.id}')" aria-label="View Details">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
}

function getToolIcon(category) {
    const icons = {
        'Content Generation': 'pen-tool',
        'Code Analysis': 'code',
        'Development': 'laptop',
        'Image Generation': 'image',
        'Productivity': 'check-square',
        'default': 'bot'
    };
    return icons[category] || icons.default;
}

function getRiskLevelClass(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
}

function getRiskLevelText(score) {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    if (score >= 40) return 'High Risk';
    return 'Critical Risk';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Update the assessment list
function updateAssessmentsList(assessments) {
    const container = document.getElementById('assessmentsList');
    if (!container) return;
    
    // Sort by date descending and take the 5 most recent
    const recentAssessments = assessments
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    container.innerHTML = recentAssessments
        .map(assessment => renderAssessmentItem(assessment))
        .join('');
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Search button handler
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            // Implement search functionality
        });
    }

    // Filter button handler
    const filterButton = document.getElementById('filterButton');
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            // Implement filter functionality
        });
    }
}); 
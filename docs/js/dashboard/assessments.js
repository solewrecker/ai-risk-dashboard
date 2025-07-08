// js/dashboard/assessments.js
// Handles fetching, rendering, filtering, and managing assessments. 

import { getIsAdmin, getCurrentUser } from './auth.js';
import { updateDashboardStats, updateProgressTracking } from './gamification.js';

let supabaseClient = null;
let assessments = [];
let expandedAssessmentId = null;

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
        const query = supabaseClient
            .from('assessments')
            .select('*')
            .order('created_at', { ascending: false });

        if (!getIsAdmin()) {
            query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        assessments = data || [];
        console.log(`Loaded ${assessments.length} assessments`);
        
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
        const formData = assessment.assessment_data?.formData || {};
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
                            <span>${formData.toolCategory || assessment.category || 'General'}</span>
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
    const user = getCurrentUser();
    const listContent = assessments.map(assessment => {
        const date = new Date(assessment.created_at).toLocaleDateString();
        const canDelete = getIsAdmin() || (user && assessment.user_id === user.id);
        const isExpanded = expandedAssessmentId === assessment.id;
        const formData = assessment.assessment_data?.formData || {};
        return `
            <div class="assessments-page__list-item" data-assessment-id="${assessment.id}">
                <div class="assessments-page__col assessments-page__col--tool" data-label="Tool">
                    <div class="assessments-page__tool-info">
                        <h4>${assessment.name}</h4>
                        <p>${formData.toolCategory || assessment.category || 'General'}</p>
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
                    <button class="btn-icon" title="View Details" aria-expanded="${isExpanded}" aria-controls="details-${assessment.id}" onclick="toggleAssessmentDetails('${assessment.id}')">
                        <i data-lucide="eye" class="w-5 h-5"></i>
                    </button>
                    ${canDelete ? `
                        <button class="btn-icon" title="Delete" onclick="deleteAssessment('${assessment.id}')">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="assessments-page__details${isExpanded ? ' assessments-page__details--expanded' : ''}" id="details-${assessment.id}" style="display:${isExpanded ? 'block' : 'none'}" role="region" aria-hidden="${!isExpanded}">
                ${isExpanded ? renderAssessmentDetails(assessment) : ''}
            </div>
        `;
    }).join('');
    container.innerHTML = listContent;
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 100);
    }
    if (resultsCount) {
        resultsCount.textContent = `${assessments.length} assessments found`;
    }
}

window.toggleAssessmentDetails = function(id) {
    expandedAssessmentId = expandedAssessmentId === id ? null : id;
    renderAssessmentList();
};

function renderAssessmentDetails(assessment) {
    // Always use the formData from assessment_data
    const formData = assessment.assessment_data?.formData || {};
    const data = assessment.assessment_data || {};
    const breakdown = data.breakdown || data.results?.breakdown || assessment.breakdown || assessment.results?.breakdown || {};
    const recommendations = data.recommendations || data.results?.recommendations || assessment.recommendations || assessment.results?.recommendations || [];
    return `
        <div class="assessments-page__details-content">
            <div class="assessments-page__details-header">
                <strong>Assessment Breakdown</strong>
            </div>
            <div class="assessments-page__details-breakdown">
                ${Object.entries(breakdown).map(([cat, details]) => `
                    <div class="assessments-page__details-breakdown-item">
                        <h5>${cat}</h5>
                        <div class="assessments-page__details-breakdown-score">${details && details.score !== undefined ? details.score : 'N/A'}</div>
                        <p>${details && details.description ? details.description : ''}</p>
                    </div>
                `).join('')}
            </div>
            <div class="assessments-page__details-recommendations">
                <strong>Key Recommendations</strong>
                <ul>
                    ${recommendations.map(rec => `
                        <li><strong>${rec.title}</strong>: ${rec.description}</li>
                    `).join('')}
                </ul>
            </div>
            <div class="assessments-page__details-meta">
                <p><strong>Tool Version:</strong> ${formData.toolVersion || 'Unknown'}</p>
                <p><strong>Category:</strong> ${formData.toolCategory || 'Unknown'}</p>
                <p><strong>Use Case:</strong> ${formData.useCase || 'Unknown'}</p>
                <p><strong>Data Classification:</strong> ${formData.dataClassification || 'Unknown'}</p>
            </div>
            <div class="assessments-page__details-footer">
                <a href="assessment-detail.html?id=${assessment.id}" class="btn btn-secondary">Full Report</a>
            </div>
        </div>
    `;
}

export function viewAssessment(id) {
    window.location.href = `assessment-detail.html?id=${id}`;
}

export async function deleteAssessment(id) {
    const user = getCurrentUser();
    if (!user) {
        alert('You must be logged in to delete assessments.');
        return;
    }
    // Find the assessment to check ownership
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) {
        alert('Assessment not found.');
        return;
    }
    // Allow if admin or owner
    if (!getIsAdmin() && assessment.user_id !== user.id) {
        alert('Access denied. You can only delete your own assessments.');
        return;
    }
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
        return;
    }
    try {
        const { error } = await supabaseClient
            .from('assessments')
            .delete()
            .eq('id', id);
        if (error) throw error;
        loadAssessments();
        // Optionally, show a success message
        // showToast('Assessment deleted successfully.');
    } catch (error) {
        console.error('Error deleting assessment:', error);
        // showToast('Error deleting assessment.', 'error');
    }
}

export function filterAssessmentsLegacy() {
    // Legacy filter function - kept for backward compatibility
    // This uses old element IDs like searchInput, riskFilter, categoryFilter
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

// New filter function that works with the BEM-based multi-select filters
export function filterAssessments(filters = {}) {
    const { 
        searchTerm = '', 
        riskLevels = [], 
        categories = [], 
        dateRanges = [],
        sortBy = 'date_desc'
    } = filters;
    
    let filteredAssessments = [...assessments];
    
    // Apply search filter
    if (searchTerm) {
        filteredAssessments = filteredAssessments.filter(a => 
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.category && a.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    // Apply risk level filter
    if (riskLevels.length > 0) {
        filteredAssessments = filteredAssessments.filter(a => 
            riskLevels.includes(a.risk_level)
        );
    }
    
    // Apply category filter
    if (categories.length > 0) {
        filteredAssessments = filteredAssessments.filter(a => {
            const category = a.category?.toLowerCase() || '';
            return categories.some(cat => {
                switch (cat) {
                    case 'conversational': return category.includes('conversational') || category.includes('chat');
                    case 'image': return category.includes('image') || category.includes('visual');
                    case 'code': return category.includes('code') || category.includes('development');
                    case 'data': return category.includes('data') || category.includes('analysis');
                    default: return category.includes(cat);
                }
            });
        });
    }
    
    // Apply date range filter
    if (dateRanges.length > 0) {
        const now = new Date();
        filteredAssessments = filteredAssessments.filter(a => {
            const assessmentDate = new Date(a.created_at);
            return dateRanges.some(range => {
                switch (range) {
                    case 'today':
                        return assessmentDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return assessmentDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return assessmentDate >= monthAgo;
                    case 'year':
                        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        return assessmentDate >= yearAgo;
                    default:
                        return true;
                }
            });
        });
    }
    
    // Apply sorting
    filteredAssessments.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
            case 'date_desc': 
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
            case 'date_asc': 
                return new Date(a.created_at) - new Date(b.created_at);
            case 'risk-high':
            case 'score_desc': 
                return (b.total_score || 0) - (a.total_score || 0);
            case 'risk-low':
            case 'score_asc': 
                return (a.total_score || 0) - (b.total_score || 0);
            case 'name-az':
            case 'name_asc': 
                return a.name.localeCompare(b.name);
            case 'name-za':
            case 'name_desc': 
                return b.name.localeCompare(a.name);
            default: 
                return new Date(b.created_at) - new Date(a.created_at);
        }
    });
    
    renderFilteredAssessments(filteredAssessments);
    return filteredAssessments;
}

export function clearAllFiltersLegacy() {
    // Legacy clear function - kept for backward compatibility
    const searchInput = document.getElementById('searchInput');
    const riskFilter = document.getElementById('riskFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    
    if (searchInput) searchInput.value = '';
    if (riskFilter) riskFilter.value = 'all';
    if (categoryFilter) categoryFilter.value = 'all';
    if (sortSelect) sortSelect.value = 'date_desc';
    
    filterAssessmentsLegacy();
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

function renderFilteredAssessments(filteredData) {
    const container = document.getElementById('assessment-list') || document.querySelector('.assessment-grid');
    const resultsCount = document.getElementById('resultsCount') || document.querySelector('.dashboard-controls__results-count');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (filteredData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No matching assessments found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button onclick="clearAllFiltersLegacy()" class="btn btn-secondary">Clear Filters</button>
            </div>
        `;
    } else {
        const user = getCurrentUser && getCurrentUser();
        const listContent = filteredData.map(assessment => {
            const date = new Date(assessment.created_at).toLocaleDateString();
            const canDelete = (typeof getIsAdmin === 'function' && getIsAdmin()) || (user && assessment.user_id === user.id);
            const isExpanded = typeof expandedAssessmentId !== 'undefined' && expandedAssessmentId === assessment.id;
            const formData = assessment.assessment_data?.formData || {};
            
            // Check if we're rendering for the new dashboard grid or old list
            if (container.classList.contains('assessment-grid')) {
                // New dashboard grid format
                return `
                    <div class="assessment-item" data-risk="${assessment.risk_level}" data-category="${(assessment.category || '').toLowerCase()}" data-assessment-id="${assessment.id}">
                        <div class="assessment-item__header">
                            <h3 class="assessment-item__title">${assessment.name}</h3>
                            <span class="assessment-item__risk risk-${assessment.risk_level}">${assessment.risk_level?.toUpperCase()}</span>
                        </div>
                        <div class="assessment-item__content">
                            <p class="assessment-item__description">${formData.toolDescription || assessment.description || 'AI risk assessment tool.'}</p>
                            <div class="assessment-item__meta">
                                <span class="assessment-item__date">${date}</span>
                                <span class="assessment-item__category">${formData.toolCategory || assessment.category || 'General'}</span>
                            </div>
                        </div>
                        <div class="assessment-item__actions">
                            <button class="btn btn-sm" onclick="viewAssessment('${assessment.id}')">View Details</button>
                            <button class="btn btn-sm btn-outline">Export</button>
                        </div>
                    </div>
                `;
            } else {
                // Legacy list format
                return `
                    <div class="assessments-page__list-item" data-assessment-id="${assessment.id}">
                        <div class="assessments-page__col assessments-page__col--tool" data-label="Tool">
                            <div class="assessments-page__tool-info">
                                <h4>${assessment.name}</h4>
                                <p>${formData.toolCategory || assessment.category || 'General'}</p>
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
                            <button class="btn-icon" title="View Details" aria-expanded="${isExpanded}" aria-controls="details-${assessment.id}" onclick="toggleAssessmentDetails('${assessment.id}')">
                                <i data-lucide="eye" class="w-5 h-5"></i>
                            </button>
                            ${canDelete ? `
                                <button class="btn-icon" title="Delete" onclick="deleteAssessment('${assessment.id}')">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="assessments-page__details${isExpanded ? ' assessments-page__details--expanded' : ''}" id="details-${assessment.id}" style="display:${isExpanded ? 'block' : 'none'}" role="region" aria-hidden="${!isExpanded}">
                        ${isExpanded ? renderAssessmentDetails(assessment) : ''}
                    </div>
                `;
            }
        }).join('');
        
        container.innerHTML = listContent;
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 100);
        }
    }
    
    if (resultsCount) {
        resultsCount.textContent = `${filteredData.length} of ${assessments.length} assessments shown`;
    }
    
    // Re-initialize any dynamic components like tooltips if needed
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
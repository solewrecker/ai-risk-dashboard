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
    const tableContent = `
        <div class="assessment-table-wrapper">
            <table class="assessment-table">
                <thead class="assessment-table__header">
                    <tr>
                        <th class="assessment-table__cell assessment-table__cell--tool">Tool</th>
                        <th class="assessment-table__cell assessment-table__cell--risk">Risk Level</th>
                        <th class="assessment-table__cell assessment-table__cell--score">Total Score</th>
                        <th class="assessment-table__cell assessment-table__cell--category">Category</th>
                        <th class="assessment-table__cell assessment-table__cell--date">Date</th>
                        <th class="assessment-table__cell assessment-table__cell--actions">Actions</th>
                    </tr>
                </thead>
                <tbody class="assessment-table__body">
                    ${assessments.map(assessment => {
                        const date = new Date(assessment.created_at).toLocaleDateString();
                        const canDelete = getIsAdmin() || (user && assessment.user_id === user.id);
                        const isExpanded = expandedAssessmentId === assessment.id;
                        const formData = assessment.assessment_data?.formData || {};
                        
                        return `
                            <tr class="assessment-table__row ${isExpanded ? 'assessment-table__row--expanded' : ''}" data-assessment-id="${assessment.id}">
                                <td class="assessment-table__cell assessment-table__cell--tool">
                                    <div class="assessment-table__tool-info">
                                        <button class="assessment-table__expand-btn" onclick="toggleAssessmentDetails('${assessment.id}')" title="View Details">
                                            <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4"></i>
                                        </button>
                                        <div class="assessment-table__tool-details">
                                            <div class="assessment-table__tool-name">${assessment.name}</div>
                                            <div class="assessment-table__tool-category">${formData.toolCategory || assessment.category || 'General'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="assessment-table__cell assessment-table__cell--risk">
                                    <span class="assessment-table__risk-badge assessment-table__risk-badge--${(assessment.risk_level || 'medium').toLowerCase().replace(' ', '-')}">${(assessment.risk_level || 'MEDIUM RISK').toUpperCase()}</span>
                                </td>
                                <td class="assessment-table__cell assessment-table__cell--score">
                                    <div class="assessment-table__score-wrapper">
                                        <span class="assessment-table__score score--${getRiskLevelClass(assessment.total_score)}">${assessment.total_score}</span>
                                        <span class="assessment-table__score-max">/100</span>
                                    </div>
                                </td>
                                <td class="assessment-table__cell assessment-table__cell--category">
                                    <span class="assessment-table__category">${formData.toolCategory || assessment.category || 'General'}</span>
                                </td>
                                <td class="assessment-table__cell assessment-table__cell--date">
                                    <span class="assessment-table__date">${date}</span>
                                </td>
                                <td class="assessment-table__cell assessment-table__cell--actions">
                                    <div class="assessment-table__actions">
                                        <button class="assessment-table__action-btn" title="Export PDF">
                                            <i data-lucide="download" class="w-4 h-4"></i>
                                        </button>
                                        ${canDelete ? `
                                            <button class="assessment-table__action-btn assessment-table__action-btn--delete" title="Delete" onclick="deleteAssessment('${assessment.id}')">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                            ${isExpanded ? `
                                <tr class="assessment-table__details-row" data-assessment-id="${assessment.id}">
                                    <td colspan="6" class="assessment-table__details-cell">
                                        ${renderAssessmentDetails(assessment)}
                                    </td>
                                </tr>
                            ` : ''}
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- Scoring Legend -->
        <div class="assessment-legend">
            <h3 class="assessment-legend__title">Scoring Legend</h3>
            <div class="assessment-legend__grid">
                <div class="assessment-legend__item">
                    <div class="assessment-legend__indicator assessment-legend__indicator--low"></div>
                    <span class="assessment-legend__text">Low Risk (0-25)</span>
                </div>
                <div class="assessment-legend__item">
                    <div class="assessment-legend__indicator assessment-legend__indicator--medium"></div>
                    <span class="assessment-legend__text">Medium Risk (26-50)</span>
                </div>
                <div class="assessment-legend__item">
                    <div class="assessment-legend__indicator assessment-legend__indicator--high"></div>
                    <span class="assessment-legend__text">High Risk (51-75)</span>
                </div>
                <div class="assessment-legend__item">
                    <div class="assessment-legend__indicator assessment-legend__indicator--critical"></div>
                    <span class="assessment-legend__text">Critical Risk (76+)</span>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = tableContent;
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
    const data = assessment.assessment_data || {};
    const detailedAssessment = data.detailed_assessment || data.results?.detailed_assessment || {};
    const recommendations = data.recommendations || data.results?.recommendations || [];
    const formData = data.formData || {};
    
    // Parse categories from detailed assessment or create from breakdown data
    const categories = detailedAssessment.categories || [];
    const breakdown = data.breakdown || data.results?.breakdown || {};
    
    // If no categories but we have breakdown data, convert it
    if (categories.length === 0 && Object.keys(breakdown).length > 0) {
        Object.entries(breakdown).forEach(([key, value]) => {
            categories.push({
                category: key,
                score: value.score || 0,
                description: value.description || '',
                metrics: value.metrics || []
            });
        });
    }

    return `
        <div class="assessment-details__expanded-content">
            <!-- Risk Assessment Details Section -->
            <div class="assessment-details__section">
                <h4 class="assessment-details__section-title">Risk Assessment Details</h4>
                <div class="assessment-details__categories-grid">
                    ${categories.map(category => `
                        <div class="assessment-details__category-card">
                            <div class="assessment-details__category-header">
                                <h5 class="assessment-details__category-name">${category.category || 'Unknown Category'}</h5>
                                <div class="assessment-details__category-score-wrapper">
                                    <span class="assessment-details__category-score score--${getRiskLevelClass(category.score || 0)}">${category.score || 0}</span>
                                    <span class="assessment-details__category-max">/25</span>
                                </div>
                            </div>
                            <p class="assessment-details__category-description">${category.description || 'No description available'}</p>
                            ${category.metrics && category.metrics.length > 0 ? `
                                <div class="assessment-details__metrics">
                                    ${category.metrics.map(metric => `
                                        <div class="assessment-details__metric">
                                            <span class="assessment-details__metric-label">${metric.name}:</span>
                                            <span class="assessment-details__metric-value">${metric.value}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Recommendations Section -->
            ${recommendations.length > 0 ? `
                <div class="assessment-details__section">
                    <h4 class="assessment-details__section-title">Recommendations</h4>
                    <div class="assessment-details__recommendations">
                        ${recommendations.map(rec => `
                            <div class="assessment-details__recommendation">
                                <div class="assessment-details__rec-priority assessment-details__rec-priority--${rec.priority || 'medium'}"></div>
                                <div class="assessment-details__rec-content">
                                    <h5 class="assessment-details__rec-title">${rec.title}</h5>
                                    <p class="assessment-details__rec-description">${rec.description}</p>
                                    <div class="assessment-details__rec-meta">
                                        <span class="assessment-details__rec-priority-text">Priority: ${(rec.priority || 'medium').charAt(0).toUpperCase() + (rec.priority || 'medium').slice(1)}</span>
                                        ${rec.category ? `<span class="assessment-details__rec-category">Category: ${rec.category}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Assessment Metadata -->
            <div class="assessment-details__section">
                <h4 class="assessment-details__section-title">Assessment Metadata</h4>
                <div class="assessment-details__metadata-grid">
                    <div class="assessment-details__metadata-item">
                        <span class="assessment-details__metadata-label">Tool Version:</span>
                        <span class="assessment-details__metadata-value">${formData.toolVersion || 'N/A'}</span>
                    </div>
                    <div class="assessment-details__metadata-item">
                        <span class="assessment-details__metadata-label">Category:</span>
                        <span class="assessment-details__metadata-value">${formData.toolCategory || assessment.category || 'N/A'}</span>
                    </div>
                    <div class="assessment-details__metadata-item">
                        <span class="assessment-details__metadata-label">Use Case:</span>
                        <span class="assessment-details__metadata-value">${formData.useCase || 'N/A'}</span>
                    </div>
                    <div class="assessment-details__metadata-item">
                        <span class="assessment-details__metadata-label">Data Classification:</span>
                        <span class="assessment-details__metadata-value">${formData.dataClassification || 'N/A'}</span>
                    </div>
                    <div class="assessment-details__metadata-item">
                        <span class="assessment-details__metadata-label">Assessment Date:</span>
                        <span class="assessment-details__metadata-value">${new Date(assessment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="assessment-details__metadata-item">
                        <span class="assessment-details__metadata-label">Framework Version:</span>
                        <span class="assessment-details__metadata-value">Enterprise AI Risk v2.1</span>
                    </div>
                </div>
                <div class="assessment-details__actions">
                    <a href="assessment-detail.html?id=${assessment.id}" class="btn btn-primary assessment-details__full-report-btn">
                        <i data-lucide="file-text" class="w-4 h-4"></i>
                        View Full Report
                    </a>
                    <button class="btn btn-secondary assessment-details__export-btn" onclick="exportAssessment('${assessment.id}')">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        Export PDF
                    </button>
                </div>
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

// Export for backward compatibility
export const clearAllFilters = clearAllFiltersLegacy;

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
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
    if (!user) {
        console.log('No user found, cannot load assessments.');
        assessments = [];
        renderAssessmentList();
        renderRecentAssessments();
        return;
    }

    try {
        const query = supabaseClient
            .from('assessments')
            .select('*')
            .order('created_at', { ascending: false });

        // Only filter by user_id if the user is not an admin
        if (!getIsAdmin()) {
            query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        assessments = data || [];
        console.log(`Loaded ${assessments.length} assessments`);
        
        renderAssessmentList();
        renderRecentAssessments();
        
    } catch (error) {
        console.error('Error loading assessments:', error);
        assessments = [];
    }
}

function renderRecentAssessments() {
    const container = document.getElementById('assessmentsList');
    if (!container) return;
    
    const recentAssessments = assessments.slice(0, 5);
    
    if (recentAssessments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <p>No assessments yet</p>
                <button onclick="window.location.href='index.html'" class="mt-2 text-blue-400 hover:text-blue-300">
                    Create your first assessment →
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentAssessments.map(assessment => {
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
            <div class="assessment-item">
                <div class="assessment-content">
                    <div class="assessment-icon">
                        <i data-lucide="bot" class="w-6 h-6 text-blue-400"></i>
                        <div class="assessment-risk-indicator ${riskColor}"></div>
                    </div>
                    <div class="assessment-info">
                        <div class="assessment-name">${assessment.name}</div>
                        <div class="assessment-meta">
                            <span>${date}</span>
                            <span class="assessment-meta-divider">•</span>
                            <span>by ${assessment.created_by || 'Anonymous'}</span>
                            <span class="assessment-meta-divider">•</span>
                            <span>${assessment.category || 'General'}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="assessment-score">
                        <div class="score-value ${scoreColorClass}">${assessment.total_score}</div>
                        <div class="score-label">Risk Score</div>
                    </div>
                    <div class="assessment-actions">
                        <button onclick="viewAssessment(${assessment.id})" class="action-button" title="View Details">
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
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderAssessmentList() {
    const container = document.getElementById('assessment-list');
    if (!container) return;
    
    if (assessments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No assessments found</h3>
                <p>Start by creating your first AI tool risk assessment.</p>
                <a href="index.html" class="btn btn-primary">Create Assessment</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = assessments.map(assessment => {
        const date = new Date(assessment.created_at).toLocaleDateString();
        
        return `
            <div class="list-item">
                <div class="list-col-tool">
                    <div class="tool-info">
                        <h4>${assessment.name}</h4>
                        <p>${assessment.category || 'General'}</p>
                    </div>
                </div>
                <div class="list-col-score">
                    <span class="score-badge">${assessment.total_score}/100</span>
                </div>
                <div class="list-col-level">
                    <span class="risk-badge risk-${assessment.risk_level}">${assessment.risk_level?.toUpperCase()}</span>
                </div>
                <div class="list-col-date">
                    <span>${date}</span>
                </div>
                <div class="list-col-actions">
                    <button class="btn-icon" title="View Details" onclick="viewAssessment(${assessment.id})">
                        <i data-lucide="eye"></i>
                    </button>
                    ${getIsAdmin() ? `
                        <button class="btn-icon" title="Delete" onclick="deleteAssessment(${assessment.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${assessments.length} assessments found`;
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

export function viewAssessment(id) {
    window.location.href = `assessment-detail.html?id=${id}`;
}

export async function deleteAssessment(id) {
    if (!getIsAdmin()) {
        alert('Access denied. Admin privileges required.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this assessment?')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('assessments')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadAssessments();
        updateDashboardStats();
        updateProgressTracking();
        
        alert('Assessment deleted successfully');
    } catch (error) {
        console.error('Error deleting assessment:', error);
        alert('Failed to delete assessment: ' + error.message);
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
    if (!container) return;
    
    if (filteredData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No assessments found</h3>
                <p>No assessments match your current filters.</p>
                <button onclick="clearAllFilters()" class="btn btn-primary">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredData.map(assessment => {
        const date = new Date(assessment.created_at).toLocaleDateString();
        
        return `
            <div class="list-item">
                <div class="list-col-tool">
                    <div class="tool-info">
                        <h4>${assessment.name}</h4>
                        <p>${assessment.category || 'General'}</p>
                    </div>
                </div>
                <div class="list-col-score">
                    <span class="score-badge">${assessment.total_score}/100</span>
                </div>
                <div class="list-col-level">
                    <span class="risk-badge risk-${assessment.risk_level}">${assessment.risk_level?.toUpperCase()}</span>
                </div>
                <div class="list-col-date">
                    <span>${date}</span>
                </div>
                <div class="list-col-actions">
                    <button class="btn-icon" title="View Details" onclick="viewAssessment(${assessment.id})">
                        <i data-lucide="eye"></i>
                    </button>
                    ${getIsAdmin() ? `
                        <button class="btn-icon" title="Delete" onclick="deleteAssessment(${assessment.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
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
        <div class="assessment-item">
            <div class="assessment-content">
                <div class="assessment-icon">
                    <i class="fas ${getToolIcon(assessment.category)}"></i>
                </div>
                <div class="assessment-info">
                    <h3 class="assessment-name">${assessment.name}</h3>
                    <p class="assessment-category">${assessment.category}</p>
                </div>
            </div>
            <div class="assessment-meta">
                <span class="risk-level ${riskLevelClass.toLowerCase()}">${riskLevelText}</span>
                <span class="assessment-score">${assessment.total_score}</span>
                <span class="assessment-date">${formatDate(assessment.created_at)}</span>
                <button class="icon-button" onclick="viewAssessment(${assessment.id})" aria-label="More options">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </div>
    `;
}

function getToolIcon(category) {
    const icons = {
        'Content Generation': 'fa-pen-fancy',
        'Code Analysis': 'fa-code',
        'Development': 'fa-laptop-code',
        'Image Generation': 'fa-image',
        'Productivity': 'fa-tasks',
        'default': 'fa-robot'
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
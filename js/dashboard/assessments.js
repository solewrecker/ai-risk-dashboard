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
    const container = document.getElementById('recentAssessmentsList');
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
        
        return `
            <div class="assessment-item bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-all">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                                <i data-lucide="bot" class="w-6 h-6 text-blue-400"></i>
                            </div>
                            <div class="absolute -bottom-1 -right-1 w-4 h-4 ${riskColor} rounded-full border-2 border-gray-800"></div>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <h4 class="font-medium text-white">${assessment.name}</h4>
                                <span class="text-xs px-2 py-0.5 bg-gray-600 rounded-full">${assessment.category || 'General'}</span>
                            </div>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="text-sm text-gray-400">${date}</span>
                                <span class="text-gray-500">•</span>
                                <span class="text-sm text-gray-400">by ${assessment.created_by || 'Anonymous'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <div class="text-2xl font-bold ${assessment.total_score >= 75 ? 'text-red-400' : assessment.total_score >= 50 ? 'text-yellow-400' : 'text-green-400'}">${assessment.total_score}</div>
                            <div class="text-xs text-gray-400">Risk Score</div>
                        </div>
                        <button onclick="viewAssessment(${assessment.id})" class="p-2 hover:bg-gray-600 rounded-lg transition-colors" title="View Details">
                            <i data-lucide="chevron-right" class="w-5 h-5 text-gray-400"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-4 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="flex items-center space-x-1">
                            <i data-lucide="shield-alert" class="w-4 h-4 text-gray-400"></i>
                            <span class="text-sm text-gray-400">${assessment.risk_level?.toUpperCase()}</span>
                        </div>
                        <div class="flex items-center space-x-1">
                            <i data-lucide="check-circle" class="w-4 h-4 text-gray-400"></i>
                            <span class="text-sm text-gray-400">${assessment.controls_implemented || 0} Controls</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="p-1.5 hover:bg-gray-600 rounded transition-colors" title="Export PDF">
                            <i data-lucide="download" class="w-4 h-4 text-gray-400"></i>
                        </button>
                        <button class="p-1.5 hover:bg-gray-600 rounded transition-colors" title="Share">
                            <i data-lucide="share-2" class="w-4 h-4 text-gray-400"></i>
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
// Modern AI Risk Dashboard - Gamified Interface
let supabaseClient = null;
let currentUser = null;
let isAdmin = false;
let assessments = [];
let currentTab = 'dashboard';
let userTier = 'free';

// Supabase configuration
const SUPABASE_URL = "https://ffcjkccdfvkyofzpwgil.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmY2prY2NkZnZreW9mennwd2dpbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMwOTA3MDYzLCJleHAiOjIwNDY0ODMwNjN9.pM4pHFNgQW3N1Lk7JJiPR8Q7cYDUMH4R7BI6CdCJQ_s";

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Modern Dashboard initializing...');
    
    // Initialize Supabase client
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
    
    // Check authentication
    await checkAuth();
    
    // Initialize dashboard
    if (currentUser) {
        await initializeDashboard();
    } else {
        showLoginSection();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Authentication check
async function checkAuth() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            isAdmin = session.user.user_metadata?.role === 'admin';
            userTier = session.user.user_metadata?.tier || 'free';
            
            console.log('User authenticated:', session.user.email, 'Tier:', userTier, 'Admin:', isAdmin);
            return true;
        } else {
            console.log('No active session');
            return false;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

// Initialize dashboard data
async function initializeDashboard() {
    try {
        // Show admin features if user is admin
        if (isAdmin) {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'block';
            });
        }
        
        // Load assessments
        await loadAssessments();
        
        // Update dashboard stats
        updateDashboardStats();
        
        // Update progress tracking
        updateProgressTracking();
        
        // Load achievements
        loadAchievements();
        
        // Update tier badge
        updateTierBadge();
        
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }
}

// Load assessments from database
async function loadAssessments() {
    try {
        const { data, error } = await supabaseClient
            .from('ai_tools')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        assessments = data || [];
        console.log(`Loaded ${assessments.length} assessments`);
        
        // Update assessment list in hidden section
        renderAssessmentList();
        
        // Update recent assessments
        renderRecentAssessments();
        
    } catch (error) {
        console.error('Error loading assessments:', error);
        assessments = [];
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalCount = assessments.length;
    const highRiskCount = assessments.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length;
    const lowRiskCount = assessments.filter(a => a.risk_level === 'low').length;
    const avgScore = totalCount > 0 ? Math.round(assessments.reduce((sum, a) => sum + (a.total_score || 0), 0) / totalCount) : 0;
    
    // Update stat cards
    const totalEl = document.getElementById('totalAssessments');
    const highEl = document.getElementById('highRiskCount');
    const lowEl = document.getElementById('lowRiskCount');
    const avgEl = document.getElementById('avgScore');
    const badgeEl = document.getElementById('assessmentBadge');
    const remainingEl = document.getElementById('remainingText');
    
    if (totalEl) totalEl.textContent = totalCount;
    if (highEl) highEl.textContent = highRiskCount;
    if (lowEl) lowEl.textContent = lowRiskCount;
    if (avgEl) avgEl.textContent = avgScore;
    if (badgeEl) badgeEl.textContent = totalCount;
    
    // Update remaining text
    const remaining = Math.max(0, 25 - totalCount);
    if (remainingEl) remainingEl.textContent = `${remaining} remaining in free tier`;
}

// Update progress tracking
function updateProgressTracking() {
    const totalCount = assessments.length;
    const limit = 25; // Free tier limit
    const percentage = Math.min((totalCount / limit) * 100, 100);
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('assessmentProgress');
    const remainingText = document.getElementById('remainingCount');
    
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${totalCount}/${limit}`;
    if (remainingText) remainingText.textContent = `${Math.max(0, limit - totalCount)} assessments remaining`;
}

// Load and display achievements
function loadAchievements() {
    const totalCount = assessments.length;
    const achievements = [
        {
            id: 'first-assessment',
            name: 'First Steps',
            description: 'Complete your first risk assessment',
            icon: '🎯',
            unlocked: totalCount >= 1,
            progress: Math.min(totalCount, 1),
            requirement: 1
        },
        {
            id: 'power-user',
            name: 'Power User',
            description: 'Complete 25 risk assessments',
            icon: '⚡',
            unlocked: totalCount >= 25,
            progress: Math.min(totalCount, 25),
            requirement: 25
        },
        {
            id: 'risk-expert',
            name: 'Risk Expert',
            description: 'Complete 50 risk assessments',
            icon: '🔍',
            unlocked: totalCount >= 50,
            progress: Math.min(totalCount, 50),
            requirement: 50
        }
    ];
    
    renderAchievements(achievements);
}

// Render achievements list
function renderAchievements(achievements) {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    container.innerHTML = achievements.map(achievement => {
        const progressPercent = (achievement.progress / achievement.requirement) * 100;
        const statusClass = achievement.unlocked ? 'unlocked' : 'in-progress';
        
        return `
            <div class="achievement-card ${statusClass}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="text-lg">${achievement.icon}</span>
                        <h4 class="font-medium">${achievement.name}</h4>
                    </div>
                    ${achievement.unlocked ? '<span class="text-xs text-green-400">✓ Unlocked</span>' : ''}
                </div>
                <p class="text-sm text-gray-400 mb-2">${achievement.description}</p>
                ${!achievement.unlocked ? `
                    <div class="achievement-progress-bar">
                        <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="text-xs text-gray-400">${achievement.progress}/${achievement.requirement}</span>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Render recent assessments
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
        
        return `
            <div class="assessment-item">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        <i data-lucide="bot" class="w-5 h-5 text-blue-400"></i>
                    </div>
                    <div>
                        <h4 class="font-medium">${assessment.name}</h4>
                        <p class="text-sm text-gray-400">${date}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="risk-badge risk-${assessment.risk_level}">${assessment.risk_level?.toUpperCase()}</span>
                    <span class="text-sm font-medium">${assessment.total_score}/100</span>
                    <button onclick="viewAssessment(${assessment.id})" class="p-1 text-gray-400 hover:text-white">
                        <i data-lucide="external-link" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Re-initialize icons for new content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Render full assessment list (for assessments tab)
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
                    ${isAdmin ? `
                        <button class="btn-icon" title="Delete" onclick="deleteAssessment(${assessment.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Update results count
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${assessments.length} assessments found`;
    }
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Update tier badge
function updateTierBadge() {
    const tierBadge = document.getElementById('tierBadge');
    if (tierBadge) {
        const tier = currentUser?.user_metadata?.tier || 'free';
        tierBadge.textContent = tier.toUpperCase();
        tierBadge.className = `text-xs px-2 py-0.5 rounded-full ${
            tier === 'pro' ? 'bg-purple-600' : 'bg-green-600'
        }`;
    }
}

// Tab switching functionality
function switchTab(tabName) {
    currentTab = tabName;
    
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('text-gray-300', 'hover:bg-gray-700');
    });
    
    // Show the active tab content
    const activeContent = document.getElementById(`${tabName}-content`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
    
    // Highlight active tab in sidebar
    const activeBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-300', 'hover:bg-gray-700');
        activeBtn.classList.add('bg-blue-600', 'text-white');
    }

    // Default to dashboard if tab content not found
    if (!activeContent && tabName !== 'dashboard') {
        switchTab('dashboard');
    }
}

// Helper functions
function hideOtherSections(keepVisible) {
    const sections = ['assessments-content'];
    sections.forEach(sectionId => {
        if (!keepVisible.includes(sectionId)) {
            const section = document.getElementById(sectionId);
            if (section) section.classList.add('hidden');
        }
    });
}

function showDashboardContent() {
    hideOtherSections([]);
}

// Event listeners setup
function setupEventListeners() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');

    if (dropzone) {
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-blue-500');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-blue-500');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-blue-500');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect({ target: fileInput });
            }
        });
    }

    if(fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Search and filter functionality for assessments tab
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterAssessments);
    }
    
    const riskFilter = document.getElementById('riskFilter');
    if (riskFilter) {
        riskFilter.addEventListener('change', filterAssessments);
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAssessments);
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', filterAssessments);
    }
}

// Show login section
function showLoginSection() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('loginSection').innerHTML = `
        <div class="login-container">
            <h2>Please Sign In</h2>
            <p>You need to be signed in to access the dashboard.</p>
            <a href="index.html" class="btn btn-primary">Go to Login</a>
        </div>
    `;
}

// View assessment details
function viewAssessment(id) {
    window.location.href = `assessment-detail.html?id=${id}`;
}

// Delete assessment (admin only)
async function deleteAssessment(id) {
    if (!isAdmin) {
        alert('Access denied. Admin privileges required.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this assessment?')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('ai_tools')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        // Reload assessments
        await loadAssessments();
        updateDashboardStats();
        updateProgressTracking();
        
        alert('Assessment deleted successfully');
    } catch (error) {
        console.error('Error deleting assessment:', error);
        alert('Failed to delete assessment: ' + error.message);
    }
}

// Filter assessments functionality
function filterAssessments() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const riskFilter = document.getElementById('riskFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const sortBy = document.getElementById('sortSelect')?.value || 'date_desc';
    
    let filteredAssessments = [...assessments];
    
    // Apply filters
    if (searchTerm) {
        filteredAssessments = filteredAssessments.filter(assessment =>
            assessment.name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (riskFilter !== 'all') {
        filteredAssessments = filteredAssessments.filter(assessment =>
            assessment.risk_level === riskFilter
        );
    }
    
    if (categoryFilter !== 'all') {
        filteredAssessments = filteredAssessments.filter(assessment =>
            assessment.category === categoryFilter
        );
    }
    
    // Apply sorting
    filteredAssessments.sort((a, b) => {
        switch (sortBy) {
            case 'date_asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'date_desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'score_asc':
                return (a.total_score || 0) - (b.total_score || 0);
            case 'score_desc':
                return (b.total_score || 0) - (a.total_score || 0);
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });
    
    // Update display
    renderFilteredAssessments(filteredAssessments);
    
    // Update results count
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${filteredAssessments.length} assessments found`;
    }
    
    // Show/hide clear filters button
    const hasFilters = searchTerm || riskFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'date_desc';
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.style.display = hasFilters ? 'inline-block' : 'none';
    }
}

// Render filtered assessments
function renderFilteredAssessments(filteredAssessments) {
    const container = document.getElementById('assessment-list');
    if (!container) return;
    
    if (filteredAssessments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No assessments found</h3>
                <p>No assessments match your current filters.</p>
                <button onclick="clearAllFilters()" class="btn btn-primary">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredAssessments.map(assessment => {
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
                    ${isAdmin ? `
                        <button class="btn-icon" title="Delete" onclick="deleteAssessment(${assessment.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Clear all filters
function clearAllFilters() {
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

// Banner close functionality
function closeBanner() {
    const banner = document.getElementById('promoBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

// Import functionality
function handleFileSelect(event) {
    const files = event.target.files;
    const fileListContainer = document.getElementById('file-upload-list');
    const importOptions = document.getElementById('importOptions');
    
    if (!files.length) {
        return;
    }

    fileListContainer.innerHTML = ''; // Clear previous list

    Array.from(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'flex items-center justify-between bg-gray-700 p-2 rounded-lg';
        fileItem.innerHTML = `
            <div class="flex items-center space-x-2">
                <i data-lucide="file-text" class="w-5 h-5 text-gray-400"></i>
                <span class="text-sm">${file.name}</span>
            </div>
            <span class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</span>
        `;
        fileListContainer.appendChild(fileItem);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    importOptions.style.display = 'block';
}

async function processImport() {
    if (!isAdmin) {
        alert('Access denied. Admin privileges required.');
        return;
    }
    
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (!files.length) {
        alert('Please select one or more files first.');
        return;
    }

    const uploadPromises = Array.from(files).map(file => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use the correct endpoint for your Supabase function
        return fetch(`${SUPABASE_URL}/functions/v1/upload-assessment`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${supabaseClient.auth.session()?.access_token}`
            }
        });
    });

    try {
        const responses = await Promise.all(uploadPromises);

        let successCount = 0;
        let errorCount = 0;

        for (const response of responses) {
            if (response.ok) {
                successCount++;
            } else {
                errorCount++;
                const errorData = await response.json();
                console.error('Import failed for a file:', errorData.error);
            }
        }

        let alertMessage = '';
        if (successCount > 0) {
            alertMessage += `${successCount} assessment(s) imported successfully!`;
        }
        if (errorCount > 0) {
            alertMessage += `\n${errorCount} assessment(s) failed to import. Check the console for details.`;
        }

        alert(alertMessage);

        // Clear file input and list
        fileInput.value = '';
        document.getElementById('file-upload-list').innerHTML = '';
        document.getElementById('importOptions').style.display = 'none';

        // Reload data and switch back to dashboard
        await loadAssessments();
        updateDashboardStats();
        updateProgressTracking();
        switchTab('dashboard');

    } catch (error) {
        console.error('Import process error:', error);
        alert('A critical error occurred during the import process: ' + error.message);
    }
} 
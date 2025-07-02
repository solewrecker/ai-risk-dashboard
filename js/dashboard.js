// js/dashboard.js

let supabaseClient = null; // Global Supabase client instance
let assessments = []; // Store all assessments for filtering
let filteredAssessments = []; // Store currently filtered assessments
let isAdmin = false; // Use a global variable for the admin state
let userTier = 'free';
let userStats = {
    assessmentCount: 0,
    themesUnlocked: 1,
    currentTheme: 'default'
};

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key
const SUPABASE_URL = "https://ffcjkccdfvkyofzpwgil.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmY2prY2NkZnZreW9mennwd2dpbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMwOTA3MDYzLCJleHAiOjIwNDY0ODMwNjN9.pM4pHFNgQW3N1Lk7JJiPR8Q7cYDUMH4R7BI6CdCJQ_s";

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard script loading...');
    
    if (SUPABASE_URL.includes("YOUR_SUPABASE_URL")) {
        alert('Please configure SUPABASE_URL and SUPABASE_ANON_KEY in js/dashboard.js');
        return;
    }

    // Create a single global Supabase client instance
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
    
    checkAuth();
});

// Check authentication status
async function checkAuth() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            console.log('User authenticated:', session.user.email);
            isAdmin = session.user.user_metadata?.role === 'admin';
            userTier = session.user.user_metadata?.tier || 'free';
            
            updateUIForUser(session.user);
            await loadAssessments();
            await updateUserStats();
        } else {
            console.log('User not authenticated');
            showLogin();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showLogin();
    }
}

// Update UI based on user authentication and tier
function updateUIForUser(user) {
    console.log('Updating UI for user:', user.email, 'Tier:', userTier, 'Admin:', isAdmin);
    
    // Update user badge and navigation
    const tierBadge = document.getElementById('tierBadge');
    const progressTier = document.getElementById('progressTier');
    const upgradePrompt = document.getElementById('upgradePrompt');
    const userMenu = document.getElementById('userMenu');
    
    if (tierBadge) {
        tierBadge.textContent = userTier.toUpperCase();
        tierBadge.className = `tier-badge tier-${userTier}`;
    }
    
    if (progressTier) {
        progressTier.textContent = userTier === 'pro' ? 'Pro Tier' : 'Free Tier';
    }
    
    // Show/hide upgrade prompt
    if (upgradePrompt && userMenu) {
        if (userTier === 'pro') {
            upgradePrompt.style.display = 'none';
            userMenu.innerHTML = `
                <div class="user-info">
                    <span class="user-email">${user.email}</span>
                    <button onclick="logout()" class="btn-logout">Logout</button>
                </div>
            `;
            userMenu.style.display = 'block';
        } else {
            upgradePrompt.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }
    
    // Update pro feature visibility
    updateProFeatureVisibility();
    
    // Show import button for admin users
    const importContainer = document.getElementById('importContainer');
    if (importContainer) {
        importContainer.style.display = isAdmin ? 'block' : 'none';
    }
    
    // Show main content, hide login
    const dashboardContent = document.getElementById('dashboard-section');
    const loginSection = document.getElementById('loginSection');
    
    if (dashboardContent) dashboardContent.style.display = 'block';
    if (loginSection) loginSection.style.display = 'none';
}

// Update pro feature visibility based on user tier
function updateProFeatureVisibility() {
    const proFeatures = document.querySelectorAll('.pro-feature');
    const proOnlyElements = document.querySelectorAll('.pro-only');
    
    proFeatures.forEach(element => {
        if (userTier === 'free') {
            element.classList.add('tier-free');
        } else {
            element.classList.remove('tier-free');
            // Hide the overlay for pro users
            const overlay = element.querySelector('.pro-feature-overlay');
            if (overlay) overlay.style.display = 'none';
        }
    });
    
    proOnlyElements.forEach(element => {
        element.style.display = userTier === 'pro' ? 'block' : 'none';
    });
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) {
                switchSection(section);
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });
    
    // Search and filter controls
    const searchInput = document.getElementById('searchInput');
    const riskFilter = document.getElementById('riskFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    const clearFilters = document.getElementById('clearFilters');
    const resetFilters = document.getElementById('resetFilters');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterAndDisplayAssessments, 300));
    }
    
    if (riskFilter) {
        riskFilter.addEventListener('change', filterAndDisplayAssessments);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndDisplayAssessments);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndDisplayAssessments);
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', clearAllFilters);
    }
    
    if (resetFilters) {
        resetFilters.addEventListener('click', clearAllFilters);
    }
    
    // Import modal
    const importBtn = document.getElementById('importBtn');
    const importModal = document.getElementById('importModal');
    const closeModal = document.querySelector('.close');
    
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            if (importModal) importModal.style.display = 'block';
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (importModal) importModal.style.display = 'none';
        });
    }
    
    // Theme switching
    const themeCards = document.querySelectorAll('.theme-card:not(.locked)');
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            const theme = card.dataset.theme;
            if (theme && !card.classList.contains('locked')) {
                switchTheme(theme);
            }
        });
    });
    
    // Upgrade buttons
    const upgradeButtons = document.querySelectorAll('.btn-upgrade, .btn-upgrade-feature, .btn-unlock-pro');
    upgradeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // For demo purposes - in real app this would open payment modal
            alert('Upgrade to Pro feature coming soon! 🚀');
        });
    });
}

// Switch between sections
function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Handle pro feature sections for free users
    if (userTier === 'free' && ['compare', 'team', 'templates'].includes(sectionName)) {
        // Show FOMO overlay
        console.log('Free user trying to access pro feature:', sectionName);
    }
}

// Switch theme
function switchTheme(themeName) {
    // Update data-theme attribute on body
    document.body.setAttribute('data-theme', themeName);
    
    // Update active theme card
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
        card.classList.remove('active');
        if (card.dataset.theme === themeName) {
            card.classList.add('active');
        }
    });
    
    // Save to user preferences (would be saved to database in real app)
    userStats.currentTheme = themeName;
    console.log('Switched to theme:', themeName);
}

// Update user statistics
async function updateUserStats() {
    // Get actual assessment count from database
    userStats.assessmentCount = assessments.length;
    
    // Update progress displays
    const assessmentCountEl = document.getElementById('assessmentCount');
    const themeCountEl = document.getElementById('themeCount');
    const achievementCountEl = document.getElementById('achievementCount');
    const themeUnlockedEl = document.getElementById('themeUnlocked');
    
    if (assessmentCountEl) {
        assessmentCountEl.textContent = userStats.assessmentCount;
    }
    
    if (themeUnlockedEl) {
        themeUnlockedEl.textContent = calculateUnlockedThemes();
    }
    
    if (themeCountEl) {
        themeCountEl.textContent = `${calculateUnlockedThemes()}/5`;
    }
    
    if (achievementCountEl) {
        achievementCountEl.textContent = `${calculateUnlockedAchievements()}/8`;
    }
    
    // Update theme unlock status
    updateThemeUnlockStatus();
    
    // Update achievement progress
    updateAchievementProgress();
}

// Calculate unlocked themes based on assessment count
function calculateUnlockedThemes() {
    let unlocked = 1; // Default theme always unlocked
    
    if (userTier === 'pro') {
        return 5; // Pro users get all themes
    }
    
    if (userStats.assessmentCount >= 1) unlocked++; // Dark Coder
    if (userStats.assessmentCount >= 10) unlocked++; // Matrix
    if (userStats.assessmentCount >= 50) unlocked++; // Cyberpunk
    // Corporate is Pro-only
    
    return unlocked;
}

// Calculate unlocked achievements
function calculateUnlockedAchievements() {
    let unlocked = 0;
    
    if (userStats.assessmentCount >= 1) unlocked++; // First Assessment
    if (userStats.assessmentCount >= 10) unlocked++; // Risk Detective
    if (userStats.assessmentCount >= 50) unlocked++; // Power User
    
    // Pro-only achievements
    if (userTier === 'pro') {
        unlocked++; // Team Player (example)
    }
    
    return unlocked;
}

// Update theme unlock status
function updateThemeUnlockStatus() {
    const themes = [
        { name: 'darkCoder', requirement: 1 },
        { name: 'matrix', requirement: 10 },
        { name: 'cyberpunk', requirement: 50 }
    ];
    
    themes.forEach(theme => {
        const card = document.querySelector(`[data-theme="${theme.name}"]`);
        if (card) {
            const isUnlocked = userStats.assessmentCount >= theme.requirement || userTier === 'pro';
            
            if (isUnlocked && card.classList.contains('locked')) {
                // Unlock animation could go here
                card.classList.remove('locked');
                card.classList.add('unlocked');
                card.querySelector('.theme-preview').classList.remove('blurred');
                card.querySelector('.theme-status').textContent = '✅ Unlocked';
                card.querySelector('.theme-status').className = 'theme-status unlocked';
                
                // Remove progress bar
                const progress = card.querySelector('.theme-progress');
                if (progress) progress.remove();
            }
            
            // Update progress for locked themes
            if (!isUnlocked) {
                const progressBar = card.querySelector('.progress-fill');
                const progressText = card.querySelector('.progress-text');
                if (progressBar && progressText) {
                    const percentage = (userStats.assessmentCount / theme.requirement) * 100;
                    progressBar.style.width = `${Math.min(percentage, 100)}%`;
                    progressText.textContent = `${userStats.assessmentCount}/${theme.requirement}`;
                }
            }
        }
    });
}

// Update achievement progress
function updateAchievementProgress() {
    // Update "Risk Detective" achievement (10 assessments)
    const riskDetectiveCard = document.querySelector('.achievement-card.in-progress');
    if (riskDetectiveCard) {
        const progressBar = riskDetectiveCard.querySelector('.progress-fill');
        const progressText = riskDetectiveCard.querySelector('.progress-text');
        
        if (progressBar && progressText) {
            const percentage = (userStats.assessmentCount / 10) * 100;
            progressBar.style.width = `${Math.min(percentage, 100)}%`;
            progressText.textContent = `${userStats.assessmentCount}/10`;
        }
        
        // Check if achievement is completed
        if (userStats.assessmentCount >= 10) {
            riskDetectiveCard.classList.remove('in-progress');
            riskDetectiveCard.classList.add('unlocked');
            riskDetectiveCard.innerHTML = `
                <div class="achievement-icon">🔍</div>
                <h4>Risk Detective</h4>
                <p>Complete 10 risk assessments</p>
                <span class="achievement-date">Unlocked just now!</span>
            `;
        }
    }
    
    // Update next achievement progress in sidebar
    const nextAchievementProgress = document.querySelector('.next-achievement .progress-fill');
    const nextAchievementText = document.querySelector('.next-achievement .progress-text');
    
    if (nextAchievementProgress && nextAchievementText) {
        if (userStats.assessmentCount < 10) {
            const percentage = (userStats.assessmentCount / 10) * 100;
            nextAchievementProgress.style.width = `${percentage}%`;
            nextAchievementText.textContent = `${userStats.assessmentCount}/10`;
        } else {
            // Move to next achievement
            const achievementInfo = document.querySelector('.achievement-info');
            if (achievementInfo && userStats.assessmentCount < 50) {
                achievementInfo.innerHTML = `
                    <span class="achievement-name">Power User</span>
                    <span class="achievement-desc">Complete 50 assessments</span>
                `;
                const percentage = (userStats.assessmentCount / 50) * 100;
                nextAchievementProgress.style.width = `${percentage}%`;
                nextAchievementText.textContent = `${userStats.assessmentCount}/50`;
            }
        }
    }
}

// Load assessments from database
async function loadAssessments() {
    try {
        console.log('Loading assessments...');
        const loadingState = document.getElementById('loading-state');
        const assessmentList = document.getElementById('assessment-list');
        
        if (loadingState) loadingState.style.display = 'block';
        if (assessmentList) assessmentList.style.display = 'none';
        
        const { data, error } = await supabaseClient
            .from('ai_tools')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error loading assessments:', error);
            return;
        }
        
        assessments = data || [];
        filteredAssessments = [...assessments];
        
        console.log(`Loaded ${assessments.length} assessments`);
        
        if (loadingState) loadingState.style.display = 'none';
        if (assessmentList) assessmentList.style.display = 'block';
        
        filterAndDisplayAssessments();
        await updateUserStats();
        
    } catch (error) {
        console.error('Error in loadAssessments:', error);
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.innerHTML = `
                <h3>Error loading assessments</h3>
                <p>Please try refreshing the page.</p>
            `;
        }
    }
}

// Filter and display assessments
function filterAndDisplayAssessments() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const riskFilter = document.getElementById('riskFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const sortOption = document.getElementById('sortSelect')?.value || 'date_desc';
    
    // Filter assessments
    filteredAssessments = assessments.filter(assessment => {
        const matchesSearch = !searchTerm || assessment.name.toLowerCase().includes(searchTerm);
        const matchesRisk = riskFilter === 'all' || assessment.risk_level === riskFilter;
        const matchesCategory = categoryFilter === 'all' || assessment.category === categoryFilter;
        
        return matchesSearch && matchesRisk && matchesCategory;
    });
    
    // Sort assessments
    filteredAssessments.sort((a, b) => {
        switch (sortOption) {
            case 'date_asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'date_desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'score_asc':
                return a.total_score - b.total_score;
            case 'score_desc':
                return b.total_score - a.total_score;
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            default:
                return new Date(b.created_at) - new Date(a.created_at);
        }
    });
    
    displayAssessments();
    updateResultsCount();
    updateClearFiltersVisibility();
}

// Display assessments in the list
function displayAssessments() {
    const assessmentList = document.getElementById('assessment-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!assessmentList) return;
    
    if (filteredAssessments.length === 0) {
        assessmentList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    assessmentList.style.display = 'block';
    
    const assessmentItems = filteredAssessments.map(assessment => 
        renderAssessmentItem(assessment)
    ).join('');
    
    assessmentList.innerHTML = assessmentItems;
}

// Render individual assessment item
function renderAssessmentItem(assessment) {
    const date = new Date(assessment.created_at).toLocaleDateString();
    const riskColor = getRiskColor(assessment.risk_level);
    
    let actionsHtml = `
        <button class="btn-icon" title="View Details" onclick="viewAssessment('${assessment.id}')">
            <i class="fas fa-eye"></i>
        </button>
    `;
    
    // Only show delete button to admin users
    if (isAdmin) {
        actionsHtml += `
            <button class="btn-icon btn-delete" title="Delete" onclick="deleteAssessment('${assessment.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }
    
    return `
        <div class="list-item" data-id="${assessment.id}">
            <div class="list-col-tool">
                <strong>${assessment.name}</strong>
                <small>${assessment.category || 'General'}</small>
            </div>
            <div class="list-col-score">
                <span class="score-badge" style="background-color: ${riskColor}">
                    ${assessment.total_score}
                </span>
            </div>
            <div class="list-col-level">
                <span class="risk-level ${assessment.risk_level}">
                    ${assessment.risk_level}
                </span>
            </div>
            <div class="list-col-date">${date}</div>
            <div class="list-col-actions">
                ${actionsHtml}
            </div>
        </div>
    `;
}

// Get risk color
function getRiskColor(riskLevel) {
    switch(riskLevel) {
        case 'low': return '#10b981';
        case 'medium': return '#f59e0b';
        case 'high': return '#ef4444';
        case 'critical': return '#dc2626';
        default: return '#6b7280';
    }
}

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const total = assessments.length;
        const filtered = filteredAssessments.length;
        
        if (filtered === total) {
            resultsCount.textContent = `Showing ${total} assessment${total !== 1 ? 's' : ''}`;
        } else {
            resultsCount.textContent = `Showing ${filtered} of ${total} assessment${total !== 1 ? 's' : ''}`;
        }
    }
}

// Update clear filters visibility
function updateClearFiltersVisibility() {
    const clearFilters = document.getElementById('clearFilters');
    if (!clearFilters) return;
    
    const hasActiveFilters = 
        (document.getElementById('searchInput')?.value || '') !== '' ||
        (document.getElementById('riskFilter')?.value || 'all') !== 'all' ||
        (document.getElementById('categoryFilter')?.value || 'all') !== 'all' ||
        (document.getElementById('sortSelect')?.value || 'date_desc') !== 'date_desc';
    
    clearFilters.style.display = hasActiveFilters ? 'inline-block' : 'none';
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
    
    filterAndDisplayAssessments();
}

// View assessment details
function viewAssessment(id) {
    window.location.href = `assessment-detail.html?id=${id}`;
}

// Delete assessment
async function deleteAssessment(id) {
    if (!isAdmin) {
        alert('Only administrators can delete assessments.');
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
        
        if (error) {
            console.error('Error deleting assessment:', error);
            alert('Error deleting assessment. Please try again.');
            return;
        }
        
        console.log('Assessment deleted successfully');
        await loadAssessments(); // Reload the list
        
    } catch (error) {
        console.error('Error in deleteAssessment:', error);
        alert('Error deleting assessment. Please try again.');
    }
}

// Show login interface
function showLogin() {
    const loginSection = document.getElementById('loginSection');
    const dashboardContent = document.getElementById('dashboard-section');
    
    if (loginSection) {
        loginSection.style.display = 'block';
        loginSection.innerHTML = `
            <div class="login-container">
                <h2>Sign In to AI Risk Pro</h2>
                <p>Access your premium dashboard and gamification features</p>
                <button onclick="signInWithGoogle()" class="btn btn-primary">
                    <i class="fab fa-google"></i> Continue with Google
                </button>
            </div>
        `;
    }
    
    if (dashboardContent) {
        dashboardContent.style.display = 'none';
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard.html'
            }
        });
        
        if (error) {
            console.error('Sign in error:', error);
            alert('Sign in failed. Please try again.');
        }
    } catch (error) {
        console.error('Sign in error:', error);
        alert('Sign in failed. Please try again.');
    }
}

// Logout function
async function logout() {
    try {
        await supabaseClient.auth.signOut();
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Import functionality
function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileName = document.getElementById('fileName');
    const importOptions = document.getElementById('importOptions');
    
    if (file && file.type === 'application/json') {
        fileName.textContent = `Selected: ${file.name}`;
        importOptions.style.display = 'block';
    } else {
        fileName.textContent = 'Please select a valid JSON file.';
        importOptions.style.display = 'none';
    }
}

async function processImport() {
    if (!isAdmin) {
        alert('Only administrators can import assessments.');
        return;
    }
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file first.');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('https://ffcjkccdfvkyofzpwgil.supabase.co/functions/v1/upload-assessment', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseClient.supabaseKey}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Assessment imported successfully!');
            document.getElementById('importModal').style.display = 'none';
            await loadAssessments();
        } else {
            alert(`Import failed: ${result.error}`);
        }
    } catch (error) {
        console.error('Import error:', error);
        alert('Import failed. Please try again.');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 
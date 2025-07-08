// js/dashboard/main.js
// Main entry point for the dashboard application.
// Initializes the app, loads modules, and coordinates everything.

import { initAuth, checkAuth, getIsAdmin, getCurrentUser } from './auth.js';
import { initAssessments, loadAssessments, viewAssessment, deleteAssessment, filterAssessments, clearAllFilters } from './assessments.js';
import { initImport, handleFileSelect, processImport } from './import.js';
import { updateDashboardStats, updateProgressTracking } from './gamification.js';
import { AchievementsManager } from './achievements.js';
import { updateTierBadge, setupEventListeners, closeBanner } from './ui.js';
import { injectDashboardAdminUI } from './admin-ui.js';
import { initCompareTools } from './compare.js';

const SUPABASE_URL = "https://lgybmsziqjdmmxdiyils.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg";

let currentTab = 'dashboard';

// Make functions available globally BEFORE DOMContentLoaded
// so that inline onclick handlers in the HTML can call them immediately
window.switchTab = switchTab;
window.viewAssessment = viewAssessment;
window.deleteAssessment = async (id) => {
    await deleteAssessment(id);
    // Refresh achievements after deletion
    if (window.achievementsManager) {
        window.achievementsManager.updateProgress();
    }
};
window.loadAssessments = loadAssessments;
window.clearAllFilters = clearAllFilters;
window.closeBanner = closeBanner;
window.handleFileSelect = handleFileSelect;
window.processImport = processImport;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Modern Dashboard initializing...');
    
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
    
    initAuth(supabaseClient);
    initAssessments(supabaseClient);
    initImport(supabaseClient);

    const isAuthenticated = await checkAuth();
    
    if (isAuthenticated) {
        await initializeDashboard();
    } else {
        const mainContent = document.querySelector('.flex-1.p-6');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="text-center p-10 bg-gray-800 rounded-lg">
                    <h2 class="text-2xl font-bold mb-2">Access Denied</h2>
                    <p class="text-gray-400">Please sign in to view the dashboard.</p>
                    <a href="index.html" class="mt-4 inline-block bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Sign In
                    </a>
                </div>
            `;
        }
    }
    
    setupEventListeners();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

async function initializeDashboard() {
    try {
        const isAdminUser = getIsAdmin();
        console.log('Is Admin User:', isAdminUser);
        console.log('Current user metadata:', getCurrentUser()?.user_metadata);
        
        if (isAdminUser) {
            console.log('Injecting admin UI...');
            injectDashboardAdminUI();
        } else {
            console.log('User is not admin, skipping admin UI injection');
        }
        
        await loadAssessments();
        
        updateDashboardStats();
        updateProgressTracking();
        
        // Initialize achievements
        window.achievementsManager = new AchievementsManager();
        window.achievementsManager.initialize();

        updateTierBadge();
        
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }
}

export function switchTab(tabName) {
    currentTab = tabName;

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Update nav button styles
    document.querySelectorAll('.dashboard-nav').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show the selected tab content
    const activeContent = document.getElementById(`${tabName}-content`);
    if (activeContent) {
        activeContent.classList.add('active');
    }

    // Highlight the selected nav button
    const activeBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    if (!activeContent && tabName !== 'dashboard') {
        switchTab('dashboard');
    }

    // Initialize Compare Tools tab when activated
    if (tabName === 'compare') {
        // Use getAssessments() or similar to get the data
        if (typeof getAssessments === 'function') {
            initCompareTools(getAssessments());
        } else {
            initCompareTools([]);
        }
    }
}
window.switchTab = switchTab; 
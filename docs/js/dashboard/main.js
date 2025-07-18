// js/dashboard/main.js
// Main entry point for the dashboard application.
// Initializes the app, loads modules, and coordinates everything.

import { checkAuth, getIsAdmin, getCurrentUser } from './auth.js';
import { loadAssessments, viewAssessment, deleteAssessment as deleteAssessmentFn, filterAssessmentsLegacy, clearAllFiltersLegacy } from './assessments.js';
import { initImport, handleFileSelect, processImport } from './import.js';
import { updateDashboardStats, updateProgressTracking } from './gamification.js';
import { AchievementsManager } from './achievements.js';
import { updateTierBadge, setupEventListeners, closeBanner, switchTab } from './ui.js';
import { injectDashboardAdminUI } from './admin-ui.js';
import { initCompareTools, setupEventListeners as setupCompareEventListeners } from './compare.js';

import { supabase } from '../supabase-client.js';

let currentTab = 'dashboard';

// Make functions available globally BEFORE DOMContentLoaded
// so that inline onclick handlers in the HTML can call them immediately
window.switchTab = switchTab;
window.viewAssessment = viewAssessment;
window.deleteAssessment = async (id) => {
    await deleteAssessmentFn(id);
    // Refresh achievements after deletion
    if (window.achievementsManager) {
        window.achievementsManager.updateProgress();
    }
};
window.loadAssessments = loadAssessments;
window.clearAllFilters = clearAllFiltersLegacy; // Use the legacy function
window.clearAllFiltersLegacy = clearAllFiltersLegacy; // Also export with the new name
window.closeBanner = closeBanner;
window.handleFileSelect = handleFileSelect;
window.processImport = processImport;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Modern Dashboard initializing...');
    
        console.log('Supabase client initialized');
    

    initImport(supabase);

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
    setupCompareEventListeners();
    
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
        
        // Wrap loadAssessments in a more robust error handler
        try {
            await loadAssessments();
        } catch (loadError) {
            console.error('Failed to load assessments:', loadError);
            
            // Render a user-friendly error message
            const container = document.getElementById('assessment-list');
            if (container) {
                container.innerHTML = `
                    <div class="error-state-container">
                        <i data-lucide="alert-triangle" class="error-icon text-red-500"></i>
                        <h3 class="error-title text-lg font-bold">Unable to Load Assessments</h3>
                        <p class="error-message text-gray-400">
                            We couldn't retrieve your assessments at this time. 
                            This could be due to a network issue or temporary service disruption.
                        </p>
                        <button onclick="loadAssessments()" class="btn btn-secondary mt-4">
                            <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i>
                            Retry Loading
                        </button>
                    </div>
                `;
                
                // Reinitialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    setTimeout(() => lucide.createIcons(), 100);
                }
            }
        }
        
        updateDashboardStats();
        updateProgressTracking();
        
        // Initialize achievements
        window.achievementsManager = new AchievementsManager();
        window.achievementsManager.initialize();

        updateTierBadge();
        
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        
        // Render a global error state
        const mainContent = document.querySelector('.flex-1.p-6');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="text-center p-10 bg-gray-800 rounded-lg">
                    <h2 class="text-2xl font-bold mb-2 text-red-500">Dashboard Initialization Failed</h2>
                    <p class="text-gray-400">We encountered an unexpected error. Please try refreshing the page.</p>
                    <button onclick="window.location.reload()" class="mt-4 inline-block bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
}
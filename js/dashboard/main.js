// js/dashboard/main.js
// Main entry point for the dashboard application.
// Initializes the app, loads modules, and coordinates everything.

import { initAuth, checkAuth, showLoginSection, getIsAdmin } from './auth.js';
import { initAssessments, loadAssessments, viewAssessment, deleteAssessment, filterAssessments, clearAllFilters } from './assessments.js';
import { initImport, handleFileSelect, processImport } from './import.js';
import { updateDashboardStats, updateProgressTracking, loadAchievements } from './gamification.js';
import { updateTierBadge, switchTab, setupEventListeners, closeBanner } from './ui.js';

const SUPABASE_URL = "https://ffcjkccdfvkyofzpwgil.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmY2prY2NkZnZreW9mennwd2dpbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMwOTA3MDYzLCJleHAiOjIwNDY0ODMwNjN9.pM4pHFNgQW3N1Lk7JJiPR8Q7cYDUMH4R7BI6CdCJQ_s";

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Modern Dashboard initializing...');
    
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');

    // Make functions available globally on the window object
    // so that inline onclick handlers in the HTML can call them.
    window.switchTab = switchTab;
    window.viewAssessment = viewAssessment;
    window.deleteAssessment = deleteAssessment;
    window.clearAllFilters = clearAllFilters;
    window.closeBanner = closeBanner;
    window.handleFileSelect = handleFileSelect;
    window.processImport = processImport;
    
    initAuth(supabaseClient);
    initAssessments(supabaseClient);
    initImport(supabaseClient);

    const isAuthenticated = await checkAuth();
    
    if (isAuthenticated) {
        await initializeDashboard();
    } else {
        showLoginSection();
    }
    
    setupEventListeners();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

async function initializeDashboard() {
    try {
        if (getIsAdmin()) {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'block';
            });
        }
        
        await loadAssessments();
        
        updateDashboardStats();
        updateProgressTracking();
        loadAchievements();
        updateTierBadge();
        
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }
} 
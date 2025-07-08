// js/dashboard/ui.js
// Manages general UI interactions, such as tab switching,
// notifications, and dynamic component updates. 

import { getCurrentUser } from './auth.js';
import { filterAssessments } from './assessments.js';
import { handleFileSelect } from './import.js';

let currentTab = 'dashboard';

export function updateTierBadge() {
    const tierBadge = document.getElementById('tierBadge');
    if (tierBadge) {
        const user = getCurrentUser();
        const tier = user?.user_metadata?.tier || 'free';
        tierBadge.textContent = tier.toUpperCase();
        tierBadge.className = `text-xs px-2 py-0.5 rounded-full ${
            tier === 'pro' ? 'bg-purple-600' : 'bg-green-600'
        }`;
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
}

export function setupEventListeners() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');

    if (dropzone) {
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('active');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('active');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('active');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect({ target: fileInput });
            }
        });
    }

    if(fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
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

export function closeBanner() {
    const banner = document.getElementById('promoBanner');
    if (banner) {
        banner.style.display = 'none';
    }
} 
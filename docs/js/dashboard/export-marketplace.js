// docs/js/dashboard/export-marketplace.js

// Import only what's needed for the marketplace functionality
import ThemeMarketplace from './export/themeMarketplace.js';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    console.log('init(): Starting marketplace initialization...');
    
    // Initialize tab navigation and marketplace
    initializeTabNavigation();
    initializeThemeMarketplace();
}

// Initialize tab navigation
function initializeTabNavigation() {
    const tabs = document.querySelectorAll('.export-nav__tab');
    const tabContents = document.querySelectorAll('.export-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('export-nav__tab--disabled')) {
                return;
            }

            const targetTab = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('export-nav__tab--active'));
            tab.classList.add('export-nav__tab--active');

            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('export-tab-content--active');
            });
            
            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('export-tab-content--active');
            }

            // Re-initialize Lucide icons for new content
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });
}

// Initialize theme marketplace
function initializeThemeMarketplace() {
    // Create a new ThemeMarketplace instance
    const themeMarketplace = new ThemeMarketplace();
    
    // Store the ThemeMarketplace instance globally for access in other functions
    window.themeMarketplace = themeMarketplace;
    
    // Add event listener to initialize marketplace when tab is clicked
    const marketplaceTab = document.getElementById('marketplace-tab');
    if (marketplaceTab) {
        marketplaceTab.addEventListener('click', () => {
            themeMarketplace.initMarketplace();
        });
    }
}
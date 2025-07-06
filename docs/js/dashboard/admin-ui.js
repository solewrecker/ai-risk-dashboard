/**
 * Injects admin-only UI components into the dashboard.
 * This function should only be called after verifying the user is an admin.
 */
export function injectDashboardAdminUI() {
    const navMenu = document.querySelector('nav.space-y-2');
    if (!navMenu) {
        console.error("Admin UI injection point not found. Looking for nav.space-y-2");
        console.log("Available nav elements:", document.querySelectorAll('nav'));
        return;
    }

    // Check if the button already exists to prevent duplicates
    if (document.getElementById('importNavBtn')) {
        return;
    }

    const adminButtonHTML = `
        <button id="importNavBtn" onclick="switchTab('import')" class="dashboard-nav">
            <div class="dashboard-nav__content">
                <i data-lucide="upload" class="w-5 h-5"></i>
                <span class="dashboard-nav__text">Upload Tool Assessment</span>
            </div>
        </button>
    `;

    navMenu.insertAdjacentHTML('beforeend', adminButtonHTML);

    // Re-initialize icons if necessary
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
} 
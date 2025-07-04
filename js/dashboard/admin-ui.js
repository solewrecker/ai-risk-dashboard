/**
 * Injects admin-only UI components into the dashboard.
 * This function should only be called after verifying the user is an admin.
 */
export function injectDashboardAdminUI() {
    const navMenu = document.querySelector('.w-64 .space-y-2');
    if (!navMenu) {
        console.error("Admin UI injection point not found.");
        return;
    }

    // Check if the button already exists to prevent duplicates
    if (document.getElementById('importNavBtn')) {
        return;
    }

    const adminButtonHTML = `
        <button id="importNavBtn" class="nav-btn w-full flex items-center justify-between p-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700">
            <div class="flex items-center space-x-3">
                <i data-lucide="upload" class="w-5 h-5"></i>
                <span>Upload Tool Assessment</span>
            </div>
        </button>
    `;

    navMenu.insertAdjacentHTML('beforeend', adminButtonHTML);

    // Attach the event listener programmatically
    document.getElementById('importNavBtn').addEventListener('click', () => {
        // Assuming switchTab is globally available as per main.js
        if (window.switchTab) {
            window.switchTab('import');
        }
    });

    // Re-initialize icons if necessary
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
} 
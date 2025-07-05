// js/dashboard/import.js
// Manages the file import functionality, including drag-and-drop
// and processing uploaded files.
import { getIsAdmin } from './auth.js';
import { loadAssessments } from './assessments.js';
import { updateDashboardStats, updateProgressTracking } from './gamification.js';
import { switchTab } from './ui.js';

let supabaseClient = null;
const SUPABASE_URL = "https://lgybmsziqjdmmxdiyils.supabase.co";

export function initImport(client) {
    supabaseClient = client;
}

export function handleFileSelect(event) {
    const files = event.target.files;
    const fileListContainer = document.getElementById('file-upload-list');
    const importOptions = document.getElementById('importOptions');
    
    if (!files.length) {
        return;
    }

    fileListContainer.innerHTML = ''; // Clear previous list

    Array.from(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'admin-upload-tool__file-list-item';
        fileItem.innerHTML = `
          <div class="admin-upload-tool__file-list-item-content flex items-center space-x-2">
            <i data-lucide="file-text" class="w-5 h-5 text-gray-400"></i>
            <span class="text-sm">${file.name}</span>
          </div>
          <span class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</span>
        `;
        fileListContainer.appendChild(fileItem);
    });
}

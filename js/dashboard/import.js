// js/dashboard/import.js
// Manages the file import functionality, including drag-and-drop
// and processing uploaded files.
import { getIsAdmin } from './auth.js';
import { loadAssessments } from './assessments.js';
import { updateDashboardStats, updateProgressTracking } from './gamification.js';
import { switchTab } from './ui.js';

let supabaseClient = null;
const SUPABASE_URL = "https://ffcjkccdfvkyofzpwgil.supabase.co";

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

export async function processImport() {
    if (!getIsAdmin()) {
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

        fileInput.value = '';
        document.getElementById('file-upload-list').innerHTML = '';
        document.getElementById('importOptions').style.display = 'none';

        await loadAssessments();
        updateDashboardStats();
        updateProgressTracking();
        switchTab('dashboard');

    } catch (error) {
        console.error('Import process error:', error);
        alert('A critical error occurred during the import process: ' + error.message);
    }
} 
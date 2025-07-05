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

    // Show import options
    if (importOptions) {
        importOptions.style.display = 'block';
    }
}

export async function processImport() {
    if (!getIsAdmin()) {
        alert('Access denied. Admin privileges required.');
        return;
    }

    const fileInput = document.getElementById('fileInput');
    const importError = document.getElementById('importError');
    const importOptions = document.getElementById('importOptions');

    if (!fileInput.files.length) {
        showError('Please select a file to upload.');
        return;
    }

    try {
        // Hide error and show loading
        if (importError) importError.style.display = 'none';
        if (importOptions) importOptions.style.display = 'none';

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function(e) {
            try {
                const assessmentData = JSON.parse(e.target.result);
                
                // Validate the assessment data structure
                if (!assessmentData.tool_name || !assessmentData.risk_score) {
                    throw new Error('Invalid assessment file format. Missing required fields.');
                }

                // Upload to Supabase
                const { data, error } = await supabaseClient
                    .from('assessments')
                    .insert([assessmentData]);

                if (error) {
                    throw new Error(`Upload failed: ${error.message}`);
                }

                // Success
                alert('Assessment uploaded successfully!');
                
                // Clear the form
                fileInput.value = '';
                document.getElementById('file-upload-list').innerHTML = '';
                
                // Refresh the assessments list
                await loadAssessments();
                updateDashboardStats();
                updateProgressTracking();

            } catch (error) {
                showError(`Error processing file: ${error.message}`);
            }
        };

        reader.readAsText(file);

    } catch (error) {
        showError(`Upload failed: ${error.message}`);
    }
}

function showError(message) {
    const importError = document.getElementById('importError');
    if (importError) {
        importError.textContent = message;
        importError.style.display = 'block';
    }
}

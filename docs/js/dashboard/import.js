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
        // Validate file is JSON
        const text = await file.text();
        let assessmentData;
        try {
            assessmentData = JSON.parse(text);
        } catch (e) {
            showError('Invalid JSON file.');
            return;
        }
        
        // Debug: Log the parsed data to see what we're working with
        console.log('Parsed assessment data:', assessmentData);
        console.log('compliance_certifications field:', assessmentData.compliance_certifications);
        console.log('compliance_certifications type:', typeof assessmentData.compliance_certifications);
        console.log('Is array?', Array.isArray(assessmentData.compliance_certifications));
        
        // Validate only the essential required fields
        const requiredFields = ['name', 'total_score', 'risk_level'];
        const missingFields = requiredFields.filter(field => !assessmentData[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            showError(`Invalid assessment file format. Missing required fields: ${missingFields.join(', ')}`);
            return;
        }
        
        // Validate score fields exist (can be 0)
        const scoreFields = ['data_storage_score', 'training_usage_score', 'access_controls_score', 'compliance_score', 'vendor_transparency_score'];
        const missingScores = scoreFields.filter(field => assessmentData[field] === undefined || assessmentData[field] === null);
        
        if (missingScores.length > 0) {
            showError(`Invalid assessment file format. Missing score fields: ${missingScores.join(', ')}`);
            return;
        }
        
        // Validate detailed_assessment structure (optional but recommended)
        if (assessmentData.detailed_assessment && typeof assessmentData.detailed_assessment !== 'object') {
            showError('Invalid assessment file format. detailed_assessment must be an object if present.');
            return;
        }
        
        // Prepare multipart/form-data
        const formData = new FormData();
        formData.append('file', file);
        // Get Supabase access token
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
            showError('Authentication error: No access token found. Please log in again.');
            return;
        }
        // Upload to Supabase Edge Function with Authorization header
        const response = await fetch('https://lgybmsziqjdmmxdiyils.functions.supabase.co/upload-assessment', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });
        const result = await response.json();
        if (!response.ok) {
            showError(result.error || 'Upload failed');
            return;
        }
        alert('Assessment uploaded successfully!');
        // Clear the form
        fileInput.value = '';
        document.getElementById('file-upload-list').innerHTML = '';
        // Refresh the assessments list
        await loadAssessments();
        updateDashboardStats();
        updateProgressTracking();
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

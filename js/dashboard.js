// js/dashboard.js

let isAdmin = false; // Use a global variable for the admin state
let supabaseClient = null; // Global Supabase client instance
let allAssessments = []; // Store all assessments for filtering
let filteredAssessments = []; // Store currently filtered assessments

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key
const SUPABASE_URL = "https://lgybmsziqjdmmxdiyils.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg";

document.addEventListener('DOMContentLoaded', () => {
    if (SUPABASE_URL.includes("YOUR_SUPABASE_URL")) {
        alert('Please configure SUPABASE_URL and SUPABASE_ANON_KEY in js/dashboard.js');
        return;
    }

    // Create a single global Supabase client instance
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // --- Add Event Listeners for the Modal ---
    const importBtn = document.getElementById('importBtn');
    const importModal = document.getElementById('importModal');
    const closeBtn = document.querySelector('.modal .close'); // Be more specific

    if(importBtn) {
        importBtn.onclick = () => { if(isAdmin) importModal.style.display = 'block'; };
    }
    if(closeBtn) {
        closeBtn.onclick = () => { importModal.style.display = 'none'; };
    }
    window.onclick = (event) => {
        if (event.target == importModal) {
            importModal.style.display = 'none';
        }
    };
    
    // Handle auth state changes to update the UI
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        handleAuthChange(session);
    });

    // Initial check in case the user is already logged in
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        handleAuthChange(session);
    });

    // --- Dashboard filter controls ---
    const searchInput = document.getElementById('searchInput');
    const riskFilter = document.getElementById('riskFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (riskFilter) riskFilter.addEventListener('change', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    
    const resetAllFilters = () => {
        if(searchInput) searchInput.value = '';
        if(riskFilter) riskFilter.value = 'all';
        if(categoryFilter) categoryFilter.value = 'all';
        if(sortSelect) sortSelect.value = 'date_desc';
        applyFilters();
    };

    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', resetAllFilters);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAllFilters);
});

// A single, central function to handle UI changes based on auth state
function handleAuthChange(session) {
    const loginSection = document.getElementById('loginSection');
    const dashboardContent = document.getElementById('dashboardContent');

    if (session) {
        // Update global admin state
        isAdmin = session.user?.user_metadata?.role === 'admin';
        
        loginSection.style.display = 'none';
        dashboardContent.style.display = 'block';
        
        updateDashboardUI();
        loadAssessments();
    } else {
        isAdmin = false; // Reset admin state on logout
        renderLoginUI(loginSection);
        dashboardContent.style.display = 'none';
        updateDashboardUI();
    }
}

// This function specifically updates UI elements based on the global 'isAdmin' state
function updateDashboardUI() {
    const importContainer = document.getElementById('importContainer');
    if (importContainer) {
        importContainer.style.display = isAdmin ? 'block' : 'none';
    }
}

function renderLoginUI(loginSection) {
    loginSection.style.display = 'block';
    loginSection.innerHTML = `
        <div class="form-card">
            <div class="form-header">
                <h2>Login Required</h2>
                <p>Please log in to view your assessment dashboard.</p>
            </div>
            <div class="form-content" style="text-align: center;">
                <p>You need to be signed in to access this page.</p>
                <button id="login-button" class="btn btn-primary">Login with GitHub</button>
            </div>
        </div>
    `;
    document.getElementById('login-button').addEventListener('click', () => signInWithGitHub());
}

async function signInWithGitHub() {
    const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'github' });
    if (error) console.error('Error logging in:', error.message);
}

async function loadAssessments() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const assessmentList = document.getElementById('assessment-list');

    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    assessmentList.innerHTML = '';

    try {
        const { data, error } = await supabaseClient
            .from('ai_tools')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allAssessments = data || [];
        applyFilters(); // Initial render
    } catch (error) {
        console.error('Error loading assessments:', error.message);
        assessmentList.innerHTML = `<p style="color: red; text-align: center;">Error: Could not load assessments.</p>`;
    } finally {
        loadingState.style.display = 'none';
    }
}

function renderAssessmentItem(tool) {
    const assessmentList = document.getElementById('assessment-list');
    const riskLevel = tool.risk_level || 'Unknown';
    const riskColor = getRiskColor(riskLevel);

    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
        <div class="list-col-tool">
            <i class="fas fa-robot list-item-icon"></i>
            ${tool.name || 'N/A'}
        </div>
        <div class="list-col-score">
            <span class="score-badge" style="background-color: ${riskColor};">${tool.total_score || 'N/A'}</span>
        </div>
        <div class="list-col-level">
            <span class="level-indicator" style="background-color: ${riskColor};"></span>
            ${riskLevel}
        </div>
        <div class="list-col-date">
            ${new Date(tool.created_at).toLocaleDateString()}
        </div>
        <div class="list-col-actions">
            <button class="btn-icon" title="View Details" onclick="alert('Detail view not implemented yet.')"><i class="fas fa-eye"></i></button>
            <button class="btn-icon" title="Delete" onclick="deleteAssessment('${tool.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `;
    assessmentList.appendChild(item);
}

function getRiskColor(riskLevel) {
    if (!riskLevel) return '#64748b';
    const level = riskLevel.toUpperCase();
    if (level.includes('CRITICAL')) return '#dc2626';
    if (level.includes('HIGH')) return '#ef4444';
    if (level.includes('MEDIUM')) return '#f59e0b';
    if (level.includes('LOW')) return '#16a34a';
    return '#64748b';
}

async function deleteAssessment(toolId) {
    if (confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
        try {
            const { error } = await supabaseClient
                .from('ai_tools')
                .delete()
                .eq('id', toolId);

            if (error) throw error;
            
            loadAssessments(); // Refresh the list

        } catch (error) {
            console.error('Error deleting assessment:', error.message);
            alert('Failed to delete the assessment.');
        }
    }
}

// --- Import Modal Functions ---
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // The new function expects the raw tool data, not a { tools: [...] } wrapper
            window.importData = JSON.parse(e.target.result);
            document.getElementById('fileName').textContent = `File: ${file.name}`;
            document.getElementById('importOptions').style.display = 'block';
        } catch (error) {
            alert('❌ Invalid JSON file. Please select a valid assessment file.');
            console.error("JSON Parsing Error:", error);
        }
    };
    reader.readAsText(file);
}

async function processImport() {
    if (!window.importData) {
        alert('❌ No valid data to import. Please select a file first.');
        return;
    }

    const importButton = document.querySelector('#importModal button');
    importButton.disabled = true;
    importButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            alert('You must be logged in to import data.');
            throw new Error('User not authenticated.');
        }

        const { data, error } = await supabaseClient.functions.invoke('upload-assessment', {
            body: { toolData: window.importData } // Pass the tool data directly
        });

        if (error) throw error;
        
        alert(`✅ Success: ${data.message}`);
        document.getElementById('importModal').style.display = 'none';
        loadAssessments(); // Refresh the grid

    } catch (error) {
        console.error('Import Error:', error);
        alert(`❌ Import Failed: ${error.message || 'Unknown error'}`);
    } finally {
        importButton.disabled = false;
        importButton.innerHTML = 'Start Import';
    }
}

// Add some CSS for the list to style.css if it's not already there.
// This is a reminder to add styles to css/style.css
const addStylesReminder = `
/* Assessment List Styles */
.list-header {
    display: flex;
    font-weight: 600;
    color: #475569;
    padding: 0.75rem 1.5rem;
    border-bottom: 2px solid #e2e8f0;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.list-item {
    display: flex;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    transition: background-color 0.2s;
}
.list-item:hover {
    background-color: #f8fafc;
}
.list-item:last-child {
    border-bottom: none;
}
.list-col-tool { flex: 3; display: flex; align-items: center; gap: 1rem; font-weight: 500; }
.list-col-score { flex: 1; text-align: center; }
.list-col-level { flex: 1; display: flex; align-items: center; gap: 0.5rem; }
.list-col-date { flex: 1.5; color: #64748b; }
.list-col-actions { flex: 1; text-align: right; }
.list-item-icon { color: #3b82f6; }
.score-badge {
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
}
.level-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}
.btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s;
}
.btn-icon:hover {
    color: #1e293b;
    background-color: #e2e8f0;
}
`;
// console.log("Reminder: Add the following styles to css/style.css:\n" + addStylesReminder);

function applyFilters() {
    if (!allAssessments) return;

    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const riskValue = document.getElementById('riskFilter')?.value || 'all';
    const categoryValue = document.getElementById('categoryFilter')?.value || 'all';
    const sortValue = document.getElementById('sortSelect')?.value || 'date_desc';

    filteredAssessments = allAssessments.filter(tool => {
        const matchesSearch = !searchTerm || tool.name?.toLowerCase().includes(searchTerm);
        const matchesRisk = riskValue === 'all' || (tool.risk_level || '').toLowerCase().includes(riskValue);
        const matchesCategory = categoryValue === 'all' || (tool.category || '').toLowerCase() === categoryValue.toLowerCase();
        return matchesSearch && matchesRisk && matchesCategory;
    });

    // Sort
    switch (sortValue) {
        case 'date_asc':
            filteredAssessments.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'date_desc':
            filteredAssessments.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'score_asc':
            filteredAssessments.sort((a,b) => (a.total_score || 0) - (b.total_score || 0));
            break;
        case 'score_desc':
            filteredAssessments.sort((a,b) => (b.total_score || 0) - (a.total_score || 0));
            break;
        case 'name_asc':
            filteredAssessments.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name_desc':
            filteredAssessments.sort((a,b) => (b.name || '').localeCompare(a.name || ''));
            break;
    }

    renderAssessmentList();
}

function renderAssessmentList() {
    const assessmentList = document.getElementById('assessment-list');
    const emptyState = document.getElementById('empty-state');
    const resultsCount = document.getElementById('resultsCount');
    const clearFiltersBtn = document.getElementById('clearFilters');

    assessmentList.innerHTML = '';

    const isFiltered = (document.getElementById('searchInput')?.value || '') !== '' ||
                       (document.getElementById('riskFilter')?.value || 'all') !== 'all' ||
                       (document.getElementById('categoryFilter')?.value || 'all') !== 'all';

    if (filteredAssessments.length === 0) {
        emptyState.style.display = 'block';
        resultsCount.textContent = '0 tools found';
    } else {
        emptyState.style.display = 'none';
        resultsCount.textContent = `Showing ${filteredAssessments.length} of ${allAssessments.length} tools`;
    }

    if(clearFiltersBtn) {
        clearFiltersBtn.style.display = isFiltered ? 'block' : 'none';
    }

    filteredAssessments.forEach(renderAssessmentItem);
} 
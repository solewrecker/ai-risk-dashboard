// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANT: Replace with your actual Supabase project URL and Anon Key
    const SUPABASE_URL = "https://lgybmsziqjdmmxdiyils.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg";

    if (SUPABASE_URL.includes("YOUR_SUPABASE_URL")) {
        alert('Please configure SUPABASE_URL and SUPABASE_ANON_KEY in js/dashboard.js');
        return;
    }

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const loginSection = document.getElementById('loginSection');
    const dashboardContent = document.getElementById('dashboardContent');
    
    // Handle auth state changes to update the UI
    supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
            loginSection.style.display = 'none';
            dashboardContent.style.display = 'block';
            
            // Check for admin role and show import button
            const isAdmin = session.user?.user_metadata?.role === 'admin';
            const importContainer = document.getElementById('importContainer');
            if (importContainer) {
                importContainer.style.display = isAdmin ? 'block' : 'none';
            }
            
            loadAssessments(supabase);
        } else {
            renderLoginUI(loginSection, supabase);
            dashboardContent.style.display = 'none';
        }
    });

    // Initial check in case the user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            loginSection.style.display = 'none';
            dashboardContent.style.display = 'block';

            const isAdmin = session.user?.user_metadata?.role === 'admin';
            const importContainer = document.getElementById('importContainer');
            if (importContainer) {
                importContainer.style.display = isAdmin ? 'block' : 'none';
            }
            
            loadAssessments(supabase);
        } else {
            renderLoginUI(loginSection, supabase);
        }
    });
});

function renderLoginUI(loginSection, supabase) {
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
    document.getElementById('login-button').addEventListener('click', () => signInWithGitHub(supabase));
}

async function signInWithGitHub(supabase) {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
    if (error) console.error('Error logging in:', error.message);
}

async function loadAssessments(supabase) {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const assessmentList = document.getElementById('assessment-list');

    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    assessmentList.innerHTML = '';

    try {
        // Fetch from the correct 'ai_tools' table
        const { data, error } = await supabase
            .from('ai_tools')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data.length === 0) {
            emptyState.style.display = 'block';
        } else {
            data.forEach(renderAssessmentItem);
        }
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
            const SUPABASE_URL = "YOUR_SUPABASE_URL";
            const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            const { error } = await supabase
                .from('ai_tools')
                .delete()
                .eq('id', toolId);

            if (error) throw error;
            
            loadAssessments(supabase); // Refresh the list

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
        const SUPABASE_URL = "YOUR_SUPABASE_URL";
        const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('You must be logged in to import data.');
            throw new Error('User not authenticated.');
        }

        const { data, error } = await supabase.functions.invoke('upload-assessment', {
            body: { toolData: window.importData } // Pass the tool data directly
        });

        if (error) throw error;
        
        alert(`✅ Success: ${data.message}`);
        document.getElementById('importModal').style.display = 'none';
        loadAssessments(supabase); // Refresh the grid

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
console.log("Reminder: Add the following styles to css/style.css:\n" + addStylesReminder); 
// js/dashboard.js

// Supabase Connection (replace with your details)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginSection = document.getElementById('loginSection');
const dashboardContent = document.getElementById('dashboardContent');
const assessmentList = document.getElementById('assessment-list');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');

document.addEventListener('DOMContentLoaded', async () => {
    // Check user session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session) {
        console.log('User is logged in:', session.user.email);
        loginSection.style.display = 'none';
        dashboardContent.style.display = 'block';
        loadAssessments(session.user.id);
    } else {
        console.log('User is not logged in.');
        renderLoginUI();
    }

    // Handle auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            loginSection.style.display = 'none';
            dashboardContent.style.display = 'block';
            loadAssessments(session.user.id);
        } else {
            renderLoginUI();
            dashboardContent.style.display = 'none';
        }
    });
});

function renderLoginUI() {
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
    document.getElementById('login-button').addEventListener('click', signInWithGitHub);
}

async function signInWithGitHub() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
    });
    if (error) {
        console.error('Error logging in:', error.message);
    }
}

async function loadAssessments(userId) {
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    assessmentList.innerHTML = '';

    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

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

function renderAssessmentItem(assessment) {
    const results = assessment.results || {};
    const formData = assessment.form_data || {};
    const riskLevel = results.riskLevel || 'Unknown';
    const riskColor = getRiskColor(riskLevel.toLowerCase());

    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
        <div class="list-col-tool">
            <i class="fas fa-tools list-item-icon"></i>
            ${results.toolName || 'N/A'}
        </div>
        <div class="list-col-score">
            <span class="score-badge" style="background-color: ${riskColor};">${results.finalScore || 'N/A'}</span>
        </div>
        <div class="list-col-level">
            <span class="level-indicator" style="background-color: ${riskColor};"></span>
            ${riskLevel}
        </div>
        <div class="list-col-date">
            ${new Date(assessment.created_at).toLocaleDateString()}
        </div>
        <div class="list-col-actions">
            <button class="btn-icon" title="View Details" onclick="viewDetails('${assessment.id}')"><i class="fas fa-eye"></i></button>
            <button class="btn-icon" title="Delete" onclick="deleteAssessment('${assessment.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `;
    assessmentList.appendChild(item);
}

function getRiskColor(riskLevel) {
    switch(riskLevel) {
        case 'low': return '#16a34a';
        case 'medium': return '#f59e0b';
        case 'high': return '#ef4444';
        case 'critical': return '#dc2626';
        default: return '#64748b';
    }
}

function viewDetails(assessmentId) {
    // For now, just log it. We can build a details view later.
    console.log('Viewing details for assessment:', assessmentId);
    alert('Detail view is not implemented yet. You can see the ID in the console.');
}

async function deleteAssessment(assessmentId) {
    if (confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
        try {
            const { error } = await supabase
                .from('assessments')
                .delete()
                .eq('id', assessmentId);

            if (error) {
                throw error;
            }
            
            // Refresh the list
            const { data: { session } } = await supabase.auth.getSession();
            if(session) loadAssessments(session.user.id);

        } catch (error) {
            console.error('Error deleting assessment:', error.message);
            alert('Failed to delete the assessment.');
        }
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
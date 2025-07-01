// Global state (declared first to avoid initialization errors)
let currentStep = 1;
let currentAssessment = null;

// Configuration
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        storageKey: 'ai-assessment-auth',
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 2
        }
    }
});

// Authentication state  
let currentUser = null;
let isAdmin = false;

// Check auth state on load
supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    isAdmin = session?.user?.user_metadata?.role === 'admin';
    updateUIForAuth();
});

// Initialize auth UI when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateUIForAuth();
});

// Security constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 12;

let loginAttempts = 0;
let lockoutTimer = null;

function updateUIForAuth() {
    const saveButton = document.querySelector('button[onclick="saveToDatabase()"]');
    const loginSection = document.getElementById('loginSection');
    
    if (saveButton) {
        if (isAdmin) {
            saveButton.style.display = 'inline-flex';
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save to Database (Admin)';
        } else {
            saveButton.style.display = 'none';
        }
    }
    
    if (loginSection) {
        if (currentUser) {
            // User is logged in - show user info and account options
            const userTier = currentUser.user_metadata?.tier || 'free';
            loginSection.innerHTML = `
                <div class="login-user">
                    <i class="fas fa-check-circle"></i>
                    <span>${currentUser.email}</span>
                </div>
                
                <div class="login-badges">
                    ${userTier === 'enterprise' ? 
                        '<span class="badge badge-enterprise">ENTERPRISE</span>' : ''}
                    ${isAdmin ? 
                        '<span class="badge badge-admin">ADMIN</span>' : ''}
                </div>
                
                <div class="login-actions">
                    ${userTier === 'free' ? 
                        '<button onclick="showUpgradeModal()" class="btn btn-secondary">⭐ Upgrade</button>' : ''}
                    <a href="dashboard.html" class="btn btn-secondary">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <button onclick="signOut()" class="btn btn-secondary">
                        <i class="fas fa-sign-out-alt"></i> Sign Out
                    </button>
                </div>
            `;
        } else {
            // User not logged in - show auth options
            loginSection.innerHTML = `
                <div class="login-user">
                    <i class="fas fa-lock"></i>
                    <span>Sign in to save assessments & export reports</span>
                </div>
                
                <div class="login-actions">
                    <button onclick="showAuthTab('signin')" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </button>
                    <button onclick="showAuthTab('signup')" class="btn btn-secondary">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </div>
            `;
        }
    }
}

async function signInAdmin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Check if user has admin role
        if (data.user?.user_metadata?.role !== 'admin') {
            await supabase.auth.signOut();
            showMessage('Access denied: Admin privileges required', 'error');
            return;
        }
        
        showMessage('Admin login successful', 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed: ' + error.message, 'error');
    }
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        showMessage('Signed out successfully', 'success');
    } catch (error) {
        console.error('Sign out error:', error);
        showMessage('Sign out failed: ' + error.message, 'error');
    }
}

// Auth Modal Functions
function showAuthModal(tab = 'signin') {
    const modal = document.getElementById('authModal');
    modal.style.display = 'flex';
    switchAuthTab(tab);
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
}

function switchAuthTab(tab) {
    // Update tabs
    document.getElementById('signInTab').classList.toggle('active', tab === 'signin');
    document.getElementById('signUpTab').classList.toggle('active', tab === 'signup');
    
    // Update forms
    document.getElementById('signInForm').classList.toggle('active', tab === 'signin');
    document.getElementById('signUpForm').classList.toggle('active', tab === 'signup');
}

// Update the showAuthTab function to use the new modal
function showAuthTab(tab) {
    showAuthModal(tab);
}

// Click outside modal to close
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('authModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAuthModal();
        }
    });
});

// Input sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim()
        .replace(/[<>]/g, '') // Basic XSS prevention
        .slice(0, MAX_EMAIL_LENGTH); // Prevent overflow
}

// Password strength check
function checkPasswordStrength(password) {
    if (password.length < MIN_PASSWORD_LENGTH) {
        return { valid: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` };
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        return { valid: false, message: 'Password is too long' };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return { 
            valid: false, 
            message: 'Password must contain uppercase, lowercase, numbers, and special characters' 
        };
    }
    
    return { valid: true };
}

// Rate limiting check
function checkRateLimit(email) {
    const now = Date.now();
    const lockoutTime = lockoutTimes.get(email);
    
    if (lockoutTime && now < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime - now) / 1000 / 60);
        return {
            allowed: false,
            message: `Too many attempts. Please try again in ${remainingTime} minutes`
        };
    }
    
    const attempts = failedAttempts.get(email) || 0;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
        lockoutTimes.set(email, now + LOCKOUT_TIME);
        failedAttempts.delete(email);
        return {
            allowed: false,
            message: 'Too many failed attempts. Please try again in 15 minutes'
        };
    }
    
    return { allowed: true };
}

// Update signInUser function with security measures
async function signInUser() {
    const email = sanitizeInput(document.getElementById('signInEmail').value);
    const password = document.getElementById('signInPassword').value;
    
    // Input validation
    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }
    
    // Check rate limiting
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
        showMessage(rateLimit.message, 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            // Track failed attempt
            const attempts = (failedAttempts.get(email) || 0) + 1;
            failedAttempts.set(email, attempts);
            throw error;
        }
        
        // Clear failed attempts on success
        failedAttempts.delete(email);
        lockoutTimes.delete(email);
        
        showMessage('Signed in successfully', 'success');
        closeAuthModal();
        
    } catch (error) {
        console.error('Sign in error:', error);
        showMessage('Sign in failed: ' + error.message, 'error');
    }
}

// Update signUpUser function with security measures
async function signUpUser() {
    const email = sanitizeInput(document.getElementById('signUpEmail').value);
    const password = document.getElementById('signUpPassword').value;
    const tier = document.getElementById('signUpTier').value;
    
    // Input validation
    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }
    
    // Check password strength
    const passwordCheck = checkPasswordStrength(password);
    if (!passwordCheck.valid) {
        showMessage(passwordCheck.message, 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    tier: tier
                }
            }
        });
        
        if (error) throw error;
        
        showMessage('Account created successfully! Please check your email to verify your account.', 'success');
        closeAuthModal();
        
    } catch (error) {
        console.error('Sign up error:', error);
        showMessage('Sign up failed: ' + error.message, 'error');
    }
}

function showUpgradeModal() {
    const upgradeHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 500px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                <h3 style="color: #1e293b; margin-bottom: 1rem;">⭐ Upgrade to Enterprise</h3>
                <p style="color: #64748b; margin-bottom: 2rem;">
                    Get advanced features including server-generated PDFs, custom branding, assessment history, and priority support.
                </p>
                
                <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; border-left: 3px solid #f59e0b;">
                    <div style="font-weight: 600; color: #92400e; margin-bottom: 0.5rem;">🚧 Coming Soon</div>
                    <div style="font-size: 0.875rem; color: #78350f;">
                        Payment integration is being finalized. Contact us for early access pricing.
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="this.closest('div').closest('div').remove()" style="
                        background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;
                    ">Maybe Later</button>
                    <button onclick="contactSales()" style="
                        background: #f59e0b; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;
                    ">Contact Sales</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', upgradeHTML);
}

function contactSales() {
    // Remove modal
    document.querySelector('[style*="position: fixed"]')?.remove();
    
    // For now, just show a message - later integrate with contact form or payment system
    showMessage('📧 Please email sales@yourcompany.com for enterprise pricing', 'success');
}

function showDashboard() {
    // For now, show a coming soon message - later we'll create dashboard.html
    showMessage('📊 Dashboard feature coming soon! For now, continue using the assessment tool.', 'success');
    
    // TODO: Later redirect to dashboard.html
    // window.location.href = 'dashboard.html';
}

// Data Classification Multipliers (hidden from UI)
const DATA_CLASSIFICATION_MULTIPLIERS = {
    'phi': 1.4,
    'financial': 1.3,
    'trade-secrets': 1.25,
    'pii': 1.2,
    'public': 0.9
};

// Use Case Multipliers (hidden from UI)
const USE_CASE_MULTIPLIERS = {
    'legal-compliance': 1.3,
    'finance-accounting': 1.2,
    'hr-executive': 1.15,
    'customer-support': 1.1,
    'development': 0.95,
    'marketing': 0.9,
    'research': 1.0,
    'general': 1.0
};

// Fallback database removed - using Supabase as primary data source for consistency

// Global state variables moved to top of script

// Step navigation
function nextStep() {
    const currentStep = getCurrentStep();
    
    // Validate form data before proceeding
    if (currentStep === 1) {
        const formData = {
            toolName: document.getElementById('toolName').value,
            toolUrl: document.getElementById('toolUrl').value,
            toolCategory: document.getElementById('toolCategory').value,
            useCase: document.getElementById('useCase').value,
            additionalContext: document.getElementById('additionalContext').value
        };
        
        const validation = validateFormData(formData);
        if (!validation.valid) {
            showMessage(validation.message, 'error');
            return;
        }
    }
    else if (currentStep === 2) {
        const dataClassification = document.querySelector('input[name="dataClassification"]:checked')?.value;
        if (!dataClassification) {
            showMessage('Please select a data classification', 'error');
            return;
        }
    }
    
    // Proceed with step change if validation passes
    document.querySelector(`#step${currentStep}`).classList.remove('active');
    document.querySelector(`#section${currentStep}`).classList.remove('active');
    document.querySelector(`#step${currentStep + 1}`).classList.add('active');
    document.querySelector(`#section${currentStep + 1}`).classList.add('active');
    
    if (currentStep === 2) {
        startAnalysis();
    }
}

function prevStep() {
    if (currentStep === 2) {
        showStep(1);
    }
}

function showStep(step) {
    // Hide all sections
    document.querySelectorAll('.step-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(`section${step}`).classList.add('active');
    
    // Update progress steps
    document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add('active');
        }
    });
    
    currentStep = step;
}

// Validation
function validateStep1() {
    const toolName = document.getElementById('toolName').value.trim();
    if (!toolName) {
        showMessage('Please enter a tool name', 'error');
        return false;
    }
    return true;
}

function validateStep2() {
    const dataClassification = document.querySelector('input[name="dataClassification"]:checked');
    if (!dataClassification) {
        showMessage('Please select a data classification', 'error');
        return false;
    }
    return true;
}

// Radio button selection styling
document.addEventListener('change', function(e) {
    if (e.target.name === 'dataClassification') {
        document.querySelectorAll('.classification-option').forEach(option => {
            option.classList.remove('selected');
        });
        e.target.closest('.classification-option').classList.add('selected');
    }
});

// Assessment process
async function startAssessment() {
    const formData = {
        toolName: document.getElementById('toolName').value.trim(),
        toolVersion: document.getElementById('toolVersion').value,
        toolCategory: document.getElementById('toolCategory').value,
        toolUrl: document.getElementById('toolUrl').value.trim(),
        useCase: document.getElementById('useCase').value,
        additionalContext: document.getElementById('additionalContext').value.trim(),
        dataClassification: document.querySelector('input[name="dataClassification"]:checked').value
    };

    // Note: All assessments are now free - paywall moved to export stage for better conversion

    showStep(3);

    try {
        // Simulate analysis steps
        await simulateAnalysisSteps();
        
        // Generate assessment results
        const results = await generateAssessmentResults(formData);
        currentAssessment = { formData, results };
        
        // Show results
        displayResults(results);
        showStep(4);
        
    } catch (error) {
        console.error('Assessment error:', error);
        showMessage('Assessment failed: ' + error.message, 'error');
        showStep(2);
    }
}

async function simulateAnalysisSteps() {
    const steps = [
        'Analyzing data storage policies...',
        'Checking training data usage...',
        'Evaluating access controls...',
        'Assessing compliance requirements...',
        'Reviewing vendor transparency...',
        'Calculating risk score...',
        'Generating recommendations...'
    ];

    for (let i = 0; i < steps.length; i++) {
        document.getElementById('analysisStatus').textContent = steps[i];
        await new Promise(resolve => setTimeout(resolve, 800));
    }
}

async function generateAssessmentResults(formData) {
    console.log('📊 Generating assessment results for:', formData.toolName);

    // Fetch the tool data from the database first
    const toolData = await getToolFromDatabase(formData);

    let baseScore, breakdown, recommendations, finalScore;

    if (toolData && toolData.total_score !== undefined) {
        console.log('🎯 [RESULTS] Using actual tool data:', { 
            toolName: toolData.name, 
            category: toolData.category, 
            selectedTool: toolData.selected_tool_version,
            toolVersion: formData.toolVersion
        });
        
        // Calculate base score from components
        baseScore = toolData.total_score;
        
        // Apply multipliers to the total score
        const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification] || 1;
        const useCaseMultiplier = USE_CASE_MULTIPLIERS[formData.useCase] || 1;
        finalScore = Math.round(baseScore * dataMultiplier * useCaseMultiplier);
        
        breakdown = await generateBreakdown(formData, toolData);
        recommendations = generateRecommendations(finalScore, formData, toolData);
        
        // Update formData with the name from DB to ensure consistency
        formData.toolName = toolData.name;
        
    } else {
        console.log('⚠️ [RESULTS] No specific tool data found, generating heuristic assessment');
        baseScore = generateHeuristicScore(formData);
        finalScore = applyMultipliers(baseScore, formData);
        breakdown = await generateBreakdown(formData);
        recommendations = generateRecommendations(finalScore, formData);
    }

    return {
        toolName: formData.toolName,
        baseScore: baseScore,
        finalScore: finalScore,
        riskLevel: getRiskLevel(finalScore),
        breakdown: breakdown,
        recommendations: recommendations,
        timestamp: new Date().toISOString(),
        source: 'database',
        enhancedInfo: window.currentEnhancedInfo || null
    };
}

async function getToolFromDatabase(formData) {
    const { toolName, toolVersion } = formData;

    // Capitalize version: 'enterprise' -> 'Enterprise', 'free' -> 'Free'
    const versionName = toolVersion.charAt(0).toUpperCase() + toolVersion.slice(1);
    const fullToolName = `${toolName} ${versionName}`;
    
    console.log(`[DB] Attempting to find exact match for: "${fullToolName}"`);

    try {
        let toolData = null;
        
        // 1. Try for an exact match on the constructed full name
        const { data: exactData, error: exactError } = await supabase
            .from('ai_tools')
            .select('*')
            .eq('name', fullToolName)
            .limit(1)
            .single();

        if (exactData) {
            console.log(`✅ [DB] Found exact match: "${exactData.name}"`);
            toolData = exactData;
        } else {
            // 2. Fallback: If no exact match, try a more generic search on the base name
            console.log(`[DB] No exact match. Falling back to search for base name: "${toolName}"`);
            
            const { data: broadData, error: broadError } = await supabase
                .from('ai_tools')
                .select('*')
                .ilike('name', `%${toolName}%`)
                // IMPORTANT: Exclude results that contain the *other* version name
                .not('name', 'ilike', `%${versionName === 'Free' ? 'Enterprise' : 'Free'}%`)
                .order('name', { ascending: true }) // Get the most relevant one first
                .limit(1)
                .single();

            if (broadData) {
                console.log(`✅ [DB] Found broad match: "${broadData.name}"`);
                toolData = broadData;
            } else if (broadError) {
                console.warn(`[DB] No tool found after fallback search for "${toolName}". Error:`, broadError.message);
            }
        }

        if (!toolData) {
            console.warn('[DB] Could not find any matching tool in database.');
            return null;
        }
        
        return toolData;

    } catch (err) {
        console.error('❌ [DB] Critical error during database fetch:', err.message);
        return null;
    }
}

function buildSearchTerms(toolName, toolVersion) {
    const cleanToolName = toolName.trim();
    const searchTerms = [];
    
    const versionSuffix = toolVersion === 'enterprise' ? 'Enterprise' : 'Free';
    
    // Check if tool name already includes the version suffix
    const toolNameLower = cleanToolName.toLowerCase();
    const suffixLower = versionSuffix.toLowerCase();
    
    // PRIORITY 1: Try exact matches with version first  
    if (!toolNameLower.includes(suffixLower)) {
        // For Claude specifically, try the exact database format first
        if (cleanToolName.toLowerCase() === 'claude') {
            searchTerms.push(`Claude.ai ${versionSuffix}`); // Exact: "Claude.ai Enterprise"
            searchTerms.push(`${cleanToolName}.ai ${versionSuffix}`); // "Claude.ai Enterprise"  
            searchTerms.push(`${cleanToolName} ${versionSuffix}`);    // "Claude Enterprise"
        } else {
            // Try common database naming patterns for other tools
            searchTerms.push(`${cleanToolName}.ai ${versionSuffix}`); // "ToolName.ai Enterprise"
            searchTerms.push(`${cleanToolName} ${versionSuffix}`);    // "ToolName Enterprise"
            
            // Tool-specific variations
            if (cleanToolName.toLowerCase() === 'chatgpt') {
                searchTerms.push(`ChatGPT ${versionSuffix}`);
            } else if (cleanToolName.toLowerCase().includes('copilot')) {
                searchTerms.push(`GitHub Copilot ${versionSuffix}`);
                searchTerms.push(`Microsoft Copilot ${versionSuffix}`);
            }
        }
    }
    
    // PRIORITY 2: Try exact name as entered (only if no version-specific matches)
    searchTerms.push(cleanToolName);
    
    console.log(`🔍 Built search terms for "${toolName}" (${toolVersion}):`, searchTerms);
    
    return searchTerms;
}

function generateHeuristicScore(formData) {
    // Fallback scoring for unknown tools
    let score = 60; // Higher default for unknown tools (more conservative)
    
    const toolName = formData.toolName.toLowerCase();
    
    // Adjust based on version
    if (formData.toolVersion === 'enterprise') {
        score -= 15; // Enterprise typically safer
    }
    
    // Category adjustments
    if (formData.toolCategory === 'conversational-ai') {
        score += 15; // Conversational AI tends to be higher risk
    } else if (formData.toolCategory === 'code-assistant') {
        score += 5;
    } else if (formData.toolCategory === 'productivity') {
        score += 10;
    }
    
    return Math.min(100, Math.max(20, score)); // Keep between 20-100
}

function applyMultipliers(baseScore, formData) {
    let finalScore = baseScore;
    const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification] || 1;
    const useCaseMultiplier = USE_CASE_MULTIPLIERS[formData.useCase] || 1;
    finalScore *= dataMultiplier;
    finalScore *= useCaseMultiplier;
    return Math.round(finalScore);
}

// Client-side equivalent of the backend multiplier logic
function applyClientSideMultipliers(dbData, formData) {
  if (!dbData) return { dataStorage: 0, trainingUsage: 0, accessControls: 0, complianceRisk: 0, vendorTransparency: 0 };
  
  const baseScores = {
    dataStorage: dbData.data_storage_score || 0,
    trainingUsage: dbData.training_usage_score || 0,
    accessControls: dbData.access_controls_score || 0,
    complianceRisk: dbData.compliance_score || 0,
    vendorTransparency: dbData.vendor_transparency_score || 0
  };
  
  const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification] || 1.0;
  baseScores.dataStorage = Math.round(baseScores.dataStorage * dataMultiplier);
  baseScores.complianceRisk = Math.round(baseScores.complianceRisk * dataMultiplier);
  
  const useCaseMultiplier = USE_CASE_MULTIPLIERS[formData.useCase] || 1.0;
  baseScores.complianceRisk = Math.round(baseScores.complianceRisk * useCaseMultiplier);
  baseScores.accessControls = Math.round(baseScores.accessControls * useCaseMultiplier);
  
  return baseScores;
}

function getRiskLevel(score) {
    if (score >= 75) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
}

function getUseCaseLabel(useCase) {
    const useCaseLabels = {
        'legal-compliance': 'Legal/Compliance/Audit',
        'finance-accounting': 'Finance/Accounting',
        'hr-executive': 'HR/Executive Communications',
        'customer-support': 'Customer Data/Support',
        'development': 'Internal IT/Development',
        'marketing': 'Marketing/Public Content',
        'research': 'Research & Analysis',
        'general': 'General Business Use'
    };
    return useCaseLabels[useCase] || useCase;
}

async function generateBreakdown(formData) {
    console.log('🔍 Starting breakdown generation...');
    
    // Check if we have detailed assessment data from previous query
    if (window.lastToolData && window.lastToolData.hasDetailedAssessment) {
        console.log('✅ Using detailed assessment from cache');
        return generateDetailedBreakdown(window.lastToolData.toolData, formData);
    }
    
    // Try to get detailed breakdown from database with timeout
    try {
        console.log('🔍 Attempting database lookup for breakdown...');
        const searchTerms = buildSearchTerms(formData.toolName, formData.toolVersion);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 5000)
        );
        
        for (const searchTerm of searchTerms) {
            const queryPromise = supabase
                .from('ai_tools')
                .select('breakdown, details, detailed_assessment')
                .ilike('name', `%${searchTerm}%`)
                .limit(1);
            
            try {
                const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
                
                if (error) {
                    console.warn('Supabase breakdown query error:', error.message);
                    continue;
                }
                
                if (data && data.length > 0) {
                    console.log('✅ Found breakdown data in database');
                    console.log('📊 Raw database data:', data[0]);
                    // Prefer detailed assessment if available
                    if (data[0].detailed_assessment) {
                        console.log('🎯 Using detailed assessment');
                        return generateDetailedBreakdown(data[0], formData);
                    }
                    // Fall back to simple breakdown
                    if (data[0].breakdown) {
                        console.log('📋 Using simple breakdown:', data[0].breakdown);
                        return convertDatabaseBreakdown(data[0].breakdown, formData);
                    }
                }
            } catch (timeoutError) {
                console.warn('Database query timed out, using fallback');
                break;
            }
        }
    } catch (error) {
        console.warn('Could not fetch breakdown from database:', error);
    }
    
    // Fallback to generic breakdown
    console.log('📊 Using generic breakdown fallback');
    return generateGenericBreakdown(formData);
}

function convertDatabaseBreakdown(breakdown, formData) {
    // Convert database breakdown format to display format
    if (!breakdown || !breakdown.scores) {
        console.warn('Invalid breakdown structure:', breakdown);
        return generateGenericBreakdown(formData);
    }
    
    const scores = breakdown.scores;
    const isEnterprise = formData.toolVersion === 'enterprise';
    
    return {
        'Data Storage & Security': {
            score: `${scores.dataStorage || 0}/25`,
            description: isEnterprise ? 'Better data residency controls and encryption' : 'Limited visibility into data storage practices'
        },
        'Training Data Usage': {
            score: `${scores.trainingUsage || 0}/25`,
            description: isEnterprise ? 'Typically offers training opt-out options' : 'High risk - data may be used for model training'
        },
        'Access Controls': {
            score: `${scores.accessControls || 0}/20`,
            description: isEnterprise ? 'Enhanced admin controls and user management' : 'Limited enterprise admin controls available'
        },
        'Compliance Risk': {
            score: `${scores.complianceRisk || 0}/20`,
            description: isEnterprise ? 'Better compliance frameworks and certifications' : 'Potential regulatory compliance gaps'
        },
        'Vendor Transparency': {
            score: `${scores.vendorTransparency || 0}/10`,
            description: isEnterprise ? 'Better documentation and support channels' : 'Limited transparency on data practices'
        }
    };
}

function generateDetailedBreakdown(toolData, formData) {
    // Generate Pro-level detailed breakdown from database assessment
    const detailed = toolData.detailed_assessment;
    
    if (!detailed || !detailed.categories) {
        // Fall back to simple breakdown if detailed data is malformed
        return generateGenericBreakdown(formData);
    }
    
    const breakdown = {};
    const categoryMapping = {
        'dataStorage': 'Data Storage & Security',
        'trainingUsage': 'Training Data Usage', 
        'accessControls': 'Access Controls',
        'complianceRisk': 'Compliance Risk',
        'vendorTransparency': 'Vendor Transparency'
    };
    
    // Build detailed breakdown with justifications
    Object.keys(categoryMapping).forEach(key => {
        const category = detailed.categories[key];
        const displayName = categoryMapping[key];
        
        if (category) {
            breakdown[displayName] = {
                score: `${category.total_score}/${category.max_score}`,
                description: category.description || 'Detailed assessment available',
                subcategories: category.subcategories || {},
                isDetailed: true // Flag for enhanced display
            };
        } else {
            // Fallback for missing categories
            breakdown[displayName] = {
                score: 'N/A',
                description: 'Assessment data not available',
                isDetailed: false
            };
        }
    });
    
    // Store enhanced info for additional sections
    window.currentEnhancedInfo = {
        keyStrengths: detailed.keyStrengths || [],
        areasForMonitoring: detailed.areasForMonitoring || [],
        recommendations: detailed.recommendations || [],
        executiveSummary: detailed.executiveSummary || null
    };
    
    console.log('📋 Generated detailed breakdown for Pro user');
    return breakdown;
}

function generateGenericBreakdown(formData) {
    // Use the actual calculated component scores if available
    if (window.currentScoreBreakdown) {
        const breakdown = window.currentScoreBreakdown;
        const isEnterprise = formData.toolVersion === 'enterprise';
        
        return {
            'Data Storage & Security': { 
                score: `${breakdown.dataStorage}/25`, 
                description: isEnterprise ? 'Better data residency controls and encryption' : 'Limited visibility into data storage practices' 
            },
            'Training Data Usage': { 
                score: `${breakdown.trainingUsage}/25`, 
                description: isEnterprise ? 'Typically offers training opt-out options' : 'High risk - data may be used for model training' 
            },
            'Access Controls': { 
                score: `${breakdown.accessControls}/20`, 
                description: isEnterprise ? 'Enhanced admin controls and user management' : 'Limited enterprise admin controls available' 
            },
            'Compliance Risk': { 
                score: `${breakdown.complianceRisk}/20`, 
                description: isEnterprise ? 'Better compliance frameworks and certifications' : 'Potential regulatory compliance gaps' 
            },
            'Vendor Transparency': { 
                score: `${breakdown.vendorTransparency}/10`, 
                description: isEnterprise ? 'Better documentation and support channels' : 'Limited transparency on data practices' 
            }
        };
    }
    
    // Fallback for when no breakdown is available
    const isEnterprise = formData.toolVersion === 'enterprise';
    return {
        'Data Storage & Security': { 
            score: isEnterprise ? '12/25' : '18/25', 
            description: isEnterprise ? 'Better data residency controls and encryption' : 'Limited visibility into data storage practices' 
        },
        'Training Data Usage': { 
            score: isEnterprise ? '8/25' : '20/25', 
            description: isEnterprise ? 'Typically offers training opt-out options' : 'High risk - data may be used for model training' 
        },
        'Access Controls': { 
            score: isEnterprise ? '10/20' : '18/20', 
            description: isEnterprise ? 'Enhanced admin controls and user management' : 'Limited enterprise admin controls available' 
        },
        'Compliance Risk': { 
            score: isEnterprise ? '8/20' : '15/20', 
            description: isEnterprise ? 'Better compliance frameworks and certifications' : 'Potential regulatory compliance gaps' 
        },
        'Vendor Transparency': { 
            score: isEnterprise ? '2/10' : '5/10', 
            description: isEnterprise ? 'Better documentation and support channels' : 'Limited transparency on data practices' 
        }
    };
}

// OLD: Legacy enterprise assessment paywall (now deprecated)
async function showLegacyEnterprisePaywall() {
    return new Promise((resolve) => {
        const paywallHTML = `
            <div style="
                position: fixed; 
                top: 0; left: 0; 
                width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                z-index: 1000;
            ">
                <div style="
                    background: white; 
                    padding: 2rem; 
                    border-radius: 1rem; 
                    max-width: 500px; 
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                ">
                    <h3 style="color: #1e293b; margin-bottom: 1rem;">🔒 Enterprise Assessment</h3>
                    <p style="color: #64748b; margin-bottom: 2rem;">
                        Enterprise assessments provide detailed category-by-category analysis using 
                        objective security criteria with comprehensive justifications.
                    </p>
                    <div style="
                        background: #f8fafc; 
                        padding: 1rem; 
                        border-radius: 0.5rem; 
                        margin-bottom: 2rem;
                        border-left: 4px solid #3b82f6;
                    ">
                        <p style="font-weight: 600; color: #1e293b;">📊 Pro Assessment Features</p>
                        <p style="font-size: 0.875rem; color: #64748b;">
                            • <strong>Detailed Component Scoring:</strong> Individual scores for each security category with evidence<br>
                            • <strong>Objective Criteria Analysis:</strong> Measurable standards vs. subjective assessments<br>
                            • <strong>Compliance Justifications:</strong> Specific reasoning for each risk factor<br>
                            • <strong>Subcategory Breakdowns:</strong> Geographic, encryption, retention analysis<br>
                            • <strong>Audit-Ready Reports:</strong> Defensible documentation for enterprise decisions
                        </p>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="paywallContinue" style="
                            background: #3b82f6; 
                            color: white; 
                            border: none; 
                            padding: 0.75rem 1.5rem; 
                            border-radius: 0.5rem; 
                            cursor: pointer;
                            font-weight: 600;
                        ">Continue Free Assessment</button>
                        <button id="paywallCancel" style="
                            background: #f8fafc; 
                            color: #475569; 
                            border: 1px solid #e2e8f0; 
                            padding: 0.75rem 1.5rem; 
                            border-radius: 0.5rem; 
                            cursor: pointer;
                            font-weight: 600;
                        ">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', paywallHTML);
        
        document.getElementById('paywallContinue').onclick = () => {
            document.body.removeChild(document.body.lastChild);
            resolve(true);
        };
        
        document.getElementById('paywallCancel').onclick = () => {
            document.body.removeChild(document.body.lastChild);
            resolve(false);
        };
    });
}

function generateRecommendations(score, formData) {
    const riskLevel = getRiskLevel(score);
    const dataType = formData.dataClassification;
    
    let recommendations = [];
    
    if (riskLevel === 'critical') {
        recommendations.push('🚫 IMMEDIATE ACTION REQUIRED: This tool should not be used with the selected data type');
        recommendations.push('🔒 Consider enterprise alternatives with stronger security controls');
    } else if (riskLevel === 'high') {
        recommendations.push('⚠️ Significant security controls required before deployment');
        recommendations.push('📋 Implement data loss prevention (DLP) policies');
    }
    
    if (dataType === 'phi') {
        recommendations.push('🏥 HIPAA compliance verification required');
        recommendations.push('📄 Business Associate Agreement (BAA) must be signed');
    } else if (dataType === 'financial') {
        recommendations.push('💳 PCI-DSS compliance verification required');
        recommendations.push('📊 SOX controls implementation needed');
    }
    
    return recommendations;
}

function displayResults(results) {
    const riskLevel = results.riskLevel;
    const riskLabels = {
        'critical': 'CRITICAL RISK',
        'high': 'HIGH RISK',
        'medium': 'MEDIUM RISK',
        'low': 'LOW RISK'
    };
    
    const riskDescriptions = {
        'critical': 'Immediate blocking required - critical security risks identified',
        'high': 'Significant controls needed before use - high security risks',
        'medium': 'Standard enterprise controls required - moderate security risks',
        'low': 'Basic monitoring sufficient. Tool meets security standards.'
    };

    // Get ACTUAL tool data from currentAssessment to ensure accuracy
    let actualToolName = currentAssessment.selectedTool?.name || results.toolName;
    
    // Add version info for proper display (ChatGPT Free, Claude Enterprise, etc.)
    if (currentAssessment.formData.toolVersion && actualToolName) {
        const versionLabels = {
            'free': 'Free',
            'enterprise': 'Enterprise'
        };
        const versionLabel = versionLabels[currentAssessment.formData.toolVersion];
        if (versionLabel && !actualToolName.toLowerCase().includes(versionLabel.toLowerCase())) {
            actualToolName = `${actualToolName} ${versionLabel}`;
        }
    }
    
    const actualToolCategory = currentAssessment.selectedTool?.category || currentAssessment.formData.toolCategory;
    
    console.log('🎯 [RESULTS] Using actual tool data:', {
        toolName: actualToolName,
        category: actualToolCategory,
        selectedTool: currentAssessment.selectedTool,
        toolVersion: currentAssessment.formData.toolVersion
    });

    // Get data classification display names  
    const dataClassificationLabels = {
        'phi': 'Protected Health Information (PHI)',
        'financial': 'Finance/Accounting',
        'trade-secrets': 'Trade Secrets/IP',
        'pii': 'Personal Information',
        'public': 'Public Data'
    };
    
    const dataClassificationLabel = dataClassificationLabels[currentAssessment.formData.dataClassification] || 'Unknown Data Type';
    
    // Get data classification color for badge
    const dataClassificationColors = {
        'phi': '#dc2626', // Red for PHI (highest risk)
        'financial': '#ea580c', // Orange for Financial
        'trade-secrets': '#ca8a04', // Yellow for Trade Secrets
        'pii': '#3b82f6', // Blue for PII
        'public': '#16a34a' // Green for Public (lowest risk)
    };
    
    const dataClassificationColor = dataClassificationColors[currentAssessment.formData.dataClassification] || '#64748b';

    // DEBUG: Check breakdown structure and calculate risk components properly
    console.log('🔍 [BREAKDOWN DEBUG] Results breakdown:', results.breakdown);
    console.log('🔍 [BREAKDOWN DEBUG] Window score breakdown:', window.currentScoreBreakdown);
    
    // Use actual calculated scores from currentScoreBreakdown for risk components
    let totalComponents = 0;
    let highRiskComponents = 0;
    let complianceScore = 0;
    
    if (window.currentScoreBreakdown) {
        const componentScores = window.currentScoreBreakdown;
        totalComponents = Object.keys(componentScores).length;
        highRiskComponents = Object.values(componentScores).filter(score => score > 8).length;
        complianceScore = componentScores.complianceRisk || 0;
        
        console.log('🎯 [RISK COMPONENTS] Using actual scores:', {
            componentScores,
            totalComponents,
            highRiskComponents,
            complianceScore
        });
    } else {
        // Fallback to results.breakdown if available
        totalComponents = Object.keys(results.breakdown).length;
        highRiskComponents = Object.values(results.breakdown).filter(comp => comp.score > 8).length;
        
        console.log('⚠️ [RISK COMPONENTS] Using fallback breakdown:', {
            totalComponents,
            highRiskComponents
        });
    }
    
    const resultsHTML = `
        <div class="modern-results-container">
            <!-- Header Section -->
            <div class="results-header">
                <div class="tool-title-section">
                    <h2 class="tool-name">${actualToolName}</h2>
                    <div class="classification-badges">
                        <span class="classification-badge" style="background: ${dataClassificationColor};">
                            🔒 ${dataClassificationLabel}
                        </span>
                        ${currentAssessment.formData.useCase ? `
                        <span class="use-case-badge">
                            📋 ${getUseCaseLabel(currentAssessment.formData.useCase)}
                        </span>
                        ` : ''}
                    </div>
                    <p class="results-subtitle">Risk Assessment Results</p>
                </div>
            </div>

            <!-- Main Score Card -->
            <div class="main-score-card risk-${riskLevel}">
                <div class="score-section">
                    <div class="score-number">${results.finalScore}</div>
                    <div class="score-label">${riskLabels[riskLevel]}</div>
                </div>
                <div class="score-description">
                    <p>${riskDescriptions[riskLevel]}</p>
                    ${results.source === 'database' ? 
                        '<div class="data-source verified">✓ Verified Assessment Data</div>' : 
                        '<div class="data-source estimated">⚠ Estimated Assessment</div>'
                    }
                </div>
            </div>

            <!-- Summary Insights -->
            <div class="insights-grid">
                <div class="insight-card">
                    <div class="insight-icon">📊</div>
                    <div class="insight-content">
                        <div class="insight-title">Overall Security Score</div>
                        <div class="insight-value">${results.finalScore}/100</div>
                        <div class="insight-description">${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk based on ${results.source} data</div>
                    </div>
                </div>
                <div class="insight-card">
                    <div class="insight-icon">🛡️</div>
                    <div class="insight-content">
                        <div class="insight-title">High-Risk Components</div>
                        <div class="insight-value">${highRiskComponents}/${totalComponents}</div>
                        <div class="insight-description">Security areas needing review</div>
                    </div>
                </div>
                <div class="insight-card">
                    <div class="insight-icon">⚖️</div>
                    <div class="insight-content">
                        <div class="insight-title">Compliance Score</div>
                        <div class="insight-value">${complianceScore}/20</div>
                        <div class="insight-description">Risk related to data type & use case</div>
                    </div>
                </div>
            </div>

            <!-- NEW: Detailed Breakdown Table (replaces old grid) -->
            <div class="detailed-breakdown-section">
                <h3>Risk Component Breakdown</h3>
                
                <!-- Header -->
                <div class="breakdown-table-header">
                    <div>Category</div>
                    <div style="text-align: right;">Score</div>
                    <div>Summary</div>
                </div>
                
                <div class="breakdown-table">
                    ${Object.entries(results.breakdown).map(([category, data]) => `
                    <details class="breakdown-row-container" ${data.isDetailed ? '' : 'disabled'}>
                        <summary class="breakdown-row">
                            <div class="category-name">
                                ${data.isDetailed ? '▸ ' : ''}${category}
                            </div>
                            <div class="category-score risk-${getRiskLevel(parseInt(data.score.split('/')[0]) * 4)}">
                                ${data.score}
                            </div>
                            <div class="category-description">${data.description}</div>
                        </summary>
                        
                        <!-- Detailed subcategories if available -->
                        ${data.isDetailed && data.subcategories ? `
                        <div class="subcategory-content">
                            ${Object.entries(data.subcategories).map(([subKey, subData]) => `
                            <div class="subcategory-item">
                                <div class="subcategory-title">${subData.title}</div>
                                <div class="subcategory-justification">${subData.justification}</div>
                                <div class="subcategory-score" style="color: ${subData.score_color || '#1e293b'};">
                                    ${subData.score_text || ''}
                                </div>
                            </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </details>
                    `).join('')}
                </div>
            </div>

            <!-- Key Strengths & Monitoring (Pro Feature) -->
            ${results.enhancedInfo && (results.enhancedInfo.keyStrengths?.length > 0 || results.enhancedInfo.areasForMonitoring?.length > 0) ? `
            <div class="strengths-monitoring-section">
                <div class="strength-card">
                    <h4>✅ Key Strengths</h4>
                    <ul>${results.enhancedInfo.keyStrengths.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
                <div class="monitoring-card">
                    <h4>⚠️ Areas for Monitoring</h4>
                    <ul>${results.enhancedInfo.areasForMonitoring.map(a => `<li>${a}</li>`).join('')}</ul>
                </div>
            </div>
            ` : ''}

            <!-- Recommendations Section -->
            <div class="recommendations-section">
                <h3>📋 Recommendations</h3>
                <div class="recommendations-list">
                    ${results.recommendations.map(rec => `
                        <div class="recommendation-item">
                            <span class="rec-bullet">→</span>
                            <span class="rec-text">${rec}</span>
                        </div>
                    `).join('')}
                    
                    <!-- Enhanced recommendations for Pro users -->
                    ${results.enhancedInfo && results.enhancedInfo.recommendations?.length > 0 ? `
                    ${results.enhancedInfo.recommendations.map(rec => `
                        <div class="recommendation-item">
                            <span class="rec-bullet">→</span>
                            <span class="rec-text">${rec}</span>
                        </div>
                    `).join('')}` : ''}
                    
                    <!-- Placeholder for more recommendations in Pro -->
                    <div class="recommendation-item more-available">
                        <span class="rec-bullet">⭐</span>
                        <span class="rec-text">
                            More detailed, actionable recommendations are available in the 
                            <a href="#" onclick="exportPremiumPDF()">Enterprise PDF report</a>.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('resultsContent').innerHTML = resultsHTML;

    // Add new styles for the breakdown table dynamically
    const breakdownStyles = `
        .detailed-breakdown-section { 
            margin-top: 2.5rem; 
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid #e2e8f0;
        }
        .detailed-breakdown-section h3 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
        }
        .breakdown-table-header {
            display: grid;
            grid-template-columns: 2fr 1fr 4fr;
            gap: 1rem;
            padding: 0 1rem 0.5rem 1rem;
            font-weight: 600;
            color: #64748b;
            font-size: 0.75rem;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
        }
        .breakdown-table {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .breakdown-row-container {
            border-radius: 0.5rem;
            overflow: hidden;
            border: 1px solid #f1f5f9;
        }
        .breakdown-row {
            display: grid;
            grid-template-columns: 2fr 1fr 4fr;
            gap: 1rem;
            padding: 1rem;
            background: #f8fafc;
            cursor: pointer;
            align-items: center;
        }
        .breakdown-row:hover { background: #f1f5f9; }
        .category-name { font-weight: 600; color: #1e293b; }
        .category-score { font-weight: 700; text-align: right; }
        .category-description { font-size: 0.875rem; color: #475569; }
        .subcategory-content {
            padding: 1rem 1.5rem 1.5rem 2.5rem;
            background: white;
            border-top: 1px solid #e2e8f0;
        }
        .subcategory-item {
            display: grid;
            grid-template-columns: 3fr 1fr;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .subcategory-item:last-child { border-bottom: none; }
        .subcategory-title { font-weight: 600; }
        .subcategory-justification { font-size: 0.875rem; color: #64748b; grid-column: 1 / span 2; }
        .subcategory-score { font-weight: 600; text-align: right; }
        .strengths-monitoring-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .strength-card, .monitoring-card {
            background: white;
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid #e2e8f0;
        }
        .strength-card h4 { color: #166534; }
        .monitoring-card h4 { color: #b45309; }
        .strength-card ul, .monitoring-card ul {
            padding-left: 1.25rem;
            margin-top: 1rem;
        }
    `;
    
    // Inject styles into the head
    const styleEl = document.createElement('style');
    styleEl.textContent = breakdownStyles;
    document.head.appendChild(styleEl);
}

// Export functions (new modular structure)

function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function hideExportMenu() {
    document.getElementById('exportMenu').style.display = 'none';
}

// Free PDF export using client-side rendering (html2canvas)
async function exportFreePDF() {
    try {
        // Get current assessment data
        if (!currentAssessment) {
            showMessage('No assessment data available', 'error');
            return;
        }

        // Create a new window/tab with the free template
        const templateWindow = window.open('templates/free-pdf-template.html', '_blank');
        
        // Wait for the template to load
        templateWindow.onload = function() {
            // Pass the assessment data to the template
            templateWindow.assessmentData = currentAssessment;
            
            // Initialize the template with the data
            templateWindow.document.addEventListener('DOMContentLoaded', function() {
                if (templateWindow.initializeTemplate) {
                    templateWindow.initializeTemplate(currentAssessment);
                }
            });
        };
        
        showMessage('Template loaded - follow the print instructions to save as PDF', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Export failed: ' + error.message, 'error');
    }
}

// Premium PDF export (server-side generation)
async function exportPremiumPDF() {
    if (!currentUser) {
        showMessage('Please sign in to access premium exports', 'error');
        return;
    }
    
    const userTier = currentUser.user_metadata?.tier;
    if (userTier !== 'enterprise' && !isAdmin) {
        showLegacyEnterprisePaywall();
        return;
    }
    
    try {
        // Get current assessment data
        if (!currentAssessment) {
            showMessage('No assessment data available', 'error');
            return;
        }

        // Prepare the required parameters
        const payload = {
            toolName: currentAssessment.formData.toolName,
            toolCategory: currentAssessment.formData.toolCategory,
            finalScore: currentAssessment.results.finalScore,
            riskLevel: currentAssessment.results.riskLevel,
            baseScore: currentAssessment.results.baseScore,
            dataClassification: currentAssessment.formData.dataClassification,
            useCase: currentAssessment.formData.useCase,
            reportType: 'pdf'
        };

        // Call Supabase function endpoint for premium template
        const { data: templateResponse, error } = await supabase.functions.invoke('premium-template', {
            body: payload
        });

        if (error) throw error;

        // Create a new window/tab with the premium template HTML
        const templateWindow = window.open('', '_blank');
        templateWindow.document.write(templateResponse);
        templateWindow.document.close();
        
        showMessage('Premium template loaded - follow the print instructions to save as PDF', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Export failed: ' + error.message, 'error');
    }
}

// Premium HTML export
async function exportPremiumHTML() {
    if (!currentUser) {
        showMessage('Please sign in to access premium exports', 'error');
        return;
    }
    
    const userTier = currentUser.user_metadata?.tier;
    if (userTier !== 'enterprise' && !isAdmin) {
        showLegacyEnterprisePaywall();
        return;
    }
    
    try {
        // Get current assessment data
        if (!currentAssessment) {
            showMessage('No assessment data available', 'error');
            return;
        }

        // Prepare the required parameters
        const payload = {
            toolName: currentAssessment.formData.toolName,
            toolCategory: currentAssessment.formData.toolCategory,
            finalScore: currentAssessment.results.finalScore,
            riskLevel: currentAssessment.results.riskLevel,
            baseScore: currentAssessment.results.baseScore,
            dataClassification: currentAssessment.formData.dataClassification,
            useCase: currentAssessment.formData.useCase,
            reportType: 'html'
        };

        // Call Supabase function endpoint for premium template
        const { data: templateResponse, error } = await supabase.functions.invoke('premium-template', {
            body: payload
        });

        if (error) throw error;

        // Create a new window/tab with the premium template HTML
        const templateWindow = window.open('', '_blank');
        templateWindow.document.write(templateResponse);
        templateWindow.document.close();
        
        showMessage('HTML report opened in new tab', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Export failed: ' + error.message, 'error');
    }
}

function exportAssessmentJSON() {
    try {
        if (!currentAssessment) {
            showMessage('No assessment data available', 'error');
            return;
        }
        
        // Create a Blob with the JSON data
        const jsonString = JSON.stringify(currentAssessment, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-risk-assessment-${Date.now()}.json`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('JSON data downloaded', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Export failed: ' + error.message, 'error');
    }
}

// Utility: Save assessment to Supabase
async function saveToDatabase() {
    if (!currentUser) {
        showMessage('Please sign in to save assessments', 'error');
        return;
    }

    const formData = collectFormData();
    const validation = validateFormData(formData);
    
    if (!validation.valid) {
        showMessage(validation.message, 'error');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('assessments')
            .insert([{
                user_id: currentUser.id,
                tool_name: validation.sanitizedData.toolName,
                assessment_data: validation.sanitizedData,
                risk_score: currentResults.finalScore,
                risk_level: currentResults.riskLevel
            }]);

        if (error) throw error;
        showMessage('Assessment saved successfully', 'success');

    } catch (error) {
        console.error('Error saving assessment:', error);
        showMessage('Failed to save assessment: ' + error.message, 'error');
    }
}

// Utility: Start a new assessment
function startNewAssessment() {
    currentAssessment = null;
    showStep(1);
    document.getElementById('assessmentForm').reset();
    // Clear selected class from radio buttons
    document.querySelectorAll('.classification-option.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

// Utility: Display messages to the user
function showMessage(message, type = 'success') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message message-${type}`;
    messageContainer.textContent = message;
    
    // Prepend to form content
    const formContent = document.querySelector('.form-content');
    formContent.prepend(messageContainer);
    
    // Auto-dismiss
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        messageContainer.style.transition = 'opacity 0.5s ease';
        setTimeout(() => messageContainer.remove(), 500);
    }, 5000);
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    // Attach listeners or perform any initial setup
    console.log("DOM fully loaded and parsed");
});

// Close export menu if clicked outside
document.addEventListener('click', function(event) {
    const exportContainer = document.querySelector('.btn-group > div');
    const menu = document.getElementById('exportMenu');
    if (menu && !exportContainer.contains(event.target)) {
        hideExportMenu();
    }
});

// Allow selection styling for radio buttons
document.addEventListener('DOMContentLoaded', () => {
    const classificationOptions = document.querySelectorAll('.classification-option');
    classificationOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        if (radio.checked) {
            option.classList.add('selected');
        }
    });
});

// Form validation constants
const MAX_TOOL_NAME_LENGTH = 100;
const MAX_URL_LENGTH = 2048; // Common browser limit
const MAX_CONTEXT_LENGTH = 5000;

// Validate assessment form data
function validateFormData(formData) {
    // Tool name validation
    if (!formData.toolName || typeof formData.toolName !== 'string') {
        return { valid: false, message: 'Tool name is required' };
    }
    if (formData.toolName.length > MAX_TOOL_NAME_LENGTH) {
        return { valid: false, message: `Tool name must be less than ${MAX_TOOL_NAME_LENGTH} characters` };
    }
    formData.toolName = sanitizeInput(formData.toolName);

    // URL validation
    if (formData.toolUrl) {
        try {
            const url = new URL(formData.toolUrl);
            if (formData.toolUrl.length > MAX_URL_LENGTH) {
                return { valid: false, message: 'URL is too long' };
            }
            if (!['http:', 'https:'].includes(url.protocol)) {
                return { valid: false, message: 'Invalid URL protocol' };
            }
        } catch (e) {
            return { valid: false, message: 'Invalid URL format' };
        }
    }

    // Additional context validation
    if (formData.additionalContext) {
        if (formData.additionalContext.length > MAX_CONTEXT_LENGTH) {
            return { valid: false, message: 'Additional context is too long' };
        }
        formData.additionalContext = sanitizeInput(formData.additionalContext);
    }

    // Data classification validation
    if (!formData.dataClassification) {
        return { valid: false, message: 'Please select a data classification' };
    }

    // Category validation
    if (formData.toolCategory && !['conversational-ai', 'code-assistant', 'content-generation', 
        'data-analysis', 'productivity', 'design-creative', 'translation', 'other'].includes(formData.toolCategory)) {
        return { valid: false, message: 'Invalid tool category' };
    }

    // Use case validation
    if (formData.useCase && !['legal-compliance', 'finance-accounting', 'hr-executive', 
        'customer-support', 'development', 'marketing', 'research', 'general'].includes(formData.useCase)) {
        return { valid: false, message: 'Invalid use case' };
    }

    return { valid: true, sanitizedData: formData };
}

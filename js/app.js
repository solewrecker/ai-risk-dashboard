// Global state (declared first to avoid initialization errors)
let currentStep = 1;
let currentAssessment = null;

// Configuration
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';
let supabase;

// Security constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128; 
const LOCKOUT_TIME = 15 * 60 * 1000;

// Authentication state
let currentUser = null;
let isAdmin = false;

// Track login attempts and lockouts
const failedAttempts = new Map();
const lockoutTimes = new Map();

// Initialize the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
    setupEventListeners();
});

// Main initialization function
function initializeSupabase() {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized.');
        
        // Now that supabase is initialized, set up the auth listener
        supabase.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null;
            isAdmin = session?.user?.user_metadata?.role === 'admin';
            updateUIForAuth();
        });
    } else {
        console.error('Supabase client not found. Make sure the Supabase script is loaded.');
    }
}

// Setup all other event listeners
function setupEventListeners() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAuthModal();
            }
        });
    }
}

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
            message: `Too many failed attempts. Please try again in 15 minutes`
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
    let isValid = false;
    
    // Validate current step before proceeding
    if (currentStep === 1) {
        isValid = validateStep1();
    } else if (currentStep === 2) {
        isValid = validateStep2();
    } else {
        // No validation for other steps
        isValid = true;
    }
    
    if (isValid) {
        currentStep++;
        if (currentStep === 3) {
            startAssessment();
        } else {
            showStep(currentStep);
        }
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

// New function to fetch assessment from the database using the new schema
async function getToolFromDatabase(formData) {
    if (!supabase) {
        console.warn('Supabase client not available for DB check.');
        return null;
    }

    const toolName = formData.toolName.trim();
    const toolVersion = formData.toolVersion; // 'free' or 'enterprise'

    console.log(`Searching database for: ${toolName} (Version: ${toolVersion})`);

    try {
        // Construct a query that is more specific
        // It looks for a name match AND tries to find a version in the name string itself.
        const { data, error } = await supabase
            .from('ai_tools')
            .select('*')
            .ilike('name', `%${toolName}%`) // Case-insensitive search
            .ilike('name', `%${toolVersion}%`) // Check if version is in the name
            .limit(1);

        if (error) {
            console.error('Error fetching tool from database:', error);
            return null;
        }

        if (data && data.length > 0) {
            console.log('Found matching assessment in database:', data[0]);
            // Apply client-side multipliers to the database score
            const finalResults = applyClientSideMultipliers(data[0], formData);
            return finalResults;
        } else {
            console.log('No specific match found. Will perform a broader search.');
            // Fallback to a broader search if no version-specific one is found
            const { data: genericData, error: genericError } = await supabase
                .from('ai_tools')
                .select('*')
                .ilike('name', `%${toolName}%`)
                .limit(1);

            if (genericError) {
                console.error('Error during fallback search:', genericError);
                return null;
            }

            if (genericData && genericData.length > 0) {
                console.log('Found generic assessment:', genericData[0]);
                const finalResults = applyClientSideMultipliers(genericData[0], formData);
                return finalResults;
            }
        }

        console.log('No assessment found in database for this tool.');
        return null;

    } catch (err) {
        console.error('A critical error occurred in getToolFromDatabase:', err);
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
    const resultsCard = document.getElementById('resultsCard');
    if (!resultsCard) return;

    // --- Main Score and Title ---
    const toolName = results.formData.toolName || results.name || 'Unknown Tool';
    const finalScore = results.finalScore;
    const riskLevel = results.riskLevel;

    document.getElementById('toolNameResults').textContent = toolName;
    document.getElementById('mainScore').textContent = finalScore;
    document.getElementById('riskLevel').textContent = riskLevel;

    const riskClass = `risk-${riskLevel.toLowerCase()}`;
    const scoreCard = document.querySelector('.main-score-card');
    scoreCard.className = `main-score-card ${riskClass}`;

    // --- Score Description ---
    const scoreDescription = getScoreDescription(finalScore, riskLevel, toolName);
    document.getElementById('scoreDescription').innerHTML = scoreDescription;

    // --- Data Source Indicator ---
    const dataSourceEl = document.getElementById('dataSource');
    if (results.source === 'database') {
        dataSourceEl.textContent = 'Based on Verified Assessment';
        dataSourceEl.className = 'data-source verified';
    } else {
        dataSourceEl.textContent = 'Based on Heuristic Analysis';
        dataSourceEl.className = 'data-source estimated';
    }

    // --- Insights Grid (Category Scores) ---
    const insightsGrid = document.getElementById('insightsGrid');
    const breakdown = results.breakdown || {};
    const scores = breakdown.scores || {};

    const insights = [
        { id: 'dataStorageScore', title: 'Data Storage & Security', score: scores.dataStorage, icon: 'database' },
        { id: 'trainingUsageScore', title: 'Training Data Usage', score: scores.trainingUsage, icon: 'robot' },
        { id: 'accessControlsScore', title: 'Access Controls', score: scores.accessControls, icon: 'key' },
        { id: 'complianceScore', title: 'Compliance & Legal', score: scores.complianceRisk, icon: 'gavel' },
        { id: 'vendorTransparencyScore', title: 'Vendor Transparency', score: scores.vendorTransparency, icon: 'eye' }
    ];

    insightsGrid.innerHTML = insights.map(item => {
        const score = item.score ?? 'N/A';
        const level = getRiskLevel(score);
        return `
            <div class="insight-card risk-${level.toLowerCase()}">
                <div class="insight-icon">
                    <i class="fas fa-${item.icon}"></i>
                </div>
                <div class="insight-content">
                    <span class="insight-title">${item.title}</span>
                    <span class="insight-value">${score}</span>
                </div>
            </div>
        `;
    }).join('');

    // --- Recommendations ---
    const recommendationsList = document.getElementById('recommendationsList');
    const recommendations = results.recommendations || generateRecommendations(finalScore, results.formData);
    recommendationsList.innerHTML = recommendations.map(rec => `
        <li class="recommendation-item">
            <span class="rec-bullet"></span>
            <span class="rec-text">${rec}</span>
        </li>
    `).join('');

    // --- Detailed Breakdown ---
    const detailedBreakdownContainer = document.getElementById('detailedBreakdown');
    detailedBreakdownContainer.innerHTML = generateDetailedBreakdown(results.breakdown, results.formData);

    // --- Update Export Buttons ---
    // Ensure export buttons are visible and updated
    document.getElementById('exportMenu').style.visibility = 'visible';
    currentAssessment = results; // Make sure the global assessment is set for export
}

// Helper to generate score description
function getScoreDescription(score, level, toolName) {
    let description = '';
    if (level === 'Critical') {
        description = `<strong>Immediate Action Required.</strong> With a score of ${score}, ${toolName} poses a critical risk and should not be used with sensitive company data until significant controls are implemented.`;
    } else if (level === 'High') {
        description = `<strong>Requires Review.</strong> With a score of ${score}, ${toolName} poses a high risk. Use should be restricted to non-sensitive data, and a formal review is required before broader deployment.`;
    } else if (level === 'Medium') {
        description = `<strong>Use With Caution.</strong> With a score of ${score}, ${toolName} presents a medium risk. It may be suitable for general business use, but should not handle confidential or regulated data.`;
    } else {
        description = `<strong>Approved for General Use.</strong> With a score of ${score}, ${toolName} is considered low risk and is approved for general productivity and use with non-sensitive data.`;
    }
    return `<p>${description}</p>`;
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

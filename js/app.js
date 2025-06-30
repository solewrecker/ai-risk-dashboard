// Global state (declared first to avoid initialization errors)
let currentStep = 1;
let currentAssessment = null;

// Configuration
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';

// Initialize Supabase with CORS options
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        storageKey: 'ai-assessment-auth',
        storage: window.localStorage
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

function updateUIForAuth() {
    const saveButton = document.querySelector('button[onclick="saveToDatabase()"]');
    const loginSection = document.getElementById('loginSection');
    
    if (saveButton) {
        if (isAdmin) {
            saveButton.style.display = 'inline-flex';
            saveButton.innerHTML = '💾 Save to Database (Admin)';
        } else {
            saveButton.style.display = 'none';
        }
    }
    
    if (loginSection) {
        if (currentUser) {
            // User is logged in - show user info and account options
            const userTier = currentUser.user_metadata?.tier || 'free';
            loginSection.innerHTML = `
                <div style="text-align: center; margin-bottom: 1rem; padding: 0.75rem; background: #f0fdf4; border-radius: 0.5rem; border: 1px solid #bbf7d0;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <span style="color: #166534;">✓ ${currentUser.email}</span>
                        <span style="background: ${userTier === 'enterprise' ? '#fbbf24' : '#94a3b8'}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
                            ${userTier}
                        </span>
                        ${isAdmin ? '<span style="color: #dc2626; font-weight: 600; font-size: 0.75rem;">[ADMIN]</span>' : ''}
                    </div>
                    <div style="margin-top: 0.5rem; display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
                        ${userTier === 'free' ? '<button onclick="showUpgradeModal()" style="padding: 0.25rem 0.75rem; background: #fbbf24; color: #92400e; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; font-weight: 600;">⭐ Upgrade</button>' : ''}
                        <button onclick="showDashboard()" style="padding: 0.25rem 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; font-weight: 600;">📊 Dashboard</button>
                        <button onclick="signOut()" style="padding: 0.25rem 0.75rem; background: #fee2e2; border: 1px solid #fecaca; border-radius: 0.25rem; color: #991b1b; cursor: pointer; font-size: 0.75rem;">Sign Out</button>
                    </div>
                </div>
            `;
        } else {
            // User not logged in - show auth options
            loginSection.innerHTML = `
                <div id="authContainer" style="text-align: center; margin-bottom: 1rem; padding: 1rem; background: #eff6ff; border-radius: 0.5rem; border: 1px solid #dbeafe;">
                    <div style="margin-bottom: 1rem;">
                        <h3 style="margin: 0 0 0.5rem 0; color: #1e40af; font-size: 1rem;">🔐 Sign in to save assessments & export reports</h3>
                        <p style="margin: 0; color: #64748b; font-size: 0.875rem;">Create an account to save your assessments and access professional exports</p>
                    </div>
                    
                    <div id="authTabs" style="margin-bottom: 1rem;">
                        <button id="signInTab" onclick="showAuthTab('signin')" style="padding: 0.5rem 1rem; margin-right: 0.25rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem 0.375rem 0 0; cursor: pointer; font-weight: 600;">Sign In</button>
                        <button id="signUpTab" onclick="showAuthTab('signup')" style="padding: 0.5rem 1rem; margin-left: 0.25rem; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; border-radius: 0.375rem 0.375rem 0 0; cursor: pointer;">Sign Up</button>
                    </div>
                    
                    <div id="signInForm" style="display: block;">
                        <div style="margin-bottom: 0.75rem;">
                            <input type="email" id="signInEmail" placeholder="Email address" style="width: 100%; max-width: 280px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <input type="password" id="signInPassword" placeholder="Password" style="width: 100%; max-width: 280px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;">
                        </div>
                        <button onclick="signInUser()" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600; font-size: 0.875rem;">Sign In</button>
                    </div>
                    
                    <div id="signUpForm" style="display: none;">
                        <div style="margin-bottom: 0.75rem;">
                            <input type="email" id="signUpEmail" placeholder="Email address" style="width: 100%; max-width: 280px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;">
                        </div>
                        <div style="margin-bottom: 0.75rem;">
                            <input type="password" id="signUpPassword" placeholder="Create password" style="width: 100%; max-width: 280px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <select id="signUpTier" style="width: 100%; max-width: 280px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;">
                                <option value="free">🆓 Free Tier - Basic exports</option>
                                <option value="enterprise">⭐ Enterprise - $49/month</option>
                            </select>
                        </div>
                        <button onclick="signUpUser()" style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600; font-size: 0.875rem;">Create Account</button>
                    </div>
                    
                    <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
                        Continue as guest to try the assessment tool
                    </div>
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

// NEW: Enhanced auth functions for regular users

function showAuthTab(tab) {
    const signInTab = document.getElementById('signInTab');
    const signUpTab = document.getElementById('signUpTab');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    
    if (tab === 'signin') {
        signInTab.style.background = '#3b82f6';
        signInTab.style.color = 'white';
        signUpTab.style.background = '#f8fafc';
        signUpTab.style.color = '#64748b';
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
    } else {
        signUpTab.style.background = '#3b82f6';
        signUpTab.style.color = 'white';
        signInTab.style.background = '#f8fafc';
        signInTab.style.color = '#64748b';
        signUpForm.style.display = 'block';
        signInForm.style.display = 'none';
    }
}

async function signInUser() {
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;
    
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
        
        showMessage('✅ Signed in successfully!', 'success');
        
    } catch (error) {
        console.error('Sign in error:', error);
        showMessage('Sign in failed: ' + error.message, 'error');
    }
}

async function signUpUser() {
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const tier = document.getElementById('signUpTier').value;
    
    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        // Sign up the user
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
        
        if (data.user) {
            // Create user subscription record
            const { error: subError } = await supabase
                .from('user_subscriptions')
                .insert([
                    {
                        user_id: data.user.id,
                        tier: tier
                    }
                ]);
            
            if (subError) {
                console.warn('Failed to create subscription record:', subError);
                // Don't throw - user is still created successfully
            }
            
            if (data.user.email_confirmed_at) {
                showMessage('✅ Account created successfully!', 'success');
            } else {
                showMessage('📧 Account created! Please check your email to confirm your account.', 'success');
            }
        } else {
            showMessage('Account created! Please check your email to confirm your account.', 'success');
        }
        
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
    'marketing': 0.9
};

// Fallback database removed - using Supabase as primary data source for consistency

// Global state variables moved to top of script

// Step navigation
function nextStep() {
    if (currentStep === 1) {
        if (!validateStep1()) return;
        showStep(2);
    } else if (currentStep === 2) {
        if (!validateStep2()) return;
        showStep(3);
        startAssessment();
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
    console.log('🚀 Starting assessment generation for:', formData.toolName);
    
    try {
        // Try to get tool from database first
        const baseScoreResult = await getToolFromDatabase(formData);
        const baseScore = baseScoreResult.score;
        const source = baseScoreResult.source;
        
        console.log('📊 Base score retrieved:', baseScore, 'from', source);
        
        const adjustedScore = applyMultipliers(baseScore, formData);
        
        // Debug logging
        console.log('=== TARGETED MULTIPLIER DEBUG ===');
        console.log('Tool:', formData.toolName, formData.toolVersion);
        console.log('Base Score:', baseScore, 'Source:', source);
        console.log('Data Classification:', formData.dataClassification, 'Multiplier:', DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification]);
        console.log('Use Case:', formData.useCase, 'Multiplier:', USE_CASE_MULTIPLIERS[formData.useCase]);
        
        // Show which sections are affected
        const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification] || 1.0;
        const useCaseMultiplier = USE_CASE_MULTIPLIERS[formData.useCase] || 1.0;
        console.log('🎯 Sections affected by Data Classification multiplier:', 'Data Storage & Compliance Risk');
        console.log('🎯 Sections affected by Use Case multiplier:', 'Compliance Risk & Access Controls');
        console.log('📊 Final Score:', Math.min(100, Math.round(adjustedScore)));
        console.log('==========================================');
        
        // Store tool data for breakdown generation
        window.lastToolData = baseScoreResult;
        
        const riskLevel = getRiskLevel(adjustedScore);
    
    console.log('📋 Generating breakdown...');
    const breakdown = await generateBreakdown(formData);
    console.log('✅ Breakdown complete');
    console.log('🔍 Breakdown structure:', breakdown);
        
        const recommendations = generateRecommendations(adjustedScore, formData);
        console.log('✅ Assessment complete');
        
        return {
            toolName: formData.toolName,
            baseScore: baseScore,
            finalScore: Math.min(100, Math.round(adjustedScore)),
            riskLevel: riskLevel,
            breakdown: breakdown,
            recommendations: recommendations,
            timestamp: new Date().toISOString(),
            source: source,
            enhancedInfo: window.currentEnhancedInfo || null
        };
    } catch (error) {
        console.error('❌ Error in assessment generation:', error);
        throw error; // Re-throw so the calling function can handle it
    }
}

async function getToolFromDatabase(formData) {
    // Try Supabase directly (fallback database removed for consistency)
    console.log('🔍 Querying Supabase for tool data...');
    try {
        // Build search term based on tool name and version
        const searchTerms = buildSearchTerms(formData.toolName, formData.toolVersion);
        
        console.log('Searching Supabase for:', searchTerms);
        
        // Try each search term until we find a match
        for (const searchTerm of searchTerms) {
            console.log(`🔍 Trying Supabase search term: "${searchTerm}"`);
            
            // Search for exact version match first
            const { data, error } = await supabase
                .from('ai_tools')
                .select('name, total_score, detailed_assessment, breakdown, details, risk_level, compliance_score, data_storage_score, training_usage_score, access_controls_score, vendor_transparency_score')
                .ilike('name', `%${searchTerm}%`)
                .order('name', { ascending: true })
                .limit(5); // Get more results to find best version match
            
            if (error) {
                console.warn('Supabase query error (likely CORS):', error.message);
                continue;
            }
            
            if (data && data.length > 0) {
                console.log(`🔍 Found ${data.length} matches:`, data.map(t => `${t.name} (${t.total_score})`));
                
                // Find the best match for the requested version with enhanced priority
                let bestMatch = data[0]; // Default to first
                let exactMatch = null;
                let versionMatch = null;
                
                const requestedVersion = formData.toolVersion.toLowerCase();
                console.log(`🎯 Looking for ${requestedVersion} version among:`, data.map(t => t.name));
                
                for (const tool of data) {
                    const toolNameLower = tool.name.toLowerCase();
                    
                    // PRIORITY 1: Exact version match (Claude.ai Enterprise)
                    if (requestedVersion === 'enterprise' && toolNameLower.includes('enterprise')) {
                        exactMatch = tool;
                        console.log(`🎯 EXACT ENTERPRISE MATCH: ${tool.name} (score: ${tool.total_score})`);
                        break; // Stop searching, we found the perfect match
                    } else if (requestedVersion === 'free' && toolNameLower.includes('free')) {
                        exactMatch = tool;
                        console.log(`🎯 EXACT FREE MATCH: ${tool.name} (score: ${tool.total_score})`);
                        break;
                    }
                    
                    // PRIORITY 2: Version-aware match (avoid wrong versions)
                    if (requestedVersion === 'enterprise' && !toolNameLower.includes('free')) {
                        if (!versionMatch) versionMatch = tool;
                    } else if (requestedVersion === 'free' && !toolNameLower.includes('enterprise')) {
                        if (!versionMatch) versionMatch = tool;
                    }
                }
                
                // Select best match in priority order
                bestMatch = exactMatch || versionMatch || bestMatch;
                
                console.log(`🎯 SELECTED MATCH: ${bestMatch.name} (score: ${bestMatch.total_score})`);
                console.log('Detailed assessment available:', !!bestMatch.detailed_assessment);
                
                return { 
                    score: bestMatch.total_score, 
                    source: 'database',
                    toolData: bestMatch,
                    hasDetailedAssessment: !!bestMatch.detailed_assessment
                };
            }
        }
        
        console.log('Tool not found in Supabase, using heuristic scoring');
        
    } catch (error) {
        console.warn('Supabase lookup failed (likely CORS):', error.message);
    }
    
    // Fall back to heuristic
    return { 
        score: generateHeuristicScore(formData), 
        source: 'heuristic' 
    };
}

// checkFallbackDatabase function removed - using Supabase directly

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
    // Break down the base score into components proportionally
    // Based on framework: Data Storage(25), Training(25), Access(20), Compliance(20), Vendor(10)
    const scoreBreakdown = {
        dataStorage: Math.round(baseScore * 0.25), // 25% of total
        trainingUsage: Math.round(baseScore * 0.25), // 25% of total
        accessControls: Math.round(baseScore * 0.20), // 20% of total
        complianceRisk: Math.round(baseScore * 0.20), // 20% of total
        vendorTransparency: Math.round(baseScore * 0.10) // 10% of total
    };
    
    // Apply targeted data classification multipliers
    const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification] || 1.0;
    scoreBreakdown.dataStorage *= dataMultiplier; // Data storage most affected by data type
    scoreBreakdown.complianceRisk *= dataMultiplier; // Compliance risk varies by data type
    
    // Apply targeted use case multipliers  
    const useCaseMultiplier = USE_CASE_MULTIPLIERS[formData.useCase] || 1.0;
    scoreBreakdown.complianceRisk *= useCaseMultiplier; // Legal use cases need higher compliance
    scoreBreakdown.accessControls *= useCaseMultiplier; // Sensitive use cases need better controls
    
    // Round the final component scores
    scoreBreakdown.dataStorage = Math.round(scoreBreakdown.dataStorage);
    scoreBreakdown.trainingUsage = Math.round(scoreBreakdown.trainingUsage);
    scoreBreakdown.accessControls = Math.round(scoreBreakdown.accessControls);
    scoreBreakdown.complianceRisk = Math.round(scoreBreakdown.complianceRisk);
    scoreBreakdown.vendorTransparency = Math.round(scoreBreakdown.vendorTransparency);
    
    // Store breakdown for use in results display
    window.currentScoreBreakdown = scoreBreakdown;
    
    // Recalculate total score from adjusted components
    const adjustedScore = scoreBreakdown.dataStorage + 
                        scoreBreakdown.trainingUsage + 
                        scoreBreakdown.accessControls + 
                        scoreBreakdown.complianceRisk + 
                        scoreBreakdown.vendorTransparency;
    
    return adjustedScore;
}

function getRiskLevel(score) {
    if (score >= 80) return 'critical';
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
    if (!currentAssessment) {
        showMessage('No assessment to export', 'error');
        return;
    }

    console.log('🚀 Starting free PDF export...');
    
    try {
        // Generate a simplified printable template
        const printableContent = generatePrintableHTML(currentAssessment);
        
        // Create a hidden container for rendering
        const renderContainer = document.createElement('div');
        renderContainer.style.position = 'absolute';
        renderContainer.style.left = '-9999px';
        renderContainer.style.top = '0';
        renderContainer.style.width = '800px';
        renderContainer.innerHTML = printableContent;
        document.body.appendChild(renderContainer);
        
        // Use html2canvas to capture the content
        const canvas = await html2canvas(renderContainer, {
            scale: 2, // Improve resolution
            useCORS: true, // For images if any
            logging: true
        });
        
        // Clean up the render container
        document.body.removeChild(renderContainer);
        
        // Use jsPDF to create the PDF
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('jsPDF library not loaded');
        }
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgData = canvas.toDataURL('image/png');
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Download PDF
        const fileName = `AI-Risk-Assessment-${currentAssessment.formData.toolName.replace(/\s/g, '-')}-Free.pdf`;
        pdf.save(fileName);
        
        showMessage('✅ Free PDF downloaded successfully', 'success');
        
    } catch (error) {
        console.error('❌ Free PDF export failed:', error);
        showMessage('Failed to generate free PDF: ' + error.message, 'error');
    }
}

// Premium PDF export (server-side generation)
async function exportPremiumPDF() {
    if (!currentAssessment) {
        showMessage('No assessment to export', 'error');
        return;
    }

    // Check user authentication
    if (!currentUser) {
        showMessage('Please sign in to access premium exports', 'warning');
        showAuthTab('signin');
        return;
    }
    
    const userTier = currentUser.user_metadata?.tier;
    if (userTier !== 'enterprise' && !isAdmin) {
        showUpgradeModal();
        return;
    }

    showMessage('🚀 Generating your Enterprise PDF report...', 'success');
    
    try {
        const { data, error } = await supabase.functions.invoke('premium-template', {
            body: { 
                assessment: currentAssessment,
                tier: 'enterprise'
            },
        });

        if (error) {
            throw new Error(`Server error: ${error.message}`);
        }
        
        // The function returns a base64 encoded PDF
        if (data.pdf) {
            const pdfBlob = b64toBlob(data.pdf, 'application/pdf');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Trigger download
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = `AI-Risk-Assessment-${currentAssessment.formData.toolName.replace(/\s/g, '-')}-Enterprise.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pdfUrl);
            
            showMessage('✅ Enterprise PDF downloaded successfully', 'success');
        } else {
            throw new Error(data.error || 'Unknown error generating PDF');
        }
        
    } catch (error) {
        console.error('❌ Enterprise PDF export failed:', error);
        showMessage('Failed to generate Enterprise PDF: ' + error.message, 'error');
    }
}

// Helper to convert base64 to Blob
function b64toBlob(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
}

// Generates a simplified, printable HTML for the free PDF export
function generatePrintableHTML(assessment) {
    const { formData, results } = assessment;
    
    // Basic styles for the printable version
    const styles = `
        <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { font-size: 24px; margin: 0; }
            h2 { font-size: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 16px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .item { background: #f9f9f9; padding: 10px; border-radius: 5px; }
            .item-label { font-weight: bold; }
            .score { text-align: center; margin-bottom: 20px; }
            .score-number { font-size: 48px; font-weight: bold; }
            .score-label { font-size: 18px; }
        </style>
    `;
    
    // HTML content
    return `
        ${styles}
        <div class="header">
            <h1>AI Tool Risk Assessment Report</h1>
        </div>
        
        <div class="score">
            <div class="score-number">${results.finalScore}</div>
            <div class="score-label">${results.riskLevel.toUpperCase()} RISK</div>
        </div>
        
        <h2>Tool Information</h2>
        <div class="section grid">
            <div class="item"><span class="item-label">Tool Name:</span> ${formData.toolName}</div>
            <div class="item"><span class="item-label">Version:</span> ${formData.toolVersion}</div>
            <div class="item"><span class="item-label">Category:</span> ${formData.toolCategory || 'N/A'}</div>
            <div class="item"><span class="item-label">Use Case:</span> ${formData.useCase || 'N/A'}</div>
        </div>
        
        <h2>Data Classification</h2>
        <div class="section">
            <div class="item"><span class="item-label">Data Type:</span> ${formData.dataClassification}</div>
        </div>
        
        <h2>Risk Breakdown</h2>
        <div class="section grid">
            ${Object.entries(results.breakdown).map(([category, data]) => `
                <div class="item">
                    <span class="item-label">${category}:</span> ${data.score}
                </div>
            `).join('')}
        </div>
        
        <h2>Key Recommendations</h2>
        <div class="section">
            <ul>
                ${results.recommendations.slice(0, 3).map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Premium HTML export
async function exportPremiumHTML() {
    if (!currentAssessment) {
        showMessage('No assessment to export', 'error');
        return;
    }

    try {
        // Use the new template binding system
        if (window.TemplateBinding) {
            const binding = new window.TemplateBinding('./templates/export-template.html');
            const fullHTML = await binding.bind(currentAssessment);
            
            const blob = new Blob([fullHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `AI-Risk-Assessment-${currentAssessment.formData.toolName.replace(/\s/g, '-')}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showMessage('✅ HTML report downloaded successfully', 'success');
        } else {
            throw new Error('Template binding system not loaded');
        }
    } catch (error) {
        console.error('❌ HTML export failed:', error);
        showMessage('Failed to generate HTML report: ' + error.message, 'error');
    }
}

// JSON data export
function exportAssessmentJSON() {
    if (!currentAssessment) {
        showMessage('No assessment to export', 'error');
        return;
    }
    
    const jsonString = JSON.stringify(currentAssessment, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Risk-Assessment-${currentAssessment.formData.toolName.replace(/\s/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('✅ JSON data downloaded successfully', 'success');
}

// Utility: Save assessment to Supabase
async function saveToDatabase() {
    if (!currentAssessment) {
        showMessage('No assessment to save', 'error');
        return;
    }
    
    if (!currentUser || !isAdmin) {
        showMessage('You must be an admin to save assessments', 'error');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('assessments')
            .insert([
                { 
                    user_id: currentUser.id,
                    tool_name: currentAssessment.formData.toolName,
                    assessment_data: currentAssessment
                }
            ]);
        
        if (error) throw error;
        
        showMessage('✅ Assessment saved successfully!', 'success');
        
    } catch (error) {
        console.error('Save to database error:', error);
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

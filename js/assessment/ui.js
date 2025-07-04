// js/assessment/ui.js
// Handles UI updates, step navigation, and general DOM manipulation.
import { getCurrentUser, getIsAdmin } from './auth.js';

let currentStep = 1;

// --- Step Navigation ---
export function nextStep(onStartAssessment) {
    let isValid = false;
    if (currentStep === 1) {
        isValid = validateStep1();
    } else if (currentStep === 2) {
        isValid = validateStep2();
    } else {
        isValid = true;
    }

    if (isValid) {
        currentStep++;
        if (currentStep === 3) {
            onStartAssessment(); // Callback to main.js
        } else {
            showStep(currentStep);
        }
    }
}

export function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

export function showStep(step) {
    document.querySelectorAll('.step-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section${step}`).classList.add('active');

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

export function startNewAssessment() {
    showStep(1);
    document.getElementById('assessmentForm').reset();
    document.querySelectorAll('.classification-option.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

// --- UI Updates ---
export function updateUIForAuth() {
    const saveButton = document.getElementById('saveToDbBtn');
    const loginSection = document.getElementById('loginSection');
    const currentUser = getCurrentUser();
    const isAdmin = getIsAdmin();

    if (saveButton) {
        saveButton.style.display = isAdmin ? 'inline-flex' : 'none';
        if(isAdmin) saveButton.innerHTML = '<i class="fas fa-save"></i> Save to Database (Admin)';
    }

    if (loginSection) {
        if (currentUser) {
            const userTier = currentUser.user_metadata?.tier || 'free';
            const dashClass = isAdmin ? 'btn btn-primary' : 'btn btn-secondary';
            loginSection.innerHTML = `
                <div class="login-user"><i class="fas fa-check-circle"></i><span>${currentUser.email}</span></div>
                <div class="login-badges">
                    ${userTier === 'enterprise' ? '<span class="badge badge-enterprise">ENTERPRISE</span>' : ''}
                    ${isAdmin ? '<span class="badge badge-admin">ADMIN</span>' : ''}
                </div>
                <div class="login-actions">
                    <a href="dashboard.html" class="${dashClass}"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <button id="signOutBtn" class="btn btn-secondary"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
                </div>
            `;
        } else {
            loginSection.innerHTML = `
                <div class="login-user"><i class="fas fa-lock"></i><span>Sign in to save & export</span></div>
                <div class="login-actions">
                    <button id="showSignInModalBtn" class="btn btn-primary"><i class="fas fa-sign-in-alt"></i> Sign In</button>
                    <button id="showSignUpModalBtn" class="btn btn-secondary"><i class="fas fa-user-plus"></i> Create Account</button>
                </div>
            `;
        }
    }
}

export function showMessage(message, type = 'success') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message message-${type}`;
    messageContainer.textContent = message;
    
    const formContent = document.querySelector('.form-content');
    formContent.prepend(messageContainer);
    
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        setTimeout(() => messageContainer.remove(), 500);
    }, 5000);
}

// --- Validation ---
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

// --- Event Listeners Setup ---
export function setupEventListeners(callbacks) {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                callbacks.closeAuthModal();
            }
        });
    }

    // Event delegation for dynamically created auth buttons
    const loginSection = document.getElementById('loginSection');
    if (loginSection) {
        loginSection.addEventListener('click', (e) => {
            if (e.target.closest('#signOutBtn')) {
                callbacks.signOut();
            } else if (e.target.closest('#showSignInModalBtn')) {
                callbacks.showAuthModal('signin');
            } else if (e.target.closest('#showSignUpModalBtn')) {
                callbacks.showAuthModal('signup');
            }
        });
    }

    document.addEventListener('change', function(e) {
        if (e.target.name === 'dataClassification') {
            document.querySelectorAll('.classification-option').forEach(option => {
                option.classList.remove('selected');
            });
            e.target.closest('.classification-option').classList.add('selected');
        }
    });
} 
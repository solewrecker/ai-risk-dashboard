// js/dashboard/auth.js
// Handles user authentication, session management, and login UI. 

// This will be initialized in main.js
let supabaseClient = null;

// State variables
let currentUser = null;
let isAdmin = false;
let userTier = 'free';

export function initAuth(client) {
    supabaseClient = client;
}

export async function checkAuth() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            // Determine user tier
            userTier = currentUser.user_metadata?.tier || 'free';
            // Only treat explicit admin role as admin
            isAdmin = currentUser.user_metadata?.role === 'admin';
            
            console.log('User authenticated:', currentUser.email);
            console.log('User metadata:', currentUser.user_metadata);
            console.log('Tier:', userTier, 'Admin:', isAdmin);
            console.log('Role from metadata:', currentUser.user_metadata?.role);
            return true;
        } else {
            console.log('No active session');
            return false;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

export function showLoginSection() {
    const loginSection = document.getElementById('loginSection');
    if(loginSection) {
        loginSection.style.display = 'block';
        loginSection.innerHTML = `
            <div class="login-container">
                <h2>Please Sign In</h2>
                <p>You need to be signed in to access the dashboard.</p>
                <a href="index.html" class="btn btn-primary">Go to Login</a>
            </div>
        `;
    }
}

export function getCurrentUser() {
    return currentUser;
}

export function getIsAdmin() {
    return isAdmin;
}

export function getUserTier() {
    return userTier;
} 
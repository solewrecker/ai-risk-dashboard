// js/assessment/auth.js
// Handles user authentication, session management, and Supabase client initialization.

// --- Configuration ---
import { supabase } from '../supabase-client.js';
export { supabase };

// --- State ---
let currentUser = null;
let isAdmin = false;

// --- Public Functions ---
export function initializeSupabase(onAuthStateChange) {
    console.log('Supabase client initialized.');
    
    supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        isAdmin = session?.user?.user_metadata?.role === 'admin';
        onAuthStateChange(); // Callback to update UI
    });
}

export async function signInUser() {
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alert('Signed in successfully');
        closeAuthModal();
    } catch (error) {
        console.error('Sign in error:', error);
        alert('Sign in failed: ' + error.message);
    }
}

export async function signUpUser() {
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const tier = document.getElementById('signUpTier').value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { tier } }
        });
        if (error) throw error;
        alert('Account created! Please check your email for verification.');
        closeAuthModal();
    } catch (error) {
        console.error('Sign up error:', error);
        alert('Sign up failed: ' + error.message);
    }
}

export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        alert('Signed out successfully');
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Sign out failed: ' + error.message);
    }
}

export function getCurrentUser() {
    return currentUser;
}

export function getIsAdmin() {
    return isAdmin;
}

export function getIsEnterprise() {
    return currentUser?.user_metadata?.tier === 'enterprise';
}

export function getIsFree() {
    return !currentUser?.user_metadata?.tier || currentUser.user_metadata.tier === 'free';
}

// --- Auth Modal Logic ---
export function showAuthModal(tab = 'signin') {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        switchAuthTab(tab);
    }
}

export function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

export function switchAuthTab(tab) {
    document.getElementById('signInTab').classList.toggle('active', tab === 'signin');
    document.getElementById('signUpTab').classList.toggle('active', tab === 'signup');
    document.getElementById('signInForm').classList.toggle('active', tab === 'signin');
    document.getElementById('signUpForm').classList.toggle('active', tab === 'signup');
}
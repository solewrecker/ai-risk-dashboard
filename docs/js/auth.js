// js/auth.js
// Handles user authentication, session management, and Supabase client initialization.

// --- Configuration ---
import { supabase } from './supabase-client.js';
export { supabase };

// --- State ---
let currentUser = null;
let isAdmin = false;
let userTier = 'free';

// --- Public Functions ---
export function initializeSupabase(onAuthStateChange) {
    console.log('Supabase client initialized.');
    
    if (!supabase || !supabase.auth) {
        console.error('Supabase client or auth is not available. Make sure the client is properly initialized.');
        return;
    }
    
    supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        isAdmin = session?.user?.user_metadata?.role === 'admin';
        userTier = currentUser?.user_metadata?.tier || 'free';
        if (onAuthStateChange) {
            onAuthStateChange(currentUser); // Callback to update UI
        }
    });
}

export async function checkAuth() {
    try {
        if (!supabase || !supabase.auth) {
            console.error('Supabase client or auth is not available. Make sure the client is properly initialized.');
            return false;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            // Determine user tier
            userTier = currentUser.user_metadata?.tier || 'free';
            // Only treat explicit admin role as admin
            isAdmin = currentUser.user_metadata?.role === 'admin';
            
            console.log('User authenticated:', currentUser.email);
            console.log('User metadata:', currentUser.user_metadata);
            console.log('Tier:', userTier, 'Admin:', isAdmin);
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

export function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

export function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
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

export function getIsEnterprise() {
    return userTier === 'enterprise';
}

export function getIsFree() {
    return userTier === 'free';
}
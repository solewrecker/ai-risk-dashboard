// docs/js/supabase-client.js

// This file provides a consistent way to access the Supabase client across the application

// Constants for Supabase connection
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';

// Initialize Supabase client
let supabaseClient;

// Try to use the global client if available
if (typeof window !== 'undefined' && window.supabaseClient) {
    supabaseClient = window.supabaseClient;
    console.log('Using globally initialized Supabase client');
} 
// Otherwise, create a new client if the Supabase library is available
else if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Created new Supabase client');
    // Make it globally available
    window.supabaseClient = supabaseClient;
}
// If we're in a module context without window, try to import Supabase
else if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Created new Supabase client in module context');
}
else {
    console.error('Supabase client could not be initialized. Make sure the Supabase library is loaded.');
    // Create a dummy client to prevent errors
    supabaseClient = {
        auth: {
            onAuthStateChange: () => {},
            getSession: async () => ({ data: { session: null } }),
            signInWithPassword: async () => ({ error: new Error('Supabase not initialized') }),
            signUp: async () => ({ error: new Error('Supabase not initialized') }),
            signOut: async () => ({ error: new Error('Supabase not initialized') })
        }
    };
}

// Export the client
export const supabase = supabaseClient;

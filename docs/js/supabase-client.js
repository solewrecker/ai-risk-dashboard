// docs/js/supabase-client.js

// Use the global Supabase object loaded from CDN in index.html
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';

// Check if Supabase is available globally (from CDN)
let supabase;

// Initialize the global Supabase client if it doesn't exist
if (typeof window !== 'undefined') {
    if (window.supabase) {
        // Use the global Supabase object if available
        console.log('Using global Supabase client from CDN');
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else if (typeof window.supabaseClient !== 'undefined') {
        // Use existing client if already initialized
        console.log('Using existing Supabase client');
        supabase = window.supabaseClient;
    } else if (typeof window.createClient !== 'undefined') {
        // Use the global createClient function if available
        console.log('Creating Supabase client with global createClient');
        supabase = window.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Store for reuse
        window.supabaseClient = supabase;
    } else {
        // Fallback to mock implementation for pages that don't load the CDN
        console.log('Using mock Supabase client');
        supabase = createMockClient();
        // Store for reuse
        window.supabaseClient = supabase;
    }
} else {
    // Fallback for non-browser environments
    console.log('Using mock Supabase client (non-browser environment)');
    supabase = createMockClient();
}

// Export the Supabase client
export { supabase };

// Mock client implementation for pages that don't load the CDN
function createMockClient() {
    return {
        auth: {
            getSession: async () => {
                return { data: { session: null }, error: null };
            },
            onAuthStateChange: (callback) => {
                console.log('Auth state change listener registered (mock)');
                return () => {};
            },
            signInWithPassword: async () => {
                console.log('Mock sign in');
                return { error: new Error('Authentication not available in this view') };
            },
            signUp: async () => {
                console.log('Mock sign up');
                return { error: new Error('Authentication not available in this view') };
            },
            signOut: async () => {
                console.log('Mock sign out');
                return { error: null };
            }
        },
        from: (table) => ({
            select: () => ({
                execute: async () => ({ data: [], error: null }),
                eq: () => ({
                    execute: async () => ({ data: [], error: null }),
                    single: async () => ({ data: null, error: null })
                })
            }),
            insert: () => ({
                execute: async () => ({ data: { id: 'mock-id' }, error: null })
            }),
            update: () => ({
                eq: () => ({
                    execute: async () => ({ data: null, error: null })
                })
            }),
            delete: () => ({
                eq: () => ({
                    execute: async () => ({ data: null, error: null })
                })
            })
        })
    };
}
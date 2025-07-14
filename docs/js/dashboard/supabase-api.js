import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- Supabase Client --- 
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Supabase API Functions --- 
export async function loadAssessmentsApi() {
    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('loadAssessmentsApi(): Supabase fetch error:', error);
            throw error;
        }
        
        if (data) {
            console.log('loadAssessmentsApi(): Assessments fetched successfully.', data.length, 'items.');
            // Process fetched data to merge nested assessment_data properties
            return data.map(assessment => {
                if (assessment.assessment_data && typeof assessment.assessment_data === 'object') {
                    // Merge assessment_data properties into the top-level assessment object
                    return { ...assessment, ...assessment.assessment_data };
                }
                return assessment;
            });
        } else {
            console.log('loadAssessmentsApi(): No data received from Supabase.');
            return [];
        }

    } catch (error) {
        console.error('loadAssessmentsApi(): Error loading assessments:', error);
        throw error; // Re-throw to be handled by the caller
    }
}

export async function getSessionApi() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('getSessionApi(): Error getting session:', error);
    }
    return { session, error };
}

export { supabase }; // Export supabase instance if needed elsewhere (e.g., for storage uploads) 
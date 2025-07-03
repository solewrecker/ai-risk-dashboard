// js/assessment/api.js
// Handles all API calls to the Supabase backend.
import { supabase } from './auth.js';
import { applyClientSideMultipliers } from './scoring.js';

export async function fetchToolFromDatabase(formData) {
    if (!supabase) {
        console.warn('Supabase client not available for DB check.');
        return null;
    }

    const toolName = formData.toolName.trim();
    const toolVersion = formData.toolVersion.trim();
    console.log(`Searching DB for: ${toolName} (Version: ${toolVersion})`);

    try {
        // --- Attempt 1: Exact Phrase Match (e.g., "ChatGPT Free") ---
        const exactPhrase = `${toolName} ${toolVersion}`;
        console.log(`Attempt 1: Case-insensitive exact match for "${exactPhrase}"`);
        let { data, error } = await supabase
            .from('ai_tools')
            .select('*')
            .ilike('name', exactPhrase)
            .limit(1);

        if (data && data.length > 0) {
            console.log('Success (Attempt 1): Found exact phrase match.', data[0]);
            return applyClientSideMultipliers(data[0], formData);
        }

        // --- Attempt 2: Keyword Match (name contains both toolName and toolVersion) ---
        console.log(`Attempt 2: Keyword match for "${toolName}" and "${toolVersion}"`);
        ({ data, error } = await supabase
            .from('ai_tools')
            .select('*')
            .ilike('name', `%${toolName}%`)
            .ilike('name', `%${toolVersion}%`)
            .limit(1));

        if (data && data.length > 0) {
            console.log('Success (Attempt 2): Found keyword match.', data[0]);
            return applyClientSideMultipliers(data[0], formData);
        }

        // --- Attempt 3: Base Name Match (name contains only the toolName) ---
        console.log(`Attempt 3: Base name match for "${toolName}"`);
        ({ data, error } = await supabase
            .from('ai_tools')
            .select('*')
            .ilike('name', `%${toolName}%`)
            // Sort by creation date to get the most recent one if multiple exist
            .order('created_at', { ascending: false }) 
            .limit(1));
            
        if (data && data.length > 0) {
            console.log('Success (Attempt 3): Found base name match.', data[0]);
            return applyClientSideMultipliers(data[0], formData);
        }
        
        if (error) {
            console.error('Database query failed after all attempts:', error);
            return null;
        }

        console.log('No assessment found in database after all attempts.');
        return null;

    } catch (err) {
        console.error('Critical error in fetchToolFromDatabase:', err);
        return null;
    }
}

export async function saveToDatabase(assessment) {
    if (!supabase) return { error: { message: 'Not connected to database.' } };
    
    const { formData, results } = assessment;

    const record = {
        name: formData.toolName,
        category: formData.toolCategory,
        total_score: results.finalScore,
        risk_level: results.riskLevel,
        data_storage_score: results.breakdown.scores.dataStorage,
        training_usage_score: results.breakdown.scores.trainingUsage,
        access_controls_score: results.breakdown.scores.accessControls,
        compliance_score: results.breakdown.scores.complianceRisk,
        vendor_transparency_score: results.breakdown.scores.vendorTransparency,
        breakdown: results.breakdown,
        summary_and_recommendation: (results.recommendations || []).join(' '),
        // Add other new fields as needed from the assessment object
    };
    
    try {
        const { data, error } = await supabase
            .from('ai_tools')
            .insert([record])
            .select();
            
        if (error) {
            // Check for unique constraint violation
            if (error.code === '23505') { 
                console.warn(`Tool "${record.name}" already exists. Consider an update?`);
                return { error: { message: `An assessment for "${record.name}" already exists.`} };
            }
            throw error;
        }
        
        console.log('Successfully saved to database:', data);
        return { data };
    } catch (error) {
        console.error('Error saving to database:', error);
        return { error };
    }
} 
// js/assessment/api.js
// Handles all API calls to the Supabase backend.
import { supabase } from './auth.js';
import { applyClientSideMultipliers } from './scoring.js';

export async function getToolFromDatabase(formData) {
    if (!supabase) {
        console.warn('Supabase client not available for DB check.');
        return null;
    }

    const toolName = formData.toolName.trim();
    const toolVersion = formData.toolVersion; // 'free' or 'enterprise'
    console.log(`Searching DB for: ${toolName} (Version: ${toolVersion})`);

    try {
        const { data, error } = await supabase
            .from('ai_tools')
            .select('*')
            .ilike('name', `%${toolName}%`)
            .ilike('name', `%${toolVersion}%`)
            .limit(1);

        if (error) {
            console.error('Error fetching tool:', error);
            return null;
        }

        if (data && data.length > 0) {
            console.log('Found specific match:', data[0]);
            return applyClientSideMultipliers(data[0], formData);
        }

        // Fallback to a broader search
        const { data: genericData, error: genericError } = await supabase
            .from('ai_tools')
            .select('*')
            .ilike('name', `%${toolName}%`)
            .limit(1);

        if (genericError) {
            console.error('Error on fallback search:', genericError);
            return null;
        }
        
        if (genericData && genericData.length > 0) {
            console.log('Found generic match:', genericData[0]);
            return applyClientSideMultipliers(genericData[0], formData);
        }

        console.log('No assessment found in database.');
        return null;

    } catch (err) {
        console.error('Critical error in getToolFromDatabase:', err);
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
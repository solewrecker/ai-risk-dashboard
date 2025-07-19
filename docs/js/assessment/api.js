// js/assessment/api.js
// Handles all API calls to the Supabase backend.
import { supabase, getCurrentUser } from './auth.js';
import { applyClientSideMultipliers, getRiskLevel } from './scoring.js';

export async function getToolFromDatabase(formData) {
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
        console.error('Critical error in getToolFromDatabase:', err);
        return null;
    }
}

export async function saveToDatabase(assessment) {
    if (!supabase) return { error: { message: 'Not connected to database.' } };
    
    const { formData, finalScore, breakdown, recommendations } = assessment;
    const user = getCurrentUser();

    if (!user) {
        return { error: { message: 'User must be logged in to save an assessment.' } };
    }

    // Defensively re-calculate risk level to ensure it's always valid for the DB.
    const validRiskLevel = getRiskLevel(finalScore);

    // Store all details in assessment_data
    const record = {
        user_id: user.id,
        name: formData.toolName,
        vendor: assessment.vendor || null, // Add vendor
        license_type: assessment.license_type || null, // Add license_type
        primary_use_case: assessment.primary_use_case || null, // Add primary_use_case
        data_classification: formData.dataClassification,
        category: formData.toolCategory,
        total_score: finalScore,
        risk_level: validRiskLevel,
        data_storage_score: breakdown?.scores?.dataStorage ?? 0,
        training_usage_score: breakdown?.scores?.trainingUsage ?? 0,
        access_controls_score: breakdown?.scores?.accessControls ?? 0,
        compliance_score: breakdown?.scores?.complianceRisk ?? 0,
        vendor_transparency_score: breakdown?.scores?.vendorTransparency ?? 0,
        
        // Add explicit mapping for the missing root-level fields
        assessed_by: assessment.assessed_by || null,
        confidence: assessment.confidence || null,
        documentation_tier: assessment.documentation_tier || null,
        assessment_notes: assessment.assessment_notes || null,
        azure_permissions: assessment.azure_permissions || null,
        sources: assessment.sources || null,

        // Map compliance_certifications to an array of strings for the top-level column
        compliance_certifications: assessment.compliance_certifications || null,
        
        // Store the full, original assessment object in assessment_data without duplication
        assessment_data: assessment
    };
    
    try {
        const { data, error } = await supabase
            .from('assessments')
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
        
        // Increment total assessments created counter
        await incrementTotalAssessmentsCreated();
        
        console.log('Successfully saved to database:', data);
        return { data };
    } catch (error) {
        console.error('Error saving to database:', error);
        return { error };
    }
}

// New function to increment the total assessments created counter
async function incrementTotalAssessmentsCreated() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const currentTotal = user.user_metadata?.total_assessments_created || 0;
        const newTotal = currentTotal + 1;
        
        const { error } = await supabase.auth.updateUser({
            data: { total_assessments_created: newTotal }
        });
        
        if (error) {
            console.error('Failed to update total assessments created:', error);
        } else {
            console.log(`Updated total assessments created: ${currentTotal} → ${newTotal}`);
        }
    } catch (error) {
        console.error('Error incrementing total assessments created:', error);
    }
}
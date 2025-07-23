// js/assessment/api.js - Updated with clean schema
import { supabase, getCurrentUser } from './auth.js';
import { applyClientSideMultipliers, getRiskLevel } from './scoring.js';

export async function getToolFromDatabase(formData) {
    if (!supabase) {
        console.warn('Supabase client not available for DB check.');
        return null;
    }

    const toolName = formData.toolName?.trim();
    const licenseType = formData.toolVersion?.trim(); // This is actually license_type
    
    if (!toolName) {
        console.warn('No tool name provided for database search');
        return null;
    }

    console.log(`Searching DB for: ${toolName} (License: ${licenseType || 'Any'})`);

    try {
        let query = supabase
            .from('ai_tools')
            .select('*')
            .ilike('name', `%${toolName}%`);
            
        // If license type is specified, filter by it
        if (licenseType) {
            query = query.ilike('license_type', licenseType);
        }
        
        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Database query failed:', error);
            return null;
        }

        if (data && data.length > 0) {
            console.log('Found tool in database:', data[0]);
            return applyClientSideMultipliers(data[0], formData);
        }

        console.log('No assessment found in database.');
        return null;

    } catch (err) {
        console.error('Critical error in getToolFromDatabase:', err);
        return null;
    }
}

export async function saveToDatabase(assessment) {
    if (!supabase) {
        return { error: { message: 'Not connected to database.' } };
    }
    
    const user = getCurrentUser();
    if (!user) {
        return { error: { message: 'User must be logged in to save an assessment.' } };
    }

    if (!assessment?.formData?.toolName) {
        return { error: { message: 'Invalid assessment data: missing tool name.' } };
    }

    const { formData, finalScore, breakdown, recommendations } = assessment;
    const validRiskLevel = getRiskLevel(finalScore);

    // Clean record with top-level fields and minimal JSONB
    const record = {
        user_id: user.id,
        name: formData.toolName,
        vendor: assessment.vendor || null,
        data_classification: formData.dataClassification,
        sources: assessment.sources || null,
        confidence: assessment.confidence || null,
        assessment_notes: assessment.assessment_notes || null,
        azure_permissions: assessment.azure_permissions || null,
        category: formData.toolCategory,
        
        // Top-level metadata fields (no longer in JSONB)
        license_type: assessment.license_type || formData.toolVersion || null,
        primary_use_case: assessment.primary_use_case || formData.useCase || null,
        assessed_by: assessment.assessed_by || 'User Assessment',
        compliance_certifications: assessment.compliance_certifications || [],
        documentation_tier: assessment.documentation_tier || 'Basic',
        
        // Score fields
        total_score: finalScore,
        risk_level: validRiskLevel,
        data_storage_score: breakdown?.scores?.dataStorage ?? 0,
        training_usage_score: breakdown?.scores?.trainingUsage ?? 0,
        access_controls_score: breakdown?.scores?.accessControls ?? 0,
        compliance_score: breakdown?.scores?.complianceRisk ?? 0,
        vendor_transparency_score: breakdown?.scores?.vendorTransparency ?? 0,
        
        // Minimal JSONB with only non-redundant data
        assessment_data: {
            recommendations: recommendations,
            detailedAssessment: assessment.detailedAssessment || null,
            summary_and_recommendation: assessment.summary_and_recommendation || null
        }
    };
    
    try {
        const { data, error } = await supabase
            .from('assessments')
            .insert([record])
            .select();
            
        if (error) {
            if (error.code === '23505') { 
                console.warn(`Tool "${record.name}" already exists.`);
                return { 
                    error: { 
                        message: `An assessment for "${record.name}" already exists.`,
                        code: 'DUPLICATE_ENTRY'
                    } 
                };
            }
            throw error;
        }
        
        await incrementTotalAssessmentsCreated().catch(err => {
            console.warn('Failed to update assessment counter:', err);
        });
        
        console.log('Successfully saved to database:', data);
        return { data };
    } catch (error) {
        console.error('Error saving to database:', error);
        return { error: { message: error.message || 'Unknown database error' } };
    }
}

async function incrementTotalAssessmentsCreated() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const currentTotal = user.user_metadata?.total_assessments_created || 0;
        const newTotal = currentTotal + 1;
        
        const { error } = await supabase.auth.updateUser({
            data: { total_assessments_created: newTotal }
        });
        
        if (error) throw error;
        console.log(`Updated total assessments created: ${currentTotal} → ${newTotal}`);
    } catch (error) {
        console.error('Error incrementing total assessments created:', error);
        throw error;
    }
}
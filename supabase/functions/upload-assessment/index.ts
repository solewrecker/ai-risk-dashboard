import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin role required.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Correctly handle multipart/form-data ---
    const formData = await req.formData();
    const file = formData.get('file'); // 'file' is the key from the client

    if (!file || typeof file === 'string') {
        throw new Error("No file uploaded or invalid file data.");
    }

    const fileContent = await file.text();
    const toolData = JSON.parse(fileContent); // The file itself contains the JSON data

    if (!toolData || typeof toolData !== 'object') {
      throw new Error('Missing or invalid "toolData" object in the uploaded file.');
    }
    
    // --- End of new file handling logic ---

    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // --- Data Mapping and Validation (same as before) ---
    const { name, vendor, license_type, total_score, risk_level, data_storage_score, training_usage_score, access_controls_score, compliance_score, vendor_transparency_score, summary_and_recommendation, confidence, primary_use_case, data_classification, category, assessed_by, azure_permissions, recommendations, sources, detailed_assessment, documentation_tier, assessment_notes, compliance_certifications } = toolData;

    if (!name) {
      throw new Error("The 'name' field is required.");
    }

    const recordToInsert = {
      name,
      vendor,
      license_type,
      total_score: total_score || 0,
      risk_level,
      data_storage_score: data_storage_score || 0,
      training_usage_score: training_usage_score || 0,
      access_controls_score: access_controls_score || 0,
      compliance_score: compliance_score || 0,
      vendor_transparency_score: vendor_transparency_score || 0,
      compliance_certifications: compliance_certifications || {},
      summary_and_recommendation,
      confidence: confidence || 0.8,
      primary_use_case,
      data_classification,
      category,
      assessed_by: assessed_by || "Bulk Import",
      azure_permissions: azure_permissions || {},
      recommendations: recommendations || {},
      sources: sources || [],
      detailed_assessment: detailed_assessment || toolData,
      documentation_tier: documentation_tier || null,
      assessment_notes: assessment_notes || null
    };

    const { data, error } = await supabaseAdmin.from('ai_tools').upsert(recordToInsert, {
      onConflict: 'name'
    });

    if (error) {
      console.error('Supabase Error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Tool '${name}' imported successfully.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
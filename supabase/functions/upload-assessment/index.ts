import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Handle CORS preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // For admin actions, we need to use the service role key.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );


    const { tools } = await req.json()

    if (!tools || !Array.isArray(tools)) {
      throw new Error('Missing or invalid "tools" array in request body.')
    }

    // Here you could add a check to ensure the user is an admin
    // const { data: { user } } = await supabaseClient.auth.getUser()
    // if (user.role !== 'admin') {
    //   return new Response(JSON.stringify({ error: 'Forbidden' }), {
    //     status: 403,
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //   })
    // }

    const recordsToInsert = tools.map((tool) => {
      // Basic validation and data mapping
      const {
        name,
        vendor,
        license_type,
        total_score,
        risk_level,
        data_storage_score,
        training_usage_score,
        access_controls_score,
        compliance_score,
        vendor_transparency_score,
        summary_and_recommendation,
        confidence,
        primary_use_case,
        data_classification,
        category,
        assessed_by,
        breakdown,
        details,
        azure_permissions,
        recommendations,
        sources,
        detailed_assessment,
      } = tool;

      // We can add more robust validation here if needed
      if (!name) {
        return null;
      }

      return {
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
        summary_and_recommendation,
        confidence: confidence || 0.8,
        primary_use_case,
        data_classification,
        category,
        assessed_by: assessed_by || "Bulk Import",
        breakdown: breakdown || {},
        details: details || {},
        azure_permissions: azure_permissions || {},
        recommendations: recommendations || {},
        sources: sources || [],
        detailed_assessment: detailed_assessment || tool, // Store the full object
      };
    }).filter(Boolean); // Filter out any null records from failed validation

    if (recordsToInsert.length === 0) {
      throw new Error("No valid tool records to insert.");
    }
    
    const { data, error } = await supabaseAdmin
      .from('ai_tools')
      .upsert(recordsToInsert, { onConflict: 'name' });

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, imported: data.length, message: "Tools imported successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 
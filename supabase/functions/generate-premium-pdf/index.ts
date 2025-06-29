import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { corsHeaders } from './cors.ts';
import { generateFreePdfHTML, generatePremiumHTML } from './templates.ts';
import { applyMultipliersToComponents } from './utils.ts';

// Initialize Supabase client
const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', 
      {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Extract parameters from the request
    const {
      toolName,
      toolCategory = 'AI Platform',
      finalScore,
      riskLevel,
      baseScore,
      dataClassification,
      useCase,
      reportType, // 'free' or 'premium'
    } = await req.json();

    console.log(`🚀 Received request for ${toolName} (${reportType} report)`);

    // 2. Validate essential parameters
    if (!toolName || !finalScore || !riskLevel || !reportType) {
      console.error('🚫 Missing required parameters');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Fetch tool-specific data from the database
    console.log(`🔍 Fetching data for tool: ${toolName}`);
    const { data: dbData, error: dbError } = await supabase
        .from('ai_tools')
        .select('*')
      .ilike('name', `%${toolName}%`)
      .limit(1)
      .single();

    if (dbError) {
      console.error('Database query error:', dbError.message);
      // We don't fail the request, but we log the error.
      // The HTML generator will handle the null `databaseContent`.
      } else {
      console.log(`✅ Successfully fetched data for ${toolName}.`);
    }

    // 4. Calculate final score using multipliers
    const componentScores = applyMultipliersToComponents(dbData, { dataClassification, useCase });
    const calculatedFinalScore = Object.values(componentScores).reduce((sum, score) => sum + score, 0);

    console.log(`🧮 Calculated final score: ${calculatedFinalScore}`);

    // 5. Prepare data payload
    const data = {
      toolName,
      toolCategory,
      finalScore: calculatedFinalScore, // Use the newly calculated score
      riskLevel,
      baseScore,
      dataClassification,
      useCase,
      databaseContent: dbData, // Pass the entire DB record
    };

    // 6. Generate HTML based on the report type
    let htmlContent;
    if (reportType === 'pdf' || reportType === 'html') {
      console.log(`🌟 Generating Premium HTML for ${reportType} report...`);
      htmlContent = generatePremiumHTML(data);
      } else {
      console.error(`Unsupported report type: ${reportType}`);
      return new Response(JSON.stringify({ error: 'Unsupported report type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 7. Return the generated HTML
    console.log('✅ HTML generation complete. Sending response.');
    return new Response(htmlContent, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      status: 200,
    });
            } catch (error) {
    // General error handling
    console.error('Internal Server Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

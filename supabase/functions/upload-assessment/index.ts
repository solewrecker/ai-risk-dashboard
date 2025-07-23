import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from "https://esm.sh/openai@4.47.1";

// The framework and template files will now be read inside the main handler
// instead of being imported as modules.

console.log("Create Assessment function booting up...");

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

serve(async (req) => {
  try {
    // Read framework and template files at runtime
    const framework = await Deno.readTextFile("./ai_risk_framework.md");
    const jsonTemplateString = await Deno.readTextFile("./ai_risk_database Template.json");
    const jsonTemplate = JSON.parse(jsonTemplateString);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      // Create client with auth header of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { app_name, use_case } = await req.json();
    if (!app_name || !use_case) {
      return new Response(JSON.stringify({ error: "app_name and use_case are required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // --- AI Prompt Construction ---
    const prompt = `
You are an expert AI Risk Assessment analyst. Your task is to evaluate an AI tool based on the provided risk framework and generate a detailed risk assessment report in JSON format.

**Your Goal:**
Analyze the tool "${app_name}" for the use case of "${use_case}".
You MUST use your web search capability to find the official privacy policy, terms of service, security documentation, and any compliance information (like SOC 2 or HIPAA) for "${app_name}". Base your entire assessment on verifiable facts from this research. Do not use your own prior knowledge without verification.

**The Risk Framework:**
${framework}

---

**Output Instructions:**
Based on your research and the framework above, fill out the following JSON object completely. Provide a score and a detailed justification for every single criterion. The total scores must be calculated correctly. For the \`compliance_certifications\` field, you MUST return an array of objects, where each object has the keys 'name', 'status', 'details', 'evidence', 'limitations', and 'last_verified'. Do not simplify this into an array of strings. The final output must be ONLY the JSON object, with no other text or explanations.

**JSON To Fill:**
${JSON.stringify(jsonTemplate, null, 2)}
`;

    // --- Call OpenAI API ---
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-4-turbo",
        response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
        throw new Error("AI did not return a response.");
    }

    let assessmentJson = JSON.parse(aiResponse);

    // Filter out 'SOC_2: Type II' from compliance_certifications
    if (assessmentJson.compliance_certifications && Array.isArray(assessmentJson.compliance_certifications)) {
      assessmentJson.compliance_certifications = assessmentJson.compliance_certifications.filter(cert => 
        !(cert.name === 'SOC_2' && cert.status === 'Type II')
      );
    }

    // Get detailed assessment and ensure it's properly structured
    let detailedAssessmentToStore = assessmentJson.detailed_assessment || {};
    if (typeof detailedAssessmentToStore !== 'object') {
      detailedAssessmentToStore = {};
    }
    
    // Remove compliance_certifications from detailed assessment to avoid duplication
    if (detailedAssessmentToStore.compliance_certifications) {
      delete detailedAssessmentToStore.compliance_certifications;
    }
    
    // Ensure summary_and_recommendation is within detailedAssessmentToStore
    detailedAssessmentToStore.summary_and_recommendation = 
      assessmentJson.summary_and_recommendation || 
      assessmentJson.summary || 
      detailedAssessmentToStore.summary_and_recommendation ||
      detailedAssessmentToStore.summary || 
      detailedAssessmentToStore.executive_summary ||
      assessmentJson.executive_summary ||
      'No summary provided.';

    // Extract scores with proper fallbacks
    const getScore = (path: string[], fallback = 0) => {
      let current: any = detailedAssessmentToStore;
      for (const key of path) {
        if (current && typeof current === 'object' && current[key] !== undefined) {
          current = current[key];
        } else {
          return assessmentJson[`${path[path.length - 1]}_score`] || fallback;
        }
      }
      return typeof current === 'number' ? current : fallback;
    };

    // --- Map AI response to the 'assessments' table schema ---
    const userId = (await supabaseClient.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error("User must be authenticated to create an assessment");
    }

    const newToolData: any = {
      user_id: userId,
      is_public: false,
      name: assessmentJson.tool_name || assessmentJson.name || app_name,
      vendor: assessmentJson.vendor || null,
      total_score: detailedAssessmentToStore.final_risk_score || detailedAssessmentToStore.total_score || assessmentJson.total_score || null,
      risk_level: detailedAssessmentToStore.final_risk_category || detailedAssessmentToStore.risk_level || assessmentJson.risk_level || 'UNKNOWN',
      
      // Extract individual scores with proper fallbacks
      data_storage_score: getScore(['assessment_details', 'data_storage_and_security', 'category_score']),
      training_usage_score: getScore(['assessment_details', 'training_data_usage', 'category_score']),
      access_controls_score: getScore(['assessment_details', 'access_controls', 'category_score']),
      compliance_score: getScore(['assessment_details', 'compliance_and_legal_risk', 'category_score']),
      vendor_transparency_score: getScore(['assessment_details', 'vendor_transparency', 'category_score']),
      
      category: assessmentJson.category || 'General',
      data_classification: assessmentJson.data_classification || 'Internal',
      license_type: assessmentJson.license_type || null,
      primary_use_case: assessmentJson.primary_use_case || use_case,
      assessed_by: assessmentJson.assessed_by || 'AI Assistant',
      confidence: assessmentJson.confidence || null,
      documentation_tier: assessmentJson.documentation_tier || null,
      assessment_notes: assessmentJson.assessment_notes || null,
      azure_permissions: assessmentJson.azure_permissions || null,
      compliance_certifications: assessmentJson.compliance_certifications || null,
      sources: assessmentJson.sources || null,
      
      // The assessment_data JSONB column contains structured, nested info
      assessment_data: {
        formData: { 
          useCase: assessmentJson.primary_use_case || use_case,
          toolName: assessmentJson.tool_name || assessmentJson.name || app_name,
          toolVersion: assessmentJson.license_type || 'Unknown',
          toolCategory: assessmentJson.category || 'General',
          dataClassification: assessmentJson.data_classification || 'Internal'
        },
        breakdown: { 
          scores: {
            dataStorage: getScore(['assessment_details', 'data_storage_and_security', 'category_score']),
            trainingUsage: getScore(['assessment_details', 'training_data_usage', 'category_score']),
            accessControls: getScore(['assessment_details', 'access_controls', 'category_score']),
            complianceRisk: getScore(['assessment_details', 'compliance_and_legal_risk', 'category_score']),
            vendorTransparency: getScore(['assessment_details', 'vendor_transparency', 'category_score'])
          }
        },
        recommendations: assessmentJson.recommendations || [],
        detailedAssessment: detailedAssessmentToStore,
      }
    };

    // --- Insert into 'assessments' table ---
    const { data, error } = await supabaseClient
      .from("assessments")
      .insert(newToolData)
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      throw error;
    }

    console.log('Successfully created assessment:', data.name);

    return new Response(JSON.stringify({ assessment: data }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in create assessment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
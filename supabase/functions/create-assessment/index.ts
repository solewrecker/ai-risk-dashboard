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
    // Ensure compliance_certifications is not duplicated within detailedAssessment if detailedAssessment is the full assessmentJson
    let detailedAssessmentToStore = assessmentJson.detailed_assessment;
    if (!detailedAssessmentToStore) {
      // If detailed_assessment is not present, use the entire assessmentJson
      detailedAssessmentToStore = { ...assessmentJson }; // Create a copy to avoid modifying original
    }
    // Ensure compliance_certifications is always removed from detailedAssessmentToStore
    delete detailedAssessmentToStore.compliance_certifications;

    // --- Map AI response to the 'assessments' table schema ---
    const userId = (await supabaseClient.auth.getUser()).data.user?.id;
    const newToolData: any = {
      user_id: userId,
      is_public: false,
      name: assessmentJson.tool_name || assessmentJson.name,
      vendor: assessmentJson.vendor,
      total_score: assessmentJson.final_risk_score || assessmentJson.total_score,
      risk_level: assessmentJson.final_risk_category || assessmentJson.risk_level,
      data_storage_score: assessmentJson.detailed_assessment?.assessment_details?.data_storage_and_security?.category_score || assessmentJson.data_storage_score,
      training_usage_score: assessmentJson.detailed_assessment?.assessment_details?.training_data_usage?.category_score || assessmentJson.training_usage_score,
      access_controls_score: assessmentJson.detailed_assessment?.assessment_details?.access_controls?.category_score || assessmentJson.access_controls_score,
      compliance_score: assessmentJson.detailed_assessment?.assessment_details?.compliance_and_legal_risk?.category_score || assessmentJson.compliance_score,
      vendor_transparency_score: assessmentJson.detailed_assessment?.assessment_details?.vendor_transparency?.category_score || assessmentJson.vendor_transparency_score,
      category: assessmentJson.category,
      data_classification: assessmentJson.data_classification,
      license_type: assessmentJson.license_type,
      primary_use_case: assessmentJson.primary_use_case,
      assessed_by: assessmentJson.assessed_by,
      confidence: assessmentJson.confidence,
      documentation_tier: assessmentJson.documentation_tier,
      assessment_notes: assessmentJson.assessment_notes,
      azure_permissions: assessmentJson.azure_permissions,
      compliance_certifications: assessmentJson.compliance_certifications,
      sources: assessmentJson.sources,
      assessment_data: {
        source: "ai_generated",
        sources: assessmentJson.sources,
        category: assessmentJson.category,
        formData: {
          useCase: assessmentJson.primary_use_case,
          toolName: assessmentJson.tool_name || assessmentJson.name,
          toolVersion: assessmentJson.license_type,
          toolCategory: assessmentJson.category,
          dataClassification: assessmentJson.data_classification
        },
        breakdown: {
          scores: {
            dataStorage: assessmentJson.detailed_assessment?.assessment_details?.data_storage_and_security?.category_score || assessmentJson.data_storage_score,
            trainingUsage: assessmentJson.detailed_assessment?.assessment_details?.training_data_usage?.category_score || assessmentJson.training_usage_score,
            accessControls: assessmentJson.detailed_assessment?.assessment_details?.access_controls?.category_score || assessmentJson.access_controls_score,
            complianceRisk: assessmentJson.detailed_assessment?.assessment_details?.compliance_and_legal_risk?.category_score || assessmentJson.compliance_score,
            vendorTransparency: assessmentJson.detailed_assessment?.assessment_details?.vendor_transparency?.category_score || assessmentJson.vendor_transparency_score
          }
        },
        riskLevel: assessmentJson.final_risk_category || assessmentJson.risk_level,
        confidence: assessmentJson.confidence,
        finalScore: assessmentJson.final_risk_score || assessmentJson.total_score,
        assessed_by: assessmentJson.assessed_by,
        recommendations: assessmentJson.recommendations,
        assessment_notes: assessmentJson.assessment_notes,
        primary_use_case: assessmentJson.primary_use_case,
        azure_permissions: assessmentJson.azure_permissions,
        detailedAssessment: detailedAssessmentToStore,
    }
    };

    // --- Insert into 'ai_tools' table ---
    const { data, error } = await supabaseClient
      .from("assessments")
      .insert(newToolData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ assessment: data }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
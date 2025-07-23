import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from "https://esm.sh/openai@4.47.1";

// Import your multiplier logic (you'll need to create this utility)
// For now, I'll inline the multiplier logic

console.log("Create Assessment function booting up...");

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Apply the exact same multiplier logic as your frontend scoring.js
function applyBackendMultipliers(assessmentJson: any, formData: any) {
  const { dataClassification, useCase } = formData;
  
  // Constants from your scoring.js
  const DATA_CLASSIFICATION_MULTIPLIERS = {
    'phi': 1.4,
    'financial': 1.3,
    'trade-secrets': 1.25,
    'pii': 1.2,
    'public': 0.9
  };

  const USE_CASE_MULTIPLIERS = {
    'legal-compliance': 1.3,
    'finance-accounting': 1.2,
    'hr-executive': 1.15,
    'customer-support': 1.1,
    'development': 0.95,
    'marketing': 0.9,
    'research': 1.0,
    'general': 1.0
  };
  
  // Get original scores
  const baseScores = {
    dataStorage: assessmentJson.data_storage_score || 0,
    trainingUsage: assessmentJson.training_usage_score || 0,
    accessControls: assessmentJson.access_controls_score || 0,
    complianceRisk: assessmentJson.compliance_score || 0,
    vendorTransparency: assessmentJson.vendor_transparency_score || 0
  };

  // Apply the EXACT same logic as applyClientSideMultipliers
  const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[dataClassification] || 1.0;
  baseScores.dataStorage = Math.round(baseScores.dataStorage * dataMultiplier);
  baseScores.complianceRisk = Math.round(baseScores.complianceRisk * dataMultiplier);

  const useCaseMultiplier = USE_CASE_MULTIPLIERS[useCase] || 1.0;
  baseScores.complianceRisk = Math.round(baseScores.complianceRisk * useCaseMultiplier);
  baseScores.accessControls = Math.round(baseScores.accessControls * useCaseMultiplier);

  // Calculate total score (sum of all scores, not weighted average)
  const totalScore = Object.values(baseScores).reduce((sum, score) => sum + score, 0);

  // Update assessmentJson with multiplied scores
  assessmentJson.data_storage_score = baseScores.dataStorage;
  assessmentJson.training_usage_score = baseScores.trainingUsage;
  assessmentJson.access_controls_score = baseScores.accessControls;
  assessmentJson.compliance_score = baseScores.complianceRisk;
  assessmentJson.vendor_transparency_score = baseScores.vendorTransparency;
  assessmentJson.total_score = totalScore;

  // Update detailed_assessment scores if they exist
  if (assessmentJson.detailed_assessment?.assessment_details) {
    const details = assessmentJson.detailed_assessment.assessment_details;
    
    if (details.data_storage_and_security) {
      details.data_storage_and_security.category_score = baseScores.dataStorage;
    }
    if (details.training_data_usage) {
      details.training_data_usage.category_score = baseScores.trainingUsage;
    }
    if (details.access_controls) {
      details.access_controls.category_score = baseScores.accessControls;
    }
    if (details.compliance_and_legal_risk) {
      details.compliance_and_legal_risk.category_score = baseScores.complianceRisk;
    }
    if (details.vendor_transparency) {
      details.vendor_transparency.category_score = baseScores.vendorTransparency;
    }
  }

  // Update risk level using your exact logic
  if (assessmentJson.detailed_assessment) {
    assessmentJson.detailed_assessment.final_risk_score = totalScore;
    
    // Use your exact risk level logic
    if (totalScore >= 80) {
      assessmentJson.detailed_assessment.final_risk_category = 'critical';
    } else if (totalScore >= 60) {
      assessmentJson.detailed_assessment.final_risk_category = 'high';
    } else if (totalScore >= 35) {
      assessmentJson.detailed_assessment.final_risk_category = 'medium';
    } else {
      assessmentJson.detailed_assessment.final_risk_category = 'low';
    }
  }
  
  return assessmentJson;
}

serve(async (req) => {
  try {
    // Read framework and template files at runtime
    const framework = await Deno.readTextFile("./ai_risk_framework.md");
    const jsonTemplateString = await Deno.readTextFile("./ai_risk_database Template.json");
    const jsonTemplate = JSON.parse(jsonTemplateString);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { app_name, use_case, data_classification, tool_category } = await req.json();
    if (!app_name || !use_case) {
      return new Response(JSON.stringify({ error: "app_name and use_case are required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create form data object for multiplier application
    const formData = {
      toolName: app_name,
      useCase: use_case,
      dataClassification: data_classification || 'public',
      toolCategory: tool_category || 'other'
    };

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

    // *** APPLY MULTIPLIERS HERE - BEFORE FILTERING ***
    assessmentJson = applyBackendMultipliers(assessmentJson, formData);

    // Filter out 'SOC_2: Type II' from compliance_certifications
    if (assessmentJson.compliance_certifications && Array.isArray(assessmentJson.compliance_certifications)) {
      assessmentJson.compliance_certifications = assessmentJson.compliance_certifications.filter(cert => 
        !(cert.name === 'SOC_2' && cert.status === 'Type II')
      );
    }

    let detailedAssessmentToStore = assessmentJson.detailed_assessment;
    if (!detailedAssessmentToStore || typeof detailedAssessmentToStore !== 'object') {
      detailedAssessmentToStore = {};
    }
    if (detailedAssessmentToStore.compliance_certifications) {
      delete detailedAssessmentToStore.compliance_certifications;
    }

    // Ensure summary_and_recommendation is within detailedAssessmentToStore
    detailedAssessmentToStore.summary_and_recommendation = 
      assessmentJson.summary_and_recommendation || 
      assessmentJson.summary || 
      assessmentJson.detailedAssessment?.summary_and_recommendation ||
      assessmentJson.detailedAssessment?.summary || 
      assessmentJson.detailedAssessment?.executive_summary ||
      assessmentJson.executive_summary ||
      'No summary provided.';

    // --- Map AI response to the 'assessments' table schema ---
    const userId = (await supabaseClient.auth.getUser()).data.user?.id;
    const newToolData: any = {
      user_id: userId,
      is_public: false,
      name: assessmentJson.tool_name || assessmentJson.name,
      vendor: assessmentJson.vendor,
      total_score: assessmentJson.total_score || detailedAssessmentToStore.final_risk_score || null,
      risk_level: detailedAssessmentToStore.final_risk_category || detailedAssessmentToStore.risk_level || 'UNKNOWN',
      data_storage_score: assessmentJson.data_storage_score || detailedAssessmentToStore.assessment_details?.data_storage_and_security?.category_score || null,
      training_usage_score: assessmentJson.training_usage_score || detailedAssessmentToStore.assessment_details?.training_data_usage?.category_score || null,
      access_controls_score: assessmentJson.access_controls_score || detailedAssessmentToStore.assessment_details?.access_controls?.category_score || null,
      compliance_score: assessmentJson.compliance_score || detailedAssessmentToStore.assessment_details?.compliance_and_legal_risk?.category_score || null,
      vendor_transparency_score: assessmentJson.vendor_transparency_score || detailedAssessmentToStore.assessment_details?.vendor_transparency?.category_score || null,
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
        formData: formData, // Use the formData object we created
        breakdown: { 
          scores: {
            dataStorage: assessmentJson.data_storage_score || 0,
            trainingUsage: assessmentJson.training_usage_score || 0,
            accessControls: assessmentJson.access_controls_score || 0,
            complianceRisk: assessmentJson.compliance_score || 0,
            vendorTransparency: assessmentJson.vendor_transparency_score || 0
          }
        },
        recommendations: assessmentJson.recommendations,
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
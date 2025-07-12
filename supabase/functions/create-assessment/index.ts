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
    const jsonTemplateString = await Deno.readTextFile("./ai_risk_database_template.json");
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
Based on your research and the framework above, fill out the following JSON object completely. Provide a score and a detailed justification for every single criterion. The total scores must be calculated correctly. The final output must be ONLY the JSON object, with no other text or explanations.

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

    const assessmentJson = JSON.parse(aiResponse);

    // --- Map AI response to the 'ai_tools' table schema ---
    const newToolData = {
      name: assessmentJson.tool_name,
      category: assessmentJson.primary_use_case || "General",
      total_score: assessmentJson.final_risk_score,
      risk_level: assessmentJson.final_risk_category,
      data_storage_score: assessmentJson.assessment_details.data_storage_and_security.category_score,
      training_usage_score: assessmentJson.assessment_details.training_data_usage.category_score,
      access_controls_score: assessmentJson.assessment_details.access_controls.category_score,
      compliance_score: assessmentJson.assessment_details.compliance_and_legal_risk.category_score,
      vendor_transparency_score: assessmentJson.assessment_details.vendor_transparency.category_score,
      
      // Build the breakdown object with scores and subscores
      breakdown: {
        scores: {
          dataStorage: assessmentJson.assessment_details.data_storage_and_security.category_score,
          trainingUsage: assessmentJson.assessment_details.training_data_usage.category_score,
          accessControls: assessmentJson.assessment_details.access_controls.category_score,
          complianceRisk: assessmentJson.assessment_details.compliance_and_legal_risk.category_score,
          vendorTransparency: assessmentJson.assessment_details.vendor_transparency.category_score
        },
        subScores: {
          dataStorage: {
            geographic: {
              score: assessmentJson.assessment_details.data_storage_and_security.criteria.geographic_control.score,
              note: assessmentJson.assessment_details.data_storage_and_security.criteria.geographic_control.justification
            },
            encryption: {
              score: assessmentJson.assessment_details.data_storage_and_security.criteria.encryption_standards.score,
              note: assessmentJson.assessment_details.data_storage_and_security.criteria.encryption_standards.justification
            },
            retention: {
              score: assessmentJson.assessment_details.data_storage_and_security.criteria.data_retention.score,
              note: assessmentJson.assessment_details.data_storage_and_security.criteria.data_retention.justification
            }
          },
          trainingUsage: {
            training: {
              score: assessmentJson.assessment_details.training_data_usage.criteria.model_training.score,
              note: assessmentJson.assessment_details.training_data_usage.criteria.model_training.justification
            },
            sharing: {
              score: assessmentJson.assessment_details.training_data_usage.criteria.data_sharing.score,
              note: assessmentJson.assessment_details.training_data_usage.criteria.data_sharing.justification
            }
          },
          accessControls: {
            admin: {
              score: assessmentJson.assessment_details.access_controls.criteria.admin_management.score,
              note: assessmentJson.assessment_details.access_controls.criteria.admin_management.justification
            },
            audit: {
              score: assessmentJson.assessment_details.access_controls.criteria.audit_capabilities.score,
              note: assessmentJson.assessment_details.access_controls.criteria.audit_capabilities.justification
            },
            integration: {
              score: assessmentJson.assessment_details.access_controls.criteria.integration.score,
              note: assessmentJson.assessment_details.access_controls.criteria.integration.justification
            }
          },
          complianceRisk: {
            violations: {
              score: assessmentJson.assessment_details.compliance_and_legal_risk.criteria.regulatory_violations.score,
              note: assessmentJson.assessment_details.compliance_and_legal_risk.criteria.regulatory_violations.justification
            },
            transparency: {
              score: assessmentJson.assessment_details.compliance_and_legal_risk.criteria.data_processing_transparency.score,
              note: assessmentJson.assessment_details.compliance_and_legal_risk.criteria.data_processing_transparency.justification
            }
          },
          vendorTransparency: {
            score: {
              score: assessmentJson.assessment_details.vendor_transparency.criteria.documentation_and_support.score,
              note: assessmentJson.assessment_details.vendor_transparency.criteria.documentation_and_support.justification
            }
          }
        },
        compliance: assessmentJson.compliance || {
          pci: "unknown",
          sox: "unknown",
          gdpr: "unknown",
          hipaa: "unknown"
        },
        compliance_certifications: assessmentJson.compliance_certifications || [],
      },
      
      // Build the details object with text summaries
      details: {
        dataStorage: `Geographic: ${assessmentJson.assessment_details.data_storage_and_security.criteria.geographic_control.justification} | Encryption: ${assessmentJson.assessment_details.data_storage_and_security.criteria.encryption_standards.justification} | Retention: ${assessmentJson.assessment_details.data_storage_and_security.criteria.data_retention.justification}`,
        trainingUsage: `Training: ${assessmentJson.assessment_details.training_data_usage.criteria.model_training.justification} | Sharing: ${assessmentJson.assessment_details.training_data_usage.criteria.data_sharing.justification}`,
        accessControls: `Admin: ${assessmentJson.assessment_details.access_controls.criteria.admin_management.justification} | Audit: ${assessmentJson.assessment_details.access_controls.criteria.audit_capabilities.justification} | Integration: ${assessmentJson.assessment_details.access_controls.criteria.integration.justification}`,
        complianceRisk: `Violations: ${assessmentJson.assessment_details.compliance_and_legal_risk.criteria.regulatory_violations.justification} | Transparency: ${assessmentJson.assessment_details.compliance_and_legal_risk.criteria.data_processing_transparency.justification}`,
        vendorTransparency: assessmentJson.assessment_details.vendor_transparency.criteria.documentation_and_support.justification
      },
      
      // Additional fields
      sources: assessmentJson.sources || [],
      assessed_by: "AI Security Council",
      confidence: assessmentJson.confidence || 0.85,
      summary_and_recommendation: assessmentJson.summary_and_recommendation,
      detailed_assessment: assessmentJson,
      primary_use_case: assessmentJson.primary_use_case || assessmentJson.use_case_multiplier_applied?.use_case || "General",
      data_classification: assessmentJson.data_classification || assessmentJson.use_case_multiplier_applied?.data_classification || "Standard",
      vendor: assessmentJson.vendor || "",
      license_type: assessmentJson.license_type || "Standard",
      azure_permissions: assessmentJson.azure_permissions || null,
      recommendations: assessmentJson.recommendations || []
    };

    // --- Insert into 'ai_tools' table ---
    const { data, error } = await supabaseClient
      .from("ai_tools")
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
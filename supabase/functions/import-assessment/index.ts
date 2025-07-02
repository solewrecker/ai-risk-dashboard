import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Import Assessment function booting up...");

serve(async (req) => {
  try {
    console.log("Received request to import assessment");
    
    // Use the SERVICE_ROLE_KEY for admin-level access to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the assessment data from the request body
    let assessment;
    try {
      assessment = await req.json();
      console.log("Successfully parsed request body");
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate the assessment data
    if (!assessment.name) {
      console.error("Missing name field in assessment");
      return new Response(JSON.stringify({ error: "Assessment must have a name field" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log(`Processing assessment for: ${assessment.name}`);

    // Simplify: Just insert the assessment directly
    try {
      const { data, error } = await supabaseClient
        .from("ai_tools")
        .upsert({
          ...assessment,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'name'
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Assessment successfully imported");
      return new Response(JSON.stringify({ 
        message: "Assessment successfully imported", 
        assessment: data 
      }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (dbError) {
      console.error("Error during database operation:", dbError);
      return new Response(JSON.stringify({ error: `Database error: ${dbError.message}` }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: `Unexpected error: ${error.message}` }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 
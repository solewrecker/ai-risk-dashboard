import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Update scheduler function booting up...");

// This function is designed to be triggered by a cron job.
// It finds outdated applications and queues them for an update.

serve(async (_req) => {
  try {
    // Use the SERVICE_ROLE_KEY for admin-level access to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate the date 25 days ago
    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);

    // 1. Find applications that need an update
    const { data: outdatedApps, error: selectError } = await supabaseClient
      .from("analyzed_applications")
      .select("id")
      .or(`last_analyzed_at.is.null,last_analyzed_at.lt.${twentyFiveDaysAgo.toISOString()}`);

    if (selectError) {
      throw selectError;
    }

    if (!outdatedApps || outdatedApps.length === 0) {
      console.log("No outdated applications found. Exiting.");
      return new Response("No outdated applications to schedule.", { status: 200 });
    }

    console.log(`Found ${outdatedApps.length} outdated application(s) to schedule.`);

    // 2. Prepare the new jobs for the 'scheduled_updates' table
    const newJobs = outdatedApps.map(app => ({
      app_id: app.id,
      scheduled_for: new Date().toISOString(), // Schedule for immediate processing
      priority: 5, // Medium priority for monthly batches
      update_type: 'monthly_batch',
      status: 'pending'
    }));

    // 3. Insert the new jobs into the queue
    const { error: insertError } = await supabaseClient
      .from("scheduled_updates")
      .insert(newJobs);

    if (insertError) {
      // Handle potential duplicate conflicts gracefully
      if (insertError.code === '23505') { // unique_violation
          console.warn("Attempted to insert duplicate scheduled updates. This is likely okay.");
      } else {
          throw insertError;
      }
    }

    const message = `Successfully scheduled ${newJobs.length} application updates.`;
    console.log(message);

    return new Response(JSON.stringify({ message }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in scheduler:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 
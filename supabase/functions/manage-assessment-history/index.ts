// supabase/functions/manage-assessment-history/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Define history limits based on user tier
const TIER_LIMITS = {
  free: 5,
  pro: 50, // Or a very high number if unlimited
  enterprise: 1000,
  admin: 10000 // Effectively unlimited for admins
}

Deno.serve(async (req) => {
  // This is an example of a POST request with JSON payload.
  // The payload requires a "record" property, which is sent by the trigger.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    const userId = record.user_id

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get the user's tier from their metadata
    const { data: userData, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(userId)
    
    if (userError) throw userError

    const userTier = userData.user.user_metadata?.tier || 'free'
    const userRole = userData.user.user_metadata?.role
    
    // Admins have the highest limit regardless of tier
    const limit = userRole === 'admin' ? TIER_LIMITS.admin : (TIER_LIMITS[userTier] || TIER_LIMITS.free);

    // 2. Count the user's current number of assessments
    const { count, error: countError } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) throw countError

    // 3. If the count exceeds the limit, delete the oldest ones
    if (count > limit) {
      const excessCount = count - limit

      // Find the IDs of the oldest assessments to delete
      const { data: oldAssessments, error: fetchError } = await supabaseAdmin
        .from('assessments')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(excessCount)

      if (fetchError) throw fetchError

      const idsToDelete = oldAssessments.map(a => a.id)

      // Delete the oldest assessments
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabaseAdmin
          .from('assessments')
          .delete()
          .in('id', idsToDelete)

        if (deleteError) throw deleteError
      }
    }

    return new Response(JSON.stringify({ success: true, message: `History managed for user ${userId}` }), {
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
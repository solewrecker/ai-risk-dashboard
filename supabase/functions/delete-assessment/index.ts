import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header')
    }

    const token = authHeader.replace('Bearer ', '')

    // Create a Supabase client with the service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the user's JWT token and get user info
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid or expired token')
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      throw new Error('Access denied. Admin privileges required.')
    }

    // Parse the request body
    const { assessmentId } = await req.json()
    
    if (!assessmentId) {
      throw new Error('Assessment ID is required')
    }

    // First, verify the assessment exists and get its details
    const { data: assessment, error: fetchError } = await supabaseAdmin
      .from('assessments')
      .select('id, name, user_id, created_at')
      .eq('id', assessmentId)
      .single()

    if (fetchError || !assessment) {
      throw new Error('Assessment not found')
    }

    // Delete the assessment
    const { error: deleteError } = await supabaseAdmin
      .from('assessments')
      .delete()
      .eq('id', assessmentId)

    if (deleteError) {
      throw new Error(`Failed to delete assessment: ${deleteError.message}`)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Assessment "${assessment.name}" deleted successfully`,
      deletedAssessment: {
        id: assessment.id,
        name: assessment.name,
        userId: assessment.user_id,
        deletedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Delete assessment error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, handleCors, createCorsResponse } from '../_shared/cors.ts'

console.log('AI Assessment Function is running!')

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    const { toolName, toolVersion, dataClassification, useCase } = await req.json()
    
    if (!toolName) {
      return createCorsResponse(
        { error: 'Tool name is required' },
        400
      );
    }

    // Your AI assessment logic here
    const assessment = {
      toolName,
      riskScore: 65, // Your calculation logic
      riskLevel: 'moderate',
      breakdown: {
        dataStorage: 70,
        trainingUsage: 60,
        accessControls: 65,
        complianceRisk: 65,
        vendorTransparency: 70
      },
      recommendations: [
        'Review data handling policies',
        'Implement access controls',
        'Regular security audits'
      ]
    };

    // Return response with CORS headers
    return createCorsResponse(assessment);

  } catch (error) {
    console.error('Assessment error:', error);
    return createCorsResponse(
      { error: 'Assessment failed', details: error.message },
      500
    );
  }
}) 
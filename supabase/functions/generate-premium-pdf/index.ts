import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssessmentData {
  toolName: string
  toolCategory: string
  finalScore: number
  riskLevel: string
  baseScore: number
  componentScores: any
  formData: any
  dataClassification: string
  useCase: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user authentication
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Check user tier
    const userTier = user.user_metadata?.tier || 'free'
    if (userTier !== 'enterprise') {
      return new Response(JSON.stringify({ error: 'Enterprise subscription required' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { assessmentData, exportType } = await req.json() as {
      assessmentData: AssessmentData
      exportType: 'html' | 'pdf'
    }

    const htmlContent = generatePremiumHTML(assessmentData)

    if (exportType === 'html') {
      return new Response(htmlContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${assessmentData.toolName}-assessment.html"`
        }
      })
    }

    // For PDF generation, use a different approach since Puppeteer doesn't work well in Edge Functions
    if (exportType === 'pdf') {
      // Option 1: Return HTML with print styles and let client handle PDF conversion
      const printableHTML = generatePrintableHTML(assessmentData)
      
      return new Response(printableHTML, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'X-Suggested-Filename': `${assessmentData.toolName}-premium-assessment.pdf`
        }
      })
      
      // Option 2: Use an external PDF service (recommended)
      // return await generatePDFWithExternalService(htmlContent, assessmentData.toolName)
    }

    return new Response(JSON.stringify({ error: 'Invalid export type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Export generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Export generation failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generatePremiumHTML(data: AssessmentData): string {
  const riskColor = data.riskLevel === 'LOW' ? '#10b981' : 
                   data.riskLevel === 'MODERATE' ? '#f59e0b' : 
                   data.riskLevel === 'HIGH' ? '#ef4444' : '#dc2626'
  
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Enterprise AI Risk Assessment - ${data.toolName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; margin-bottom: 2rem; }
        .risk-score { font-size: 3rem; color: ${riskColor}; text-align: center; margin: 2rem 0; }
        .details { margin: 2rem 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Enterprise AI Risk Assessment</h1>
        <p>Professional Security Analysis Report</p>
    </div>
    
    <div class="risk-score">Risk Score: ${data.finalScore}</div>
    <div style="text-align: center; font-size: 1.5rem; color: ${riskColor};">${data.riskLevel} RISK</div>
    
    <div class="details">
        <div class="detail-row"><span>Tool Name:</span><span>${data.toolName}</span></div>
        <div class="detail-row"><span>Category:</span><span>${data.toolCategory}</span></div>
        <div class="detail-row"><span>Data Classification:</span><span>${data.dataClassification}</span></div>
        <div class="detail-row"><span>Use Case:</span><span>${data.useCase}</span></div>
        <div class="detail-row"><span>Base Score:</span><span>${data.baseScore}</span></div>
        <div class="detail-row"><span>Final Score:</span><span>${data.finalScore}</span></div>
    </div>
    
    <div style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-left: 4px solid #007bff;">
        <h3>Enterprise Recommendations</h3>
        <ul>
            <li>Implement role-based access controls</li>
            <li>Deploy continuous monitoring</li>
            <li>Regular compliance reviews required</li>
            <li>Security awareness training for users</li>
        </ul>
    </div>
    
    <div style="margin-top: 2rem; text-align: center; color: #666; font-size: 0.9rem;">
        Generated: ${new Date().toLocaleDateString()} | Enterprise AI Risk Framework v2.0
    </div>
</body>
</html>`
}

function generatePrintableHTML(data: AssessmentData): string {
  const riskColor = data.riskLevel === 'LOW' ? '#10b981' : 
                   data.riskLevel === 'MODERATE' ? '#f59e0b' : 
                   data.riskLevel === 'HIGH' ? '#ef4444' : '#dc2626'
  
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Enterprise AI Risk Assessment - ${data.toolName}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; margin-bottom: 2rem; }
        .risk-score { font-size: 3rem; color: ${riskColor}; text-align: center; margin: 2rem 0; }
        .details { margin: 2rem 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
    </style>
    <script>
        window.onload = function() {
            // Auto-trigger print dialog for PDF conversion
            setTimeout(() => window.print(), 500);
        }
    </script>
</head>
<body>
    <div class="no-print" style="text-align: center; padding: 1rem; background: #f0f0f0; margin-bottom: 1rem;">
        <p>Use your browser's "Save as PDF" option or Ctrl+P to generate PDF</p>
        <button onclick="window.print()">Print/Save as PDF</button>
    </div>
    
    <div class="header">
        <h1>Enterprise AI Risk Assessment</h1>
        <p>Professional Security Analysis Report</p>
    </div>
    
    <div class="risk-score">Risk Score: ${data.finalScore}</div>
    <div style="text-align: center; font-size: 1.5rem; color: ${riskColor};">${data.riskLevel} RISK</div>
    
    <div class="details">
        <div class="detail-row"><span>Tool Name:</span><span>${data.toolName}</span></div>
        <div class="detail-row"><span>Category:</span><span>${data.toolCategory}</span></div>
        <div class="detail-row"><span>Data Classification:</span><span>${data.dataClassification}</span></div>
        <div class="detail-row"><span>Use Case:</span><span>${data.useCase}</span></div>
        <div class="detail-row"><span>Base Score:</span><span>${data.baseScore}</span></div>
        <div class="detail-row"><span>Final Score:</span><span>${data.finalScore}</span></div>
    </div>
    
    <div style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-left: 4px solid #007bff;">
        <h3>Enterprise Recommendations</h3>
        <ul>
            <li>Implement role-based access controls</li>
            <li>Deploy continuous monitoring</li>
            <li>Regular compliance reviews required</li>
            <li>Security awareness training for users</li>
        </ul>
    </div>
    
    <div style="margin-top: 2rem; text-align: center; color: #666; font-size: 0.9rem;">
        Generated: ${new Date().toLocaleDateString()} | Enterprise AI Risk Framework v2.0
    </div>
</body>
</html>`
}

// Alternative: Use external PDF service
async function generatePDFWithExternalService(htmlContent: string, filename: string) {
  // Example using HTMLCSStoImage.com or similar service
  const response = await fetch('https://htmlcsstoimage.com/demo_run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      html: htmlContent,
      css: '',
      google_fonts: 'Arial',
      format: 'pdf'
    })
  })
  
  if (!response.ok) {
    throw new Error('PDF generation service failed')
  }
  
  const pdfBuffer = await response.arrayBuffer()
  
  return new Response(pdfBuffer, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}-premium-assessment.pdf"`
    }
  })
}
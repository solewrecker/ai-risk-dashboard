import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const userTier = user.user_metadata?.tier || 'free'
    if (userTier !== 'enterprise') {
      return new Response(JSON.stringify({ error: 'Enterprise subscription required' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { assessmentData, exportType } = await req.json() as {
      assessmentData: AssessmentData
      exportType: 'html' | 'pdf' | 'free-pdf'
    }

    // Free PDF generation (client-side)
    if (exportType === 'free-pdf' || exportType === 'pdf') {
      const freePdfHtml = generateFreePdfHTML(assessmentData)
      return new Response(freePdfHtml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        }
      })
    }

    // Regular HTML export
    const htmlContent = generatePremiumHTML(assessmentData)
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${assessmentData.toolName}-assessment.html"`
      }
    })

  } catch (error) {
    console.error('Export generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Export generation failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateFreePdfHTML(data: AssessmentData): string {
  const riskColor = data.riskLevel === 'LOW' ? '#10b981' : 
                   data.riskLevel === 'MODERATE' ? '#f59e0b' : 
                   data.riskLevel === 'HIGH' ? '#ef4444' : '#dc2626'
  
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Enterprise AI Risk Assessment - ${data.toolName}</title>
    <!-- Free CDN libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Arial', sans-serif; 
            background: #f0f2f5;
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 3rem 2rem;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="80" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="60" r="1.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
        }
        
        .header h1 {
            font-size: 2.8rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        
        .header p {
            font-size: 1.3rem;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 2.5rem;
        }
        
        .risk-display {
            text-align: center;
            margin: 2rem 0 3rem 0;
            padding: 2rem;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            border: 3px solid ${riskColor};
        }
        
        .risk-score { 
            font-size: 5rem; 
            color: ${riskColor}; 
            font-weight: 900;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .risk-level {
            font-size: 2.2rem; 
            color: ${riskColor};
            font-weight: 700;
            letter-spacing: 2px;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .detail-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1.5rem;
            border-left: 4px solid #007bff;
            transition: transform 0.2s ease;
        }
        
        .detail-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .detail-label {
            font-size: 0.9rem;
            color: #6c757d;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.5rem;
        }
        
        .detail-value {
            font-size: 1.2rem;
            color: #212529;
            font-weight: 600;
        }
        
        .recommendations {
            margin-top: 3rem;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 15px;
            padding: 2.5rem;
            border: 2px solid #2196f3;
        }
        
        .recommendations h3 {
            color: #1976d2;
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .recommendations ul {
            list-style: none;
            padding: 0;
        }
        
        .recommendations li {
            margin: 1rem 0;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
            font-size: 1.1rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
        }
        
        .recommendations li::before {
            content: '✓';
            position: absolute;
            left: -12px;
            top: 50%;
            transform: translateY(-50%);
            background: #2196f3;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 2rem;
            text-align: center;
            color: #6c757d;
            border-top: 2px solid #e9ecef;
            font-size: 1rem;
        }
        
        .footer strong {
            color: #495057;
        }
        
        .controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border: 1px solid #e9ecef;
        }
        
        .btn {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            margin: 0 5px 5px 0;
            transition: all 0.3s ease;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
        }
        
        .btn-secondary {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        }
        
        @media print {
            .controls { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .container { box-shadow: none !important; }
        }
        
        @media (max-width: 768px) {
            .details-grid {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: 2rem;
            }
            .risk-score {
                font-size: 3.5rem;
            }
        }
        
        /* Ensure colors print correctly */
        * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    </style>
</head>
<body>
    <div class="controls">
        <button class="btn" onclick="generatePDF()" id="pdfBtn">📄 Generate PDF</button>
        <button class="btn btn-secondary" onclick="window.print()">🖨️ Print</button>
    </div>

    <div class="container" id="reportContent">
        <div class="header">
            <h1>Enterprise AI Risk Assessment</h1>
            <p>Professional Security Analysis Report</p>
        </div>
        
        <div class="content">
            <div class="risk-display">
                <div class="risk-score">${data.finalScore}</div>
                <div class="risk-level">${data.riskLevel} RISK</div>
            </div>
            
            <div class="details-grid">
                <div class="detail-card">
                    <div class="detail-label">Tool Name</div>
                    <div class="detail-value">${data.toolName}</div>
                </div>
                <div class="detail-card">
                    <div class="detail-label">Category</div>
                    <div class="detail-value">${data.toolCategory}</div>
                </div>
                <div class="detail-card">
                    <div class="detail-label">Data Classification</div>
                    <div class="detail-value">${data.dataClassification}</div>
                </div>
                <div class="detail-card">
                    <div class="detail-label">Use Case</div>
                    <div class="detail-value">${data.useCase}</div>
                </div>
                <div class="detail-card">
                    <div class="detail-label">Base Score</div>
                    <div class="detail-value">${data.baseScore}</div>
                </div>
                <div class="detail-card">
                    <div class="detail-label">Final Score</div>
                    <div class="detail-value">${data.finalScore}</div>
                </div>
            </div>
            
            <div class="recommendations">
                <h3>🔒 Enterprise Security Recommendations</h3>
                <ul>
                    <li><strong>Access Control:</strong> Implement comprehensive role-based access controls with multi-factor authentication</li>
                    <li><strong>Monitoring:</strong> Deploy continuous monitoring and real-time threat detection systems</li>
                    <li><strong>Compliance:</strong> Conduct regular compliance reviews and security audits</li>
                    <li><strong>Training:</strong> Provide mandatory security awareness training for all users</li>
                    <li><strong>Incident Response:</strong> Establish clear incident response procedures and protocols</li>
                    <li><strong>Data Protection:</strong> Implement encryption at rest and in transit for sensitive data</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <strong>Generated:</strong> ${new Date().toLocaleDateString()} | 
            <strong>Enterprise AI Risk Framework v2.0</strong> | 
            <strong>Confidential Security Report</strong>
        </div>
    </div>

    <script>
        async function generatePDF() {
            const button = document.getElementById('pdfBtn');
            const originalText = button.innerHTML;
            
            try {
                button.innerHTML = '⏳ Generating PDF...';
                button.disabled = true;
                
                // Hide controls for PDF
                document.querySelector('.controls').style.display = 'none';
                
                const element = document.getElementById('reportContent');
                
                // Wait for fonts and images to load
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Generate high-quality canvas
                const canvas = await html2canvas(element, {
                    scale: 3, // Very high resolution
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: element.scrollWidth,
                    height: element.scrollHeight,
                    onclone: (clonedDoc) => {
                        // Ensure all styles are preserved in cloned document
                        const clonedElement = clonedDoc.getElementById('reportContent');
                        clonedElement.style.transform = 'scale(1)';
                        clonedElement.style.transformOrigin = 'top left';
                    }
                });
                
                // Create PDF with optimal settings
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });
                
                const imgData = canvas.toDataURL('image/jpeg', 0.95); // High quality JPEG
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                // Calculate optimal dimensions
                const margin = 10;
                const imgWidth = pdfWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                let heightLeft = imgHeight;
                let position = margin;
                
                // Add first page
                pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - margin * 2);
                
                // Add additional pages if content is long
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight + margin;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
                    heightLeft -= (pdfHeight - margin * 2);
                }
                
                // Save with timestamp
                const timestamp = new Date().toISOString().slice(0, 10);
                const filename = '${data.toolName.replace(/[^a-z0-9]/gi, '_')}-assessment-' + timestamp + '.pdf';
                pdf.save(filename);
                
                // Show success message
                showNotification('PDF generated successfully!', 'success');
                
            } catch (error) {
                console.error('PDF generation failed:', error);
                showNotification('PDF generation failed. Please try the print option.', 'error');
            } finally {
                // Restore controls
                document.querySelector('.controls').style.display = 'block';
                button.innerHTML = originalText;
                button.disabled = false;
            }
        }
        
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 2000;
                animation: slideIn 0.3s ease;
                background: \${type === 'success' ? '#28a745' : '#dc3545'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            \`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>`
}

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
</body>
</html>`
}
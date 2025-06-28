import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

serve(async (req) => {
  console.log('=== EDGE FUNCTION START ===');
  console.log('Environment check:');
  console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'Present' : 'MISSING');
  console.log('SUPABASE_ANON_KEY:', Deno.env.get('SUPABASE_ANON_KEY') ? 'Present' : 'MISSING');
  
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  console.log('Authorization header:', authHeader ? 'Present' : 'MISSING');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', 
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );
    
    console.log('Supabase client created, getting user...');
    const jwt = authHeader?.replace('Bearer ', '') || '';
    const { data: { user }, error } = await supabaseClient.auth.getUser(jwt);
    
    console.log('User result:', user ? 'User found' : 'No user');
    console.log('Auth error:', error);
    
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log('User metadata:', user.user_metadata);
    console.log('Raw user metadata:', user.raw_user_meta_data);
    
    const userTier = user.raw_user_meta_data?.tier || user.user_metadata?.tier || 'free';
    console.log('Detected tier:', userTier);
    
    if (userTier !== 'enterprise') {
      return new Response(JSON.stringify({
        error: 'Enterprise subscription required'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    const { assessmentData, exportType } = await req.json();
    
    // Handle different export types properly
    if (exportType === 'free-pdf' || exportType === 'pdf') {
      const freePdfHtml = generateFreePdfHTML(assessmentData);
      return new Response(freePdfHtml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          // Remove Content-Disposition for HTML that generates PDF client-side
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    // For HTML export
    if (exportType === 'html') {
      const htmlContent = generatePremiumHTML(assessmentData);
      return new Response(htmlContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${assessmentData.toolName}-assessment.html"`
        }
      });
    }
    
    // Default to premium HTML
    const htmlContent = generatePremiumHTML(assessmentData);
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
    
  } catch (error) {
    console.error('Export generation error:', error);
    return new Response(JSON.stringify({
      error: 'Export generation failed',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

function generateFreePdfHTML(data: any) {
  const riskColor = data.riskLevel === 'LOW' ? '#10b981' : 
                   data.riskLevel === 'MODERATE' ? '#f59e0b' : 
                   data.riskLevel === 'HIGH' ? '#ef4444' : '#dc2626';
  
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Enterprise AI Risk Assessment - ${data.toolName}</title>
    <!-- Reliable CDN links without integrity checks -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <!-- Backup CDN in case primary fails -->
    <script>
        window.addEventListener('DOMContentLoaded', function() {
            // Check if libraries loaded, if not try backup
            if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
                console.log('Primary jsPDF failed, loading backup...');
                const script1 = document.createElement('script');
                script1.src = 'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js';
                document.head.appendChild(script1);
            }
            if (typeof html2canvas === 'undefined') {
                console.log('Primary html2canvas failed, loading backup...');
                const script2 = document.createElement('script');
                script2.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
                document.head.appendChild(script2);
            }
        });
    </script>
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
        
        .header h1 {
            font-size: 2.8rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.3rem;
            opacity: 0.95;
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
        
        .error-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            z-index: 2000;
            display: none;
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
    <div class="error-message" id="errorMessage">
        <h3>PDF Generation Error</h3>
        <p id="errorText"></p>
        <button class="btn" onclick="hideError()">Close</button>
    </div>

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
        // Check if required libraries are loaded
        function checkLibraries() {
            const jspdfAvailable = (typeof window.jspdf !== 'undefined') || (typeof window.jsPDF !== 'undefined');
            const html2canvasAvailable = typeof html2canvas !== 'undefined';
            
            console.log('Library check:', {
                jspdf: typeof window.jspdf,
                jsPDF: typeof window.jsPDF,
                html2canvas: typeof html2canvas,
                jspdfHasConstructor: !!(window.jspdf && (window.jspdf.jsPDF || typeof window.jspdf === 'function')),
                windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('jspdf') || k.toLowerCase().includes('pdf'))
            });
            
            if (!jspdfAvailable || !html2canvasAvailable) {
                showError('Required PDF libraries failed to load. Please refresh the page and try again.');
                return false;
            }
            return true;
        }

        async function generatePDF() {
            if (!checkLibraries()) return;
            
            const button = document.getElementById('pdfBtn');
            const originalText = button.innerHTML;
            
            try {
                button.innerHTML = '⏳ Generating PDF...';
                button.disabled = true;
                
                // Hide controls for PDF
                const controls = document.querySelector('.controls');
                const originalDisplay = controls.style.display;
                controls.style.display = 'none';
                
                const element = document.getElementById('reportContent');
                
                // Wait for libraries and resources to load properly
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Double-check libraries are available
                if (!checkLibraries()) return;
                
                // Generate high-quality canvas with better error handling
                const canvas = await html2canvas(element, {
                    scale: 2, // Reduced scale for better performance
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: element.scrollWidth,
                    height: element.scrollHeight,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    onclone: (clonedDoc) => {
                        // Ensure all styles are preserved in cloned document
                        const clonedElement = clonedDoc.getElementById('reportContent');
                        if (clonedElement) {
                            clonedElement.style.transform = 'scale(1)';
                            clonedElement.style.transformOrigin = 'top left';
                        }
                    }
                }).catch(error => {
                    console.error('html2canvas error:', error);
                    throw new Error('Failed to capture content. Please try refreshing the page.');
                });
                
                // Create PDF with optimal settings
                let jsPDFLib;
                if (window.jsPDF) {
                    jsPDFLib = window.jsPDF;
                } else if (window.jspdf && window.jspdf.jsPDF) {
                    jsPDFLib = window.jspdf.jsPDF;
                } else if (window.jspdf) {
                    jsPDFLib = window.jspdf;
                } else {
                    throw new Error('jsPDF library not found');
                }
                
                console.log('📄 Using jsPDF constructor:', typeof jsPDFLib);
                const pdf = new jsPDFLib({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });
                
                const imgData = canvas.toDataURL('image/png', 1.0); // PNG for better quality
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                // Calculate optimal dimensions
                const margin = 10;
                const imgWidth = pdfWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                let heightLeft = imgHeight;
                let position = margin;
                
                // Add first page
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= (pdfHeight - margin * 2);
                
                // Add additional pages if content is long
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight + margin;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
                    heightLeft -= (pdfHeight - margin * 2);
                }
                
                // Save with timestamp and sanitized filename
                const timestamp = new Date().toISOString().slice(0, 10);
                const sanitizedToolName = '${data.toolName}'.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = sanitizedToolName + '-assessment-' + timestamp + '.pdf';
                
                pdf.save(filename);
                
                // Show success message
                showNotification('PDF generated successfully!', 'success');
                
                // Restore controls
                controls.style.display = originalDisplay;
                
            } catch (error) {
                console.error('PDF generation failed:', error);
                showError('PDF generation failed: ' + error.message + '. Please try the print option instead.');
                
                // Restore controls
                document.querySelector('.controls').style.display = 'block';
            } finally {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        }
        
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            errorText.textContent = message;
            errorDiv.style.display = 'block';
        }
        
        function hideError() {
            document.getElementById('errorMessage').style.display = 'none';
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

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Check if we're in an environment that supports PDF generation
            if (!checkLibraries()) {
                console.warn('PDF libraries not available');
            }
        });
    </script>
</body>
</html>`;
}

function generatePremiumHTML(data: any) {
  const riskColor = data.riskLevel === 'LOW' ? '#10b981' : 
                   data.riskLevel === 'MODERATE' ? '#f59e0b' : 
                   data.riskLevel === 'HIGH' ? '#ef4444' : '#dc2626';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise AI Risk Assessment - ${data.toolName}</title>
    <style>
        /* === DYNAMIC VARIABLES === */
        :root {
            --risk-color: ${riskColor};
            --risk-degrees: 180deg;
        }

        /* === BASE STYLES === */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #f8fafc;
        }

        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* === HEADER === */
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 3rem 2rem;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(50px, -50px);
        }

        .header-content {
            position: relative;
            z-index: 2;
            text-align: center;
        }

        .report-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
        }

        .report-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            font-weight: 300;
            margin-bottom: 1.5rem;
        }

        .tool-highlight {
            background: rgba(255, 255, 255, 0.15);
            padding: 1rem;
            border-radius: 8px;
            margin: 1.5rem 0;
        }

        .tool-highlight .tool-name {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .tool-highlight .tool-subtitle {
            font-size: 1rem;
            opacity: 0.9;
        }

        .report-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 0.9rem;
        }

        /* === EXECUTIVE SUMMARY === */
        .executive-summary {
            padding: 2rem;
            background: white;
            border-bottom: 1px solid #e2e8f0;
        }

        .summary-header {
            margin-bottom: 2rem;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 3rem;
            margin-bottom: 2rem;
            align-items: center;
        }

        /* Risk Score Card */
        .risk-score-display {
            background: linear-gradient(135deg, var(--risk-color) 0%, var(--risk-color) 100%);
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            color: white;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            min-width: 250px;
        }

        .risk-score-number {
            font-size: 4rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 0.5rem;
        }

        .risk-score-total {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }

        .risk-level-badge {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-weight: 700;
            font-size: 1rem;
            display: inline-block;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            backdrop-filter: blur(10px);
        }

        .risk-description {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            line-height: 1.5;
        }

        .summary-insights {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .insight-card {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }

        .insight-title {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .insight-text {
            color: #64748b;
            font-size: 0.95rem;
        }

        .key-findings {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 1.5rem;
        }

        .findings-title {
            color: #92400e;
            font-weight: 700;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .findings-list {
            color: #92400e;
            font-size: 0.9rem;
            line-height: 1.6;
        }

        /* === TOOL INFORMATION === */
        .tool-info-section {
            padding: 2rem;
            background: #f8fafc;
        }

        .tool-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .tool-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .tool-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
        }

        .tool-details {
            flex: 1;
        }

        .tool-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.25rem;
        }

        .tool-category {
            color: #64748b;
            font-size: 0.9rem;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #e2e8f0;
        }

        .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 0.9rem;
        }

        .info-value {
            font-weight: 500;
            color: #1f2937;
        }

        /* === RECOMMENDATIONS === */
        .recommendations-section {
            padding: 2rem;
        }

        .recommendations-grid {
            display: grid;
            gap: 1rem;
        }

        .recommendation-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid;
            transition: transform 0.2s ease;
        }

        .recommendation-card:hover {
            transform: translateX(4px);
        }

        .recommendation-card.priority-high {
            border-left-color: #dc2626;
            background: linear-gradient(to right, #fef2f2, white);
        }

        .recommendation-card.priority-medium {
            border-left-color: #f59e0b;
            background: linear-gradient(to right, #fef9e7, white);
        }

        .recommendation-card.priority-low {
            border-left-color: #16a34a;
            background: linear-gradient(to right, #f0fdf4, white);
        }

        .recommendation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .recommendation-title {
            font-weight: 700;
            color: #1e293b;
        }

        .priority-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .priority-badge.priority-high {
            background: #dc2626;
            color: white;
        }

        .priority-badge.priority-medium {
            background: #f59e0b;
            color: white;
        }

        .priority-badge.priority-low {
            background: #16a34a;
            color: white;
        }

        .recommendation-text {
            color: #64748b;
            line-height: 1.6;
        }

        /* === FOOTER === */
        .footer {
            background: #1e293b;
            color: white;
            padding: 2rem;
            text-align: center;
        }

        .confidential-banner {
            background: #dc2626;
            padding: 0.75rem;
            margin-bottom: 1rem;
            border-radius: 4px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-bottom: 1rem;
        }

        .footer-section h4 {
            color: #3b82f6;
            margin-bottom: 0.5rem;
        }

        .footer-section p {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
            .summary-grid {
                grid-template-columns: 1fr;
                text-align: center;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .report-title {
                font-size: 2rem;
            }
            
            .risk-score-display {
                min-width: auto;
                padding: 1.5rem;
            }

            .risk-score-number {
                font-size: 3rem;
            }
        }

        /* === PRINT OPTIMIZATION === */
        @media print {
            body {
                background: white;
            }

            .report-container {
                box-shadow: none;
            }

            .recommendation-card {
                page-break-inside: avoid;
            }

            .section-title {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <h1 class="report-title">AI SECURITY RISK ASSESSMENT</h1>
                <p class="report-subtitle">Enterprise Security Analysis & Compliance Report</p>
                <div class="tool-highlight">
                    <div class="tool-name">${data.toolName}</div>
                    <div class="tool-subtitle">Risk Assessment Report</div>
                </div>
                <div class="report-meta">
                    <div>
                        <strong>Assessment ID:</strong> ASS-${Date.now()}
                    </div>
                    <div>
                        <strong>Generated:</strong> ${new Date().toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Framework:</strong> v2.1
                    </div>
                </div>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary">
            <div class="summary-header">
                <h2 class="section-title">📊 Executive Summary</h2>
            </div>
            
            <div class="summary-grid">
                <div class="risk-score-display">
                    <div class="risk-score-number">${data.finalScore}</div>
                    <div class="risk-score-total">/100</div>
                    <div class="risk-level-badge">${data.riskLevel} RISK</div>
                    <div class="risk-description">${data.riskLevel === 'HIGH' ? 'Significant controls needed before use' : data.riskLevel === 'MEDIUM' ? 'Standard enterprise controls required' : 'Basic monitoring sufficient'}</div>
                </div>
                
                <div class="summary-insights">
                    <div class="insight-card">
                        <div class="insight-title">Security Status</div>
                        <div class="insight-text">${data.riskLevel === 'HIGH' ? 'Tool poses significant security risks requiring immediate attention and enhanced controls.' : 'Tool meets security standards with appropriate controls for enterprise deployment.'}</div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-title">Compliance Impact</div>
                        <div class="insight-text">Standard compliance controls applicable with ${data.dataClassification} data classification requirements.</div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-title">Recommendation</div>
                        <div class="insight-text">${data.riskLevel === 'HIGH' ? 'Immediate security review required before deployment.' : 'Standard deployment with ongoing monitoring recommended.'}</div>
                    </div>
                </div>
            </div>

            <div class="key-findings">
                <div class="findings-title">
                    ⚠️ Key Security Findings
                </div>
                <div class="findings-list">
                    • Security assessment completed with ${data.riskLevel.toLowerCase()} risk classification<br>
                    • Data classification: ${data.dataClassification} requires appropriate handling controls<br>
                    • Use case: ${data.useCase} presents standard enterprise deployment considerations<br>
                    • Final risk score of ${data.finalScore}/100 indicates ${data.riskLevel.toLowerCase()} priority for security controls
                </div>
            </div>
        </div>

        <!-- Tool Information -->
        <div class="tool-info-section">
            <div class="tool-card">
                <div class="tool-header">
                    <div class="tool-icon">${data.toolName.substring(0, 2).toUpperCase()}</div>
                    <div class="tool-details">
                        <div class="tool-name">${data.toolName}</div>
                        <div class="tool-category">${data.toolCategory || 'AI Platform'}</div>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Primary Use Case</span>
                        <span class="info-value">${data.useCase}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Data Classification</span>
                        <span class="info-value">${data.dataClassification}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Assessment Date</span>
                        <span class="info-value">${new Date().toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Risk Category</span>
                        <span class="info-value">${data.riskLevel}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Base Score</span>
                        <span class="info-value">${data.baseScore}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Final Score</span>
                        <span class="info-value">${data.finalScore}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recommendations -->
        <div class="recommendations-section">
            <h2 class="section-title">🎯 Action Items & Recommendations</h2>
            
            <div class="recommendations-grid">
                ${data.riskLevel === 'HIGH' ? `
                <div class="recommendation-card priority-high">
                    <div class="recommendation-header">
                        <div class="recommendation-title">Immediate Security Review</div>
                        <div class="priority-badge priority-high">HIGH</div>
                    </div>
                    <div class="recommendation-text">
                        🚨 Conduct comprehensive security assessment and implement enhanced controls before deployment authorization.
                        <br><br><strong>Timeline:</strong> 15 days | <strong>Owner:</strong> Security Team
                    </div>
                </div>
                ` : ''}
                
                <div class="recommendation-card priority-${data.riskLevel === 'HIGH' ? 'high' : 'medium'}">
                    <div class="recommendation-header">
                        <div class="recommendation-title">Data Classification Controls</div>
                        <div class="priority-badge priority-${data.riskLevel === 'HIGH' ? 'high' : 'medium'}">${data.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM'}</div>
                    </div>
                    <div class="recommendation-text">
                        🔒 Implement appropriate controls for ${data.dataClassification} data classification level including access controls and monitoring.
                        <br><br><strong>Timeline:</strong> 30 days | <strong>Owner:</strong> Data Protection Team
                    </div>
                </div>
                
                <div class="recommendation-card priority-medium">
                    <div class="recommendation-header">
                        <div class="recommendation-title">Usage Monitoring Implementation</div>
                        <div class="priority-badge priority-medium">MEDIUM</div>
                    </div>
                    <div class="recommendation-text">
                        📊 Deploy comprehensive usage analytics and monitoring for AI tool utilization patterns and security anomaly detection.
                        <br><br><strong>Timeline:</strong> 60 days | <strong>Owner:</strong> IT Operations
                    </div>
                </div>
                
                <div class="recommendation-card priority-low">
                    <div class="recommendation-header">
                        <div class="recommendation-title">Regular Assessment Schedule</div>
                        <div class="priority-badge priority-low">LOW</div>
                    </div>
                    <div class="recommendation-text">
                        📅 Establish quarterly risk assessment review cycle to ensure ongoing compliance and security posture maintenance.
                        <br><br><strong>Timeline:</strong> 90 days | <strong>Owner:</strong> Risk Management
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="confidential-banner">
                🔒 Confidential - Internal Use Only
            </div>
            <div class="footer-grid">
                <div class="footer-section">
                    <h4>Assessment Framework</h4>
                    <p>AI Tool Risk Assessment Framework v2.1</p>
                    <p>ISO 27001 Aligned</p>
                </div>
                <div class="footer-section">
                    <h4>Next Review</h4>
                    <p>Scheduled: ${new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString()}</p>
                    <p>Quarterly Assessment Cycle</p>
                </div>
                <div class="footer-section">
                    <h4>Contact</h4>
                    <p>Security Team: security@company.com</p>
                    <p>CISO Office: ciso@company.com</p>
                </div>
            </div>
            <div style="margin-top: 1rem; font-size: 0.9rem;">
                AI Tool Risk Assessment Framework v2.1<br>
                Assessment ID: ASS-${Date.now()} | Generated: ${new Date().toLocaleDateString()}<br>
                © 2025 Enterprise Security Office
            </div>
        </div>
    </div>
</body>
</html>`;
}

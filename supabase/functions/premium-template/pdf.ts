import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { chromium } from "npm:playwright@1.44.1";
import { corsHeaders } from "./cors.ts";
import { generatePremiumHTML } from "./templates.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Reconstruct the data structure expected by the templates
    const templateData = {
        ...payload,
        dbData: {
            ...payload.breakdown, // Assumes 'breakdown' contains db fields
            category: payload.toolCategory,
            primary_use_case: payload.useCase,
            data_classification: payload.dataClassification,
            vendor: payload.vendor, // Assuming vendor is in payload
        },
        executiveSummary: payload.executiveSummary || { // Add fallback
            securityStatus: "Analysis based on provided data.",
            complianceImpact: "Compliance impact derived from component scores.",
            mainRecommendation: "Review detailed recommendations below."
        }
    };

    const html = generatePremiumHTML(templateData);

    // Launch headless Chrome
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    // Feed the HTML string directly to the page
    await page.setContent(html, { waitUntil: "networkidle" });

    // Generate PDF respecting @media print rules
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
      printBackground: true,
      displayHeaderFooter: false,
    });

    await browser.close();

    // Create a sanitized file name
    const sanitizedToolName = payload.toolName?.replace(/[^a-z0-9]+/gi, "_").toLowerCase() || 'report';
    const fileName = `${sanitizedToolName}-${Date.now()}.pdf`;

    // Return the PDF buffer with appropriate headers
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF.', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 
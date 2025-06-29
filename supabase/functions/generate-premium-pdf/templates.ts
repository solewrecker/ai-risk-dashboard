import {
  getRiskLevelClass,
  formatDatabaseDetails,
  getComponentRiskLevel,
  applyMultipliersToComponents,
  extractCriticalFindings,
  extractFormattedDetails
} from './utils.ts';

import { generateRecommendationsHTML } from './recommendations.ts';

// Helper function to get a risk level's color
function getRiskColor(riskLevel: string): string {
  const level = (riskLevel || 'unknown').toLowerCase();
  switch (level) {
    case 'critical': return '#dc2626';
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#64748b';
  }
}

// Main function to generate the premium HTML report
export async function generatePremiumHTML(data: any): Promise<string> {
  try {
    // 1. Read CSS and HTML templates from files
    const [css, htmlTemplate] = await Promise.all([
      Deno.readTextFile('./style.css'),
      Deno.readTextFile('./report-template.html')
    ]);

    // 2. Normalize and enrich the data
    const dbData = data.databaseContent as any;
    const adjustedScores = applyMultipliersToComponents(dbData, data);
    const finalScore = Math.round(Object.values(adjustedScores).reduce((sum: number, score: any) => sum + (score || 0), 0));
    
    // Determine overall risk level from final score
    let riskLevel = 'UNKNOWN';
    if (finalScore >= 80) riskLevel = 'CRITICAL';
    else if (finalScore >= 60) riskLevel = 'HIGH';
    else if (finalScore >= 35) riskLevel = 'MEDIUM';
    else if (finalScore >= 0) riskLevel = 'LOW';

    const riskDescriptions: { [key: string]: string } = {
        'CRITICAL': 'Immediate blocking required - critical security risks identified.',
        'HIGH': 'Significant controls needed before use - high security risks.',
        'MEDIUM': 'Standard enterprise controls required - moderate security risks.',
        'LOW': 'Basic monitoring sufficient. Tool meets security standards.',
        'UNKNOWN': 'Risk could not be determined due to missing data.'
    };
    const riskDescription = riskDescriptions[riskLevel];

    // 3. Prepare template data
    const templateData: { [key: string]: any } = {
      css: css.replace(':root {', `:root {\n    --risk-color: ${getRiskColor(riskLevel)};\n    --risk-color-light: ${getRiskColor(riskLevel)}CC;`),
      toolName: data.toolName || 'Unknown Tool',
      toolCategory: data.toolCategory || 'AI Platform',
      assessmentId: `ASS-${Date.now()}`,
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      finalScore: finalScore,
      riskLevel: riskLevel,
      riskDescription: riskDescription,
      securityStatus: `Tool requires ${riskLevel === 'LOW' ? 'standard' : 'significant'} security improvements for enterprise deployment.`,
      complianceImpact: 'Compliance verification needed for regulated data use cases.',
      mainRecommendation: `Immediate security review and remediation required before deployment authorization for high-risk tools.`,
      keyFindings: `<li>${extractCriticalFindings(dbData, finalScore).join('</li><li>')}</li>`,
      data_storage_risk_level: getComponentRiskLevel(adjustedScores.dataStorage),
      data_storage_risk_level_class: getRiskLevelClass(getComponentRiskLevel(adjustedScores.dataStorage)),
      data_storage_details: formatDatabaseDetails(extractFormattedDetails('dataStorage', dbData)),
      training_usage_risk_level: getComponentRiskLevel(adjustedScores.trainingUsage),
      training_usage_risk_level_class: getRiskLevelClass(getComponentRiskLevel(adjustedScores.trainingUsage)),
      training_usage_details: formatDatabaseDetails(extractFormattedDetails('trainingUsage', dbData)),
      access_controls_risk_level: getComponentRiskLevel(adjustedScores.accessControls),
      access_controls_risk_level_class: getRiskLevelClass(getComponentRiskLevel(adjustedScores.accessControls)),
      access_controls_details: formatDatabaseDetails(extractFormattedDetails('accessControls', dbData)),
      compliance_risk_level: getComponentRiskLevel(adjustedScores.complianceRisk),
      compliance_risk_level_class: getRiskLevelClass(getComponentRiskLevel(adjustedScores.complianceRisk)),
      compliance_details: formatDatabaseDetails(extractFormattedDetails('complianceRisk', dbData)),
      vendor_transparency_risk_level: getComponentRiskLevel(adjustedScores.vendorTransparency),
      vendor_transparency_risk_level_class: getRiskLevelClass(getComponentRiskLevel(adjustedScores.vendorTransparency)),
      vendor_transparency_details: formatDatabaseDetails(extractFormattedDetails('vendorTransparency', dbData)),
      recommendations: generateRecommendationsHTML(dbData, adjustedScores)
    };

    // 4. Replace placeholders in the template
    let populatedHtml = htmlTemplate;
    for (const key in templateData) {
      populatedHtml = populatedHtml.replace(new RegExp(`{{${key}}}`, 'g'), templateData[key]);
    }

    return populatedHtml;

  } catch (error) {
    console.error('Error generating premium HTML:', error);
    // Return a user-friendly error page
    return `<html><body><h1>Error generating report</h1><p>${error.message}</p></body></html>`;
  }
}

export function generateFreePdfHTML(data: any) {
  // This function is being deprecated in favor of the new templating system.
  // It will be removed in a future update.
  // For now, it can fall back to the premium generator or a simplified version.
  console.warn("generateFreePdfHTML is deprecated and will be removed. Falling back to premium generator.");
  return generatePremiumHTML(data);
} 
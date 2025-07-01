import { getLayoutStyles, getComponentStyles } from './styles/index.ts';
import { generateHeaderHTML } from './templates/header.ts';
import { generateSummaryHTML } from './templates/summary.ts';
import { generateCategoriesHTML } from './templates/categories.ts';
import { generateRecommendationsSectionHTML } from './templates/recommendations.ts';
import { generateFooterHTML } from './templates/footer.ts';
import { extractCriticalFindings } from './utils.ts';
import { generateToolInfoHTML } from './templates/toolInfo.ts';
import { generateAzurePermissionsHTML } from './templates/azure.ts';

export function generatePremiumHTML(data: any): string {
  const {
        toolName,
        finalScore,
        riskLevel,
        executiveSummary,
        componentScores,
        dbData
  } = data;

  // 1. Prepare data for templates
    const findings = extractCriticalFindings(dbData, finalScore);
  const summaryData = { finalScore, riskLevel, executiveSummary, findings };

  // 2. Generate HTML parts
  const header = generateHeaderHTML(toolName);
  const summary = generateSummaryHTML(summaryData);
  const toolInfo = generateToolInfoHTML({
      toolName,
      category: dbData?.category || 'AI Platform',
      primaryUseCase: dbData?.primary_use_case || 'Enterprise Productivity',
      dataClassification: dbData?.data_classification || 'Confidential',
      vendor: dbData?.vendor || 'Unknown Vendor',
      licenseType: toolName.toLowerCase().includes('enterprise') ? 'Enterprise License' : 'Standard License'
  });
  const azureSection = generateAzurePermissionsHTML();
  const categories = generateCategoriesHTML(componentScores, dbData);
  const recommendations = generateRecommendationsSectionHTML(data);
  const footer = generateFooterHTML();

  // 3. Assemble styles
  const styles = `
    <style>
      ${getLayoutStyles()}
      ${getComponentStyles()}
      /* ... any other dynamic styles ... */
    </style>
  `;

  // 4. Combine everything into the final HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise AI Risk Assessment - ${toolName}</title>
    ${styles}
</head>
<body>
    <div class="print-button">
        <button onclick="window.print()" class="print-trigger">
            <span class="print-icon">📄</span>
            <span class="print-text">
                <span class="print-label">Export Report</span>
                <span class="print-format">PDF / Print</span>
            </span>
        </button>
    </div>
    <div class="report-container">
        ${header}
        ${summary}
        ${toolInfo}
        ${azureSection}
        ${categories}
        ${recommendations}
        ${footer}
    </div>
</body>
</html>`;
} 
import { getRiskColor } from '../utils.ts';

type SummaryData = {
    finalScore: number;
    riskLevel: string;
    executiveSummary: string;
    findings: string[];
}

// These functions generate text dynamically based on risk level
function getSecurityStatus(riskLevel: string): string {
    const level = riskLevel.toUpperCase();
    if (level === 'CRITICAL' || level === 'HIGH') {
        return 'Tool poses significant security risks requiring immediate attention and enhanced controls before deployment.';
    }
    if (level === 'MEDIUM') {
        return 'Tool meets basic security standards but requires standard enterprise controls and monitoring.';
    }
    return 'Tool demonstrates acceptable security posture with standard enterprise controls and monitoring.';
}

function getComplianceImpact(riskLevel: string): string {
     const level = riskLevel.toUpperCase();
    if (level === 'CRITICAL' || level === 'HIGH') {
        return 'High risk for intellectual property and regulated data. Strict data handling and DLP controls are mandatory.';
    }
    return 'Standard compliance controls applicable. Regular compliance monitoring and documentation recommended.';
}

function getMainRecommendation(riskLevel: string): string {
    const level = riskLevel.toUpperCase();
    if (level === 'CRITICAL') {
        return 'Immediate blocking and security review required before any use is authorized.';
    }
     if (level === 'HIGH') {
        return 'Conditional approval recommended, pending implementation of mandatory security controls and monitoring.';
    }
    return 'Standard deployment procedures with ongoing monitoring and periodic risk assessments.';
}

export const generateSummaryHTML = (data: SummaryData) => {
    const riskColor = getRiskColor(data.riskLevel);
    const riskScoreCardStyle = `background: ${riskColor}; box-shadow: 0 8px 25px ${riskColor}40;`;

    const findingsHTML = data.findings.length > 0 
        ? data.findings.join('<br>• ') 
        : 'No critical findings identified.';

    return `
      <div class="section">
          <div class="section-header">
              <h2 class="section-title">Executive Summary</h2>
          </div>
          
          <div class="executive-summary">
              <div class="risk-score-card" style="${riskScoreCardStyle}">
                  <div class="risk-score-number">${data.finalScore}</div>
                  <div class="risk-score-total">/ 100</div>
                  <div class="risk-level">${data.riskLevel} Risk</div>
              </div>
              
              <div class="summary-details">
                  <div class="summary-item">
                      <div class="summary-label">Security Status</div>
                      <div class="summary-text">${getSecurityStatus(data.riskLevel)}</div>
                  </div>
                  
                  <div class="summary-item">
                      <div class="summary-label">Compliance Impact</div>
                      <div class="summary-text">${getComplianceImpact(data.riskLevel)}</div>
                  </div>
                  
                  <div class="summary-item">
                      <div class="summary-label">Recommendation</div>
                      <div class="summary-text">${getMainRecommendation(data.riskLevel)}</div>
                  </div>
              </div>
          </div>
          
          <div class="key-findings">
              <div class="findings-header">
                  <span class="warning-icon">⚠️</span>
                  <div class="findings-title">Key Security Findings</div>
              </div>
              <div class="findings-text">
                  • ${findingsHTML}
              </div>
          </div>
      </div>
    `;
} 
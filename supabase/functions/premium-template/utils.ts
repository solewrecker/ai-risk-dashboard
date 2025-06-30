// supabase/functions/generate-premium-pdf/utils.ts

import { theme } from './styles/theme.ts';

// Multiplier constants
export const DATA_CLASSIFICATION_MULTIPLIERS = {
  'phi': 1.4,
  'financial': 1.3,
  'trade-secrets': 1.25,
  'pii': 1.2,
  'public': 0.9
};

export const USE_CASE_MULTIPLIERS = {
  'legal-compliance': 1.3,
  'finance-accounting': 1.2,
  'hr-executive': 1.15,
  'customer-support': 1.1,
  'development': 0.95,
  'marketing': 0.9,
  'research': 1.0,
  'general': 1.0
};

// Helper function to get CSS class for risk levels
export function getRiskLevelClass(riskLevel: string): string {
  const level = riskLevel.toUpperCase();
  if (level.includes('CRITICAL')) return 'critical';
  if (level.includes('HIGH')) return 'high';
  if (level.includes('MEDIUM') || level.includes('MODERATE')) return 'medium';
  if (level.includes('LOW')) return 'low';
  return 'unknown';
}

// Helper function to extract risk level from component scores
export function getComponentRiskLevel(score: number, maxScore = 25): string {
  if (score === null || score === undefined || maxScore === 0) return 'LOW';
  
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 80) return 'HIGH';      // 80%+ of max score is High
  if (percentage >= 50) return 'MEDIUM';    // 50-79% is Medium
  return 'LOW';                             // < 50% is Low
}

// Helper function to format database details with proper paragraph breaks
export function formatDatabaseDetails(details: string | null | undefined): string {
  if (!details || details.trim().length === 0) {
    return '';
  }
  
  const formatted = details
    .replace(/([A-Z][a-zA-Z\s]+:)/g, '<p><strong>$1</strong>')
    .replace(/<p><p>/g, '<p>')
    .replace(/(<p><strong>[^:]+:<\/strong>[^<]+)(?=<p>|$)/g, '$1</p>')
    .replace(/(<p><strong>[^:]+:<\/strong>[^<]+)$/g, '$1</p>')
    .replace(/\.\s+([A-Z][a-zA-Z\s]+:)/g, '.</p><p><strong>$1</strong>')
    .replace(/^(?!<p>)(.+)/, '<p>$1')
    .replace(/(?<!<\/p>)$/, '</p>')
    .replace(/<p><\/p>/g, '');
  
  return formatted;
}

// Helper function to extract formatted details from breakdown.subScores as a fallback
export function extractFormattedDetails(categoryKey: string, dbData: any): string {
    if (!dbData?.breakdown?.subScores?.[categoryKey]) return '';
    
    const category = dbData.breakdown.subScores[categoryKey];
    const parts: string[] = [];
    
    Object.keys(category).forEach(subKey => {
      const subItem = category[subKey];
      if (subItem?.note) {
        parts.push(`${subKey.charAt(0).toUpperCase() + subKey.slice(1)}: ${subItem.note}`);
      }
    });
    
    return parts.join('. ');
}

// Helper function to apply multipliers to component scores
export function applyMultipliersToComponents(dbData: any, formData: any) {
  if (!dbData) return { dataStorage: 0, trainingUsage: 0, accessControls: 0, complianceRisk: 0, vendorTransparency: 0 };
  
  const baseScores = {
    dataStorage: dbData.data_storage_score || 0,
    trainingUsage: dbData.training_usage_score || 0,
    accessControls: dbData.access_controls_score || 0,
    complianceRisk: dbData.compliance_score || 0,
    vendorTransparency: dbData.vendor_transparency_score || 0
  };
  
  const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification] || 1.0;
  baseScores.dataStorage = Math.round(baseScores.dataStorage * dataMultiplier);
  baseScores.complianceRisk = Math.round(baseScores.complianceRisk * dataMultiplier);
  
  const useCaseMultiplier = USE_CASE_MULTIPLIERS[formData.useCase] || 1.0;
  baseScores.complianceRisk = Math.round(baseScores.complianceRisk * useCaseMultiplier);
  baseScores.accessControls = Math.round(baseScores.accessControls * useCaseMultiplier);
  
  console.log('🎯 [Multiplier] Applied multipliers:', {
    dataClassification: formData.dataClassification,
    dataMultiplier: dataMultiplier,
    useCase: formData.useCase,
    useCaseMultiplier: useCaseMultiplier,
    adjustedScores: baseScores
  });
  
  return baseScores;
}

// Helper function to extract critical security findings from breakdown data
export function extractCriticalFindings(dbData: any, finalScore: number): string[] {
  const findings: string[] = [];
  if (!dbData?.breakdown?.subScores) {
    // Fallback if subScores doesn't exist
    const totalScore = dbData?.total_score || finalScore || 0;
    if (totalScore >= 50) {
      findings.push(`High-risk assessment with score of ${totalScore}/100 requiring enhanced security controls`);
    } else if (totalScore >= 20) {
      findings.push(`Moderate-risk assessment with score of ${totalScore}/100 requiring standard enterprise controls`);
    } else {
      findings.push(`Low-risk assessment with score of ${totalScore}/100 suitable for standard deployment`);
    }
    return findings.slice(0,4);
  }
  
  const subScores = dbData.breakdown.subScores;
  
  Object.keys(subScores).forEach(categoryKey => {
    const category = subScores[categoryKey];
    Object.keys(category).forEach(subKey => {
      const item = category[subKey];
      if (item && item.note) {
        const note = item.note.toLowerCase();
        if (note.includes('critical gap') || note.includes('critical:') || 
            note.includes('hipaa') || note.includes('not compliant') ||
            note.includes('indefinite retention') || note.includes('no enterprise') ||
            note.includes('major compliance barriers') || note.includes('high gdpr risk') ||
            note.includes('no audit trail') || note.includes('basic oauth only') ||
            note.includes('unclear server locations') || note.includes('lacks enterprise-grade') ||
            note.includes('soc 2') || note.includes('business associate') ||
            note.includes('barriers for healthcare') || note.includes('regulated data')) {
          findings.push(item.note);
        }
      }
    });
  });
  
  if (findings.length === 0) {
    const totalScore = dbData?.total_score || finalScore || 0;
    if (totalScore >= 50) {
      findings.push(`High-risk assessment with score of ${totalScore}/100 requiring enhanced security controls`);
    } else if (totalScore >= 20) {
      findings.push(`Moderate-risk assessment with score of ${totalScore}/100 requiring standard enterprise controls`);
    } else {
      findings.push(`Low-risk assessment with score of ${totalScore}/100 suitable for standard deployment`);
    }
  }
  
  return findings.slice(0, 4);
}

export function generateExecutiveSummary(score: number, dataClassification: string) {
  const summary = {
    securityStatus: '',
    complianceImpact: '',
    recommendation: ''
  };

  // Determine Security Status
  if (score >= 80) {
    summary.securityStatus = 'Tool poses significant security risks requiring immediate attention and enhanced controls before deployment.';
  } else if (score >= 60) {
    summary.securityStatus = 'Tool requires significant security improvements and enhanced controls for enterprise deployment.';
  } else if (score >= 35) {
    summary.securityStatus = 'Tool meets basic security standards but requires standard enterprise controls and monitoring.';
  } else {
    summary.securityStatus = 'Tool demonstrates an acceptable security posture for deployment with standard monitoring.';
  }

  // Determine Compliance Impact
  switch (dataClassification) {
    case 'phi':
      summary.complianceImpact = 'Significant compliance barriers exist. Use with PHI requires a signed BAA and thorough HIPAA compliance verification.';
      break;
    case 'financial':
      summary.complianceImpact = 'PCI-DSS and SOX compliance verification needed due to financial data classification and regulatory requirements.';
      break;
    case 'trade-secrets':
      summary.complianceImpact = 'High risk for intellectual property. Strict data handling and DLP controls are mandatory.';
      break;
    case 'pii':
      summary.complianceImpact = 'GDPR/CCPA compliance must be verified. Data residency and processing agreements are required.';
      break;
    case 'public':
    default:
      summary.complianceImpact = 'Public data processing has minimal compliance impact, but should follow security best practices.';
      break;
  }

  // Determine Recommendation
  if (score >= 80) {
    summary.recommendation = 'Not recommended for enterprise use. Immediate blocking and risk mitigation is advised.';
  } else if (score >= 60) {
    summary.recommendation = 'Not recommended for enterprise use without significant security improvements and additional controls.';
  } else if (score >= 35) {
    summary.recommendation = 'Conditional approval recommended, pending implementation of standard security controls and monitoring.';
  } else {
    summary.recommendation = 'Recommended for deployment with standard monitoring and periodic review.';
  }

  return summary;
}

export function getRiskLevelFromScore(score: number): string {
  if (score >= 8) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  if (score >= 2) return 'LOW';
  return 'N/A';
}

export function getRiskColor(riskLevel: string): string {
  const level = riskLevel.toUpperCase();
  if (level.includes('CRITICAL')) return theme.colors.riskCritical;
  if (level.includes('HIGH')) return theme.colors.riskHigh;
  if (level.includes('MEDIUM') || level.includes('MODERATE')) return theme.colors.riskModerate;
  if (level.includes('LOW')) return theme.colors.riskLow;
  return theme.colors.secondaryText; // Default color
} 
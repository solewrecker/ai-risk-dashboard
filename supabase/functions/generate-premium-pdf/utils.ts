// supabase/functions/generate-premium-pdf/utils.ts

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
  const level = (riskLevel || 'unknown').toLowerCase();
  switch(level) {
    case 'high': return 'high';
    case 'medium': return 'medium';
    case 'low': return 'low';
    case 'critical': return 'critical';
    case 'unknown': return 'unknown';
    default: return 'unknown';
  }
}

// Helper function to extract risk level from component scores
export function getComponentRiskLevel(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'UNKNOWN';
  if (score >= 8) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
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
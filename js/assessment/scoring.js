// js/assessment/scoring.js
// Contains all business logic for calculating risk scores.

// --- Constants ---
const DATA_CLASSIFICATION_MULTIPLIERS = {
    'phi': 1.4,
    'financial': 1.3,
    'trade-secrets': 1.25,
    'pii': 1.2,
    'public': 0.9
};

const USE_CASE_MULTIPLIERS = {
    'legal-compliance': 1.3,
    'finance-accounting': 1.2,
    'hr-executive': 1.15,
    'customer-support': 1.1,
    'development': 0.95,
    'marketing': 0.9,
    'research': 1.0,
    'general': 1.0
};

// --- Public Functions ---
export function generateHeuristicScore(formData) {
    let score = 60; // Higher default for unknown tools
    if (formData.toolVersion === 'enterprise') score -= 15;
    if (formData.toolCategory === 'conversational-ai') score += 15;
    else if (formData.toolCategory === 'code-assistant') score += 5;
    else if (formData.toolCategory === 'productivity') score += 10;
    return Math.min(100, Math.max(20, score));
}

export function applyMultipliers(baseScore, formData) {
    let finalScore = baseScore;
    const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification] || 1;
    const useCaseMultiplier = USE_CASE_MULTIPLIERS[formData.useCase] || 1;
    finalScore *= dataMultiplier;
    finalScore *= useCaseMultiplier;
    return Math.round(finalScore);
}

export function applyClientSideMultipliers(dbData, formData) {
    if (!dbData) return null;

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

    const totalScore = Object.values(baseScores).reduce((sum, score) => sum + score, 0);

    // Return a structure that mimics the original toolData object for consistency
    return {
        ...dbData, // Pass through original data
        total_score: totalScore, // The new, client-adjusted total score
        breakdown: {
            ...dbData.breakdown,
            scores: baseScores
        }
    };
}

export function getRiskLevel(score) {
    if (score >= 75) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
}

export function generateRecommendations(score, formData) {
    const riskLevel = getRiskLevel(score);
    const dataType = formData.dataClassification;
    let recommendations = [];

    if (riskLevel === 'critical') {
        recommendations.push('IMMEDIATE ACTION REQUIRED: This tool should not be used with the selected data type.');
        recommendations.push('Consider enterprise alternatives with stronger security controls.');
    } else if (riskLevel === 'high') {
        recommendations.push('Significant security controls required before deployment.');
        recommendations.push('Implement data loss prevention (DLP) policies and review access.');
    }

    if (dataType === 'phi') {
        recommendations.push('HIPAA compliance verification and a signed Business Associate Agreement (BAA) are required.');
    } else if (dataType === 'financial') {
        recommendations.push('PCI-DSS and SOX compliance must be verified for the intended use case.');
    }

    if (recommendations.length === 0) {
        recommendations.push('Standard security monitoring and user awareness training are recommended.');
    }
    
    return recommendations;
}

export function calculateScore(formData) {
    const baseScore = generateHeuristicScore(formData);
    const finalScore = applyMultipliers(baseScore, formData);
    const riskLevel = getRiskLevel(finalScore);
    const recommendations = generateRecommendations(finalScore, formData);
    
    // Create a simplified breakdown for heuristic results
    const detailedAssessment = {
        assessment_details: {
            "Data Storage & Security": { category_score: 50, justification: "Heuristically assigned score." },
            "Access Controls": { category_score: 50, justification: "Heuristically assigned score." },
            "Training Data Usage": { category_score: 50, justification: "Heuristically assigned score." },
            "Compliance & Legal Risk": { category_score: 50, justification: "Heuristically assigned score." },
            "Vendor Transparency": { category_score: 50, justification: "Heuristically assigned score." }
        }
    };
    
    // Mimic the structure expected by the results display function
    return {
        finalScore: finalScore,
        riskLevel: riskLevel,
        recommendations: recommendations,
        detailedAssessment: detailedAssessment,
        categoryScores: { // Legacy structure, can be phased out
            data_storage_and_security: 50,
            access_controls: 50,
            training_data_usage: 50,
            compliance_and_legal_risk: 50,
            vendor_transparency: 50
        }
    };
} 
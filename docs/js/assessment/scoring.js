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
    const updatedDetailedAssessment = {
        ...(dbData.detailed_assessment || {}),
        final_risk_score: totalScore,
        final_risk_category: getRiskLevel(totalScore),
        final_score_with_multiplier: totalScore, // Add and update final_score_with_multiplier
        assessment_details: { // Ensure assessment_details are updated
            ...(dbData.detailed_assessment?.assessment_details || {}),
            data_storage_and_security: {
                ...(dbData.detailed_assessment?.assessment_details?.data_storage_and_security || {}),
                category_score: baseScores.dataStorage,
                criteria: (() => {
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.data_storage_and_security?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.data_storage_and_security?.category_score || 0;
                    const newCategoryScore = baseScores.dataStorage;
                    const scalingFactor = (oldCategoryScore !== 0) ? (newCategoryScore / oldCategoryScore) : (newCategoryScore > 0 ? 1 : 0);

                    const updatedCriteria = {};
                    for (const key in oldCriteria) {
                        if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') {
                            updatedCriteria[key] = {
                                ...oldCriteria[key],
                                score: Math.round(oldCriteria[key].score * scalingFactor)
                            };
                        } else {
                            updatedCriteria[key] = oldCriteria[key];
                        }
                    }
                    return updatedCriteria;
                })()
            },
            training_data_usage: {
                ...(dbData.detailed_assessment?.assessment_details?.training_data_usage || {}),
                category_score: baseScores.trainingUsage,
                criteria: (() => {
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.training_data_usage?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.training_data_usage?.category_score || 0;
                    const newCategoryScore = baseScores.trainingUsage;
                    const scalingFactor = (oldCategoryScore !== 0) ? (newCategoryScore / oldCategoryScore) : (newCategoryScore > 0 ? 1 : 0);

                    const updatedCriteria = {};
                    for (const key in oldCriteria) {
                        if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') {
                            updatedCriteria[key] = {
                                ...oldCriteria[key],
                                score: Math.round(oldCriteria[key].score * scalingFactor)
                            };
                        } else {
                            updatedCriteria[key] = oldCriteria[key];
                        }
                    }
                    return updatedCriteria;
                })()
            },
            access_controls: {
                ...(dbData.detailed_assessment?.assessment_details?.access_controls || {}),
                category_score: baseScores.accessControls,
                criteria: (() => {
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.access_controls?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.access_controls?.category_score || 0;
                    const newCategoryScore = baseScores.accessControls;
                    const scalingFactor = (oldCategoryScore !== 0) ? (newCategoryScore / oldCategoryScore) : (newCategoryScore > 0 ? 1 : 0);

                    const updatedCriteria = {};
                    for (const key in oldCriteria) {
                        if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') {
                            updatedCriteria[key] = {
                                ...oldCriteria[key],
                                score: Math.round(oldCriteria[key].score * scalingFactor)
                            };
                        } else {
                            updatedCriteria[key] = oldCriteria[key];
                        }
                    }
                    return updatedCriteria;
                })()
            },
            compliance_and_legal_risk: {
                ...(dbData.detailed_assessment?.assessment_details?.compliance_and_legal_risk || {}),
                category_score: baseScores.complianceRisk,
                criteria: (() => {
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.compliance_and_legal_risk?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.compliance_and_legal_risk?.category_score || 0;
                    const newCategoryScore = baseScores.complianceRisk;
                    const scalingFactor = (oldCategoryScore !== 0) ? (newCategoryScore / oldCategoryScore) : (newCategoryScore > 0 ? 1 : 0);

                    const updatedCriteria = {};
                    for (const key in oldCriteria) {
                        if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') {
                            updatedCriteria[key] = {
                                ...oldCriteria[key],
                                score: Math.round(oldCriteria[key].score * scalingFactor)
                            };
                        } else {
                            updatedCriteria[key] = oldCriteria[key];
                        }
                    }
                    return updatedCriteria;
                })()
            },
            vendor_transparency: {
                ...(dbData.detailed_assessment?.assessment_details?.vendor_transparency || {}),
                category_score: baseScores.vendorTransparency,
                criteria: (() => {
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.vendor_transparency?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.vendor_transparency?.category_score || 0;
                    const newCategoryScore = baseScores.vendorTransparency;
                    const scalingFactor = (oldCategoryScore !== 0) ? (newCategoryScore / oldCategoryScore) : (newCategoryScore > 0 ? 1 : 0);

                    const updatedCriteria = {};
                    for (const key in oldCriteria) {
                        if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') {
                            updatedCriteria[key] = {
                                ...oldCriteria[key],
                                score: Math.round(oldCriteria[key].score * scalingFactor)
                            };
                        } else {
                            updatedCriteria[key] = oldCriteria[key];
                        }
                    }
                    return updatedCriteria;
                })()
            }
        }
    };

    return {
        ...dbData, // Pass through original data
        total_score: totalScore, // The new, client-adjusted total score
        risk_level: getRiskLevel(totalScore), // Ensure top-level risk_level is also updated
        compliance_certifications: dbData.compliance_certifications || [], // Ensure compliance certifications are preserved
        breakdown: {
            ...dbData.breakdown,
            scores: baseScores
        },
        detailed_assessment: updatedDetailedAssessment, // Ensure the detailed_assessment is updated here
    };
}

export function getRiskLevel(score) {
    if (score >= 80) return 'critical';
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
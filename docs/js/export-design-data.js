const mockExportData = {
    // Top-level fields directly from the Supabase 'assessments' table,
    // plus merged fields from 'assessment_data' JSONB column.
    id: "ecea22ff-7e6c-4dce-9c27-c56c7ed782ea",
    user_id: "a85a12a6-e381-4f0c-88d7-e3c110745079",
    created_at: "2025-07-13 19:21:05.957127+00",
    name: "Microsoft Copilot", // {{toolName}}
    vendor: "Microsoft Corporation", // {{toolSubtitle}}
    risk_level: "high", // {{riskLevel}}, {{riskLevelLower}}
    total_score: 78, // {{overallScore}}
    data_storage_score: 23,
    training_usage_score: 15,
    access_controls_score: 20,
    compliance_score: 12,
    vendor_transparency_score: 8,
    category: "design-creative", // Also used for assessment-item-category
    data_classification: "financial",

    // These fields are merged directly from 'assessment_data'
    // They are now top-level properties on 'primaryAssessment'
    source: "database",
    sources: [
        {
            url: "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy",
            title: "Data, Privacy, and Security for Microsoft 365 Copilot",
            last_updated: "2024-03-01"
        },
        {
            url: "https://support.microsoft.com/en-us/office/copilot-in-microsoft-365-apps-for-home-your-data-and-privacy",
            title: "Copilot in Microsoft 365 apps for home: your data and privacy",
            last_updated: "2024-01-15"
        }
    ],
    formData: { // Nested data, used indirectly or for specific logic
        useCase: "research",
        toolName: "Microsoft Copilot",
        toolVersion: "free",
        toolCategory: "design-creative",
        dataClassification: "financial"
    },
    breakdown: { // Nested data, used indirectly or for specific logic
        scores: {
            dataStorage: 23,
            trainingUsage: 15,
            accessControls: 20,
            complianceRisk: 12,
            vendorTransparency: 8
        }
    },
    riskLevel: "HIGH RISK", // Redundant with top-level risk_level, but exists in source
    confidence: 0.6,
    finalScore: 78, // Redundant with top-level total_score, but exists in source
    assessed_by: "AI Security Council",
    recommendations: [ // Used in Key Recommendations section ({{#each recommendations}})
        {
            title: "Block for sensitive data processing",
            category: "security",
            priority: "high", // Used for recommendations__priority-badge
            description: "Free version lacks enterprise controls and compliance certifications required for business data"
        },
        {
            title: "Consider Microsoft 365 Copilot for business use",
            category: "alternative",
            priority: "medium",
            description: "Enterprise version provides better data protection, compliance, and administrative controls"
        },
        {
            title: "User education required",
            category: "training",
            priority: "medium",
            description: "If allowing limited personal use, educate users on data handling and privacy implications"
        }
        // Example for Key Strengths (if data existed)
        // {
        //     title: "Strong data encryption",
        //     category: "strength",
        //     priority: "low",
        //     description: "Implements enterprise-grade encryption (AES-256) across infrastructure."
        // }
    ],
    assessment_notes: "Confidence limited due to lack of specific documentation for free consumer version. Assessment based on publicly available privacy policies and general Microsoft enterprise documentation. Significant gaps in enterprise-specific controls and compliance for free version.",
    primary_use_case: "General productivity assistance and content generation",
    azure_permissions: {
        required_permissions: [ "user.read", "profile.read" ],
        recommended_restrictions: [ "Block access to confidential data repositories" ]
    },
    detailedAssessment: { // Used in Detailed Breakdown of Risks section ({{#each detailedAssessment.assessment_details}})
        tool_name: "Microsoft Copilot Free",
        final_risk_score: 70,
        assessment_details: { // This is the object that is iterated over
            access_controls: {
                criteria: {
                    integration: { score: 5, justification: "..." },
                    admin_management: { score: 8, justification: "..." },
                    audit_capabilities: { score: 7, justification: "..." }
                },
                category_score: 20, // Displayed as score for Access Controls
                summary_and_recommendation: "Access controls are minimal for the free version, lacking enterprise integration like SSO." // Displayed as description
            },
            training_data_usage: {
                criteria: {
                    data_sharing: { score: 0, justification: "..." },
                    model_training: { score: 15, justification: "..." }
                },
                category_score: 15, // Displayed as score for Training Data Usage
                summary_and_recommendation: "User data may be used for model training by default, requiring user opt-out."
            },
            vendor_transparency: {
                criteria: {
                    documentation_and_support: { score: 8, justification: "..." }
                },
                category_score: 8, // Displayed as score for Vendor Transparency
                summary_and_recommendation: "Documentation is limited for the free version, lacking detailed security whitepapers."
            },
            compliance_and_legal_risk: {
                criteria: {
                    regulatory_violations: { score: 6, justification: "..." },
                    data_processing_transparency: { score: 3, justification: "..." }
                },
                category_score: 9, // Displayed as score for Compliance And Legal Risk
                summary_and_recommendation: "Free version lacks enterprise compliance certifications (e.g., SOC 2, ISO 27001)."
            },
            data_storage_and_security: {
                criteria: {
                    data_retention: { score: 8, justification: "..." },
                    geographic_control: { score: 6, justification: "..." },
                    encryption_standards: { score: 4, justification: "..." }
                },
                category_score: 18, // Displayed as score for Data Storage And Security
                summary_and_recommendation: "Unclear data retention and geographic control for free users."
            }
        },
        compliance_summary: "Free version lacks enterprise compliance certifications. Limited GDPR/CCPA compliance through general Microsoft privacy policy but no enterprise-grade controls or certifications.",
        final_risk_category: "HIGH RISK",
        summary_and_recommendation: "HIGH RISK tool unsuitable for business use due to lack of enterprise controls, unclear training data policies for free version, and missing compliance certifications. Recommend blocking for sensitive data and consider enterprise alternative.",
        use_case_multiplier_applied: {
            use_case: "General productivity assistance and content generation",
            base_score: 45,
            data_classification: "Public/Marketing Data",
            final_score_with_multiplier: 41
        }
    },
    is_public: false,
    compliance_certifications: [
        "CCPA: Conditionally Compliant",
        "GDPR: Conditionally Compliant"
    ],
    license_type: "Free",
    documentation_tier: "Tier 1: Public Only"
};

// Export the mock data for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mockExportData;
} 
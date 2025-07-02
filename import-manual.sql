-- Copy and run this entire script in the Supabase SQL Editor

-- Step 1: Create a temporary table to hold the JSON data
CREATE TEMP TABLE temp_assessment_import (data jsonb);

-- Step 2: Insert the JSON data as a single string literal
INSERT INTO temp_assessment_import (data) VALUES ('{
  "name": "123 Notetaker AI Free",
  "vendor": "BlueSky Apps",
  "license_type": "Free",
  "total_score": 85,
  "risk_level": "CRITICAL RISK",
  "data_storage_score": 21,
  "training_usage_score": 0,
  "access_controls_score": 20,
  "compliance_score": 20,
  "vendor_transparency_score": 4,
  "summary_and_recommendation": "123 Notetaker AI poses critical security risks due to lack of major compliance certifications (SOC 2, ISO 27001, HIPAA), stores sensitive meeting audio/video data in US servers, lacks enterprise SSO integration, and has no documented enterprise admin controls. The tool automatically captures and processes meeting content with limited transparency. RECOMMENDATION: BLOCK for enterprise use, especially for any meetings containing sensitive or confidential information.",
  "confidence": 0.85,
  "notes": "Assessment based on Microsoft 365 App Certification documentation. Tool lacks enterprise-grade security controls and compliance certifications despite handling sensitive meeting data.",
  "primary_use_case": "Meeting transcription and note-taking",
  "data_classification": "Business Communications",
  "category": "AI Meeting Assistant",
  "assessed_by": "AI Security Council",
  
  "breakdown": {
    "scores": {
      "dataStorage": 21,
      "trainingUsage": 0,
      "accessControls": 20,
      "complianceRisk": 20,
      "vendorTransparency": 4
    },
    "subScores": {
      "dataStorage": {
        "geographic": {
          "score": 3,
          "note": "Data stored in USA with contractual documentation, which is a known secure region but external to organization control."
        },
        "encryption": {
          "score": 4,
          "note": "Basic encryption mentioned (TLS 1.1+ support confirmed) but no detailed encryption specifications published regarding at-rest encryption or key management."
        },
        "retention": {
          "score": 3,
          "note": "Clear limited retention documented as ''less than 30 days'' after account termination with established data retention and disposal process."
        }
      },
      "trainingUsage": {
        "training": {
          "score": 0,
          "note": "No indication that customer data is used for AI model training based on available documentation."
        },
        "sharing": {
          "score": 0,
          "note": "Documentation explicitly states ''No'' for transferring customer data to third parties or subprocessors."
        }
      },
      "accessControls": {
        "admin": {
          "score": 8,
          "note": "No enterprise admin controls documented. App integration is not with Microsoft Identity Platform, indicating individual account management only."
        },
        "audit": {
          "score": 7,
          "note": "No audit capabilities mentioned in documentation. No activity logs or user tracking capabilities documented for administrators."
        },
        "integration": {
          "score": 5,
          "note": "No enterprise integration capabilities. Documentation confirms no Microsoft Identity Platform integration and no SSO support."
        }
      },
      "complianceRisk": {
        "violations": {
          "score": 15,
          "note": "No major compliance certifications. Documentation explicitly states ''No'' for SOC 2, ISO 27001, HIPAA, FedRAMP, and other major enterprise compliance standards."
        },
        "transparency": {
          "score": 5,
          "note": "Basic transparency with some data processing details provided but lacks comprehensive data flow diagrams and detailed third-party processor documentation."
        }
      },
      "vendorTransparency": {
        "score": {
          "score": 4,
          "note": "Adequate documentation available through Microsoft certification program with basic privacy policy, but limited security documentation and no published security whitepapers or transparency reports."
        }
      }
    },
    "compliance": {
      "pci": "non-compliant",
      "sox": "non-compliant",
      "gdpr": "compliant",
      "hipaa": "non-compliant"
    }
  },
  
  "details": {
    "dataStorage": "Geographic: Data stored in USA with contractual documentation, secure region but external control | Encryption: Basic TLS 1.1+ confirmed but limited at-rest encryption details | Retention: Clear 30-day deletion policy with established disposal process",
    "trainingUsage": "Training: No customer data used for AI model training | Sharing: Explicitly states no third-party data sharing or subprocessors",
    "accessControls": "Admin: No enterprise admin controls, individual accounts only | Audit: No audit logs or user tracking for administrators | Integration: No SSO or enterprise identity integration",
    "complianceRisk": "Violations: No SOC 2, ISO 27001, HIPAA, or other major enterprise certifications | Transparency: Basic data processing transparency but lacks detailed flow diagrams",
    "vendorTransparency": "Adequate documentation via Microsoft certification but limited security whitepapers or transparency reports"
  },
  
  "azure_permissions": {
    "required_permissions": [
      "teams.meeting.read",
      "user.read"
    ],
    "recommended_restrictions": [
      "Block network access",
      "Require conditional access policies",
      "Block installation at tenant level"
    ]
  },
  
  "recommendations": [
    {
      "title": "Block enterprise deployment",
      "description": "Prevent installation of 123 Notetaker AI at the tenant level due to lack of enterprise security controls and compliance certifications",
      "priority": "high",
      "category": "security"
    },
    {
      "title": "Evaluate enterprise alternatives",
      "description": "Consider Microsoft native solutions or enterprise-grade meeting transcription tools with proper compliance certifications",
      "priority": "medium",
      "category": "alternatives"
    },
    {
      "title": "User education",
      "description": "Educate users about risks of using unauthorized meeting recording tools that may capture sensitive information",
      "priority": "high",
      "category": "training"
    }
  ],
  
  "sources": [
    {
      "url": "https://learn.microsoft.com/de-de/microsoft-365-app-certification/teams/bluesky-apps-123-notetaker-ai",
      "title": "Microsoft 365 App Certification - 123 Notetaker AI",
      "last_updated": "2025-06-04"
    },
    {
      "url": "https://blueskyapps.org/terms",
      "title": "BlueSky Apps Terms of Service",
      "last_updated": "Unknown"
    }
  ],
  
  "detailed_assessment": {
    "tool_name": "123 Notetaker AI Free",
    "final_risk_score": 85,
    "final_risk_category": "CRITICAL RISK",
    "summary_and_recommendation": "123 Notetaker AI poses critical security risks due to lack of major compliance certifications (SOC 2, ISO 27001, HIPAA), stores sensitive meeting audio/video data in US servers, lacks enterprise SSO integration, and has no documented enterprise admin controls. The tool automatically captures and processes meeting content with limited transparency. RECOMMENDATION: BLOCK for enterprise use, especially for any meetings containing sensitive or confidential information.",
    "assessment_details": {
      "data_storage_and_security": {
        "category_score": 21,
        "criteria": {
          "geographic_control": {
            "score": 3,
            "justification": "Data stored in USA with contractual documentation, which is a known secure region but external to organization control."
          },
          "encryption_standards": {
            "score": 4,
            "justification": "Basic encryption mentioned (TLS 1.1+ support confirmed) but no detailed encryption specifications published regarding at-rest encryption or key management."
          },
          "data_retention": {
            "score": 3,
            "justification": "Clear limited retention documented as ''less than 30 days'' after account termination with established data retention and disposal process."
          }
        }
      },
      "training_data_usage": {
        "category_score": 0,
        "criteria": {
          "model_training": {
            "score": 0,
            "justification": "No indication that customer data is used for AI model training based on available documentation."
          },
          "data_sharing": {
            "score": 0,
            "justification": "Documentation explicitly states ''No'' for transferring customer data to third parties or subprocessors."
          }
        }
      },
      "access_controls": {
        "category_score": 20,
        "criteria": {
          "admin_management": {
            "score": 8,
            "justification": "No enterprise admin controls documented. App integration is not with Microsoft Identity Platform, indicating individual account management only."
          },
          "audit_capabilities": {
            "score": 7,
            "justification": "No audit capabilities mentioned in documentation. No activity logs or user tracking capabilities documented for administrators."
          },
          "integration": {
            "score": 5,
            "justification": "No enterprise integration capabilities. Documentation confirms no Microsoft Identity Platform integration and no SSO support."
          }
        }
      },
      "compliance_and_legal_risk": {
        "category_score": 20,
        "criteria": {
          "regulatory_violations": {
            "score": 15,
            "justification": "No major compliance certifications. Documentation explicitly states ''No'' for SOC 2, ISO 27001, HIPAA, FedRAMP, and other major enterprise compliance standards."
          },
          "data_processing_transparency": {
            "score": 5,
            "justification": "Basic transparency with some data processing details provided but lacks comprehensive data flow diagrams and detailed third-party processor documentation."
          }
        }
      },
      "vendor_transparency": {
        "category_score": 4,
        "criteria": {
          "documentation_and_support": {
            "score": 4,
            "justification": "Adequate documentation available through Microsoft certification program with basic privacy policy, but limited security documentation and no published security whitepapers or transparency reports."
          }
        }
      }
    },
    "use_case_multiplier_applied": {
      "use_case": "Meeting transcription and note-taking",
      "data_classification": "Business Communications",
      "base_score": 65,
      "final_score_with_multiplier": 85
    }
  }
}');

-- Step 3: Insert or update the ai_tools table from the temporary table
INSERT INTO ai_tools (
  name, vendor, license_type, total_score, risk_level, data_storage_score, training_usage_score, 
  access_controls_score, compliance_score, vendor_transparency_score, summary_and_recommendation, 
  confidence, primary_use_case, data_classification, category, assessed_by, 
  breakdown, details, azure_permissions, recommendations, sources, detailed_assessment, created_at, updated_at
)
SELECT 
  data->>'name',
  data->>'vendor',
  data->>'license_type',
  (data->>'total_score')::bigint,
  data->>'risk_level',
  (data->>'data_storage_score')::bigint,
  (data->>'training_usage_score')::bigint,
  (data->>'access_controls_score')::bigint,
  (data->>'compliance_score')::bigint,
  (data->>'vendor_transparency_score')::bigint,
  data->>'summary_and_recommendation',
  (data->>'confidence')::double precision,
  data->>'primary_use_case',
  data->>'data_classification',
  data->>'category',
  data->>'assessed_by',
  data->'breakdown',
  data->'details',
  data->'azure_permissions',
  data->'recommendations',
  data->'sources',
  data->'detailed_assessment',
  NOW(),
  NOW()
FROM temp_assessment_import
ON CONFLICT (name) 
DO UPDATE SET
  vendor = EXCLUDED.vendor,
  license_type = EXCLUDED.license_type,
  total_score = EXCLUDED.total_score,
  risk_level = EXCLUDED.risk_level,
  data_storage_score = EXCLUDED.data_storage_score,
  training_usage_score = EXCLUDED.training_usage_score,
  access_controls_score = EXCLUDED.access_controls_score,
  compliance_score = EXCLUDED.compliance_score,
  vendor_transparency_score = EXCLUDED.vendor_transparency_score,
  summary_and_recommendation = EXCLUDED.summary_and_recommendation,
  confidence = EXCLUDED.confidence,
  primary_use_case = EXCLUDED.primary_use_case,
  data_classification = EXCLUDED.data_classification,
  category = EXCLUDED.category,
  assessed_by = EXCLUDED.assessed_by,
  breakdown = EXCLUDED.breakdown,
  details = EXCLUDED.details,
  azure_permissions = EXCLUDED.azure_permissions,
  recommendations = EXCLUDED.recommendations,
  sources = EXCLUDED.sources,
  detailed_assessment = EXCLUDED.detailed_assessment,
  updated_at = NOW();

-- Step 4: Clean up the temporary table
DROP TABLE temp_assessment_import;
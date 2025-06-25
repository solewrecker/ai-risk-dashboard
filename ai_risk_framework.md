# AI Tool Risk Assessment Framework - Corrected

**Framework Author:** [Your Name]
**Version:** 1.0
**Date:** [Current Date]

*This document is the intellectual property of [Scott RIce]. It is shared with [Company Name] for discussion and evaluation purposes. All rights reserved.*

---

## Scoring Methodology (0-100 Total Points)

**Higher scores = Higher risk**. Each category assigns penalty points based on risk factors.

| Criteria | Max Points | Description | Scoring Logic |
|----------|------------|-------------|---------------|
| Data Storage & Security | 25 | Data handling and protection | Poor practices get more points |
| Training Data Usage | 25 | Whether your data trains AI models | Training use = high penalty |
| Access Controls | 20 | Enterprise governance capabilities | Lack of controls = penalties |
| Compliance & Legal Risk | 20 | Regulatory violation potential | High violation risk = penalties |
| Vendor Transparency | 10 | How clear vendor practices are | Opacity = penalty points |

### Objective Scoring Methodology

**To ensure consistent, defensible assessments, all criteria use measurable, objective standards:**

- **Specific Documentation Requirements**: Rather than "good" vs "poor" documentation, criteria specify exactly what documents must be present (e.g., "Published security whitepaper + detailed privacy policy")
- **Quantifiable Thresholds**: Time-based criteria (e.g., "retention ≤90 days", "support response within 48 hours") eliminate subjective interpretation
- **Boolean Verification**: Criteria use verifiable facts (e.g., "SOC 2 certification published" vs subjective quality assessments)
- **Multiple Evidence Points**: Higher scores require multiple verified deficiencies, preventing single-point-of-failure assessments

### Detailed Scoring Criteria

#### Data Storage & Security (25 points max)
- **Geographic Control** (0-8 points)
  - 0: On-premises or controlled data residency
  - 3: Known secure regions (US, EU) with contracts
  - 6: External servers, unclear location
  - 8: Servers in jurisdictions with poor data laws
- **Encryption Standards** (0-7 points)
  - **0: Customer-Controlled Encryption** - End-to-end encryption + customer-managed keys + zero-knowledge architecture documented
  - **2: Enterprise-Grade Encryption** - AES-256 encryption at rest and in transit + vendor-managed keys + published encryption specifications
  - **4: Basic Encryption** - TLS encryption in transit + standard encryption at rest + limited encryption details published
  - **6: Minimal Encryption** - Basic TLS only OR unclear encryption specifications OR older encryption standards
  - **7: No/Unclear Encryption** - No encryption mentioned OR explicitly states no encryption OR contradictory encryption claims
- **Data Retention** (0-10 points)
  - **0: Customer-Controlled Retention** - No data retention OR customer controls all retention periods OR immediate deletion available on demand
  - **3: Clear Limited Retention** - Specific retention periods documented (≤90 days) + automatic deletion procedures + user deletion controls
  - **6: Extended Retention** - Long retention periods documented (>90 days, ≤1 year) + deletion procedures available
  - **8: Very Long Retention** - Retention >1 year + limited deletion options + unclear retention procedures
  - **10: Indefinite/Unclear Retention** - Indefinite retention stated OR no retention policy OR contradictory retention statements

#### Training Data Usage (25 points max)
- **Model Training** (0-20 points)
  - 0: Contractual guarantee of no training use
  - 5: Opt-out available with clear process
  - 15: Default training use with difficult opt-out
  - 20: Always used for training, no opt-out
- **Data Sharing** (0-5 points)
  - 0: No third-party sharing
  - 3: Limited sharing with clear disclosure
  - 5: Broad sharing or unclear sharing practices

#### Access Controls (20 points max)
- **Admin Management** (0-8 points)
  - **0: Full Enterprise Controls** - Centralized admin dashboard + user provisioning/deprovisioning + role-based permissions + group management + domain verification
  - **2: Advanced User Management** - Admin dashboard + basic user management + some role controls + limited group features
  - **4: Basic User Management** - Simple user list + add/remove users + basic permissions only
  - **6: Limited Controls** - User visibility only + minimal management capabilities
  - **8: No Admin Oversight** - Individual accounts only + no organizational visibility + no centralized management
- **Audit Capabilities** (0-7 points)
  - **0: Comprehensive Auditing** - Real-time activity logs + exportable reports + user action tracking + data access logs + compliance reporting features
  - **2: Good Auditing** - Activity logs available + basic reporting + some user tracking capabilities
  - **4: Basic Auditing** - Limited logs + manual export only + basic usage statistics
  - **7: No Audit Capabilities** - No activity logs OR logs not accessible to administrators OR no usage tracking
- **Integration** (0-5 points)
  - **0: Full Enterprise Integration** - SAML/OIDC SSO + SCIM provisioning + Active Directory integration + API access for enterprise management
  - **2: Basic SSO Support** - SSO available + basic user sync + limited API access
  - **3: Limited Integration** - SSO only + no provisioning + minimal enterprise features
  - **5: No Enterprise Integration** - Username/password only + no SSO + no enterprise identity management

#### Compliance & Legal Risk (20 points max)
- **Regulatory Violations** (0-15 points)
  - **0: Fully Compliant** - Published compliance certifications (SOC 2, ISO 27001, etc.) + signed BAAs available + documented GDPR Article 28 compliance + industry-specific certifications (HIPAA, PCI-DSS, FedRAMP as applicable)
  - **3: Mostly Compliant** - Basic compliance certifications + privacy policy compliant with major regulations + some gaps in specialized requirements
  - **6: Partially Compliant** - Privacy policy present but lacks specific regulatory compliance statements + no third-party certifications + compliance claims without verification
  - **10: Compliance Gaps** - Generic privacy policy + no compliance certifications + documented violations or regulatory warnings in past 2 years
  - **15: Non-Compliant** - No privacy policy OR privacy policy contradicts major regulations OR explicit non-compliance statements OR recent regulatory penalties
- **Data Processing Transparency** (0-5 points)
  - **0: Full Transparency** - Published data flow diagrams + specific data processing locations + detailed retention schedules + clear third-party processor list
  - **2: Basic Transparency** - General data processing description + retention periods stated + some third-party relationships disclosed
  - **5: Opaque Processing** - Vague processing descriptions OR missing retention policies OR undisclosed third-party relationships OR conflicting documentation

#### Vendor Transparency (10 points max)
- **0: Comprehensive Documentation** - Published security whitepaper + detailed privacy policy + incident response procedures + regular transparency reports + responsive support (replies within 48 hours)
- **2: Good Documentation** - Clear privacy policy + basic security documentation + responsive support + annual transparency reports
- **4: Adequate Documentation** - Standard privacy policy + limited security information + support available but slower response times
- **6: Minimal Documentation** - Basic privacy policy only + limited security details + inconsistent support responses
- **8: Poor Documentation** - Vague or contradictory policies + no security documentation + unresponsive support (>5 business days)
- **10: No Transparency** - No privacy policy OR refused to provide documentation OR contradictory statements in different documents

## Risk Categories
- **CRITICAL RISK (80-100 points):** Immediate blocking required
- **HIGH RISK (60-79 points):** Significant controls needed before use
- **MEDIUM RISK (35-59 points):** Standard enterprise controls required
- **LOW RISK (0-34 points):** Basic monitoring sufficient

## Use Case Risk Multipliers
Apply after calculating base score (results capped at 100):
- **Legal/Compliance/Audit**: 1.3x
- **Finance/Accounting**: 1.2x 
- **HR/Executive Communications**: 1.15x
- **Customer Data/Support**: 1.1x
- **Internal IT/Development**: 0.95x
- **Marketing/Public Content**: 0.9x

Data Classification:
• Protected Health Information (PHI) - 1.4x multiplier
• Financial/Payment Data - 1.3x multiplier  
• Trade Secrets/IP - 1.25x multiplier
• Personally Identifiable Information - 1.2x multiplier
• Public/Marketing Data - 0.9x multiplier

## AI Tool Risk Assessments

### CRITICAL RISK (80-100 points) 🔴


**ChatGPT Free - Score: 82**
- Data Storage & Security: 20/25
  - Geographic: 6 (unclear server locations, global OpenAI infrastructure without data residency controls)
  - Encryption: 4 (basic TLS encryption in transit and at rest, but lacks enterprise-grade encryption with customer key control)
  - Retention: 10 (indefinite retention policy - conversations stored indefinitely unless manually deleted by user, with 30-day hard deletion after user deletion but may retain de-identified data for training purposes)
- Training Usage: 25/25
  - Training: 20 (all conversations used for model training by default with opt-out available but conversations may still be used in de-identified form)
  - Sharing: 5 (data shared with third-party AI model providers and potentially across OpenAI's various services)
- Access Controls: 20/20
  - Admin: 8 (no enterprise admin controls, individual user accounts only, no organizational oversight capabilities)
  - Audit: 7 (no audit trail visibility, no usage monitoring, no compliance reporting capabilities)
  - Integration: 5 (no enterprise SSO, no domain management, basic OAuth integration only)
- Compliance: 15/20
  - Violations: 15 (ChatGPT Free is explicitly not HIPAA compliant - OpenAI does not sign Business Associate Agreements (BAAs), lacks built-in PHI encryption and access restrictions per HIPAA guidelines, high GDPR risk due to indefinite data retention and training use, actively blocks PII processing in images but text-based PII can still be submitted and retained)
  - Transparency: 0 (reasonably clear privacy policies but implementation gaps in data handling practices)
- Vendor Transparency: 2/10 (reasonably clear privacy policies and terms of service, but significant gaps in implementation details about data processing locations, third-party AI provider relationships, and specific data handling procedures)


**123 Notetaker AI - Score: 87**
- Data Storage & Security: 17/25
  - Geographic: 3 (Microsoft documentation confirms data stored in "USA von Amerika" - US jurisdiction provides basic data protection framework)
  - Encryption: 4 (supports TLS 1.1 or higher per Microsoft certification, but lacks enterprise-grade encryption standards like AES-256 specification)
  - Retention: 10 (concerning retention policy - while Microsoft certification states "less than 30 days" after account termination, no clarity on active retention periods or user control over data deletion during active use)
- Training Usage: 25/25
  - Training: 20 (Microsoft certification shows no contractual guarantee against training use - app processes "User-ID, Email, Meeting-ID, Audio and Video" with unclear training restrictions, high risk for AI model improvement without explicit opt-out)
  - Sharing: 5 (Microsoft certification states "No" to third-party data transfer, but lacks transparency about internal data use and potential future sharing arrangements)
- Access Controls: 20/20
  - Admin: 8 (no enterprise admin controls - basic Microsoft Teams integration only, no organizational oversight or user management capabilities)
  - Audit: 7 (no audit trail capabilities - no usage monitoring, compliance reporting, or activity logging for enterprise governance)
  - Integration: 5 (limited to Microsoft Teams integration only - no SSO, domain management, or enterprise identity management)
- Compliance: 20/20
  - Violations: 15 (CRITICAL COMPLIANCE GAPS: Microsoft certification explicitly confirms 123 Notetaker AI is NOT compliant with HIPAA, SOC 2, ISO 27001, FERPA, COPPA, SOX, FedRAMP, or any major regulatory framework - creates severe compliance violations for healthcare, finance, education, and government sectors handling regulated data)
  - Transparency: 5 (privacy policy exists but Microsoft certification reveals significant gaps - no clear data processing documentation, unclear training use policies, insufficient breach notification procedures)
- Vendor Transparency: 5/10 (Microsoft app certification provides some transparency but reveals concerning gaps - BlueSky Apps lacks comprehensive security documentation, no detailed data handling policies, minimal vendor communication channels, and absence of enterprise-grade support infrastructure)




## Quick Assessment Guide

### Red Flags (Automatic High Risk)
- Data used for training with no opt-out
- Unclear or indefinite data retention
- No enterprise admin controls
- Automatic capture of sensitive meetings
- No encryption or unclear encryption practices
- Vendor refuses transparency documentation

### Decision Tree
1. **Is data used for AI training?** → If yes with no opt-out: HIGH RISK
2. **Are there enterprise controls?** → If no: Likely HIGH RISK
3. **Is encryption comprehensive?** → If unclear/no: Add risk points
4. **Can you audit usage?** → If no: Add risk points
5. **Is the vendor transparent?** → If no: Add risk points

## Implementation Recommendations

### Immediate Actions (Week 1)
- Block all CRITICAL RISK tools at network level
- Audit current usage of HIGH RISK tools
- Communicate risks to all staff

### Short-term (Weeks 2-4)
- Establish enterprise accounts for needed tools
- Create AI acceptable use policy
- Begin user training program

### Long-term (Ongoing)
- Quarterly risk reassessments
- Vendor relationship management
- Continuous monitoring and compliance

## Key Corrections Made


1. **Clarified scoring logic** - Higher scores consistently mean higher risk

⚠️ WARNING: This tool scored 65 (High Risk) but with PHI data becomes 91 (CRITICAL RISK)
❌ BLOCKED: PHI processing requires tools with <50 base score



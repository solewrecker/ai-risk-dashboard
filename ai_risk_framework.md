# AI Tool Risk Assessment Framework - Corrected

**Framework Author:** [Your Name]
**Version:** 1.0
**Date:** [Current Date]

*This document is the intellectual property of [Your Name]. It is shared with [Company Name] for discussion and evaluation purposes. All rights reserved.*

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

### Detailed Scoring Criteria

#### Data Storage & Security (25 points max)
- **Geographic Control** (0-8 points)
  - 0: On-premises or controlled data residency
  - 3: Known secure regions (US, EU) with contracts
  - 6: External servers, unclear location
  - 8: Servers in jurisdictions with poor data laws
- **Encryption Standards** (0-7 points)
  - 0: End-to-end encryption with customer key control
  - 2: Encryption at rest and in transit (vendor keys)
  - 4: Encryption in transit only
  - 7: No encryption or unclear encryption
- **Data Retention** (0-10 points)
  - 0: No retention or customer-controlled deletion
  - 3: Clear, limited retention policies
  - 6: Long retention periods (>1 year)
  - 10: Indefinite retention or unclear policies

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
  - 0: Full enterprise admin controls
  - 3: Basic user management
  - 6: Limited controls
  - 8: No admin oversight
- **Audit Capabilities** (0-7 points)
  - 0: Comprehensive audit logs and monitoring
  - 3: Basic usage tracking
  - 7: No audit capabilities
- **Integration** (0-5 points)
  - 0: Full SSO and enterprise integration
  - 2: Basic SSO support
  - 5: No enterprise integration

#### Compliance & Legal Risk (20 points max)
- **Regulatory Violations** (0-15 points)
  - 0: Compliant with major regulations (GDPR, HIPAA, SOX)
  - 5: Some compliance gaps, manageable risk
  - 10: Moderate violation risk
  - 15: High probability of regulatory violations
- **Data Processing Transparency** (0-5 points)
  - 0: Clear documentation of all data processing
  - 2: Some processing transparency
  - 5: Opaque or unclear data processing

#### Vendor Transparency (10 points max)
- 0: Excellent documentation, clear policies, responsive support
- 3: Good documentation with some gaps
- 6: Limited transparency, unclear practices
- 10: Poor or no transparency, unresponsive vendor

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







### HIGH RISK (60-79 points) 🟠

**Claude Free - Score: 68**
- Data Storage & Security: 15/25
  - Geographic: 3 (Anthropic US servers with clear data residency documentation)
  - Encryption: 4 (encrypted in transit via TLS and at rest, but vendor-controlled keys without customer key management)
  - Retention: 8 (conversations retained for 90 days for safety monitoring, then deleted unless flagged for trust & safety review - clearer than "unclear retention policies")
- Training Usage: 5/25
  - Training: 0 (strong contractual no-training policy - "We don't train Claude on your conversations")
  - Sharing: 5 (limited sharing only for trust & safety purposes, not for commercial use or broad data sharing)
- Access Controls: 20/20
  - Admin: 8 (no enterprise admin controls, individual accounts only)
  - Audit: 7 (no organizational usage tracking or audit capabilities)
  - Integration: 5 (basic OAuth integration, no enterprise SSO or domain management)
- Compliance: 10/20
  - Violations: 10 (external data processing creates regulatory risks for HIPAA/SOX compliance, but better GDPR alignment due to no training use and clearer retention policies)
  - Transparency: 0 (clear and comprehensive privacy policies with detailed explanations)
- Vendor Transparency: 0/10 (excellent policy documentation, detailed Constitutional AI explanations, clear data handling practices, responsive support documentation)

**Maestro Labs TeamsMaestro Notetaker - Score: 63**
- Data Storage & Security: 15/25
  - Geographic: 3 (data stored in United States and European Union databases per privacy policy - no specific data residency controls mentioned for enterprise users)
  - Encryption: 4 (privacy policy mentions data protection measures but lacks specific encryption standards like AES-256 specification - mentions "contractually bound" third parties but no detailed encryption implementation)
  - Retention: 8 (concerning retention policy - "retained only for as long as necessary" but no specific timeframes given, enterprise clients may customize retention "as agreed upon" but no default deletion periods specified, meeting data shared among all participants creates deletion complexity)
- Training Usage: 23/25
  - Training: 20 (CRITICAL RISK: privacy policy explicitly states "we share email content and user instructions with third-party AI models as part of Maestro Lab's functionality" with NO opt-out mechanism mentioned, data "may be anonymized depending on the language and processing requirements" but anonymization is not guaranteed, no contractual guarantees against AI training use)
  - Sharing: 3 (data shared with "trusted third-party service providers" for "AI processing, transcription services" - while providers are "contractually bound" there's no specification of what data sharing restrictions exist)
- Access Controls: 18/20
  - Admin: 8 (no enterprise admin controls mentioned beyond retention customization, individual user accounts with no organizational oversight capabilities described)
  - Audit: 7 (no audit trail capabilities mentioned in privacy policy - no usage monitoring, compliance reporting, or activity logging for enterprise governance)
  - Integration: 3 (primarily Teams integration with basic Microsoft ecosystem support)
- Compliance: 5/20
  - Violations: 0 (strong GDPR compliance with appointed DPO Sebastian Illing, detailed data subject rights implementation, appropriate safeguards for EU-US data transfers using standard contractual clauses, legitimate interest processing clearly documented)
  - Transparency: 5 (some gaps in implementation details - no specific encryption standards mentioned, unclear training use restrictions, vague third-party sharing scope)
- Vendor Transparency: 2/10 (comprehensive privacy policy updated January 2025 with detailed explanations, appointed DPO contact information, clear data processing purposes, but security documentation appears limited based on empty trust center page)



**Read.ai (Free/Basic) - Score: 61**
- Data Storage & Security: 6/25
  - Geographic: 2 (Specifically, data captured is stored encrypted at rest within the AWS us-east-1 datacenter in Northern Virginia)
  - Encryption: 2 (Read encrypts all data in transit with HTTPS with TLS 1.2, and encrypts all data at rest with AES-256)
  - Retention: 2 (automatically delete data after a certain number of days as specified by the organization. This is commonly used by organizations with compliance or tight security constraintss)
- Training Usage: 13/25
  - Training: 8 (Free versions often use data for training by default (with opt-out))
  - Sharing: 5 (No, Read does not sell user data, and will not share user data with third parties except as "necessary" to perform the functions of our business. Your data is kept private and only used to provide the service to you. You have full control of what gets shared with whom. )
- Access Controls: 20/20
  - Admin: 8 (No enterprise admin controls)
  - Audit: 7 (No audit capabilities for free users)
  - Integration: 5 (No SSO or domain management)
- Compliance: 17/20
  - Violations: 10 (No HIPAA compliance in free version)
  - Transparency: 7 (some privacy controls but gaps - vague language when it comes to "Sharing Data")
- Vendor Transparency: 5/10 (limited documentation on data practices)




### MEDIUM RISK (35-59 points) 🟡





**GitHub Copilot Personal - Score: 56**
- Data Storage & Security: 11/25
  - Geographic: 3 (Microsoft/GitHub infrastructure)
  - Encryption: 2 (The transmitted data is encrypted both in transit and at rest; Copilot-related data is encrypted in transit using transport layer security (TLS), and for any data we retain at rest using Microsoft Azure's data encryption (FIPS Publication 140-2 standards))
  - Retention: 6 (GitHub is updating retention policies with 90-day limits for user activity data starting February 2025)
- Training Usage: 15/25
  - Training: 10 (While by default, personal data is not used for AI model training, individual users of the free version of GitHub Copilot can opt-in to allow their code snippets to be used for product improvements, including potentially fine-tuning the models)
  - Sharing: 5 (code shared with Microsoft/OpenAI for model improvement)
- Access Controls: 15/20
  - Admin: 8 (no enterprise controls)
  - Audit: 5 (Basic tracking)
  - Integration: 2 (GitHub integration)
- Compliance: 15/20
  - Violations: 15 (Both GitHub Copilot Personal and Enterprise should receive additional penalty points for no HIPAA compliance)
  - Transparency: 0 (clear documentation)
- Vendor Transparency: 0/10 (excellent Microsoft documentation)

**Fireflies.ai Free - Score: 52**
- Data Storage & Security: 8/25
  - Geographic: 3 (Data processed in US servers with clear data privacy framework compliance)
  - Encryption: 2 (256-bit AES encryption for data at rest and TLS for data in transit)
  - Retention: 3 (Data saved for at least 12 months minimum, but users can delete individual meetings immediately with immediate purging from systems - however there may be circumstances where Fireflies.ai retains data even after deletion request due to legal obligations)
- Training Usage: 0/25
  - Training: 0 ("You own your data. We don't train on it by default unlike other AI companies" and "0-day retention policy ensures that your meeting data is never used for AI model training")
  - Sharing: 0 (Business Associate Agreement (BAA) signed with OpenAI and other third-party ASR vendors ensuring no data storage on their systems and no training use)
- Access Controls: 20/20
  - Admin: 8 (Free plan lacks enterprise admin controls, individual user accounts only)
  - Audit: 7 (No comprehensive audit trail capabilities for free users)
  - Integration: 5 (Basic meeting platform integration, no enterprise SSO or domain management)
- Compliance: 20/20
  - Violations: 15 (While SOC 2 Type II, GDPR compliant, HIPAA-BAA compliance is Enterprise only - free users lack HIPAA protection creating compliance gaps for healthcare organizations)
  - Transparency: 5 (Some policy gaps regarding data retention exceptions and international data transfers to "countries other than the country in which the Personal Information was collected")
- Vendor Transparency: 4/10 (Generally clear security documentation but some implementation gaps around data deletion exceptions and international transfers)



**ChatGPT Enterprise - Score: 50**
- Data Storage & Security: 10/25
  - Geographic: 3 (enterprise data residency in controlled regions with some geographic flexibility)
  - Encryption: 2 (AES-256 encryption at rest, TLS 1.2+ in transit, comprehensive encryption standards)
  - Retention: 5 (configurable policies but no guaranteed short-term deletion, 30-day post-removal deletion only applies to user-initiated deletions)
- Training Usage: 0/25
  - Training: 0 (zero data retention (ZDR) available with contractual guarantee data never used for model training)
  - Sharing: 0 (complete data isolation in enterprise tier, no third-party sharing)
- Access Controls: 4/20
  - Admin: 0 (comprehensive enterprise admin controls, workspace management, user provisioning, role-based access)
  - Audit: 0 (detailed usage logging, conversation history, activity monitoring dashboard)
  - Integration: 2 (enterprise SSO with SAML/OIDC support, limited API integration)
- Compliance: 12/20
  - Violations: 12 (SOC 2 Type 1 certified progressing to Type 2, but CRITICAL GAP: OpenAI does not offer HIPAA Business Associate Agreements for ChatGPT Enterprise, creating major compliance barriers for healthcare, legal, and financial services handling regulated data)
  - Transparency: 0 (comprehensive enterprise policies, dedicated trust portal, clear data processing documentation)
- Vendor Transparency: 0/10 (excellent enterprise documentation, responsive support, detailed trust and safety portal)


**Cursor IDE - Score: 48**
- Data Storage & Security: 15/25
  - Geographic: 3 (Cursor's infrastructure is primarily hosted on AWS with most servers in the US, and some in Tokyo and London - no data residency outside secure jurisdictions)
  - Encryption: 4 (Privacy mode users have data encrypted with client-generated keys for file caching, but code data is visible in server memory during request processing and transmitted unencrypted to multiple third-party AI providers for inference - not true end-to-end encryption)
  - Retention: 8 (Code data exists in memory for request duration plus "minutes to hours" for background jobs and temporary caching - while not permanently stored, this extended memory retention creates compliance risks for sensitive data)
- Training Usage: 8/25
  - Training: 5 (With Privacy Mode enabled, code is never stored or used for training by Cursor or any third-party AI providers - Privacy mode is available to all users and forcibly enabled for team members with automatic enforcement via parallel infrastructure to prevent accidental exposure)
  - Sharing: 3 (Zero data retention agreements with OpenAI, Anthropic, Google Vertex, xAI, and Fireworks - however code data is still transmitted to multiple AI providers even in privacy mode for inference processing)
- Access Controls: 12/20
  - Admin: 3 (Privacy mode is automatically enforced for team members with server-side validation every 5 minutes - team-level privacy overrides individual settings)
  - Audit: 7 (Still limited audit capabilities for individual users - basic usage tracking but no comprehensive enterprise audit logs)
  - Integration: 2 (Decent enterprise features available with VS Code extension compatibility)
- Compliance: 12/20
  - Violations: 12 (CRITICAL HIPAA/PII LIMITATION: While SOC 2 Type II certified with annual penetration testing, Cursor explicitly warns users in "highly sensitive environments" to "be careful when using Cursor (or any other AI tool)" - NO HIPAA BAA available, code containing PII/PHI transmitted to multiple third-party AI providers even in privacy mode for inference processing, extended memory retention during background jobs creates compliance gaps, making it unsuitable for healthcare organizations handling protected health information despite privacy mode guarantees for general development)
  - Transparency: 0 (Excellent transparency in their security documentation with detailed subprocessor list and data flow explanations)
- Vendor Transparency: 1/10 (Comprehensive security documentation at trust.cursor.com and cursor.com/security, but security posture depends on underlying AI providers - transparent about current limitations and ongoing security improvements)


**Maestro Labs TeamsMaestro Notetaker Enterprise - Score: 38**
- Data Storage & Security: 12/25
  - Geographic: 3 (Microsoft certification confirms data stored specifically in "United States of America" with clear geographic boundaries for enterprise data residency)
  - Encryption: 2 (Microsoft certification confirms TLS 1.1+ support, SOC 2 Type 2 compliance indicates enterprise-grade encryption standards, though specific AES-256 implementation not detailed in public documentation)
  - Retention: 7 (SIGNIFICANT CONCERN: Microsoft certification shows data retained "More than 90days" after account termination, but enterprise clients can request "0 days data retention" as confirmed in homepage - custom enterprise retention policies available but default retention exceeds standard enterprise expectations)
- Training Usage: 8/25
  - Training: 5 (ENTERPRISE IMPROVEMENT: While privacy policy mentions third-party AI sharing, enterprise tier offers enhanced controls and custom data processing agreements - Microsoft certification shows data sharing agreements in place with third parties, suggesting negotiated training restrictions for enterprise customers)
  - Sharing: 3 (Microsoft certification confirms data transfer to third parties with data sharing agreements in place, but enterprise customers get enhanced control over data sharing arrangements)
- Access Controls: 12/20
  - Admin: 6 (Enterprise tier offers "advanced security, customization and support" suggesting enhanced admin controls beyond basic Teams integration, though specific enterprise admin features not detailed in public documentation)
  - Audit: 3 (Microsoft certification shows comprehensive security monitoring including "event logging set up on all system components" and "logs reviewed on regular cadence" - enterprise customers likely get enhanced audit capabilities)
  - Integration: 3 (Native Microsoft Teams integration with Microsoft Graph API access for calendar functions, enterprise SSO capabilities through Microsoft identity platform integration)
- Compliance: 6/20
  - Violations: 1 (MAJOR IMPROVEMENT: SOC 2 Type 2 certified as of December 2024, GDPR compliant with appointed DPO, comprehensive security controls including penetration testing, disaster recovery, and vulnerability management - however Microsoft certification shows HIPAA as "N/A" indicating no HIPAA compliance even for enterprise)
  - Transparency: 5 (Microsoft certification reveals some implementation gaps - data retention "More than 90days" conflicts with enterprise "0 days" claim, third-party sharing details limited)
- Vendor Transparency: 0/10 (Microsoft app certification provides comprehensive transparency with detailed security questionnaire responses, SOC 2 Type 2 certification, established security processes including incident response, change management, and vulnerability management - significantly better transparency than initially assessed)






### LOW RISK (0-34 points) 🟢



**Read.ai Enterprise - Score: 28**
- Data Storage & Security: 6/25
  - Geographic: 2 (Specifically, data captured is stored encrypted at rest within the AWS us-east-1 datacenter in Northern Virginia)
  - Encryption: 2 (Read encrypts all data in transit with HTTPS with TLS 1.2, and encrypts all data at rest with AES-256)
  - Retention: 2 (automatically delete data after a certain number of days as specified by the organization. This is commonly used by organizations with compliance or tight security constraintss)
- Training Usage: 0/25
  - Training: 0 (Contributing to our model is completely optional, and opt-out by default)
  - Sharing: 0 (we don't sell your data to anyone - period )
- Access Controls: 14/20
  - Admin: 6 (some user controls available)
  - Audit: 5 (basic usage tracking)
  - Integration: 3 (basic meeting platform integration)
- Compliance: 5/20
  - Violations: 5 (Read is now able to offer a BAA to support HIPAA compliance. Due to the advanced security features required, this is only supported for users on our Enterprise+ plan, and it is required to setup both SAML authentication and domain capture for the workspace before proceeding with signing the BAA)
  - Transparency: 0 (some privacy controls but gaps)
- Vendor Transparency: 3/10 (limited documentation on data practices)

**GitHub Copilot Enterprise - Score: 27**
- Data Storage & Security: 8/25
  - Geographic: 3 (Microsoft enterprise)
  - Encryption: 2 (SOC 2 Type II compliance, which GitHub Copilot Enterprise does maintain)
  - Retention: 3 (configurable, not used for training)
- Training Usage: 0/25
  - Training: 0 (contractual guarantee - Enterprise data never used for training)
  - Sharing: 0 (no external sharing)
- Access Controls: 4/20
  - Admin: 0 (full enterprise controls)
  - Audit: 2 ( 180-day comprehensive logging)
  - Integration: 2 (enterprise GitHub)
- Compliance: 15/20
  - Violations: 15 (Both tiers lack HIPAA compliance and are unsuitable for healthcare organizations handling PHI, regardless of other security features.)
  - Transparency: 0 (clear policies)
- Vendor Transparency: 0/10 (excellent documentation)

**Grammarly Business - Score: 25**
- Data Storage & Security: 8/25
  - Geographic: 3 (business tier controls)
  - Encryption: 2 (encrypted processing)
  - Retention: 3 (configurable)
- Training Usage: 3/25
  - Training: 3 (limited training use)
  - Sharing: 0 (business isolation)
- Access Controls: 6/20
  - Admin: 0 (admin dashboard)
  - Audit: 3 (basic tracking)
  - Integration: 2 (business SSO)
- Compliance: 0/20
  - Violations: 0 (established compliance)
  - Transparency: 0 (clear scope)
- Vendor Transparency: 0/10 (excellent business docs)

**Microsoft Copilot (M365) Enterprise - Score: 23**
- Data Storage & Security: 5/25
  - Geographic: 0 (tenant-controlled data residency with Microsoft's global infrastructure, follows M365 data location commitments)
  - Encryption: 2 (AES-256 encryption at rest, TLS encryption in transit, integrated with Microsoft Purview encryption standards)
  - Retention: 3 (follows tenant's existing M365 retention policies, inherits organizational data governance settings)
- Training Usage: 0/25
  - Training: 0 (contractual guarantee - Microsoft does not use M365 Copilot customer data for LLM training, data stays within tenant boundary)
  - Sharing: 0 (complete tenant isolation, no external data sharing, respects M365 data residency requirements)
- Access Controls: 2/20
  - Admin: 0 (full M365 admin center integration, granular permissions, role-based access control through Azure AD)
  - Audit: 0 (comprehensive Microsoft Purview audit logging, eDiscovery integration, detailed usage analytics)
  - Integration: 2 (native M365 integration across all apps, inherits existing SSO and conditional access policies)
- Compliance: 8/20
  - Violations: 8 (CRITICAL LIMITATION: While M365 Copilot supports HIPAA compliance under Microsoft's BAA, web search functionality is explicitly excluded from HIPAA coverage and can inadvertently expose PHI to Bing services not covered by BAA - requires careful configuration and monitoring to prevent PHI leakage)
  - Transparency: 0 (comprehensive Microsoft compliance documentation, Service Trust Portal, clear data processing descriptions)
- Vendor Transparency: 0/10 (excellent Microsoft enterprise documentation, detailed compliance certifications, responsive enterprise support)

**Claude Enterprise/Teams - Score: 22**
- Data Storage & Security: 5/25
  - Geographic: 0 (Anthropic US-based infrastructure with clear data residency controls and AWS hosting in specified regions)
  - Encryption: 2 (AES-256 encryption at rest and TLS 1.2+ in transit with enterprise-grade security standards)
  - Retention: 3 (custom data retention controls available for Enterprise customers, configurable deletion policies, with default 90-day retention that can be customized down to immediate deletion)
- Training Usage: 0/25
  - Training: 0 (contractual guarantee that Enterprise customer data is never used for model training under any circumstances)
  - Sharing: 0 (complete data isolation for Enterprise customers, no third-party sharing or cross-customer data exposure)
- Access Controls: 8/20
  - Admin: 0 (comprehensive enterprise admin controls including user management, role-based access, organizational oversight, and usage monitoring)
  - Audit: 3 (detailed audit logs and usage analytics available, but limited compared to full enterprise security platforms)
  - Integration: 5 (SSO support available but limited compared to Microsoft/Google enterprise ecosystems)
- Compliance: 9/20
  - Violations: 9 (CRITICAL LIMITATION: Claude Enterprise/Teams plans are explicitly NOT covered by Anthropic's HIPAA BAA - only specific API customers with zero data retention agreements qualify for HIPAA compliance, making standard Enterprise plans unsuitable for healthcare PHI processing despite other strong security features)
  - Transparency: 0 (excellent documentation of enterprise data handling practices and security measures)
- Vendor Transparency: 0/10 (comprehensive enterprise documentation, clear security certifications, detailed privacy policies, and responsive enterprise support)


**Fathom AI (Business) - Score: 21**
- Data Storage & Security: 8/25
  - Geographic: 3 (Fathom AI stores all its data in AWS cloud data centers located within the United States and Canada)
  - Encryption: 0 (RDS encryption uses the industry standard AES-256 encryption algorithm to encrypt the data. S3 data is also encrypted using the industry standard AES-256 encryption method)
  - Retention: 5 (Fathom.ai keeps personal information for as long as it's needed for the purposes it was collected for, or as long as required by law or regulatory obligations)
- Training Usage: 4/25
  - Training: 2 (We don't train our AI on your data. No AI Training: We use pre-trained AI services (OpenAI, Anthropic, Google, etc), and we don't permit them to use your personal or company data for development purposes)
  - Sharing: 2  (No! Neither Fathom nor any of our AI sub-processors (OpenAI or Anthropic))
- Access Controls: 8/20
  - Admin: 3 (some enterprise management features)
  - Audit: 3 (basic audit capabilities)
  - Integration: 2 (extensive integration with business tools )
- Compliance: 1/20
  - Violations: 1 (Fathom is HIPAA, SOC2 Type II, and GDPR-compliant and has passed extensive security reviews by Zoom)
  - Transparency: 0 (clear security documentation)
- Vendor Transparency: 0/10 (comprehensive security documentation including SOC2 audit)

**Fireflies.ai Enterprise - Score: 18**
- Data Storage & Security: 8/25
  - Geographic: 3 (US-based infrastructure with Private Storage options available for Enterprise customers to store data at preferred location)
  - Encryption: 2 (256-bit AES encryption for data at rest and TLS for data in transit with enterprise security features)
  - Retention: 3 (Custom Data Retention policies available for Enterprise with user-controlled deletion)
- Training Usage: 0/25
  - Training: 0 (Contractual 0-day retention policy ensures Enterprise data never used for AI model training)
  - Sharing: 0 (Enterprise BAAs with all AI vendors ensure no external data sharing or storage)
- Access Controls: 8/20
  - Admin: 0 (Super Admin status provides full meeting access control and workspace management)
  - Audit: 5 (Enhanced monitoring capabilities but limited compared to full enterprise platforms)
  - Integration: 3 (Single Sign-On (SSO) support with secure team access)
- Compliance: 2/20
  - Violations: 0 (SOC 2 Type II, GDPR, and HIPAA-BAA compliant for Enterprise customers providing complete PHI protection)
  - Transparency: 2 (Some minor gaps in detailed implementation documentation)
- Vendor Transparency: 0/10 (Comprehensive security documentation, compliance certifications, and clear enterprise policies)

**Self-hosted Ollama - Score: 8**
- Data Storage & Security: 0/25
  - Geographic: 0 (local control)
  - Encryption: 0 (local implementation)
  - Retention: 0 (local policies)
- Training Usage: 0/25
  - Training: 0 (no external training)
  - Sharing: 0 (local only)
- Access Controls: 5/20
  - Admin: 3 (depends on local setup)
  - Audit: 2 (local logging)
  - Integration: 0 (local control)
- Compliance: 0/20
  - Violations: 0 (no external data flow)
  - Transparency: 0 (local deployment)
- Vendor Transparency: 3/10 (open source, community docs)

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



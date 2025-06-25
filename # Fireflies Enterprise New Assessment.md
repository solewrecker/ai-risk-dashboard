# Fireflies.ai Risk Assessment

**Tool:** Fireflies.ai
**Assessment Date:** June 24, 2025
**Framework Version:** 1.0
**Base Risk Score:** 23 points (LOW RISK)

---

## Detailed Scoring Breakdown

### Data Storage & Security: 8/25 points

**Geographic Control: 3/8 points**
- Data stored in US data centers with clear jurisdiction control
- Documented data residency in US with GDPR compliance for EU users
- Known secure region with proper contractual protections

**Encryption Standards: 2/7 points**
- Enterprise-grade encryption with AES-256 at rest and in transit
- Vendor-managed keys with published security specifications
- SOC 2 Type II compliance ensures proper encryption implementation

**Data Retention: 3/10 points**
- Clear limited retention policy: minimum 12 months default retention
- User controls available for data deletion
- Automatic deletion procedures when users delete meetings
- Custom data retention policies available for enterprise customers

### Training Data Usage: 0/25 points

**Model Training: 0/20 points**
- Contractual guarantee of no training use ("0-day retention policy ensures that your meeting data is never used for AI model training")
- Explicit policy against using customer data for AI model improvement
- User content ownership clearly stated in Terms of Service Section 4

**Data Sharing: 0/5 points**
- No third-party sharing for training purposes
- Clear data processing agreements with any third parties
- Strict zero-day retention policy with AI vendors

### Access Controls: 5/20 points

**Admin Management: 2/8 points**
- Advanced user management with Super Admin controls
- Centralized admin dashboard available
- Role-based permissions and user provisioning capabilities
- Domain management and organizational oversight features

**Audit Capabilities: 0/7 points**
- Comprehensive auditing with activity logs
- Real-time monitoring and compliance reporting
- User action tracking and data access logs
- Exportable audit reports for compliance

**Integration: 3/5 points**
- SSO support available (OneLogin and other providers documented)
- Limited enterprise identity management features
- Basic API access for enterprise management

### Compliance & Legal Risk: 0/20 points

**Regulatory Violations: 0/15 points**
- SOC 2 Type II certified and publicly documented
- HIPAA compliant with BAA agreements available
- GDPR compliant with documented Article 28 compliance
- Multiple compliance certifications published and verified

**Data Processing Transparency: 0/5 points**
- Full transparency with published security documentation
- Clear data processing locations and procedures
- Detailed retention schedules and third-party relationships
- Comprehensive privacy policies and security whitepapers

### Vendor Transparency: 2/10 points

**Documentation Quality: 2/10 points**
- Comprehensive security documentation available
- Published privacy policies and security whitepapers
- SOC 2 reports available under NDA
- Clear incident response procedures
- Active trust center with detailed security information

---

## Risk Category: LOW RISK (23 points)

**Risk Level:** ✅ **LOW RISK** - Basic monitoring sufficient

**Key Strengths:**
- Zero training data usage with contractual guarantees
- Strong compliance posture (SOC 2, HIPAA, GDPR)
- Comprehensive security documentation and transparency
- User-controlled data retention and deletion
- Enterprise-grade encryption and security controls

**Areas for Monitoring:**
- Default 12-month retention period (though user-controllable)
- Geographic data storage limited to US (though compliant)
- Integration capabilities could be more comprehensive

---

## Use Case Risk Multipliers

**Standard Enterprise Use:** 23 × 1.0 = **23 points (LOW RISK)**

**Specialized Use Cases:**
- Legal/Compliance/Audit: 23 × 1.3 = **30 points (LOW RISK)**
- Finance/Accounting: 23 × 1.2 = **28 points (LOW RISK)**
- HR/Executive Communications: 23 × 1.15 = **26 points (LOW RISK)**
- Customer Data/Support: 23 × 1.1 = **25 points (LOW RISK)**
- Internal IT/Development: 23 × 0.95 = **22 points (LOW RISK)**
- Marketing/Public Content: 23 × 0.9 = **21 points (LOW RISK)**

**Data Classification Multipliers:**
- Protected Health Information (PHI): 23 × 1.4 = **32 points (LOW RISK)** ✅
- Financial/Payment Data: 23 × 1.3 = **30 points (LOW RISK)** ✅
- Trade Secrets/IP: 23 × 1.25 = **29 points (LOW RISK)** ✅
- Personally Identifiable Information: 23 × 1.2 = **28 points (LOW RISK)** ✅
- Public/Marketing Data: 23 × 0.9 = **21 points (LOW RISK)** ✅

---

## Decision Framework Results

### Red Flags Assessment: ✅ CLEAR
- ✅ No training data usage (contractual guarantee)
- ✅ Clear and user-controlled data retention
- ✅ Enterprise admin controls available
- ✅ Clear security and encryption practices
- ✅ High vendor transparency

### Decision Tree Results:
1. **Is data used for AI training?** ✅ No - contractual guarantee
2. **Are there enterprise controls?** ✅ Yes - Super Admin, SSO, audit capabilities
3. **Is encryption comprehensive?** ✅ Yes - AES-256, SOC 2 certified
4. **Can you audit usage?** ✅ Yes - comprehensive audit logs
5. **Is the vendor transparent?** ✅ Yes - extensive documentation and trust center

---

## Implementation Recommendations

### ✅ APPROVED FOR DEPLOYMENT
Fireflies.ai meets enterprise security requirements and can be deployed with standard enterprise controls.

### Recommended Controls:
1. **Enterprise Account Setup:** Implement Super Admin controls and SSO integration
2. **Data Governance:** Configure custom retention policies as needed
3. **User Training:** Educate users on proper meeting consent and data handling
4. **Regular Auditing:** Monitor usage through audit logs and compliance reports
5. **BAA Execution:** For healthcare use cases, execute Business Associate Agreement

### Ongoing Monitoring:
- Quarterly compliance certification reviews
- Annual vendor security assessments
- Regular privacy policy and terms updates monitoring
- User access and permission audits

---

## Summary

**Fireflies.ai scores 23/100 points, placing it in the LOW RISK category.** This tool demonstrates strong security practices, comprehensive compliance certifications, and excellent transparency. The zero training data usage policy and robust enterprise controls make it suitable for most business use cases, including those involving sensitive data when proper enterprise controls are implemented.

**Key Differentiators:**
- Contractual guarantee against training data usage
- Multiple compliance certifications (SOC 2, HIPAA, GDPR)
- User-controlled data retention and deletion
- Comprehensive audit and enterprise management capabilities
- High vendor transparency with detailed security documentation
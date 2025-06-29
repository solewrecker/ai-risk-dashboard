export function generateRecommendationsHTML(data: any) {
  // --- Primary: Use pre-defined recommendations from the database if they exist ---
  if (data.dbData?.recommendations && Array.isArray(data.dbData.recommendations) && data.dbData.recommendations.length > 0) {
    console.log('✅ Using recommendations from database field.');
    return data.dbData.recommendations.map(rec => `
      <div class="recommendation-card priority-${(rec.priority || 'low').toLowerCase()}">
          <div class="recommendation-header">
              <div class="recommendation-title">${rec.icon || '🎯'} ${rec.title}</div>
              <div class="priority-badge priority-${(rec.priority || 'low').toLowerCase()}">${rec.priority || 'LOW'}</div>
          </div>
          <div class="recommendation-text">
              ${rec.details}
              <br><br><strong>Timeline:</strong> ${rec.timeline || 'N/A'} | <strong>Owner:</strong> ${rec.owner || 'N/A'}
          </div>
      </div>
    `).join('');
  }

  // --- Fallback: Dynamically generate recommendations if database field is empty ---
  console.log('⚠️ Recommendations field not found in DB, using dynamic generation.');
  const recommendations: any[] = [];
  data.recommendations = []; // Initialize to prevent errors

  const recommendationBank = [
    // --- HIGH PRIORITY ---
    {
      priority: 'HIGH',
      icon: '🚨',
      title: 'Immediate Security Review Required',
      details: 'Due to the HIGH overall risk score, a comprehensive security review by the IT Security team is required before this tool is approved for widespread use. Focus on mitigating the identified high-risk areas.',
      owner: 'IT Security',
      timeline: '14 Days',
      condition: (d: any) => d.riskLevel === 'HIGH',
    },
    {
      priority: 'HIGH',
      icon: '📜',
      title: 'Execute Business Associate Agreement (BAA)',
      details: 'Since this tool may be used with PHI data, executing a BAA with the vendor is mandatory to ensure HIPAA compliance and protect sensitive patient information.',
      owner: 'Legal & Compliance',
      timeline: '30 Days',
      condition: (d: any) => d.dataClassification === 'phi' && (d.compliance_risk_level === 'HIGH' || d.dbData?.breakdown?.compliance?.hipaa === 'non-compliant'),
    },
    {
      priority: 'HIGH',
      icon: '🔐',
      title: 'Strengthen Access Controls',
      details: 'The current access controls are insufficient. Implement mandatory Single Sign-On (SSO) and Multi-Factor Authentication (MFA) for all users to prevent unauthorized access.',
      owner: 'IT Security',
      timeline: '30 Days',
      condition: (d: any) => d.access_controls_risk_level === 'HIGH',
    },
    {
        priority: 'HIGH',
        icon: '🛡️',
        title: 'Review Data Encryption Standards',
        details: `For handling sensitive data ('${data.dataClassification}'), verify that the vendor provides end-to-end encryption (at-rest and in-transit) and clarify data residency and server locations.`,
        owner: 'Data Protection Team',
        timeline: '21 Days',
        condition: (d: any) => d.data_storage_risk_level === 'HIGH' && ['financial', 'phi', 'pii', 'trade-secrets'].includes(d.dataClassification),
    },
    {
        priority: 'HIGH',
        icon: '🧠',
        title: 'Clarify Data Usage for Model Training',
        details: "The tool's policy on using customer data for model training is unclear or high-risk. Obtain explicit clarification from the vendor and implement user-level opt-out controls.",
        owner: 'Legal & IT',
        timeline: '45 Days',
        condition: (d: any) => d.training_usage_risk_level === 'HIGH',
    },

    // --- MEDIUM PRIORITY ---
    {
      priority: 'MEDIUM',
      icon: '🔒',
      title: 'Implement Data Classification Controls',
      details: `Ensure that appropriate data handling policies are enforced for the '${data.dataClassification}' data classification. This includes user training and potential data loss prevention (DLP) measures.`,
      owner: 'Data Protection Team',
      timeline: '45 Days',
      condition: (d: any) => !d.recommendations.some(r => r.title.includes('Encryption')) && ['financial', 'phi', 'pii', 'trade-secrets'].includes(d.dataClassification),
    },
    {
      priority: 'MEDIUM',
      icon: '📄',
      title: 'Request Vendor Security Documentation',
      details: "The vendor's transparency is limited. Request their latest security audit reports (e.g., SOC 2 Type II, ISO 27001) to validate their security posture.",
      owner: 'Risk Management',
      timeline: '60 Days',
      condition: (d: any) => d.vendor_transparency_risk_level === 'HIGH' || d.vendor_transparency_risk_level === 'MEDIUM',
    },
    {
      priority: 'MEDIUM',
      icon: '📊',
      title: 'Deploy Usage Monitoring',
      details: 'Implement comprehensive usage analytics and monitoring for AI tool utilization patterns. This helps in detecting security anomalies and ensuring responsible use.',
      owner: 'IT Operations',
      timeline: '60 Days',
      condition: (d: any) => true,
    },

    // --- LOW PRIORITY ---
    {
      priority: 'LOW',
      icon: '📅',
      title: 'Establish Regular Assessment Schedule',
      details: 'Establish a quarterly risk assessment review cycle for this tool to ensure ongoing compliance, monitor for changes in its security posture, and review vendor updates.',
      owner: 'Risk Management',
      timeline: '90 Days',
      condition: (d: any) => true,
    },
  ];

  for (const rec of recommendationBank) {
    if (rec.condition(data) && !recommendations.some(r => r.title === rec.title)) {
      recommendations.push(rec);
    }
    data.recommendations = recommendations; // Update for next iteration's conditions
  }

  // If no specific recommendations were triggered beyond the two default ones, show a generic success message.
  if (recommendations.length <= 2) {
      return `
        <div class="recommendation-card priority-low">
            <div class="recommendation-header">
                <div class="recommendation-title">✅ Standard Practices Apply</div>
                <div class="priority-badge priority-low">LOW</div>
            </div>
            <div class="recommendation-text">
                The tool meets all current security and compliance baselines. Standard monitoring and periodic reviews are recommended.
                <br><br><strong>Timeline:</strong> Ongoing | <strong>Owner:</strong> IT Operations
            </div>
        </div>
      `;
  }
  
  recommendations.sort((a, b) => {
      const priorities = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorities[b.priority] - priorities[a.priority];
  });


  return recommendations.slice(0, 4).map(rec => `
    <div class="recommendation-card priority-${rec.priority.toLowerCase()}">
        <div class="recommendation-header">
            <div class="recommendation-title">${rec.icon} ${rec.title}</div>
            <div class="priority-badge priority-${rec.priority.toLowerCase()}">${rec.priority}</div>
        </div>
        <div class="recommendation-text">
            ${rec.details}
            <br><br><strong>Timeline:</strong> ${rec.timeline} | <strong>Owner:</strong> ${rec.owner}
        </div>
    </div>
  `).join('');
} 
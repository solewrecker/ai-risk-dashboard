function generateDynamicRecommendations(data: any) {
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
    // ... (rest of the recommendation bank)
  ];

  for (const rec of recommendationBank) {
    if (rec.condition(data) && !recommendations.some(r => r.title === rec.title)) {
      recommendations.push(rec);
    }
    data.recommendations = recommendations;
  }
  
  recommendations.sort((a, b) => {
      const priorities = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorities[b.priority] - priorities[a.priority];
  });

  return recommendations;
}

export function generateRecommendationsSectionHTML(data: any) {
  let recommendations = data.dbData?.recommendations;

  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    console.log('⚠️ Recommendations field not found in DB, using dynamic generation.');
    recommendations = generateDynamicRecommendations(data);
  } else {
    console.log('✅ Using recommendations from database field.');
  }
  
  let recommendationsHTML;

  if (recommendations.length <= 2 && !data.dbData?.recommendations) {
      recommendationsHTML = `
        <div class="recommendation-card priority-low">
            <div class="recommendation-header">
                <div class="recommendation-title">✅ Standard Practices Apply</div>
            </div>
            <div class="recommendation-text">
                The tool meets all current security and compliance baselines. Standard monitoring and periodic reviews are recommended.
            </div>
        </div>
      `;
  } else {
    recommendationsHTML = recommendations.slice(0, 4).map(rec => `
      <div class="recommendation-card priority-${(rec.priority || 'low').toLowerCase()}">
          <div class="recommendation-header">
              <div class="recommendation-title">${rec.icon || '🎯'} ${rec.title}</div>
              <div class="priority-badge priority-${(rec.priority || 'low').toLowerCase()}">${rec.priority || 'LOW'}</div>
          </div>
          <div class="recommendation-text">
              ${rec.details}
          </div>
      </div>
    `).join('');
  }

  return `
    <section class="recommendations">
        <div class="section-header">
            <h2 class="section-title">Recommendations & Mitigations</h2>
        </div>
        <div class="recommendations-grid">
            ${recommendationsHTML}
        </div>
    </section>
  `;
} 
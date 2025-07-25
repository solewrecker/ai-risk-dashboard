/**
 * premium-template.js
 * 
 * Premium report template with enhanced styling and detailed sections.
 */

const premiumTemplate = `
<div class="report-container premium-template">
  <!-- Report Header -->
  <header class="report-header">
    <div class="report-header__content">
      <h1 class="report-header__title">{{name}}</h1>
      <p class="report-header__subtitle">AI Tool Security Assessment Report</p>
      
      <div class="report-header__tool-info">
        <h2 class="report-header__tool-name">{{vendor}}</h2>
      </div>
    </div>
  </header>

  <!-- Report Main Content -->
  <main class="report-main">
    <div class="report-main__content">
      <!-- Executive Summary -->
      <section class="executive-summary">
        <div class="risk-badge">{{risk_level}} RISK</div>
        <h2>Executive Summary</h2>
        <p style="margin: 15px 0; font-size: 1.1rem;">
          <strong>{{assessment_data.summary_and_recommendation}}</strong>
        </p>

        <div class="tool-info">
          <div class="info-card">
            <h3>Vendor</h3>
            <p>{{vendor}}</p>
          </div>
          <div class="info-card">
            <h3>License Type</h3>
            <p>{{assessment_data.license_type}}</p>
          </div>
          <div class="info-card">
            <h3>Category</h3>
            <p>{{category}}</p>
          </div>
          <div class="info-card">
            <h3>Data Classification</h3>
            <p>{{data_classification}}</p>
          </div>
          <div class="info-card">
            <h3>Assessment Confidence</h3>
            <p>{{assessment_data.confidence}}%</p>
          </div>
          <div class="info-card">
            <h3>Documentation Tier</h3>
            <p>{{documentation_tier}}</p>
          </div>
        </div>
      </section>

      <!-- Detailed Data Section -->
      <section class="all-data-section">
        <h2>Comprehensive Assessment Data</h2>
        <h3>Assessment Overview</h3>
        <ul>
          <li><strong>Name:</strong> {{name}}</li>
          <li><strong>Vendor:</strong> {{vendor}}</li>
          <li><strong>Risk Level:</strong> {{risk_level}}</li>
          <li><strong>Total Score:</strong> {{total_score}}</li>
          <li><strong>Category:</strong> {{category}}</li>
          <li><strong>Data Classification:</strong> {{data_classification}}</li>
          <li><strong>Primary Use Case:</strong> {{primary_use_case}}</li>
          <li><strong>Assessed By:</strong> {{assessed_by}}</li>
        </ul>
        
        <h3>Assessment Details</h3>
        <ul>
          <li><strong>License Type:</strong> {{assessment_data.license_type}}</li>
          <li><strong>Summary and Recommendation:</strong> {{assessment_data.summary_and_recommendation}}</li>
          <li><strong>Compliance Summary:</strong> {{assessment_data.compliance_summary}}</li>
          <li><strong>Final Risk Category:</strong> {{assessment_data.final_risk_category}}</li>
          <li><strong>Confidence:</strong> {{assessment_data.confidence}}</li>
          <li><strong>Recommendations:</strong>
            <ul>
            {{#each assessment_data.recommendations}}
              <li>{{this}}</li>
            {{/each}}
            </ul>
          </li>
        </ul>
      </section>
    </div>
  </main>
  
  <!-- Report Footer -->
  <footer class="report-footer">
    <p>&copy; {{currentYear}} AI Security Council. All rights reserved. | <a href="/">Back to Dashboard</a></p>
  </footer>
</div>
`;

export default premiumTemplate;
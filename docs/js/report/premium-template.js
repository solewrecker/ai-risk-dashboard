// Premium template for comprehensive AI tool risk assessment reports
// This template displays all available data for maximum detail

const premiumTemplate = `
<div id="report-main" class="report-main">
<div class="report-container premium-report">
  <!-- Report Header -->
  <div class="report-header">
    <div class="header-content">
      <div class="tool-branding">
        <h1 class="report-title">{{name}}</h1>
        <p class="report-subtitle">Comprehensive AI Tool Risk Assessment</p>
      </div>
      <div class="assessment-meta">
        <div class="assessment-date">{{formatDate timestamp}}</div>
        <div class="report-type">Premium Report</div>
      </div>
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="report-section executive-summary">
    <h2 class="section-title">Executive Summary</h2>
    
    <div class="risk-overview">
      <div class="risk-level-display {{toLowerCase risk_level}}">
        <div class="risk-indicator">
          <span class="risk-level">{{risk_level}}</span>
          <span class="risk-score">{{total_score}}/100</span>
        </div>
      </div>
      
      <div class="summary-content">
        <p class="executive-summary-text">{{summary}}</p>
        {{#if recommendation}}
        <p class="executive-recommendation"><strong>Primary Recommendation:</strong> {{recommendation}}</p>
        {{/if}}
      </div>
    </div>

    <!-- Tool Information Cards -->
    <div class="tool-info-grid">
      <div class="info-card">
        <h4>Vendor</h4>
        <p>{{vendor}}</p>
      </div>
      <div class="info-card">
        <h4>License Type</h4>
        <p>{{license_type}}</p>
      </div>
      <div class="info-card">
        <h4>Category</h4>
        <p>{{category}}</p>
      </div>
      <div class="info-card">
        <h4>Data Classification</h4>
        <p>{{data_classification}}</p>
      </div>
    </div>

    <!-- Assessment Confidence & Documentation -->
    <div class="assessment-metadata">
      <div class="confidence-indicator">
        <h4>Assessment Confidence</h4>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: {{assessment_confidence}}%"></div>
        </div>
        <span class="confidence-value">{{assessment_confidence}}%</span>
      </div>
      
      <div class="documentation-tier">
        <h4>Documentation Tier</h4>
        <span class="tier-badge tier-{{toLowerCase documentation_tier}}">{{documentation_tier}}</span>
      </div>
    </div>
  </div>

  <!-- Detailed Assessment Data -->
  <div class="report-section detailed-data">
    <h2 class="section-title">Comprehensive Assessment Data</h2>
    
    <!-- Assessment Overview -->
    <div class="assessment-overview">
      <h3>Assessment Overview</h3>
      <div class="overview-grid">
        <div class="overview-item">
          <label>Tool Name:</label>
          <span>{{name}}</span>
        </div>
        <div class="overview-item">
          <label>Vendor:</label>
          <span>{{vendor}}</span>
        </div>
        <div class="overview-item">
          <label>Version:</label>
          <span>{{version}}</span>
        </div>
        <div class="overview-item">
          <label>License Type:</label>
          <span>{{license_type}}</span>
        </div>
        <div class="overview-item">
          <label>Category:</label>
          <span>{{category}}</span>
        </div>
        <div class="overview-item">
          <label>Data Classification:</label>
          <span>{{data_classification}}</span>
        </div>
        <div class="overview-item">
          <label>Risk Level:</label>
          <span class="risk-badge {{toLowerCase risk_level}}">{{risk_level}}</span>
        </div>
        <div class="overview-item">
          <label>Total Score:</label>
          <span class="score-value">{{total_score}}/100</span>
        </div>
      </div>
    </div>

    <!-- Assessment Details -->
    <div class="assessment-details">
      <h3>Assessment Details</h3>
      
      <!-- Categories Assessment -->
      {{#if categories}}
      <div class="categories-section">
        <h4>Risk Categories Assessment</h4>
        {{#each categories}}
        <div class="category-group">
          <div class="category-header">
            <h5>{{name}}</h5>
            <div class="category-score">
              <span class="score">{{score}}/{{max_score}}</span>
              <span class="risk-badge {{toLowerCase risk_level}}">{{risk_level}}</span>
            </div>
          </div>
          
          {{#if criteria}}
          <div class="criteria-list">
            {{#each criteria}}
            <div class="criteria-item">
              <div class="criteria-header">
                <span class="criteria-name">{{name}}</span>
                <span class="criteria-score">{{score}}/{{max_score}}</span>
                <span class="risk-badge {{toLowerCase risk_level}}">{{risk_level}}</span>
              </div>
              <p class="criteria-description">{{description}}</p>
            </div>
            {{/each}}
          </div>
          {{/if}}
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      <!-- Key Findings -->
      {{#if key_findings}}
      <div class="key-findings-section">
        <h4>Key Findings</h4>
        <ul class="findings-list">
          {{#each key_findings}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}
      
      <!-- Detailed Analysis -->
      {{#if detailed_analysis}}
      <div class="detailed-analysis-section">
        <h4>Detailed Analysis</h4>
        {{#each detailed_analysis}}
        <div class="analysis-item">
          <h5>{{title}}</h5>
          <p>{{description}}</p>
          
          {{#if data}}
          {{#if (eq data.type 'table')}}
          <div class="analysis-table">
            <table>
              <thead>
                <tr>
                  {{#each data.headers}}
                  <th>{{this}}</th>
                  {{/each}}
                </tr>
              </thead>
              <tbody>
                {{#each data.rows}}
                <tr>
                  {{#each this}}
                  <td>{{this}}</td>
                  {{/each}}
                </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
          {{else if (eq data.type 'list')}}
          <ul class="analysis-list">
            {{#each data.items}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          {{/if}}
          {{/if}}
        </div>
        {{/each}}
      </div>
      {{/if}}

      <!-- Compliance Summary -->
      {{#if compliance_summary}}
      <div class="compliance-section">
        <h4>Compliance Summary</h4>
        <p>{{compliance_summary}}</p>
      </div>
      {{/if}}

      <!-- Final Risk Category -->
      {{#if final_risk_category}}
      <div class="final-risk-section">
        <h4>Final Risk Category</h4>
        <span class="risk-category-badge {{toLowerCase final_risk_category}}">{{final_risk_category}}</span>
      </div>
      {{/if}}

      <!-- Recommendations -->
      {{#if recommendations}}
      <div class="recommendations-section">
        <h4>Detailed Recommendations</h4>
        {{#if (eq (typeof recommendations) 'string')}}
          <p>{{recommendations}}</p>
        {{else}}
          <ul class="recommendations-list">
            {{#each recommendations}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
        {{/if}}
      </div>
      {{/if}}
    </div>
  </div>

  <!-- Report Actions -->
  <div class="report-actions">
    <button id="download-pdf" class="btn btn-primary">
      <i data-lucide="download" class="w-4 h-4 mr-2"></i>
      Download PDF
    </button>
    <button id="download-html" class="btn btn-secondary">
      <i data-lucide="file-text" class="w-4 h-4 mr-2"></i>
      Download HTML
    </button>
  </div>
</div>
</div>
`;

export default premiumTemplate;
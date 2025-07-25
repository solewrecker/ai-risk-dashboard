/**
 * standard-template.js
 * 
 * Standard report template with executive summary, risk assessment, and recommendations.
 */

const standardTemplate = `
<div class="report-container">
  <!-- Report Header -->
  <header class="report-header">
    <div class="report-header__content">
      <h1 class="report-header__title">{{name}}</h1>
      <p class="report-header__subtitle">AI Risk Assessment Report</p>
      
      <div class="report-header__tool-info">
        <h2 class="report-header__tool-name">{{vendor}}</h2>
        <p class="report-header__tool-subtitle">{{description}}</p>
      </div>
      
      <div class="report-header__meta">
        <div class="report-header__meta-item">
          <strong>Assessment Date:</strong> {{assessment_date}}
        </div>
        <div class="report-header__meta-item">
          <strong>Report Generated:</strong> {{currentDate}}
        </div>
        <div class="report-header__meta-item">
          <strong>Prepared By:</strong> {{assessor_name}}
        </div>
      </div>
    </div>
  </header>

  <!-- Report Main Content -->
  <main class="report-main">
    <div class="report-main__content">
      <!-- Executive Summary Section -->
      <section class="report-section report-section__summary">
        <div class="summary-section__score-container">
          <div class="summary-section__score-display summary-section__score-display--{{risk_level_lowercase}}">
            <span class="summary-section__score-number">{{total_score}}</span>
            <span class="summary-section__score-total">/100</span>
            <span class="summary-section__risk-badge">{{risk_level}}</span>
          </div>
          
          <div class="summary-section__description">
            <h2 class="summary-section__description-title">Executive Summary</h2>
            <p>{{executive_summary}}</p>
            
            <div class="summary-section__key-findings">
              <h3>Key Findings</h3>
              <ul>
                {{#each key_findings}}
                  <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Risk Assessment Section -->
      <section class="report-section report-section__risk-assessment">
        <h2 class="report-section__title">Risk Assessment</h2>
        
        <div class="risk-assessment__categories">
          {{#each risk_categories}}
            <div class="risk-category">
              <h3 class="risk-category__title">{{name}}</h3>
              <div class="risk-category__score">
                <div class="risk-score-bar">
                  <div class="risk-score-bar__fill" style="width: {{score}}%;"></div>
                </div>
                <span class="risk-score-value">{{score}}/100</span>
              </div>
              <p class="risk-category__description">{{description}}</p>
            </div>
          {{/each}}
        </div>
      </section>
      
      <!-- Recommendations Section -->
      <section class="report-section report-section__recommendations">
        <h2 class="report-section__title">Recommendations</h2>
        
        <div class="recommendations__list">
          {{#each recommendations}}
            <div class="recommendation-item">
              <h3 class="recommendation-item__title">{{title}}</h3>
              <p class="recommendation-item__description">{{description}}</p>
              <div class="recommendation-item__priority bg-risk-level--{{priority_lowercase}}">
                {{priority}}
              </div>
            </div>
          {{/each}}
        </div>
      </section>
      
      <!-- Detailed Analysis Section (if included) -->
      {{#if include_detailed_analysis}}
      <section class="report-section report-section__details">
        <h2 class="report-section__title">Detailed Analysis</h2>
        
        <div class="details__content">
          {{#each detailed_analysis}}
            <div class="detail-section">
              <h3 class="detail-section__title">{{title}}</h3>
              <p class="detail-section__content">{{content}}</p>
              
              {{#if data}}
                <div class="detail-section__data">
                  <pre>{{JSONstringify data}}</pre>
                </div>
              {{/if}}
            </div>
          {{/each}}
        </div>
      </section>
      {{/if}}
    </div>
  </main>
  
  <!-- Report Footer -->
  <footer class="report-footer">
    <p>&copy; {{currentYear}} AI Risk Assessment Framework. All rights reserved.</p>
    <p class="report-footer__disclaimer">This report is generated based on the information provided during the assessment process. The recommendations are intended as guidance and should be reviewed by appropriate stakeholders.</p>
  </footer>
</div>
`;

export default standardTemplate;
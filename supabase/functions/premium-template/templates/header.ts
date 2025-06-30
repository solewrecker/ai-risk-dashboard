export const generateHeaderHTML = (toolName: string) => `
  <header class="header">
      <div class="header-accent"></div>
      <div class="header-grid">
          <div class="header-main">
              <h1 class="report-title">AI Security Risk Assessment</h1>
              <p class="report-subtitle">Enterprise-grade security analysis and compliance evaluation for AI tools and platforms</p>
          </div>
          <div class="header-side">
              <div class="tool-highlight">
                  <div class="tool-name">${toolName}</div>
                  <div class="tool-subtitle">Assessment Target</div>
              </div>
          </div>
      </div>
      <div class="report-meta">
          <span>
              <strong>Assessment ID:</strong>
              ASS-${Date.now().toString().slice(-6)}
          </span>
          <span>
              <strong>Generated:</strong>
              ${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              })}
          </span>
          <span>
              <strong>Framework Version:</strong>
              2.1
          </span>
      </div>
  </header>
`; 
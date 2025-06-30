export interface ToolInfoData {
  toolName: string;
  category: string;
  primaryUseCase: string;
  dataClassification: string;
  vendor: string;
  licenseType: string;
  assessmentDate?: string;
}

// Generates the initials for the coloured square icon (e.g. GPT, CLD, CP, etc.)
function getToolIconText(name: string): string {
  if (!name) return 'AI';
  const matches = name.match(/[A-Z0-9]+/gi) || [];
  const initials = matches
    .map((s) => s.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3);
  return initials || 'AI';
}

export const generateToolInfoHTML = (data: ToolInfoData): string => {
  const date = data.assessmentDate || new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
  <div class="section">
      <div class="chatgpt-header">
          <div class="chatgpt-icon">${getToolIconText(data.toolName)}</div>
          <div class="chatgpt-info">
              <h3 class="chatgpt-title">${data.toolName}</h3>
              <p class="chatgpt-subtitle">${data.category}</p>
          </div>
      </div>

      <div class="info-grid">
          <div class="info-item">
              <span class="info-label">Primary Use Case</span>
              <span class="info-value">${data.primaryUseCase}</span>
          </div>
          <div class="info-item">
              <span class="info-label">Data Classification</span>
              <span class="info-value">${data.dataClassification}</span>
          </div>
          <div class="info-item">
              <span class="info-label">Assessment Date</span>
              <span class="info-value">${date}</span>
          </div>
          <div class="info-item">
              <span class="info-label">Risk Category</span>
              <span class="info-value">${data.category}</span>
          </div>
          <div class="info-item">
              <span class="info-label">Vendor</span>
              <span class="info-value">${data.vendor}</span>
          </div>
          <div class="info-item">
              <span class="info-label">License Type</span>
              <span class="info-value">${data.licenseType}</span>
          </div>
      </div>
  </div>
  `;
}; 
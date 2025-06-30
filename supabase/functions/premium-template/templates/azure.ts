export const generateAzurePermissionsHTML = (): string => `
  <div class="section">
      <div class="section-header">
          <div class="azure-icon">🔒</div>
          <h2 class="section-title">Azure AD Permissions Assessment</h2>
      </div>

      <div class="azure-assessment">
          <div class="azure-header">
              <span class="azure-lock-icon">🔒</span>
              <span class="azure-assessment-title">Azure AD Integration Assessment</span>
          </div>
          <div class="azure-content">
              <p class="azure-text">This section will be populated with Azure AD permissions analysis when integration is configured. Contact IT Security for setup.</p>
          </div>
      </div>
  </div>
`; 
export const generateFooterHTML = () => {
    const generationDate = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    });

    return `
    <div class="footer">
        <div class="footer-grid">
            <!-- Assessment Details -->
            <div class="footer-section">
                <div class="section-header">
                    <div class="icon">📊</div>
                    <h3 class="section-title">Assessment Details</h3>
                </div>
                <div class="section-content">
                    <div class="meta-info">
                        <div class="meta-item">
                            <span class="meta-label">Generated</span>
                            <span class="meta-value">${generationDate}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Framework</span>
                            <span class="meta-value">Enterprise AI Risk v2.1</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Report Type</span>
                            <span class="meta-value">Premium Analysis</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Analysis Scope</span>
                            <span class="meta-value">Commercial & Personal Use</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Important Disclaimers -->
            <div class="footer-section">
                <div class="section-header">
                    <div class="icon">⚠️</div>
                    <h3 class="section-title">Important Disclaimers</h3>
                </div>
                <div class="section-content">
                    <ul class="disclaimer-list">
                        <li class="disclaimer-item">
                            <div class="disclaimer-icon">•</div>
                            <span>Assessment based on publicly available information and should not be considered exhaustive</span>
                        </li>
                        <li class="disclaimer-item">
                            <div class="disclaimer-icon">•</div>
                            <span>Consult official security documentation and policies for comprehensive details</span>
                        </li>
                        <li class="disclaimer-item">
                            <div class="disclaimer-icon">•</div>
                            <span>This analysis does not constitute professional security advice</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Legal Notice -->
            <div class="footer-section">
                <div class="section-header">
                    <div class="icon">🔒</div>
                    <h3 class="section-title">Legal Notice</h3>
                </div>
                <div class="section-content">
                    <p style="margin-bottom: 16px;">This assessment is confidential and proprietary. Distribution is restricted to authorized personnel only.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">© 2024 Enterprise Security Framework</p>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <div>
                <span>Powered by Enterprise AI Security Framework • Last Updated: June 2025</span>
            </div>
            <div class="ai-badge">
                <div class="ai-badge-icon pulse">🤖</div>
                <span>AI-Enhanced Security Assessment</span>
            </div>
        </div>
    </div>
    `;
}; 
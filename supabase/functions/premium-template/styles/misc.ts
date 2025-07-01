import { theme } from './theme.ts';

export const getMiscStyles = () => `
  /* === UTILITIES === */
  .findings-list {
      margin-top: 1rem;
      padding-left: 1.5rem;
  }

  .findings-list li {
      margin-bottom: 0.5rem;
      color: ${theme.colors.primaryText};
  }

  .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
  }

  .data-table th,
  .data-table td {
      padding: 0.75rem;
      border: 1px solid ${theme.colors.border};
      text-align: left;
  }

  .data-table th {
      background: ${theme.colors.lightGray};
      font-weight: 600;
  }

  .footer p {
      opacity: 0.8;
      font-size: 0.9rem;
  }

  .confidential-banner {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 1rem;
  }

  /* === TOOL INFORMATION === */
  .chatgpt-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 25px;
      padding: 20px;
      background: ${theme.colors.lightGray};
      border-radius: 8px;
      border: 1px solid ${theme.colors.border};
  }

  .chatgpt-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
  }

  .chatgpt-info {
      flex: 1;
  }

  .chatgpt-title {
      font-size: 18px;
      font-weight: 600;
      color: ${theme.colors.primaryText};
      margin-bottom: 4px;
  }

  .chatgpt-subtitle {
      font-size: 14px;
      color: ${theme.colors.secondaryText};
      margin: 0;
  }

  .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
  }

  .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: white;
      border: 1px solid ${theme.colors.border};
      border-radius: 6px;
  }

  .info-label {
      font-size: 13px;
      color: ${theme.colors.secondaryText};
      font-weight: 500;
  }

  .info-value {
      font-size: 14px;
      color: ${theme.colors.primaryText};
      font-weight: 500;
  }

  /* === AZURE AD PERMISSIONS PLACEHOLDER === */
  .azure-icon {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
  }

  .azure-assessment {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 20px;
  }

  .azure-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
  }

  .azure-lock-icon {
      font-size: 16px;
  }

  .azure-assessment-title {
      font-size: 16px;
      font-weight: 600;
      color: #0369a1;
  }

  .azure-content {
      margin-left: 24px;
  }

  .azure-text {
      color: #075985;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
  }
`; 
import { theme } from './theme.ts';

export const getCategoryStyles = () => `
  /* === RISK CATEGORIES === */
  .risk-categories {
      display: flex;
      flex-direction: column;
      gap: 20px;
  }
  
  .risk-category {
      border-radius: 8px;
      padding: 20px;
      position: relative;
      background: #f9fafb;
  }
  
  .risk-category.critical {
      border-left: 4px solid ${theme.colors.riskCritical};
      background: #fef2f2;
  }

  .risk-category.high {
      border-left: 4px solid ${theme.colors.riskHigh};
      background: #fef2f2;
  }
  
  .risk-category.medium {
      border-left: 4px solid ${theme.colors.riskModerate};
      background: #fefbf2;
  }
  
  .risk-category.low {
      border-left: 4px solid ${theme.colors.riskLow};
      background: #f0fdf4;
      color: ${theme.colors.primaryText};
  }
  
  .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
  }
  
  .category-title {
      font-size: 18px;
      font-weight: 600;
      color: ${theme.colors.primaryText};
  }
  
  .risk-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
  }
  
  .risk-badge.critical {
      background: ${theme.colors.riskCritical};
      color: white;
  }

  .risk-badge.high {
      background: ${theme.colors.riskHigh};
      color: white;
  }
  
  .risk-badge.medium {
      background: ${theme.colors.riskModerate};
      color: white;
  }
  
  .risk-badge.low {
      background: ${theme.colors.riskLow};
      color: white;
  }
  
  .category-details {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.6;
  }

  .detail-label {
      font-weight: 600;
      color: #374151;
      display: inline-block;
      min-width: 90px;
  }

  .compliance-risk {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
  }
  
  .critical-gap {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
  }
  
  .gap-title {
      font-weight: 600;
      color: #dc2626;
      margin-bottom: 8px;
      font-size: 14px;
  }
  
  .gap-text {
      color: #991b1b;
      font-size: 14px;
      line-height: 1.5;
  }
`; 
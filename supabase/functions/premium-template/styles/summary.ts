import { theme } from './theme.ts';

export const getSummaryStyles = () => `
  /* === EXECUTIVE SUMMARY === */
  .executive-summary {
      display: grid;
      grid-template-columns: minmax(220px, 280px) 1fr;
      gap: 2rem;
      align-items: start;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      margin-bottom: 2rem;
  }
  
  .risk-score-card {
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      color: white;
      background: linear-gradient(135deg, var(--risk-color) 0%, var(--risk-color-light) 100%);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      position: relative;
      overflow: hidden;
  }
  
  .risk-score-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
      pointer-events: none;
  }
  
  .risk-score-number {
      font-size: 4.5rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 0.25rem;
      position: relative;
  }
  
  .risk-score-total {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 1.5rem;
      font-weight: 500;
  }
  
  .risk-level {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      padding: 0.75rem 1.5rem;
      border-radius: 30px;
      font-weight: 700;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: inline-block;
  }
  
  .summary-details {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 0.5rem;
  }
  
  .summary-item {
      position: relative;
      padding-left: 3rem;
  }
  
  .summary-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 2rem;
      height: 2rem;
      background: #f8fafc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
  }
  
  .summary-item:nth-child(1)::before {
      content: '🛡️';
  }
  
  .summary-item:nth-child(2)::before {
      content: '📋';
  }
  
  .summary-item:nth-child(3)::before {
      content: '✅';
  }
  
  .summary-label {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6366f1;
      margin-bottom: 0.5rem;
  }
  
  .summary-text {
      color: #374151;
      font-size: 1rem;
      line-height: 1.6;
      font-weight: 400;
  }
  
  /* Risk Level Color Variables */
  .risk-low {
      --risk-color: #10b981;
      --risk-color-light: #34d399;
  }
  
  .risk-medium {
      --risk-color: #f59e0b;
      --risk-color-light: #fbbf24;
  }
  
  .risk-high {
      --risk-color: #ef4444;
      --risk-color-light: #f87171;
  }
  
  .risk-critical {
      --risk-color: #dc2626;
      --risk-color-light: #ef4444;
  }
  
  /* Key Findings Section */
  .key-findings {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
  }
  
  .findings-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
  }
  
  .warning-icon {
      font-size: 1.25rem;
  }
  
  .findings-title {
      font-weight: 600;
      color: #92400e;
      font-size: 1.1rem;
  }
  
  .findings-text {
      color: #92400e;
      font-size: 0.95rem;
      line-height: 1.8;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
      .executive-summary {
          grid-template-columns: 1fr;
          gap: 2rem;
      }
      
      .risk-score-card {
          max-width: 280px;
          margin: 0 auto;
      }
      
      .summary-details {
          padding: 0;
      }
  }
`; 
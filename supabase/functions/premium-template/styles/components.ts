import { theme } from './theme.ts';

export const getComponentStyles = () => `
  /* === HEADER === */
  .header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      position: relative;
      padding: 3rem 2rem;
      color: white;
      overflow: hidden;
  }

  .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
          radial-gradient(circle at 20% 150%, #3b82f6 0%, transparent 35%),
          radial-gradient(circle at 80% -50%, #6366f1 0%, transparent 35%);
      opacity: 0.15;
      pointer-events: none;
  }

  .header::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(255, 255, 255, 0.1) 25%, 
          rgba(255, 255, 255, 0.1) 75%, 
          transparent 100%
      );
  }

  .header-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 3rem;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
  }

  .header-main {
      max-width: 800px;
  }

  .report-title {
      font-size: 2.75rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.85) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
  }

  .report-subtitle {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
      max-width: 600px;
  }

  .tool-highlight {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1.25rem;
      border-radius: 12px;
      min-width: 300px;
      margin-bottom: 0;
  }

  .tool-name {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #fff;
  }

  .tool-subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
      font-weight: 500;
  }

  .report-meta {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: flex-start;
      gap: 2rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
  }

  .report-meta strong {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
      margin-right: 0.5rem;
  }

  /* Animated gradient accent */
  @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
  }

  .header-accent {
      position: absolute;
      top: 0;
      right: 0;
      width: 400px;
      height: 100%;
      background: linear-gradient(45deg, 
          rgba(59, 130, 246, 0.1) 0%,
          rgba(99, 102, 241, 0.1) 50%,
          rgba(59, 130, 246, 0.1) 100%
      );
      background-size: 200% 200%;
      animation: gradientShift 15s ease infinite;
      pointer-events: none;
  }

  .header-side {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
      min-width: 300px;
  }

 

  /* Sparkle elements */
  .print-trigger::after {
      content: '✨';
      position: absolute;
      font-size: 1.2rem;
      top: 0;
      right: 0;
      transform-origin: center;
      opacity: 0;
  }

  .print-trigger:hover::after {
      animation: sparkle 1s ease infinite;
  }

  /* Rainbow shine effect */
  .print-trigger:hover {
      background-image: 
          linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%),
          linear-gradient(45deg, 
              rgba(239, 68, 68, 0.1),
              rgba(234, 179, 8, 0.1),
              rgba(34, 197, 94, 0.1),
              rgba(59, 130, 246, 0.1),
              rgba(168, 85, 247, 0.1)
          );
      background-size: 200% 200%, 400% 400%;
      animation: gradientBG 3s ease infinite;
      border: 2px solid transparent;
      animation: borderGlow 2s ease infinite;
  }

  /* Responsive adjustments */
  @media (max-width: 1024px) {
      .header-grid {
          grid-template-columns: 1fr;
          gap: 2rem;
          text-align: center;
      }

      .header-side {
          margin: 0 auto;
          max-width: 400px;
          flex-direction: column;
          align-items: center;
      }

      .header-main {
          max-width: 100%;
      }

      .report-subtitle {
          margin: 0 auto;
      }

      .tool-highlight {
          margin: 0;
      }
  }

  @media (max-width: 768px) {
      .header {
          padding: 2rem 1.5rem;
      }

      .print-button {
          top: 1rem;
          right: 1rem;
      }

      .print-trigger {
          padding: 0.5rem 1rem;
      }

      .print-text {
          display: none;
      }

      .print-icon {
          margin: 0;
          font-size: 1.5rem;
      }

      .header-side {
          width: 100%;
          max-width: none;
          flex-direction: column;
      }

      .report-title {
          font-size: 2rem;
      }

      .report-subtitle {
          font-size: 1.1rem;
      }

      .tool-highlight {
          width: 100%;
      }

      .report-meta {
          flex-direction: column;
          gap: 1rem;
          align-items: center;
      }
  }

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

  /* === RECOMMENDATIONS === */
  .recommendations {
      background: white;
      border-radius: 8px;
      box-shadow: ${theme.shadows.card};
      padding: 2rem;
      margin-top: 2rem;
  }

  .recommendation-item {
      padding: 1rem;
      border-left: 4px solid ${theme.colors.accent};
      background: ${theme.colors.lightGray};
      margin-bottom: 1rem;
      border-radius: 0 4px 4px 0;
  }

  .recommendation-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: ${theme.colors.primaryText};
  }

  /* === FOOTER === */
  .footer {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 16px;
      padding: 40px;
      color: white;
      position: relative;
      overflow: hidden;
      margin-top: 3rem;
  }
  
  .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
      pointer-events: none;
  }
  
  .footer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 40px;
      position: relative;
      z-index: 1;
  }
  
  .footer-section {
      display: flex;
      flex-direction: column;
  }
  
  .footer .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
  }
  
  .footer .icon {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
  }
  
  .footer .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #f1f5f9;
      padding-bottom: 0;
      margin-bottom: 0;
  }

  .footer .section-title::after {
    display: none;
  }
  
  .footer .section-content {
      line-height: 1.6;
      color: #cbd5e1;
      font-size: 14px;
  }
  
  .meta-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
  }
  
  .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }
  
  .meta-label {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
  }
  
  .meta-value {
      font-size: 13px;
      color: #e2e8f0;
      font-weight: 600;
  }
  
  .disclaimer-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
  }
  
  .disclaimer-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;
      line-height: 1.5;
  }
  
  .disclaimer-icon {
      width: 16px;
      height: 16px;
      background: rgba(59, 130, 246, 0.2);
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
      flex-shrink: 0;
  }
  
  .footer-bottom {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #94a3b8;
  }
  
  .ai-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(59, 130, 246, 0.1);
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid rgba(59, 130, 246, 0.2);
  }
  
  .ai-badge-icon {
      width: 16px;
      height: 16px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
  }
  
  .pulse {
      animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
  }

  /* === PRINT BUTTON === */
  .print-button {
      position: fixed;
      top: 2rem;
      right: 3rem;
      z-index: 1000;
  }

  .print-trigger {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
      backdrop-filter: blur(8px);
      border: 2px solid rgba(255, 255, 255, 0.2);
      padding: 1rem 1.5rem;
      border-radius: 16px;
      color: #1e293b;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      width: auto;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }

  .print-trigger:hover {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%);
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
          0 8px 30px rgba(59, 130, 246, 0.2),
          0 0 20px rgba(99, 102, 241, 0.2);
      color: white;
  }

  .print-trigger:active {
      transform: translateY(1px) scale(0.98);
  }

  .print-icon {
      font-size: 2rem;
      line-height: 1;
      position: relative;
      transition: transform 0.3s ease;
  }

  .print-trigger:hover .print-icon {
      transform: translateY(-2px) scale(1.1);
  }

  .print-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.3;
  }

  .print-label {
      font-weight: 700;
      font-size: 1.1rem;
      color: #1e293b;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .print-trigger:hover .print-label {
      color: white;
  }

  .print-format {
      font-size: 0.85rem;
      color: rgba(30, 41, 59, 0.8);
      font-weight: 500;
  }

  .print-trigger:hover .print-format {
      color: rgba(255, 255, 255, 0.8);
  }

  /* Fancy background animation */
  @keyframes gradientBG {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
  }

  /* Glowing border animation */
  @keyframes borderGlow {
      0% { border-color: rgba(99, 102, 241, 0.4); }
      50% { border-color: rgba(59, 130, 246, 0.4); }
      100% { border-color: rgba(99, 102, 241, 0.4); }
  }

  /* Sparkle animation */
  @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
  }

  .print-trigger::before {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, 
          #3b82f6,
          #6366f1,
          #8b5cf6,
          #6366f1,
          #3b82f6
      );
      background-size: 200% 200%;
      border-radius: 18px;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
      animation: gradientBG 3s ease infinite;
  }

  .print-trigger:hover::before {
      opacity: 0.8;
  }

  /* Sparkle elements */
  .print-trigger::after {
      content: '✨';
      position: absolute;
      font-size: 1.2rem;
      top: 0;
      right: 0;
      transform-origin: center;
      opacity: 0;
  }

  .print-trigger:hover::after {
      animation: sparkle 1s ease infinite;
  }

  /* Rainbow shine effect */
  .print-trigger:hover {
      background-image: 
          linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%),
          linear-gradient(45deg, 
              rgba(239, 68, 68, 0.1),
              rgba(234, 179, 8, 0.1),
              rgba(34, 197, 94, 0.1),
              rgba(59, 130, 246, 0.1),
              rgba(168, 85, 247, 0.1)
          );
      background-size: 200% 200%, 400% 400%;
      animation: gradientBG 3s ease infinite;
      border: 2px solid transparent;
      animation: borderGlow 2s ease infinite;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
      .print-button {
          position: relative;
          top: auto;
          right: auto;
          margin: 1rem auto 2rem;
          text-align: center;
      }

      .print-trigger {
          margin: 0 auto;
          justify-content: center;
          padding: 1rem 2rem;
      }
  }

  /* Print styles */
  @media print {
      .print-button {
          display: none;
      }
  }

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
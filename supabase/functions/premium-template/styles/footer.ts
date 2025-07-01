import { theme } from './theme.ts';

export const getFooterStyles = () => `
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
`; 
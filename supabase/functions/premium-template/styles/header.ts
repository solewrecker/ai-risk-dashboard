import { theme } from './theme.ts';

export const getHeaderStyles = () => `
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
  }
`; 
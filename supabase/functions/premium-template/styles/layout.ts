import { theme } from './theme.ts';

export const getLayoutStyles = () => `
  /* === BASE STYLES === */
  * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
  }

  body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: ${theme.colors.primaryText};
      background: ${theme.colors.lightGray};
      padding: 2rem;
  }

  .report-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      box-shadow: ${theme.shadows.card};
      border-radius: 12px;
      position: relative;
  }

  /* === SECTIONS === */
  .section {
      padding: 2rem;
  }

  .section-header {
      margin-bottom: 2rem;
  }

  .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: ${theme.colors.primaryText};
      margin-bottom: 0.75rem;
      position: relative;
      padding-bottom: 0.75rem;
  }

  .section-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 4px;
      background: ${theme.colors.accent};
      border-radius: 2px;
  }

  .section-description {
      color: ${theme.colors.secondaryText};
      font-size: 1.1rem;
      max-width: 800px;
  }

  /* === GRID LAYOUTS === */
  .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      padding: 0 2rem 2rem;
  }

  .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
  }

  /* === RESPONSIVE ADJUSTMENTS === */
  @media (max-width: 768px) {
      body {
          padding: 1rem;
      }

      .section {
          padding: 1.5rem;
      }

      .categories-grid {
          grid-template-columns: 1fr;
          padding: 0 1.5rem 1.5rem;
      }

      .section-title {
          font-size: 1.5rem;
      }
  }

  /* === PRINT STYLES === */
  @media print {
      body {
          background: white;
          padding: 0;
      }

      .report-container {
          box-shadow: none;
          max-width: none;
      }

      .section {
          page-break-inside: avoid;
      }
  }
`; 
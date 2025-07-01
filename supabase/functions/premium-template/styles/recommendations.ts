import { theme } from './theme.ts';

export const getRecommendationsStyles = () => `
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
`; 
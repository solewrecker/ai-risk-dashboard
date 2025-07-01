import {
  getHeaderStyles,
  getButtonStyles,
  getSummaryStyles,
  getCategoryStyles,
  getRecommendationsStyles,
  getFooterStyles,
  getMiscStyles
} from './index.ts';

export const getComponentStyles = () => `
  ${getHeaderStyles()}
  ${getButtonStyles()}
  ${getSummaryStyles()}
  ${getCategoryStyles()}
  ${getRecommendationsStyles()}
  ${getFooterStyles()}
  ${getMiscStyles()}
`; 
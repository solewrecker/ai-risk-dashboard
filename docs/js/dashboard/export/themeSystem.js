import { updateLayout, updateComponents } from './components/domUpdater.js';
import { designTokens } from './config/designTokens.js';
import { themes } from './themes/themeConfig.js';

// Scalable Theme System for 50+ Themes
export class ScalableThemeSystem {
  constructor() {
    this.designTokens = designTokens;

    // Theme definitions - just combinations of tokens
    this.themeRegistry = new Map();
    this.currentTheme = null;
    this.styleSheet = null;
    
    this.initializeStyleSheet();
    this.registerThemes(themes);
  }

  // Register themes as combinations of design tokens
  registerTheme(name, config) {
    this.themeRegistry.set(name, {
      layout: config.layout || 'single',
      colorScheme: config.colorScheme || 'corporate', 
      density: config.density || 'normal',
      components: config.components || 'standard',
      sections: config.sections || ['header', 'content'],
      customRules: config.customRules || {}
    });
  }

  // Bulk register themes from config
  registerThemes(themes) {
    Object.entries(themes).forEach(([name, config]) => {
      this.registerTheme(name, config);
    });
  }

  initializeStyleSheet() {
    // Create dynamic stylesheet
    let styleSheet = document.getElementById('dynamic-theme-styles');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'dynamic-theme-styles';
        document.head.appendChild(styleSheet);
    }
    this.styleSheet = styleSheet;
  }

  updateStyleSheet(css) {
    if (this.styleSheet) {
      this.styleSheet.innerHTML = css;
    }
  }

  async switchTheme(themeName) {
    const themeConfig = this.themeRegistry.get(themeName);
    if (!themeConfig) {
      throw new Error(`Theme '${themeName}' not registered`);
    }

    const css = this.generateCSS(themeConfig);
    this.updateStyleSheet(css);

    // Update DOM structure if needed
    updateLayout(themeConfig);
    
    // Update component behavior
    updateComponents(themeConfig, this.designTokens);
    
    this.currentTheme = themeName;
    this.dispatchThemeChange(themeName);
  }

  generateCSS(config) {
    const layout = this.designTokens.layouts[config.layout];
    const colors = this.designTokens.colorSchemes[config.colorScheme];
    const density = this.designTokens.densities[config.density];

    return `
      :root {
        --theme-primary: ${colors.primary};
        --theme-secondary: ${colors.secondary};
        --theme-bg: ${colors.bg};
        --theme-spacing: ${density.spacing};
        --theme-font-size: ${density.fontSize};
        --theme-line-height: ${density.lineHeight};
      }
      
      .report-container {
        grid-template-columns: ${layout.columns};
        grid-template-areas: ${layout.areas};
        gap: var(--theme-spacing);
        font-size: var(--theme-font-size);
        line-height: var(--theme-line-height);
        background-color: var(--theme-bg);
      }
      
      .theme-primary { color: var(--theme-primary); }
      .theme-secondary { color: var(--theme-secondary); }
      .theme-bg { background-color: var(--theme-bg); }
      
      ${this.generateCustomRules(config.customRules)}
    `;
  }

  generateCustomRules(customRules) {
    return Object.entries(customRules)
      .map(([selector, rules]) => {
        const ruleString = Object.entries(rules)
          .map(([prop, value]) => `${prop}: ${value}`)
          .join('; ');
        return `${selector} { ${ruleString} }`;
      })
      .join('\n');
  }



  dispatchThemeChange(themeName) {
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { themeName, config: this.themeRegistry.get(themeName) }
    }));
  }

  // Bulk theme operations
  getAvailableThemes() {
    return Array.from(this.themeRegistry.keys());
  }

  exportTheme(themeName) {
    return this.themeRegistry.get(themeName);
  }

  importThemes(themesData) {
    this.registerThemes(themesData);
  }
}

// ScalableThemeSystem is already exported with the class declaration
/**
 * Theme Switcher for the AI Tool Risk Framework Report System
 * Handles smooth theme transitions
 */
export class ThemeSwitcher {
  /**
   * Creates a new ThemeSwitcher instance
   * @param {ThemeLoader} themeLoader - The theme loader to use
   * @param {ThemeRegistry} themeRegistry - The theme registry to use
   */
  constructor(themeLoader, themeRegistry) {
    this.themeLoader = themeLoader;
    this.themeRegistry = themeRegistry;
    this.transitionDuration = 300; // ms
    this.isTransitioning = false;
    
    // Initialize
    this.init();
  }
  
  /**
   * Initializes the theme switcher
   * @private
   */
  init() {
    // Listen for theme change events
    document.addEventListener('themechange', event => {
      const { theme } = event.detail;
      console.log(`Theme changed: ${theme}`);
    });
    
    // Add transition styles
    this.addTransitionStyles();
    
    // Prefetch common themes for faster switching
    this.themeLoader.prefetchCommonThemes();
  }
  
  /**
   * Adds transition styles to the document
   * @private
   */
  addTransitionStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .theme-transition {
        transition: background-color ${this.transitionDuration}ms ease,
                    color ${this.transitionDuration}ms ease,
                    border-color ${this.transitionDuration}ms ease,
                    box-shadow ${this.transitionDuration}ms ease;
      }
      
      .theme-transition * {
        transition: inherit;
      }
      
      .theme-transition-container {
        contain: layout style;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Switches to a new theme with a smooth transition
   * @param {string} themeName - The name of the theme to switch to
   * @returns {Promise<void>}
   */
  async switchTheme(themeName) {
    // Check if theme exists
    if (!this.themeRegistry.hasTheme(themeName)) {
      throw new Error(`Theme ${themeName} not found`);
    }
    
    // Check if already transitioning
    if (this.isTransitioning) {
      console.warn('Theme transition already in progress');
      return;
    }
    
    // Check if already using this theme
    if (this.themeLoader.getCurrentTheme() === themeName) {
      console.log(`Already using theme: ${themeName}`);
      return;
    }
    
    this.isTransitioning = true;
    
    try {
      // First preload critical resources for the theme (variables, layout, typography)
      this.themeLoader.preloadCriticalTheme(themeName);
      
      // Then preload the complete theme
      await this.themeLoader.preloadTheme(themeName);
      
      // Start transition
      await this.performTransition(themeName);
      
      console.log(`Switched to theme: ${themeName}`);
    } catch (error) {
      console.error(`Failed to switch to theme ${themeName}:`, error);
      throw error;
    } finally {
      this.isTransitioning = false;
    }
  }
  
  /**
   * Performs the theme transition
   * @param {string} themeName - The name of the theme to transition to
   * @returns {Promise<void>}
   * @private
   */
  async performTransition(themeName) {
    return new Promise(resolve => {
      // Add transition class to body
      document.body.classList.add('theme-transition');
      
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(async () => {
        // Apply containment to improve performance
        document.querySelectorAll('.report-section').forEach(section => {
          section.classList.add('theme-transition-container');
        });
        
        // Wait for next frame to ensure transition class is applied
        requestAnimationFrame(async () => {
          // Load the new theme
          await this.themeLoader.loadTheme(themeName);
          
          // Prefetch other common themes for future switches
          this.themeLoader.prefetchCommonThemes();
          
          // Wait for transition to complete
          setTimeout(() => {
            // Remove transition class
            document.body.classList.remove('theme-transition');
            
            // Remove containment
            document.querySelectorAll('.report-section').forEach(section => {
              section.classList.remove('theme-transition-container');
            });
            
            resolve();
          }, this.transitionDuration);
        });
      });
    });
  }
  
  /**
   * Sets the transition duration
   * @param {number} duration - The transition duration in milliseconds
   */
  setTransitionDuration(duration) {
    this.transitionDuration = duration;
    
    // Update transition styles
    const styleElement = document.querySelector('style');
    if (styleElement) {
      styleElement.textContent = styleElement.textContent.replace(
        /transition:[^;]+;/g,
        `transition: background-color ${this.transitionDuration}ms ease,
                    color ${this.transitionDuration}ms ease,
                    border-color ${this.transitionDuration}ms ease,
                    box-shadow ${this.transitionDuration}ms ease;`
      );
    }
  }
  
  /**
   * Creates a theme switcher UI
   * @param {HTMLElement} container - The container element
   */
  createThemeSwitcherUI(container) {
    // Create theme switcher container
    const switcherContainer = document.createElement('div');
    switcherContainer.className = 'theme-switcher';
    
    // Create heading
    const heading = document.createElement('h3');
    heading.textContent = 'Theme Selector';
    switcherContainer.appendChild(heading);
    
    // Create theme list
    const themeList = document.createElement('ul');
    themeList.className = 'theme-switcher__list';
    
    // Get all themes
    const themes = this.themeRegistry.getAllThemes();
    const currentTheme = this.themeLoader.getCurrentTheme();
    
    // Create theme items
    themes.forEach(theme => {
      const themeItem = document.createElement('li');
      themeItem.className = 'theme-switcher__item';
      
      const themeButton = document.createElement('button');
      themeButton.className = 'theme-switcher__button';
      themeButton.dataset.theme = theme.name;
      themeButton.textContent = theme.displayName || theme.name;
      
      // Mark current theme
      if (theme.name === currentTheme) {
        themeButton.classList.add('theme-switcher__button--active');
      }
      
      // Add click handler
      themeButton.addEventListener('click', () => {
        this.switchTheme(theme.name).catch(error => {
          console.error(`Failed to switch to theme ${theme.name}:`, error);
        });
        
        // Update active button
        document.querySelectorAll('.theme-switcher__button--active').forEach(button => {
          button.classList.remove('theme-switcher__button--active');
        });
        themeButton.classList.add('theme-switcher__button--active');
      });
      
      themeItem.appendChild(themeButton);
      themeList.appendChild(themeItem);
    });
    
    switcherContainer.appendChild(themeList);
    container.appendChild(switcherContainer);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .theme-switcher {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
      }
      
      .theme-switcher h3 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .theme-switcher__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      .theme-switcher__button {
        padding: 0.5rem 1rem;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        background: var(--color-background, #fff);
        color: var(--color-text, #333);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .theme-switcher__button:hover {
        background: var(--color-background-hover, #f5f5f5);
      }
      
      .theme-switcher__button--active {
        background: var(--color-primary, #0066cc);
        color: white;
        border-color: var(--color-primary, #0066cc);
      }
      
      .theme-switcher__button--active:hover {
        background: var(--color-primary-hover, #0055aa);
      }
    `;
    document.head.appendChild(style);
  }
}
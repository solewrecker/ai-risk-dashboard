/**
 * Theme Preview Utility for the AI Tool Risk Framework Report System
 * Allows developers to preview and compare themes
 */
export class ThemePreview {
  /**
   * Creates a new ThemePreview instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      container: options.container || document.body,
      previewWidth: options.previewWidth || 800,
      previewHeight: options.previewHeight || 600,
      showControls: options.showControls !== undefined ? options.showControls : true,
      showCode: options.showCode !== undefined ? options.showCode : true,
      defaultTheme: options.defaultTheme || null,
      onThemeChange: options.onThemeChange || null
    };
    
    this.currentTheme = null;
    this.previewFrames = [];
    this.themeRegistry = window.themeRegistry || { getAllThemes: () => [] };
    
    // Initialize the preview
    this.init();
  }
  
  /**
   * Initializes the theme preview
   * @private
   */
  init() {
    // Create preview container if it doesn't exist
    this.createPreviewContainer();
    
    // Load default theme if specified
    if (this.options.defaultTheme) {
      this.loadTheme(this.options.defaultTheme);
    }
  }
  
  /**
   * Creates the preview container and UI
   * @private
   */
  createPreviewContainer() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'theme-preview-container';
    
    // Create header
    this.header = document.createElement('div');
    this.header.className = 'theme-preview-header';
    
    const title = document.createElement('h2');
    title.textContent = 'Theme Preview';
    this.header.appendChild(title);
    
    // Create theme selector if controls are enabled
    if (this.options.showControls) {
      this.createThemeSelector();
    }
    
    this.container.appendChild(this.header);
    
    // Create preview content area
    this.content = document.createElement('div');
    this.content.className = 'theme-preview-content';
    this.container.appendChild(this.content);
    
    // Create preview frame
    this.createPreviewFrame();
    
    // Create code view if enabled
    if (this.options.showCode) {
      this.createCodeView();
    }
    
    // Add styles
    this.addStyles();
    
    // Append to specified container
    this.options.container.appendChild(this.container);
  }
  
  /**
   * Creates the theme selector dropdown
   * @private
   */
  createThemeSelector() {
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'theme-preview-selector-container';
    
    const label = document.createElement('label');
    label.textContent = 'Select Theme: ';
    label.setAttribute('for', 'theme-preview-selector');
    selectorContainer.appendChild(label);
    
    this.themeSelector = document.createElement('select');
    this.themeSelector.id = 'theme-preview-selector';
    this.themeSelector.className = 'theme-preview-selector';
    
    // Populate with available themes
    this.populateThemeSelector();
    
    // Add change event listener
    this.themeSelector.addEventListener('change', () => {
      const selectedThemeId = this.themeSelector.value;
      if (selectedThemeId) {
        this.loadTheme(selectedThemeId);
      }
    });
    
    selectorContainer.appendChild(this.themeSelector);
    this.header.appendChild(selectorContainer);
  }
  
  /**
   * Populates the theme selector with available themes
   * @private
   */
  populateThemeSelector() {
    // Clear existing options
    this.themeSelector.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a theme...';
    this.themeSelector.appendChild(defaultOption);
    
    // Get themes from registry
    const themes = this.themeRegistry.getAllThemes();
    
    // Add theme options
    themes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name;
      this.themeSelector.appendChild(option);
    });
  }
  
  /**
   * Creates the preview iframe
   * @private
   */
  createPreviewFrame() {
    // Create preview frame container
    this.previewContainer = document.createElement('div');
    this.previewContainer.className = 'theme-preview-frame-container';
    
    // Create iframe
    this.previewFrame = document.createElement('iframe');
    this.previewFrame.className = 'theme-preview-frame';
    this.previewFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    this.previewFrame.setAttribute('title', 'Theme Preview');
    this.previewFrame.style.width = `${this.options.previewWidth}px`;
    this.previewFrame.style.height = `${this.options.previewHeight}px`;
    
    this.previewContainer.appendChild(this.previewFrame);
    this.content.appendChild(this.previewContainer);
    
    // Store reference to frame
    this.previewFrames.push(this.previewFrame);
  }
  
  /**
   * Creates the code view panel
   * @private
   */
  createCodeView() {
    // Create code view container
    this.codeContainer = document.createElement('div');
    this.codeContainer.className = 'theme-preview-code-container';
    
    // Create code view header
    const codeHeader = document.createElement('div');
    codeHeader.className = 'theme-preview-code-header';
    
    const codeTitle = document.createElement('h3');
    codeTitle.textContent = 'Theme CSS';
    codeHeader.appendChild(codeTitle);
    
    // Create code view tabs
    this.codeTabs = document.createElement('div');
    this.codeTabs.className = 'theme-preview-code-tabs';
    
    // Create variables tab
    this.variablesTab = document.createElement('button');
    this.variablesTab.className = 'theme-preview-code-tab active';
    this.variablesTab.textContent = 'Variables';
    this.variablesTab.addEventListener('click', () => this.showCodeTab('variables'));
    this.codeTabs.appendChild(this.variablesTab);
    
    // Create components tab
    this.componentsTab = document.createElement('button');
    this.componentsTab.className = 'theme-preview-code-tab';
    this.componentsTab.textContent = 'Components';
    this.componentsTab.addEventListener('click', () => this.showCodeTab('components'));
    this.codeTabs.appendChild(this.componentsTab);
    
    codeHeader.appendChild(this.codeTabs);
    this.codeContainer.appendChild(codeHeader);
    
    // Create code content
    this.codeContent = document.createElement('div');
    this.codeContent.className = 'theme-preview-code-content';
    
    // Create variables code view
    this.variablesCode = document.createElement('pre');
    this.variablesCode.className = 'theme-preview-code-block active';
    this.variablesCode.innerHTML = '<code>/* No theme loaded */</code>';
    this.codeContent.appendChild(this.variablesCode);
    
    // Create components code view
    this.componentsCode = document.createElement('pre');
    this.componentsCode.className = 'theme-preview-code-block';
    this.componentsCode.innerHTML = '<code>/* No theme loaded */</code>';
    this.codeContent.appendChild(this.componentsCode);
    
    this.codeContainer.appendChild(this.codeContent);
    this.content.appendChild(this.codeContainer);
  }
  
  /**
   * Shows the specified code tab
   * @param {string} tabName - The name of the tab to show
   * @private
   */
  showCodeTab(tabName) {
    // Remove active class from all tabs and content
    this.codeTabs.querySelectorAll('.theme-preview-code-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    this.codeContent.querySelectorAll('.theme-preview-code-block').forEach(block => {
      block.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    if (tabName === 'variables') {
      this.variablesTab.classList.add('active');
      this.variablesCode.classList.add('active');
    } else if (tabName === 'components') {
      this.componentsTab.classList.add('active');
      this.componentsCode.classList.add('active');
    }
  }
  
  /**
   * Adds styles to the preview container
   * @private
   */
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .theme-preview-container {
        border: 1px solid var(--color-border, #ddd);
        border-radius: 8px;
        overflow: hidden;
        margin: 20px 0;
        background-color: var(--color-background, #fff);
      }
      
      .theme-preview-header {
        padding: 15px 20px;
        border-bottom: 1px solid var(--color-border, #ddd);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--color-background-alt, #f5f5f5);
      }
      
      .theme-preview-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--color-text, #333);
      }
      
      .theme-preview-selector-container {
        display: flex;
        align-items: center;
      }
      
      .theme-preview-selector-container label {
        margin-right: 10px;
        font-weight: 600;
      }
      
      .theme-preview-selector {
        padding: 8px 12px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        background-color: var(--color-background, #fff);
        min-width: 200px;
      }
      
      .theme-preview-content {
        display: flex;
        flex-wrap: wrap;
      }
      
      .theme-preview-frame-container {
        flex: 1;
        min-width: 300px;
        padding: 20px;
        border-right: 1px solid var(--color-border, #ddd);
      }
      
      .theme-preview-frame {
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        background-color: var(--color-background, #fff);
      }
      
      .theme-preview-code-container {
        flex: 1;
        min-width: 300px;
        max-width: 50%;
      }
      
      .theme-preview-code-header {
        padding: 15px 20px;
        border-bottom: 1px solid var(--color-border, #ddd);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .theme-preview-code-header h3 {
        margin: 0;
        font-size: 1.2rem;
        color: var(--color-text, #333);
      }
      
      .theme-preview-code-tabs {
        display: flex;
      }
      
      .theme-preview-code-tab {
        padding: 8px 15px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.9rem;
        color: var(--color-text-light, #666);
        border-bottom: 2px solid transparent;
      }
      
      .theme-preview-code-tab.active {
        color: var(--color-primary, #0066cc);
        border-bottom-color: var(--color-primary, #0066cc);
        font-weight: 600;
      }
      
      .theme-preview-code-content {
        padding: 0;
        max-height: 500px;
        overflow-y: auto;
      }
      
      .theme-preview-code-block {
        margin: 0;
        padding: 20px;
        display: none;
        font-family: monospace;
        font-size: 0.9rem;
        line-height: 1.5;
        background-color: var(--color-background-alt, #f5f5f5);
        color: var(--color-text, #333);
        white-space: pre-wrap;
        word-break: break-all;
      }
      
      .theme-preview-code-block.active {
        display: block;
      }
      
      .theme-preview-comparison {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        padding: 20px;
      }
      
      .theme-preview-comparison-item {
        flex: 1;
        min-width: 300px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .theme-preview-comparison-header {
        padding: 10px 15px;
        background-color: var(--color-background-alt, #f5f5f5);
        border-bottom: 1px solid var(--color-border, #ddd);
        font-weight: 600;
        text-align: center;
      }
      
      .theme-preview-comparison-frame {
        width: 100%;
        height: 400px;
        border: none;
      }
      
      @media (max-width: 768px) {
        .theme-preview-content {
          flex-direction: column;
        }
        
        .theme-preview-frame-container,
        .theme-preview-code-container {
          max-width: 100%;
          border-right: none;
          border-bottom: 1px solid var(--color-border, #ddd);
        }
        
        .theme-preview-frame {
          width: 100% !important;
          height: 400px !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Loads a theme into the preview
   * @param {string|Object} theme - The theme ID or theme object to load
   * @returns {Promise<void>}
   */
  async loadTheme(theme) {
    try {
      // Get theme object if ID is provided
      let themeObj = theme;
      if (typeof theme === 'string') {
        themeObj = this.themeRegistry.getTheme(theme);
        if (!themeObj) {
          throw new Error(`Theme with ID '${theme}' not found`);
        }
      }
      
      // Store current theme
      this.currentTheme = themeObj;
      
      // Update preview frame
      await this.updatePreviewFrame(themeObj);
      
      // Update code view if enabled
      if (this.options.showCode) {
        await this.updateCodeView(themeObj);
      }
      
      // Update selector if available
      if (this.themeSelector) {
        this.themeSelector.value = themeObj.id;
      }
      
      // Call onThemeChange callback if provided
      if (typeof this.options.onThemeChange === 'function') {
        this.options.onThemeChange(themeObj);
      }
      
      console.log(`Theme '${themeObj.name}' loaded successfully`);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }
  
  /**
   * Updates the preview frame with the theme
   * @param {Object} theme - The theme object
   * @private
   * @returns {Promise<void>}
   */
  async updatePreviewFrame(theme) {
    return new Promise((resolve, reject) => {
      try {
        // Get the iframe document
        const iframe = this.previewFrame;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Create HTML content with theme
        const htmlContent = this.generatePreviewHTML(theme);
        
        // Write to iframe
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
        
        // Resolve when iframe is loaded
        iframe.onload = () => resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Generates the HTML content for the preview
   * @param {Object} theme - The theme object
   * @returns {string} - The HTML content
   * @private
   */
  generatePreviewHTML(theme) {
    // Create CSS links for theme files
    const cssLinks = theme.cssFiles.map(file => `<link rel="stylesheet" href="${file}">`).join('\n');
    
    // Generate preview HTML
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Theme Preview - ${theme.name}</title>
        ${cssLinks}
        <style>
          body {
            font-family: var(--font-family, system-ui, sans-serif);
            margin: 0;
            padding: 20px;
            color: var(--color-text, #333);
            background-color: var(--color-background, #fff);
          }
          
          h1, h2, h3, h4, h5, h6 {
            color: var(--color-text, #333);
            margin-top: 0;
          }
          
          .preview-section {
            margin-bottom: 30px;
          }
          
          .preview-section-title {
            font-size: 1.2rem;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--color-border, #ddd);
          }
          
          .color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 15px;
          }
          
          .color-item {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .color-swatch {
            width: 80px;
            height: 80px;
            border-radius: 4px;
            margin-bottom: 8px;
            border: 1px solid var(--color-border, #ddd);
          }
          
          .color-name {
            font-size: 0.8rem;
            text-align: center;
          }
          
          .typography-sample {
            margin-bottom: 20px;
          }
          
          .button-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
          }
          
          .button {
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            text-align: center;
            border: 1px solid var(--color-border, #ddd);
          }
          
          .button-primary {
            background-color: var(--color-primary, #0066cc);
            color: white;
            border-color: var(--color-primary, #0066cc);
          }
          
          .button-secondary {
            background-color: var(--color-secondary, #ff6600);
            color: white;
            border-color: var(--color-secondary, #ff6600);
          }
          
          .button-outline {
            background-color: transparent;
            color: var(--color-primary, #0066cc);
            border-color: var(--color-primary, #0066cc);
          }
          
          .card {
            border: 1px solid var(--color-border, #ddd);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background-color: var(--color-background, #fff);
          }
          
          .card-title {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 1.2rem;
          }
          
          .card-content {
            color: var(--color-text, #333);
          }
          
          .form-group {
            margin-bottom: 15px;
          }
          
          .form-label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
          }
          
          .form-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--color-border, #ddd);
            border-radius: 4px;
            font-size: 1rem;
          }
          
          .form-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--color-border, #ddd);
            border-radius: 4px;
            font-size: 1rem;
            background-color: var(--color-background, #fff);
          }
          
          .alert {
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          
          .alert-info {
            background-color: var(--color-primary-light, #e6f0fa);
            border-left: 4px solid var(--color-primary, #0066cc);
          }
          
          .alert-warning {
            background-color: #fff8e6;
            border-left: 4px solid var(--color-warning, #ffaa00);
          }
          
          .alert-error {
            background-color: #ffebeb;
            border-left: 4px solid var(--color-error, #cc0000);
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .table th,
          .table td {
            padding: 10px;
            border: 1px solid var(--color-border, #ddd);
            text-align: left;
          }
          
          .table th {
            background-color: var(--color-background-alt, #f5f5f5);
            font-weight: 600;
          }
          
          .table tr:nth-child(even) {
            background-color: var(--color-background-alt, #f5f5f5);
          }
        </style>
      </head>
      <body>
        <h1>${theme.name}</h1>
        <p>${theme.description || 'No description provided.'}</p>
        
        <div class="preview-section">
          <h2 class="preview-section-title">Colors</h2>
          <div class="color-grid">
            <div class="color-item">
              <div class="color-swatch" style="background-color: var(--color-primary);"></div>
              <div class="color-name">Primary</div>
            </div>
            <div class="color-item">
              <div class="color-swatch" style="background-color: var(--color-primary-light);"></div>
              <div class="color-name">Primary Light</div>
            </div>
            <div class="color-item">
              <div class="color-swatch" style="background-color: var(--color-secondary);"></div>
              <div class="color-name">Secondary</div>
            </div>
            <div class="color-item">
              <div class="color-swatch" style="background-color: var(--color-text);"></div>
              <div class="color-name">Text</div>
            </div>
            <div class="color-item">
              <div class="color-swatch" style="background-color: var(--color-background);"></div>
              <div class="color-name">Background</div>
            </div>
            <div class="color-item">
              <div class="color-swatch" style="background-color: var(--color-background-alt);"></div>
              <div class="color-name">Background Alt</div>
            </div>
            <div class="color-item">
              <div class="color-swatch" style="background-color: var(--color-border);"></div>
              <div class="color-name">Border</div>
            </div>
          </div>
        </div>
        
        <div class="preview-section">
          <h2 class="preview-section-title">Typography</h2>
          <div class="typography-sample">
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <p>This is a paragraph of text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>
            <p><strong>Bold text</strong> and <em>italic text</em> and <a href="#">link text</a>.</p>
          </div>
        </div>
        
        <div class="preview-section">
          <h2 class="preview-section-title">Buttons</h2>
          <div class="button-grid">
            <button class="button button-primary">Primary Button</button>
            <button class="button button-secondary">Secondary Button</button>
            <button class="button button-outline">Outline Button</button>
            <button class="button">Default Button</button>
          </div>
        </div>
        
        <div class="preview-section">
          <h2 class="preview-section-title">Cards</h2>
          <div class="card">
            <h3 class="card-title">Card Title</h3>
            <div class="card-content">
              <p>This is a card component. Cards are used to group related content and actions.</p>
              <button class="button button-primary">Action</button>
            </div>
          </div>
        </div>
        
        <div class="preview-section">
          <h2 class="preview-section-title">Forms</h2>
          <form>
            <div class="form-group">
              <label class="form-label" for="name">Name</label>
              <input class="form-input" type="text" id="name" placeholder="Enter your name">
            </div>
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input class="form-input" type="email" id="email" placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label class="form-label" for="category">Category</label>
              <select class="form-select" id="category">
                <option value="">Select a category</option>
                <option value="1">Category 1</option>
                <option value="2">Category 2</option>
                <option value="3">Category 3</option>
              </select>
            </div>
            <button class="button button-primary" type="button">Submit</button>
          </form>
        </div>
        
        <div class="preview-section">
          <h2 class="preview-section-title">Alerts</h2>
          <div class="alert alert-info">
            <p>This is an information alert. It provides helpful information to the user.</p>
          </div>
          <div class="alert alert-warning">
            <p>This is a warning alert. It warns the user about potential issues.</p>
          </div>
          <div class="alert alert-error">
            <p>This is an error alert. It indicates that something went wrong.</p>
          </div>
        </div>
        
        <div class="preview-section">
          <h2 class="preview-section-title">Tables</h2>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Item 1</td>
                <td>Category A</td>
                <td>Active</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Item 2</td>
                <td>Category B</td>
                <td>Inactive</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Item 3</td>
                <td>Category A</td>
                <td>Active</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Updates the code view with the theme CSS
   * @param {Object} theme - The theme object
   * @private
   * @returns {Promise<void>}
   */
  async updateCodeView(theme) {
    try {
      // Fetch CSS files
      const cssFiles = await Promise.all(theme.cssFiles.map(file => this.fetchCSSFile(file)));
      
      // Extract variables and components CSS
      const { variables, components } = this.extractCSSParts(cssFiles.join('\n'));
      
      // Update code blocks
      this.variablesCode.innerHTML = `<code>${this.formatCSS(variables)}</code>`;
      this.componentsCode.innerHTML = `<code>${this.formatCSS(components)}</code>`;
    } catch (error) {
      console.error('Failed to update code view:', error);
      this.variablesCode.innerHTML = `<code>/* Error loading CSS: ${error.message} */</code>`;
      this.componentsCode.innerHTML = `<code>/* Error loading CSS: ${error.message} */</code>`;
    }
  }
  
  /**
   * Fetches a CSS file
   * @param {string} url - The URL of the CSS file
   * @returns {Promise<string>} - The CSS content
   * @private
   */
  async fetchCSSFile(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSS file: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error fetching CSS file ${url}:`, error);
      return `/* Error loading ${url}: ${error.message} */`;
    }
  }
  
  /**
   * Extracts variables and components from CSS
   * @param {string} css - The CSS content
   * @returns {Object} - Object with variables and components CSS
   * @private
   */
  extractCSSParts(css) {
    // Extract variables (typically in :root or similar)
    const variablesRegex = /(:root|body|html)\s*{[^}]*}/g;
    const variablesMatches = css.match(variablesRegex) || [];
    const variables = variablesMatches.join('\n\n');
    
    // Remove variables from CSS to get components
    let components = css;
    variablesMatches.forEach(match => {
      components = components.replace(match, '');
    });
    
    return { variables, components };
  }
  
  /**
   * Formats CSS for display
   * @param {string} css - The CSS content
   * @returns {string} - The formatted CSS
   * @private
   */
  formatCSS(css) {
    // Simple CSS formatting
    return css
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();
  }
  
  /**
   * Compares multiple themes side by side
   * @param {Array<string|Object>} themes - Array of theme IDs or theme objects to compare
   * @returns {Promise<void>}
   */
  async compareThemes(themes) {
    if (!Array.isArray(themes) || themes.length < 2) {
      console.error('At least two themes are required for comparison');
      return;
    }
    
    try {
      // Clear existing content
      this.content.innerHTML = '';
      
      // Create comparison container
      const comparisonContainer = document.createElement('div');
      comparisonContainer.className = 'theme-preview-comparison';
      
      // Create comparison items for each theme
      for (const theme of themes) {
        // Get theme object if ID is provided
        let themeObj = theme;
        if (typeof theme === 'string') {
          themeObj = this.themeRegistry.getTheme(theme);
          if (!themeObj) {
            throw new Error(`Theme with ID '${theme}' not found`);
          }
        }
        
        // Create comparison item
        const comparisonItem = document.createElement('div');
        comparisonItem.className = 'theme-preview-comparison-item';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'theme-preview-comparison-header';
        header.textContent = themeObj.name;
        comparisonItem.appendChild(header);
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'theme-preview-comparison-frame';
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
        iframe.setAttribute('title', `${themeObj.name} Preview`);
        comparisonItem.appendChild(iframe);
        
        // Add to container
        comparisonContainer.appendChild(comparisonItem);
        
        // Store reference to frame
        this.previewFrames.push(iframe);
        
        // Update iframe content
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const htmlContent = this.generatePreviewHTML(themeObj);
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
      
      // Add comparison container to content
      this.content.appendChild(comparisonContainer);
      
      console.log(`Comparing ${themes.length} themes`);
    } catch (error) {
      console.error('Failed to compare themes:', error);
    }
  }
  
  /**
   * Refreshes the theme preview
   * @returns {Promise<void>}
   */
  async refresh() {
    if (this.currentTheme) {
      await this.loadTheme(this.currentTheme);
    }
  }
  
  /**
   * Destroys the theme preview and cleans up resources
   */
  destroy() {
    // Remove event listeners
    if (this.themeSelector) {
      this.themeSelector.removeEventListener('change', () => {});
    }
    
    if (this.variablesTab) {
      this.variablesTab.removeEventListener('click', () => {});
    }
    
    if (this.componentsTab) {
      this.componentsTab.removeEventListener('click', () => {});
    }
    
    // Remove container from DOM
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Clear references
    this.previewFrames = [];
    this.currentTheme = null;
  }
}
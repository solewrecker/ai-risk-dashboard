/**
 * Visual Regression Test Utility for the AI Tool Risk Framework Report System
 * Allows developers to perform visual regression testing on themes
 */
export class VisualRegressionTest {
  /**
   * Creates a new VisualRegressionTest instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      container: options.container || document.body,
      baselineTheme: options.baselineTheme || null,
      testTheme: options.testTheme || null,
      viewportSizes: options.viewportSizes || [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1366, height: 768, name: 'Desktop' }
      ],
      components: options.components || [
        'typography',
        'buttons',
        'cards',
        'forms',
        'alerts',
        'tables'
      ],
      onTestComplete: options.onTestComplete || null,
      themeRegistry: options.themeRegistry || null
    };
    
    this.themeRegistry = this.options.themeRegistry || window.themeRegistry || { getAllThemes: () => [] };
    this.testResults = [];
    this.currentTest = null;
    
    // Initialize the test utility
    this.init();
  }
  
  /**
   * Initializes the visual regression test utility
   * @private
   */
  init() {
    // Create test container
    this.createTestContainer();
  }
  
  /**
   * Creates the test container and UI
   * @private
   */
  createTestContainer() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'visual-regression-test-container';
    
    // Create header
    this.header = document.createElement('div');
    this.header.className = 'visual-regression-test-header';
    
    const title = document.createElement('h2');
    title.textContent = 'Visual Regression Test';
    this.header.appendChild(title);
    
    // Create theme selectors
    this.createThemeSelectors();
    
    // Create test controls
    this.createTestControls();
    
    this.container.appendChild(this.header);
    
    // Create test content area
    this.content = document.createElement('div');
    this.content.className = 'visual-regression-test-content';
    this.container.appendChild(this.content);
    
    // Create results area
    this.resultsContainer = document.createElement('div');
    this.resultsContainer.className = 'visual-regression-test-results';
    this.resultsContainer.innerHTML = '<p>No test results yet. Run a test to see results.</p>';
    this.container.appendChild(this.resultsContainer);
    
    // Add styles
    this.addStyles();
    
    // Append to specified container
    this.options.container.appendChild(this.container);
  }
  
  /**
   * Creates the theme selectors
   * @private
   */
  createThemeSelectors() {
    const selectorsContainer = document.createElement('div');
    selectorsContainer.className = 'visual-regression-test-selectors';
    
    // Baseline theme selector
    const baselineContainer = document.createElement('div');
    baselineContainer.className = 'visual-regression-test-selector-container';
    
    const baselineLabel = document.createElement('label');
    baselineLabel.textContent = 'Baseline Theme: ';
    baselineLabel.setAttribute('for', 'baseline-theme-selector');
    baselineContainer.appendChild(baselineLabel);
    
    this.baselineSelector = document.createElement('select');
    this.baselineSelector.id = 'baseline-theme-selector';
    this.baselineSelector.className = 'visual-regression-test-selector';
    
    // Test theme selector
    const testContainer = document.createElement('div');
    testContainer.className = 'visual-regression-test-selector-container';
    
    const testLabel = document.createElement('label');
    testLabel.textContent = 'Test Theme: ';
    testLabel.setAttribute('for', 'test-theme-selector');
    testContainer.appendChild(testLabel);
    
    this.testSelector = document.createElement('select');
    this.testSelector.id = 'test-theme-selector';
    this.testSelector.className = 'visual-regression-test-selector';
    
    // Populate selectors
    this.populateThemeSelectors();
    
    baselineContainer.appendChild(this.baselineSelector);
    testContainer.appendChild(this.testSelector);
    
    selectorsContainer.appendChild(baselineContainer);
    selectorsContainer.appendChild(testContainer);
    
    this.header.appendChild(selectorsContainer);
  }
  
  /**
   * Populates the theme selectors with available themes
   * @private
   */
  populateThemeSelectors() {
    // Clear existing options
    this.baselineSelector.innerHTML = '';
    this.testSelector.innerHTML = '';
    
    // Add default options
    const baselineDefaultOption = document.createElement('option');
    baselineDefaultOption.value = '';
    baselineDefaultOption.textContent = 'Select baseline theme...';
    this.baselineSelector.appendChild(baselineDefaultOption);
    
    const testDefaultOption = document.createElement('option');
    testDefaultOption.value = '';
    testDefaultOption.textContent = 'Select test theme...';
    this.testSelector.appendChild(testDefaultOption);
    
    // Get themes from registry
    const themes = this.themeRegistry.getAllThemes();
    
    // Add theme options
    themes.forEach(theme => {
      // Baseline option
      const baselineOption = document.createElement('option');
      baselineOption.value = theme.id;
      baselineOption.textContent = theme.name;
      this.baselineSelector.appendChild(baselineOption);
      
      // Test option
      const testOption = document.createElement('option');
      testOption.value = theme.id;
      testOption.textContent = theme.name;
      this.testSelector.appendChild(testOption);
    });
    
    // Set default values if provided
    if (this.options.baselineTheme) {
      this.baselineSelector.value = typeof this.options.baselineTheme === 'string' 
        ? this.options.baselineTheme 
        : this.options.baselineTheme.id;
    }
    
    if (this.options.testTheme) {
      this.testSelector.value = typeof this.options.testTheme === 'string' 
        ? this.options.testTheme 
        : this.options.testTheme.id;
    }
  }
  
  /**
   * Creates the test controls
   * @private
   */
  createTestControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'visual-regression-test-controls';
    
    // Run test button
    this.runTestButton = document.createElement('button');
    this.runTestButton.className = 'visual-regression-test-button';
    this.runTestButton.textContent = 'Run Test';
    this.runTestButton.addEventListener('click', () => this.runTest());
    
    // Export results button
    this.exportButton = document.createElement('button');
    this.exportButton.className = 'visual-regression-test-button';
    this.exportButton.textContent = 'Export Results';
    this.exportButton.disabled = true;
    this.exportButton.addEventListener('click', () => this.exportResults());
    
    controlsContainer.appendChild(this.runTestButton);
    controlsContainer.appendChild(this.exportButton);
    
    this.header.appendChild(controlsContainer);
  }
  
  /**
   * Adds styles to the test container
   * @private
   */
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .visual-regression-test-container {
        border: 1px solid var(--color-border, #ddd);
        border-radius: 8px;
        overflow: hidden;
        margin: 20px 0;
        background-color: var(--color-background, #fff);
      }
      
      .visual-regression-test-header {
        padding: 15px 20px;
        border-bottom: 1px solid var(--color-border, #ddd);
        background-color: var(--color-background-alt, #f5f5f5);
      }
      
      .visual-regression-test-header h2 {
        margin: 0 0 15px 0;
        font-size: 1.5rem;
        color: var(--color-text, #333);
      }
      
      .visual-regression-test-selectors {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 15px;
      }
      
      .visual-regression-test-selector-container {
        flex: 1;
        min-width: 200px;
      }
      
      .visual-regression-test-selector-container label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
      }
      
      .visual-regression-test-selector {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        background-color: var(--color-background, #fff);
      }
      
      .visual-regression-test-controls {
        display: flex;
        gap: 10px;
      }
      
      .visual-regression-test-button {
        padding: 8px 16px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        background-color: var(--color-primary, #0066cc);
        color: white;
        font-weight: 600;
        cursor: pointer;
      }
      
      .visual-regression-test-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .visual-regression-test-content {
        padding: 20px;
      }
      
      .visual-regression-test-progress {
        margin-bottom: 20px;
      }
      
      .visual-regression-test-progress-bar {
        height: 10px;
        background-color: var(--color-background-alt, #f5f5f5);
        border-radius: 5px;
        overflow: hidden;
      }
      
      .visual-regression-test-progress-fill {
        height: 100%;
        background-color: var(--color-primary, #0066cc);
        width: 0%;
        transition: width 0.3s ease;
      }
      
      .visual-regression-test-progress-text {
        margin-top: 5px;
        font-size: 0.9rem;
        color: var(--color-text-light, #666);
      }
      
      .visual-regression-test-frames {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .visual-regression-test-frame-container {
        flex: 1;
        min-width: 300px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        overflow: hidden;
      }
      
      .visual-regression-test-frame-header {
        padding: 10px 15px;
        background-color: var(--color-background-alt, #f5f5f5);
        border-bottom: 1px solid var(--color-border, #ddd);
        font-weight: 600;
      }
      
      .visual-regression-test-frame {
        width: 100%;
        border: none;
      }
      
      .visual-regression-test-results {
        padding: 20px;
        border-top: 1px solid var(--color-border, #ddd);
      }
      
      .visual-regression-test-result-item {
        margin-bottom: 30px;
      }
      
      .visual-regression-test-result-header {
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid var(--color-border, #ddd);
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .visual-regression-test-result-content {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      
      .visual-regression-test-result-image {
        flex: 1;
        min-width: 300px;
        max-width: 45%;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        overflow: hidden;
      }
      
      .visual-regression-test-result-image-header {
        padding: 8px 12px;
        background-color: var(--color-background-alt, #f5f5f5);
        border-bottom: 1px solid var(--color-border, #ddd);
        font-weight: 600;
        font-size: 0.9rem;
      }
      
      .visual-regression-test-result-image img {
        width: 100%;
        display: block;
      }
      
      .visual-regression-test-result-diff {
        flex: 1;
        min-width: 300px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        overflow: hidden;
      }
      
      .visual-regression-test-result-diff-header {
        padding: 8px 12px;
        background-color: var(--color-background-alt, #f5f5f5);
        border-bottom: 1px solid var(--color-border, #ddd);
        font-weight: 600;
        font-size: 0.9rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .visual-regression-test-result-diff-score {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
      }
      
      .visual-regression-test-result-diff-score.pass {
        background-color: #e6f4ea;
        color: #137333;
      }
      
      .visual-regression-test-result-diff-score.warn {
        background-color: #fef7e0;
        color: #b06000;
      }
      
      .visual-regression-test-result-diff-score.fail {
        background-color: #fce8e6;
        color: #c5221f;
      }
      
      .visual-regression-test-result-diff canvas {
        width: 100%;
        display: block;
      }
      
      .visual-regression-test-summary {
        margin-top: 20px;
        padding: 15px;
        border-radius: 4px;
        background-color: var(--color-background-alt, #f5f5f5);
      }
      
      .visual-regression-test-summary h3 {
        margin-top: 0;
        margin-bottom: 10px;
      }
      
      .visual-regression-test-summary-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 15px;
      }
      
      .visual-regression-test-summary-stat {
        flex: 1;
        min-width: 100px;
        padding: 10px;
        border-radius: 4px;
        text-align: center;
      }
      
      .visual-regression-test-summary-stat.pass {
        background-color: #e6f4ea;
        color: #137333;
      }
      
      .visual-regression-test-summary-stat.warn {
        background-color: #fef7e0;
        color: #b06000;
      }
      
      .visual-regression-test-summary-stat.fail {
        background-color: #fce8e6;
        color: #c5221f;
      }
      
      .visual-regression-test-summary-stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 5px;
      }
      
      .visual-regression-test-summary-stat-label {
        font-size: 0.9rem;
      }
      
      @media (max-width: 768px) {
        .visual-regression-test-selectors {
          flex-direction: column;
          gap: 10px;
        }
        
        .visual-regression-test-result-content {
          flex-direction: column;
        }
        
        .visual-regression-test-result-image,
        .visual-regression-test-result-diff {
          max-width: 100%;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Runs the visual regression test
   * @returns {Promise<void>}
   */
  async runTest() {
    try {
      // Get selected themes
      const baselineThemeId = this.baselineSelector.value;
      const testThemeId = this.testSelector.value;
      
      if (!baselineThemeId || !testThemeId) {
        alert('Please select both baseline and test themes');
        return;
      }
      
      // Get theme objects
      const baselineTheme = this.themeRegistry.getTheme(baselineThemeId);
      const testTheme = this.themeRegistry.getTheme(testThemeId);
      
      if (!baselineTheme || !testTheme) {
        alert('One or both selected themes could not be found');
        return;
      }
      
      // Disable controls during test
      this.setControlsEnabled(false);
      
      // Clear previous results
      this.testResults = [];
      this.resultsContainer.innerHTML = '';
      
      // Create progress indicator
      this.createProgressIndicator();
      
      // Create test frames container
      this.createTestFrames(baselineTheme, testTheme);
      
      // Run tests for each viewport and component
      const totalTests = this.options.viewportSizes.length * this.options.components.length;
      let completedTests = 0;
      
      for (const viewport of this.options.viewportSizes) {
        for (const component of this.options.components) {
          // Update current test info
          this.currentTest = { viewport, component };
          this.updateProgressText(`Testing ${component} at ${viewport.name} (${viewport.width}x${viewport.height})`);
          
          // Wait for frames to load with current test settings
          await this.updateTestFrames(baselineTheme, testTheme, viewport, component);
          
          // Capture screenshots
          const baselineScreenshot = await this.captureFrame(this.baselineFrame);
          const testScreenshot = await this.captureFrame(this.testFrame);
          
          // Compare screenshots
          const diffResult = await this.compareScreenshots(baselineScreenshot, testScreenshot);
          
          // Store result
          this.testResults.push({
            viewport,
            component,
            baselineScreenshot,
            testScreenshot,
            diffCanvas: diffResult.diffCanvas,
            diffScore: diffResult.diffScore,
            diffPixels: diffResult.diffPixels,
            totalPixels: diffResult.totalPixels
          });
          
          // Update progress
          completedTests++;
          this.updateProgress(completedTests / totalTests * 100);
          
          // Small delay to prevent UI freezing
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Display results
      this.displayResults(baselineTheme, testTheme);
      
      // Enable controls
      this.setControlsEnabled(true);
      this.exportButton.disabled = false;
      
      // Call onTestComplete callback if provided
      if (typeof this.options.onTestComplete === 'function') {
        this.options.onTestComplete({
          baselineTheme,
          testTheme,
          results: this.testResults,
          summary: this.generateSummary()
        });
      }
      
      console.log('Visual regression test completed');
    } catch (error) {
      console.error('Error running visual regression test:', error);
      alert(`Test failed: ${error.message}`);
      
      // Enable controls
      this.setControlsEnabled(true);
    }
  }
  
  /**
   * Creates the progress indicator
   * @private
   */
  createProgressIndicator() {
    // Clear content
    this.content.innerHTML = '';
    
    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'visual-regression-test-progress';
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'visual-regression-test-progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'visual-regression-test-progress-fill';
    progressBar.appendChild(progressFill);
    
    // Create progress text
    const progressText = document.createElement('div');
    progressText.className = 'visual-regression-test-progress-text';
    progressText.textContent = 'Initializing test...';
    
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    
    this.content.appendChild(progressContainer);
    
    // Store references
    this.progressFill = progressFill;
    this.progressText = progressText;
  }
  
  /**
   * Updates the progress bar
   * @param {number} percent - The progress percentage
   * @private
   */
  updateProgress(percent) {
    if (this.progressFill) {
      this.progressFill.style.width = `${percent}%`;
    }
  }
  
  /**
   * Updates the progress text
   * @param {string} text - The progress text
   * @private
   */
  updateProgressText(text) {
    if (this.progressText) {
      this.progressText.textContent = text;
    }
  }
  
  /**
   * Creates the test frames
   * @param {Object} baselineTheme - The baseline theme
   * @param {Object} testTheme - The test theme
   * @private
   */
  createTestFrames(baselineTheme, testTheme) {
    // Create frames container
    const framesContainer = document.createElement('div');
    framesContainer.className = 'visual-regression-test-frames';
    
    // Create baseline frame
    const baselineContainer = document.createElement('div');
    baselineContainer.className = 'visual-regression-test-frame-container';
    
    const baselineHeader = document.createElement('div');
    baselineHeader.className = 'visual-regression-test-frame-header';
    baselineHeader.textContent = `Baseline: ${baselineTheme.name}`;
    baselineContainer.appendChild(baselineHeader);
    
    this.baselineFrame = document.createElement('iframe');
    this.baselineFrame.className = 'visual-regression-test-frame';
    this.baselineFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    this.baselineFrame.setAttribute('title', 'Baseline Theme');
    baselineContainer.appendChild(this.baselineFrame);
    
    // Create test frame
    const testContainer = document.createElement('div');
    testContainer.className = 'visual-regression-test-frame-container';
    
    const testHeader = document.createElement('div');
    testHeader.className = 'visual-regression-test-frame-header';
    testHeader.textContent = `Test: ${testTheme.name}`;
    testContainer.appendChild(testHeader);
    
    this.testFrame = document.createElement('iframe');
    this.testFrame.className = 'visual-regression-test-frame';
    this.testFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    this.testFrame.setAttribute('title', 'Test Theme');
    testContainer.appendChild(this.testFrame);
    
    framesContainer.appendChild(baselineContainer);
    framesContainer.appendChild(testContainer);
    
    this.content.appendChild(framesContainer);
  }
  
  /**
   * Updates the test frames with the current test settings
   * @param {Object} baselineTheme - The baseline theme
   * @param {Object} testTheme - The test theme
   * @param {Object} viewport - The viewport size
   * @param {string} component - The component to test
   * @returns {Promise<void>}
   * @private
   */
  async updateTestFrames(baselineTheme, testTheme, viewport, component) {
    return new Promise((resolve, reject) => {
      try {
        // Set frame dimensions
        this.baselineFrame.style.width = `${viewport.width}px`;
        this.baselineFrame.style.height = `${viewport.height}px`;
        this.testFrame.style.width = `${viewport.width}px`;
        this.testFrame.style.height = `${viewport.height}px`;
        
        // Generate HTML content
        const baselineHTML = this.generateComponentHTML(baselineTheme, component);
        const testHTML = this.generateComponentHTML(testTheme, component);
        
        // Load baseline frame
        const baselineDoc = this.baselineFrame.contentDocument || this.baselineFrame.contentWindow.document;
        baselineDoc.open();
        baselineDoc.write(baselineHTML);
        baselineDoc.close();
        
        // Load test frame
        const testDoc = this.testFrame.contentDocument || this.testFrame.contentWindow.document;
        testDoc.open();
        testDoc.write(testHTML);
        testDoc.close();
        
        // Wait for frames to load
        let framesLoaded = 0;
        const onFrameLoad = () => {
          framesLoaded++;
          if (framesLoaded === 2) {
            // Both frames loaded
            setTimeout(resolve, 500); // Small delay to ensure rendering is complete
          }
        };
        
        this.baselineFrame.onload = onFrameLoad;
        this.testFrame.onload = onFrameLoad;
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Generates HTML content for a specific component
   * @param {Object} theme - The theme
   * @param {string} component - The component to generate
   * @returns {string} - The HTML content
   * @private
   */
  generateComponentHTML(theme, component) {
    // Create CSS links for theme files
    const cssLinks = theme.cssFiles.map(file => `<link rel="stylesheet" href="${file}">`).join('\n');
    
    // Generate component-specific content
    let componentContent = '';
    
    switch (component) {
      case 'typography':
        componentContent = `
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <p>This is a paragraph of text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p><strong>Bold text</strong> and <em>italic text</em> and <a href="#">link text</a>.</p>
        `;
        break;
      
      case 'buttons':
        componentContent = `
          <div class="button-grid">
            <button class="button button-primary">Primary Button</button>
            <button class="button button-secondary">Secondary Button</button>
            <button class="button button-outline">Outline Button</button>
            <button class="button">Default Button</button>
          </div>
        `;
        break;
      
      case 'cards':
        componentContent = `
          <div class="card">
            <h3 class="card-title">Card Title</h3>
            <div class="card-content">
              <p>This is a card component. Cards are used to group related content and actions.</p>
              <button class="button button-primary">Action</button>
            </div>
          </div>
        `;
        break;
      
      case 'forms':
        componentContent = `
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
        `;
        break;
      
      case 'alerts':
        componentContent = `
          <div class="alert alert-info">
            <p>This is an information alert. It provides helpful information to the user.</p>
          </div>
          <div class="alert alert-warning">
            <p>This is a warning alert. It warns the user about potential issues.</p>
          </div>
          <div class="alert alert-error">
            <p>This is an error alert. It indicates that something went wrong.</p>
          </div>
        `;
        break;
      
      case 'tables':
        componentContent = `
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
        `;
        break;
      
      default:
        componentContent = `<p>No content for component: ${component}</p>`;
    }
    
    // Generate full HTML
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${component} - ${theme.name}</title>
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
        ${componentContent}
      </body>
      </html>
    `;
  }
  
  /**
   * Captures a screenshot of an iframe
   * @param {HTMLIFrameElement} frame - The iframe to capture
   * @returns {Promise<HTMLCanvasElement>} - The screenshot canvas
   * @private
   */
  async captureFrame(frame) {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = frame.clientWidth;
        canvas.height = frame.clientHeight;
        
        // Create image from iframe
        const img = new Image();
        img.onload = () => {
          // Draw image to canvas
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };
        
        img.onerror = (error) => {
          reject(new Error('Failed to load iframe content as image'));
        };
        
        // Convert iframe to data URL
        // Note: This is a simplified approach and may not work in all browsers
        // A more robust solution would use html2canvas or similar library
        const doc = frame.contentDocument || frame.contentWindow.document;
        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(doc);
        const blob = new Blob([source], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Compares two screenshots and generates a diff
   * @param {HTMLCanvasElement} baseline - The baseline screenshot
   * @param {HTMLCanvasElement} test - The test screenshot
   * @returns {Promise<Object>} - The diff result
   * @private
   */
  async compareScreenshots(baseline, test) {
    return new Promise((resolve, reject) => {
      try {
        // Create diff canvas
        const diffCanvas = document.createElement('canvas');
        const diffCtx = diffCanvas.getContext('2d');
        
        // Set canvas dimensions
        diffCanvas.width = baseline.width;
        diffCanvas.height = baseline.height;
        
        // Get image data
        const baselineCtx = baseline.getContext('2d');
        const testCtx = test.getContext('2d');
        
        const baselineData = baselineCtx.getImageData(0, 0, baseline.width, baseline.height);
        const testData = testCtx.getImageData(0, 0, test.width, test.height);
        
        const baselinePixels = baselineData.data;
        const testPixels = testData.data;
        
        // Create diff image data
        const diffData = diffCtx.createImageData(baseline.width, baseline.height);
        const diffPixels = diffData.data;
        
        // Compare pixels
        let diffCount = 0;
        const totalPixels = baseline.width * baseline.height;
        
        for (let i = 0; i < baselinePixels.length; i += 4) {
          // Get pixel values
          const baselineR = baselinePixels[i];
          const baselineG = baselinePixels[i + 1];
          const baselineB = baselinePixels[i + 2];
          const baselineA = baselinePixels[i + 3];
          
          const testR = testPixels[i];
          const testG = testPixels[i + 1];
          const testB = testPixels[i + 2];
          const testA = testPixels[i + 3];
          
          // Calculate difference
          const diffR = Math.abs(baselineR - testR);
          const diffG = Math.abs(baselineG - testG);
          const diffB = Math.abs(baselineB - testB);
          const diffA = Math.abs(baselineA - testA);
          
          // Check if pixels are different
          const isDifferent = diffR > 0 || diffG > 0 || diffB > 0 || diffA > 0;
          
          if (isDifferent) {
            // Highlight difference in red
            diffPixels[i] = 255;     // R
            diffPixels[i + 1] = 0;   // G
            diffPixels[i + 2] = 0;   // B
            diffPixels[i + 3] = 255; // A
            
            diffCount++;
          } else {
            // Use original pixel
            diffPixels[i] = baselineR;
            diffPixels[i + 1] = baselineG;
            diffPixels[i + 2] = baselineB;
            diffPixels[i + 3] = baselineA;
          }
        }
        
        // Put diff image data to canvas
        diffCtx.putImageData(diffData, 0, 0);
        
        // Calculate diff score (percentage of different pixels)
        const diffScore = (diffCount / totalPixels) * 100;
        
        resolve({
          diffCanvas,
          diffScore,
          diffPixels: diffCount,
          totalPixels
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Displays the test results
   * @param {Object} baselineTheme - The baseline theme
   * @param {Object} testTheme - The test theme
   * @private
   */
  displayResults(baselineTheme, testTheme) {
    // Clear content
    this.content.innerHTML = '';
    this.resultsContainer.innerHTML = '';
    
    // Create results header
    const resultsHeader = document.createElement('h3');
    resultsHeader.textContent = 'Visual Regression Test Results';
    this.resultsContainer.appendChild(resultsHeader);
    
    // Create results description
    const resultsDescription = document.createElement('p');
    resultsDescription.innerHTML = `Comparing <strong>${baselineTheme.name}</strong> (baseline) with <strong>${testTheme.name}</strong> (test)`;
    this.resultsContainer.appendChild(resultsDescription);
    
    // Display summary
    this.displaySummary();
    
    // Display individual results
    for (const result of this.testResults) {
      this.displayResultItem(result);
    }
  }
  
  /**
   * Displays the test summary
   * @private
   */
  displaySummary() {
    const summary = this.generateSummary();
    
    // Create summary container
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'visual-regression-test-summary';
    
    // Create summary header
    const summaryHeader = document.createElement('h3');
    summaryHeader.textContent = 'Summary';
    summaryContainer.appendChild(summaryHeader);
    
    // Create stats container
    const statsContainer = document.createElement('div');
    statsContainer.className = 'visual-regression-test-summary-stats';
    
    // Create pass stat
    const passStat = document.createElement('div');
    passStat.className = 'visual-regression-test-summary-stat pass';
    
    const passValue = document.createElement('div');
    passValue.className = 'visual-regression-test-summary-stat-value';
    passValue.textContent = summary.pass;
    
    const passLabel = document.createElement('div');
    passLabel.className = 'visual-regression-test-summary-stat-label';
    passLabel.textContent = 'Pass';
    
    passStat.appendChild(passValue);
    passStat.appendChild(passLabel);
    
    // Create warn stat
    const warnStat = document.createElement('div');
    warnStat.className = 'visual-regression-test-summary-stat warn';
    
    const warnValue = document.createElement('div');
    warnValue.className = 'visual-regression-test-summary-stat-value';
    warnValue.textContent = summary.warn;
    
    const warnLabel = document.createElement('div');
    warnLabel.className = 'visual-regression-test-summary-stat-label';
    warnLabel.textContent = 'Warning';
    
    warnStat.appendChild(warnValue);
    warnStat.appendChild(warnLabel);
    
    // Create fail stat
    const failStat = document.createElement('div');
    failStat.className = 'visual-regression-test-summary-stat fail';
    
    const failValue = document.createElement('div');
    failValue.className = 'visual-regression-test-summary-stat-value';
    failValue.textContent = summary.fail;
    
    const failLabel = document.createElement('div');
    failLabel.className = 'visual-regression-test-summary-stat-label';
    failLabel.textContent = 'Fail';
    
    failStat.appendChild(failValue);
    failStat.appendChild(failLabel);
    
    statsContainer.appendChild(passStat);
    statsContainer.appendChild(warnStat);
    statsContainer.appendChild(failStat);
    
    summaryContainer.appendChild(statsContainer);
    
    // Create average diff score
    const avgDiffScore = document.createElement('p');
    avgDiffScore.innerHTML = `Average difference: <strong>${summary.averageDiffScore.toFixed(2)}%</strong>`;
    summaryContainer.appendChild(avgDiffScore);
    
    // Add to results container
    this.resultsContainer.appendChild(summaryContainer);
  }
  
  /**
   * Generates a summary of the test results
   * @returns {Object} - The summary
   * @private
   */
  generateSummary() {
    let pass = 0;
    let warn = 0;
    let fail = 0;
    let totalDiffScore = 0;
    
    for (const result of this.testResults) {
      if (result.diffScore < 1) {
        pass++;
      } else if (result.diffScore < 5) {
        warn++;
      } else {
        fail++;
      }
      
      totalDiffScore += result.diffScore;
    }
    
    const averageDiffScore = totalDiffScore / this.testResults.length;
    
    return {
      pass,
      warn,
      fail,
      total: this.testResults.length,
      averageDiffScore
    };
  }
  
  /**
   * Displays a single result item
   * @param {Object} result - The result to display
   * @private
   */
  displayResultItem(result) {
    // Create result item container
    const resultItem = document.createElement('div');
    resultItem.className = 'visual-regression-test-result-item';
    
    // Create result header
    const resultHeader = document.createElement('div');
    resultHeader.className = 'visual-regression-test-result-header';
    resultHeader.textContent = `${result.component} - ${result.viewport.name} (${result.viewport.width}x${result.viewport.height})`;
    resultItem.appendChild(resultHeader);
    
    // Create result content
    const resultContent = document.createElement('div');
    resultContent.className = 'visual-regression-test-result-content';
    
    // Create baseline image container
    const baselineContainer = document.createElement('div');
    baselineContainer.className = 'visual-regression-test-result-image';
    
    const baselineHeader = document.createElement('div');
    baselineHeader.className = 'visual-regression-test-result-image-header';
    baselineHeader.textContent = 'Baseline';
    baselineContainer.appendChild(baselineHeader);
    
    // Convert canvas to image
    const baselineImg = document.createElement('img');
    baselineImg.src = result.baselineScreenshot.toDataURL();
    baselineContainer.appendChild(baselineImg);
    
    // Create test image container
    const testContainer = document.createElement('div');
    testContainer.className = 'visual-regression-test-result-image';
    
    const testHeader = document.createElement('div');
    testHeader.className = 'visual-regression-test-result-image-header';
    testHeader.textContent = 'Test';
    testContainer.appendChild(testHeader);
    
    // Convert canvas to image
    const testImg = document.createElement('img');
    testImg.src = result.testScreenshot.toDataURL();
    testContainer.appendChild(testImg);
    
    // Create diff container
    const diffContainer = document.createElement('div');
    diffContainer.className = 'visual-regression-test-result-diff';
    
    const diffHeader = document.createElement('div');
    diffHeader.className = 'visual-regression-test-result-diff-header';
    
    const diffTitle = document.createElement('span');
    diffTitle.textContent = 'Difference';
    diffHeader.appendChild(diffTitle);
    
    // Create diff score badge
    const diffScore = document.createElement('span');
    diffScore.textContent = `${result.diffScore.toFixed(2)}%`;
    
    // Set score class based on difference
    if (result.diffScore < 1) {
      diffScore.className = 'visual-regression-test-result-diff-score pass';
    } else if (result.diffScore < 5) {
      diffScore.className = 'visual-regression-test-result-diff-score warn';
    } else {
      diffScore.className = 'visual-regression-test-result-diff-score fail';
    }
    
    diffHeader.appendChild(diffScore);
    diffContainer.appendChild(diffHeader);
    
    // Convert diff canvas to image
    const diffImg = document.createElement('img');
    diffImg.src = result.diffCanvas.toDataURL();
    diffContainer.appendChild(diffImg);
    
    // Add to result content
    resultContent.appendChild(baselineContainer);
    resultContent.appendChild(testContainer);
    resultContent.appendChild(diffContainer);
    
    resultItem.appendChild(resultContent);
    
    // Add to results container
    this.resultsContainer.appendChild(resultItem);
  }
  
  /**
   * Exports the test results
   * @private
   */
  exportResults() {
    try {
      // Generate summary
      const summary = this.generateSummary();
      
      // Create export data
      const exportData = {
        timestamp: new Date().toISOString(),
        baselineTheme: this.baselineSelector.value,
        testTheme: this.testSelector.value,
        summary: {
          pass: summary.pass,
          warn: summary.warn,
          fail: summary.fail,
          total: summary.total,
          averageDiffScore: summary.averageDiffScore
        },
        results: this.testResults.map(result => ({
          component: result.component,
          viewport: result.viewport,
          diffScore: result.diffScore,
          diffPixels: result.diffPixels,
          totalPixels: result.totalPixels,
          baselineImage: result.baselineScreenshot.toDataURL(),
          testImage: result.testScreenshot.toDataURL(),
          diffImage: result.diffCanvas.toDataURL()
        }))
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `visual-regression-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('Test results exported successfully');
    } catch (error) {
      console.error('Error exporting test results:', error);
      alert(`Export failed: ${error.message}`);
    }
  }
  
  /**
   * Sets the enabled state of the controls
   * @param {boolean} enabled - Whether the controls should be enabled
   * @private
   */
  setControlsEnabled(enabled) {
    this.baselineSelector.disabled = !enabled;
    this.testSelector.disabled = !enabled;
    this.runTestButton.disabled = !enabled;
  }
  
  /**
   * Destroys the visual regression test utility and cleans up resources
   */
  destroy() {
    // Remove event listeners
    if (this.runTestButton) {
      this.runTestButton.removeEventListener('click', () => {});
    }
    
    if (this.exportButton) {
      this.exportButton.removeEventListener('click', () => {});
    }
    
    // Remove container from DOM
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Clear references
    this.testResults = [];
    this.currentTest = null;
  }
}
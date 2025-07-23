/**
 * TemplateEditor.js
 * A component for creating and editing report templates
 */

class TemplateEditor {
    /**
     * Initialize the template editor
     * @param {Object} options - Configuration options
     * @param {string} options.containerId - ID of the container element
     * @param {TemplateManager} options.templateManager - Instance of TemplateManager
     * @param {TemplateEngine} options.templateEngine - Instance of TemplateEngine
     * @param {Object} options.sampleData - Sample data for template preview
     */
    constructor(options) {
        this.container = document.getElementById(options.containerId);
        if (!this.container) {
            throw new Error(`Container element with ID ${options.containerId} not found`);
        }
        
        this.templateManager = options.templateManager;
        this.templateEngine = options.templateEngine || new TemplateEngine();
        this.sampleData = options.sampleData || {};
        
        this.currentTemplate = {
            id: null,
            name: '',
            description: '',
            content: '',
            category: '',
            tags: [],
            version: '1.0.0',
            author: 'User',
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
        
        this.unsavedChanges = false;
        this.autoSaveInterval = null;
        this.previewDebounceTimeout = null;
        
        this.init();
    }

    /**
     * Initialize the editor UI
     */
    init() {
        this.createEditorUI();
        this.setupEventListeners();
        this.setupAutoSave();
        this.updatePreview();
    }

    /**
     * Create the editor UI elements
     */
    createEditorUI() {
        this.container.innerHTML = '';
        this.container.classList.add('template-editor-container');
        
        // Create the editor layout
        const editorLayout = document.createElement('div');
        editorLayout.className = 'template-editor-layout';
        
        // Create the toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'template-editor-toolbar';
        
        // Create the main editor area
        const editorArea = document.createElement('div');
        editorArea.className = 'template-editor-main';
        
        // Create the sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'template-editor-sidebar';
        
        // Create the preview area
        const previewArea = document.createElement('div');
        previewArea.className = 'template-editor-preview';
        previewArea.id = 'template-preview-container';
        
        // Add elements to the layout
        editorLayout.appendChild(toolbar);
        editorLayout.appendChild(editorArea);
        editorLayout.appendChild(sidebar);
        editorLayout.appendChild(previewArea);
        
        // Add the layout to the container
        this.container.appendChild(editorLayout);
        
        // Populate the toolbar
        this.createToolbar(toolbar);
        
        // Populate the editor area
        this.createEditorArea(editorArea);
        
        // Populate the sidebar
        this.createSidebar(sidebar);
        
        // Add styles
        this.addStyles();
    }

    /**
     * Create the toolbar UI
     * @param {HTMLElement} toolbar - Toolbar container element
     */
    createToolbar(toolbar) {
        // Template name input
        const nameContainer = document.createElement('div');
        nameContainer.className = 'toolbar-item template-name-container';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Template Name:';
        nameLabel.htmlFor = 'template-name-input';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'template-name-input';
        nameInput.className = 'template-name-input';
        nameInput.placeholder = 'Enter template name';
        nameInput.value = this.currentTemplate.name;
        
        nameContainer.appendChild(nameLabel);
        nameContainer.appendChild(nameInput);
        
        // Action buttons
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'toolbar-item template-actions-container';
        
        const newButton = document.createElement('button');
        newButton.className = 'toolbar-button new-button';
        newButton.innerHTML = '<i class="fas fa-file"></i> New';
        newButton.id = 'new-template-button';
        
        const saveButton = document.createElement('button');
        saveButton.className = 'toolbar-button save-button';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save';
        saveButton.id = 'save-template-button';
        
        const exportButton = document.createElement('button');
        exportButton.className = 'toolbar-button export-button';
        exportButton.innerHTML = '<i class="fas fa-download"></i> Export';
        exportButton.id = 'export-template-button';
        
        const importButton = document.createElement('button');
        importButton.className = 'toolbar-button import-button';
        importButton.innerHTML = '<i class="fas fa-upload"></i> Import';
        importButton.id = 'import-template-button';
        
        actionsContainer.appendChild(newButton);
        actionsContainer.appendChild(saveButton);
        actionsContainer.appendChild(exportButton);
        actionsContainer.appendChild(importButton);
        
        // Status indicator
        const statusContainer = document.createElement('div');
        statusContainer.className = 'toolbar-item template-status-container';
        
        const statusIndicator = document.createElement('span');
        statusIndicator.className = 'status-indicator';
        statusIndicator.id = 'template-status-indicator';
        statusIndicator.textContent = 'Ready';
        
        statusContainer.appendChild(statusIndicator);
        
        // Add all elements to the toolbar
        toolbar.appendChild(nameContainer);
        toolbar.appendChild(actionsContainer);
        toolbar.appendChild(statusContainer);
    }

    /**
     * Create the main editor area UI
     * @param {HTMLElement} editorArea - Editor area container element
     */
    createEditorArea(editorArea) {
        // Create the code editor
        const editorContainer = document.createElement('div');
        editorContainer.className = 'code-editor-container';
        
        const editorHeader = document.createElement('div');
        editorHeader.className = 'editor-header';
        editorHeader.textContent = 'Template HTML';
        
        const editorContent = document.createElement('div');
        editorContent.className = 'editor-content';
        
        const codeEditor = document.createElement('textarea');
        codeEditor.id = 'template-code-editor';
        codeEditor.className = 'template-code-editor';
        codeEditor.placeholder = 'Enter your template HTML here...';
        codeEditor.value = this.currentTemplate.content;
        codeEditor.spellcheck = false;
        
        editorContent.appendChild(codeEditor);
        editorContainer.appendChild(editorHeader);
        editorContainer.appendChild(editorContent);
        
        // Create the template helper section
        const helperContainer = document.createElement('div');
        helperContainer.className = 'template-helper-container';
        
        const helperHeader = document.createElement('div');
        helperHeader.className = 'helper-header';
        helperHeader.textContent = 'Template Helpers';
        
        const helperTabs = document.createElement('div');
        helperTabs.className = 'helper-tabs';
        
        const syntaxTab = document.createElement('button');
        syntaxTab.className = 'helper-tab active';
        syntaxTab.textContent = 'Syntax';
        syntaxTab.dataset.tab = 'syntax';
        
        const snippetsTab = document.createElement('button');
        snippetsTab.className = 'helper-tab';
        snippetsTab.textContent = 'Snippets';
        snippetsTab.dataset.tab = 'snippets';
        
        const dataTab = document.createElement('button');
        dataTab.className = 'helper-tab';
        dataTab.textContent = 'Sample Data';
        dataTab.dataset.tab = 'data';
        
        helperTabs.appendChild(syntaxTab);
        helperTabs.appendChild(snippetsTab);
        helperTabs.appendChild(dataTab);
        
        const helperContent = document.createElement('div');
        helperContent.className = 'helper-content';
        
        const syntaxContent = document.createElement('div');
        syntaxContent.className = 'helper-tab-content active';
        syntaxContent.dataset.tab = 'syntax';
        syntaxContent.innerHTML = `
            <h4>Basic Syntax</h4>
            <ul>
                <li><code>{{ variable }}</code> - Output a variable</li>
                <li><code>{{ variable.property }}</code> - Access nested properties</li>
                <li><code>{{#if condition}}...{{/if}}</code> - Conditional block</li>
                <li><code>{{#if condition}}...{{#else}}...{{/if}}</code> - If-else block</li>
                <li><code>{{#each items}}...{{/each}}</code> - Loop through an array</li>
                <li><code>{{> partialName}}</code> - Include a partial template</li>
                <li><code>{{!-- Comment --}}</code> - Add a comment (will be removed)</li>
            </ul>
            
            <h4>Helper Functions</h4>
            <ul>
                <li><code>{{formatDate date 'YYYY-MM-DD'}}</code> - Format a date</li>
                <li><code>{{formatNumber value 2}}</code> - Format a number with 2 decimal places</li>
                <li><code>{{uppercase text}}</code> - Convert text to uppercase</li>
                <li><code>{{lowercase text}}</code> - Convert text to lowercase</li>
                <li><code>{{capitalize text}}</code> - Capitalize first letter</li>
                <li><code>{{add a b}}</code> - Add two numbers</li>
                <li><code>{{subtract a b}}</code> - Subtract b from a</li>
                <li><code>{{multiply a b}}</code> - Multiply two numbers</li>
                <li><code>{{divide a b}}</code> - Divide a by b</li>
            </ul>
            
            <h4>Special Variables in Loops</h4>
            <ul>
                <li><code>{{@index}}</code> - Current index (0-based)</li>
                <li><code>{{@first}}</code> - True if first iteration</li>
                <li><code>{{@last}}</code> - True if last iteration</li>
                <li><code>{{this}}</code> - Current item in the loop</li>
            </ul>
        `;
        
        const snippetsContent = document.createElement('div');
        snippetsContent.className = 'helper-tab-content';
        snippetsContent.dataset.tab = 'snippets';
        
        // Create snippet items
        const snippets = [
            {
                name: 'Table',
                description: 'Basic table with headers and rows',
                code: `<table class="report-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Value</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {{#each items}}
    <tr>
      <td>{{name}}</td>
      <td>{{formatNumber value 2}}</td>
      <td>{{status}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>`
            },
            {
                name: 'Section',
                description: 'Report section with title and content',
                code: `<section class="report-section">
  <h2 class="section-title">{{title}}</h2>
  <div class="section-content">
    {{content}}
  </div>
</section>`
            },
            {
                name: 'Card',
                description: 'Information card with title and body',
                code: `<div class="info-card">
  <div class="card-header">
    <h3 class="card-title">{{title}}</h3>
  </div>
  <div class="card-body">
    {{body}}
  </div>
  {{#if footer}}
  <div class="card-footer">
    {{footer}}
  </div>
  {{/if}}
</div>`
            },
            {
                name: 'List',
                description: 'Unordered list with items',
                code: `<ul class="report-list">
  {{#each items}}
  <li class="list-item{{#if @first}} first{{/if}}{{#if @last}} last{{/if}}">
    {{this}}
  </li>
  {{/each}}
</ul>`
            },
            {
                name: 'Conditional Content',
                description: 'Show different content based on condition',
                code: `{{#if showDetails}}
  <div class="detailed-view">
    <!-- Detailed content here -->
    {{detailedContent}}
  </div>
{{#else}}
  <div class="summary-view">
    <!-- Summary content here -->
    {{summaryContent}}
  </div>
{{/if}}`
            },
            {
                name: 'Metrics',
                description: 'Display key metrics in a grid',
                code: `<div class="metrics-grid">
  {{#each metrics}}
  <div class="metric-card">
    <div class="metric-value">{{formatNumber value 1}}</div>
    <div class="metric-label">{{label}}</div>
    {{#if change}}
    <div class="metric-change {{#if (gt change 0)}}positive{{else}}negative{{/if}}">
      {{#if (gt change 0)}}+{{/if}}{{change}}%
    </div>
    {{/if}}
  </div>
  {{/each}}
</div>`
            }
        ];
        
        snippets.forEach(snippet => {
            const snippetItem = document.createElement('div');
            snippetItem.className = 'snippet-item';
            
            const snippetHeader = document.createElement('div');
            snippetHeader.className = 'snippet-header';
            
            const snippetTitle = document.createElement('h4');
            snippetTitle.className = 'snippet-title';
            snippetTitle.textContent = snippet.name;
            
            const snippetDesc = document.createElement('p');
            snippetDesc.className = 'snippet-description';
            snippetDesc.textContent = snippet.description;
            
            const insertButton = document.createElement('button');
            insertButton.className = 'snippet-insert-button';
            insertButton.textContent = 'Insert';
            insertButton.dataset.snippet = snippet.code;
            
            snippetHeader.appendChild(snippetTitle);
            snippetHeader.appendChild(insertButton);
            
            const snippetCode = document.createElement('pre');
            snippetCode.className = 'snippet-code';
            snippetCode.textContent = snippet.code;
            
            snippetItem.appendChild(snippetHeader);
            snippetItem.appendChild(snippetDesc);
            snippetItem.appendChild(snippetCode);
            
            snippetsContent.appendChild(snippetItem);
        });
        
        const dataContent = document.createElement('div');
        dataContent.className = 'helper-tab-content';
        dataContent.dataset.tab = 'data';
        
        const dataEditor = document.createElement('pre');
        dataEditor.className = 'sample-data-display';
        dataEditor.textContent = JSON.stringify(this.sampleData, null, 2);
        
        const updateDataButton = document.createElement('button');
        updateDataButton.className = 'update-data-button';
        updateDataButton.textContent = 'Update Sample Data';
        updateDataButton.id = 'update-sample-data-button';
        
        dataContent.appendChild(dataEditor);
        dataContent.appendChild(updateDataButton);
        
        helperContent.appendChild(syntaxContent);
        helperContent.appendChild(snippetsContent);
        helperContent.appendChild(dataContent);
        
        helperContainer.appendChild(helperHeader);
        helperContainer.appendChild(helperTabs);
        helperContainer.appendChild(helperContent);
        
        // Add all elements to the editor area
        editorArea.appendChild(editorContainer);
        editorArea.appendChild(helperContainer);
    }

    /**
     * Create the sidebar UI
     * @param {HTMLElement} sidebar - Sidebar container element
     */
    createSidebar(sidebar) {
        // Create the template properties section
        const propertiesContainer = document.createElement('div');
        propertiesContainer.className = 'template-properties-container';
        
        const propertiesHeader = document.createElement('div');
        propertiesHeader.className = 'sidebar-header';
        propertiesHeader.textContent = 'Template Properties';
        
        const propertiesForm = document.createElement('form');
        propertiesForm.className = 'properties-form';
        propertiesForm.id = 'template-properties-form';
        
        // Description field
        const descriptionGroup = document.createElement('div');
        descriptionGroup.className = 'form-group';
        
        const descriptionLabel = document.createElement('label');
        descriptionLabel.htmlFor = 'template-description';
        descriptionLabel.textContent = 'Description:';
        
        const descriptionInput = document.createElement('textarea');
        descriptionInput.id = 'template-description';
        descriptionInput.className = 'form-control';
        descriptionInput.rows = 3;
        descriptionInput.placeholder = 'Enter template description';
        descriptionInput.value = this.currentTemplate.description;
        
        descriptionGroup.appendChild(descriptionLabel);
        descriptionGroup.appendChild(descriptionInput);
        
        // Category field
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'form-group';
        
        const categoryLabel = document.createElement('label');
        categoryLabel.htmlFor = 'template-category';
        categoryLabel.textContent = 'Category:';
        
        const categorySelect = document.createElement('select');
        categorySelect.id = 'template-category';
        categorySelect.className = 'form-control';
        
        const categories = ['Executive', 'Detailed', 'Risk', 'Financial', 'Project', 'Compliance', 'Technical', 'Other'];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            if (this.currentTemplate.category === category.toLowerCase()) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
        
        categoryGroup.appendChild(categoryLabel);
        categoryGroup.appendChild(categorySelect);
        
        // Tags field
        const tagsGroup = document.createElement('div');
        tagsGroup.className = 'form-group';
        
        const tagsLabel = document.createElement('label');
        tagsLabel.htmlFor = 'template-tags';
        tagsLabel.textContent = 'Tags:';
        
        const tagsInput = document.createElement('input');
        tagsInput.id = 'template-tags';
        tagsInput.className = 'form-control';
        tagsInput.placeholder = 'Enter tags separated by commas';
        tagsInput.value = this.currentTemplate.tags.join(', ');
        
        tagsGroup.appendChild(tagsLabel);
        tagsGroup.appendChild(tagsInput);
        
        // Version field
        const versionGroup = document.createElement('div');
        versionGroup.className = 'form-group';
        
        const versionLabel = document.createElement('label');
        versionLabel.htmlFor = 'template-version';
        versionLabel.textContent = 'Version:';
        
        const versionInput = document.createElement('input');
        versionInput.id = 'template-version';
        versionInput.className = 'form-control';
        versionInput.placeholder = 'e.g., 1.0.0';
        versionInput.value = this.currentTemplate.version;
        
        versionGroup.appendChild(versionLabel);
        versionGroup.appendChild(versionInput);
        
        // Author field
        const authorGroup = document.createElement('div');
        authorGroup.className = 'form-group';
        
        const authorLabel = document.createElement('label');
        authorLabel.htmlFor = 'template-author';
        authorLabel.textContent = 'Author:';
        
        const authorInput = document.createElement('input');
        authorInput.id = 'template-author';
        authorInput.className = 'form-control';
        authorInput.placeholder = 'Enter author name';
        authorInput.value = this.currentTemplate.author;
        
        authorGroup.appendChild(authorLabel);
        authorGroup.appendChild(authorInput);
        
        // Add all form groups to the form
        propertiesForm.appendChild(descriptionGroup);
        propertiesForm.appendChild(categoryGroup);
        propertiesForm.appendChild(tagsGroup);
        propertiesForm.appendChild(versionGroup);
        propertiesForm.appendChild(authorGroup);
        
        propertiesContainer.appendChild(propertiesHeader);
        propertiesContainer.appendChild(propertiesForm);
        
        // Create the templates list section
        const templatesContainer = document.createElement('div');
        templatesContainer.className = 'templates-list-container';
        
        const templatesHeader = document.createElement('div');
        templatesHeader.className = 'sidebar-header';
        templatesHeader.textContent = 'My Templates';
        
        const templatesList = document.createElement('div');
        templatesList.className = 'templates-list';
        templatesList.id = 'templates-list';
        
        // We'll populate this list later when templates are loaded
        templatesList.innerHTML = '<div class="loading-templates">Loading templates...</div>';
        
        templatesContainer.appendChild(templatesHeader);
        templatesContainer.appendChild(templatesList);
        
        // Add all sections to the sidebar
        sidebar.appendChild(propertiesContainer);
        sidebar.appendChild(templatesContainer);
    }

    /**
     * Add CSS styles for the editor
     */
    addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .template-editor-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #333;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .template-editor-layout {
                display: grid;
                grid-template-columns: 1fr 300px;
                grid-template-rows: auto 1fr 1fr;
                grid-template-areas:
                    "toolbar toolbar"
                    "editor sidebar"
                    "preview sidebar";
                gap: 15px;
                height: 100%;
                padding: 15px;
            }
            
            .template-editor-toolbar {
                grid-area: toolbar;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #f8f9fa;
                padding: 10px 15px;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .template-editor-main {
                grid-area: editor;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .template-editor-sidebar {
                grid-area: sidebar;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .template-editor-preview {
                grid-area: preview;
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: auto;
                background-color: white;
            }
            
            /* Toolbar styles */
            .toolbar-item {
                display: flex;
                align-items: center;
            }
            
            .template-name-container {
                flex: 1;
            }
            
            .template-name-container label {
                margin-right: 10px;
                font-weight: 500;
            }
            
            .template-name-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .template-actions-container {
                display: flex;
                gap: 10px;
            }
            
            .toolbar-button {
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                background-color: #0066cc;
                color: white;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: background-color 0.2s;
            }
            
            .toolbar-button:hover {
                background-color: #0056b3;
            }
            
            .new-button {
                background-color: #28a745;
            }
            
            .new-button:hover {
                background-color: #218838;
            }
            
            .export-button, .import-button {
                background-color: #6c757d;
            }
            
            .export-button:hover, .import-button:hover {
                background-color: #5a6268;
            }
            
            .status-indicator {
                font-size: 14px;
                color: #6c757d;
            }
            
            /* Editor area styles */
            .code-editor-container {
                display: flex;
                flex-direction: column;
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
                flex: 1;
            }
            
            .editor-header {
                padding: 10px 15px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #ddd;
                font-weight: 500;
            }
            
            .editor-content {
                flex: 1;
                position: relative;
            }
            
            .template-code-editor {
                width: 100%;
                height: 100%;
                min-height: 200px;
                padding: 15px;
                border: none;
                resize: none;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .template-helper-container {
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .helper-header {
                padding: 10px 15px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #ddd;
                font-weight: 500;
            }
            
            .helper-tabs {
                display: flex;
                background-color: #f8f9fa;
                border-bottom: 1px solid #ddd;
            }
            
            .helper-tab {
                padding: 8px 15px;
                border: none;
                background: none;
                cursor: pointer;
                font-size: 14px;
                border-bottom: 2px solid transparent;
            }
            
            .helper-tab.active {
                border-bottom-color: #0066cc;
                color: #0066cc;
                font-weight: 500;
            }
            
            .helper-content {
                padding: 15px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .helper-tab-content {
                display: none;
            }
            
            .helper-tab-content.active {
                display: block;
            }
            
            .helper-tab-content h4 {
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 16px;
            }
            
            .helper-tab-content ul {
                margin: 0;
                padding-left: 20px;
            }
            
            .helper-tab-content li {
                margin-bottom: 5px;
            }
            
            .helper-tab-content code {
                background-color: #f8f9fa;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
            }
            
            .snippet-item {
                margin-bottom: 15px;
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .snippet-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #ddd;
            }
            
            .snippet-title {
                margin: 0;
                font-size: 15px;
            }
            
            .snippet-description {
                margin: 10px;
                font-size: 14px;
                color: #6c757d;
            }
            
            .snippet-code {
                margin: 0;
                padding: 10px;
                background-color: #f8f9fa;
                border-top: 1px solid #ddd;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                overflow-x: auto;
                white-space: pre-wrap;
            }
            
            .snippet-insert-button {
                padding: 5px 10px;
                background-color: #0066cc;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 13px;
            }
            
            .snippet-insert-button:hover {
                background-color: #0056b3;
            }
            
            .sample-data-display {
                margin: 0 0 15px 0;
                padding: 10px;
                background-color: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                overflow-x: auto;
                white-space: pre-wrap;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .update-data-button {
                padding: 8px 12px;
                background-color: #0066cc;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                width: 100%;
            }
            
            .update-data-button:hover {
                background-color: #0056b3;
            }
            
            /* Sidebar styles */
            .sidebar-header {
                padding: 10px 15px;
                background-color: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 4px 4px 0 0;
                font-weight: 500;
            }
            
            .template-properties-container, .templates-list-container {
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .properties-form {
                padding: 15px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                font-size: 14px;
            }
            
            .form-control {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .templates-list {
                max-height: 300px;
                overflow-y: auto;
                padding: 10px;
            }
            
            .template-item {
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .template-item:hover {
                background-color: #f8f9fa;
            }
            
            .template-item.active {
                border-color: #0066cc;
                background-color: #e6f2ff;
            }
            
            .template-item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
            }
            
            .template-item-title {
                font-weight: 500;
                font-size: 15px;
                margin: 0;
            }
            
            .template-item-category {
                font-size: 12px;
                color: white;
                background-color: #6c757d;
                padding: 2px 6px;
                border-radius: 10px;
            }
            
            .template-item-description {
                font-size: 13px;
                color: #6c757d;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .template-item-meta {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #6c757d;
                margin-top: 5px;
            }
            
            .loading-templates {
                padding: 20px;
                text-align: center;
                color: #6c757d;
            }
            
            /* Preview styles */
            .template-preview-container {
                padding: 20px;
            }
        `;
        
        document.head.appendChild(styleElement);
    }

    /**
     * Set up event listeners for the editor UI
     */
    setupEventListeners() {
        // Template name input
        const nameInput = document.getElementById('template-name-input');
        nameInput.addEventListener('input', () => {
            this.currentTemplate.name = nameInput.value;
            this.setUnsavedChanges(true);
        });
        
        // Code editor
        const codeEditor = document.getElementById('template-code-editor');
        codeEditor.addEventListener('input', () => {
            this.currentTemplate.content = codeEditor.value;
            this.setUnsavedChanges(true);
            this.debouncePreviewUpdate();
        });
        
        // Helper tabs
        const helperTabs = document.querySelectorAll('.helper-tab');
        helperTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and content
                document.querySelectorAll('.helper-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.helper-tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                const tabName = tab.dataset.tab;
                document.querySelector(`.helper-tab-content[data-tab="${tabName}"]`).classList.add('active');
            });
        });
        
        // Snippet insert buttons
        const snippetButtons = document.querySelectorAll('.snippet-insert-button');
        snippetButtons.forEach(button => {
            button.addEventListener('click', () => {
                const snippetCode = button.dataset.snippet;
                this.insertCodeAtCursor(snippetCode);
            });
        });
        
        // Update sample data button
        const updateDataButton = document.getElementById('update-sample-data-button');
        updateDataButton.addEventListener('click', () => {
            this.showSampleDataModal();
        });
        
        // Template properties form
        const propertiesForm = document.getElementById('template-properties-form');
        propertiesForm.addEventListener('change', () => {
            this.updateTemplateProperties();
        });
        
        // New template button
        const newButton = document.getElementById('new-template-button');
        newButton.addEventListener('click', () => {
            this.createNewTemplate();
        });
        
        // Save template button
        const saveButton = document.getElementById('save-template-button');
        saveButton.addEventListener('click', () => {
            this.saveTemplate();
        });
        
        // Export template button
        const exportButton = document.getElementById('export-template-button');
        exportButton.addEventListener('click', () => {
            this.exportTemplate();
        });
        
        // Import template button
        const importButton = document.getElementById('import-template-button');
        importButton.addEventListener('click', () => {
            this.importTemplate();
        });
        
        // Load templates list
        this.loadTemplatesList();
    }

    /**
     * Set up auto-save functionality
     */
    setupAutoSave() {
        // Auto-save every 30 seconds if there are unsaved changes
        this.autoSaveInterval = setInterval(() => {
            if (this.unsavedChanges && this.currentTemplate.id) {
                this.saveTemplate(true);
            }
        }, 30000);
    }

    /**
     * Update the template preview with the current template and data
     */
    updatePreview() {
        const previewContainer = document.getElementById('template-preview-container');
        previewContainer.innerHTML = '';
        
        try {
            const renderedHtml = this.templateEngine.render(this.currentTemplate.content, this.sampleData);
            previewContainer.innerHTML = renderedHtml;
            
            // Update status indicator
            this.updateStatus('Preview updated');
        } catch (error) {
            previewContainer.innerHTML = `
                <div class="preview-error">
                    <h3>Error in template:</h3>
                    <pre>${error.message}</pre>
                </div>
            `;
            
            // Update status indicator
            this.updateStatus('Error in template', true);
        }
    }

    /**
     * Debounce the preview update to avoid too frequent updates
     */
    debouncePreviewUpdate() {
        clearTimeout(this.previewDebounceTimeout);
        this.previewDebounceTimeout = setTimeout(() => {
            this.updatePreview();
        }, 500);
    }

    /**
     * Insert code at the current cursor position in the editor
     * @param {string} code - Code to insert
     */
    insertCodeAtCursor(code) {
        const editor = document.getElementById('template-code-editor');
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const text = editor.value;
        
        editor.value = text.substring(0, start) + code + text.substring(end);
        editor.selectionStart = start + code.length;
        editor.selectionEnd = start + code.length;
        editor.focus();
        
        // Update the current template content
        this.currentTemplate.content = editor.value;
        this.setUnsavedChanges(true);
        this.debouncePreviewUpdate();
    }

    /**
     * Show a modal to update the sample data
     */
    showSampleDataModal() {
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'sample-data-modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'sample-data-modal-content';
        
        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'sample-data-modal-header';
        
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Edit Sample Data';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'sample-data-modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // Create modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'sample-data-modal-body';
        
        const dataTextarea = document.createElement('textarea');
        dataTextarea.className = 'sample-data-textarea';
        dataTextarea.value = JSON.stringify(this.sampleData, null, 2);
        
        modalBody.appendChild(dataTextarea);
        
        // Create modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'sample-data-modal-footer';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'sample-data-modal-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        const saveButton = document.createElement('button');
        saveButton.className = 'sample-data-modal-button save';
        saveButton.textContent = 'Update Data';
        saveButton.addEventListener('click', () => {
            try {
                const newData = JSON.parse(dataTextarea.value);
                this.sampleData = newData;
                
                // Update the sample data display
                const dataDisplay = document.querySelector('.sample-data-display');
                dataDisplay.textContent = JSON.stringify(this.sampleData, null, 2);
                
                // Update the preview
                this.updatePreview();
                
                // Close the modal
                document.body.removeChild(modal);
                
                // Update status
                this.updateStatus('Sample data updated');
            } catch (error) {
                alert(`Invalid JSON: ${error.message}`);
            }
        });
        
        modalFooter.appendChild(cancelButton);
        modalFooter.appendChild(saveButton);
        
        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);
        
        // Add modal styles
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            .sample-data-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .sample-data-modal-content {
                background-color: white;
                border-radius: 4px;
                width: 80%;
                max-width: 800px;
                max-height: 90%;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .sample-data-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #ddd;
            }
            
            .sample-data-modal-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .sample-data-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6c757d;
            }
            
            .sample-data-modal-body {
                padding: 15px;
                overflow-y: auto;
                flex: 1;
            }
            
            .sample-data-textarea {
                width: 100%;
                height: 300px;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                resize: vertical;
            }
            
            .sample-data-modal-footer {
                padding: 15px;
                border-top: 1px solid #ddd;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .sample-data-modal-button {
                padding: 8px 15px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
            }
            
            .sample-data-modal-button.cancel {
                background-color: #6c757d;
                color: white;
            }
            
            .sample-data-modal-button.save {
                background-color: #0066cc;
                color: white;
            }
        `;
        
        document.head.appendChild(modalStyle);
        
        // Add modal to the document
        document.body.appendChild(modal);
        
        // Focus the textarea
        dataTextarea.focus();
    }

    /**
     * Update the template properties from the form
     */
    updateTemplateProperties() {
        const description = document.getElementById('template-description').value;
        const category = document.getElementById('template-category').value;
        const tags = document.getElementById('template-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const version = document.getElementById('template-version').value;
        const author = document.getElementById('template-author').value;
        
        this.currentTemplate.description = description;
        this.currentTemplate.category = category;
        this.currentTemplate.tags = tags;
        this.currentTemplate.version = version;
        this.currentTemplate.author = author;
        
        this.setUnsavedChanges(true);
    }

    /**
     * Create a new template
     */
    createNewTemplate() {
        // Check for unsaved changes
        if (this.unsavedChanges) {
            const confirmCreate = confirm('You have unsaved changes. Create a new template anyway?');
            if (!confirmCreate) return;
        }
        
        // Reset the current template
        this.currentTemplate = {
            id: null,
            name: 'New Template',
            description: '',
            content: '',
            category: 'other',
            tags: [],
            version: '1.0.0',
            author: 'User',
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
        
        // Update the UI
        document.getElementById('template-name-input').value = this.currentTemplate.name;
        document.getElementById('template-code-editor').value = this.currentTemplate.content;
        document.getElementById('template-description').value = this.currentTemplate.description;
        document.getElementById('template-category').value = this.currentTemplate.category;
        document.getElementById('template-tags').value = this.currentTemplate.tags.join(', ');
        document.getElementById('template-version').value = this.currentTemplate.version;
        document.getElementById('template-author').value = this.currentTemplate.author;
        
        // Update the preview
        this.updatePreview();
        
        // Reset unsaved changes flag
        this.setUnsavedChanges(false);
        
        // Update status
        this.updateStatus('New template created');
    }

    /**
     * Save the current template
     * @param {boolean} autoSave - Whether this is an auto-save operation
     */
    async saveTemplate(autoSave = false) {
        // Validate the template
        if (!this.currentTemplate.name) {
            alert('Please enter a template name');
            document.getElementById('template-name-input').focus();
            return;
        }
        
        try {
            // If this is a new template, generate an ID
            if (!this.currentTemplate.id) {
                this.currentTemplate.id = 'tpl_' + Date.now();
                this.currentTemplate.created = new Date().toISOString();
            }
            
            // Update the modified timestamp
            this.currentTemplate.modified = new Date().toISOString();
            
            // Save the template using the template manager
            await this.templateManager.saveTemplate(this.currentTemplate);
            
            // Reset unsaved changes flag
            this.setUnsavedChanges(false);
            
            // Reload the templates list
            this.loadTemplatesList();
            
            // Update status
            if (!autoSave) {
                this.updateStatus(`Template "${this.currentTemplate.name}" saved`);
            } else {
                this.updateStatus('Auto-saved');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert(`Error saving template: ${error.message}`);
        }
    }

    /**
     * Export the current template as a JSON file
     */
    exportTemplate() {
        // Create a copy of the template without the id
        const exportTemplate = { ...this.currentTemplate };
        
        // Convert to JSON
        const templateJson = JSON.stringify(exportTemplate, null, 2);
        
        // Create a blob and download link
        const blob = new Blob([templateJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentTemplate.name.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        // Update status
        this.updateStatus(`Template "${this.currentTemplate.name}" exported`);
    }

    /**
     * Import a template from a JSON file
     */
    importTemplate() {
        // Check for unsaved changes
        if (this.unsavedChanges) {
            const confirmImport = confirm('You have unsaved changes. Import a template anyway?');
            if (!confirmImport) return;
        }
        
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedTemplate = JSON.parse(e.target.result);
                    
                    // Validate the imported template
                    if (!importedTemplate.name || !importedTemplate.content) {
                        throw new Error('Invalid template format');
                    }
                    
                    // Create a new template ID
                    importedTemplate.id = null;
                    importedTemplate.created = new Date().toISOString();
                    importedTemplate.modified = new Date().toISOString();
                    
                    // Set as current template
                    this.currentTemplate = importedTemplate;
                    
                    // Update the UI
                    document.getElementById('template-name-input').value = this.currentTemplate.name;
                    document.getElementById('template-code-editor').value = this.currentTemplate.content;
                    document.getElementById('template-description').value = this.currentTemplate.description || '';
                    document.getElementById('template-category').value = this.currentTemplate.category || 'other';
                    document.getElementById('template-tags').value = (this.currentTemplate.tags || []).join(', ');
                    document.getElementById('template-version').value = this.currentTemplate.version || '1.0.0';
                    document.getElementById('template-author').value = this.currentTemplate.author || 'User';
                    
                    // Update the preview
                    this.updatePreview();
                    
                    // Reset unsaved changes flag
                    this.setUnsavedChanges(true);
                    
                    // Update status
                    this.updateStatus(`Template "${this.currentTemplate.name}" imported`);
                } catch (error) {
                    console.error('Error importing template:', error);
                    alert(`Error importing template: ${error.message}`);
                }
            };
            
            reader.readAsText(file);
        });
        
        // Trigger the file input
        fileInput.click();
    }

    /**
     * Load the list of templates from the template manager
     */
    async loadTemplatesList() {
        try {
            const templates = await this.templateManager.getTemplates();
            
            const templatesList = document.getElementById('templates-list');
            templatesList.innerHTML = '';
            
            if (templates.length === 0) {
                templatesList.innerHTML = '<div class="no-templates">No templates found</div>';
                return;
            }
            
            // Sort templates by modified date (newest first)
            templates.sort((a, b) => new Date(b.modified) - new Date(a.modified));
            
            // Create template items
            templates.forEach(template => {
                const templateItem = document.createElement('div');
                templateItem.className = 'template-item';
                if (this.currentTemplate.id === template.id) {
                    templateItem.classList.add('active');
                }
                templateItem.dataset.id = template.id;
                
                const itemHeader = document.createElement('div');
                itemHeader.className = 'template-item-header';
                
                const itemTitle = document.createElement('h4');
                itemTitle.className = 'template-item-title';
                itemTitle.textContent = template.name;
                
                const itemCategory = document.createElement('span');
                itemCategory.className = 'template-item-category';
                itemCategory.textContent = template.category || 'other';
                
                itemHeader.appendChild(itemTitle);
                itemHeader.appendChild(itemCategory);
                
                const itemDescription = document.createElement('p');
                itemDescription.className = 'template-item-description';
                itemDescription.textContent = template.description || 'No description';
                
                const itemMeta = document.createElement('div');
                itemMeta.className = 'template-item-meta';
                
                const itemVersion = document.createElement('span');
                itemVersion.className = 'template-item-version';
                itemVersion.textContent = `v${template.version || '1.0.0'}`;
                
                const itemDate = document.createElement('span');
                itemDate.className = 'template-item-date';
                const modifiedDate = new Date(template.modified);
                itemDate.textContent = modifiedDate.toLocaleDateString();
                
                itemMeta.appendChild(itemVersion);
                itemMeta.appendChild(itemDate);
                
                templateItem.appendChild(itemHeader);
                templateItem.appendChild(itemDescription);
                templateItem.appendChild(itemMeta);
                
                // Add click event to load the template
                templateItem.addEventListener('click', () => {
                    this.loadTemplate(template.id);
                });
                
                templatesList.appendChild(templateItem);
            });
        } catch (error) {
            console.error('Error loading templates:', error);
            const templatesList = document.getElementById('templates-list');
            templatesList.innerHTML = `<div class="templates-error">Error loading templates: ${error.message}</div>`;
        }
    }

    /**
     * Load a template by ID
     * @param {string} templateId - Template ID to load
     */
    async loadTemplate(templateId) {
        // Check for unsaved changes
        if (this.unsavedChanges) {
            const confirmLoad = confirm('You have unsaved changes. Load another template anyway?');
            if (!confirmLoad) return;
        }
        
        try {
            const template = await this.templateManager.getTemplate(templateId);
            
            // Set as current template
            this.currentTemplate = template;
            
            // Update the UI
            document.getElementById('template-name-input').value = this.currentTemplate.name;
            document.getElementById('template-code-editor').value = this.currentTemplate.content;
            document.getElementById('template-description').value = this.currentTemplate.description || '';
            document.getElementById('template-category').value = this.currentTemplate.category || 'other';
            document.getElementById('template-tags').value = (this.currentTemplate.tags || []).join(', ');
            document.getElementById('template-version').value = this.currentTemplate.version || '1.0.0';
            document.getElementById('template-author').value = this.currentTemplate.author || 'User';
            
            // Update the active template in the list
            document.querySelectorAll('.template-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.id === templateId) {
                    item.classList.add('active');
                }
            });
            
            // Update the preview
            this.updatePreview();
            
            // Reset unsaved changes flag
            this.setUnsavedChanges(false);
            
            // Update status
            this.updateStatus(`Template "${this.currentTemplate.name}" loaded`);
        } catch (error) {
            console.error('Error loading template:', error);
            alert(`Error loading template: ${error.message}`);
        }
    }

    /**
     * Set the unsaved changes flag and update the status indicator
     * @param {boolean} hasChanges - Whether there are unsaved changes
     */
    setUnsavedChanges(hasChanges) {
        this.unsavedChanges = hasChanges;
        
        const statusIndicator = document.getElementById('template-status-indicator');
        if (hasChanges) {
            statusIndicator.textContent = 'Unsaved changes';
            statusIndicator.classList.add('unsaved');
        } else {
            statusIndicator.textContent = 'Saved';
            statusIndicator.classList.remove('unsaved');
        }
    }

    /**
     * Update the status indicator with a message
     * @param {string} message - Status message
     * @param {boolean} isError - Whether this is an error message
     */
    updateStatus(message, isError = false) {
        const statusIndicator = document.getElementById('template-status-indicator');
        statusIndicator.textContent = message;
        
        if (isError) {
            statusIndicator.classList.add('error');
        } else {
            statusIndicator.classList.remove('error');
        }
        
        // Reset the status after a delay
        setTimeout(() => {
            if (this.unsavedChanges) {
                statusIndicator.textContent = 'Unsaved changes';
                statusIndicator.classList.add('unsaved');
                statusIndicator.classList.remove('error');
            } else {
                statusIndicator.textContent = 'Saved';
                statusIndicator.classList.remove('unsaved');
                statusIndicator.classList.remove('error');
            }
        }, 3000);
    }

    /**
     * Clean up resources when the editor is destroyed
     */
    destroy() {
        // Clear the auto-save interval
        clearInterval(this.autoSaveInterval);
        
        // Clear the preview debounce timeout
        clearTimeout(this.previewDebounceTimeout);
        
        // Remove event listeners (if needed)
        
        // Clear the container
        this.container.innerHTML = '';
    }
}
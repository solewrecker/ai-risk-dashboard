/**
 * TemplateImportExport.js
 * Utility for importing and exporting report templates
 */

class TemplateImportExport {
    /**
     * Initialize the template import/export utility
     * @param {Object} options - Configuration options
     * @param {TemplateManager} options.templateManager - Instance of TemplateManager
     * @param {TemplateValidator} options.templateValidator - Instance of TemplateValidator (optional)
     */
    constructor(options = {}) {
        this.templateManager = options.templateManager;
        if (!this.templateManager) {
            throw new Error('TemplateManager is required');
        }
        
        this.templateValidator = options.templateValidator || null;
        this.supportedFormats = ['json', 'html', 'zip'];
    }

    /**
     * Export a template to a specific format
     * @param {string|Object} templateIdOrObject - Template ID or template object
     * @param {string} format - Export format ('json', 'html', or 'zip')
     * @returns {Promise<Blob>} Blob containing the exported template
     */
    async exportTemplate(templateIdOrObject, format = 'json') {
        // Validate format
        if (!this.supportedFormats.includes(format)) {
            throw new Error(`Unsupported export format: ${format}. Supported formats: ${this.supportedFormats.join(', ')}`);
        }
        
        // Get the template
        let template;
        if (typeof templateIdOrObject === 'string') {
            template = await this.templateManager.getTemplate(templateIdOrObject);
        } else {
            template = templateIdOrObject;
        }
        
        if (!template) {
            throw new Error('Template not found');
        }
        
        // Export based on format
        switch (format) {
            case 'json':
                return this.exportAsJson(template);
            case 'html':
                return this.exportAsHtml(template);
            case 'zip':
                return this.exportAsZip(template);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export multiple templates as a package
     * @param {Array<string>} templateIds - Array of template IDs to export
     * @param {string} format - Export format ('json', 'zip')
     * @returns {Promise<Blob>} Blob containing the exported templates
     */
    async exportTemplates(templateIds, format = 'zip') {
        // Validate format
        if (!['json', 'zip'].includes(format)) {
            throw new Error(`Unsupported export format for multiple templates: ${format}. Supported formats: json, zip`);
        }
        
        // Get all templates
        const templates = [];
        for (const id of templateIds) {
            try {
                const template = await this.templateManager.getTemplate(id);
                if (template) {
                    templates.push(template);
                }
            } catch (error) {
                console.warn(`Failed to load template ${id}:`, error);
            }
        }
        
        if (templates.length === 0) {
            throw new Error('No templates found to export');
        }
        
        // Export based on format
        switch (format) {
            case 'json':
                return this.exportMultipleAsJson(templates);
            case 'zip':
                return this.exportMultipleAsZip(templates);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export all templates
     * @param {string} format - Export format ('json', 'zip')
     * @returns {Promise<Blob>} Blob containing all exported templates
     */
    async exportAllTemplates(format = 'zip') {
        const templates = await this.templateManager.getTemplates();
        if (templates.length === 0) {
            throw new Error('No templates found to export');
        }
        
        const templateIds = templates.map(template => template.id);
        return this.exportTemplates(templateIds, format);
    }

    /**
     * Export a template as JSON
     * @param {Object} template - Template object
     * @returns {Blob} Blob containing the JSON
     */
    exportAsJson(template) {
        // Create a copy of the template to avoid modifying the original
        const exportTemplate = { ...template };
        
        // Add export metadata
        exportTemplate.exportMetadata = {
            exportDate: new Date().toISOString(),
            exportFormat: 'json',
            exportVersion: '1.0'
        };
        
        // Convert to JSON
        const json = JSON.stringify(exportTemplate, null, 2);
        
        // Create a blob
        return new Blob([json], { type: 'application/json' });
    }

    /**
     * Export multiple templates as a single JSON file
     * @param {Array<Object>} templates - Array of template objects
     * @returns {Blob} Blob containing the JSON
     */
    exportMultipleAsJson(templates) {
        // Create export package
        const exportPackage = {
            templates,
            metadata: {
                exportDate: new Date().toISOString(),
                exportFormat: 'json',
                exportVersion: '1.0',
                templateCount: templates.length
            }
        };
        
        // Convert to JSON
        const json = JSON.stringify(exportPackage, null, 2);
        
        // Create a blob
        return new Blob([json], { type: 'application/json' });
    }

    /**
     * Export a template as HTML
     * @param {Object} template - Template object
     * @returns {Blob} Blob containing the HTML
     */
    exportAsHtml(template) {
        // Create HTML document with template content and metadata
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name} - Template</title>
    <meta name="template-id" content="${template.id || ''}">
    <meta name="template-version" content="${template.version || '1.0.0'}">
    <meta name="template-author" content="${template.author || ''}">
    <meta name="template-created" content="${template.created || ''}">
    <meta name="template-modified" content="${template.modified || ''}">
    <meta name="template-category" content="${template.category || ''}">
    <meta name="template-tags" content="${(template.tags || []).join(',')}">
    <meta name="template-description" content="${template.description || ''}">
    <meta name="export-date" content="${new Date().toISOString()}">
    <meta name="export-format" content="html">
    <meta name="export-version" content="1.0">
    <style>
        /* Basic styles for preview */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .template-metadata {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .template-metadata h2 {
            margin-top: 0;
        }
        .template-metadata dl {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 10px;
        }
        .template-metadata dt {
            font-weight: bold;
        }
        .template-content {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        .template-source {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            white-space: pre-wrap;
            font-family: monospace;
            overflow-x: auto;
        }
        .template-source-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .template-source-toggle {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="template-metadata">
        <h2>Template: ${template.name}</h2>
        <dl>
            <dt>ID:</dt>
            <dd>${template.id || 'N/A'}</dd>
            
            <dt>Version:</dt>
            <dd>${template.version || '1.0.0'}</dd>
            
            <dt>Author:</dt>
            <dd>${template.author || 'N/A'}</dd>
            
            <dt>Category:</dt>
            <dd>${template.category || 'N/A'}</dd>
            
            <dt>Tags:</dt>
            <dd>${(template.tags || []).join(', ') || 'N/A'}</dd>
            
            <dt>Created:</dt>
            <dd>${template.created ? new Date(template.created).toLocaleString() : 'N/A'}</dd>
            
            <dt>Modified:</dt>
            <dd>${template.modified ? new Date(template.modified).toLocaleString() : 'N/A'}</dd>
            
            <dt>Description:</dt>
            <dd>${template.description || 'No description provided'}</dd>
        </dl>
    </div>
    
    <h3>Template Preview:</h3>
    <div class="template-content">
        ${template.content || ''}
    </div>
    
    <div class="template-source-header">
        <h3>Template Source:</h3>
        <button class="template-source-toggle" onclick="toggleSource()">Show Source</button>
    </div>
    <pre class="template-source hidden" id="template-source">${this.escapeHtml(template.content || '')}</pre>
    
    <script>
        // Function to toggle source visibility
        function toggleSource() {
            const source = document.getElementById('template-source');
            const button = document.querySelector('.template-source-toggle');
            if (source.classList.contains('hidden')) {
                source.classList.remove('hidden');
                button.textContent = 'Hide Source';
            } else {
                source.classList.add('hidden');
                button.textContent = 'Show Source';
            }
        }
        
        // Template data for import
        window.templateData = ${JSON.stringify(template)};
    </script>
</body>
</html>`;
        
        // Create a blob
        return new Blob([html], { type: 'text/html' });
    }

    /**
     * Export a template as a ZIP file
     * @param {Object} template - Template object
     * @returns {Promise<Blob>} Promise resolving to a Blob containing the ZIP
     */
    async exportAsZip(template) {
        // Check if JSZip is available
        if (typeof JSZip !== 'function') {
            throw new Error('JSZip library is required for ZIP export. Please include JSZip in your project.');
        }
        
        // Create a new ZIP file
        const zip = new JSZip();
        
        // Add template JSON
        const templateJson = JSON.stringify(template, null, 2);
        zip.file('template.json', templateJson);
        
        // Add template HTML content
        zip.file('template.html', template.content || '');
        
        // Add README
        const readme = this.generateReadme(template);
        zip.file('README.md', readme);
        
        // Add metadata
        const metadata = {
            exportDate: new Date().toISOString(),
            exportFormat: 'zip',
            exportVersion: '1.0',
            template: {
                id: template.id,
                name: template.name,
                version: template.version,
                author: template.author
            }
        };
        zip.file('metadata.json', JSON.stringify(metadata, null, 2));
        
        // Generate the ZIP file
        return await zip.generateAsync({ type: 'blob' });
    }

    /**
     * Export multiple templates as a ZIP file
     * @param {Array<Object>} templates - Array of template objects
     * @returns {Promise<Blob>} Promise resolving to a Blob containing the ZIP
     */
    async exportMultipleAsZip(templates) {
        // Check if JSZip is available
        if (typeof JSZip !== 'function') {
            throw new Error('JSZip library is required for ZIP export. Please include JSZip in your project.');
        }
        
        // Create a new ZIP file
        const zip = new JSZip();
        
        // Add index file with template listing
        const indexContent = this.generateTemplateIndex(templates);
        zip.file('index.html', indexContent);
        
        // Add each template to its own folder
        for (const template of templates) {
            const folderName = this.sanitizeFilename(template.name);
            const folder = zip.folder(folderName);
            
            // Add template JSON
            folder.file('template.json', JSON.stringify(template, null, 2));
            
            // Add template HTML content
            folder.file('template.html', template.content || '');
            
            // Add README
            const readme = this.generateReadme(template);
            folder.file('README.md', readme);
        }
        
        // Add package metadata
        const metadata = {
            exportDate: new Date().toISOString(),
            exportFormat: 'zip',
            exportVersion: '1.0',
            templateCount: templates.length,
            templates: templates.map(t => ({
                id: t.id,
                name: t.name,
                version: t.version,
                author: t.author
            }))
        };
        zip.file('metadata.json', JSON.stringify(metadata, null, 2));
        
        // Generate the ZIP file
        return await zip.generateAsync({ type: 'blob' });
    }

    /**
     * Generate a README file for a template
     * @param {Object} template - Template object
     * @returns {string} README content
     */
    generateReadme(template) {
        return `# ${template.name}

${template.description || 'No description provided.'}

## Template Information

- **ID:** ${template.id || 'N/A'}
- **Version:** ${template.version || '1.0.0'}
- **Author:** ${template.author || 'N/A'}
- **Category:** ${template.category || 'N/A'}
- **Tags:** ${(template.tags || []).join(', ') || 'N/A'}
- **Created:** ${template.created ? new Date(template.created).toLocaleString() : 'N/A'}
- **Modified:** ${template.modified ? new Date(template.modified).toLocaleString() : 'N/A'}

## Usage

This template can be imported into the Report System using the Template Import feature.

## Files

- **template.json**: The complete template data in JSON format
- **template.html**: The template HTML content
- **README.md**: This file

## Export Information

- **Export Date:** ${new Date().toLocaleString()}
- **Export Format:** ZIP
- **Export Version:** 1.0
`;
    }

    /**
     * Generate an HTML index file for a template package
     * @param {Array<Object>} templates - Array of template objects
     * @returns {string} HTML content
     */
    generateTemplateIndex(templates) {
        let templateListHtml = '';
        
        templates.forEach(template => {
            const folderName = this.sanitizeFilename(template.name);
            templateListHtml += `
                <div class="template-card">
                    <h3 class="template-name">${template.name}</h3>
                    <div class="template-meta">
                        <span class="template-version">v${template.version || '1.0.0'}</span>
                        <span class="template-category">${template.category || 'N/A'}</span>
                    </div>
                    <p class="template-description">${template.description || 'No description provided.'}</p>
                    <div class="template-tags">
                        ${(template.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="template-links">
                        <a href="${folderName}/template.html" class="template-link">View Template</a>
                        <a href="${folderName}/template.json" class="template-link">View JSON</a>
                        <a href="${folderName}/README.md" class="template-link">View README</a>
                    </div>
                </div>
            `;
        });
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Package</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .package-header {
            margin-bottom: 30px;
            text-align: center;
        }
        .package-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .template-card {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            background-color: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .template-name {
            margin-top: 0;
            margin-bottom: 10px;
            color: #007bff;
        }
        .template-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .template-version {
            background-color: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
        }
        .template-category {
            background-color: #6c757d;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
        }
        .template-description {
            margin-bottom: 15px;
            font-size: 14px;
        }
        .template-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 15px;
        }
        .tag {
            background-color: #e9ecef;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
        }
        .template-links {
            display: flex;
            gap: 10px;
        }
        .template-link {
            display: inline-block;
            padding: 5px 10px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 3px;
            font-size: 14px;
        }
        .template-link:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="package-header">
        <h1>Template Package</h1>
        <p>This package contains ${templates.length} template${templates.length !== 1 ? 's' : ''}.</p>
    </div>
    
    <div class="package-info">
        <h2>Package Information</h2>
        <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Template Count:</strong> ${templates.length}</p>
    </div>
    
    <h2>Templates</h2>
    <div class="template-grid">
        ${templateListHtml}
    </div>
</body>
</html>`;
    }

    /**
     * Import a template from a file
     * @param {File} file - File object to import
     * @param {Object} options - Import options
     * @param {boolean} options.validate - Whether to validate the template before importing
     * @param {boolean} options.overwrite - Whether to overwrite existing templates with the same ID
     * @returns {Promise<Object>} Import result object
     */
    async importTemplate(file, options = {}) {
        const { validate = true, overwrite = false } = options;
        
        // Determine file type
        const fileType = this.getFileType(file);
        
        // Import based on file type
        let importedTemplates = [];
        let errors = [];
        
        try {
            switch (fileType) {
                case 'json':
                    importedTemplates = await this.importFromJson(file);
                    break;
                case 'html':
                    importedTemplates = await this.importFromHtml(file);
                    break;
                case 'zip':
                    importedTemplates = await this.importFromZip(file);
                    break;
                default:
                    throw new Error(`Unsupported file type: ${fileType}`);
            }
            
            // Validate templates if requested
            if (validate && this.templateValidator) {
                importedTemplates = await this.validateImportedTemplates(importedTemplates);
            }
            
            // Save templates
            const savedTemplates = [];
            for (const template of importedTemplates) {
                if (template.error) {
                    errors.push({
                        template: template.template,
                        error: template.error
                    });
                    continue;
                }
                
                try {
                    // Check if template with this ID already exists
                    const existingTemplate = template.template.id ? 
                        await this.templateManager.getTemplate(template.template.id).catch(() => null) : 
                        null;
                    
                    if (existingTemplate && !overwrite) {
                        // Generate a new ID to avoid overwriting
                        template.template.id = null;
                    }
                    
                    // Save the template
                    const savedTemplate = await this.templateManager.saveTemplate(template.template);
                    savedTemplates.push(savedTemplate);
                } catch (error) {
                    errors.push({
                        template: template.template,
                        error: error.message
                    });
                }
            }
            
            return {
                success: savedTemplates.length > 0,
                savedTemplates,
                errors,
                totalImported: importedTemplates.length,
                totalSaved: savedTemplates.length,
                totalErrors: errors.length
            };
        } catch (error) {
            return {
                success: false,
                savedTemplates: [],
                errors: [{ error: error.message }],
                totalImported: 0,
                totalSaved: 0,
                totalErrors: 1
            };
        }
    }

    /**
     * Import templates from a JSON file
     * @param {File} file - JSON file to import
     * @returns {Promise<Array>} Array of template objects with validation status
     */
    async importFromJson(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    
                    // Check if this is a single template or a package
                    if (json.templates && Array.isArray(json.templates)) {
                        // This is a package with multiple templates
                        resolve(json.templates.map(template => ({ template, valid: true })));
                    } else if (json.name && json.content) {
                        // This is a single template
                        resolve([{ template: json, valid: true }]);
                    } else {
                        reject(new Error('Invalid template JSON format'));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse JSON: ${error.message}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Import a template from an HTML file
     * @param {File} file - HTML file to import
     * @returns {Promise<Array>} Array of template objects with validation status
     */
    async importFromHtml(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const html = e.target.result;
                    
                    // Create a temporary DOM element to parse the HTML
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Try to find template data in the script
                    const scriptContent = doc.querySelector('script')?.textContent || '';
                    const templateDataMatch = scriptContent.match(/window\.templateData\s*=\s*(\{[\s\S]*?\});/);
                    
                    if (templateDataMatch && templateDataMatch[1]) {
                        try {
                            const templateData = JSON.parse(templateDataMatch[1]);
                            resolve([{ template: templateData, valid: true }]);
                            return;
                        } catch (error) {
                            // Continue with metadata extraction if JSON parsing fails
                        }
                    }
                    
                    // Extract template data from metadata
                    const template = {
                        name: doc.title.replace(' - Template', '') || 'Imported Template',
                        id: null, // Generate a new ID
                        content: doc.querySelector('.template-content')?.innerHTML || '',
                        description: doc.querySelector('meta[name="template-description"]')?.getAttribute('content') || '',
                        version: doc.querySelector('meta[name="template-version"]')?.getAttribute('content') || '1.0.0',
                        author: doc.querySelector('meta[name="template-author"]')?.getAttribute('content') || '',
                        category: doc.querySelector('meta[name="template-category"]')?.getAttribute('content') || '',
                        tags: doc.querySelector('meta[name="template-tags"]')?.getAttribute('content')?.split(',') || [],
                        created: new Date().toISOString(),
                        modified: new Date().toISOString()
                    };
                    
                    resolve([{ template, valid: true }]);
                } catch (error) {
                    reject(new Error(`Failed to parse HTML: ${error.message}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Import templates from a ZIP file
     * @param {File} file - ZIP file to import
     * @returns {Promise<Array>} Array of template objects with validation status
     */
    async importFromZip(file) {
        // Check if JSZip is available
        if (typeof JSZip !== 'function') {
            throw new Error('JSZip library is required for ZIP import. Please include JSZip in your project.');
        }
        
        try {
            const zip = await JSZip.loadAsync(file);
            const templates = [];
            
            // Check if this is a package with multiple templates
            const metadataFile = zip.file('metadata.json');
            if (metadataFile) {
                const metadataText = await metadataFile.async('text');
                const metadata = JSON.parse(metadataText);
                
                if (metadata.templateCount > 1) {
                    // This is a package with multiple templates in folders
                    for (const folderName in zip.files) {
                        if (folderName.endsWith('/')) {
                            // This is a folder
                            const folder = folderName.slice(0, -1);
                            const templateJsonFile = zip.file(`${folder}/template.json`);
                            
                            if (templateJsonFile) {
                                try {
                                    const templateJsonText = await templateJsonFile.async('text');
                                    const template = JSON.parse(templateJsonText);
                                    templates.push({ template, valid: true });
                                } catch (error) {
                                    console.warn(`Failed to parse template in ${folder}:`, error);
                                }
                            }
                        }
                    }
                } else {
                    // This is a package with a single template
                    const templateJsonFile = zip.file('template.json');
                    if (templateJsonFile) {
                        const templateJsonText = await templateJsonFile.async('text');
                        const template = JSON.parse(templateJsonText);
                        templates.push({ template, valid: true });
                    }
                }
            } else {
                // No metadata file, try to find template.json at the root
                const templateJsonFile = zip.file('template.json');
                if (templateJsonFile) {
                    const templateJsonText = await templateJsonFile.async('text');
                    const template = JSON.parse(templateJsonText);
                    templates.push({ template, valid: true });
                }
            }
            
            if (templates.length === 0) {
                throw new Error('No valid templates found in the ZIP file');
            }
            
            return templates;
        } catch (error) {
            throw new Error(`Failed to import from ZIP: ${error.message}`);
        }
    }

    /**
     * Validate imported templates
     * @param {Array} templates - Array of template objects with validation status
     * @returns {Promise<Array>} Array of validated template objects
     */
    async validateImportedTemplates(templates) {
        if (!this.templateValidator) {
            return templates;
        }
        
        const validatedTemplates = [];
        
        for (const item of templates) {
            if (!item.valid) {
                validatedTemplates.push(item);
                continue;
            }
            
            try {
                const validationResult = this.templateValidator.validateTemplate(item.template);
                
                if (validationResult.isValid) {
                    validatedTemplates.push({
                        template: item.template,
                        valid: true,
                        validationResult
                    });
                } else {
                    validatedTemplates.push({
                        template: item.template,
                        valid: false,
                        error: `Template validation failed: ${validationResult.errorCount} errors, ${validationResult.warningCount} warnings`,
                        validationResult
                    });
                }
            } catch (error) {
                validatedTemplates.push({
                    template: item.template,
                    valid: false,
                    error: `Validation error: ${error.message}`
                });
            }
        }
        
        return validatedTemplates;
    }

    /**
     * Get the file type based on the file extension or content
     * @param {File} file - File object
     * @returns {string} File type ('json', 'html', 'zip', or 'unknown')
     */
    getFileType(file) {
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.json')) {
            return 'json';
        } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
            return 'html';
        } else if (fileName.endsWith('.zip')) {
            return 'zip';
        }
        
        // Check MIME type
        if (file.type === 'application/json') {
            return 'json';
        } else if (file.type === 'text/html') {
            return 'html';
        } else if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
            return 'zip';
        }
        
        return 'unknown';
    }

    /**
     * Sanitize a string for use as a filename
     * @param {string} name - Name to sanitize
     * @returns {string} Sanitized name
     */
    sanitizeFilename(name) {
        return name
            .replace(/[^a-z0-9\-_\s]/gi, '') // Remove invalid characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .toLowerCase();
    }

    /**
     * Escape HTML special characters
     * @param {string} html - HTML string to escape
     * @returns {string} Escaped HTML
     */
    escapeHtml(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Create a UI for importing templates
     * @param {string} containerId - ID of container element
     * @param {Object} options - Import options
     * @param {Function} options.onImportComplete - Callback function when import is complete
     */
    createImportUI(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with ID ${containerId} not found`);
        }
        
        // Create the import UI
        const importUI = document.createElement('div');
        importUI.className = 'template-import-ui';
        
        // Create the header
        const header = document.createElement('div');
        header.className = 'import-header';
        
        const title = document.createElement('h3');
        title.textContent = 'Import Templates';
        
        header.appendChild(title);
        
        // Create the import form
        const form = document.createElement('div');
        form.className = 'import-form';
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'template-import-file';
        fileInput.accept = '.json,.html,.htm,.zip';
        fileInput.multiple = true;
        
        const fileLabel = document.createElement('label');
        fileLabel.htmlFor = 'template-import-file';
        fileLabel.className = 'file-input-label';
        fileLabel.innerHTML = '<i class="fas fa-upload"></i> Choose Files';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.textContent = 'No files selected';
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'import-options';
        
        const validateOption = document.createElement('div');
        validateOption.className = 'import-option';
        
        const validateCheckbox = document.createElement('input');
        validateCheckbox.type = 'checkbox';
        validateCheckbox.id = 'validate-templates';
        validateCheckbox.checked = true;
        
        const validateLabel = document.createElement('label');
        validateLabel.htmlFor = 'validate-templates';
        validateLabel.textContent = 'Validate templates before importing';
        
        validateOption.appendChild(validateCheckbox);
        validateOption.appendChild(validateLabel);
        
        const overwriteOption = document.createElement('div');
        overwriteOption.className = 'import-option';
        
        const overwriteCheckbox = document.createElement('input');
        overwriteCheckbox.type = 'checkbox';
        overwriteCheckbox.id = 'overwrite-templates';
        overwriteCheckbox.checked = false;
        
        const overwriteLabel = document.createElement('label');
        overwriteLabel.htmlFor = 'overwrite-templates';
        overwriteLabel.textContent = 'Overwrite existing templates';
        
        overwriteOption.appendChild(overwriteCheckbox);
        overwriteOption.appendChild(overwriteLabel);
        
        optionsContainer.appendChild(validateOption);
        optionsContainer.appendChild(overwriteOption);
        
        const importButton = document.createElement('button');
        importButton.className = 'import-button';
        importButton.innerHTML = '<i class="fas fa-file-import"></i> Import';
        importButton.disabled = true;
        
        form.appendChild(fileInput);
        form.appendChild(fileLabel);
        form.appendChild(fileInfo);
        form.appendChild(optionsContainer);
        form.appendChild(importButton);
        
        // Create the results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'import-results';
        resultsContainer.style.display = 'none';
        
        // Add all elements to the import UI
        importUI.appendChild(header);
        importUI.appendChild(form);
        importUI.appendChild(resultsContainer);
        
        // Add the import UI to the container
        container.innerHTML = '';
        container.appendChild(importUI);
        
        // Add styles
        this.addImportUIStyles();
        
        // Add event listeners
        fileInput.addEventListener('change', () => {
            const files = fileInput.files;
            if (files.length > 0) {
                fileInfo.textContent = `${files.length} file${files.length !== 1 ? 's' : ''} selected`;
                importButton.disabled = false;
            } else {
                fileInfo.textContent = 'No files selected';
                importButton.disabled = true;
            }
        });
        
        importButton.addEventListener('click', async () => {
            const files = fileInput.files;
            if (files.length === 0) return;
            
            // Show loading state
            importButton.disabled = true;
            importButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
            resultsContainer.innerHTML = '<div class="import-loading">Importing templates...</div>';
            resultsContainer.style.display = 'block';
            
            const importOptions = {
                validate: validateCheckbox.checked,
                overwrite: overwriteCheckbox.checked
            };
            
            const results = [];
            
            // Import each file
            for (let i = 0; i < files.length; i++) {
                try {
                    const result = await this.importTemplate(files[i], importOptions);
                    results.push({
                        fileName: files[i].name,
                        fileType: this.getFileType(files[i]),
                        ...result
                    });
                } catch (error) {
                    results.push({
                        fileName: files[i].name,
                        fileType: this.getFileType(files[i]),
                        success: false,
                        savedTemplates: [],
                        errors: [{ error: error.message }],
                        totalImported: 0,
                        totalSaved: 0,
                        totalErrors: 1
                    });
                }
            }
            
            // Display results
            this.displayImportResults(results, resultsContainer);
            
            // Reset form
            importButton.disabled = false;
            importButton.innerHTML = '<i class="fas fa-file-import"></i> Import';
            fileInput.value = '';
            fileInfo.textContent = 'No files selected';
            
            // Call the callback if provided
            if (typeof options.onImportComplete === 'function') {
                options.onImportComplete(results);
            }
        });
    }

    /**
     * Display import results in the UI
     * @param {Array} results - Array of import result objects
     * @param {HTMLElement} container - Container element for results
     */
    displayImportResults(results, container) {
        // Calculate totals
        const totalFiles = results.length;
        const totalTemplates = results.reduce((sum, result) => sum + result.totalSaved, 0);
        const totalErrors = results.reduce((sum, result) => sum + result.totalErrors, 0);
        
        // Create results HTML
        let html = `
            <div class="import-results-header">
                <h3>Import Results</h3>
                <div class="import-summary">
                    <div class="summary-item">
                        <span class="summary-count">${totalFiles}</span>
                        <span class="summary-label">Files Processed</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-count">${totalTemplates}</span>
                        <span class="summary-label">Templates Imported</span>
                    </div>
                    <div class="summary-item ${totalErrors > 0 ? 'error' : ''}">
                        <span class="summary-count">${totalErrors}</span>
                        <span class="summary-label">Errors</span>
                    </div>
                </div>
            </div>
            <div class="import-results-list">
        `;
        
        // Add each file result
        results.forEach(result => {
            const statusClass = result.success ? 'success' : 'error';
            
            html += `
                <div class="import-result-item ${statusClass}">
                    <div class="result-item-header">
                        <div class="result-file-info">
                            <span class="result-file-name">${result.fileName}</span>
                            <span class="result-file-type">${result.fileType.toUpperCase()}</span>
                        </div>
                        <div class="result-status ${statusClass}">
                            ${result.success ? 'Success' : 'Failed'}
                        </div>
                    </div>
                    <div class="result-item-details">
                        <div class="result-stats">
                            <span class="result-stat">Templates: ${result.totalSaved}/${result.totalImported}</span>
                            <span class="result-stat">Errors: ${result.totalErrors}</span>
                        </div>
            `;
            
            // Add saved templates
            if (result.savedTemplates.length > 0) {
                html += `
                    <div class="result-templates">
                        <h4>Imported Templates</h4>
                        <ul class="templates-list">
                `;
                
                result.savedTemplates.forEach(template => {
                    html += `
                        <li class="template-item">
                            <span class="template-name">${template.name}</span>
                            <span class="template-version">v${template.version || '1.0.0'}</span>
                        </li>
                    `;
                });
                
                html += `
                        </ul>
                    </div>
                `;
            }
            
            // Add errors
            if (result.errors.length > 0) {
                html += `
                    <div class="result-errors">
                        <h4>Errors</h4>
                        <ul class="errors-list">
                `;
                
                result.errors.forEach(error => {
                    html += `
                        <li class="error-item">
                            ${error.template ? `<span class="error-template">${error.template.name || 'Unknown template'}</span>: ` : ''}
                            <span class="error-message">${error.error}</span>
                        </li>
                    `;
                });
                
                html += `
                        </ul>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            <div class="import-results-actions">
                <button class="close-results-button">Close</button>
            </div>
        `;
        
        // Set the HTML
        container.innerHTML = html;
        
        // Add event listener for close button
        const closeButton = container.querySelector('.close-results-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                container.style.display = 'none';
            });
        }
    }

    /**
     * Add CSS styles for the import UI
     */
    addImportUIStyles() {
        // Check if styles are already added
        if (document.getElementById('template-import-styles')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'template-import-styles';
        styleElement.textContent = `
            .template-import-ui {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #333;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .import-header {
                margin-bottom: 20px;
            }
            
            .import-header h3 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
            }
            
            .import-form {
                background-color: #fff;
                padding: 20px;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                margin-bottom: 20px;
            }
            
            .file-input-label {
                display: inline-block;
                padding: 10px 15px;
                background-color: #0066cc;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                margin-bottom: 10px;
            }
            
            .file-input-label:hover {
                background-color: #0056b3;
            }
            
            input[type="file"] {
                display: none;
            }
            
            .file-info {
                margin-bottom: 15px;
                color: #6c757d;
            }
            
            .import-options {
                margin-bottom: 20px;
            }
            
            .import-option {
                margin-bottom: 10px;
            }
            
            .import-option label {
                margin-left: 5px;
            }
            
            .import-button {
                padding: 10px 15px;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .import-button:hover {
                background-color: #218838;
            }
            
            .import-button:disabled {
                background-color: #6c757d;
                cursor: not-allowed;
            }
            
            .import-loading {
                padding: 20px;
                text-align: center;
                color: #6c757d;
            }
            
            .import-results {
                background-color: #fff;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .import-results-header {
                padding: 15px 20px;
                border-bottom: 1px solid #ddd;
            }
            
            .import-results-header h3 {
                margin: 0 0 10px 0;
                font-size: 18px;
                font-weight: 600;
            }
            
            .import-summary {
                display: flex;
                gap: 20px;
            }
            
            .summary-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px 15px;
                background-color: #f8f9fa;
                border-radius: 4px;
            }
            
            .summary-item.error {
                background-color: #f8d7da;
                color: #721c24;
            }
            
            .summary-count {
                font-size: 24px;
                font-weight: 600;
            }
            
            .summary-label {
                font-size: 14px;
                color: #6c757d;
            }
            
            .import-results-list {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .import-result-item {
                padding: 15px 20px;
                border-bottom: 1px solid #ddd;
            }
            
            .import-result-item:last-child {
                border-bottom: none;
            }
            
            .result-item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .result-file-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .result-file-name {
                font-weight: 600;
            }
            
            .result-file-type {
                background-color: #e9ecef;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
            }
            
            .result-status {
                padding: 5px 10px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            .result-status.success {
                background-color: #d4edda;
                color: #155724;
            }
            
            .result-status.error {
                background-color: #f8d7da;
                color: #721c24;
            }
            
            .result-item-details {
                margin-top: 10px;
            }
            
            .result-stats {
                display: flex;
                gap: 15px;
                margin-bottom: 10px;
            }
            
            .result-stat {
                font-size: 14px;
                color: #6c757d;
            }
            
            .result-templates, .result-errors {
                margin-top: 15px;
            }
            
            .result-templates h4, .result-errors h4 {
                margin: 0 0 10px 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .templates-list, .errors-list {
                margin: 0;
                padding: 0;
                list-style: none;
            }
            
            .template-item, .error-item {
                padding: 5px 0;
                border-bottom: 1px solid #eee;
            }
            
            .template-item:last-child, .error-item:last-child {
                border-bottom: none;
            }
            
            .template-name {
                font-weight: 600;
            }
            
            .template-version {
                margin-left: 10px;
                color: #6c757d;
                font-size: 14px;
            }
            
            .error-template {
                font-weight: 600;
            }
            
            .error-message {
                color: #721c24;
            }
            
            .import-results-actions {
                padding: 15px 20px;
                border-top: 1px solid #ddd;
                text-align: right;
            }
            
            .close-results-button {
                padding: 8px 15px;
                background-color: #6c757d;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .close-results-button:hover {
                background-color: #5a6268;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
}
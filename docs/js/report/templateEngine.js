/**
 * TemplateEngine.js
 * Responsible for rendering report templates with data
 */

class TemplateEngine {
    /**
     * Initialize the template engine
     */
    constructor() {
        this.templateCache = {};
        this.helperFunctions = this.registerDefaultHelpers();
        this.partialCache = {};
        this.config = {
            interpolationPattern: /{{\s*([\w\.\[\]"']+)\s*}}/g,
            conditionPattern: /{{\s*#if\s+([\w\.\[\]"']+)\s*}}([\s\S]*?)(?:{{\s*#else\s*}}([\s\S]*?))?{{\s*\/if\s*}}/g,
            loopPattern: /{{\s*#each\s+([\w\.\[\]"']+)\s*}}([\s\S]*?){{\s*\/each\s*}}/g,
            partialPattern: /{{\s*>\s*([\w\.\-]+)\s*}}/g,
            helperPattern: /{{\s*([\w]+)\s+([\s\S]*?)\s*}}/g,
            commentPattern: /{{!--([\s\S]*?)--}}/g,
            escapeHtml: true
        };
    }

    /**
     * Register default helper functions
     * @returns {Object} Object containing helper functions
     */
    registerDefaultHelpers() {
        return {
            // Format date helper
            formatDate: (date, format = 'YYYY-MM-DD') => {
                if (!date) return '';
                const d = new Date(date);
                if (isNaN(d.getTime())) return '';
                
                // Simple date formatter
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                const seconds = String(d.getSeconds()).padStart(2, '0');
                
                return format
                    .replace('YYYY', year)
                    .replace('MM', month)
                    .replace('DD', day)
                    .replace('HH', hours)
                    .replace('mm', minutes)
                    .replace('ss', seconds);
            },
            
            // Number formatting helper
            formatNumber: (num, decimals = 2) => {
                if (num === undefined || num === null) return '';
                return Number(num).toLocaleString(undefined, {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                });
            },
            
            // Conditional helper
            eq: (a, b) => a === b,
            neq: (a, b) => a !== b,
            lt: (a, b) => a < b,
            gt: (a, b) => a > b,
            lte: (a, b) => a <= b,
            gte: (a, b) => a >= b,
            
            // String helpers
            uppercase: (str) => str ? String(str).toUpperCase() : '',
            lowercase: (str) => str ? String(str).toLowerCase() : '',
            capitalize: (str) => {
                if (!str) return '';
                return str.charAt(0).toUpperCase() + str.slice(1);
            },
            
            // Math helpers
            add: (a, b) => Number(a) + Number(b),
            subtract: (a, b) => Number(a) - Number(b),
            multiply: (a, b) => Number(a) * Number(b),
            divide: (a, b) => Number(b) !== 0 ? Number(a) / Number(b) : 0,
            
            // Array helpers
            first: (arr) => Array.isArray(arr) && arr.length > 0 ? arr[0] : null,
            last: (arr) => Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : null,
            length: (arr) => Array.isArray(arr) ? arr.length : 0,
            
            // Utility helpers
            json: (obj) => JSON.stringify(obj),
            concat: (...args) => args.slice(0, -1).join(''),
            slice: (arr, start, end) => Array.isArray(arr) ? arr.slice(start, end) : ''
        };
    }

    /**
     * Register a new helper function
     * @param {string} name - Helper name
     * @param {Function} fn - Helper function
     */
    registerHelper(name, fn) {
        if (typeof fn !== 'function') {
            throw new Error(`Helper ${name} must be a function`);
        }
        this.helperFunctions[name] = fn;
    }

    /**
     * Register a partial template
     * @param {string} name - Partial name
     * @param {string} template - Partial template string
     */
    registerPartial(name, template) {
        this.partialCache[name] = template;
    }

    /**
     * Get a value from the data context using a path expression
     * @param {string} path - Path to the data (e.g., 'user.profile.name')
     * @param {Object} data - Data context
     * @returns {*} Value at the specified path
     */
    getValueFromPath(path, data) {
        if (!path || !data) return undefined;
        
        // Handle array access with bracket notation like items[0].name
        const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
        const parts = normalizedPath.split('.');
        
        let value = data;
        for (const part of parts) {
            if (value === undefined || value === null) return undefined;
            value = value[part];
        }
        
        return value;
    }

    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        if (!str || typeof str !== 'string') return '';
        if (!this.config.escapeHtml) return str;
        
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Process interpolation expressions like {{ variable }}
     * @param {string} template - Template string
     * @param {Object} data - Data context
     * @returns {string} Processed template
     */
    processInterpolation(template, data) {
        return template.replace(this.config.interpolationPattern, (match, path) => {
            const value = this.getValueFromPath(path, data);
            return value !== undefined ? this.escapeHtml(String(value)) : '';
        });
    }

    /**
     * Process conditional expressions like {{#if condition}}...{{/if}}
     * @param {string} template - Template string
     * @param {Object} data - Data context
     * @returns {string} Processed template
     */
    processConditions(template, data) {
        return template.replace(this.config.conditionPattern, (match, path, trueBlock, falseBlock) => {
            const value = this.getValueFromPath(path, data);
            if (value) {
                return this.processTemplate(trueBlock, data);
            } else if (falseBlock) {
                return this.processTemplate(falseBlock, data);
            }
            return '';
        });
    }

    /**
     * Process loop expressions like {{#each items}}...{{/each}}
     * @param {string} template - Template string
     * @param {Object} data - Data context
     * @returns {string} Processed template
     */
    processLoops(template, data) {
        return template.replace(this.config.loopPattern, (match, path, itemTemplate) => {
            const items = this.getValueFromPath(path, data);
            if (!Array.isArray(items) || items.length === 0) return '';
            
            return items.map((item, index) => {
                // Create a context with the item and special variables
                const itemContext = {
                    ...data,
                    this: item,
                    '@index': index,
                    '@first': index === 0,
                    '@last': index === items.length - 1
                };
                
                return this.processTemplate(itemTemplate, itemContext);
            }).join('');
        });
    }

    /**
     * Process partial includes like {{> partialName}}
     * @param {string} template - Template string
     * @param {Object} data - Data context
     * @returns {string} Processed template
     */
    processPartials(template, data) {
        return template.replace(this.config.partialPattern, (match, partialName) => {
            const partial = this.partialCache[partialName];
            if (!partial) return `<!-- Partial ${partialName} not found -->`;
            
            return this.processTemplate(partial, data);
        });
    }

    /**
     * Process helper expressions like {{formatDate date 'YYYY-MM-DD'}}
     * @param {string} template - Template string
     * @param {Object} data - Data context
     * @returns {string} Processed template
     */
    processHelpers(template, data) {
        return template.replace(this.config.helperPattern, (match, helperName, argsStr) => {
            const helper = this.helperFunctions[helperName];
            if (!helper || typeof helper !== 'function') return match;
            
            // Parse arguments - this is a simplified version
            // In a real implementation, you'd want more robust argument parsing
            const args = argsStr.split(/\s+/).map(arg => {
                // Check if it's a string literal
                if ((arg.startsWith('\'') && arg.endsWith('\'')) || 
                    (arg.startsWith('"') && arg.endsWith('"'))) {
                    return arg.slice(1, -1);
                }
                
                // Otherwise treat as a path to data
                return this.getValueFromPath(arg, data);
            });
            
            // Call the helper with the arguments and data context
            try {
                const result = helper.apply(null, [...args, data]);
                return result !== undefined ? this.escapeHtml(String(result)) : '';
            } catch (error) {
                console.error(`Error in helper ${helperName}:`, error);
                return `<!-- Error in helper ${helperName} -->`;
            }
        });
    }

    /**
     * Remove comments from the template
     * @param {string} template - Template string
     * @returns {string} Template without comments
     */
    removeComments(template) {
        return template.replace(this.config.commentPattern, '');
    }

    /**
     * Process a template with the given data
     * @param {string} template - Template string
     * @param {Object} data - Data context
     * @returns {string} Processed template
     */
    processTemplate(template, data) {
        if (!template) return '';
        
        let result = template;
        
        // Process in specific order to handle nested expressions correctly
        result = this.removeComments(result);
        result = this.processPartials(result, data);
        result = this.processConditions(result, data);
        result = this.processLoops(result, data);
        result = this.processHelpers(result, data);
        result = this.processInterpolation(result, data);
        
        return result;
    }

    /**
     * Compile a template for faster repeated rendering
     * @param {string} template - Template string
     * @returns {Function} Compiled template function
     */
    compile(template) {
        // Store the template in cache
        const templateId = 'tpl_' + Math.random().toString(36).substr(2, 9);
        this.templateCache[templateId] = template;
        
        // Return a function that renders this template with provided data
        return (data) => this.render(templateId, data);
    }

    /**
     * Render a template with the given data
     * @param {string} templateIdOrString - Template ID or template string
     * @param {Object} data - Data context
     * @returns {string} Rendered template
     */
    render(templateIdOrString, data = {}) {
        // Check if it's a template ID from cache
        const template = this.templateCache[templateIdOrString] || templateIdOrString;
        return this.processTemplate(template, data);
    }

    /**
     * Clear the template cache
     */
    clearCache() {
        this.templateCache = {};
        this.partialCache = {};
    }

    /**
     * Configure the template engine
     * @param {Object} options - Configuration options
     */
    configure(options = {}) {
        this.config = { ...this.config, ...options };
    }

    /**
     * Create a template from an HTML element
     * @param {string} elementId - ID of the element containing the template
     * @returns {Function} Compiled template function
     */
    compileFromElement(elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Template element with ID ${elementId} not found`);
        }
        
        return this.compile(element.innerHTML);
    }

    /**
     * Load a template from a URL
     * @param {string} url - URL to load the template from
     * @returns {Promise<Function>} Promise resolving to a compiled template function
     */
    async loadTemplate(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load template from ${url}: ${response.statusText}`);
            }
            
            const templateText = await response.text();
            return this.compile(templateText);
        } catch (error) {
            console.error('Error loading template:', error);
            throw error;
        }
    }

    /**
     * Load multiple templates from URLs
     * @param {Object} urlMap - Map of template names to URLs
     * @returns {Promise<Object>} Promise resolving to a map of template names to compiled template functions
     */
    async loadTemplates(urlMap) {
        const templates = {};
        const promises = [];
        
        for (const [name, url] of Object.entries(urlMap)) {
            promises.push(
                this.loadTemplate(url).then(templateFn => {
                    templates[name] = templateFn;
                })
            );
        }
        
        await Promise.all(promises);
        return templates;
    }

    /**
     * Load multiple partials from URLs
     * @param {Object} urlMap - Map of partial names to URLs
     * @returns {Promise<void>} Promise that resolves when all partials are loaded
     */
    async loadPartials(urlMap) {
        const promises = [];
        
        for (const [name, url] of Object.entries(urlMap)) {
            promises.push(
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to load partial from ${url}: ${response.statusText}`);
                        }
                        return response.text();
                    })
                    .then(partialText => {
                        this.registerPartial(name, partialText);
                    })
            );
        }
        
        await Promise.all(promises);
    }

    /**
     * Create a UI for template preview
     * @param {string} containerId - ID of the container element
     * @param {string} templateString - Template string
     * @param {Object} sampleData - Sample data for preview
     * @returns {HTMLElement} The created preview element
     */
    createTemplatePreview(containerId, templateString, sampleData) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with ID ${containerId} not found`);
        }
        
        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'template-preview-container';
        
        // Create tabs for rendered view and source view
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'template-preview-tabs';
        
        const renderedTab = document.createElement('button');
        renderedTab.className = 'template-preview-tab active';
        renderedTab.textContent = 'Rendered View';
        
        const sourceTab = document.createElement('button');
        sourceTab.className = 'template-preview-tab';
        sourceTab.textContent = 'Template Source';
        
        const dataTab = document.createElement('button');
        dataTab.className = 'template-preview-tab';
        dataTab.textContent = 'Sample Data';
        
        tabsContainer.appendChild(renderedTab);
        tabsContainer.appendChild(sourceTab);
        tabsContainer.appendChild(dataTab);
        
        // Create content containers
        const contentContainer = document.createElement('div');
        contentContainer.className = 'template-preview-content';
        
        const renderedContent = document.createElement('div');
        renderedContent.className = 'template-preview-pane active';
        renderedContent.innerHTML = this.render(templateString, sampleData);
        
        const sourceContent = document.createElement('div');
        sourceContent.className = 'template-preview-pane';
        const sourceCodePre = document.createElement('pre');
        sourceCodePre.className = 'template-source-code';
        sourceCodePre.textContent = templateString;
        sourceContent.appendChild(sourceCodePre);
        
        const dataContent = document.createElement('div');
        dataContent.className = 'template-preview-pane';
        const dataCodePre = document.createElement('pre');
        dataCodePre.className = 'template-data-code';
        dataCodePre.textContent = JSON.stringify(sampleData, null, 2);
        dataContent.appendChild(dataCodePre);
        
        contentContainer.appendChild(renderedContent);
        contentContainer.appendChild(sourceContent);
        contentContainer.appendChild(dataContent);
        
        // Add tab switching functionality
        renderedTab.addEventListener('click', () => {
            document.querySelectorAll('.template-preview-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.template-preview-pane').forEach(pane => pane.classList.remove('active'));
            renderedTab.classList.add('active');
            renderedContent.classList.add('active');
        });
        
        sourceTab.addEventListener('click', () => {
            document.querySelectorAll('.template-preview-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.template-preview-pane').forEach(pane => pane.classList.remove('active'));
            sourceTab.classList.add('active');
            sourceContent.classList.add('active');
        });
        
        dataTab.addEventListener('click', () => {
            document.querySelectorAll('.template-preview-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.template-preview-pane').forEach(pane => pane.classList.remove('active'));
            dataTab.classList.add('active');
            dataContent.classList.add('active');
        });
        
        // Add everything to the preview container
        previewContainer.appendChild(tabsContainer);
        previewContainer.appendChild(contentContainer);
        
        // Add some basic styles
        const style = document.createElement('style');
        style.textContent = `
            .template-preview-container {
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
                margin: 20px 0;
                font-family: sans-serif;
            }
            .template-preview-tabs {
                display: flex;
                background-color: #f5f5f5;
                border-bottom: 1px solid #ddd;
            }
            .template-preview-tab {
                padding: 10px 15px;
                border: none;
                background: none;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                border-bottom: 2px solid transparent;
            }
            .template-preview-tab.active {
                border-bottom-color: #0066cc;
                color: #0066cc;
            }
            .template-preview-content {
                position: relative;
                min-height: 200px;
            }
            .template-preview-pane {
                display: none;
                padding: 15px;
            }
            .template-preview-pane.active {
                display: block;
            }
            .template-source-code, .template-data-code {
                margin: 0;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 4px;
                overflow: auto;
                font-family: monospace;
                font-size: 14px;
                line-height: 1.5;
                white-space: pre-wrap;
            }
        `;
        previewContainer.appendChild(style);
        
        // Add to container
        container.appendChild(previewContainer);
        
        return previewContainer;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TemplateEngine };
} else if (typeof window !== 'undefined') {
    window.TemplateEngine = TemplateEngine;
}
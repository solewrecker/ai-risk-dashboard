/**
 * ReportPreview.js
 * 
 * This module handles the rendering of reports using the new theme and template system.
 * It loads data from localStorage or Supabase, applies the selected theme,
 * and renders the report using the template registry.
 */

// Use the global Supabase client initialized in export.html
const supabase = window.supabaseClient;
import Handlebars from 'handlebars';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { createIcons, icons } from 'lucide';

// Import our new modules
import ReportDataAdapter from './data/ReportDataAdapter.js';
import ReportTemplateRegistry from './TemplateRegistry.js';
import MainThemeRegistry from '../ThemeRegistry.js';
import MainThemeLoader from '../ThemeLoader.js';
import ReportPreviewBridge from './report-preview-bridge.js';

class ReportPreview {
  constructor(options = {}) {
    this.dataAdapter = new ReportDataAdapter();
    this.templateRegistry = new ReportTemplateRegistry();
    this.themeRegistry = new MainThemeRegistry();
    this.themeLoader = new MainThemeLoader();
    this.previewBridge = new ReportPreviewBridge();
    
    // Set the base URL for theme files
    this.themeLoader.setBaseUrl('./css/themes/');
    
    // Set the default theme as base theme for fallback
    this.themeRegistry.setBaseTheme('default');
    
    // Initialize the bridge with the theme registry and loader
    this.previewBridge.initialize(this.themeRegistry, this.themeLoader);
    
    // Initialize Handlebars helpers
    this.registerHandlebarsHelpers();
    
    // Store container selector for later use
    this.containerSelector = options.containerSelector || '#report-main';
    
    // Bind methods
    this.init = this.init.bind(this);
    this.renderReport = this.renderReport.bind(this);
    this.createPdf = this.createPdf.bind(this);
    this.createHtml = this.createHtml.bind(this);
  }
  
  /**
   * Register Handlebars helpers for templates
   */
  registerHandlebarsHelpers() {
    Handlebars.registerHelper('toLowerCase', function(str) {
      return str ? str.toLowerCase() : '';
    });

    Handlebars.registerHelper('contains', function(str, substring, options) {
      if (str && str.includes && str.includes(substring)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('eq', function(a, b, options) {
      if (options && options.fn) {
        // Block usage
        if (a === b) {
          return options.fn(this);
        }
        return options.inverse(this);
      }
      // Inline usage
      return a === b;
    });

    Handlebars.registerHelper('gt', function(a, b, options) {
      if (a > b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('JSONstringify', function(data) {
      return JSON.stringify(data, null, 2);
    });

    // Typeof helper
    Handlebars.registerHelper('typeof', function(value) {
      return typeof value;
    });

    // Format date helper
    Handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      try {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString();
      } catch (e) {
        return date;
      }
    });
  }
  
  /**
   * Initialize the report preview
   */
  async init() {
    console.log('ReportPreview initializing...', this.containerSelector);
    
    // Wait a moment for the DOM to be fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to get the container element
    this.reportContentEl = document.querySelector(this.containerSelector);
    console.log('Container element found:', this.reportContentEl);
    
    // If container doesn't exist, try to create it
    if (!this.reportContentEl) {
      console.error(`Report container element not found with selector: ${this.containerSelector}`);
      
      // Try to find the element by ID directly as a fallback
      this.reportContentEl = document.getElementById('report-main');
      console.log('Fallback container element found:', this.reportContentEl);
      
      if (!this.reportContentEl) {
        console.error('Could not find report container element even with fallback');
        
        // Create the container element if it doesn't exist
        console.log('Creating report container element');
        this.reportContentEl = document.createElement('div');
        this.reportContentEl.id = 'report-main';
        this.reportContentEl.style.minHeight = '100px';
        document.body.appendChild(this.reportContentEl);
        console.log('Created report container element:', this.reportContentEl);
      }
    }
    
    // First, try to get data from localStorage (used by the dashboard preview)
    const storedReportData = localStorage.getItem('reportData');

    if (storedReportData) {
      console.log('Found report data in localStorage.');
      let reportData = JSON.parse(storedReportData);
      
      // Process the report data through the bridge to handle theme data
      reportData = this.previewBridge.processReportData(reportData);
      
      // Optional: Clear the data from localStorage after reading it to avoid stale data
      // localStorage.removeItem('reportData'); 
      await this.renderReport(reportData);
      return; // Exit after rendering from localStorage data
    }

    // If no localStorage data, fall back to URL parameter (for direct links)
    console.log('No report data in localStorage, checking URL parameters.');
    const urlParams = new URLSearchParams(window.location.search);
    const assessmentId = urlParams.get('assessmentId');

    if (!assessmentId) {
      if (this.reportContentEl) {
        this.reportContentEl.innerHTML = '<p>No report data found in localStorage and no assessment ID found in URL. Cannot render report.</p>';
      }
      return;
    }

    try {
      console.log(`Fetching report data from Supabase for assessment ID: ${assessmentId}`);
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('No assessment found with the provided ID');

      // Create a minimal report data object
      const reportData = {
        primaryAssessment: data,
        selectedData: [data],
        sectionsToGenerate: ['summary', 'risk_assessment', 'recommendations'],
        selectedTemplate: 'standard',
        selectedTheme: 'theme-corporate'
      };

      await this.renderReport(reportData);
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      this.reportContentEl.innerHTML = `<p>Error loading assessment data: ${error.message}</p>`;
    }
  }
  
  /**
   * Render the report with the given data
   * @param {Object} reportData - The report data
   */
  async renderReport(reportData) {
    // Ensure we have a valid container element
    if (!this.reportContentEl) {
      this.reportContentEl = document.querySelector(this.containerSelector);
      if (!this.reportContentEl) {
        console.error(`Report container element not found with selector: ${this.containerSelector}`);
        return;
      }
    }
    
    const { primaryAssessment, selectedData, sectionsToGenerate, selectedTemplate, selectedTheme, themeData } = reportData;
    
    // Show loading indicator
    this.reportContentEl.innerHTML = '<div class="loader"></div> <p>Loading report...</p>';
    
    try {
      // 1. Transform data using the adapter
      const transformedData = this.dataAdapter.transformData(
        primaryAssessment, 
        selectedData, 
        sectionsToGenerate
      );
      
      // 2. Register the theme if needed and load it
      const themeName = selectedTheme || 'theme-corporate';
      const registeredTheme = this.previewBridge.registerThemeIfNeeded(themeName, themeData);
      await this.previewBridge.loadTheme(registeredTheme);
      
      // Handle different theme activation methods between systems
      // Theme CSS is now loaded statically in HTML head to avoid MIME type issues
      if (this.themeRegistry && typeof this.themeRegistry.switchTheme === 'function') {
        console.log(`ReportPreview: Switching to theme ${registeredTheme} with theme system`);
        this.themeRegistry.switchTheme(registeredTheme, transformedData);
      } else {
        console.log(`ReportPreview: Activating theme ${registeredTheme} with ThemeRegistry`);
        this.themeRegistry.activateTheme(registeredTheme, transformedData);
      }
      
      // 3. Register and render the template
      const template = this.templateRegistry.getTemplate(selectedTemplate || 'standard');
      if (!template) {
        throw new Error(`Template '${selectedTemplate}' not found`);
      }
      
      const compiledTemplate = Handlebars.compile(template);
      const fullReportHtml = compiledTemplate(transformedData);
      
      // 4. Update the DOM
      this.reportContentEl.innerHTML = fullReportHtml;
      
      // 5. Initialize icons and event listeners
      createIcons({ icons });
      
      // Add event listeners for download buttons
      const downloadPdfBtn = document.getElementById('download-pdf');
      if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => this.createPdf());
      }
      
      const downloadHtmlBtn = document.getElementById('download-html');
      if (downloadHtmlBtn) {
        downloadHtmlBtn.addEventListener('click', () => this.createHtml(transformedData, registeredTheme));
      }
    } catch (error) {
      console.error('Error rendering report:', error);
      if (this.reportContentEl) {
        this.reportContentEl.innerHTML = `<p class="text-red-500">Error rendering report: ${error.message}</p>`;
      }
    }
  }
  
  /**
   * Create a PDF from the report
   */
  async createPdf() {
    try {
      // Ensure we have a valid container element
      if (!this.reportContentEl) {
        this.reportContentEl = document.querySelector(this.containerSelector);
        if (!this.reportContentEl) {
          console.error(`Report container element not found with selector: ${this.containerSelector}`);
          alert('Cannot create PDF: Report container not found.');
          return;
        }
      }
      
      const canvas = await html2canvas(this.reportContentEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: true,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('ai-risk-assessment-report.pdf');
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Failed to create PDF. Please check the console for details.');
    }
  }
  
  /**
   * Create an HTML file from the report
   * @param {Object} templateData - The template data
   * @param {string} themeName - The name of the theme
   */
  async createHtml(templateData, themeName) {
    try {
      // Get all CSS files needed for the report
      const cssPromises = [
        fetch('./css/style.css').then(res => res.text()),
        fetch(`./css/themes/${themeName}.css`).then(res => res.text()),
        fetch('./css/themes/base/theme-base.css').then(res => res.text()),
        fetch('./css/themes/theme-base.css').then(res => res.text()),
        fetch('./css/report-error-boundaries.css').then(res => res.text())
      ];

      const cssContents = await Promise.all(cssPromises.map(p => p.catch(e => {
        console.error(e);
        return '';
      })));

      const reportHtml = this.reportContentEl.innerHTML;
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${templateData.name || 'AI Risk Assessment'} Report</title>
            <style>
                ${cssContents.join('\n')}
            </style>
        </head>
        <body>
            <div id="report-container" class="report-container">
                 ${reportHtml}
            </div>
        </body>
        </html>
      `;

      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateData.name || 'ai-risk-assessment'}-report.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating HTML:', error);
      alert('Failed to create HTML. Please check the console for details.');
    }
  }
}

// Initialize the report preview when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const reportPreview = new ReportPreview();
  reportPreview.init();
});

export default ReportPreview;
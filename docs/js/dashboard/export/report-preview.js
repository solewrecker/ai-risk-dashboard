// Import libraries from CDN (already loaded in HTML)
const Handlebars = window.Handlebars;
const jsPDF = window.jspdf.jsPDF;
const html2canvas = window.html2canvas;
const QRCode = window.QRCode;
const { createIcons, icons } = window.lucide;

// Use the global Supabase client initialized in export.html
const supabase = window.supabaseClient;
import { baseTemplate } from './templates.js';
import { prepareTemplateData } from './report-generation.js';
import { ScalableThemeSystem } from './themeSystem.js';


Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('contains', function(str, substring, options) {
    if (str && str.includes && str.includes(substring)) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('eq', function(a, b, options) {
    if (a === b) {
        return options.fn(this);
    }
    return options.inverse(this);
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

console.log('report-preview.js loaded');
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded event fired.');
    const themeSystem = new ScalableThemeSystem();

    // First, try to get data from localStorage (used by the dashboard preview)
    const storedReportData = localStorage.getItem('reportData');

    if (storedReportData) {
        console.log('Found report data in localStorage.');
        const reportData = JSON.parse(storedReportData);
        // Optional: Clear the data from localStorage after reading it to avoid stale data
        // localStorage.removeItem('reportData'); 
        renderReport(reportData, themeSystem);
        return; // Exit after rendering from localStorage data
    }

    // If no localStorage data, fall back to URL parameter (for direct links)
    console.log('No report data in localStorage, checking URL parameters.');
    const urlParams = new URLSearchParams(window.location.search);
    const assessmentId = urlParams.get('assessmentId');

    if (!assessmentId) {
        document.getElementById('report-main').innerHTML = '<p>No report data found in localStorage and no assessment ID found in URL. Cannot render report.</p>';
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

        if (data) {
            const reportData = {
                primaryAssessment: data,
                selectedData: [data],
                sectionsToGenerate: data.sections_to_generate || ['summary-section', 'detailed-breakdown-section', 'recommendations-section'],
                selectedTemplate: data.selected_template || 'premium',
                selectedTheme: data.selected_theme || 'theme-professional'
            };
            renderReport(reportData, themeSystem);
        } else {
            document.getElementById('report-main').innerHTML = `<p>No report data found for the assessment ID: ${assessmentId}.</p>`;
        }
    } catch (error) {
        console.error('Failed to fetch report data from Supabase:', error);
        document.getElementById('report-main').innerHTML = '<p>Error: Could not fetch report data. Please try again.</p>';
    }
});

async function renderReport({ primaryAssessment, selectedData, sectionsToGenerate, selectedTemplate, selectedTheme }, themeSystem) {
    // Debugging: Log the raw data received by the report generator
    console.log('Parsed report data:', { primaryAssessment, selectedData, sectionsToGenerate, selectedTemplate, selectedTheme });
    const reportContentEl = document.getElementById('report-main');
    reportContentEl.innerHTML = '<div class="loader"></div> <p>Loading report...</p>';

    try {
        await themeSystem.switchTheme(selectedTheme || 'theme-professional');
    } catch (error) {
        console.error('Failed to switch theme:', error);
    }

    try {
        const templateData = prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate);
        const template = Handlebars.compile(baseTemplate);
        const fullReportHtml = template(templateData);

        reportContentEl.innerHTML = fullReportHtml;

        createIcons({ icons });

        // Add event listeners for download buttons
        document.getElementById('download-pdf').addEventListener('click', () => createPdf(reportContentEl));
        document.getElementById('download-html').addEventListener('click', () => createHtml(reportContentEl, templateData, selectedTheme));

    } catch (error) {
        console.error('Error rendering report:', error);
        reportContentEl.innerHTML = `<p class="text-red-500">Error rendering report: ${error.message}</p>`;
    }
}


async function createPdf(reportContentEl) {
    const canvas = await html2canvas(reportContentEl, {
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
}

async function createHtml(reportContentEl, templateData, selectedTheme) {
    const themeName = selectedTheme || 'theme-professional';
    const cssPromises = [
        fetch('/css/style.css').then(res => res.text()),
        fetch(`/css/themes/${themeName}.css`).then(res => res.text()),
        fetch('/css/pages/report.css').then(res => res.text()),
        fetch('/css/themes/theme-base.css').then(res => res.text())
    ];

    const cssContents = await Promise.all(cssPromises.map(p => p.catch(e => console.error(e) || '')));

    const reportHtml = reportContentEl.innerHTML;
    const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${templateData.toolName} Report</title>
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
    a.download = `${templateData.toolName}-risk-assessment-report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to dynamically load theme CSS by enabling/disabling stylesheet links


// Function to dynamically update theme CSS using CSS custom properties
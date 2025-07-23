/**
 * Theme Visual Regression Testing Utility
 * 
 * This module provides functionality for automated visual regression testing
 * of report themes. It captures screenshots of reports with different themes,
 * compares them against baseline images, and identifies visual differences.
 */

import html2canvas from '../lib/html2canvas.esm.js';

class ThemeRegressionTest {
    constructor(options = {}) {
        this.options = {
            // Directory to store baseline images
            baselineDir: 'baselines/',
            // Threshold for pixel difference (0-1, where 0 means exact match)
            threshold: 0.1,
            // Elements to test individually
            testElements: [
                { name: 'header', selector: '.report-header' },
                { name: 'risk-score', selector: '.risk-score-section' },
                { name: 'summary', selector: '.summary-section' },
                { name: 'recommendations', selector: '.recommendations-section' },
                { name: 'detailed-analysis', selector: '.detailed-analysis-section' },
                { name: 'footer', selector: '.report-footer' }
            ],
            // Override with user options
            ...options
        };
        
        // Storage for test results
        this.results = [];
        
        // Storage for baseline images
        this.baselineImages = new Map();
        
        // Flag to indicate if baselines are being created
        this.isCreatingBaselines = false;
    }
    
    /**
     * Set the mode to create baseline images
     * @param {boolean} creating - Whether to create baseline images
     */
    setBaselineCreationMode(creating) {
        this.isCreatingBaselines = creating;
    }
    
    /**
     * Load a baseline image for comparison
     * @param {string} themeName - The theme name
     * @param {string} elementName - The element name (or 'full' for full page)
     * @returns {Promise<HTMLImageElement>} - The loaded image
     */
    async loadBaseline(themeName, elementName) {
        const key = `${themeName}-${elementName}`;
        
        if (this.baselineImages.has(key)) {
            return this.baselineImages.get(key);
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.baselineImages.set(key, img);
                resolve(img);
            };
            img.onerror = () => {
                reject(new Error(`Failed to load baseline image for ${key}`));
            };
            img.src = `${this.options.baselineDir}${key}.png`;
        });
    }
    
    /**
     * Save a baseline image
     * @param {string} themeName - The theme name
     * @param {string} elementName - The element name (or 'full' for full page)
     * @param {HTMLCanvasElement} canvas - The canvas containing the image
     */
    saveBaseline(themeName, elementName, canvas) {
        const key = `${themeName}-${elementName}`;
        const dataUrl = canvas.toDataURL('image/png');
        
        // In a real implementation, this would save to the server
        // For this demo, we'll just store in localStorage
        localStorage.setItem(`baseline-${key}`, dataUrl);
        
        // Also store in memory for immediate use
        const img = new Image();
        img.src = dataUrl;
        this.baselineImages.set(key, img);
        
        console.log(`Saved baseline for ${key}`);
    }
    
    /**
     * Run regression tests for a theme
     * @param {string} themeName - The theme to test
     * @param {Document} document - The document containing the report
     * @returns {Promise<Array>} - The test results
     */
    async runTests(themeName, document) {
        this.results = [];
        
        try {
            // Test full page
            await this.testElement(themeName, 'full', document.body, document);
            
            // Test individual elements
            for (const element of this.options.testElements) {
                const el = document.querySelector(element.selector);
                if (el) {
                    await this.testElement(themeName, element.name, el, document);
                } else {
                    this.results.push({
                        themeName,
                        elementName: element.name,
                        status: 'error',
                        message: `Element not found: ${element.selector}`
                    });
                }
            }
            
            return this.results;
        } catch (error) {
            console.error('Error running regression tests:', error);
            return [{
                themeName,
                elementName: 'all',
                status: 'error',
                message: error.message
            }];
        }
    }
    
    /**
     * Test a specific element
     * @param {string} themeName - The theme name
     * @param {string} elementName - The element name
     * @param {HTMLElement} element - The element to test
     * @param {Document} document - The document containing the element
     */
    async testElement(themeName, elementName, element, document) {
        try {
            // Capture screenshot of the element
            const canvas = await html2canvas(element);
            
            // If creating baselines, save and return
            if (this.isCreatingBaselines) {
                this.saveBaseline(themeName, elementName, canvas);
                this.results.push({
                    themeName,
                    elementName,
                    status: 'baseline_created',
                    message: 'Baseline image created successfully'
                });
                return;
            }
            
            // Load baseline for comparison
            try {
                const baseline = await this.loadBaseline(themeName, elementName);
                
                // Compare images
                const differences = this.compareImages(canvas, baseline);
                
                if (differences.percentDifference <= this.options.threshold) {
                    // Test passed
                    this.results.push({
                        themeName,
                        elementName,
                        status: 'passed',
                        message: `Difference: ${(differences.percentDifference * 100).toFixed(2)}%`,
                        differences
                    });
                } else {
                    // Test failed
                    this.results.push({
                        themeName,
                        elementName,
                        status: 'failed',
                        message: `Difference: ${(differences.percentDifference * 100).toFixed(2)}%`,
                        differences,
                        currentImage: canvas.toDataURL(),
                        baselineImage: baseline.src
                    });
                }
            } catch (error) {
                // Baseline doesn't exist
                this.results.push({
                    themeName,
                    elementName,
                    status: 'no_baseline',
                    message: 'No baseline image found for comparison',
                    currentImage: canvas.toDataURL()
                });
            }
        } catch (error) {
            this.results.push({
                themeName,
                elementName,
                status: 'error',
                message: `Error capturing screenshot: ${error.message}`
            });
        }
    }
    
    /**
     * Compare two images and calculate differences
     * @param {HTMLCanvasElement} currentCanvas - The current image canvas
     * @param {HTMLImageElement} baselineImage - The baseline image
     * @returns {Object} - Difference metrics
     */
    compareImages(currentCanvas, baselineImage) {
        // Create a new canvas for the baseline image
        const baselineCanvas = document.createElement('canvas');
        baselineCanvas.width = baselineImage.width;
        baselineCanvas.height = baselineImage.height;
        const baselineCtx = baselineCanvas.getContext('2d');
        baselineCtx.drawImage(baselineImage, 0, 0);
        
        // Create a new canvas for the difference image
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = Math.max(currentCanvas.width, baselineCanvas.width);
        diffCanvas.height = Math.max(currentCanvas.height, baselineCanvas.height);
        const diffCtx = diffCanvas.getContext('2d');
        
        // Get image data
        const currentData = currentCanvas.getContext('2d').getImageData(
            0, 0, currentCanvas.width, currentCanvas.height
        );
        const baselineData = baselineCtx.getImageData(
            0, 0, baselineCanvas.width, baselineCanvas.height
        );
        const diffData = diffCtx.createImageData(diffCanvas.width, diffCanvas.height);
        
        // Calculate differences
        let diffPixels = 0;
        const totalPixels = diffCanvas.width * diffCanvas.height;
        
        // For simplicity, we'll just compare the dimensions first
        if (currentCanvas.width !== baselineCanvas.width || 
            currentCanvas.height !== baselineCanvas.height) {
            // Size difference - mark all pixels as different
            for (let i = 0; i < diffData.data.length; i += 4) {
                diffData.data[i] = 255;     // R
                diffData.data[i + 1] = 0;   // G
                diffData.data[i + 2] = 0;   // B
                diffData.data[i + 3] = 255; // A
            }
            diffPixels = totalPixels;
        } else {
            // Compare pixel by pixel
            for (let i = 0; i < currentData.data.length; i += 4) {
                // Get pixel values
                const r1 = currentData.data[i];
                const g1 = currentData.data[i + 1];
                const b1 = currentData.data[i + 2];
                const a1 = currentData.data[i + 3];
                
                const r2 = baselineData.data[i];
                const g2 = baselineData.data[i + 1];
                const b2 = baselineData.data[i + 2];
                const a2 = baselineData.data[i + 3];
                
                // Calculate difference
                const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + 
                             Math.abs(b1 - b2) + Math.abs(a1 - a2);
                
                if (diff > 0) {
                    // Highlight difference in red
                    diffData.data[i] = 255;     // R
                    diffData.data[i + 1] = 0;   // G
                    diffData.data[i + 2] = 0;   // B
                    diffData.data[i + 3] = 255; // A
                    diffPixels++;
                } else {
                    // Copy original pixel
                    diffData.data[i] = r1;
                    diffData.data[i + 1] = g1;
                    diffData.data[i + 2] = b1;
                    diffData.data[i + 3] = a1;
                }
            }
        }
        
        // Put the diff image data back to the canvas
        diffCtx.putImageData(diffData, 0, 0);
        
        return {
            percentDifference: diffPixels / totalPixels,
            diffPixels,
            totalPixels,
            diffImage: diffCanvas.toDataURL()
        };
    }
    
    /**
     * Generate a report of the test results
     * @returns {HTMLElement} - The report element
     */
    generateReport() {
        const reportContainer = document.createElement('div');
        reportContainer.className = 'regression-test-report';
        
        // Create summary
        const summary = document.createElement('div');
        summary.className = 'regression-test-summary';
        
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.status === 'passed').length;
        const failedTests = this.results.filter(r => r.status === 'failed').length;
        const errorTests = this.results.filter(r => r.status === 'error').length;
        const noBaselineTests = this.results.filter(r => r.status === 'no_baseline').length;
        const baselineCreatedTests = this.results.filter(r => r.status === 'baseline_created').length;
        
        summary.innerHTML = `
            <h3>Test Summary</h3>
            <div class="summary-stats">
                <div class="stat">Total Tests: ${totalTests}</div>
                <div class="stat passed">Passed: ${passedTests}</div>
                <div class="stat failed">Failed: ${failedTests}</div>
                <div class="stat error">Errors: ${errorTests}</div>
                <div class="stat warning">No Baseline: ${noBaselineTests}</div>
                <div class="stat info">Baselines Created: ${baselineCreatedTests}</div>
            </div>
        `;
        
        reportContainer.appendChild(summary);
        
        // Create detailed results
        const details = document.createElement('div');
        details.className = 'regression-test-details';
        details.innerHTML = '<h3>Test Details</h3>';
        
        this.results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = `test-result ${result.status}`;
            
            let resultContent = `
                <div class="result-header">
                    <h4>${result.themeName} - ${result.elementName}</h4>
                    <span class="result-status ${result.status}">${result.status}</span>
                </div>
                <div class="result-message">${result.message}</div>
            `;
            
            // Add images for visual comparison if available
            if (result.status === 'failed') {
                resultContent += `
                    <div class="result-images">
                        <div class="image-container">
                            <h5>Current</h5>
                            <img src="${result.currentImage}" alt="Current Image">
                        </div>
                        <div class="image-container">
                            <h5>Baseline</h5>
                            <img src="${result.baselineImage}" alt="Baseline Image">
                        </div>
                        <div class="image-container">
                            <h5>Difference</h5>
                            <img src="${result.differences.diffImage}" alt="Difference Image">
                        </div>
                    </div>
                `;
            } else if (result.status === 'no_baseline' || result.status === 'baseline_created') {
                resultContent += `
                    <div class="result-images">
                        <div class="image-container">
                            <h5>Current</h5>
                            <img src="${result.currentImage}" alt="Current Image">
                        </div>
                    </div>
                `;
            }
            
            resultItem.innerHTML = resultContent;
            details.appendChild(resultItem);
        });
        
        reportContainer.appendChild(details);
        
        return reportContainer;
    }
}

export default ThemeRegressionTest;
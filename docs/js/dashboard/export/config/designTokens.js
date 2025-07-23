export const designTokens = {
    layouts: {
        'single': { columns: '1fr', areas: '"header" "content"' },
        'two-col': { columns: '2fr 1fr', areas: '"header header" "content sidebar"' },
        'three-col': { columns: '1fr 2fr 1fr', areas: '"nav header actions" "nav content sidebar"' }
    },
    
    colorSchemes: {
        'corporate': { primary: '#003366', secondary: '#0066cc', bg: '#f8f9fa' },
        'minimal': { primary: '#333', secondary: '#666', bg: '#fff' },
        'vibrant': { primary: '#e91e63', secondary: '#9c27b0', bg: '#fafafa' },
        'dark': { primary: '#bb86fc', secondary: '#03dac6', bg: '#121212' }
    },
    
    densities: {
        'compact': { spacing: '0.5rem', fontSize: '0.875rem', lineHeight: '1.25' },
        'normal': { spacing: '1rem', fontSize: '1rem', lineHeight: '1.5' },
        'spacious': { spacing: '1.5rem', fontSize: '1.125rem', lineHeight: '1.75' }
    },
    
    components: {
        'minimal': { maxRows: 5, showCharts: false, showDetails: false },
        'standard': { maxRows: 20, showCharts: true, showDetails: true },
        'comprehensive': { maxRows: -1, showCharts: true, showDetails: true, showAll: true }
    }
};
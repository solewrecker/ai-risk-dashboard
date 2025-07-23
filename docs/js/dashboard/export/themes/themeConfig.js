export const themes = {
    'theme-professional': {
        layout: 'single',
        colorScheme: 'corporate',
        density: 'normal',
        components: 'standard',
        customRules: {
            '.report-container': {
                'font-family': '"Arial", sans-serif'
            },
            '.report-header': {
                'background-color': '#f2f2f2',
                'border-bottom': '2px solid #ccc',
                padding: '20px',
                'text-align': 'center'
            },
            '.report-header h1': {
                color: '#333'
            }
        }
    },
    'theme-dark': {
        layout: 'single',
        colorScheme: 'dark',
        density: 'normal',
        components: 'standard',
        customRules: {
            '.report-container': {
                'background-color': '#1a1a1a',
                color: '#f2f2f2',
                'font-family': '"Arial", sans-serif'
            },
            '.report-header': {
                'background-color': '#2d3748',
                'border-bottom': '2px solid #4a5568',
                padding: '20px',
                'text-align': 'center'
            },
            '.report-header h1': {
                color: '#f2f2f2'
            }
        }
    }
};
# Report System Documentation

## Overview

This directory contains the new report generation system for the AI Tool Risk Framework. The system is designed to be modular, extensible, and theme-able, allowing for easy customization of report appearance and content.

## Directory Structure

```
report/
├── data/
│   └── ReportDataAdapter.js     # Transforms and validates assessment data
├── templates/
│   ├── TemplateRegistry.js      # Manages report templates
│   └── standard-template.js      # Standard report template
├── themes/
│   ├── ThemeRegistry.js         # Manages theme registration and activation
│   └── ThemeLoader.js           # Handles dynamic loading of theme CSS files
├── ReportPreview.js             # Main class for rendering reports
├── test-data.js                 # Sample data for testing
└── README.md                    # This documentation file
```

## CSS Structure

```
css/themes/
├── base/
│   └── theme-base.css           # Base styles for all themes
├── layouts/
│   ├── single-layout.css        # Single column layout
│   ├── two-col-layout.css       # Two column layout
│   └── three-col-layout.css     # Three column layout
├── color-schemes/
│   ├── corporate-colors.css     # Corporate color scheme
│   ├── minimal-colors.css       # Minimal color scheme
│   ├── dark-colors.css          # Dark color scheme
│   └── vibrant-colors.css       # Vibrant color scheme
├── theme-corporate.css          # Corporate theme (imports base, layout, colors)
├── theme-minimal.css            # Minimal theme
├── theme-dark.css               # Dark theme
└── theme-vibrant.css            # Vibrant theme
```

## Key Components

### ReportDataAdapter

Responsible for transforming and validating assessment data from Supabase into a standardized format for report templates.

```javascript
// Example usage
const adapter = new ReportDataAdapter();
const transformedData = adapter.transformData(primaryAssessment, selectedData);
```

### TemplateRegistry

Manages the registration and rendering of report templates.

```javascript
// Example usage
const registry = new TemplateRegistry();
const renderedHtml = registry.renderTemplate('standard', data);
```

### ThemeRegistry

Manages the registration and activation of report themes.

```javascript
// Example usage
const registry = new ThemeRegistry();
registry.activateTheme('theme-corporate', data);
```

### ThemeLoader

Handles the dynamic loading of theme CSS files.

```javascript
// Example usage
const loader = new ThemeLoader();
loader.setBaseUrl('./css/themes/');
await loader.loadTheme('theme-corporate');
```

### ReportPreview

Main class for rendering reports. Integrates with all the above components.

```javascript
// Example usage
const preview = new ReportPreview();
await preview.initialize();
```

## Adding New Themes

To add a new theme:

1. Create a new color scheme CSS file in `css/themes/color-schemes/`
2. Create a new main theme CSS file in `css/themes/` that imports the base, a layout, and your color scheme
3. Add the theme to the HTML file's stylesheet links

## Adding New Templates

To add a new template:

1. Create a new template JS file in `js/report/templates/`
2. Import and register the template in `TemplateRegistry.js`

## Testing

Use the `report-test.html` page to test the report system with sample data. This page allows you to switch between different themes and see the changes in real-time.

## Integration

The report system is integrated into the main application via the `report-preview.html` page, which loads data from either localStorage or Supabase and renders the report accordingly.
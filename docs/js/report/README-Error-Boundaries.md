# Report Error Boundary System

## Overview

The Error Boundary System provides a robust way to handle errors that occur during report template rendering. Instead of failing completely when an error occurs, the system gracefully degrades by displaying informative error messages while allowing the rest of the report to render correctly.

## Key Components

### 1. ErrorBoundaryTemplates.js

This class provides HTML templates for different types of error boundaries that can be used in the report rendering system.

```javascript
// Example usage
import ErrorBoundaryTemplates from './ErrorBoundaryTemplates.js';

// Display a template not found error
const errorHtml = ErrorBoundaryTemplates.templateNotFound('Template not found', 'Please check template registration');
```

Available error boundary types:

- `templateNotFound`: Used when a requested template doesn't exist
- `sectionRenderError`: Used when a specific section of a template fails to render
- `criticalRenderError`: Used for critical errors that prevent the entire template from rendering
- `dataValidationError`: Used when data validation fails for a template
- `fallbackContent`: Used to display fallback content when the original content can't be rendered

### 2. CSS Styling (report-error-boundaries.css)

Provides visual styling for the error boundaries, with different styles for different error types.

```css
/* Example classes */
.report-error-boundary { /* Base styles */ }
.report-error-boundary--template-not-found { /* Template not found specific styles */ }
.report-error-boundary--section-render-error { /* Section error specific styles */ }
.report-error-boundary--critical-render-error { /* Critical error specific styles */ }
.report-error-boundary--fallback-render-error { /* Fallback content specific styles */ }
```

### 3. TemplateRegistry Integration

The `TemplateRegistry` class has been updated to use error boundaries when rendering templates:

- `renderErrorBoundary`: Renders an appropriate error boundary based on the error type
- `renderWithErrorBoundaries`: Attempts to render a template with error boundaries around problematic sections
- `validateDataForTemplate`: Validates data against the expected schema for a template
- `applyFallbackData`: Applies fallback data for missing or invalid fields

## How to Use

### Basic Usage in TemplateRegistry

The error boundary system is automatically used by the `TemplateRegistry` class. When you call `renderTemplate`, any errors that occur will be handled gracefully:

```javascript
const registry = new TemplateRegistry();
const renderedHtml = registry.renderTemplate('standard', data);
// If an error occurs, the rendered HTML will include appropriate error boundaries
```

### Manual Usage

You can also use the error boundary system manually in your own code:

```javascript
import ErrorBoundaryTemplates from './ErrorBoundaryTemplates.js';

try {
  // Attempt to render something
  return renderSomething();
} catch (error) {
  // If an error occurs, display an error boundary
  return ErrorBoundaryTemplates.criticalRenderError(error.message);
}
```

### Testing Error Boundaries

A test page is available at `/report-error-test.html` that demonstrates all the different types of error boundaries.

## Best Practices

1. **Use Specific Error Types**: Choose the most appropriate error boundary type for each situation to provide the most helpful information to users.

2. **Provide Helpful Messages**: Include specific error messages that help users understand what went wrong and how to fix it.

3. **Apply Fallback Data**: When data validation fails, try to apply fallback data instead of failing completely.

4. **Section-Level Error Handling**: When possible, isolate errors to specific sections rather than failing the entire template.

5. **Log Errors**: Always log errors to the console for debugging purposes, even when displaying error boundaries to users.

## Implementation Example

```javascript
// Example of implementing section-level error handling
try {
  // Try to render the entire template
  return template(data);
} catch (error) {
  // If that fails, try to render each section separately
  let html = '';
  
  for (const section of sections) {
    try {
      html += renderSection(section, data);
    } catch (sectionError) {
      html += ErrorBoundaryTemplates.sectionRenderError(
        section.name,
        sectionError.message
      );
    }
  }
  
  return html;
}
```

## Future Improvements

- Add support for custom error boundary templates
- Implement more granular error handling for nested components
- Add error tracking and reporting to help identify common template issues
- Enhance fallback data generation with AI-assisted content
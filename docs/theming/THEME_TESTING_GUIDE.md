# Theme Testing Guide

## Overview

This guide explains how to use the theme testing tools to develop, test, and validate themes for the AI Tool Risk Framework report system. The theme testing environment includes two main tools:

1. **Theme Comparison Tool** - For side-by-side visual comparison of different themes
2. **Visual Regression Testing Tool** - For automated testing of themes against baseline images

## Theme Comparison Tool

The Theme Comparison Tool allows you to visually compare two different themes side-by-side to identify differences in styling, layout, and overall appearance.

### How to Use

1. Navigate to `theme-comparison.html` in your browser
2. Select the themes you want to compare from the dropdown menus
3. Click "Compare Themes" to load both themes
4. Use the tabs to switch between different comparison modes:
   - **Side-by-Side View** - View both themes simultaneously
   - **Visual Diff** - Generate visual difference highlights
   - **Element Comparison** - Compare specific elements across themes

### Features

- **Side-by-Side Comparison** - View two themes simultaneously for direct visual comparison
- **Screenshot Capture** - Take screenshots of each theme for comparison
- **Visual Diff Generation** - Highlight visual differences between themes
- **Element-by-Element Comparison** - Compare specific report elements (header, risk score, etc.)

## Visual Regression Testing Tool

The Visual Regression Testing Tool allows you to create baseline images of themes and test for visual regressions when making changes to theme files.

### How to Use

1. Navigate to `theme-regression-test.html` in your browser
2. Select the theme you want to test
3. Choose the test mode:
   - **Run Tests** - Compare against existing baselines
   - **Create Baselines** - Create new baseline images
4. Set the difference threshold (percentage of pixels that can differ before a test fails)
5. Select which elements to test
6. Click "Run Tests" to start the testing process

### Features

- **Baseline Creation** - Create baseline images for future comparison
- **Automated Testing** - Compare current theme rendering against baselines
- **Difference Highlighting** - Visualize differences between current and baseline images
- **Element-Level Testing** - Test specific report elements individually
- **Configurable Threshold** - Set tolerance level for differences

## Best Practices for Theme Testing

### When Developing a New Theme

1. **Start with Baselines** - Create baseline images of the existing themes to understand the expected output
2. **Incremental Changes** - Make small changes and test frequently
3. **Compare with Existing Themes** - Use the comparison tool to ensure your theme maintains consistency with existing themes
4. **Test All Elements** - Ensure all report elements render correctly in your theme

### When Modifying an Existing Theme

1. **Create Baselines First** - Before making changes, create baseline images of the current theme
2. **Run Tests After Changes** - After making changes, run regression tests to identify any unintended visual changes
3. **Review Differences** - Carefully review any differences to ensure they are expected
4. **Update Baselines** - Once satisfied with changes, update the baselines for future testing

### Common Issues and Solutions

- **Unexpected Differences** - Check CSS specificity issues or inheritance problems
- **Layout Shifts** - Verify padding, margin, and box model properties
- **Color Inconsistencies** - Ensure CSS variables are properly defined and used
- **Font Rendering Issues** - Check font-family fallbacks and font loading

## Theme Structure Requirements

For themes to work correctly with the testing tools, they should follow the standard theme structure:

```
/css/themes/[theme-name]/
  ├── theme-[name]-base.css     # Base styles
  ├── theme-[name]-layout.css   # Layout styles
  ├── theme-[name]-colors.css   # Color scheme
  └── theme-[name].css          # Main theme file (imports others)
```

Ensure your theme is properly registered in the `ThemeRegistry` to be available for testing.

## Extending the Testing Tools

### Adding New Test Elements

To add new elements to test, modify the `testElements` array in the `ThemeRegressionTest` constructor:

```javascript
testElements: [
    { name: 'new-element', selector: '.new-element-class' },
    // existing elements...
]
```

### Customizing Diff Visualization

The diff visualization can be customized by modifying the `compareImages` method in `theme-regression-test.js`.

## Conclusion

The theme testing tools provide a comprehensive environment for developing and testing themes for the report system. By following the guidelines in this document, you can ensure your themes are visually consistent and free from regressions.
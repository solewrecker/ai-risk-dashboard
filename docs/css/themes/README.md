# Report Themes System

This folder contains theme definitions for report styling. Each theme provides a complete visual design that can be applied to any report type.

## Theme Structure

Each theme consists of:
- `theme-[name].css` - Main theme variables and styling
- `theme-[name]-components.css` - Component-specific styling for the theme

## Available Themes

1. **Professional** (`theme-professional.css`) - Clean, corporate design with blue gradients
2. **Executive** (`theme-executive.css`) - Elegant design with purple gradients  
3. **Modern** (`theme-modern.css`) - Contemporary design with green accents
4. **Dark** (`theme-dark.css`) - Dark mode professional theme

## Usage

Themes are applied by:
1. User selects theme in export interface
2. Corresponding CSS files are loaded dynamically
3. All report types (executive, detailed, premium, comparison) use the same theme

## BEM Methodology

All CSS follows BEM (Block Element Modifier) naming:
- Block: `.report-header`
- Element: `.report-header__title`
- Modifier: `.report-header--dark`
# Report Components CSS Files

## DEPRECATED - DO NOT USE

**IMPORTANT: The legacy CSS files in this directory are DEPRECATED and should be REMOVED.**

All report component styling has been completely migrated to the new theming system located in `/docs/css/themes/`.

### Replacement Files

The following legacy files should be removed as they have been replaced by the new theming system:

- `report-base.css` → `/docs/css/themes/theme-base.css`
- `report-header.css` → Theme-specific header styling in respective theme files
- `report-footer.css` → Theme-specific footer styling in respective theme files
- `report-cards.css` → Theme-specific card styling in respective theme files
- `report-sections.css` → Theme-specific section styling in respective theme files
- `report-main.css` → Theme-specific main content styling in respective theme files

### New Theming System

All report styling is now handled by:

- `/docs/css/themes/theme-base.css` - Core structural styles
- `/docs/css/themes/base/theme-base.css` - Base theme styles
- `/docs/css/themes/color-schemes/` - Color variations
- `/docs/css/themes/layouts/` - Layout variations
- Theme-specific files (e.g., `theme-professional.css`, `theme-dark.css`, etc.)

## Action Required

These legacy files should be deleted immediately as this is a development environment with no existing reports requiring backward compatibility.
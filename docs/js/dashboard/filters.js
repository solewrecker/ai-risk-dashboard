/**
 * Dashboard Multi-Select Filters
 * Handles the functionality for filter dropdowns with multi-select options
 */
class DashboardFilters {
    constructor() {
        this.selectedFilters = {
            risk: [],
            category: [],
            date: []
        };
        this.init();
    }

    init() {
        this.setupMultiSelects();
        this.setupClearButton();
        this.setupSearch();
        this.updateResultsCount();
    }

    setupMultiSelects() {
        const triggers = document.querySelectorAll('.dashboard-filters__trigger');
        const dropdowns = document.querySelectorAll('.dashboard-filters__dropdown');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = trigger.nextElementSibling;
                const isActive = trigger.classList.contains('is-active');
                
                // Close all dropdowns
                triggers.forEach(t => t.classList.remove('is-active'));
                dropdowns.forEach(d => d.classList.remove('is-active'));
                
                // Toggle current dropdown
                if (!isActive) {
                    trigger.classList.add('is-active');
                    dropdown.classList.add('is-active');
                }
            });
        });

        // Handle checkbox changes
        const checkboxes = document.querySelectorAll('.dashboard-filters__option-input');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const filterType = e.target.closest('.dashboard-filters__group').dataset.filterType;
                this.updateSelectedFilters(filterType, e.target.value, e.target.checked);
                this.updateTriggerText(filterType);
                this.updateActiveFilters();
                this.updateResultsCount();
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            triggers.forEach(t => t.classList.remove('is-active'));
            dropdowns.forEach(d => d.classList.remove('is-active'));
        });
    }

    updateSelectedFilters(filterType, value, isChecked) {
        if (isChecked) {
            if (!this.selectedFilters[filterType].includes(value)) {
                this.selectedFilters[filterType].push(value);
            }
        } else {
            this.selectedFilters[filterType] = this.selectedFilters[filterType].filter(v => v !== value);
        }
    }

    updateTriggerText(filterType) {
        const trigger = document.querySelector(`[data-filter-type="${filterType}"]`).querySelector('.dashboard-filters__trigger');
        const placeholder = trigger.querySelector('.dashboard-filters__placeholder');
        const selected = this.selectedFilters[filterType];
        
        if (selected.length === 0) {
            placeholder.textContent = `Select ${filterType === 'risk' ? 'risk levels' : filterType === 'category' ? 'categories' : 'date range'}...`;
        } else if (selected.length === 1) {
            placeholder.textContent = this.formatFilterValue(selected[0]);
        } else {
            placeholder.textContent = `${selected.length} selected`;
        }
    }

    formatFilterValue(value) {
        const formatMap = {
            'critical': 'Critical Risk',
            'high': 'High Risk',
            'medium': 'Medium Risk',
            'low': 'Low Risk',
            'conversational': 'Conversational AI',
            'image': 'Image Generation',
            'code': 'Code Generation',
            'data': 'Data Analysis',
            'automation': 'Automation',
            'today': 'Today',
            'week': 'This Week',
            'month': 'This Month',
            'quarter': 'This Quarter',
            'year': 'This Year'
        };
        return formatMap[value] || value;
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.querySelector('.dashboard-filters__active');
        const allTagsContainer = document.querySelector('.dashboard-filters__tags');
        
        if (!activeFiltersContainer || !allTagsContainer) return;
        
        let allTags = [];
        
        // Collect all selected filters
        Object.entries(this.selectedFilters).forEach(([filterType, values]) => {
            values.forEach(value => {
                allTags.push({
                    type: filterType,
                    value: value,
                    display: this.formatFilterValue(value)
                });
            });
        });
        
        if (allTags.length > 0) {
            activeFiltersContainer.classList.remove('is-hidden');
            allTagsContainer.innerHTML = allTags.map(tag => 
                `<span class="dashboard-filters__tag dashboard-filters__tag--${tag.type}-${tag.value}" data-type="${tag.type}" data-value="${tag.value}">
                    ${tag.display}
                    <button class="dashboard-filters__tag-remove" aria-label="Remove filter" 
                     onclick="dashboardFilters.removeTag('${tag.type}', '${tag.value}')">×</button>
                </span>`
            ).join('');
        } else {
            activeFiltersContainer.classList.add('is-hidden');
        }
    }

    removeTag(filterType, value) {
        // Uncheck the corresponding checkbox
        const checkbox = document.querySelector(`.dashboard-filters__option-input[value="${value}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        // Update selected filters
        this.selectedFilters[filterType] = this.selectedFilters[filterType].filter(v => v !== value);
        
        // Update UI
        this.updateTriggerText(filterType);
        this.updateActiveFilters();
        this.updateResultsCount();
    }

    setupClearButton() {
        const clearBtn = document.querySelector('.dashboard-filters__clear');
        if (!clearBtn) return;
        
        clearBtn.addEventListener('click', () => {
            // Clear all selections
            Object.keys(this.selectedFilters).forEach(key => {
                this.selectedFilters[key] = [];
            });
            
            // Uncheck all checkboxes
            document.querySelectorAll('.dashboard-filters__option-input').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Clear search
            const searchInput = document.querySelector('.dashboard-controls__input');
            if (searchInput) searchInput.value = '';
            
            // Reset sort
            const sortSelect = document.querySelector('.dashboard-controls__select');
            if (sortSelect) sortSelect.selectedIndex = 0;
            
            // Update UI
            Object.keys(this.selectedFilters).forEach(filterType => {
                this.updateTriggerText(filterType);
            });
            this.updateActiveFilters();
            this.updateResultsCount();
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.dashboard-controls__input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', () => {
            this.updateResultsCount();
        });
    }

    updateResultsCount() {
        const resultsCount = document.querySelector('.dashboard-controls__results-count');
        if (!resultsCount) return;
        
        const searchInput = document.querySelector('.dashboard-controls__input');
        const hasSearch = searchInput && searchInput.value.length > 0;
        const hasFilters = Object.values(this.selectedFilters).some(arr => arr.length > 0);
        
        if (hasSearch || hasFilters) {
            // In a real app, this would be based on actual filtered results
            // For now, we'll simulate with a placeholder count
            const count = document.querySelectorAll('.assessment-item').length || 0;
            resultsCount.textContent = `${count} assessment${count !== 1 ? 's' : ''} found`;
        } else {
            // Show total count
            const count = document.querySelectorAll('.assessment-item').length || 0;
            resultsCount.textContent = `${count} assessment${count !== 1 ? 's' : ''} total`;
        }
    }
}

// Initialize the dashboard filters when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardFilters = new DashboardFilters();
}); 
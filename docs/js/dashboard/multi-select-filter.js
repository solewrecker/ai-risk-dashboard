class MultiSelectFilter {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.selectedFilters = {
            risk: [],
            category: [],
            date: []
        };
        this.init();
    }

    init() {
        if (!this.container) return;

        this.setupMultiSelects();
        this.setupClearButton();
        this.setupSearch();
    }

    setupMultiSelects() {
        const triggers = this.container.querySelectorAll('.multi-select__trigger');
        const dropdowns = this.container.querySelectorAll('.multi-select__dropdown');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = trigger.nextElementSibling;
                const isActive = trigger.classList.contains('multi-select__trigger--active');
                
                // Close all dropdowns
                triggers.forEach(t => t.classList.remove('multi-select__trigger--active'));
                dropdowns.forEach(d => d.classList.remove('multi-select__dropdown--active'));
                
                // Toggle current dropdown
                if (!isActive) {
                    trigger.classList.add('multi-select__trigger--active');
                    dropdown.classList.add('multi-select__dropdown--active');
                }
            });
        });

        // Handle checkbox changes
        const checkboxes = this.container.querySelectorAll('.multi-select__option input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const filterType = e.target.closest('.multi-select__wrapper').querySelector('.multi-select__trigger').dataset.filter;
                this.updateSelectedFilters(filterType, e.target.value, e.target.checked);
                this.updateTriggerText(filterType);
                this.updateActiveFilters();
                this.updateResultsCount();
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            triggers.forEach(t => t.classList.remove('multi-select__trigger--active'));
            dropdowns.forEach(d => d.classList.remove('multi-select__dropdown--active'));
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
        const trigger = this.container.querySelector(`[data-filter="${filterType}"]`);
        const placeholder = trigger.querySelector('.multi-select__placeholder');
        const selected = this.selectedFilters[filterType];
        
        if (selected.length === 0) {
            placeholder.textContent = this.getPlaceholderText(filterType);
        } else if (selected.length === 1) {
            placeholder.textContent = this.formatFilterValue(selected[0]);
        } else {
            placeholder.textContent = `${selected.length} selected`;
        }
    }

    getPlaceholderText(filterType) {
        switch(filterType) {
            case 'risk': return 'Select risk levels...';
            case 'category': return 'Select categories...';
            case 'date': return 'Select date range...';
            default: return 'Select...';
        }
    }

    formatFilterValue(value) {
        const formatMap = {
            'critical': 'Critical',
            'high': 'High',
            'medium': 'Medium',
            'low': 'Low',
            'conversational-ai': 'Conversational AI',
            'image-generation': 'Image Generation',
            'code-generation': 'Code Generation',
            'data-analysis': 'Data Analysis',
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
        const activeFiltersContainer = this.container.querySelector('.multi-select__active-filters');
        const allTagsContainer = this.container.querySelector('.multi-select__all-tags');
        
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
            activeFiltersContainer.classList.add('multi-select__active-filters--visible');
            allTagsContainer.innerHTML = allTags.map(tag => 
                `<span class="multi-select__tag multi-select__tag--${tag.type}-${tag.value}" 
                       data-type="${tag.type}" 
                       data-value="${tag.value}">
                    ${tag.display}
                    <span class="multi-select__tag-remove" 
                          onclick="multiSelect.removeTag('${tag.type}', '${tag.value}')">×</span>
                </span>`
            ).join('');
        } else {
            activeFiltersContainer.classList.remove('multi-select__active-filters--visible');
        }
    }

    removeTag(filterType, value) {
        // Uncheck the corresponding checkbox
        const checkbox = this.container.querySelector(`input[value="${value}"]`);
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
        const clearBtn = this.container.querySelector('.multi-select__clear-btn');
        if (!clearBtn) return;

        clearBtn.addEventListener('click', () => {
            // Clear all selections
            Object.keys(this.selectedFilters).forEach(key => {
                this.selectedFilters[key] = [];
            });
            
            // Uncheck all checkboxes
            this.container.querySelectorAll('.multi-select__option input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Clear search
            const searchInput = this.container.querySelector('.multi-select__search-input');
            if (searchInput) searchInput.value = '';
            
            // Reset sort
            const sortSelect = this.container.querySelector('.multi-select__sort-select');
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
        const searchInput = this.container.querySelector('.multi-select__search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', () => {
            this.updateResultsCount();
        });
    }

    updateResultsCount() {
        const resultsCount = this.container.querySelector('.multi-select__results-count');
        if (!resultsCount) return;

        const hasSearch = this.container.querySelector('.multi-select__search-input')?.value.length > 0;
        const hasFilters = Object.values(this.selectedFilters).some(arr => arr.length > 0);
        
        if (hasSearch || hasFilters) {
            const randomCount = Math.floor(Math.random() * 25) + 1;
            resultsCount.textContent = `${randomCount} assessment${randomCount !== 1 ? 's' : ''} found`;
        } else {
            resultsCount.textContent = '2 assessments found';
        }
    }
}

// Export for potential use in other modules
export default MultiSelectFilter; 
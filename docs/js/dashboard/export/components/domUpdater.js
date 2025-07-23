function updateLayout(config) {
    const container = document.querySelector('.report-container');
    if (!container) return;

    // Remove existing section classes
    container.className = container.className.replace(/layout-\w+/g, '');
    container.classList.add(`layout-${config.layout}`);

    // Update sections based on config
    updateSections(config.sections);
}

function updateSections(sections) {
    const container = document.querySelector('.report-container');
    const existingSections = container.querySelectorAll('.report-section');
    
    // Hide all sections first
    existingSections.forEach(section => section.style.display = 'none');
    
    // Show only configured sections
    sections.forEach(sectionName => {
        const section = container.querySelector(`.report-section.${sectionName}`);
        if (section) {
            section.style.display = '';
        } else {
            // Create section if it doesn't exist
            createSection(sectionName, container);
        }
    });
}

function updateComponents(config, designTokens) {
    const componentConfig = designTokens.components[config.components];
    
    // Update data row limits
    if (componentConfig.maxRows > 0) {
        document.querySelectorAll('.data-table tbody tr').forEach((row, index) => {
            row.style.display = index < componentConfig.maxRows ? '' : 'none';
        });
    }

    // Show/hide charts
    document.querySelectorAll('.chart-container').forEach(chart => {
        chart.style.display = componentConfig.showCharts ? '' : 'none';
    });

    // Show/hide detailed views
    document.querySelectorAll('.detailed-view').forEach(detail => {
        detail.style.display = componentConfig.showDetails ? '' : 'none';
    });
}

function createSection(sectionName, container) {
    const section = document.createElement('div');
    section.className = `report-section ${sectionName}`;
    section.innerHTML = getSectionTemplate(sectionName);
    container.appendChild(section);
}

function getSectionTemplate(sectionName) {
    const templates = {
        header: '<h1 class="theme-primary">Report Header</h1>',
        content: '<div class="content-area">Main content area</div>',
        sidebar: '<div class="sidebar">Sidebar content</div>',
        footer: '<div class="theme-secondary">Footer content</div>'
    };
    return templates[sectionName] || `<div>${sectionName} section</div>`;
}

export { updateLayout, updateSections, updateComponents, createSection, getSectionTemplate };
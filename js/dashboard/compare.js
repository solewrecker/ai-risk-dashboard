// js/dashboard/compare.js
// Logic for the Compare Tools tab: dynamic rendering, tool selection, and interactivity

// Placeholder for tool data (to be replaced with real data integration)
let allTools = [];
let selectedTools = [];
let showModal = false;
let modalSearchTerm = '';

export function initCompareTools(toolData) {
    allTools = toolData || [];
    selectedTools = [...allTools];
    showModal = false;
    modalSearchTerm = '';
    renderSummaryCards();
    renderSelectedTags();
    renderTable();
    renderLegend();
    renderModal();
    setupEventListeners();
}

function renderSummaryCards() {
    const total = selectedTools.length;
    const high = selectedTools.filter(t => getRiskLevel(t) === 'high').length;
    const medium = selectedTools.filter(t => getRiskLevel(t) === 'medium').length;
    const low = selectedTools.filter(t => getRiskLevel(t) === 'low').length;
    document.getElementById('compare-summary-total').innerHTML = `<div class="compare-tools__summary-label">Total Tools</div><div class="compare-tools__summary-value">${total}</div>`;
    document.getElementById('compare-summary-high').innerHTML = `<div class="compare-tools__summary-label">High Risk</div><div class="compare-tools__summary-value">${high}</div>`;
    document.getElementById('compare-summary-medium').innerHTML = `<div class="compare-tools__summary-label">Medium Risk</div><div class="compare-tools__summary-value">${medium}</div>`;
    document.getElementById('compare-summary-low').innerHTML = `<div class="compare-tools__summary-label">Low Risk</div><div class="compare-tools__summary-value">${low}</div>`;
}

function renderSelectedTags() {
    const container = document.getElementById('compare-selected-tags');
    if (!container) return;
    container.innerHTML = selectedTools.map(tool => `
        <span class="compare-tools__tag">
            ${tool.name}
            <button class="compare-tools__tag-remove" data-tool-id="${tool.id}" title="Remove">&times;</button>
        </span>
    `).join('');
}

function renderTable() {
    const tbody = document.getElementById('compare-tools-table-body');
    if (!tbody) return;
    tbody.innerHTML = selectedTools.map(tool => `
        <tr>
            <td>
                <div class="font-semibold text-white">${tool.name}</div>
                <div class="text-gray-400 text-sm">${tool.vendor || ''}</div>
            </td>
            <td>
                <span class="compare-tools__tag compare-tools__tag--${getRiskLevel(tool)}">
                    ${capitalize(getRiskLevel(tool))}
                </span>
            </td>
            <td><span class="font-bold">${tool.total_score || tool.totalScore || 0}</span><span class="text-gray-400 text-sm">/100</span></td>
            <td><span class="text-red-400 font-semibold">${tool.data_storage || '-'}</span></td>
            <td><span class="text-yellow-400 font-semibold">${tool.training_usage || '-'}</span></td>
            <td><span class="text-yellow-400 font-semibold">${tool.access_controls || '-'}</span></td>
            <td><span class="text-green-400 font-semibold">${tool.compliance_risk || '-'}</span></td>
            <td><span class="text-green-400 font-semibold">${tool.vendor_transparency || '-'}</span></td>
            <td><span class="text-green-400 font-semibold">${tool.compliance || '-'}</span></td>
            <td><!-- Actions (e.g., export) --></td>
        </tr>
    `).join('');
}

function renderLegend() {
    document.getElementById('compare-tools-legend').innerHTML = `
      <div class="compare-tools__legend-title">Scoring Legend</div>
      <div class="compare-tools__legend-list">
        <div class="compare-tools__legend-item"><span class="compare-tools__legend-dot low"></span> Low Risk</div>
        <div class="compare-tools__legend-item"><span class="compare-tools__legend-dot medium"></span> Medium Risk</div>
        <div class="compare-tools__legend-item"><span class="compare-tools__legend-dot high"></span> High Risk</div>
        <div class="compare-tools__legend-item"><span class="compare-tools__legend-dot compliant"></span> Compliant</div>
      </div>
    `;
}

function renderModal() {
    let modal = document.getElementById('compare-tools-modal');
    if (!showModal) {
        if (modal) modal.remove();
        return;
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'compare-tools-modal';
        document.body.appendChild(modal);
    }
    // Filter available tools
    const availableTools = allTools.filter(tool => !selectedTools.some(sel => sel.id === tool.id) &&
        (tool.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || (tool.vendor && tool.vendor.toLowerCase().includes(modalSearchTerm.toLowerCase()))));
    modal.innerHTML = `
      <div class="compare-tools__modal-overlay"></div>
      <div class="compare-tools__modal-content">
        <div class="compare-tools__modal-header">
          <h2>Select AI Tools to Compare</h2>
          <button class="compare-tools__modal-close" title="Close">&times;</button>
        </div>
        <div class="compare-tools__modal-search">
          <input type="text" class="compare-tools__modal-search-input" placeholder="Search tools..." value="${modalSearchTerm}" />
        </div>
        <div class="compare-tools__modal-list">
          ${availableTools.length === 0 ? '<div class="compare-tools__modal-empty">No tools found</div>' :
            availableTools.map(tool => `
              <div class="compare-tools__modal-item" data-tool-id="${tool.id}">
                <div class="compare-tools__modal-item-name">${tool.name}</div>
                <div class="compare-tools__modal-item-vendor">${tool.vendor || ''}</div>
              </div>
            `).join('')}
        </div>
      </div>
    `;
    // Modal styles are handled in CSS
}

function setupEventListeners() {
    // Remove tool tag
    document.getElementById('compare-selected-tags').addEventListener('click', (e) => {
        if (e.target.classList.contains('compare-tools__tag-remove')) {
            const toolId = e.target.getAttribute('data-tool-id');
            selectedTools = selectedTools.filter(t => String(t.id) !== String(toolId));
            renderSummaryCards();
            renderSelectedTags();
            renderTable();
        }
    });
    // Add Tool button
    document.querySelector('.compare-tools__add-btn').addEventListener('click', () => {
        showModal = true;
        modalSearchTerm = '';
        renderModal();
        setupModalListeners();
    });
}

function setupModalListeners() {
    const modal = document.getElementById('compare-tools-modal');
    if (!modal) return;
    // Close modal
    modal.querySelector('.compare-tools__modal-close').addEventListener('click', () => {
        showModal = false;
        renderModal();
    });
    modal.querySelector('.compare-tools__modal-overlay').addEventListener('click', () => {
        showModal = false;
        renderModal();
    });
    // Search input
    modal.querySelector('.compare-tools__modal-search-input').addEventListener('input', (e) => {
        modalSearchTerm = e.target.value;
        renderModal();
        setupModalListeners();
    });
    // Tool selection
    modal.querySelectorAll('.compare-tools__modal-item').forEach(item => {
        item.addEventListener('click', () => {
            const toolId = item.getAttribute('data-tool-id');
            const tool = allTools.find(t => String(t.id) === String(toolId));
            if (tool) {
                selectedTools.push(tool);
                showModal = false;
                renderSummaryCards();
                renderSelectedTags();
                renderTable();
                renderModal();
            }
        });
    });
}

function getRiskLevel(tool) {
    // Try to infer risk level from tool data
    if (tool.risk_level) return tool.risk_level.toLowerCase();
    if (tool.riskLevel) return tool.riskLevel.toLowerCase();
    if (tool.total_score || tool.totalScore) {
        const score = tool.total_score || tool.totalScore;
        if (score >= 60) return 'high';
        if (score >= 30) return 'medium';
        return 'low';
    }
    return 'low';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
} 
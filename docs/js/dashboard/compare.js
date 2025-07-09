// js/dashboard/compare.js
// Logic for the Compare Tools tab: dynamic rendering, tool selection, and interactivity

import { loadAssessments, getAssessments } from './assessments.js';

// Placeholder for tool data (to be replaced with real data integration)
let allTools = [];
let selectedTools = [];
let expandedRows = {};
let showModal = false;
let modalSearchTerm = '';

export function initCompareTools(toolData) {
    // Use only the user's real assessments as the source of truth
    allTools = toolData || [];
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
    if (selectedTools.length > 0) {
        container.innerHTML += `<button class="compare-tools__clear-all-btn" title="Clear All">Clear All</button>`;
    }
    renderTable(); // Re-render table when tags change
}

function renderTable() {
    const tbody = document.getElementById('compare-tools-table-body');
    if (!tbody) return;
    tbody.innerHTML = selectedTools.map(tool => {
        const isExpanded = !!expandedRows[tool.id];
        return `
            <tr class="compare-tools-table__row" data-tool-id="${tool.id}">
                <td>
                    <div class="compare-tools-table__cell-content">
                        <button class="compare-tools-table__expand-btn">
                            <svg class="lucide lucide-chevron-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div>
                            <div class="font-semibold text-white">${tool.name}</div>
                            <div class="text-gray-400 text-sm">${tool.vendor || ''}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="compare-tools__tag compare-tools__tag--${getRiskLevel(tool)}">
                        ${capitalize(getRiskLevel(tool))}
                    </span>
                </td>
                <td><span class="font-bold">${tool.total_score || tool.totalScore || 0}</span><span class="text-gray-400 text-sm">/100</span></td>
                <td>${(tool.scores && tool.scores.dataStorage) || '-'}</td>
                <td>${(tool.scores && tool.scores.trainingUsage) || '-'}</td>
                <td>${(tool.scores && tool.scores.accessControls) || '-'}</td>
                <td>${(tool.scores && tool.scores.complianceRisk) || '-'}</td>
                <td>${(tool.scores && tool.scores.vendorTransparency) || '-'}</td>
                <td>${(tool.compliance && Object.keys(tool.compliance).join(', ')) || '-'}</td>
                <td><!-- Actions (e.g., export) --></td>
            </tr>
            ${isExpanded ? `
                <tr class="compare-tools-table__expanded-content-row">
                    <td colspan="10">
                        ${renderExpandedContent(tool)}
                    </td>
                </tr>
            ` : ''}
        `;
    }).join('');
}

function renderExpandedContent(tool) {
    // Default to 'overview' tab
    const activeTab = expandedRows[tool.id]?.activeTab || 'overview';

    return `
        <div class="compare-tools-table__expanded-content">
            <div class="compare-tools-table__tabs">
                <button class="compare-tools-table__tab-btn${activeTab === 'overview' ? ' active' : ''}" data-tool-id="${tool.id}" data-tab="overview">Overview</button>
                <button class="compare-tools-table__tab-btn${activeTab === 'detailed' ? ' active' : ''}" data-tool-id="${tool.id}" data-tab="detailed">Detailed Breakdown</button>
                <button class="compare-tools-table__tab-btn${activeTab === 'recommendations' ? ' active' : ''}" data-tool-id="${tool.id}" data-tab="recommendations">Recommendations</button>
            </div>
            <div class="compare-tools-table__tab-content">
                ${activeTab === 'overview' ? renderOverviewTab(tool) : ''}
                ${activeTab === 'detailed' ? renderDetailedBreakdownTab(tool) : ''}
                ${activeTab === 'recommendations' ? renderRecommendationsTab(tool) : ''}
            </div>
        </div>
    `;
}

function renderOverviewTab(tool) {
    const assessment = tool.assessment_data || tool.assessmentData || {};
    const toolInfo = assessment.tool_info || assessment.toolInfo || {};
    return `
        <div class="compare-tools-table__overview">
            <div class="compare-tools-table__card">
                <div class="compare-tools-table__card-title">Tool Version</div>
                <div class="compare-tools-table__card-value">${toolInfo.version || 'N/A'}</div>
                <div class="compare-tools-table__card-desc">${toolInfo.version_description || 'No description'}</div>
            </div>
            <div class="compare-tools-table__card">
                <div class="compare-tools-table__card-title">Category</div>
                <div class="compare-tools-table__card-value">${toolInfo.category || 'N/A'}</div>
                <div class="compare-tools-table__card-desc">${toolInfo.category_description || 'No description'}</div>
            </div>
            <div class="compare-tools-table__card">
                <div class="compare-tools-table__card-title">Data Classification</div>
                <div class="compare-tools-table__card-value">${toolInfo.data_classification || 'N/A'}</div>
                <div class="compare-tools-table__card-desc">${toolInfo.data_classification_description || 'No description'}</div>
            </div>
        </div>
    `;
}

function renderDetailedBreakdownTab(tool) {
    const breakdown = tool.assessment_data?.detailed_breakdown || tool.assessmentData?.detailedBreakdown || {};
    if (Object.keys(breakdown).length === 0) return '<div class="p-4">No detailed breakdown available.</div>';
    return `
        <div class="compare-tools-table__detailed-breakdown">
            ${Object.entries(breakdown).map(([key, value]) => `
                <div class="compare-tools-table__breakdown-item">
                    <div class="compare-tools-table__breakdown-title">${value.title || key}</div>
                    <p class="compare-tools-table__breakdown-text">${value.description || 'No details provided.'}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRecommendationsTab(tool) {
    const recommendations = tool.assessment_data?.recommendations || tool.assessmentData?.recommendations || [];
    if (recommendations.length === 0) return '<div class="p-4">No recommendations available.</div>';
    return `
        <div class="compare-tools-table__recommendations">
            ${recommendations.map(rec => `
                <div class="compare-tools-table__recommendation-item">
                     <div class="compare-tools-table__rec-indicator compare-tools-table__rec-indicator--${rec.priority || 'medium'}"></div>
                    <div>
                        <div class="compare-tools-table__rec-title">${rec.title}</div>
                        <p class="compare-tools-table__rec-text">${rec.description}</p>
                        <span class="compare-tools-table__rec-meta">
                          Priority: ${rec.priority || 'N/A'} | Category: ${rec.category || 'N/A'}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
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
    // --- Modal State for Multi-Select ---
    if (!window._modalSelectedTools) window._modalSelectedTools = [...selectedTools];
    let modalSelectedTools = window._modalSelectedTools;
    // --- Filters ---
    const riskLevels = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];
    const vendors = Array.from(new Set(allTools.map(t => t.vendor).filter(Boolean)));
    const riskFilter = window._modalRiskFilter || 'ALL';
    const vendorFilter = window._modalVendorFilter || 'ALL';
    // --- Filtering ---
    const availableTools = allTools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || (tool.vendor && tool.vendor.toLowerCase().includes(modalSearchTerm.toLowerCase()));
        const matchesRisk = riskFilter === 'ALL' || (tool.risk_level || tool.riskLevel || '').toUpperCase() === riskFilter;
        const matchesVendor = vendorFilter === 'ALL' || tool.vendor === vendorFilter;
        return matchesSearch && matchesRisk && matchesVendor;
    });
    // --- Modal HTML ---
    modal.innerHTML = `
      <div class="compare-tools__modal-overlay">
        <div class="compare-tools__modal-content">
          <div class="compare-tools__modal-header">
            <h2>Select AI Tools to Compare</h2>
            <button class="compare-tools__modal-close" title="Close">&times;</button>
          </div>
          <div class="compare-tools__modal-search-row">
            <div class="compare-tools__modal-search">
              <input type="text" class="compare-tools__modal-search-input" placeholder="Search AI tools..." value="${modalSearchTerm}" />
            </div>
            <select class="compare-tools__modal-filter" data-filter="risk">
              ${riskLevels.map(risk => `<option value="${risk}"${risk === riskFilter ? ' selected' : ''}>${risk === 'ALL' ? 'All Risk Levels' : risk.charAt(0) + risk.slice(1).toLowerCase() + ' Risk'}</option>`).join('')}
            </select>
            <select class="compare-tools__modal-filter" data-filter="vendor">
              <option value="ALL"${vendorFilter === 'ALL' ? ' selected' : ''}>All Vendors</option>
              ${vendors.map(vendor => `<option value="${vendor}"${vendor === vendorFilter ? ' selected' : ''}>${vendor}</option>`).join('')}
            </select>
          </div>
          <div class="compare-tools__modal-list-grid">
            ${availableTools.length === 0 ? '<div class="compare-tools__modal-empty">No tools found</div>' :
              availableTools.map(tool => {
                const isSelected = modalSelectedTools.some(t => String(t.id) === String(tool.id));
                const risk = (tool.risk_level || '').toLowerCase();
                const score = tool.total_score || 0;
                return `
                  <div class="compare-tools__modal-item${isSelected ? ' compare-tools__modal-item--selected' : ''}" data-tool-id="${tool.id}">
                    <div class="compare-tools__modal-item-check">${isSelected ? '&#10003;' : ''}</div>
                    <div class="compare-tools__modal-item-info">
                      <div class="compare-tools__modal-item-name">${tool.name}</div>
                      <div class="compare-tools__modal-item-vendor">${tool.vendor || ''}</div>
                    </div>
                    <div class="compare-tools__modal-item-score-group">
                      <span class="compare-tools__modal-item-score compare-tools__modal-item-score--${risk}">${score}</span>
                      ${getRiskBadge(risk, score)}
                    </div>
                  </div>
                `;
              }).join('')}
          </div>
          <div class="compare-tools__modal-footer">
            <button class="compare-tools__modal-cancel">Cancel</button>
            <button class="compare-tools__modal-apply">Apply Selection</button>
          </div>
        </div>
      </div>
    `;
}

export function setupEventListeners() {
    if (window._compareEventListenersAttached) return;
    window._compareEventListenersAttached = true;

    document.body.addEventListener('click', async (e) => {
        const addBtn = e.target.closest('.compare-tools__add-btn');
        if (addBtn) {
            if (addBtn.disabled) return;
            addBtn.disabled = true;
            addBtn.classList.add('loading');
            try {
                await loadAssessments();
                initCompareTools(normalizeAssessments(getAssessments()));
                window._modalSelectedTools = [...selectedTools];
                showModal = true;
                modalSearchTerm = '';
                renderModal();
                setupModalListeners();
            } finally {
                addBtn.disabled = false;
                addBtn.classList.remove('loading');
            }
        }

        const tagRemoveBtn = e.target.closest('.compare-tools__tag-remove');
        if (tagRemoveBtn) {
            const toolId = tagRemoveBtn.getAttribute('data-tool-id');
            selectedTools = selectedTools.filter(t => String(t.id) !== String(toolId));
            renderSummaryCards();
            renderSelectedTags();
            renderTable();
        }

        if (e.target.closest('.compare-tools__clear-all-btn')) {
            selectedTools = [];
            expandedRows = {};
            renderSummaryCards();
            renderSelectedTags();
            renderTable();
        }

        // Handle row expansion
        const row = e.target.closest('.compare-tools-table__row');
        if (row && !e.target.closest('a, button:not(.compare-tools-table__expand-btn)')) {
            const toolId = row.dataset.toolId;
            if (expandedRows[toolId]) {
                delete expandedRows[toolId];
            } else {
                expandedRows[toolId] = { activeTab: 'overview' }; // Default to overview
            }
            renderTable();
        }
        
        // Handle tab switching in expanded row
        const tabBtn = e.target.closest('.compare-tools-table__tab-btn');
        if (tabBtn) {
            const toolId = tabBtn.dataset.toolId;
            const tab = tabBtn.dataset.tab;
            if (expandedRows[toolId]) {
                expandedRows[toolId].activeTab = tab;
                renderTable();
            }
        }
    });
}

function setupModalListeners() {
    const modal = document.getElementById('compare-tools-modal');
    if (!modal) return;
    // Close modal
    modal.querySelector('.compare-tools__modal-close').addEventListener('click', () => {
        showModal = false;
        window._modalSelectedTools = undefined;
        renderModal();
    });
    modal.querySelector('.compare-tools__modal-overlay').addEventListener('click', (e) => {
        if (e.target === modal.querySelector('.compare-tools__modal-overlay')) {
            showModal = false;
            window._modalSelectedTools = undefined;
            renderModal();
        }
    });
    // Search input
    modal.querySelector('.compare-tools__modal-search-input').addEventListener('input', (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        window._modalSearchTerm = value;
        updateModalToolList();
        // Restore focus and cursor position
        const input = document.querySelector('.compare-tools__modal-search-input');
        if (input) {
            input.focus();
            input.setSelectionRange(cursorPos, cursorPos);
        }
    });
    // Filter dropdowns
    modal.querySelectorAll('.compare-tools__modal-filter').forEach(select => {
        select.addEventListener('change', (e) => {
            if (select.dataset.filter === 'risk') {
                window._modalRiskFilter = select.value;
            } else if (select.dataset.filter === 'vendor') {
                window._modalVendorFilter = select.value;
            }
            updateModalToolList();
        });
    });
    // Tool selection (multi-select)
    modal.querySelectorAll('.compare-tools__modal-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling to overlay
            const toolId = item.getAttribute('data-tool-id');
            let modalSelectedTools = window._modalSelectedTools || [];
            const idx = modalSelectedTools.findIndex(t => String(t.id) === String(toolId));
            if (idx > -1) {
                modalSelectedTools.splice(idx, 1);
            } else {
                const tool = allTools.find(t => String(t.id) === String(toolId));
                if (tool) modalSelectedTools.push(tool);
            }
            window._modalSelectedTools = modalSelectedTools;
            updateModalToolList();
        });
    });
    // Prevent modal content clicks from bubbling to overlay
    modal.querySelector('.compare-tools__modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    // Cancel button
    modal.querySelector('.compare-tools__modal-cancel').addEventListener('click', () => {
        showModal = false;
        window._modalSelectedTools = undefined;
        renderModal();
    });
    // Apply button
    modal.querySelector('.compare-tools__modal-apply').addEventListener('click', () => {
        selectedTools = [...(window._modalSelectedTools || [])];
        showModal = false;
        window._modalSelectedTools = undefined;
        renderSummaryCards();
        renderSelectedTags();
        renderTable();
        renderModal();
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

function normalizeAssessments(raw) {
    if (!raw) return [];
    // Ensure this function can handle the nested structure from Supabase
    return raw.map(item => {
        const assessmentData = item.assessment_data || {};
        const toolInfo = assessmentData.tool_info || {};
        const scores = assessmentData.scores || {};
        return {
            id: item.id,
            name: toolInfo.name || item.name,
            vendor: toolInfo.vendor || item.vendor,
            risk_level: assessmentData.risk_level || 'N/A',
            total_score: assessmentData.total_score || 0,
            scores: {
                dataStorage: scores.data_storage?.score,
                trainingUsage: scores.training_usage?.score,
                accessControls: scores.access_controls?.score,
                complianceRisk: scores.compliance?.score,
                vendorTransparency: scores.vendor_transparency?.score,
            },
            compliance: assessmentData.compliance_certifications,
            assessmentData: assessmentData, // Keep full data for detailed view
        };
    });
}

// Add helper for risk badge
function getRiskBadge(risk, score) {
    let color = '', icon = '', label = '';
    switch ((risk || '').toLowerCase()) {
        case 'high':
            color = 'compare-tools__risk-badge--high';
            icon = '⚠️';
            label = 'HIGH';
            break;
        case 'medium':
            color = 'compare-tools__risk-badge--medium';
            icon = '👁️';
            label = 'MEDIUM';
            break;
        case 'low':
        default:
            color = 'compare-tools__risk-badge--low';
            icon = '✔️';
            label = 'LOW';
            break;
    }
    return `<span class="compare-tools__risk-badge ${color}">${icon} ${label}</span>`;
}

// Add this helper to update only the tool list in the modal
function updateModalToolList() {
    const modal = document.getElementById('compare-tools-modal');
    if (!modal) return;
    const listGrid = modal.querySelector('.compare-tools__modal-list-grid');
    if (!listGrid) return;
    // Use the same filtering/search logic as in renderModal
    const riskFilter = window._modalRiskFilter || 'ALL';
    const vendorFilter = window._modalVendorFilter || 'ALL';
    const modalSearchTerm = window._modalSearchTerm || '';
    const modalSelectedTools = window._modalSelectedTools || [];
    const availableTools = allTools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || (tool.vendor && tool.vendor.toLowerCase().includes(modalSearchTerm.toLowerCase()));
        const matchesRisk = riskFilter === 'ALL' || (tool.risk_level || tool.riskLevel || '').toUpperCase() === riskFilter;
        const matchesVendor = vendorFilter === 'ALL' || tool.vendor === vendorFilter;
        return matchesSearch && matchesRisk && matchesVendor;
    });
    listGrid.innerHTML = availableTools.length === 0 ? '<div class="compare-tools__modal-empty">No tools found</div>' :
        availableTools.map(tool => {
            const isSelected = modalSelectedTools.some(t => String(t.id) === String(tool.id));
            const risk = (tool.risk_level || '').toLowerCase();
            const score = tool.total_score || 0;
            return `
              <div class="compare-tools__modal-item${isSelected ? ' compare-tools__modal-item--selected' : ''}" data-tool-id="${tool.id}">
                <div class="compare-tools__modal-item-check">${isSelected ? '&#10003;' : ''}</div>
                <div class="compare-tools__modal-item-info">
                  <div class="compare-tools__modal-item-name">${tool.name}</div>
                  <div class="compare-tools__modal-item-vendor">${tool.vendor || ''}</div>
                </div>
                <div class="compare-tools__modal-item-score-group">
                  <span class="compare-tools__modal-item-score compare-tools__modal-item-score--${risk}">${score}</span>
                  ${getRiskBadge(risk, score)}
                </div>
              </div>
            `;
        }).join('');
    // Re-attach listeners for tool selection
    listGrid.querySelectorAll('.compare-tools__modal-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const toolId = item.getAttribute('data-tool-id');
            let modalSelectedTools = window._modalSelectedTools || [];
            const idx = modalSelectedTools.findIndex(t => String(t.id) === String(toolId));
            if (idx > -1) {
                modalSelectedTools.splice(idx, 1);
            } else {
                const tool = allTools.find(t => String(t.id) === String(toolId));
                if (tool) modalSelectedTools.push(tool);
            }
            window._modalSelectedTools = modalSelectedTools;
            updateModalToolList();
        });
    });
} 
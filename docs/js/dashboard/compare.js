// js/dashboard/compare.js
// Logic for the Compare Tools tab: dynamic rendering, tool selection, and interactivity

import { loadAssessments, getAssessments } from './assessments.js';
import { getRiskLevel } from '../assessment/scoring.js';

// Placeholder for tool data (to be replaced with real data integration)
let allTools = [];
let selectedTools = [];
let showModal = false;
let modalSearchTerm = '';
let expandedToolId = null;

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
    const high = selectedTools.filter(t => getRiskLevel(t.total_score || (t.assessment_data && t.assessment_data.finalScore) || 0) === 'high').length;
    const medium = selectedTools.filter(t => getRiskLevel(t.total_score || (t.assessment_data && t.assessment_data.finalScore) || 0) === 'medium').length;
    const low = selectedTools.filter(t => getRiskLevel(t.total_score || (t.assessment_data && t.assessment_data.finalScore) || 0) === 'low').length;
    const critical = selectedTools.filter(t => getRiskLevel(t.total_score || (t.assessment_data && t.assessment_data.finalScore) || 0) === 'critical').length;
    document.getElementById('compare-summary-total').innerHTML = `<div class="compare-tools__summary-label">Total Tools</div><div class="compare-tools__summary-value">${total}</div>`;
    document.getElementById('compare-summary-high').innerHTML = `<div class="compare-tools__summary-label">High Risk</div><div class="compare-tools__summary-value">${high}</div>`;
    document.getElementById('compare-summary-medium').innerHTML = `<div class="compare-tools__summary-label">Medium Risk</div><div class="compare-tools__summary-value">${medium}</div>`;
    document.getElementById('compare-summary-low').innerHTML = `<div class="compare-tools__summary-label">Low Risk</div><div class="compare-tools__summary-value">${low}</div>`;
    // Optionally add critical if you want to display it
    // document.getElementById('compare-summary-critical').innerHTML = `<div class="compare-tools__summary-label">Critical Risk</div><div class="compare-tools__summary-value">${critical}</div>`;
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
}

function getRiskColorClass(score) {
    const risk = getRiskLevel(score);
    return `text-risk-${risk}`;
}

function renderTable() {
    const tbody = document.getElementById('compare-tools-table-body');
    if (!tbody) return;
    tbody.innerHTML = selectedTools.map(tool => {
        const ad = tool.assessment_data || {};
        const formData = ad.formData || {};
        const breakdown = ad.breakdown || {};
        const scores = breakdown.scores || {};
        const isExpanded = expandedToolId === tool.id;
        // Compliance info
        const complianceCerts = (tool.compliance_certifications || []).join(', ') || '-';
        const complianceSummary = ad.compliance_summary || (ad.detailedAssessment && ad.detailedAssessment.compliance_summary) || '-';
        // Recommendations
        const recs = (ad.recommendations || []).map(r => `<li><strong>${r.title}</strong> <span class="compare-tools__rec-priority">[${r.priority}]</span></li>`).join('') || '<li>-</li>';
        // Score values
        const dataStorage = tool.data_storage_score ?? scores.dataStorage ?? '-';
        const trainingUsage = tool.training_usage_score ?? scores.trainingUsage ?? '-';
        const accessControls = tool.access_controls_score ?? scores.accessControls ?? '-';
        const complianceRisk = tool.compliance_score ?? scores.complianceRisk ?? '-';
        const vendorTransparency = tool.vendor_transparency_score ?? scores.vendorTransparency ?? '-';
        const compliance = tool.compliance ?? '-';
        const totalScore = tool.total_score || ad.finalScore || 0;
        return `
        <tr class="compare-tools__row">
            <td>
                <button class="compare-tools__expand-btn" data-tool-id="${tool.id}" aria-expanded="${isExpanded}">
                    <span class="chevron${isExpanded ? ' chevron--down' : ''}"></span>
                </button>
                <div class="font-semibold text-white">${tool.name || formData.toolName || 'Unknown Tool'}</div>
                <div class="text-gray-400 text-xs">${formData.toolVersion ? formData.toolVersion : ''}</div>
                <div class="text-gray-400 text-sm">${tool.vendor || formData.toolCategory || tool.category || ''}</div>
            </td>
            <td>
                <span class="compare-tools__tag compare-tools__tag--${getRiskLevel(totalScore)}">
                    ${capitalize(getRiskLevel(totalScore))}
                </span>
            </td>
            <td><span class="font-bold ${getRiskColorClass(totalScore)}">${totalScore}</span><span class="text-gray-400 text-sm">/100</span></td>
            <td><span class="text-white font-semibold">${dataStorage}</span></td>
            <td><span class="text-white font-semibold">${trainingUsage}</span></td>
            <td><span class="text-white font-semibold">${accessControls}</span></td>
            <td><span class="text-white font-semibold">${complianceRisk}</span></td>
            <td><span class="text-white font-semibold">${vendorTransparency}</span></td>
            <td><span class="text-white font-semibold">${compliance}</span></td>
        </tr>
        <tr class="compare-tools__details-row" style="display:${isExpanded ? 'table-row' : 'none'}">
            <td colspan="9">
                <div class="compare-tools__details">
                    <div><strong>Category:</strong> ${tool.category || formData.toolCategory || '-'}</div>
                    <div><strong>Data Classification:</strong> ${tool.data_classification || formData.dataClassification || '-'}</div>
                    <div><strong>Compliance Certifications:</strong> ${complianceCerts}</div>
                    <div><strong>Compliance Summary:</strong> ${complianceSummary}</div>
                    <div><strong>Recommendations:</strong><ul>${recs}</ul></div>
                </div>
            </td>
        </tr>
        `;
    }).join('');
    // Attach expand/collapse listeners
    tbody.querySelectorAll('.compare-tools__expand-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const toolId = btn.getAttribute('data-tool-id');
            expandedToolId = expandedToolId === toolId ? null : toolId;
            renderTable();
        });
    });
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
                const score = tool.total_score || (tool.assessment_data && tool.assessment_data.finalScore) || 0;
                const risk = getRiskLevel(score);
                return `
                  <div class="compare-tools__modal-item${isSelected ? ' compare-tools__modal-item--selected' : ''}" data-tool-id="${tool.id}">
                    <div class="compare-tools__modal-item-check">${isSelected ? '&#10003;' : ''}</div>
                    <div class="compare-tools__modal-item-info">
                      <div class="compare-tools__modal-item-name">${tool.name}</div>
                      <div class="compare-tools__modal-item-vendor">${tool.vendor || ''}</div>
                    </div>
                    <div class="compare-tools__modal-item-score-group">
                      <span class="compare-tools__modal-item-score compare-tools__modal-item-score--${risk} text-risk-${risk}">${score}</span>
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
                initCompareTools(getAssessments());
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
            renderSummaryCards();
            renderSelectedTags();
            renderTable();
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

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
            const score = tool.total_score || (tool.assessment_data && tool.assessment_data.finalScore) || 0;
            const risk = getRiskLevel(score);
            return `
              <div class="compare-tools__modal-item${isSelected ? ' compare-tools__modal-item--selected' : ''}" data-tool-id="${tool.id}">
                <div class="compare-tools__modal-item-check">${isSelected ? '&#10003;' : ''}</div>
                <div class="compare-tools__modal-item-info">
                  <div class="compare-tools__modal-item-name">${tool.name}</div>
                  <div class="compare-tools__modal-item-vendor">${tool.vendor || ''}</div>
                </div>
                <div class="compare-tools__modal-item-score-group">
                  <span class="compare-tools__modal-item-score compare-tools__modal-item-score--${risk} text-risk-${risk}">${score}</span>
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
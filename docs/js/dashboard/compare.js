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
    document.getElementById('compare-summary-critical').innerHTML = `<div class="compare-tools__summary-label">Critical Risk</div><div class="compare-tools__summary-value">${critical}</div>`;
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
        const detailedAssessment = ad.detailedAssessment || {};
        const recommendations = ad.recommendations || [];
        const isExpanded = expandedToolId === tool.id;

        // Compliance info (ensure they are strings)
        const complianceCerts = Array.isArray(tool.compliance_certifications) ? tool.compliance_certifications.map(String).join(', ') : '-';
        const complianceSummary = ad.compliance_summary || (detailedAssessment.compliance_summary) || '-';
        
        // Recommendations
        const recs = recommendations.map(r => `
            <div class="compare-tools__recommendation">
                <div class="compare-tools__rec-bullet compare-tools__rec-priority--${r.priority}"></div>
                <div>
                    <h5 class="compare-tools__rec-title">${r.title}</h5>
                    <p class="compare-tools__rec-desc">${r.description}</p>
                    <span class="compare-tools__rec-meta">Priority: ${r.priority} | Category: ${r.category}</span>
                </div>
            </div>
        `).join('') || '<p>No recommendations available</p>';

        // Detailed Breakdown (ensure assessment_details is an object)
        const detailsHTML = (typeof detailedAssessment.assessment_details === 'object' && detailedAssessment.assessment_details !== null 
            ? Object.entries(detailedAssessment.assessment_details) : []
        ).map(([key, detail]) => {
            const categoryScore = detail.category_score || 0;
            return `
                <div class="compare-tools__detail-card">
                    <h5 class="compare-tools__detail-title">${key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</h5>
                    <div class="compare-tools__detail-score">Score: ${categoryScore}</div>
                    <div class="compare-tools__detail-content">
                        ${(typeof detail.criteria === 'object' && detail.criteria !== null 
                            ? Object.entries(detail.criteria) : []
                        ).map(([critKey, crit]) => `
                            <div class="compare-tools__detail-item">
                                <strong>${critKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}:</strong> ${crit.score} - ${crit.justification}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('') || '<p>No detailed assessment available</p>';

        // Compliance Icons (adapt from example)
        const complianceIcons = (typeof tool.compliance === 'object' && tool.compliance !== null ? Object.entries(tool.compliance) : []).map(([key, status]) => {
            const icon = status === 'compliant' ? '<i data-lucide="check-circle" class="compare-tools__compliance-icon compare-tools__compliance-icon--compliant"></i>' : '<i data-lucide="x-circle" class="compare-tools__compliance-icon compare-tools__compliance-icon--noncompliant"></i>';
            return `<div class="compare-tools__compliance-item">${icon} <span>${key.toUpperCase()}</span></div>`;
        }).join('') || '<p>No compliance data</p>';

        // Score values - Accessing from top-level `tool` object
        const dataStorage = tool.data_storage_score ?? '-';
        const trainingUsage = tool.training_usage_score ?? '-';
        const accessControls = tool.access_controls_score ?? '-';
        const complianceRisk = tool.compliance_score ?? '-';
        const vendorTransparency = tool.vendor_transparency_score ?? '-';

        const totalScore = tool.total_score || ad.finalScore || 0;
        const risk = getRiskLevel(totalScore);
        return `
        <tr class="compare-tools__row compare-tools__row--${risk}">
            <td class="compare-tools__tool-cell" data-tool-id="${tool.id}" style="cursor: pointer;">
                <button class="compare-tools__expand-btn" aria-expanded="${isExpanded}">
                    <span class="chevron${isExpanded ? ' chevron--down' : ''}"></span>
                </button>
                <div class="compare-tools__tool-name">${tool.name || formData.toolName || 'Unknown Tool'}</div>
                <div class="compare-tools__tool-version">${formData.toolVersion ? formData.toolVersion : ''}</div>
                <div class="compare-tools__tool-category">${tool.vendor || formData.toolCategory || tool.category || ''}</div>
            </td>
            <td>
                <span class="compare-tools__tag compare-tools__tag--${risk}">
                    ${capitalize(risk)}
                </span>
            </td>
            <td><span class="compare-tools__score ${getRiskColorClass(totalScore)}">${totalScore}</span><span class="compare-tools__score-max">/100</span></td>
            <td><span class="compare-tools__score">${dataStorage}</span></td>
            <td><span class="compare-tools__score">${trainingUsage}</span></td>
            <td><span class="compare-tools__score">${accessControls}</span></td>
            <td><span class="compare-tools__score">${complianceRisk}</span></td>
            <td><span class="compare-tools__score">${vendorTransparency}</span></td>
            <!-- Removed Compliance Column -->
        </tr>
        <tr class="compare-tools__details-row" style="display:${isExpanded ? 'table-row' : 'none'}">
            <td colspan="8"> <!-- Changed colspan from 9 to 8 -->
                <div class="compare-tools__details">
                    <div class="compare-tools__tabs">
                        <button class="compare-tools__tab compare-tools__tab--active" data-tab="details" data-tool-id="${tool.id}">
                            <i data-lucide="bar-chart-3"></i>
                            Risk Assessment Details
                        </button>
                        <button class="compare-tools__tab" data-tab="recommendations" data-tool-id="${tool.id}">
                            <i data-lucide="lightbulb"></i>
                            Recommendations
                        </button>
                        <button class="compare-tools__tab" data-tab="compliance" data-tool-id="${tool.id}">
                            <i data-lucide="shield-check"></i>
                            Compliance Status
                        </button>
                    </div>
                    
                    <div class="compare-tools__tab-content compare-tools__tab-content--active" data-content="details">
                        <div class="compare-tools__details-grid">
                            ${detailsHTML}
                        </div>
                    </div>
                    
                    <div class="compare-tools__tab-content" data-content="recommendations">
                        <div class="compare-tools__recommendations-list">
                            ${recs}
                        </div>
                    </div>
                    
                    <div class="compare-tools__tab-content" data-content="compliance">
                        <div class="compare-tools__compliance-content">
                            <div class="compare-tools__compliance-grid">
                                ${complianceIcons}
                            </div>
                            <!-- Display detailed compliance summary -->
                            <div class="compare-tools__compliance-summary">
                                <p><strong>Data Classification:</strong> ${tool.data_classification || 'Not specified'}</p>
                                <p><strong>Use Case:</strong> ${tool.primary_use_case || 'Not specified'}</p>
                                <p><strong>Documentation Tier:</strong> ${tool.documentation_tier || 'Not specified'}</p>
                                <p><strong>Summary:</strong> ${complianceSummary}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
        `;
    }).join('');
    // Attach expand/collapse listeners to the tool cell
    tbody.querySelectorAll('.compare-tools__tool-cell').forEach(cell => {
        cell.addEventListener('click', e => {
            if (e.target.closest('.compare-tools__expand-btn')) return; // Allow button click if needed, but since whole cell is clickable
            const toolId = cell.getAttribute('data-tool-id');
            expandedToolId = expandedToolId === toolId ? null : toolId;
            renderTable();
        });
    });
    
    // Add tab switching functionality
    tbody.querySelectorAll('.compare-tools__tab').forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            
            const targetTab = tab.getAttribute('data-tab');
            const toolId = tab.getAttribute('data-tool-id');
            
            // Find the parent details container
            const detailsContainer = tab.closest('.compare-tools__details');
            
            // Remove active class from all tabs and content in this tool's details
            detailsContainer.querySelectorAll('.compare-tools__tab').forEach(t => t.classList.remove('compare-tools__tab--active'));
            detailsContainer.querySelectorAll('.compare-tools__tab-content').forEach(c => c.classList.remove('compare-tools__tab-content--active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('compare-tools__tab--active');
            detailsContainer.querySelector(`[data-content="${targetTab}"]`).classList.add('compare-tools__tab-content--active');
        });
    });
    
    // Keep existing button listener for completeness
    tbody.querySelectorAll('.compare-tools__expand-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const toolId = btn.getAttribute('data-tool-id');
            expandedToolId = expandedToolId === toolId ? null : toolId;
            renderTable();
        });
    });

    // Update the export button link
    const exportBtn = document.getElementById('compareExportBtn');
    if (exportBtn && selectedTools.length > 0) {
        const ids = selectedTools.map(t => t.id).join(',');
        exportBtn.href = `export.html?ids=${ids}`;
        exportBtn.classList.remove('disabled');
    } else if (exportBtn) {
        exportBtn.href = 'export.html';
        exportBtn.classList.add('disabled');
    }
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
        const score = tool.total_score || (tool.assessment_data && tool.assessment_data.finalScore) || 0;
        const calculatedRisk = getRiskLevel(score);
        const matchesRisk = riskFilter === 'ALL' || calculatedRisk.toUpperCase() === riskFilter;
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
        case 'critical':
            color = 'compare-tools__risk-badge--critical';
            icon = '🛑';
            label = 'CRITICAL';
            break;
        case 'high':
            color = 'compare-tools__risk-badge--high';
            icon = '⚠️';
            label = 'HIGH';
            break;
        case 'medium':
            color = 'compare-tools__risk-badge--medium';
            icon = '🟡';
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
        const score = tool.total_score || (tool.assessment_data && tool.assessment_data.finalScore) || 0;
        const calculatedRisk = getRiskLevel(score);
        const matchesRisk = riskFilter === 'ALL' || calculatedRisk.toUpperCase() === riskFilter;
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
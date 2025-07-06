// ===========================================================================
// Compare Tools Table - Logic for main table, expandable rows, and details
// ===========================================================================

let expandedRows = {};

// Entry point: renderCompareTable(tools, containerId)
function renderCompareTable(tools, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let html = '';
    html += `<div class="compare-table__container">
      <table class="compare-table__table">
        <thead class="compare-table__thead">
          <tr>
            <th class="compare-table__th">Tool</th>
            <th class="compare-table__th">Risk Level</th>
            <th class="compare-table__th">Total Score</th>
            <th class="compare-table__th">Data Storage</th>
            <th class="compare-table__th">Training Usage</th>
            <th class="compare-table__th">Access Controls</th>
            <th class="compare-table__th">Compliance Risk</th>
            <th class="compare-table__th">Vendor Transparency</th>
            <th class="compare-table__th">Compliance</th>
            <th class="compare-table__th">Actions</th>
          </tr>
        </thead>
        <tbody class="compare-table__tbody">
          ${tools.map(tool => {
            const isExpanded = expandedRows[tool.id];
            return `
              <tr class="compare-table__row${isExpanded ? ' compare-table__row--expanded' : ''}" data-tool-id="${tool.id}">
                <td class="compare-table__td">
                  <button class="compare-table__chevron-btn" data-tool-id="${tool.id}" title="Expand/collapse">
                    <span class="compare-table__chevron">${isExpanded ? '&#9650;' : '&#9660;'}</span>
                  </button>
                  <div class="compare-table__tool-info">
                    <div class="compare-table__tool-name">${tool.name}</div>
                    <div class="compare-table__tool-vendor">${tool.vendor || ''}</div>
                  </div>
                </td>
                <td class="compare-table__td">
                  <span class="compare-table__risk-badge compare-table__risk-badge--${(tool.risk_level || '').toLowerCase()}">${tool.risk_level || ''}</span>
                </td>
                <td class="compare-table__td">
                  <span class="compare-table__score">${tool.total_score || 0}</span>
                  <span class="compare-table__score-max">/100</span>
                </td>
                <td class="compare-table__td">${tool.data_storage || '-'}</td>
                <td class="compare-table__td">${tool.training_usage || '-'}</td>
                <td class="compare-table__td">${tool.access_controls || '-'}</td>
                <td class="compare-table__td">${tool.compliance_risk || '-'}</td>
                <td class="compare-table__td">${tool.vendor_transparency || '-'}</td>
                <td class="compare-table__td">${tool.compliance || '-'}</td>
                <td class="compare-table__td">
                  <button class="compare-table__action-btn" title="Export">&#128190;</button>
                </td>
              </tr>
              <tr class="compare-table__details-row" style="display:${isExpanded ? 'table-row' : 'none'}">
                <td class="compare-table__details-td" colspan="10">
                  <div class="compare-table__details">
                    <!-- Placeholder for details: risk breakdown, recommendations, etc. -->
                    <div class="compare-table__details-section">Risk Assessment Details (placeholder)</div>
                    <div class="compare-table__details-section">Recommendations (placeholder)</div>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>`;
    container.innerHTML = html;
    // Attach chevron event listeners
    container.querySelectorAll('.compare-table__chevron-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const toolId = this.getAttribute('data-tool-id');
            handleRowToggle(toolId);
        });
    });
}

// Handle row expand/collapse
function handleRowToggle(toolId) {
    expandedRows[toolId] = !expandedRows[toolId];
    // You may want to re-call renderCompareTable with the latest tools and containerId
    // For now, assume a global 'currentTools' and 'compareTableContainerId'
    if (window.currentTools && window.compareTableContainerId) {
        renderCompareTable(window.currentTools, window.compareTableContainerId);
    }
}

// Additional helper functions can be added here 
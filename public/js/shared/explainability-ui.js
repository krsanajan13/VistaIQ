/**
 * Explainability UI Component
 * Renders the standardized "Why this answer?" collapsible explainability panel
 * for both Decision Console insights and AI Concierge itineraries.
 */

const ExplainabilityUI = {
  /**
   * Render the explainability panel inside target placeholder
   * @param {HTMLElement|string} target - DOM Element or selector
   * @param {Object} metadata - { sources: string[], confidence: 'high'|'medium'|'low', reasoning: string, customRows: Array }
   */
  render(target, metadata) {
    const container = typeof target === 'string' ? document.getElementById(target) : target;
    if (!container) return;

    if (!metadata) {
      container.innerHTML = '';
      return;
    }

    const { sources = [], confidence = 'medium', reasoning = '', customRows = [] } = metadata;

    const confidenceLabel = confidence.charAt(0).toUpperCase() + confidence.slice(1);
    let confidenceClass = 'confidence-dot--medium';
    if (confidence === 'high') confidenceClass = 'confidence-dot--high';
    if (confidence === 'low') confidenceClass = 'confidence-dot--low';

    let customHtml = '';
    customRows.forEach(row => {
      customHtml += `
        <div class="explain-row">
          <div class="explain-label">${escapeHtml(row.label)}</div>
          <div class="explain-value">${row.valueHtml || escapeHtml(row.value)}</div>
        </div>
      `;
    });

    const html = `
      <div class="expandable" style="margin-top: var(--space-4);">
        <div class="expandable-header">
          <span class="expandable-title">
            <svg style="width: 16px; height: 16px; color: var(--color-teal);" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Why this answer? (Explainability Trace)
          </span>
          <svg class="expandable-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <div class="expandable-content">
          <div class="expandable-body">
            <div class="explain-row">
              <div class="explain-label">Sources Used</div>
              <div class="explain-value explain-sources">
                ${sources.length > 0 
                  ? sources.map(s => `<span class="explain-source-tag">${escapeHtml(s)}</span>`).join('')
                  : '<span class="explain-source-tag">In-Memory Business Directory</span>'}
              </div>
            </div>
            
            <div class="explain-row" style="margin-top: var(--space-2);">
              <div class="explain-label">Confidence</div>
              <div class="explain-value">
                <span class="confidence-indicator">
                  <span class="confidence-dot ${confidenceClass}"></span>
                  ${confidenceLabel}
                </span>
              </div>
            </div>

            <div class="explain-row" style="margin-top: var(--space-2);">
              <div class="explain-label">Reasoning</div>
              <div class="explain-value">${escapeHtml(reasoning)}</div>
            </div>

            ${customHtml}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Attach click events
    window.initExpandables();
  }
};

window.ExplainabilityUI = ExplainabilityUI;

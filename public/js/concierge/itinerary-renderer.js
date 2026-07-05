/**
 * Itinerary UI Renderer
 * Renders custom travel itineraries as a vertical timeline
 * featuring custom timelines, Local Gem badges, and citation lists.
 */

const ItineraryRenderer = {
  /**
   * Render the travel itinerary to the DOM
   * @param {string} containerId - Itinerary DOM container
   * @param {string} citationsId - Citations DOM container
   * @param {Object} data - API response data { trip_summary, itinerary, citations }
   */
  render(containerId, citationsId, data) {
    const container = document.getElementById(containerId);
    const citationsContainer = document.getElementById(citationsId);
    
    if (!container) return;
    container.innerHTML = '';
    
    if (citationsContainer) {
      citationsContainer.innerHTML = '';
    }

    if (!data || !data.itinerary || data.itinerary.length === 0) {
      container.innerHTML = '<p class="text-muted">No itinerary data available.</p>';
      return;
    }

    // 1. Render Day-by-Day Timeline
    data.itinerary.forEach((day) => {
      const dayEl = document.createElement('div');
      dayEl.className = 'itinerary-day';

      let stopsHtml = '';
      day.stops.forEach((stop, idx) => {
        const isGem = !!stop.is_underserved;
        const stopClass = isGem ? 'itinerary-stop itinerary-stop--gem' : 'itinerary-stop';
        
        // Find citation index number (1-based index)
        const citationIdx = data.citations.findIndex(c => c.id === stop.business_id) + 1;

        stopsHtml += `
          <div class="${stopClass}">
            <div class="glass-card stop-card">
              <div class="stop-header">
                <div class="stop-name">
                  <span>${escapeHtml(stop.time_slot)}: ${escapeHtml(stop.activity_name)}</span>
                  ${citationIdx > 0 ? `<sup class="citation-number" style="font-size: 10px; cursor: help;" title="Source Citation [${citationIdx}]">[${citationIdx}]</sup>` : ''}
                </div>
                ${isGem ? `
                  <span class="local-gem-badge">
                    <svg style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    🌟 Local Gem
                  </span>
                ` : ''}
              </div>
              
              <div class="stop-meta">
                <span class="stop-meta-item">
                  <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  ${escapeHtml(stop.district)}
                </span>
                <span class="stop-meta-item">
                  <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  ${escapeHtml(stop.hours)}
                </span>
                <span class="stop-meta-item">
                  <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Est: $${stop.estimated_cost} (${escapeHtml(stop.price_range)})
                </span>
              </div>

              <p class="stop-description">${escapeHtml(stop.description)}</p>
            </div>
          </div>
        `;
      });

      dayEl.innerHTML = `
        <div class="itinerary-day-header">
          <div class="itinerary-day-number">${day.day_number}</div>
          <h3 class="itinerary-day-title">${escapeHtml(day.day_title)}</h3>
        </div>
        <div class="itinerary-stops">
          ${stopsHtml}
        </div>
      `;

      container.appendChild(dayEl);
    });

    // 2. Render Itinerary Overview Card & Cost Summary
    const summaryCard = document.createElement('div');
    summaryCard.className = 'glass-card trip-summary';
    summaryCard.innerHTML = `
      <div class="trip-summary-item">
        <div class="trip-summary-value">$${data.trip_summary.total_estimated_cost}</div>
        <div class="trip-summary-label">Estimated Total Budget</div>
      </div>
      <div class="trip-summary-item">
        <div class="trip-summary-value">${data.itinerary.length} Days</div>
        <div class="trip-summary-label">Stay Duration</div>
      </div>
      <div class="trip-summary-item">
        <div class="trip-summary-value">${data.citations.filter(c => c.is_underserved).length}</div>
        <div class="trip-summary-label">Local Gems Visited</div>
      </div>
    `;
    container.insertBefore(summaryCard, container.firstChild);

    // Insert Overview Paragraph
    const overviewEl = document.createElement('p');
    overviewEl.className = 'text-muted';
    overviewEl.style.cssText = 'margin: var(--space-4) 0; font-size: var(--text-md); line-height: var(--leading-relaxed);';
    overviewEl.innerHTML = `<strong>Trip Focus:</strong> ${escapeHtml(data.trip_summary.overview)}`;
    container.insertBefore(overviewEl, summaryCard.nextSibling);

    // 3. Render Source Citations (at the bottom)
    if (citationsContainer && data.citations && data.citations.length > 0) {
      data.citations.forEach((cit, index) => {
        const citationEl = document.createElement('div');
        citationEl.className = 'citation';
        
        const isGem = !!cit.is_underserved;
        const tag = isGem ? '<span class="badge badge-gold" style="font-size: 9px; padding: 1px 4px; margin-left: 5px;">Local Gem</span>' : '';

        citationEl.innerHTML = `
          <span class="citation-number">[${index + 1}]</span>
          <div>
            <strong>${escapeHtml(cit.name)}</strong> - ${escapeHtml(cit.category)} (${escapeHtml(cit.district)})${tag}
            <span style="display: block; font-size: 11px; color: var(--color-text-tertiary); margin-top: 1px;">${escapeHtml(cit.description)}</span>
          </div>
        `;
        citationsContainer.appendChild(citationEl);
      });
    }
  }
};

window.ItineraryRenderer = ItineraryRenderer;

/**
 * AI Concierge Panel Frontend Controller
 * Binds trip setup configurations, updates sliders/chips,
 * and submits planning requests to compile itineraries.
 */

const ConciergeUI = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const daysInput = document.getElementById('daysInput');
    const daysDisplay = document.getElementById('daysValueDisplay');
    const interestChips = document.querySelectorAll('#interestChipsContainer .interest-chip');
    const generateBtn = document.getElementById('generateItineraryBtn');
    const resetBtn = document.getElementById('resetConciergeBtn');

    // Sync days slider with text output
    if (daysInput && daysDisplay) {
      daysInput.addEventListener('input', (e) => {
        const val = e.target.value;
        daysDisplay.innerText = `${val} ${val == 1 ? 'Day' : 'Days'}`;
      });
    }

    // Toggle multi-select interest chips
    interestChips.forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
    });

    // Form submission
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerateItinerary());
    }

    // Reset view
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetView());
    }
  },

  async handleGenerateItinerary() {
    // 1. Gather inputs
    const days = parseInt(document.getElementById('daysInput').value);
    
    const budgetEl = document.querySelector('input[name="budget"]:checked');
    const budget = budgetEl ? budgetEl.value : 'Moderate';
    
    const crowdEl = document.querySelector('input[name="crowd"]:checked');
    const crowd_tolerance = crowdEl ? crowdEl.value : 'Neutral';
    
    const accessibility = document.getElementById('accessibilityCheckbox').checked;

    // Get selected interests
    const selectedChips = document.querySelectorAll('#interestChipsContainer .interest-chip.selected');
    const interests = Array.from(selectedChips).map(c => c.getAttribute('data-value'));

    if (interests.length === 0) {
      window.showToast('Please select at least one interest area.', 'warning');
      return;
    }

    // 2. Transition layout, show loading
    document.getElementById('conciergeWelcomeCard').style.display = 'none';
    document.getElementById('conciergeOutputCard').style.display = 'none';
    window.setLoaderState('conciergeLoader', 'conciergeOutputCard', true);
    
    // Scroll content panel into view on mobile
    document.getElementById('conciergeLoader').scrollIntoView({ behavior: 'smooth' });

    try {
      // 3. Trigger API
      const data = await window.ApiClient.planItinerary({
        days,
        budget,
        interests,
        crowd_tolerance,
        accessibility
      });

      // 4. Render timeline and citations
      window.ItineraryRenderer.render('itineraryContent', 'citationsContainer', data);

      // 5. Render explainability trace
      window.ExplainabilityUI.render('conciergeExplainabilityPlaceholder', {
        sources: data.explainability.sources,
        confidence: data.explainability.confidence,
        reasoning: data.explainability.reasoning,
        customRows: [
          { label: 'Scoring Weights', value: 'Base similarity (text-embedding-004) + 30% local-impact boost applied to matching underserved businesses.' }
        ]
      });

      window.setLoaderState('conciergeLoader', 'conciergeOutputCard', false);
      window.showToast('Itinerary planned. Local gems injected!', 'success');

    } catch (error) {
      console.error(error);
      window.setLoaderState('conciergeLoader', 'conciergeOutputCard', false);
      document.getElementById('conciergeWelcomeCard').style.display = 'block';
      window.showToast(error.message || 'Failed to compile itinerary.', 'error');
    }
  },

  resetView() {
    document.getElementById('conciergeOutputCard').style.display = 'none';
    document.getElementById('conciergeWelcomeCard').style.display = 'block';
    
    // Clear inputs optionally, or keep choices
    window.showToast('Planner reset.', 'info');
  }
};

window.ConciergeUI = ConciergeUI;

/**
 * VistaIQ Frontend API Client
 * Manages HTTP POST communication with Vercel serverless functions.
 */

const ApiClient = {
  /**
   * Generic request handler
   */
  async request(endpoint, data = {}) {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Attach Bearer token override if configured in session
    const customKey = sessionStorage.getItem('GEMINI_API_KEY');
    if (customKey) {
      headers['Authorization'] = `Bearer ${customKey}`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let errMsg = 'API call failed';
        try {
          const errData = await response.json();
          errMsg = errData.message || errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request to ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * Post question to the conversational analytics endpoint
   */
  async askQuestion(question) {
    return this.request('/api/console/ask', { question });
  },

  /**
   * Get forecast data
   */
  async getForecast(district, metric, days) {
    return this.request('/api/console/forecast', { district, metric, days: parseInt(days) });
  },

  /**
   * Trigger anomaly scanner
   */
  async runAnomalyScan(district) {
    return this.request('/api/console/anomaly', { district });
  },

  /**
   * Generate trip plan
   */
  async planItinerary(itineraryParams) {
    return this.request('/api/concierge/plan', itineraryParams);
  }
};

window.ApiClient = ApiClient;

/**
 * VistaIQ Global Application Entrypoint
 * Handles tab navigation routing, API Key modal verification,
 * and component bootstrap sequences.
 */

const App = {
  async init() {
    console.log("Bootstrapping VistaIQ Application...");
    
    // 1. Initialize Page controllers
    window.ConsoleUI.init();
    window.ConciergeUI.init();
    window.ForecastUI.init();
    
    // 2. Setup Routing and Event Listeners
    this.setupRouting();
    this.bindEvents();

    // 3. Perform API Key Healthcheck
    await this.verifyApiKeyConfig();
  },

  setupRouting() {
    // Basic hash routing support
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || 'console';
      this.switchTab(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Trigger on first load
    handleHashChange();
  },

  bindEvents() {
    // Header navigation buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        window.location.hash = targetTab;
      });
    });

    // API Key form submission
    const submitKeyBtn = document.getElementById('submitApiKeyBtn');
    const keyInput = document.getElementById('apiKeyInput');

    if (submitKeyBtn && keyInput) {
      submitKeyBtn.addEventListener('click', () => {
        const key = keyInput.value.trim();
        if (!key) {
          window.showToast("Please enter a valid API Key.", "warning");
          return;
        }

        // Save override token
        sessionStorage.setItem('GEMINI_API_KEY', key);
        
        // Hide overlay
        const modal = document.getElementById('apiKeyModal');
        modal.classList.remove('active');
        
        window.showToast("API key registered for session.", "success");
        
        // Trigger page refresh or recalculate if in the middle of operations
        console.log("API Key stored. App initialized.");
      });
    }

    // Bypass/Demo Mode button
    const bypassBtn = document.getElementById('bypassDemoBtn');
    if (bypassBtn) {
      bypassBtn.addEventListener('click', () => {
        const modal = document.getElementById('apiKeyModal');
        modal.classList.remove('active');
        window.showToast("Entering demo view (queries will fail if backend lacks key).", "info");
      });
    }
  },

  /**
   * Switches views and updates tab active styles
   */
  switchTab(tabId) {
    const consolePanel = document.getElementById('consolePanel');
    const conciergePanel = document.getElementById('conciergePanel');
    const consoleBtn = document.getElementById('btnTabConsole');
    const conciergeBtn = document.getElementById('btnTabConcierge');

    if (tabId === 'console') {
      consolePanel.classList.add('active');
      conciergePanel.classList.remove('active');
      consoleBtn.classList.add('active');
      conciergeBtn.classList.remove('active');
    } else if (tabId === 'concierge') {
      consolePanel.classList.remove('active');
      conciergePanel.classList.add('active');
      consoleBtn.classList.remove('active');
      conciergeBtn.classList.add('active');
    }
  },

  /**
   * Run dummy check query to see if backend environment already
   * contains a configured GEMINI_API_KEY. Bypasses modal overlay if true.
   */
  async verifyApiKeyConfig() {
    // 1. If key is already in session, hide modal
    if (sessionStorage.getItem('GEMINI_API_KEY')) {
      document.getElementById('apiKeyModal').classList.remove('active');
      return;
    }

    // 2. Perform simple test post to check if the server has a key configured
    try {
      console.log("Checking server key configuration...");
      
      const response = await fetch('/api/console/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: 'SELECT 1;' })
      });

      const data = await response.json().catch(() => ({}));
      
      // Only show the modal if the server explicitly says the key is missing
      if (data.message && data.message.includes('GEMINI_API_KEY is not configured')) {
        console.log("Server key missing. Displaying configuration dialog.");
        document.getElementById('apiKeyModal').classList.add('active');
        
        // Show bypass option so user can explore UI layout
        const bypassBtn = document.getElementById('bypassDemoBtn');
        if (bypassBtn) bypassBtn.style.display = 'inline-flex';
      } else {
        // Key exists on server (even if the request itself failed due to rate limits or other issues)
        console.log("Server API key detected. Bypassing modal.");
        document.getElementById('apiKeyModal').classList.remove('active');
        
        // Show a warning toast if the health check returned an error (e.g. rate limit)
        if (!response.ok && response.status !== 422) {
          const errMsg = data.message || data.error || 'Server health check returned an error';
          window.showToast(`⚠️ ${errMsg}`, 'warning');
        }
      }
    } catch (e) {
      console.warn("Server connection error during health check.", e);
      // Network error — server might be down. Show modal with bypass option.
      document.getElementById('apiKeyModal').classList.add('active');
      const bypassBtn = document.getElementById('bypassDemoBtn');
      if (bypassBtn) bypassBtn.style.display = 'inline-flex';
    }
  }
};

// Start application on DOM load
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

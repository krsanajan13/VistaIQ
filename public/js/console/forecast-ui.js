/**
 * Forecast & Anomaly Panels Frontend Controller
 * Binds control form actions, triggers API requests,
 * and renders confidence-band forecasting charts and anomaly boards.
 */

const ForecastUI = {
  forecastChartInstance: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const quickForecast = document.getElementById('quickActionForecast');
    const quickAnomaly = document.getElementById('quickActionAnomaly');

    const closeForecastBtn = document.getElementById('closeForecastBtn');
    const closeAnomalyBtn = document.getElementById('closeAnomalyBtn');

    const runForecastBtn = document.getElementById('runForecastBtn');
    const runAnomalyScanBtn = document.getElementById('runAnomalyScanBtn');

    // Trigger subpanels
    if (quickForecast) {
      quickForecast.addEventListener('click', () => this.showForecastPanel());
    }
    if (quickAnomaly) {
      quickAnomaly.addEventListener('click', () => this.showAnomalyPanel());
    }

    // Return to main console view
    if (closeForecastBtn) {
      closeForecastBtn.addEventListener('click', () => this.hideForecastPanel());
    }
    if (closeAnomalyBtn) {
      closeAnomalyBtn.addEventListener('click', () => this.hideAnomalyPanel());
    }

    // Compute actions
    if (runForecastBtn) {
      runForecastBtn.addEventListener('click', () => this.handleComputeForecast());
    }
    if (runAnomalyScanBtn) {
      runAnomalyScanBtn.addEventListener('click', () => this.handleAnomalyScan());
    }
  },

  showForecastPanel() {
    this.hideAllSections();
    document.getElementById('consoleForecastSection').style.display = 'block';
    document.getElementById('consoleForecastSection').scrollIntoView({ behavior: 'smooth' });
  },

  hideForecastPanel() {
    document.getElementById('consoleForecastSection').style.display = 'none';
  },

  showAnomalyPanel() {
    this.hideAllSections();
    document.getElementById('consoleAnomalySection').style.display = 'block';
    document.getElementById('consoleAnomalySection').scrollIntoView({ behavior: 'smooth' });
    
    // Auto-run scanner on first load
    this.handleAnomalyScan();
  },

  hideAnomalyPanel() {
    document.getElementById('consoleAnomalySection').style.display = 'none';
  },

  hideAllSections() {
    document.getElementById('consoleResultsSection').style.display = 'none';
    document.getElementById('consoleForecastSection').style.display = 'none';
    document.getElementById('consoleAnomalySection').style.display = 'none';
  },

  async handleComputeForecast() {
    const district = document.getElementById('forecastDistrictSelect').value;
    const metric = document.getElementById('forecastMetricSelect').value;
    const days = document.getElementById('forecastDaysSelect').value;

    window.setLoaderState('forecastLoader', 'forecastOutputContent', true);

    try {
      const data = await window.ApiClient.getForecast(district, metric, days);

      // Render chart
      this.renderForecastChart(data);

      // Render summary
      document.getElementById('forecastSummaryText').innerHTML = window.renderMarkdown(data.summary);

      // Render explainability panel
      window.ExplainabilityUI.render('forecastExplainabilityPlaceholder', {
        sources: data.explainability.sources,
        confidence: data.explainability.confidence,
        reasoning: data.explainability.reasoning
      });

      window.setLoaderState('forecastLoader', 'forecastOutputContent', false);
      window.showToast(`Forecasted ${days} days trend successfully.`, 'success');

    } catch (error) {
      console.error(error);
      window.setLoaderState('forecastLoader', 'forecastOutputContent', false);
      window.showToast(error.message || 'Forecast calculation failed.', 'error');
    }
  },

  renderForecastChart(data) {
    const canvas = document.getElementById('forecastChartCanvas');
    if (!canvas) return;

    if (this.forecastChartInstance) {
      this.forecastChartInstance.destroy();
      this.forecastChartInstance = null;
    }

    // Limit historical dataset to the last 45 days for better graph visibility
    const historySubset = data.historical.slice(-45);
    
    const labels = [
      ...historySubset.map(h => h.date),
      ...data.forecast.map(f => f.date)
    ];

    // Align datasets
    const historicalData = historySubset.map(h => h.value);
    
    // Forecast data starts immediately after history
    const forecastBuffer = Array(historicalData.length - 1).fill(null);
    const lastHistVal = historicalData[historicalData.length - 1];
    
    const projectedData = [
      ...forecastBuffer,
      lastHistVal,
      ...data.forecast.map(f => f.value)
    ];

    const upperData = [
      ...forecastBuffer,
      lastHistVal,
      ...data.forecast.map(f => f.upper_bound)
    ];

    const lowerData = [
      ...forecastBuffer,
      lastHistVal,
      ...data.forecast.map(f => f.lower_bound)
    ];

    const ctx = canvas.getContext('2d');
    
    this.forecastChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Historical Data',
            data: historicalData,
            borderColor: '#4ecdc4',
            borderWidth: 2,
            pointRadius: 2,
            fill: false
          },
          {
            label: 'Projected Trend',
            data: projectedData,
            borderColor: '#ff6b6b',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Upper Confidence Bound',
            data: upperData,
            borderColor: 'rgba(255, 107, 107, 0.1)',
            borderWidth: 1,
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Lower Confidence Bound (90% CI)',
            data: lowerData,
            borderColor: 'rgba(255, 107, 107, 0.1)',
            borderWidth: 1,
            pointRadius: 0,
            backgroundColor: 'rgba(255, 107, 107, 0.05)',
            fill: '-1' // Fills to previous dataset (Upper Bound)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: { family: 'Inter', size: 11 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { family: 'Inter', size: 10 },
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { family: 'Inter', size: 10 }
            }
          }
        }
      }
    });
  },

  async handleAnomalyScan() {
    const district = document.getElementById('anomalyDistrictFilter').value;
    const container = document.getElementById('anomalyCardsContainer');
    
    setLoaderState('anomalyLoader', 'anomalyOutputContent', true);
    container.innerHTML = '';

    try {
      const data = await window.ApiClient.runAnomalyScan(district);
      const list = data.anomalies || [];

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <span style="font-size: 32px; opacity: 0.5;">check_circle</span>
            <div class="empty-state-title">No anomalies detected</div>
            <div class="empty-state-text">Historical metrics fall within normal standard deviation limits for this district.</div>
          </div>
        `;
      } else {
        list.forEach(anom => {
          const card = document.createElement('div');
          card.className = 'glass-card anomaly-card';
          
          const isSpike = anom.max_deviation > 0;
          const badgeClass = isSpike ? 'badge-success' : 'badge-danger';
          const directionText = isSpike ? 'Surge' : 'Drop';
          const symbol = isSpike ? '▲' : '▼';

          card.innerHTML = `
            <div class="anomaly-header">
              <div>
                <span class="badge ${badgeClass}">${symbol} ${Math.abs(anom.max_deviation)}% ${directionText}</span>
                <span style="margin-left: var(--space-2); font-weight: var(--weight-bold); font-size: var(--text-md);">${escapeHtml(anom.district)}</span>
              </div>
              <span class="anomaly-period">${window.formatDate(anom.start_date)} ${anom.start_date !== anom.end_date ? ' - ' + window.formatDate(anom.end_date) : ''}</span>
            </div>
            
            <div style="display: flex; gap: var(--space-6); flex-wrap: wrap;">
              <div class="anomaly-deviation">
                ${window.formatNumber(anom.peak_value)}
                <span style="font-size: var(--text-xs); color: var(--color-text-tertiary); display: block; font-weight: normal; margin-top: 2px;">Peak vs Baseline of ${window.formatNumber(anom.rolling_avg_base)}</span>
              </div>
              <div style="flex: 1; min-width: 250px;">
                <p class="anomaly-explanation">${escapeHtml(anom.explanation)}</p>
                <div class="anomaly-factors">
                  ${anom.contributing_factors.map(f => `<span class="badge badge-teal" style="font-size: 10px;">${escapeHtml(f)}</span>`).join('')}
                </div>
              </div>
            </div>
          `;
          container.appendChild(card);
        });

        // Append explainability panel below cards
        const explainWrapper = document.createElement('div');
        explainWrapper.id = 'anomalyExplainabilityWrapper';
        container.appendChild(explainWrapper);

        window.ExplainabilityUI.render('anomalyExplainabilityWrapper', {
          sources: data.explainability.sources,
          confidence: data.explainability.confidence,
          reasoning: data.explainability.reasoning
        });
      }

      setLoaderState('anomalyLoader', 'anomalyOutputContent', false);
      window.showToast(`Scan complete. Found ${list.length} deviations.`, 'info');

    } catch (error) {
      console.error(error);
      setLoaderState('anomalyLoader', 'anomalyOutputContent', false);
      window.showToast(error.message || 'Anomaly scanner execution failed.', 'error');
    }
  }
};

window.ForecastUI = ForecastUI;

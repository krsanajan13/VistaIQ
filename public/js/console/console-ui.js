/**
 * Decision Console Frontend Controller
 * Manages conversational analytics query submissions, suggestions,
 * SQL viewing, and results section layout states.
 */

const ConsoleUI = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const input = document.getElementById('consoleQuestionInput');
    const submitBtn = document.getElementById('consoleSubmitBtn');
    const exampleChips = document.querySelectorAll('.example-question');
    const closeResultsBtn = document.getElementById('closeConsoleResultsBtn');
    const sqlExpandBtn = document.getElementById('sqlExpandBtn');

    // Submit question click
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleQuestionSubmit());
    }

    // Enter key support in input field
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.handleQuestionSubmit();
        }
      });
    }

    // Example query suggestion chips
    exampleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const question = chip.getAttribute('data-question');
        if (input && question) {
          input.value = question;
          this.handleQuestionSubmit();
        }
      });
    });

    // Close results
    if (closeResultsBtn) {
      closeResultsBtn.addEventListener('click', () => {
        document.getElementById('consoleResultsSection').style.display = 'none';
      });
    }

    // Initialise any pre-existing expandables inside index.html
    window.initExpandables();
  },

  async handleQuestionSubmit() {
    const input = document.getElementById('consoleQuestionInput');
    const question = input.value.trim();

    if (!question) {
      window.showToast('Please type a query or select a suggestion first.', 'warning');
      return;
    }

    // Reset UI panels, show loader
    this.hideAllSubpanels();
    const resultsPanel = document.getElementById('consoleResultsSection');
    resultsPanel.style.display = 'grid';
    window.setLoaderState('consoleLoader', 'consoleOutputContent', true);
    
    // Smooth scroll to results
    resultsPanel.scrollIntoView({ behavior: 'smooth' });

    try {
      const data = await window.ApiClient.askQuestion(question);

      // Render natural language summary
      const textAnswerDiv = document.getElementById('consoleTextAnswer');
      textAnswerDiv.innerHTML = window.renderMarkdown(data.answer);

      // Render SQL
      const sqlText = document.getElementById('sqlStatementText');
      sqlText.innerHTML = this.highlightSql(data.sql_used);

      // Render explainability panel
      window.ExplainabilityUI.render('consoleExplainabilityPlaceholder', {
        sources: data.explainability.sources,
        confidence: data.explainability.confidence,
        reasoning: data.explainability.reasoning
      });

      // Render charts if applicable
      const chartWrapper = document.getElementById('consoleChartWrapper');
      if (data.chart_type && data.chart_type !== 'none' && data.rows && data.rows.length > 0) {
        chartWrapper.style.display = 'block';
        document.getElementById('consoleChartTitle').innerText = data.chart_title || 'Visual Analytics';
        
        // Pass data to Chart Manager
        window.ConsoleCharts.render(
          'consoleChartCanvas', 
          data.chart_type, 
          data.columns, 
          data.rows
        );
      } else {
        chartWrapper.style.display = 'none';
      }

      window.setLoaderState('consoleLoader', 'consoleOutputContent', false);
      window.showToast('Query compiled and executed successfully.', 'success');

    } catch (error) {
      console.error(error);
      window.setLoaderState('consoleLoader', 'consoleOutputContent', false);
      resultsPanel.style.display = 'none';
      window.showToast(error.message || 'Failed to query the database.', 'error');
    }
  },

  /**
   * Helper to simple syntax highlight SQL for preview
   */
  highlightSql(sql) {
    if (!sql) return '';
    const keywords = [
      'SELECT', 'FROM', 'JOIN', 'ON', 'WHERE', 'GROUP BY', 
      'ORDER BY', 'LIMIT', 'SUM', 'AVG', 'COUNT', 'AND', 
      'OR', 'IN', 'BETWEEN', 'HAVING', 'ROUND', 'DESC', 'ASC'
    ];
    
    let highlighted = window.escapeHtml(sql);
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="sql-keyword">${keyword}</span>`);
    });

    // Simple strings highlighting
    highlighted = highlighted.replace(/'([^']*)'/g, `<span class="sql-string">'$1'</span>`);
    
    return highlighted;
  },

  hideAllSubpanels() {
    document.getElementById('consoleForecastSection').style.display = 'none';
    document.getElementById('consoleAnomalySection').style.display = 'none';
  }
};

window.ConsoleUI = ConsoleUI;

/**
 * Console Visual Analytics Chart Controller
 * Wraps Chart.js to render animated charts matching
 * VistaIQ's dark mode design token colors.
 */

const ConsoleCharts = {
  chartInstance: null,

  /**
   * Render a chart on target canvas
   * @param {string} canvasId - Canvas DOM ID
   * @param {string} type - 'bar' | 'line' | 'doughnut'
   * @param {string[]} columns - Column names
   * @param {Object[]} rows - Query row objects
   */
  render(canvasId, type, columns, rows) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Destroy existing instance to prevent overlapping glitches
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    if (!rows || rows.length === 0 || !columns || columns.length === 0) {
      console.warn("Skipping chart rendering: No columns or row data supplied.");
      return;
    }

    // --- Data Parsing Engine ---
    // 1. Identify label column (usually the first text-based or date column)
    const labelColumn = columns[0];
    const labels = rows.map(r => r[labelColumn] !== undefined ? String(r[labelColumn]) : '');

    // 2. Identify numeric columns (for datasets)
    const numericColumns = columns.slice(1).filter(col => {
      // Check if at least one row has a number in this column
      return rows.some(r => typeof r[col] === 'number' || (!isNaN(parseFloat(r[col])) && isFinite(r[col])));
    });

    if (numericColumns.length === 0) {
      console.warn("Skipping chart rendering: No numeric values detected for Y-axis.");
      document.getElementById('consoleChartWrapper').style.display = 'none';
      return;
    }

    // 3. Compile datasets
    const colors = {
      coral: {
        border: '#ff6b6b',
        bg: 'rgba(255, 107, 107, 0.25)',
        glow: 'rgba(255, 107, 107, 0.1)'
      },
      teal: {
        border: '#4ecdc4',
        bg: 'rgba(78, 205, 196, 0.25)',
        glow: 'rgba(78, 205, 196, 0.1)'
      },
      gold: {
        border: '#ffd93d',
        bg: 'rgba(255, 217, 61, 0.25)',
        glow: 'rgba(255, 217, 61, 0.1)'
      }
    };

    const datasetColorSequence = [colors.teal, colors.coral, colors.gold];

    const datasets = numericColumns.map((col, idx) => {
      const colorSet = datasetColorSequence[idx % datasetColorSequence.length];
      const dataPoints = rows.map(r => {
        const val = r[col];
        return typeof val === 'number' ? val : parseFloat(val);
      });

      return {
        label: col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        data: dataPoints,
        borderColor: colorSet.border,
        backgroundColor: type === 'doughnut' ? [colors.teal.border, colors.coral.border, colors.gold.border, '#3498db', '#9b59b6'] : colorSet.bg,
        borderWidth: 2.5,
        fill: type === 'line', // Fill area under line chart
        tension: 0.35, // Curved lines
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colorSet.border
      };
    });

    // --- Chart.js Configuration ---
    const chartConfig = {
      type: type === 'doughnut' ? 'doughnut' : (type === 'line' ? 'line' : 'bar'),
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            display: type !== 'doughnut' || datasets[0].data.length <= 8, // Hide large doughnut legends
            position: 'top',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: 'Inter',
                size: 11,
                weight: '500'
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 31, 58, 0.95)',
            titleColor: '#ffffff',
            titleFont: { family: 'Inter', weight: 'bold' },
            bodyColor: 'rgba(255, 255, 255, 0.85)',
            bodyFont: { family: 'Inter' },
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            cornerRadius: 8
          }
        },
        scales: type === 'doughnut' ? {} : {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'transparent'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { family: 'Inter', size: 10 },
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'transparent'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { family: 'Inter', size: 10 }
            }
          }
        }
      }
    };

    // Instantiate
    const ctx = canvas.getContext('2d');
    this.chartInstance = new Chart(ctx, chartConfig);
  }
};

window.ConsoleCharts = ConsoleCharts;

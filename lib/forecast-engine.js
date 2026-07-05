/**
 * Forecasting and Anomaly Math Engine
 * Implements:
 * - Linear regression + Day-of-week seasonality forecasting
 * - Standard deviation based confidence bands
 * - Rolling average deviation scanner for anomaly identification
 */

/**
 * Fits a linear trend y = mx + c + seasonality(dayOfWeek) to historical data
 * and projects it forward by projectionDays.
 * 
 * @param {Array} history - Array of { date, value } objects
 * @param {number} projectionDays - Number of days to forecast (30, 60, 90)
 */
function computeForecast(history, projectionDays = 30) {
  if (history.length < 7) {
    throw new Error("Insufficient history to calculate a trend. Need at least 7 data points.");
  }

  // Parse dates and extract values
  const n = history.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = history.map(h => h.value);

  // 1. Calculate Linear Regression: y = mx + c
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 2. Compute Day-of-Week Seasonality Factors
  // Calculate residuals: actual_y - trend_y
  const dayOfWeekSums = Array(7).fill(0);
  const dayOfWeekCounts = Array(7).fill(0);

  history.forEach((h, idx) => {
    const date = new Date(h.date);
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const trendVal = slope * idx + intercept;
    const residual = h.value - trendVal;

    dayOfWeekSums[day] += residual;
    dayOfWeekCounts[day]++;
  });

  const seasonality = dayOfWeekSums.map((sum, day) => {
    const count = dayOfWeekCounts[day];
    return count > 0 ? sum / count : 0;
  });

  // Calculate Standard Deviation of residuals for confidence band scaling
  let residualSumSq = 0;
  history.forEach((h, idx) => {
    const date = new Date(h.date);
    const day = date.getDay();
    const fittedVal = slope * idx + intercept + seasonality[day];
    const residual = h.value - fittedVal;
    residualSumSq += residual * residual;
  });
  
  const stdDev = Math.sqrt(residualSumSq / (n - 2)) || 50;

  // 3. Project Future Points
  const forecast = [];
  const lastDate = new Date(history[n - 1].date);
  
  for (let i = 1; i <= projectionDays; i++) {
    const fDate = new Date(lastDate);
    fDate.setDate(lastDate.getDate() + i);
    const dateStr = fDate.toISOString().split('T')[0];
    const day = fDate.getDay();

    const futureX = n - 1 + i;
    // Base trend + seasonality
    let predictedVal = slope * futureX + intercept + seasonality[day];
    predictedVal = Math.max(0, Math.round(predictedVal));

    // Confidence interval expands as we project further out
    const expansionFactor = 1 + (i * 0.05); // Grows by 5% every day
    const bound = Math.round(stdDev * 1.645 * expansionFactor); // 90% confidence interval

    forecast.push({
      date: dateStr,
      value: predictedVal,
      upper_bound: predictedVal + bound,
      lower_bound: Math.max(0, predictedVal - bound)
    });
  }

  // Map history to standard format
  const historical = history.map(h => ({
    date: h.date,
    value: h.value
  }));

  return {
    historical,
    forecast,
    slope: parseFloat(slope.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2))
  };
}

/**
 * Scan history to identify anomaly days.
 * An anomaly is flagged if the actual value deviates by more than 25%
 * from the rolling 7-day average.
 * Groups consecutive anomaly days into distinct alert periods.
 * 
 * @param {Array} history - Array of { date, value, district } objects
 */
function scanAnomalies(history) {
  const anomalies = [];
  const threshold = 0.25; // 25% deviation

  for (let i = 7; i < history.length; i++) {
    const actual = history[i].value;
    
    // Calculate 7-day rolling average of preceding days
    let sum = 0;
    for (let j = 1; j <= 7; j++) {
      sum += history[i - j].value;
    }
    const rollingAvg = sum / 7;

    const deviation = (actual - rollingAvg) / rollingAvg;

    if (Math.abs(deviation) >= threshold) {
      anomalies.push({
        date: history[i].date,
        district: history[i].district,
        value: actual,
        rolling_avg: Math.round(rollingAvg),
        deviation_pct: Math.round(deviation * 100)
      });
    }
  }

  // Group consecutive anomalies in the same district (within 4 days of each other)
  // to avoid cluttering results
  const groupedPeriods = [];
  const groupedIds = new Set();

  anomalies.forEach((anom, idx) => {
    if (groupedIds.has(idx)) return;

    const period = {
      district: anom.district,
      start_date: anom.date,
      end_date: anom.date,
      max_deviation: anom.deviation_pct,
      peak_value: anom.value,
      rolling_avg_base: anom.rolling_avg,
      days: [anom.date]
    };

    groupedIds.add(idx);

    // Search forward for consecutive anomaly days in same district
    let lastDate = new Date(anom.date);
    for (let j = idx + 1; j < anomalies.length; j++) {
      const nextAnom = anomalies[j];
      if (nextAnom.district !== anom.district) continue;

      const nextDate = new Date(nextAnom.date);
      const diffTime = Math.abs(nextDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 4) { // within 4 days (part of same storm/event)
        period.end_date = nextAnom.date;
        period.days.push(nextAnom.date);
        
        // Record maximum deviation magnitude
        if (Math.abs(nextAnom.deviation_pct) > Math.abs(period.max_deviation)) {
          period.max_deviation = nextAnom.deviation_pct;
          period.peak_value = nextAnom.value;
          period.rolling_avg_base = nextAnom.rolling_avg;
        }

        lastDate = nextDate;
        groupedIds.add(j);
      }
    }

    groupedPeriods.push(period);
  });

  return groupedPeriods;
}

module.exports = {
  computeForecast,
  scanAnomalies
};

/**
 * District Forecasting Endpoint
 * POST /api/console/forecast
 * Body: { district: string, metric: 'footfall'|'spend', days: number }
 */

const { query } = require('../../lib/database');
const { computeForecast } = require('../../lib/forecast-engine');
const { generateText } = require('../../lib/gemini');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { district, metric, days = 30 } = req.body;

  if (!district || !metric) {
    return res.status(400).json({ message: 'Missing district or metric parameters.' });
  }

  // Parse custom API key override from auth headers
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  try {
    // 1. Fetch historical database series
    let sql = "";
    if (metric === 'footfall') {
      sql = `
        SELECT date, visitor_count as value 
        FROM footfall 
        WHERE district = '${district.replace(/'/g, "''")}' 
        ORDER BY date ASC;
      `;
    } else if (metric === 'spend') {
      sql = `
        SELECT s.date, SUM(s.amount) as value 
        FROM spend s
        JOIN businesses b ON s.business_id = b.id 
        WHERE b.district = '${district.replace(/'/g, "''")}'
        GROUP BY s.date 
        ORDER BY s.date ASC;
      `;
    } else {
      return res.status(400).json({ message: 'Invalid metric. Must be footfall or spend.' });
    }

    const dbResult = await query(sql);
    const history = dbResult.rows || [];

    if (history.length === 0) {
      return res.status(404).json({ message: `No historical data found for district: ${district}` });
    }

    // 2. Perform forecasting calculations
    const forecastResult = computeForecast(history, days);

    const direction = forecastResult.slope > 0 ? "growth" : (forecastResult.slope < 0 ? "decline" : "stable");
    const metricLabel = metric === 'footfall' ? 'visitor footfall traffic' : 'retail/hospitality transaction spend';
    const lastHistVal = history[history.length - 1].value;
    const finalProjVal = forecastResult.forecast[forecastResult.forecast.length - 1].value;

    let geminiSummary = "";
    try {
      const summaryPrompt = `
Analyze this mathematical forecast for tourism planning:
District: "${district}"
Metric: "${metricLabel}"
Historical average (last 30 days): ${Math.round(history.slice(-30).reduce((acc, h) => acc + h.value, 0) / 30)}
Projecting forward: ${days} days
Projected trend slope: ${forecastResult.slope} per day (${direction})
Latest historical value: ${lastHistVal}
Final projected value at day ${days}: ${finalProjVal} (range: ${forecastResult.forecast[forecastResult.forecast.length - 1].lower_bound} to ${forecastResult.forecast[forecastResult.forecast.length - 1].upper_bound})

Provide a brief, professional 2-3 sentence analysis of this trend for a city official. Highlight any seasonal peaks and suggest a brief planning recommendation.
`;

      const systemInstruction = "You are a senior tourism economics analyst writing executive summary briefs.";
      geminiSummary = await generateText(summaryPrompt, systemInstruction, apiKey);
    } catch (geminiError) {
      console.warn("Gemini forecast summarization failed, using offline fallback summary:", geminiError.message);
      geminiSummary = `The mathematical forecast projects a **${direction}** trend in **${metricLabel}** for the **${district}** district over the next **${days} days**. The baseline shows a daily slope change of **${forecastResult.slope}**. Regional coordinators should plan resources to handle this projection and direct overflow visitor traffic to underserved zones.`;
    }

    return res.status(200).json({
      district,
      metric,
      horizon_days: days,
      historical: forecastResult.historical,
      forecast: forecastResult.forecast,
      slope: forecastResult.slope,
      summary: geminiSummary,
      explainability: {
        sources: [metric, 'businesses (for spend mappings)'],
        confidence: geminiSummary.includes('offline fallback') ? 'medium' : 'high',
        reasoning: `Fitted linear trend equation (slope: ${forecastResult.slope}) combined with weekday seasonality coefficients extracted from 365 days of historical data.`
      }
    });

  } catch (error) {
    console.error("Forecasting endpoint error:", error);
    return res.status(500).json({ 
      message: "Forecast computation failed.", 
      error: error.message 
    });
  }
};

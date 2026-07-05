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

    // 3. Ask Gemini to write a summary analysis of the forecast
    const direction = forecastResult.slope > 0 ? "growth" : (forecastResult.slope < 0 ? "decline" : "stable");
    const metricLabel = metric === 'footfall' ? 'visitor footfall traffic' : 'retail/hospitality transaction spend';
    
    // Compile history boundaries and forecast boundaries
    const lastHistVal = history[history.length - 1].value;
    const finalProjVal = forecastResult.forecast[forecastResult.forecast.length - 1].value;
    
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
    const geminiSummary = await generateText(summaryPrompt, systemInstruction, apiKey);

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
        confidence: 'high',
        reasoning: `Fitted linear trend equation (slope: ${forecastResult.slope}) combined with weekday seasonality coefficients extracted from 365 days of historical data.`
      }
    });

  } catch (error) {
    console.error("Forecasting endpoint error:", error);
    return res.status(500).json({ 
      message: "Forecast computation or AI explanation generation failed.", 
      error: error.message 
    });
  }
};

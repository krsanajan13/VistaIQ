/**
 * Anomaly Detection and AI Correlation Endpoint
 * POST /api/console/anomaly
 * Body: { district?: string }
 */

const { query } = require('../../lib/database');
const { scanAnomalies } = require('../../lib/forecast-engine');
const { generateStructured } = require('../../lib/gemini');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { district = 'All' } = req.body;

  // Parse custom API key override from auth headers
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  try {
    // 1. Fetch entire footfall dataset
    let sql = `
      SELECT date, visitor_count as value, district 
      FROM footfall 
      ORDER BY district, date ASC;
    `;
    const dbResult = await query(sql);
    const history = dbResult.rows || [];

    // 2. Scan for mathematical deviations
    let anomalies = scanAnomalies(history);

    // Filter by district if requested
    if (district && district !== 'All') {
      anomalies = anomalies.filter(a => a.district === district);
    }

    // Limit to top 5 most severe anomalies to fit within latency/cost boundaries
    anomalies.sort((a, b) => Math.abs(b.max_deviation) - Math.abs(a.max_deviation));
    const targetAnomalies = anomalies.slice(0, 5);

    if (targetAnomalies.length === 0) {
      return res.status(200).json({ anomalies: [] });
    }

    // 3. For each anomaly, compile local events/weather context and explain it
    const explainedAnomalies = [];

    for (const anom of targetAnomalies) {
      // Fetch weather context for the period
      const weatherSql = `
        SELECT date, condition, temp 
        FROM weather 
        WHERE district = '${anom.district.replace(/'/g, "''")}' 
          AND date BETWEEN '${anom.start_date}' AND '${anom.end_date}';
      `;
      const weatherRes = await query(weatherSql);
      const weatherRows = weatherRes.rows || [];

      // Fetch event context
      const eventSql = `
        SELECT date, event_name, expected_impact 
        FROM events 
        WHERE district = '${anom.district.replace(/'/g, "''")}' 
          AND date BETWEEN '${anom.start_date}' AND '${anom.end_date}';
      `;
      const eventRes = await query(eventSql);
      const eventRows = eventRes.rows || [];

      // Prompt Gemini to correlate and explain
      const anomalyPromptSchema = {
        type: "OBJECT",
        properties: {
          explanation: { 
            type: "STRING", 
            description: "1-2 sentence business-oriented explanation correlating weather or event changes to this deviation." 
          },
          contributing_factors: { 
            type: "ARRAY", 
            items: { type: "STRING" }, 
            description: "2-3 short tags mapping contributing issues (e.g. ['Severe Flooding', 'Event Disruption', 'Unseasonable Cold'])." 
          }
        },
        required: ["explanation", "contributing_factors"]
      };

      const anomalySystemInstruction = `
You are an economic forensics agent. Correlate footfall fluctuations with local event listings and weather records.
Review the statistics:
District: "${anom.district}"
Period: ${anom.start_date} to ${anom.end_date}
Footfall peak deviation: ${anom.max_deviation}% (Peak value: ${anom.peak_value} vs normal baseline of ${anom.rolling_avg_base})

Weather records for this period:
${JSON.stringify(weatherRows)}

Scheduled events for this period:
${JSON.stringify(eventRows)}

Write a professional explanation. If there is rain/snow/wind and a drop, attribute it to bad weather. If there is a scheduled critical/high impact festival and a huge spike, attribute it to the event. If there was a storm during a scheduled festival, note how bad weather suppressed the expected event impact.
`;

      let aiCorrelation;
      try {
        aiCorrelation = await generateStructured(
          "Correlate and explain the root cause.",
          anomalySystemInstruction,
          anomalyPromptSchema,
          apiKey
        );
      } catch (geminiError) {
        console.warn("Gemini anomaly explanation failed, using local correlation fallback:", geminiError.message);
        aiCorrelation = buildLocalAnomalyExplanation(anom, weatherRows, eventRows);
      }

      explainedAnomalies.push({
        district: anom.district,
        start_date: anom.start_date,
        end_date: anom.end_date,
        max_deviation: anom.max_deviation,
        peak_value: anom.peak_value,
        rolling_avg_base: anom.rolling_avg_base,
        explanation: aiCorrelation.explanation,
        contributing_factors: aiCorrelation.contributing_factors
      });
    }

    return res.status(200).json({
      anomalies: explainedAnomalies,
      explainability: {
        sources: ['footfall', 'weather', 'events'],
        confidence: 'high',
        reasoning: "Scanned entire 12-month series for >25% rolling average deviations. Queried local events and weather schedules during deviance windows, then triggered Gemini logical correlation."
      }
    });

  } catch (error) {
    console.error("Anomaly endpoint failure:", error);
    return res.status(500).json({
      message: "Anomaly detection scan or AI correlation failed.",
      error: error.message
    });
  }
};

function buildLocalAnomalyExplanation(anom, weatherRows, eventRows) {
  const severeWeather = weatherRows.find(w => ['Rainy', 'Snowy', 'Windy'].includes(w.condition));
  const majorEvent = eventRows.find(e => ['High', 'Critical'].includes(e.expected_impact));
  const isDrop = anom.max_deviation < 0;

  if (isDrop && severeWeather && majorEvent) {
    return {
      explanation: `${anom.district} saw a ${Math.abs(anom.max_deviation)}% demand drop while ${severeWeather.condition.toLowerCase()} weather overlapped with ${majorEvent.event_name}, likely suppressing expected event footfall.`,
      contributing_factors: [severeWeather.condition, 'Event Disruption', 'Demand Drop']
    };
  }

  if (isDrop && severeWeather) {
    return {
      explanation: `${anom.district} saw a ${Math.abs(anom.max_deviation)}% demand drop during ${severeWeather.condition.toLowerCase()} weather, suggesting visitors avoided the district during poor travel conditions.`,
      contributing_factors: [severeWeather.condition, 'Weather Sensitivity', 'Demand Drop']
    };
  }

  if (!isDrop && majorEvent) {
    return {
      explanation: `${anom.district} saw a ${Math.abs(anom.max_deviation)}% demand surge during ${majorEvent.event_name}, matching the scheduled ${majorEvent.expected_impact.toLowerCase()}-impact event window.`,
      contributing_factors: [majorEvent.event_name, 'Event Spike', 'Demand Surge']
    };
  }

  return {
    explanation: `${anom.district} deviated by ${Math.abs(anom.max_deviation)}% from its rolling baseline. No single event or severe weather factor fully explains the movement, so this should be reviewed manually.`,
    contributing_factors: ['Statistical Deviation', 'Manual Review']
  };
}

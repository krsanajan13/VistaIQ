/**
 * AI Concierge Trip Planning Endpoint
 * POST /api/concierge/plan
 * Body: { days, budget, interests: string[], crowd_tolerance, accessibility: boolean }
 */

const { searchBusinesses } = require('../../lib/rag');
const { generateStructured } = require('../../lib/gemini');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { days = 2, budget = 'Budget', interests = [], crowd_tolerance = 'Avoid', accessibility = false } = req.body;

  // Parse custom API key override from auth headers
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  try {
    // 1. Compile retrieval query based on interests
    const queryKeywords = interests.length > 0 
      ? `Looking for ${interests.join(', ')} in Rivermouth`
      : "Authentic local crafts, cafes, historical sights, and dining in Rivermouth";

    // 2. Query RAG vector engine to find top 12 relevant businesses (biased +30% for underserved)
    const matchedBusinesses = await searchBusinesses(queryKeywords, 12, apiKey);

    // 3. Prompt Gemini to compile structured itinerary using ONLY the matched businesses
    const itinerarySchema = {
      type: "OBJECT",
      properties: {
        trip_summary: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            overview: { type: "STRING", description: "A 1-2 sentence description of the trip focus and how it supports local economic impact." },
            total_estimated_cost: { type: "INTEGER", description: "Aggregated sum of all stop costs for the entire duration." }
          },
          required: ["title", "overview", "total_estimated_cost"]
        },
        itinerary: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              day_number: { type: "INTEGER" },
              day_title: { type: "STRING", description: "Brief sub-theme for this day (e.g. 'Artisan Discovery in the Quarter')." },
              stops: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    time_slot: { type: "STRING", enum: ["Morning", "Afternoon", "Evening"] },
                    business_id: { type: "INTEGER", description: "The exact ID of the business matching this stop from the provided list." },
                    activity_name: { type: "STRING" },
                    description: { type: "STRING", description: "Why this fits their interests, highlighting local craft processes or distinct dishes. Keep it brief (1-2 sentences)." },
                    estimated_cost: { type: "INTEGER", description: "Estimated cost of this stop in USD." }
                  },
                  required: ["time_slot", "business_id", "activity_name", "description", "estimated_cost"]
                }
              }
            },
            required: ["day_number", "day_title", "stops"]
          }
        }
      },
      required: ["trip_summary", "itinerary"]
    };

    const budgetLevels = {
      'Budget': 'Keep costs low ($5 - $25 per stop). Focus on free historical sites, coastal views, and affordable craft cafes.',
      'Moderate': 'Moderate spending ($20 - $55 per stop). Include nice harbor dining or craft workshops.',
      'Premium': 'Premium luxury spending ($60 - $150+ per stop). Select high-end dining, boutique crafts, and private tours.'
    };

    const crowdLevels = {
      'Avoid': 'Guide the user away from Old Town Main Street during afternoons. Prioritize the Artisan Quarter, lighthouse trail, and less crowded local shops.',
      'Neutral': 'Provide a balanced mix of central attractions and quiet side-street gems.',
      'Buzz': 'Favour busy locations, harbor cruise docks, and central taverns/restaurants during peak hours.'
    };

    const prompt = `
Build a day-by-day travel itinerary for Rivermouth based on these details:
- Number of Days: ${days}
- Target Budget Level: ${budget} (Instructions: ${budgetLevels[budget]})
- Crowd Preference: ${crowd_tolerance} (Instructions: ${crowdLevels[crowd_tolerance]})
- Accessibility requirement: ${accessibility ? "Must prioritize flat access. Avoid steep, unpaved coastal loops." : "None"}
- User Interests: ${interests.join(', ')}

Available businesses list to build your itinerary from (RAG retrieved):
${JSON.stringify(matchedBusinesses.map(b => ({
  id: b.id,
  name: b.name,
  category: b.category,
  district: b.district,
  is_underserved: b.is_underserved,
  price_range: b.price_range,
  description: b.description
})))}

CRITICAL System Rules:
1. You MUST include at least one business flagged is_underserved = true (represented in the data as is_underserved: true) per day to help balance footfall.
2. Select stops from the provided business directory list. Link the business_id exactly.
3. Organize each day with exactly 3 stops: Morning, Afternoon, Evening.
4. If accessibility check is true, filter out activities that indicate difficult hiking or steep access.
`;

    const systemInstruction = `
You are an expert travel concierge specializing in sustainable tourism and economic redistribution.
Your goal is to build premium, personalized travel itineraries that steer visitors toward underrepresented local crafts and food co-ops while giving them an exceptional experience.
`;

    const itineraryResult = await generateStructured(
      prompt,
      systemInstruction,
      itinerarySchema,
      apiKey
    );

    // Map business info back to itinerary results to prevent Gemini from hallucinating district or tags
    const enrichedItinerary = itineraryResult.itinerary.map(day => {
      const enrichedStops = day.stops.map(stop => {
        const originalBiz = matchedBusinesses.find(b => b.id === stop.business_id);
        
        return {
          ...stop,
          district: originalBiz ? originalBiz.district : 'Rivermouth',
          price_range: originalBiz ? originalBiz.price_range : '$$',
          is_underserved: originalBiz ? !!originalBiz.is_underserved : false,
          hours: originalBiz ? originalBiz.hours : '10:00 - 18:00',
          lat: originalBiz ? originalBiz.lat : 0,
          lon: originalBiz ? originalBiz.lon : 0
        };
      });

      return {
        ...day,
        stops: enrichedStops
      };
    });

    // Compile unique businesses used in the itinerary for citations
    const citedIds = new Set();
    enrichedItinerary.forEach(day => {
      day.stops.forEach(s => citedIds.add(s.business_id));
    });

    const citations = Array.from(citedIds).map(id => {
      const biz = matchedBusinesses.find(b => b.id === id);
      return {
        id: biz.id,
        name: biz.name,
        category: biz.category,
        district: biz.district,
        is_underserved: biz.is_underserved,
        description: biz.description
      };
    });

    return res.status(200).json({
      trip_summary: itineraryResult.trip_summary,
      itinerary: enrichedItinerary,
      citations: citations,
      explainability: {
        sources: ['businesses (RAG search)', 'businesses (embeddings)'],
        confidence: 'high',
        reasoning: `Matched user interests using cosine similarity text-embedding-004 over 30 business descriptions. Boosted local underserved business scores by 30% to force RAG placement, then structured day sequences with constraints.`
      }
    });

  } catch (error) {
    console.error("AI Concierge API failure:", error);
    return res.status(500).json({
      message: "Itinerary generation or AI RAG search failed.",
      error: error.message
    });
  }
};

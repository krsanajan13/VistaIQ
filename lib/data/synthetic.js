/**
 * Rivermouth Tourism & Economic Synthetic Data Generator
 * Generates 1 year of daily records for:
 * - weather (1095 rows)
 * - events (36 rows)
 * - footfall (1095 rows)
 * - spend (10,950 rows)
 * - reviews (300 rows)
 * 
 * Includes deterministic seasonal trends, event spikes, weather impacts, and economic anomalies.
 */

const businesses = require('./businesses');

function generateSyntheticData() {
  const districts = ['Old Town', 'Harbor', 'Artisan Quarter'];
  
  // Date range: 2025-01-01 to 2025-12-31 (365 days)
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-12-31');
  const dates = [];
  let curr = new Date(startDate);
  while (curr <= endDate) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  // --- 1. Weather Generation ---
  // Shared weather per day for Rivermouth
  const weatherList = [];
  const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Windy'];
  
  dates.forEach((date) => {
    const month = date.getMonth(); // 0 = Jan, 11 = Dec
    const dateStr = date.toISOString().split('T')[0];
    
    let condition = 'Cloudy';
    let temp = 12; // Base Celsius
    
    // Seasonality logic
    if (month >= 5 && month <= 8) { // Summer: Jun - Sep
      temp = Math.round(20 + Math.random() * 10); // 20-30 C
      condition = Math.random() < 0.6 ? 'Sunny' : (Math.random() < 0.8 ? 'Cloudy' : 'Rainy');
    } else if (month <= 1 || month === 11) { // Winter: Dec - Feb
      temp = Math.round(-2 + Math.random() * 8); // -2 to 6 C
      condition = Math.random() < 0.4 ? 'Snowy' : (Math.random() < 0.8 ? 'Rainy' : 'Cloudy');
    } else { // Spring/Autumn
      temp = Math.round(8 + Math.random() * 10); // 8-18 C
      condition = Math.random() < 0.4 ? 'Sunny' : (Math.random() < 0.7 ? 'Cloudy' : 'Rainy');
    }
    
    // Inject October Flood Anomaly Weather: Oct 12 to Oct 16
    if (month === 9 && date.getDate() >= 12 && date.getDate() <= 16) {
      condition = 'Rainy';
      temp = 6;
    }

    districts.forEach((dist) => {
      weatherList.push({
        date: dateStr,
        district: dist,
        condition: condition,
        temp: temp
      });
    });
  });

  // --- 2. Events Calendar ---
  // List of major and minor events in Rivermouth for 2025
  const eventsList = [
    // Harbor events
    { date: '2025-05-17', district: 'Harbor', event_name: 'Spring Maritime Parade', expected_impact: 'High' },
    { date: '2025-06-20', district: 'Harbor', event_name: 'Harbor Music & Solstice Fest', expected_impact: 'Critical' },
    { date: '2025-06-21', district: 'Harbor', event_name: 'Harbor Music & Solstice Fest', expected_impact: 'Critical' },
    { date: '2025-06-22', district: 'Harbor', event_name: 'Harbor Music & Solstice Fest', expected_impact: 'Critical' },
    { date: '2025-08-09', district: 'Harbor', event_name: 'Seafood & Lobster Festival', expected_impact: 'High' },
    { date: '2025-08-10', district: 'Harbor', event_name: 'Seafood & Lobster Festival', expected_impact: 'High' },
    
    // Artisan Quarter events
    { date: '2025-04-12', district: 'Artisan Quarter', event_name: 'Spring Pottery Open Studio', expected_impact: 'Medium' },
    { date: '2025-10-11', district: 'Artisan Quarter', event_name: 'Autumn Heritage Craft Fair', expected_impact: 'High' },
    { date: '2025-10-12', district: 'Artisan Quarter', event_name: 'Autumn Heritage Craft Fair', expected_impact: 'High' }, // Cancelled day 2 due to flood
    
    // Old Town events
    { date: '2025-07-04', district: 'Old Town', event_name: 'Independence Day Gala', expected_impact: 'High' },
    { date: '2025-09-01', district: 'Old Town', event_name: 'End of Summer Block Party', expected_impact: 'Medium' },
    { date: '2025-10-31', district: 'Old Town', event_name: 'Cobblestone Ghost Walk', expected_impact: 'Medium' },
    { date: '2025-12-19', district: 'Old Town', event_name: 'Winter Wonderland Lights', expected_impact: 'High' },
    { date: '2025-12-20', district: 'Old Town', event_name: 'Winter Wonderland Lights', expected_impact: 'High' }, // Event cancelled due to power outage
    { date: '2025-12-21', district: 'Old Town', event_name: 'Winter Wonderland Lights', expected_impact: 'High' }
  ];

  // Add weekly Saturday Artisan markets in Artisan Quarter
  dates.forEach((date) => {
    if (date.getDay() === 6) { // Saturday
      const dateStr = date.toISOString().split('T')[0];
      // Skip if there's already a craft fair on that day
      if (!eventsList.some(e => e.date === dateStr && e.district === 'Artisan Quarter')) {
        eventsList.push({
          date: dateStr,
          district: 'Artisan Quarter',
          event_name: 'Weekly Saturday Craft Market',
          expected_impact: 'Medium'
        });
      }
    }
  });

  // --- 3. Footfall Generation ---
  const footfallList = [];
  
  dates.forEach((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const month = date.getMonth();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isSaturday = date.getDay() === 6;
    
    // Day of year factor for broad seasonal curve (peaks in July, dips in January)
    const dayOfYear = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    const seasonalMultiplier = 1 + 0.4 * Math.sin((2 * Math.PI * (dayOfYear - 120)) / 365); // Peaks mid-summer

    // Find weather condition for this date
    const dayWeather = weatherList.find(w => w.date === dateStr && w.district === 'Old Town') || { condition: 'Cloudy', temp: 12 };
    
    districts.forEach((dist) => {
      let baseFootfall = 0;
      let weekdayFactor = isWeekend ? (isSaturday ? 1.3 : 1.15) : 0.9;
      let weatherFactor = 1.0;
      let eventFactor = 1.0;
      
      // District Base Footfall
      if (dist === 'Old Town') {
        baseFootfall = 2500;
        // Weather impact in historic narrow streets
        if (dayWeather.condition === 'Rainy') weatherFactor = 0.75;
        if (dayWeather.condition === 'Snowy') weatherFactor = 0.5;
        if (dayWeather.condition === 'Sunny') weatherFactor = 1.1;
      } else if (dist === 'Harbor') {
        baseFootfall = 1200;
        // Highly weather/season sensitive waterfront
        weekdayFactor = isWeekend ? 1.5 : 0.8;
        if (dayWeather.condition === 'Rainy') weatherFactor = 0.5;
        if (dayWeather.condition === 'Snowy') weatherFactor = 0.2;
        if (dayWeather.condition === 'Sunny') weatherFactor = 1.3;
        if (dayWeather.condition === 'Windy') weatherFactor = 0.8;
        
        // Harbor has huge summer-winter swings
        const harborSeasonal = 1 + 0.8 * Math.sin((2 * Math.PI * (dayOfYear - 120)) / 365);
        baseFootfall = baseFootfall * harborSeasonal;
      } else if (dist === 'Artisan Quarter') {
        baseFootfall = 4500 / 10; // ~450 base
        // Covered shops, less weather sensitive
        if (dayWeather.condition === 'Rainy') weatherFactor = 0.9;
        if (dayWeather.condition === 'Snowy') weatherFactor = 0.7;
        if (dayWeather.condition === 'Sunny') weatherFactor = 1.0;
      }

      // Apply event impacts
      const dayEvents = eventsList.filter(e => e.date === dateStr && e.district === dist);
      dayEvents.forEach(ev => {
        if (ev.expected_impact === 'Critical') eventFactor += 2.0; // 3x footfall
        if (ev.expected_impact === 'High') eventFactor += 1.0;     // 2x footfall
        if (ev.expected_impact === 'Medium') eventFactor += 0.4;   // 1.4x footfall
      });

      // Calculate final footfall (with random variance)
      const noise = 0.9 + Math.random() * 0.2; // +/- 10%
      let finalFootfall = Math.round(baseFootfall * seasonalMultiplier * weekdayFactor * weatherFactor * eventFactor * noise);

      // --- INJECT ANOMALIES ---
      
      // 1. Major October Flood Anomaly: Oct 12 to Oct 16
      if (month === 9 && date.getDate() >= 12 && date.getDate() <= 16) {
        finalFootfall = Math.round(finalFootfall * 0.15); // 85% drop
      }

      // 2. Winter Wonderland Cancellation: Dec 20 (Old Town)
      if (dist === 'Old Town' && dateStr === '2025-12-20') {
        finalFootfall = Math.round(finalFootfall * 0.25); // 75% drop due to local power grid gridlock
      }

      footfallList.push({
        date: dateStr,
        district: dist,
        visitor_count: Math.max(10, finalFootfall),
        source: Math.random() < 0.5 ? 'Transit Sensor' : (Math.random() < 0.7 ? 'Mobile Telemetry' : 'Public Wi-Fi Taps')
      });
    });
  });

  // --- 4. Spend Transaction Data ---
  const spendList = [];

  dates.forEach((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Pre-match footfall for the district
    const districtFootfalls = {};
    districts.forEach(d => {
      const match = footfallList.find(f => f.date === dateStr && f.district === d);
      districtFootfalls[d] = match ? match.visitor_count : 100;
    });

    businesses.forEach((biz) => {
      const parentFootfall = districtFootfalls[biz.district];
      
      // Basic conversion rate (percent of district visitors who purchase)
      let conversionRate = 0.08; // 8% average
      
      // Underserved businesses have lower conversion/visibility normally
      if (biz.is_underserved) {
        conversionRate = 0.04; // 4% (due to lack of signs/marketing)
      }
      
      // Increase conversion for food during lunch/dinner, weekends
      if (biz.category === 'Food & Drink') {
        conversionRate += 0.03;
      }
      
      // Weekend spending conversions
      if (isWeekend) {
        conversionRate += 0.015;
      }

      // Daily transactions
      const txCount = Math.max(1, Math.round(parentFootfall * conversionRate));
      
      // Average Ticket value per transaction based on price tier
      let avgTicket = 15;
      if (biz.price_range === '$$') avgTicket = 35;
      if (biz.price_range === '$$$') avgTicket = 85;
      
      // Random price fluctuation
      const noise = 0.85 + Math.random() * 0.3; // +/- 15%
      const totalAmount = Math.round(txCount * avgTicket * noise);

      spendList.push({
        date: dateStr,
        business_id: biz.id,
        amount: Math.max(5, totalAmount),
        category: biz.category
      });
    });
  });

  // --- 5. Reviews Generation ---
  // Static reviews pool to give high quality text snippets to businesses
  const reviewsList = [];
  const positiveSnippets = [
    "Absolutely loved this place! Friendly staff and incredible quality.",
    "A hidden treasure in Rivermouth. Highly recommend making the trip here.",
    "Outstanding craft quality. You can tell they put a lot of heart into it.",
    "Fabulous atmosphere and authentic local vibes. A must-see!",
    "Amazing experience, excellent customer service, and very reasonable pricing.",
    "The highlight of our trip. Truly local and far from the crowded tourist traps.",
    "Superb local find. Support these small businesses, it's worth it!",
    "Stumbled upon this shop by accident and bought three beautiful handmade items."
  ];

  const mixedSnippets = [
    "Decent selection but quite crowded during peak hours.",
    "Nice items but a bit overpriced compared to nearby alternatives.",
    "Good service, though we had to wait in line for 20 minutes.",
    "Standard tourist spot. Nice view but nothing extraordinary.",
    "The products are fine but the customer service was a bit slow today."
  ];

  const negativeSnippets = [
    "Way too crowded. Felt like a tourist conveyor belt. Avoid during midday.",
    "Disappointing quality for the price. Mass produced feel.",
    "Staff seemed overwhelmed and ignored us. Extremely noisy.",
    "Generic experience, tourist trap pricing. Wouldn't return.",
    "Long lines, nowhere to sit, and very high prices. Skip this."
  ];

  businesses.forEach((biz) => {
    // Generate ~10 reviews per business distributed across the year
    let numReviews = 10;
    let avgRating = 4.0;
    
    // Tailor reviews by district and business type
    if (biz.is_underserved) {
      avgRating = 4.7; // Under-visited but highly rated
    } else if (biz.district === 'Old Town') {
      avgRating = 3.9; // Crowded hotspots have slightly lower ratings
    } else if (biz.district === 'Harbor') {
      avgRating = 4.2;
    }

    for (let i = 0; i < numReviews; i++) {
      let rating = 4;
      let text = "";
      let sentiment = "Neutral";
      
      const scoreRoll = Math.random();
      if (avgRating > 4.5) { // Exceptional
        rating = scoreRoll < 0.7 ? 5 : (scoreRoll < 0.9 ? 4 : 3);
      } else if (avgRating < 4.0) { // Mixed
        rating = scoreRoll < 0.3 ? 5 : (scoreRoll < 0.6 ? 4 : (scoreRoll < 0.85 ? 3 : 2));
      } else { // Standard
        rating = scoreRoll < 0.4 ? 5 : (scoreRoll < 0.8 ? 4 : (scoreRoll < 0.95 ? 3 : 2));
      }

      if (rating >= 4) {
        text = positiveSnippets[Math.floor(Math.random() * positiveSnippets.length)];
        sentiment = 'Positive';
      } else if (rating === 3) {
        text = mixedSnippets[Math.floor(Math.random() * mixedSnippets.length)];
        sentiment = 'Neutral';
      } else {
        text = negativeSnippets[Math.floor(Math.random() * negativeSnippets.length)];
        sentiment = 'Negative';
      }

      // Pick a random date during 2025
      const randomDate = dates[Math.floor(Math.random() * dates.length)];
      
      reviewsList.push({
        business_id: biz.id,
        rating: rating,
        text_snippet: text,
        date: randomDate.toISOString().split('T')[0],
        sentiment: sentiment
      });
    }
  });

  return {
    footfall: footfallList,
    spend: spendList,
    reviews: reviewsList,
    events: eventsList,
    weather: weatherList
  };
}

module.exports = generateSyntheticData;

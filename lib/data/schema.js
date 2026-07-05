/**
 * SQLite Database Schema and NL-to-SQL System Configuration
 * Defines:
 * - Table structures
 * - Columns and relations
 * - System instructions for SQL generation
 * - Few-shot examples
 */

const schemaText = `
CREATE TABLE businesses (
  id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,
  district TEXT,
  lat REAL,
  lon REAL,
  is_underserved BOOLEAN, -- 1 = true (underserved/hidden local gems), 0 = false (standard)
  price_range TEXT, -- '$', '$$', '$$$'
  hours TEXT,
  description TEXT
);

CREATE TABLE footfall (
  date TEXT, -- 'YYYY-MM-DD'
  district TEXT,
  visitor_count INTEGER,
  source TEXT
);

CREATE TABLE spend (
  date TEXT, -- 'YYYY-MM-DD'
  business_id INTEGER,
  amount INTEGER, -- total dollar volume for that day
  category TEXT,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE reviews (
  business_id INTEGER,
  rating INTEGER, -- 1 to 5 stars
  text_snippet TEXT,
  date TEXT, -- 'YYYY-MM-DD'
  sentiment TEXT, -- 'Positive', 'Neutral', 'Negative'
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE events (
  date TEXT, -- 'YYYY-MM-DD'
  district TEXT,
  event_name TEXT,
  expected_impact TEXT -- 'Low', 'Medium', 'High', 'Critical'
);

CREATE TABLE weather (
  date TEXT, -- 'YYYY-MM-DD'
  district TEXT,
  condition TEXT, -- 'Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Windy'
  temp INTEGER -- in Celsius
);
`;

const fewShots = [
  {
    question: "Show visitor footfall by district for the last 3 months.",
    sql: "SELECT district, SUM(visitor_count) as total_footfall FROM footfall WHERE date >= '2025-10-01' GROUP BY district ORDER BY total_footfall DESC;"
  },
  {
    question: "Compare total transaction amounts by business category.",
    sql: "SELECT category, SUM(amount) as total_spend FROM spend GROUP BY category ORDER BY total_spend DESC;"
  },
  {
    question: "Which businesses have the lowest ratings and what is their district?",
    sql: "SELECT b.name, b.district, ROUND(AVG(r.rating), 2) as avg_rating FROM businesses b JOIN reviews r ON b.id = r.business_id GROUP BY b.id HAVING avg_rating < 4.0 ORDER BY avg_rating ASC;"
  },
  {
    question: "What was the footfall trend in Harbor District during its summer festival in June 2025?",
    sql: "SELECT date, visitor_count FROM footfall WHERE district = 'Harbor' AND date BETWEEN '2025-06-15' AND '2025-06-25' ORDER BY date ASC;"
  },
  {
    question: "Show me the top 5 local businesses in Artisan Quarter that are underserved but have excellent reviews.",
    sql: "SELECT b.name, ROUND(AVG(r.rating), 2) as rating, COUNT(r.rating) as review_count FROM businesses b JOIN reviews r ON b.id = r.business_id WHERE b.district = 'Artisan Quarter' AND b.is_underserved = 1 GROUP BY b.id HAVING rating >= 4.5 ORDER BY rating DESC LIMIT 5;"
  },
  {
    question: "How does rainy weather affect footfall in the Harbor district?",
    sql: "SELECT w.condition, ROUND(AVG(f.visitor_count), 0) as avg_footfall FROM footfall f JOIN weather w ON f.date = w.date AND f.district = w.district WHERE f.district = 'Harbor' GROUP BY w.condition ORDER BY avg_footfall DESC;"
  }
];

module.exports = {
  schemaText,
  fewShots
};

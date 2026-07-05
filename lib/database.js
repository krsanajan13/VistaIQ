/**
 * SQLite Database Manager
 * Initializes SQL.js (WebAssembly SQLite) in-memory database,
 * seeds the synthetic dataset, and executes queries.
 * Handles warming/caching across Vercel serverless warm calls.
 */

const initSqlJs = require('sql.js');
const { schemaText } = require('./data/schema');
const businesses = require('./data/businesses');
const generateSyntheticData = require('./data/synthetic');

let dbInstance = null;

/**
 * Initialize and seed the in-memory database
 */
async function initDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  console.log("Initializing in-memory SQLite database via SQL.js...");
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // 1. Create tables
  db.run(schemaText);
  console.log("Database tables created successfully.");

  // 2. Insert businesses
  db.run("BEGIN TRANSACTION;");
  const bizStmt = db.prepare(`
    INSERT INTO businesses (id, name, category, district, lat, lon, is_underserved, price_range, hours, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);
  
  for (const b of businesses) {
    bizStmt.run([
      b.id,
      b.name,
      b.category,
      b.district,
      b.lat,
      b.lon,
      b.is_underserved ? 1 : 0,
      b.price_range,
      b.hours,
      b.description
    ]);
  }
  bizStmt.free();
  db.run("COMMIT;");
  console.log(`Inserted ${businesses.length} businesses.`);

  // 3. Generate and insert synthetic data
  console.log("Generating synthetic dataset...");
  const data = generateSyntheticData();
  
  // Insert Footfall
  db.run("BEGIN TRANSACTION;");
  const ffStmt = db.prepare(`
    INSERT INTO footfall (date, district, visitor_count, source)
    VALUES (?, ?, ?, ?);
  `);
  for (const f of data.footfall) {
    ffStmt.run([f.date, f.district, f.visitor_count, f.source]);
  }
  ffStmt.free();
  db.run("COMMIT;");
  console.log(`Seeded ${data.footfall.length} footfall records.`);

  // Insert Spend
  db.run("BEGIN TRANSACTION;");
  const spStmt = db.prepare(`
    INSERT INTO spend (date, business_id, amount, category)
    VALUES (?, ?, ?, ?);
  `);
  for (const s of data.spend) {
    spStmt.run([s.date, s.business_id, s.amount, s.category]);
  }
  spStmt.free();
  db.run("COMMIT;");
  console.log(`Seeded ${data.spend.length} transaction records.`);

  // Insert Reviews
  db.run("BEGIN TRANSACTION;");
  const rvStmt = db.prepare(`
    INSERT INTO reviews (business_id, rating, text_snippet, date, sentiment)
    VALUES (?, ?, ?, ?, ?);
  `);
  for (const r of data.reviews) {
    rvStmt.run([r.business_id, r.rating, r.text_snippet, r.date, r.sentiment]);
  }
  rvStmt.free();
  db.run("COMMIT;");
  console.log(`Seeded ${data.reviews.length} reviews.`);

  // Insert Events
  db.run("BEGIN TRANSACTION;");
  const evStmt = db.prepare(`
    INSERT INTO events (date, district, event_name, expected_impact)
    VALUES (?, ?, ?, ?);
  `);
  for (const e of data.events) {
    evStmt.run([e.date, e.district, e.event_name, e.expected_impact]);
  }
  evStmt.free();
  db.run("COMMIT;");
  console.log(`Seeded ${data.events.length} events.`);

  // Insert Weather
  db.run("BEGIN TRANSACTION;");
  const wtStmt = db.prepare(`
    INSERT INTO weather (date, district, condition, temp)
    VALUES (?, ?, ?, ?);
  `);
  for (const w of data.weather) {
    wtStmt.run([w.date, w.district, w.condition, w.temp]);
  }
  wtStmt.free();
  db.run("COMMIT;");
  console.log(`Seeded ${data.weather.length} weather records.`);

  dbInstance = db;
  return dbInstance;
}

/**
 * Execute a SQL query and format the result as an array of objects
 */
async function query(sql) {
  const db = await initDatabase();
  try {
    const res = db.exec(sql);
    if (res.length === 0) {
      return [];
    }

    const columns = res[0].columns;
    const values = res[0].values;
    
    // Convert SQL.js array matrix into array of key-value objects
    const objects = values.map((row) => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    return {
      columns,
      rows: objects
    };
  } catch (error) {
    console.error(`Database query failed for SQL: ${sql}`, error);
    throw error;
  }
}

module.exports = {
  initDatabase,
  query
};

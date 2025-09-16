// db.js
const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false, // Neon requires SSL in prod
  max: parseInt(process.env.PG_MAX_CLIENTS || "6", 10),      // safe defaults for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,  // Increased timeout for Render
  allowExitOnIdle: true,           // Helps with connection cleanup
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

pool.on("connect", (client) => {
  console.log("✅ New client connected to database");
});

pool.on("remove", (client) => {
  console.log("🔌 Client removed from pool");
});

// Test database connection on startup
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log("✅ Database connected successfully at:", result.rows[0].now);
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

// Call test connection when module is loaded
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = pool;
// // db.js
// const { Pool } = require('pg');

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 5432,
//   max: 10, // maximum number of clients in the pool
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });

// module.exports = pool;
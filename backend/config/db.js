const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test connection on startup
pool.connect()
  .then(() => console.log('PostgreSQL connected ✅'))
  .catch((err) => console.error('DB error:', err));

module.exports = pool;

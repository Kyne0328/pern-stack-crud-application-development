const {Pool} = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Create server/.env using server/env.example.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error);
});

module.exports = {pool};

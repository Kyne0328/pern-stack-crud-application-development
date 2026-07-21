import 'dotenv/config';
import app from './app.js';
import { pool } from './config/database.js';

const port = Number(process.env.PORT) || 5000;
const server = app.listen(port, () => console.log(`Employee API listening on http://localhost:${port}`));

async function shutdown(signal) {
  console.log(`${signal} received. Closing server.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

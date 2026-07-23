const app = require('./app');
const {pool} = require('./config/database');
const {env} = require('./config/environment');

const server = app.listen(env.PORT, () => {
  console.log(`Employee API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing server.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

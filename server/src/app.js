import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pool } from './config/database.js';
import employeeRoutes from './routes/employeeRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({origin: clientOrigin}));
app.use(express.json({limit: '100kb'}));

app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.status(200).json({success: true, status: 'ok', service: 'pern-employee-api', timestamp: new Date().toISOString()});
});

app.use('/api/employees', employeeRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

require('dotenv/config');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {pool} = require('./config/database');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const {errorHandler, notFoundHandler} = require('./middleware/errorHandler');

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

app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

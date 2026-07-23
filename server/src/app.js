const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const {pool} = require('./config/database');
const {env} = require('./config/environment');
const authRoutes = require('./auth/authRoutes');
const {requireAuth} = require('./auth/requireAuth');
const departmentRoutes = require('./department/departmentRoutes');
const employeeRoutes = require('./employee/employeeRoutes');
const {errorHandler, notFoundHandler} = require('./middleware/errorHandler');

const app = express();

if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({origin: env.CLIENT_ORIGIN, credentials: true}));
app.use(express.json({limit: '100kb'}));
app.use(session({
  name: 'employee.sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'pern-employee-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/departments', requireAuth, departmentRoutes);
app.use('/api/employees', requireAuth, employeeRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

require('express-async-errors');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const goalRoutes = require('./routes/goalRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'WealthWise API is running 🚀', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 WealthWise Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
});

module.exports = app;

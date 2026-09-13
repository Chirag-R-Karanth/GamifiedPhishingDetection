const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const gameRoutes = require('./routes/gameRoutes');
const mlRoutes = require('./routes/mlRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/users', userRoutes);

// Root endpoint for status checks
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'PhishQuest API Service',
    uptime: process.uptime()
  });
});

// Global 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;

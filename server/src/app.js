const express = require('express');
const cors = require('cors');

// Middleware
const correlationMiddleware = require('./middlewares/correlationMiddleware');
const requestLogger = require('./middlewares/requestLogger');
const errorMiddleware = require('./middlewares/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const boardRoutes = require('./routes/boardRoutes');
const listRoutes = require('./routes/listRoutes');
const cardRoutes = require('./routes/cardRoutes');

const app = express();

// 1) Core middleware
app.use(cors());
app.use(express.json());

// 2) Correlation ID + Request Logger (BEFORE routes)
app.use(correlationMiddleware);
app.use(requestLogger);

// 3) Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

app.get('/', (req, res) => {
  res.send('CollabBoard API is running...');
});

// 4) Centralized Error Handler (AFTER routes)
app.use(errorMiddleware);

module.exports = app;

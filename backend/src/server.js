require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const calculatorRoutes = require('./routes/calculator');
const foodRoutes = require('./routes/food');
const dietRoutes = require('./routes/diet');
const workoutRoutes = require('./routes/workout');
const progressRoutes = require('./routes/progress');
const grokRoutes = require('./routes/grok');
const paymentRoutes = require('./routes/payment');
const emailRoutes = require('./routes/email');
const adminRoutes = require('./routes/admin');
const { startDailySummaryCron } = require('./utils/scheduler');

// Start scheduled cron jobs
startDailySummaryCron();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/grok', grokRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'NutriBudget AI API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

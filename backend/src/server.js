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

// Explicit CORS — must be BEFORE helmet so error responses always include the header
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, false); // Fail silently instead of crashing
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: false, // Disable CSP — not needed for an API server
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'NutriBudget AI API is running',
    debug: {
      hasUrl: !!process.env.SUPABASE_URL,
      urlStartsHttps: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.startsWith('https') : false,
      hasKey: !!process.env.SUPABASE_ANON_KEY,
      keyLength: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : 0,
      keyStartsSb: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.startsWith('sb_') : false,
      hasJwtSecret: !!process.env.JWT_SECRET,
      envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('JWT'))
    }
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

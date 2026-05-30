const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { startGuestCleanup } = require('./services/guestCleanup');

const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

const requiredEnv = ['JWT_SECRET'];
if (process.env.NODE_ENV === 'production') requiredEnv.push('CLIENT_URL');

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) missingEnv.push('MONGODB_URI or MONGO_URI');
if (missingEnv.length) {
  console.error(`Missing required environment variable(s): ${missingEnv.join(', ')}`);
  process.exit(1);
}

const parseClientOrigins = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173';
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
};

const clientOrigins = parseClientOrigins();

connectDB();
startGuestCleanup();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...clientOrigins],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: { action: 'deny' },
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 15552000, includeSubDomains: true, preload: true }
    : false,
  referrerPolicy: { policy: 'no-referrer' },
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin || clientOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.originalUrl.endsWith('/auth/health'),
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI request limit reached. Please wait a moment.' },
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NeuroTrack AI API is running!',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  NeuroTrack AI Server
  ====================
  Running on 0.0.0.0:${PORT}
  Mode: ${process.env.NODE_ENV}
  API: http://localhost:${PORT}/api
  `);
});

module.exports = app;

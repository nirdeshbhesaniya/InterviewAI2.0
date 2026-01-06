const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./Routes/authRoutes');

const app = express();

// Trust proxy for reverse proxy compatibility (Nginx, Cloudflare)
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  "https://interviewai2-0.onrender.com"
].filter(Boolean).map(origin => origin.replace(/\/$/, "")); // Remove trailing slashes

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server & tools like Postman
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith(".azurestaticapps.net") ||
      normalizedOrigin.endsWith(".onrender.com") // Wildcard for all render subdomains
    ) {
      return callback(null, true);
    }

    console.log(`❌ CORS BLOCKED: Origin [${origin}] is not allowed.`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "user-email"],
  optionsSuccessStatus: 200 // For legacy browser support
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Rate limiting for login API - 10 requests per minute per IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after a minute'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipFailedRequests: false, // Count failed requests
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many login attempts from this IP, please try again after a minute',
      retryAfter: 60
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "InterviewAI Backend is running 🚀"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});


// API Routes
app.use('/api/auth', authRoutes);

// Apply rate limiting specifically to login endpoint
app.use('/api/auth/login', loginLimiter);
app.use('/api/profile', require('./Routes/profileRoutes'));

// LangChain-powered routes (new implementations with memory & structured outputs)
app.use('/api/interview', require('./Routes/interview-langchain'));
app.use('/api/chatbot', require('./Routes/chatbot-langchain'));
app.use('/api/mcq', require('./Routes/mcq'));

// Other routes
app.use('/api/compile', require('./Routes/compile'));
app.use('/api/support', require('./Routes/support_new'));
app.use('/api/notifications', require('./Routes/notifications'));
app.use('/api/settings', require('./Routes/settings'));
app.use('/api/admin', require('./Routes/adminRoutes'));
app.use('/api/notes', require('./Routes/notes'));
app.use('/api/resources', require('./Routes/resources'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// MongoDB connection with optimized pool settings for high concurrent load
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool optimization for 100-300 concurrent users
      maxPoolSize: 20,        // Maximum 20 concurrent connections
      minPoolSize: 5,         // Maintain 5 idle connections for quick response
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      serverSelectionTimeoutMS: 5000, // 5 seconds server selection timeout
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`✅ Database: ${mongoose.connection.name}`);
    console.log(`✅ Connection pool: min=${mongoose.connection.client.options.minPoolSize}, max=${mongoose.connection.client.options.maxPoolSize}`);
    console.log(`✅ Socket timeout: ${mongoose.connection.client.options.socketTimeoutMS}ms`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('❌ Please check your MONGODB_URI in .env file');
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Interview AI Backend Server with new version 2.0`);
    console.log(`📡 Running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(50));
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;

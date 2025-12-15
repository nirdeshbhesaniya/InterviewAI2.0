const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://white-rock-0f34f2f00.3.azurestaticapps.net",
  process.env.FRONTEND_URL,
  process.env.AZURE_STATIC_WEB_APP_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server & tools like Postman
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".azurestaticapps.net")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

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
app.use('/api/profile', require('./Routes/profileRoutes'));
app.use('/api/interview', require('./Routes/interview'));
app.use('/api/compile', require('./Routes/compile'));
app.use('/api/chatbot', require('./Routes/chatbot'));
app.use('/api/support', require('./Routes/support_new'));
app.use('/api/mcq', require('./Routes/mcq'));
app.use('/api/notifications', require('./Routes/notifications'));
app.use('/api/settings', require('./Routes/settings'));
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

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`✅ Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Interview AI Backend Server`);
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

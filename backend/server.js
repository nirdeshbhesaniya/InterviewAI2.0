const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // ✅ Define PORT here

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve images

// Routes
app.use('/api/auth', authRoutes);
const profileRoutes = require('./Routes/profileRoutes');
app.use('/api/profile', profileRoutes);
const interviewRoutes = require('./Routes/interview');
app.use('/api/interview', interviewRoutes);
const compileRoute = require('./Routes/compile');
app.use('/api/compile', compileRoute);
const chatbotRoutes = require('./Routes/chatbot');
app.use('/api/chatbot', chatbotRoutes);
const supportRoutes = require('./Routes/support_new');
app.use('/api/support', supportRoutes);
const mcqRoutes = require('./Routes/mcq');
app.use('/api/mcq', mcqRoutes);
const notificationRoutes = require('./Routes/notifications');
app.use('/api/notifications', notificationRoutes);
const settingsRoutes = require('./Routes/settings');
app.use('/api/settings', settingsRoutes);
const notesRoutes = require('./Routes/notes');
app.use('/api/notes', notesRoutes);


// Connect to DB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

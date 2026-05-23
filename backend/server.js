require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = async () => {
  // Try connecting using the helper
  const connectHelper = require('./config/db');
  await connectHelper();
};

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Initialize Database Connection
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for simple integration, or restrict to frontend port (e.g. http://localhost:5173) in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Resume Analyzer API Server is running smoothly',
    timestamp: new Date()
  });
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/chat', chatRoutes);

// Fallback Route for Undefined Enpoints
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server executing in production mode on port ${PORT}`);
});

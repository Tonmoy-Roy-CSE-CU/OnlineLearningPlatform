const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const notesRoutes = require('./routes/notes');
const blogRoutes = require('./routes/blogs');
const noticeRoutes = require('./routes/notices');
const adminRoutes = require('./routes/admin');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://frontend-82qb.onrender.com', // Production frontend
    'http://localhost:5173', // Local development (Vite default)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Support cookies or Authorization headers (e.g., JWT)
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Test API Server is running!',
    features: [
      'Authentication (JWT)',
      'Test Management',
      'Notes Management',
      'Blog System',
      'Notice Board System',
      'File Uploads',
      'Admin Dashboard & Management',
    ],
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    backendUrl: process.env.API_URL || `https://backend-lzma.onrender.com`,
    allowedOrigins: corsOptions.origin,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.url} - ${err.stack}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    path: req.originalUrl,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: ${process.env.API_URL || `https://backend-lzma.onrender.com`}`);
  console.log(`🌐 CORS Allowed Origins: ${corsOptions.origin.join(', ')}`);
  console.log(`📝 Available Features:`);
  console.log(`   - Authentication: /api/auth`);
  console.log(`   - Tests: /api/tests`);
  console.log(`   - Notes: /api/notes`);
  console.log(`   - Blogs: /api/blogs`);
  console.log(`   - Notices: /api/notices`);
  console.log(`👑 Admin Dashboard: /api/admin/*`);
  console.log(`📂 Uploads served at: /uploads`);
});

module.exports = app;
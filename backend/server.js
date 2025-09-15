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

// CORS configuration - Updated with all possible origins
const corsOptions = {
  origin: [
    'https://frontend-82qb.onrender.com', // Production frontend
    'http://localhost:5173', // Vite default port
    'http://localhost:3000', // React/Node default port
    'http://localhost:3001', // Alternative port
    'http://localhost:4173', // Vite preview port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true, // Support cookies or Authorization headers (e.g., JWT)
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get('Origin') || 'No Origin'}`);
  next();
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'OLPM API Server is running successfully!',
    status: 'healthy',
    features: [
      'Authentication (JWT)',
      'Test Management',
      'Notes Management',
      'Blog System',
      'Notice Board System',
      'File Uploads',
      'Admin Dashboard & Management',
    ],
    endpoints: {
      auth: '/api/auth/*',
      tests: '/api/tests/*',
      notes: '/api/notes/*',
      blogs: '/api/blogs/*',
      notices: '/api/notices/*',
      admin: '/api/admin/*'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    backendUrl: process.env.API_URL || 'https://backend-lzma.onrender.com',
    allowedOrigins: corsOptions.origin,
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'OLPM API - Available Endpoints',
    version: '1.0.0',
    endpoints: {
      authentication: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      tests: {
        create: 'POST /api/tests/create',
        getByLink: 'GET /api/tests/:link',
        submit: 'POST /api/tests/:id/submit',
        myTests: 'GET /api/tests/my/tests',
        myResults: 'GET /api/tests/my/results',
        analytics: 'GET /api/tests/my/analytics'
      },
      notes: {
        getAll: 'GET /api/notes',
        upload: 'POST /api/notes/upload',
        delete: 'DELETE /api/notes/:id'
      },
      blogs: {
        getAll: 'GET /api/blogs',
        create: 'POST /api/blogs/create',
        like: 'POST /api/blogs/:id/like',
        comment: 'POST /api/blogs/:id/comments'
      },
      notices: {
        getAll: 'GET /api/notices',
        create: 'POST /api/notices/create',
        markRead: 'POST /api/notices/:id/read'
      },
      admin: {
        stats: 'GET /api/admin/dashboard/stats',
        users: 'GET /api/admin/users',
        updateUserStatus: 'PUT /api/admin/users/:id/status',
        deleteUser: 'DELETE /api/admin/users/:id'
      }
    },
    documentation: 'Contact admin for API documentation'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'The requested endpoint does not exist',
    availableRoutes: [
      'GET /',
      'GET /api',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/tests/*',
      'POST /api/tests/*',
      'GET /api/notes',
      'POST /api/notes/upload',
      'GET /api/blogs',
      'POST /api/blogs/create',
      'GET /api/notices',
      'POST /api/notices/create',
      'GET /api/admin/*'
    ],
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ OLPM Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: ${process.env.API_URL || `https://backend-lzma.onrender.com`}`);
  console.log(`🌐 CORS Allowed Origins: ${corsOptions.origin.join(', ')}`);
  console.log(`📝 Available API Endpoints:`);
  console.log(`   🔐 Authentication: /api/auth/*`);
  console.log(`   📋 Tests: /api/tests/*`);
  console.log(`   📓 Notes: /api/notes/*`);
  console.log(`   📝 Blogs: /api/blogs/*`);
  console.log(`   📢 Notices: /api/notices/*`);
  console.log(`   👑 Admin: /api/admin/*`);
  console.log(`📂 Static Files: /uploads/*`);
  console.log(`🏥 Health Check: GET /`);
  console.log(`📖 API Info: GET /api`);
  console.log('');
  console.log('🚀 Server ready to accept connections!');
});

module.exports = app;
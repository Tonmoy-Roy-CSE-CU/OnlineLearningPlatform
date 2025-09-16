const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

// Import your existing routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const notesRoutes = require('./routes/notes');
const blogRoutes = require('./routes/blogs');
const noticeRoutes = require('./routes/notices');
const adminRoutes = require('./routes/admin');

// Import database connection
const pool = require('./db'); // Using your pool connection from db.js

const app = express();

// Trust proxy - Important for Render
app.set('trust proxy', 1);

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration for API endpoints
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://frontend-82qb.onrender.com',
  process.env.FRONTEND_URL,
];

const validOrigins = allowedOrigins.filter(Boolean);

app.use('/api', cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (validOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'Uploads'), {
  maxAge: '1d',
  etag: true,
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'None'}`);
  next();
});

// Home route - Your original route with EJS
app.get('/', (req, res) => {
  res.render('index');
});

// Database test route - Updated for PostgreSQL pool
app.get('/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 + 1 AS solution');
    client.release();
    
    if (result.rows && result.rows.length > 0) {
      res.render('database', { 
        status: 'Database connection test successful! Result: ' + result.rows[0].solution 
      });
    } else {
      res.render('database', { 
        status: 'No rows returned from the query.' 
      });
    }
  } catch (err) {
    console.error('Error with database:', err.stack);
    res.render('database', { 
      status: 'Error connecting to the database: ' + err.message 
    });
  }
});

// API Health check endpoint - JSON response for API consumers
app.get('/api', (req, res) => {
  res.json({
    message: 'Test API Server is running!',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Authentication (JWT)',
      'Test Management',
      'Notes Management',
      'Blog System',
      'Notice Board System',
      'File Uploads',
      'Admin Dashboard & Management'
    ],
    database: 'Connected',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Additional health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', async (req, res) => {
  let dbStatus = 'Connected';
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
  } catch (err) {
    dbStatus = 'Error: ' + err.message;
  }
  
  res.json({
    api: 'Online',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      tests: '/api/tests',
      notes: '/api/notes',
      blogs: '/api/blogs',
      notices: '/api/notices',
      admin: '/api/admin'
    }
  });
});

// API Routes - All your existing API routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  console.error(err.stack);
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      message: 'Origin not allowed'
    });
  }
  
  // JSON parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'Invalid JSON format',
      message: 'Please check your request body'
    });
  }
  
  // For EJS pages, render error page if it exists, otherwise JSON
  if (req.accepts('html') && !req.path.startsWith('/api/')) {
    // You can create an error.ejs template for this
    res.status(500).send(`
      <h1>Server Error</h1>
      <p>Something went wrong!</p>
      <p><a href="/">Go back home</a></p>
    `);
  } else {
    // API error response
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    // API 404
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    // Web page 404 - You can create a 404.ejs template for this
    res.status(404).send(`
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p><a href="/">Go back home</a></p>
    `);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Web Interface: http://localhost:${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔧 DB Test: http://localhost:${PORT}/test-db`);
  console.log('📋 Available Features:');
  console.log('   - Web Interface: / (EJS)');
  console.log('   - Database Test: /test-db');
  console.log('   - Authentication API: /api/auth');
  console.log('   - Tests API: /api/tests');
  console.log('   - Notes API: /api/notes');
  console.log('   - Blogs API: /api/blogs');
  console.log('   - Notices API: /api/notices');
  console.log('   - Admin API: /api/admin');
  console.log('='.repeat(50));
});

module.exports = app;
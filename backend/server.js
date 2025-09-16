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

// Assuming db.js is CommonJS for now (adjust if ES module)
const db = require('./db');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://frontend-82qb.onrender.com',
    'https://backend-lzma.onrender.com' // Replace with your actual backend URL
  ],
  credentials: true
}));
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);

// Health check with database
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    console.error('Health check error:', err.stack);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// General health check
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
      'Admin Dashboard & Management'
    ],
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}`);
  console.log(`📝 Available Features:`);
  console.log(`   - Authentication: /api/auth`);
  console.log(`   - Tests: /api/tests`);
  console.log(`   - Notes: /api/notes`);
  console.log(`   - Blogs: /api/blogs`);
  console.log(`   - Notices: /api/notices`);
  console.log(`👑 Admin Dashboard: /api/admin/*`);
});

module.exports = app;
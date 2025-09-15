const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const notesRoutes = require('./routes/notes');
const blogRoutes = require('./routes/blogs');
const noticeRoutes = require('./routes/notices'); // New notice routes
const adminRoutes = require('./routes/admin'); // NEW: Admin routes

const app = express();

// Middleware
app.use(cors({origin: "https://backend-lzma.onrender.com/"}));
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notices', noticeRoutes); // New notice routes
app.use('/api/admin', adminRoutes); // NEW: Mount admin routes

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Test API Server is running!',
        features: [
            'Authentication (JWT)',
            'Test Management',
            'Notes Management',
            'Blog System',
            'Notice Board System', // New feature
            'File Uploads',
            'Admin Dashboard & Management' // NEW
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
    console.log(`   - Notices: /api/notices`); // New feature
    console.log(`👑 Admin Dashboard: /api/admin/*`);
});

module.exports = app;
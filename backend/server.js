require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Import routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const noteRoutes = require('./routes/notes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notes', noteRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
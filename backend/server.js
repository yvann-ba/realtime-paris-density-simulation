/**
 * Paris Traffic Backend Server
 * Serves H3-aggregated foot traffic data
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const trafficRoutes = require('./routes/traffic');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/traffic', trafficRoutes);

// Config endpoint - serves Mapbox token to frontend
app.get('/api/config', (req, res) => {
  res.json({
    mapboxToken: process.env.MAPBOX_TOKEN || null
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Paris Traffic API'
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🗼 Paris Traffic Visualization Server                    ║
║                                                            ║
║   Server running at: http://localhost:${PORT}               ║
║   API endpoint:      http://localhost:${PORT}/api/traffic   ║
║                                                            ║
║   Open http://localhost:${PORT} in your browser             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

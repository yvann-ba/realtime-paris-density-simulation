/**
 * Traffic API Routes
 * Handles requests for foot traffic data
 */

const express = require('express');
const router = express.Router();
const h3Aggregator = require('../services/h3Aggregator');
const mockDataGenerator = require('../services/mockDataGenerator');
const densityGridGenerator = require('../services/densityGridGenerator');

// Cache for generated data
let dataCache = new Map();
let densityCache = new Map();

/**
 * GET /api/traffic
 * Get traffic data for a specific time
 * Query params: hour (0-23), day (0-6)
 */
router.get('/', async (req, res) => {
  try {
    const hour = parseInt(req.query.hour) || 14;
    const day = parseInt(req.query.day) || 5;
    
    // Validate parameters
    if (hour < 0 || hour > 23) {
      return res.status(400).json({ error: 'Hour must be between 0 and 23' });
    }
    if (day < 0 || day > 6) {
      return res.status(400).json({ error: 'Day must be between 0 (Sunday) and 6 (Saturday)' });
    }
    
    // Generate cache key
    const cacheKey = `${day}-${hour}`;
    
    // Check cache
    if (dataCache.has(cacheKey)) {
      return res.json(dataCache.get(cacheKey));
    }
    
    // Generate mock data for Paris
    const data = mockDataGenerator.generateParisTrafficData(hour, day);
    
    // Cache the result
    dataCache.set(cacheKey, data);
    
    res.json(data);
    
  } catch (error) {
    console.error('Error generating traffic data:', error);
    res.status(500).json({ error: 'Failed to generate traffic data' });
  }
});

/**
 * GET /api/traffic/all
 * Get traffic data for all hours of a day
 * Query params: day (0-6)
 */
router.get('/all', async (req, res) => {
  try {
    const day = parseInt(req.query.day) || 5;
    
    const allData = {};
    for (let hour = 0; hour < 24; hour++) {
      const cacheKey = `${day}-${hour}`;
      
      if (!dataCache.has(cacheKey)) {
        const data = mockDataGenerator.generateParisTrafficData(hour, day);
        dataCache.set(cacheKey, data);
      }
      
      allData[hour] = dataCache.get(cacheKey);
    }
    
    res.json(allData);
    
  } catch (error) {
    console.error('Error generating all traffic data:', error);
    res.status(500).json({ error: 'Failed to generate traffic data' });
  }
});

/**
 * GET /api/traffic/density
 * Get seamless density grid data for heatmap visualization
 * Query params: hour (0-23), day (0-6), minute (0-59), resolution (low/medium/high/ultra/extreme)
 * Now supports minute-level precision for smooth animations!
 */
router.get('/density', async (req, res) => {
  try {
    const hour = parseInt(req.query.hour) || 14;
    const day = parseInt(req.query.day) || 5;
    const minute = parseInt(req.query.minute) || 0;
    const resolution = req.query.resolution || 'high';
    
    // Validate parameters
    if (hour < 0 || hour > 23) {
      return res.status(400).json({ error: 'Hour must be between 0 and 23' });
    }
    if (day < 0 || day > 6) {
      return res.status(400).json({ error: 'Day must be between 0 (Sunday) and 6 (Saturday)' });
    }
    if (minute < 0 || minute > 59) {
      return res.status(400).json({ error: 'Minute must be between 0 and 59' });
    }
    
    // For minute-level data, we use a shorter cache or no cache for real-time feel
    // Cache by 5-minute intervals to balance performance and smoothness
    const cacheMinute = Math.floor(minute / 5) * 5;
    const cacheKey = `density-${day}-${hour}-${cacheMinute}-${resolution}`;
    
    // Check cache
    if (densityCache.has(cacheKey)) {
      const cachedData = densityCache.get(cacheKey);
      // Return cached data but update minute in metadata
      return res.json({
        ...cachedData,
        metadata: { ...cachedData.metadata, minute, actualCacheMinute: cacheMinute }
      });
    }
    
    // Generate density grid data with minute precision
    const data = densityGridGenerator.generateParisDensityData(hour, day, cacheMinute, resolution);
    
    // Cache the result
    densityCache.set(cacheKey, data);
    
    // Limit cache size to prevent memory issues
    if (densityCache.size > 500) {
      const firstKey = densityCache.keys().next().value;
      densityCache.delete(firstKey);
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('Error generating density data:', error);
    res.status(500).json({ error: 'Failed to generate density data' });
  }
});

/**
 * GET /api/traffic/hexagon/:h3Index
 * Get detailed data for a specific hexagon
 */
router.get('/hexagon/:h3Index', async (req, res) => {
  try {
    const { h3Index } = req.params;
    const hour = parseInt(req.query.hour) || 14;
    const day = parseInt(req.query.day) || 5;
    
    // Get or generate data
    const cacheKey = `${day}-${hour}`;
    let data = dataCache.get(cacheKey);
    
    if (!data) {
      data = mockDataGenerator.generateParisTrafficData(hour, day);
      dataCache.set(cacheKey, data);
    }
    
    // Find specific hexagon
    const hexagon = data.hexagons.find(h => h.h3Index === h3Index);
    
    if (!hexagon) {
      return res.status(404).json({ error: 'Hexagon not found' });
    }
    
    res.json(hexagon);
    
  } catch (error) {
    console.error('Error fetching hexagon data:', error);
    res.status(500).json({ error: 'Failed to fetch hexagon data' });
  }
});

/**
 * POST /api/traffic/clear-cache
 * Clear the data cache
 */
router.post('/clear-cache', (req, res) => {
  dataCache.clear();
  res.json({ message: 'Cache cleared successfully' });
});

/**
 * GET /api/traffic/stats
 * Get statistics about current traffic data
 */
router.get('/stats', (req, res) => {
  const hour = parseInt(req.query.hour) || 14;
  const day = parseInt(req.query.day) || 5;
  const cacheKey = `${day}-${hour}`;
  
  const data = dataCache.get(cacheKey);
  
  if (!data) {
    return res.json({
      cached: false,
      message: 'Data not yet generated for this time'
    });
  }
  
  const densities = data.hexagons.map(h => h.density);
  
  res.json({
    cached: true,
    hexagonCount: data.hexagons.length,
    avgDensity: densities.reduce((a, b) => a + b, 0) / densities.length,
    maxDensity: Math.max(...densities),
    minDensity: Math.min(...densities),
    hour,
    day
  });
});

module.exports = router;

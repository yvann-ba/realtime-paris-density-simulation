/**
 * Data Service
 * Handles fetching and transforming traffic data from backend
 * Simple hour-by-hour data fetching
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Fetch density grid data for heatmap visualization
 * @param {number} hour - Hour (0-23)
 * @param {number} day - Day of week (0-6, 0 = Sunday)
 * @returns {Promise<Object>} Density data with points array
 */
export async function fetchDensityData(hour = 14, day = 5) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/traffic/density?hour=${hour}&day=${day}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching density data:', error);
    throw error;
  }
}

/**
 * Fetch traffic data for a specific time
 * @param {number} hour - Hour (0-23)
 * @param {number} day - Day of week (0-6, 0 = Sunday)
 * @returns {Promise<Object>} Traffic data
 */
export async function fetchTrafficData(hour = 14, day = 5) {
  return fetchDensityData(hour, day);
}

/**
 * Fetch all available time slots data (for caching)
 * @returns {Promise<Object>} All traffic data by time
 */
export async function fetchAllTrafficData() {
  try {
    const response = await fetch(`${API_BASE_URL}/traffic/all`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all traffic data:', error);
    throw error;
  }
}

/**
 * Transform raw API data to format needed by layers
 * @param {Object} apiData - Raw data from API
 * @returns {Object} Transformed data { points }
 */
export function transformDataForLayers(apiData) {
  // New density format - points array directly available
  if (apiData.points) {
    return {
      points: apiData.points,
      metadata: apiData.metadata
    };
  }
  
  // Legacy hexagon format fallback
  const hexagons = apiData.hexagons || [];
  const points = hexagons.map(hex => ({
    position: hex.center || [hex.lng, hex.lat],
    density: hex.density,
    h3Index: hex.h3Index
  }));
  
  return { points };
}

/**
 * Calculate statistics from data
 * @param {Object} data - Data with points or metadata
 * @returns {Object} Statistics { zones, avg, max, min }
 */
export function calculateStats(data) {
  // Use metadata if available (new format)
  if (data.metadata) {
    return {
      zones: data.metadata.totalPoints || data.points?.length || 0,
      avg: data.metadata.avgDensity || 0,
      max: data.metadata.maxDensity || 0,
      min: data.metadata.minDensity || 0
    };
  }
  
  // Calculate from points
  const points = data.points || data.hexagons || [];
  if (points.length === 0) {
    return { zones: 0, avg: 0, max: 0, min: 0 };
  }
  
  const densities = points.map(p => p.density);
  const sum = densities.reduce((a, b) => a + b, 0);
  
  return {
    zones: points.length,
    avg: Math.round(sum / points.length),
    max: Math.round(Math.max(...densities)),
    min: Math.round(Math.min(...densities))
  };
}

/**
 * Cache manager for traffic data - simple hour-based caching
 */
export class DataCache {
  constructor() {
    this.cache = new Map();
  }
  
  /**
   * Get cache key for hour/day combination
   */
  getKey(hour, day) {
    return `${day}-${hour}`;
  }
  
  /**
   * Get cached data
   */
  get(hour, day) {
    return this.cache.get(this.getKey(hour, day));
  }
  
  /**
   * Set cached data
   */
  set(hour, day, data) {
    this.cache.set(this.getKey(hour, day), data);
  }
  
  /**
   * Check if data is cached
   */
  has(hour, day) {
    return this.cache.has(this.getKey(hour, day));
  }
  
  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
  }
  
  /**
   * Preload data for all hours of a day
   */
  async preloadDay(day) {
    const promises = [];
    for (let hour = 0; hour < 24; hour++) {
      if (!this.has(hour, day)) {
        promises.push(
          fetchTrafficData(hour, day)
            .then(data => this.set(hour, day, data))
            .catch(err => console.warn(`Failed to preload hour ${hour}:`, err))
        );
      }
    }
    await Promise.all(promises);
  }
}

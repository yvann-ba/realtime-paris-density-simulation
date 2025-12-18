/**
 * H3 Aggregation Service
 * Aggregates point data into H3 hexagons
 */

const h3 = require('h3-js');

// Default H3 resolution for Paris visualization
const DEFAULT_RESOLUTION = 9; // ~174m edge length

/**
 * Paris bounding box
 */
const PARIS_BOUNDS = {
  minLat: 48.815,
  maxLat: 48.902,
  minLng: 2.22,
  maxLng: 2.47
};

/**
 * Convert a lat/lng point to an H3 index
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} resolution - H3 resolution (0-15)
 * @returns {string} H3 index
 */
function pointToH3(lat, lng, resolution = DEFAULT_RESOLUTION) {
  return h3.latLngToCell(lat, lng, resolution);
}

/**
 * Get the center point of an H3 cell
 * @param {string} h3Index - H3 cell index
 * @returns {number[]} [lat, lng]
 */
function h3ToCenter(h3Index) {
  return h3.cellToLatLng(h3Index);
}

/**
 * Get the boundary polygon of an H3 cell
 * @param {string} h3Index - H3 cell index
 * @returns {number[][]} Array of [lat, lng] coordinates
 */
function h3ToBoundary(h3Index) {
  return h3.cellToBoundary(h3Index);
}

/**
 * Get all H3 cells within a bounding box
 * @param {Object} bounds - { minLat, maxLat, minLng, maxLng }
 * @param {number} resolution - H3 resolution
 * @returns {string[]} Array of H3 indices
 */
function getH3CellsInBounds(bounds = PARIS_BOUNDS, resolution = DEFAULT_RESOLUTION) {
  // Create polygon from bounds
  const polygon = [
    [bounds.minLat, bounds.minLng],
    [bounds.minLat, bounds.maxLng],
    [bounds.maxLat, bounds.maxLng],
    [bounds.maxLat, bounds.minLng],
    [bounds.minLat, bounds.minLng]
  ];
  
  // Get all cells that intersect with the polygon
  return h3.polygonToCells(polygon, resolution);
}

/**
 * Get H3 cells in a ring around a center point
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} ringSize - Number of rings
 * @param {number} resolution - H3 resolution
 * @returns {string[]} Array of H3 indices
 */
function getH3Ring(lat, lng, ringSize = 10, resolution = DEFAULT_RESOLUTION) {
  const centerCell = h3.latLngToCell(lat, lng, resolution);
  return h3.gridDisk(centerCell, ringSize);
}

/**
 * Aggregate points into H3 cells with density calculation
 * @param {Object[]} points - Array of { lat, lng, value } objects
 * @param {number} resolution - H3 resolution
 * @returns {Object[]} Array of aggregated hexagon data
 */
function aggregatePointsToH3(points, resolution = DEFAULT_RESOLUTION) {
  const hexagonMap = new Map();
  
  // Group points by H3 cell
  points.forEach(point => {
    const h3Index = h3.latLngToCell(point.lat, point.lng, resolution);
    
    if (!hexagonMap.has(h3Index)) {
      hexagonMap.set(h3Index, {
        h3Index,
        points: [],
        totalValue: 0
      });
    }
    
    const hexData = hexagonMap.get(h3Index);
    hexData.points.push(point);
    hexData.totalValue += point.value || 1;
  });
  
  // Calculate density for each hexagon
  const maxValue = Math.max(...Array.from(hexagonMap.values()).map(h => h.totalValue));
  
  return Array.from(hexagonMap.values()).map(hex => {
    const center = h3.cellToLatLng(hex.h3Index);
    const boundary = h3.cellToBoundary(hex.h3Index);
    
    return {
      h3Index: hex.h3Index,
      center: [center[1], center[0]], // [lng, lat] for GeoJSON/Deck.gl
      boundary: boundary.map(([lat, lng]) => [lng, lat]),
      pointCount: hex.points.length,
      totalValue: hex.totalValue,
      density: (hex.totalValue / maxValue) * 100 // Normalize to 0-100
    };
  });
}

/**
 * Convert H3 data to GeoJSON format
 * @param {Object[]} hexagons - Array of hexagon data
 * @returns {Object} GeoJSON FeatureCollection
 */
function toGeoJSON(hexagons) {
  return {
    type: 'FeatureCollection',
    features: hexagons.map(hex => ({
      type: 'Feature',
      properties: {
        h3Index: hex.h3Index,
        density: hex.density,
        pointCount: hex.pointCount,
        totalValue: hex.totalValue
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[...hex.boundary, hex.boundary[0]]] // Close the polygon
      }
    }))
  };
}

/**
 * Get neighboring cells for a given H3 index
 * @param {string} h3Index - H3 cell index
 * @returns {string[]} Array of neighboring H3 indices
 */
function getNeighbors(h3Index) {
  return h3.gridDisk(h3Index, 1).filter(idx => idx !== h3Index);
}

/**
 * Calculate the area of an H3 cell in square meters
 * @param {string} h3Index - H3 cell index
 * @returns {number} Area in square meters
 */
function getCellArea(h3Index) {
  return h3.cellArea(h3Index, 'm2');
}

/**
 * Get H3 resolution info
 * @param {number} resolution - H3 resolution (0-15)
 * @returns {Object} Resolution info
 */
function getResolutionInfo(resolution) {
  const resolutions = {
    7: { edgeLength: '1.22 km', area: '5.16 km²' },
    8: { edgeLength: '461 m', area: '0.74 km²' },
    9: { edgeLength: '174 m', area: '0.11 km²' },
    10: { edgeLength: '66 m', area: '0.015 km²' },
    11: { edgeLength: '25 m', area: '0.002 km²' }
  };
  
  return resolutions[resolution] || { edgeLength: 'Unknown', area: 'Unknown' };
}

module.exports = {
  pointToH3,
  h3ToCenter,
  h3ToBoundary,
  getH3CellsInBounds,
  getH3Ring,
  aggregatePointsToH3,
  toGeoJSON,
  getNeighbors,
  getCellArea,
  getResolutionInfo,
  DEFAULT_RESOLUTION,
  PARIS_BOUNDS
};

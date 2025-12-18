/**
 * Mock Data Generator for Paris Foot Traffic
 * Generates realistic traffic patterns based on time and location
 */

const h3 = require('h3-js');

// H3 Resolution for Paris
const RESOLUTION = 9;

// Paris center coordinates
const PARIS_CENTER = {
  lat: 48.8566,
  lng: 2.3522
};

/**
 * Paris hotspots with their typical popularity
 * Each hotspot has base popularity and time-dependent modifiers
 */
const PARIS_HOTSPOTS = [
  // Major tourist attractions
  { name: 'Tour Eiffel', lat: 48.8584, lng: 2.2945, basePop: 95, radius: 0.012, type: 'tourist' },
  { name: 'Louvre', lat: 48.8606, lng: 2.3376, basePop: 90, radius: 0.015, type: 'tourist' },
  { name: 'Notre-Dame', lat: 48.8530, lng: 2.3499, basePop: 85, radius: 0.010, type: 'tourist' },
  { name: 'Sacré-Cœur', lat: 48.8867, lng: 2.3431, basePop: 80, radius: 0.012, type: 'tourist' },
  { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.2950, basePop: 75, radius: 0.010, type: 'tourist' },
  { name: 'Musée d\'Orsay', lat: 48.8600, lng: 2.3266, basePop: 70, radius: 0.008, type: 'tourist' },
  { name: 'Centre Pompidou', lat: 48.8606, lng: 2.3522, basePop: 65, radius: 0.008, type: 'tourist' },
  
  // Shopping areas
  { name: 'Champs-Élysées', lat: 48.8698, lng: 2.3075, basePop: 85, radius: 0.020, type: 'shopping' },
  { name: 'Galeries Lafayette', lat: 48.8738, lng: 2.3320, basePop: 80, radius: 0.010, type: 'shopping' },
  { name: 'Le Marais', lat: 48.8566, lng: 2.3622, basePop: 75, radius: 0.018, type: 'shopping' },
  { name: 'Saint-Germain', lat: 48.8539, lng: 2.3338, basePop: 70, radius: 0.015, type: 'shopping' },
  { name: 'Les Halles', lat: 48.8622, lng: 2.3461, basePop: 75, radius: 0.012, type: 'shopping' },
  
  // Business districts
  { name: 'La Défense', lat: 48.8918, lng: 2.2362, basePop: 80, radius: 0.025, type: 'business' },
  { name: 'Opéra', lat: 48.8700, lng: 2.3319, basePop: 75, radius: 0.015, type: 'business' },
  
  // Transportation hubs
  { name: 'Gare du Nord', lat: 48.8809, lng: 2.3553, basePop: 85, radius: 0.015, type: 'transport' },
  { name: 'Gare de Lyon', lat: 48.8443, lng: 2.3735, basePop: 80, radius: 0.012, type: 'transport' },
  { name: 'Gare Montparnasse', lat: 48.8410, lng: 2.3219, basePop: 75, radius: 0.012, type: 'transport' },
  { name: 'Gare Saint-Lazare', lat: 48.8764, lng: 2.3247, basePop: 75, radius: 0.010, type: 'transport' },
  { name: 'Châtelet', lat: 48.8584, lng: 2.3474, basePop: 85, radius: 0.015, type: 'transport' },
  
  // Entertainment areas
  { name: 'Pigalle', lat: 48.8821, lng: 2.3375, basePop: 65, radius: 0.010, type: 'nightlife' },
  { name: 'Bastille', lat: 48.8533, lng: 2.3692, basePop: 70, radius: 0.012, type: 'nightlife' },
  { name: 'Oberkampf', lat: 48.8656, lng: 2.3778, basePop: 60, radius: 0.010, type: 'nightlife' },
  
  // Parks & Recreation
  { name: 'Jardin du Luxembourg', lat: 48.8462, lng: 2.3372, basePop: 60, radius: 0.015, type: 'park' },
  { name: 'Tuileries', lat: 48.8634, lng: 2.3275, basePop: 55, radius: 0.015, type: 'park' },
  { name: 'Champ de Mars', lat: 48.8556, lng: 2.2986, basePop: 65, radius: 0.018, type: 'park' },
  
  // Residential/Local areas
  { name: 'Belleville', lat: 48.8717, lng: 2.3850, basePop: 45, radius: 0.015, type: 'residential' },
  { name: 'Batignolles', lat: 48.8867, lng: 2.3172, basePop: 40, radius: 0.012, type: 'residential' },
  { name: 'Buttes-Chaumont', lat: 48.8811, lng: 2.3828, basePop: 35, radius: 0.015, type: 'residential' },
];

/**
 * Time-based multipliers for different location types
 */
const TIME_MULTIPLIERS = {
  tourist: {
    // Hour: multiplier
    0: 0.1, 1: 0.05, 2: 0.05, 3: 0.05, 4: 0.05, 5: 0.1,
    6: 0.2, 7: 0.3, 8: 0.5, 9: 0.7, 10: 0.9, 11: 1.0,
    12: 0.95, 13: 0.9, 14: 1.0, 15: 1.0, 16: 0.95, 17: 0.85,
    18: 0.7, 19: 0.5, 20: 0.35, 21: 0.25, 22: 0.15, 23: 0.1
  },
  shopping: {
    0: 0.0, 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0,
    6: 0.0, 7: 0.1, 8: 0.2, 9: 0.4, 10: 0.7, 11: 0.9,
    12: 0.85, 13: 0.8, 14: 0.9, 15: 1.0, 16: 1.0, 17: 0.95,
    18: 0.85, 19: 0.6, 20: 0.3, 21: 0.1, 22: 0.0, 23: 0.0
  },
  business: {
    0: 0.05, 1: 0.02, 2: 0.02, 3: 0.02, 4: 0.05, 5: 0.1,
    6: 0.2, 7: 0.5, 8: 0.9, 9: 1.0, 10: 0.95, 11: 0.9,
    12: 0.7, 13: 0.75, 14: 0.9, 15: 0.95, 16: 0.9, 17: 0.85,
    18: 0.6, 19: 0.3, 20: 0.15, 21: 0.1, 22: 0.05, 23: 0.05
  },
  transport: {
    0: 0.15, 1: 0.08, 2: 0.05, 3: 0.05, 4: 0.1, 5: 0.2,
    6: 0.5, 7: 0.85, 8: 1.0, 9: 0.8, 10: 0.5, 11: 0.45,
    12: 0.5, 13: 0.5, 14: 0.5, 15: 0.55, 16: 0.65, 17: 0.9,
    18: 1.0, 19: 0.85, 20: 0.6, 21: 0.4, 22: 0.3, 23: 0.2
  },
  nightlife: {
    0: 0.6, 1: 0.4, 2: 0.2, 3: 0.1, 4: 0.05, 5: 0.02,
    6: 0.02, 7: 0.05, 8: 0.1, 9: 0.15, 10: 0.2, 11: 0.25,
    12: 0.35, 13: 0.35, 14: 0.35, 15: 0.4, 16: 0.4, 17: 0.45,
    18: 0.55, 19: 0.7, 20: 0.85, 21: 0.95, 22: 1.0, 23: 0.9
  },
  park: {
    0: 0.02, 1: 0.01, 2: 0.01, 3: 0.01, 4: 0.02, 5: 0.05,
    6: 0.15, 7: 0.3, 8: 0.45, 9: 0.55, 10: 0.7, 11: 0.8,
    12: 0.75, 13: 0.7, 14: 0.8, 15: 0.9, 16: 1.0, 17: 0.95,
    18: 0.8, 19: 0.6, 20: 0.35, 21: 0.15, 22: 0.05, 23: 0.02
  },
  residential: {
    0: 0.3, 1: 0.2, 2: 0.15, 3: 0.15, 4: 0.15, 5: 0.2,
    6: 0.4, 7: 0.6, 8: 0.5, 9: 0.4, 10: 0.45, 11: 0.5,
    12: 0.6, 13: 0.55, 14: 0.5, 15: 0.55, 16: 0.6, 17: 0.7,
    18: 0.85, 19: 0.95, 20: 1.0, 21: 0.9, 22: 0.7, 23: 0.5
  }
};

/**
 * Day of week multipliers
 */
const DAY_MULTIPLIERS = {
  tourist: { 0: 1.1, 1: 0.8, 2: 0.85, 3: 0.9, 4: 0.95, 5: 1.0, 6: 1.15 },
  shopping: { 0: 0.7, 1: 0.6, 2: 0.7, 3: 0.8, 4: 0.9, 5: 0.95, 6: 1.1 },
  business: { 0: 0.1, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 0.9, 6: 0.15 },
  transport: { 0: 0.7, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.1, 6: 0.8 },
  nightlife: { 0: 0.7, 1: 0.5, 2: 0.6, 3: 0.7, 4: 0.9, 5: 1.1, 6: 1.0 },
  park: { 0: 1.2, 1: 0.6, 2: 0.65, 3: 0.7, 4: 0.75, 5: 0.8, 6: 1.15 },
  residential: { 0: 1.0, 1: 0.9, 2: 0.9, 3: 0.9, 4: 0.9, 5: 0.95, 6: 1.0 }
};

/**
 * Calculate distance between two points
 */
function distance(lat1, lng1, lat2, lng2) {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
}

/**
 * Calculate density for a specific point based on hotspots
 */
function calculateDensity(lat, lng, hour, day) {
  let totalDensity = 5 + Math.random() * 10; // Base density with noise
  
  PARIS_HOTSPOTS.forEach(hotspot => {
    const dist = distance(lat, lng, hotspot.lat, hotspot.lng);
    
    if (dist < hotspot.radius * 2) {
      // Calculate influence based on distance
      const influence = Math.max(0, 1 - (dist / (hotspot.radius * 1.5)));
      
      // Get time and day multipliers
      const timeMultiplier = TIME_MULTIPLIERS[hotspot.type][hour] || 0.5;
      const dayMultiplier = DAY_MULTIPLIERS[hotspot.type][day] || 1.0;
      
      // Calculate contribution with some randomness
      const contribution = hotspot.basePop * influence * timeMultiplier * dayMultiplier;
      const noise = (Math.random() - 0.5) * 10;
      
      totalDensity += contribution + noise;
    }
  });
  
  // Clamp to 0-100
  return Math.min(100, Math.max(0, totalDensity));
}

/**
 * Generate Paris traffic data for a specific time
 * @param {number} hour - Hour (0-23)
 * @param {number} day - Day of week (0-6, 0 = Sunday)
 * @returns {Object} Traffic data with hexagons array
 */
function generateParisTrafficData(hour = 14, day = 5) {
  const hexagons = [];
  
  // Get H3 cells covering Paris
  const centerCell = h3.latLngToCell(PARIS_CENTER.lat, PARIS_CENTER.lng, RESOLUTION);
  const cells = h3.gridDisk(centerCell, 20); // ~20 rings covers most of Paris
  
  cells.forEach(h3Index => {
    const center = h3.cellToLatLng(h3Index);
    const boundary = h3.cellToBoundary(h3Index);
    
    // Check if cell is roughly within Paris bounds
    if (center[0] < 48.80 || center[0] > 48.92 || 
        center[1] < 2.20 || center[1] > 2.48) {
      return; // Skip cells outside Paris
    }
    
    // Calculate density for this hexagon
    const density = calculateDensity(center[0], center[1], hour, day);
    
    // Find nearest hotspot for zone naming
    let nearestHotspot = null;
    let nearestDist = Infinity;
    
    PARIS_HOTSPOTS.forEach(hotspot => {
      const dist = distance(center[0], center[1], hotspot.lat, hotspot.lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestHotspot = hotspot;
      }
    });
    
    const zoneName = nearestDist < 0.02 ? nearestHotspot.name : `Zone ${h3Index.substring(0, 8)}`;
    
    hexagons.push({
      h3Index,
      center: [center[1], center[0]], // [lng, lat] for Deck.gl
      boundary: boundary.map(([lat, lng]) => [lng, lat]),
      density,
      zoneName,
      zoneType: nearestDist < 0.02 ? nearestHotspot.type : 'general'
    });
  });
  
  return {
    hexagons,
    metadata: {
      hour,
      day,
      dayName: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][day],
      resolution: RESOLUTION,
      hexagonCount: hexagons.length,
      generatedAt: new Date().toISOString()
    }
  };
}

/**
 * Generate hourly data for an entire day
 */
function generateDayData(day = 5) {
  const dayData = {};
  
  for (let hour = 0; hour < 24; hour++) {
    dayData[hour] = generateParisTrafficData(hour, day);
  }
  
  return dayData;
}

module.exports = {
  generateParisTrafficData,
  generateDayData,
  PARIS_HOTSPOTS,
  TIME_MULTIPLIERS,
  DAY_MULTIPLIERS
};

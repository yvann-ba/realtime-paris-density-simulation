/**
 * Density Grid Generator for Paris Busy Areas
 * Creates a smooth, granular density field using interpolation
 * Generates thousands of points for seamless heatmap visualization
 */

// Paris bounding box
const PARIS_BOUNDS = {
  minLat: 48.815,
  maxLat: 48.905,
  minLng: 2.22,
  maxLng: 2.47
};

// Paris center
const PARIS_CENTER = { lat: 48.8566, lng: 2.3522 };

/**
 * Major busy areas in Paris with influence parameters
 * Each area has: center, peak intensity, spread radius, type
 */
const BUSY_AREAS = [
  // Major tourist hotspots - very high density
  { name: 'Tour Eiffel', lat: 48.8584, lng: 2.2945, intensity: 100, spread: 0.008, type: 'tourist' },
  { name: 'Louvre', lat: 48.8606, lng: 2.3376, intensity: 95, spread: 0.012, type: 'tourist' },
  { name: 'Notre-Dame', lat: 48.8530, lng: 2.3499, intensity: 85, spread: 0.007, type: 'tourist' },
  { name: 'Sacré-Cœur', lat: 48.8867, lng: 2.3431, intensity: 90, spread: 0.009, type: 'tourist' },
  { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.2950, intensity: 85, spread: 0.007, type: 'tourist' },
  { name: 'Musée d\'Orsay', lat: 48.8600, lng: 2.3266, intensity: 75, spread: 0.006, type: 'tourist' },
  { name: 'Centre Pompidou', lat: 48.8606, lng: 2.3522, intensity: 70, spread: 0.006, type: 'tourist' },
  { name: 'Trocadéro', lat: 48.8616, lng: 2.2875, intensity: 80, spread: 0.008, type: 'tourist' },
  { name: 'Invalides', lat: 48.8550, lng: 2.3125, intensity: 65, spread: 0.007, type: 'tourist' },
  
  // Shopping & commercial districts
  { name: 'Champs-Élysées Nord', lat: 48.8738, lng: 2.3050, intensity: 90, spread: 0.006, type: 'shopping' },
  { name: 'Champs-Élysées Centre', lat: 48.8710, lng: 2.3025, intensity: 95, spread: 0.007, type: 'shopping' },
  { name: 'Champs-Élysées Sud', lat: 48.8680, lng: 2.3000, intensity: 85, spread: 0.006, type: 'shopping' },
  { name: 'Galeries Lafayette', lat: 48.8738, lng: 2.3320, intensity: 88, spread: 0.006, type: 'shopping' },
  { name: 'Printemps', lat: 48.8745, lng: 2.3285, intensity: 82, spread: 0.005, type: 'shopping' },
  { name: 'Le Marais Nord', lat: 48.8600, lng: 2.3622, intensity: 78, spread: 0.008, type: 'shopping' },
  { name: 'Le Marais Sud', lat: 48.8540, lng: 2.3600, intensity: 75, spread: 0.007, type: 'shopping' },
  { name: 'Saint-Germain', lat: 48.8539, lng: 2.3338, intensity: 72, spread: 0.009, type: 'shopping' },
  { name: 'Les Halles', lat: 48.8622, lng: 2.3461, intensity: 85, spread: 0.008, type: 'shopping' },
  { name: 'Rue de Rivoli', lat: 48.8590, lng: 2.3420, intensity: 70, spread: 0.012, type: 'shopping' },
  { name: 'Boulevard Haussmann', lat: 48.8750, lng: 2.3300, intensity: 75, spread: 0.010, type: 'shopping' },
  
  // Business districts
  { name: 'La Défense Centre', lat: 48.8918, lng: 2.2362, intensity: 85, spread: 0.012, type: 'business' },
  { name: 'La Défense Est', lat: 48.8900, lng: 2.2450, intensity: 75, spread: 0.008, type: 'business' },
  { name: 'Opéra', lat: 48.8700, lng: 2.3319, intensity: 80, spread: 0.008, type: 'business' },
  { name: 'Bourse', lat: 48.8690, lng: 2.3410, intensity: 70, spread: 0.006, type: 'business' },
  { name: 'Saint-Lazare Business', lat: 48.8750, lng: 2.3260, intensity: 72, spread: 0.006, type: 'business' },
  
  // Transport hubs - very high density
  { name: 'Gare du Nord', lat: 48.8809, lng: 2.3553, intensity: 92, spread: 0.009, type: 'transport' },
  { name: 'Gare de l\'Est', lat: 48.8768, lng: 2.3591, intensity: 85, spread: 0.007, type: 'transport' },
  { name: 'Gare de Lyon', lat: 48.8443, lng: 2.3735, intensity: 88, spread: 0.009, type: 'transport' },
  { name: 'Gare Montparnasse', lat: 48.8410, lng: 2.3219, intensity: 82, spread: 0.008, type: 'transport' },
  { name: 'Gare Saint-Lazare', lat: 48.8764, lng: 2.3247, intensity: 85, spread: 0.007, type: 'transport' },
  { name: 'Châtelet', lat: 48.8584, lng: 2.3474, intensity: 90, spread: 0.010, type: 'transport' },
  { name: 'République', lat: 48.8675, lng: 2.3640, intensity: 75, spread: 0.007, type: 'transport' },
  { name: 'Nation', lat: 48.8485, lng: 2.3958, intensity: 70, spread: 0.006, type: 'transport' },
  { name: 'Bastille', lat: 48.8533, lng: 2.3692, intensity: 78, spread: 0.007, type: 'transport' },
  
  // Entertainment & nightlife
  { name: 'Pigalle', lat: 48.8821, lng: 2.3375, intensity: 70, spread: 0.006, type: 'nightlife' },
  { name: 'Moulin Rouge', lat: 48.8841, lng: 2.3323, intensity: 75, spread: 0.004, type: 'nightlife' },
  { name: 'Oberkampf', lat: 48.8656, lng: 2.3778, intensity: 68, spread: 0.007, type: 'nightlife' },
  { name: 'Canal Saint-Martin', lat: 48.8710, lng: 2.3650, intensity: 65, spread: 0.008, type: 'nightlife' },
  { name: 'Grands Boulevards', lat: 48.8710, lng: 2.3420, intensity: 72, spread: 0.008, type: 'nightlife' },
  
  // Parks & recreation (lower intensity, spread wider)
  { name: 'Jardin du Luxembourg', lat: 48.8462, lng: 2.3372, intensity: 55, spread: 0.012, type: 'park' },
  { name: 'Tuileries', lat: 48.8634, lng: 2.3275, intensity: 60, spread: 0.010, type: 'park' },
  { name: 'Champ de Mars', lat: 48.8556, lng: 2.2986, intensity: 70, spread: 0.012, type: 'park' },
  { name: 'Parc Monceau', lat: 48.8794, lng: 2.3089, intensity: 45, spread: 0.006, type: 'park' },
  { name: 'Buttes-Chaumont', lat: 48.8811, lng: 2.3828, intensity: 40, spread: 0.010, type: 'park' },
  
  // Universities & cultural
  { name: 'Quartier Latin', lat: 48.8497, lng: 2.3471, intensity: 70, spread: 0.010, type: 'education' },
  { name: 'Sorbonne', lat: 48.8489, lng: 2.3443, intensity: 65, spread: 0.006, type: 'education' },
  { name: 'Odéon', lat: 48.8515, lng: 2.3388, intensity: 62, spread: 0.005, type: 'education' },
  
  // Secondary busy areas
  { name: 'Belleville', lat: 48.8717, lng: 2.3850, intensity: 50, spread: 0.008, type: 'residential' },
  { name: 'Ménilmontant', lat: 48.8660, lng: 2.3900, intensity: 45, spread: 0.007, type: 'residential' },
  { name: 'Batignolles', lat: 48.8867, lng: 2.3172, intensity: 42, spread: 0.008, type: 'residential' },
  { name: 'Alésia', lat: 48.8280, lng: 2.3270, intensity: 45, spread: 0.007, type: 'residential' },
  { name: 'Convention', lat: 48.8375, lng: 2.2968, intensity: 40, spread: 0.007, type: 'residential' },
  { name: 'Denfert-Rochereau', lat: 48.8337, lng: 2.3326, intensity: 48, spread: 0.006, type: 'residential' },
  { name: 'Place d\'Italie', lat: 48.8311, lng: 2.3558, intensity: 55, spread: 0.008, type: 'residential' },
  { name: 'Bercy', lat: 48.8396, lng: 2.3825, intensity: 52, spread: 0.009, type: 'residential' },
  { name: 'Père Lachaise', lat: 48.8614, lng: 2.3933, intensity: 35, spread: 0.010, type: 'park' },
];

/**
 * Time-based multipliers for different location types
 */
const TIME_PATTERNS = {
  tourist: [0.1, 0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.35, 0.55, 0.75, 0.9, 1.0, 0.95, 0.9, 1.0, 1.0, 0.95, 0.85, 0.7, 0.5, 0.35, 0.25, 0.15, 0.1],
  shopping: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.85, 0.8, 0.9, 1.0, 1.0, 0.95, 0.85, 0.6, 0.3, 0.1, 0.0, 0.0],
  business: [0.05, 0.02, 0.02, 0.02, 0.05, 0.1, 0.25, 0.6, 0.95, 1.0, 0.95, 0.9, 0.7, 0.75, 0.9, 0.95, 0.9, 0.85, 0.55, 0.25, 0.12, 0.08, 0.05, 0.05],
  transport: [0.15, 0.08, 0.05, 0.05, 0.1, 0.25, 0.55, 0.9, 1.0, 0.8, 0.5, 0.45, 0.5, 0.5, 0.5, 0.55, 0.65, 0.95, 1.0, 0.85, 0.6, 0.4, 0.3, 0.2],
  nightlife: [0.7, 0.5, 0.3, 0.15, 0.05, 0.02, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.35, 0.35, 0.35, 0.4, 0.4, 0.5, 0.6, 0.75, 0.9, 1.0, 1.0, 0.9],
  park: [0.02, 0.01, 0.01, 0.01, 0.02, 0.05, 0.15, 0.35, 0.5, 0.6, 0.75, 0.85, 0.8, 0.75, 0.85, 0.95, 1.0, 0.95, 0.8, 0.55, 0.3, 0.12, 0.05, 0.02],
  education: [0.05, 0.02, 0.02, 0.02, 0.02, 0.05, 0.15, 0.4, 0.8, 1.0, 0.95, 0.85, 0.7, 0.75, 0.9, 0.95, 0.85, 0.7, 0.45, 0.25, 0.15, 0.1, 0.08, 0.05],
  residential: [0.35, 0.25, 0.18, 0.15, 0.15, 0.2, 0.45, 0.65, 0.5, 0.4, 0.45, 0.5, 0.6, 0.55, 0.5, 0.55, 0.6, 0.75, 0.9, 1.0, 0.95, 0.8, 0.6, 0.45]
};

/**
 * Day of week multipliers (0=Sunday, 6=Saturday)
 */
const DAY_PATTERNS = {
  tourist: [1.15, 0.8, 0.85, 0.9, 0.95, 1.0, 1.2],
  shopping: [0.65, 0.55, 0.65, 0.75, 0.85, 0.95, 1.15],
  business: [0.08, 1.0, 1.0, 1.0, 1.0, 0.9, 0.12],
  transport: [0.65, 1.0, 1.0, 1.0, 1.0, 1.1, 0.75],
  nightlife: [0.75, 0.45, 0.55, 0.65, 0.85, 1.15, 1.0],
  park: [1.25, 0.55, 0.6, 0.65, 0.7, 0.8, 1.2],
  education: [0.1, 1.0, 1.0, 1.0, 1.0, 0.9, 0.15],
  residential: [1.0, 0.9, 0.9, 0.9, 0.9, 0.95, 1.0]
};

/**
 * Gaussian falloff function for smooth density spread
 */
function gaussianFalloff(distance, spread) {
  const sigma = spread * 0.6;
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

/**
 * Calculate distance between two points (simple Euclidean for small areas)
 */
function distance(lat1, lng1, lat2, lng2) {
  const dLat = lat1 - lat2;
  const dLng = (lng1 - lng2) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Interpolate between two values with easing
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Smooth easing function for more natural transitions
 */
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Get interpolated time multiplier for fractional hours (minute precision)
 */
function getInterpolatedTimeMultiplier(type, hour, minute = 0) {
  const pattern = TIME_PATTERNS[type];
  if (!pattern) return 0.5;
  
  const currentHour = Math.floor(hour);
  const nextHour = (currentHour + 1) % 24;
  const t = smoothstep(minute / 60); // Use smoothstep for smoother transitions
  
  const currentValue = pattern[currentHour] ?? 0.5;
  const nextValue = pattern[nextHour] ?? 0.5;
  
  return lerp(currentValue, nextValue, t);
}

/**
 * Calculate density at a specific point with minute-level precision
 */
function calculateDensityAt(lat, lng, hour, day, minute = 0) {
  let totalDensity = 0;
  
  BUSY_AREAS.forEach(area => {
    const dist = distance(lat, lng, area.lat, area.lng);
    
    // Only consider points within influence radius
    if (dist < area.spread * 3) {
      const baseDensity = area.intensity * gaussianFalloff(dist, area.spread);
      const timeMultiplier = getInterpolatedTimeMultiplier(area.type, hour, minute);
      const dayMultiplier = DAY_PATTERNS[area.type]?.[day] ?? 1.0;
      
      totalDensity += baseDensity * timeMultiplier * dayMultiplier;
    }
  });
  
  // Add some natural variation (reduced for smoother animation)
  totalDensity += (Math.random() - 0.5) * 2;
  
  return Math.min(100, Math.max(0, totalDensity));
}

/**
 * Generate a dense grid of points covering Paris
 * Higher resolution = more seamless visualization
 * Now supports minute-level precision for smooth animations
 */
function generateDensityGrid(hour = 14, day = 5, resolution = 'high', minute = 0) {
  const points = [];
  
  // Resolution settings - optimized for GPU performance
  const gridSizes = {
    low: { latStep: 0.003, lngStep: 0.004 },      // ~300m
    medium: { latStep: 0.002, lngStep: 0.0025 },  // ~200m
    high: { latStep: 0.0012, lngStep: 0.0015 },   // ~120m
    ultra: { latStep: 0.0008, lngStep: 0.001 },   // ~80m
    extreme: { latStep: 0.0006, lngStep: 0.00075 } // ~60m - for powerful GPUs
  };
  
  const { latStep, lngStep } = gridSizes[resolution] || gridSizes.high;
  
  // Use seeded random for consistent jitter across frames (smoother animation)
  const seed = (hour * 60 + Math.floor(minute / 5)) % 1000; // Change jitter every 5 mins
  let rng = seed;
  const seededRandom = () => {
    rng = (rng * 1103515245 + 12345) % 2147483648;
    return rng / 2147483648;
  };
  
  // Generate grid points
  for (let lat = PARIS_BOUNDS.minLat; lat <= PARIS_BOUNDS.maxLat; lat += latStep) {
    for (let lng = PARIS_BOUNDS.minLng; lng <= PARIS_BOUNDS.maxLng; lng += lngStep) {
      // Consistent jitter based on position (not random per frame)
      const jitterLat = lat + (seededRandom() - 0.5) * latStep * 0.4;
      const jitterLng = lng + (seededRandom() - 0.5) * lngStep * 0.4;
      
      const density = calculateDensityAt(jitterLat, jitterLng, hour, day, minute);
      
      // Only include points with meaningful density
      if (density > 3) {
        points.push({
          position: [jitterLng, jitterLat],
          lat: jitterLat,
          lng: jitterLng,
          density: density,
          weight: density / 100
        });
      }
    }
  }
  
  return points;
}

/**
 * Generate clustered points around busy areas for higher resolution there
 */
function generateClusterPoints(area, hour, day, minute = 0) {
  const points = [];
  const numRings = 6; // More rings for smoother gradients
  const pointsPerRing = 16; // More points per ring
  
  for (let ring = 1; ring <= numRings; ring++) {
    const radius = area.spread * (ring / numRings);
    
    for (let i = 0; i < pointsPerRing; i++) {
      const angle = (i / pointsPerRing) * Math.PI * 2;
      // Consistent jitter based on position
      const jitterSeed = (area.lat * 1000 + area.lng * 1000 + ring * 100 + i) % 1;
      const jitter = (jitterSeed - 0.5) * radius * 0.3;
      
      const lat = area.lat + Math.cos(angle) * (radius + jitter);
      const lng = area.lng + Math.sin(angle) * (radius + jitter) / Math.cos(area.lat * Math.PI / 180);
      
      const density = calculateDensityAt(lat, lng, hour, day, minute);
      
      if (density > 5) {
        points.push({
          position: [lng, lat],
          lat,
          lng,
          density,
          weight: density / 100
        });
      }
    }
  }
  
  return points;
}

/**
 * Generate complete Paris density data with minute-level precision
 */
function generateParisDensityData(hour = 14, day = 5, minute = 0, resolution = 'high') {
  const gridPoints = generateDensityGrid(hour, day, resolution, minute);
  
  // Add extra points around high-density areas for smoother gradients
  BUSY_AREAS.forEach(area => {
    const extraPoints = generateClusterPoints(area, hour, day, minute);
    gridPoints.push(...extraPoints);
  });
  
  // Calculate statistics
  const densities = gridPoints.map(p => p.density);
  const avgDensity = densities.reduce((a, b) => a + b, 0) / densities.length;
  const maxDensity = Math.max(...densities);
  const minDensity = Math.min(...densities);
  
  return {
    points: gridPoints,
    metadata: {
      hour,
      minute,
      day,
      dayName: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][day],
      totalPoints: gridPoints.length,
      avgDensity: Math.round(avgDensity),
      maxDensity: Math.round(maxDensity),
      minDensity: Math.round(minDensity),
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  generateParisDensityData,
  generateDensityGrid,
  calculateDensityAt,
  getInterpolatedTimeMultiplier,
  lerp,
  smoothstep,
  BUSY_AREAS,
  TIME_PATTERNS,
  DAY_PATTERNS,
  PARIS_BOUNDS
};

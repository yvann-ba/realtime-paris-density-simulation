/**
 * Mapbox GL JS Map Setup
 * Simple flat map for real-time traffic visualization
 */

// Paris view configuration - flat 2D view for better performance
const PARIS_VIEW = {
  center: [2.3522, 48.8566],
  zoom: 13,
  pitch: 0,
  bearing: 0,
  minZoom: 11,
  maxZoom: 18
};

/**
 * Fetch Mapbox token from backend
 */
async function fetchMapboxToken() {
  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    return data.mapboxToken;
  } catch (error) {
    console.warn('Could not fetch token from backend, using default');
    return null;
  }
}

/**
 * Initialize Mapbox map with 3D buildings - LIGHT STYLE
 * @param {string} containerId - DOM element ID for map
 * @param {string} token - Mapbox access token (optional, will fetch from backend)
 * @returns {Promise<mapboxgl.Map>}
 */
export async function initializeMap(containerId, token = null) {
  // Try to get token from backend if not provided
  if (!token) {
    token = await fetchMapboxToken();
  }
  
  // Fallback to demo token
  if (!token) {
    token = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
  }
  
  // Set access token
  mapboxgl.accessToken = token;
  
  // Create map instance with LIGHT style
  const map = new mapboxgl.Map({
    container: containerId,
    // Light, clean, minimalist map style
    style: 'mapbox://styles/mapbox/light-v11',
    center: PARIS_VIEW.center,
    zoom: PARIS_VIEW.zoom,
    pitch: PARIS_VIEW.pitch,
    bearing: PARIS_VIEW.bearing,
    minZoom: PARIS_VIEW.minZoom,
    maxZoom: PARIS_VIEW.maxZoom,
    antialias: true,
    attributionControl: false
  });
  
  // Wait for map to load
  await new Promise((resolve) => {
    map.on('load', resolve);
  });
  
  // No 3D buildings - keep map simple for better performance
  
  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl({
    visualizePitch: true
  }), 'top-right');
  
  // Add scale control
  map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 100,
    unit: 'metric'
  }), 'bottom-right');
  
  // Add attribution
  map.addControl(new mapboxgl.AttributionControl({
    compact: true
  }), 'bottom-right');
  
  return map;
}

// 3D buildings removed for simpler, faster visualization

/**
 * Fly to a specific location with animation
 * @param {mapboxgl.Map} map
 * @param {Object} options - { center, zoom, pitch, bearing }
 */
export function flyTo(map, options) {
  map.flyTo({
    center: options.center || PARIS_VIEW.center,
    zoom: options.zoom || PARIS_VIEW.zoom,
    pitch: options.pitch || PARIS_VIEW.pitch,
    bearing: options.bearing || PARIS_VIEW.bearing,
    duration: 2000,
    essential: true
  });
}

/**
 * Reset view to default Paris view
 * @param {mapboxgl.Map} map
 */
export function resetView(map) {
  flyTo(map, PARIS_VIEW);
}

export { PARIS_VIEW };

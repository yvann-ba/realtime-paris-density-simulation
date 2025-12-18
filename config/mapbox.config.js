// Mapbox Configuration for Paris 3D Visualization
export const MAPBOX_CONFIG = {
  // Default style with 3D buildings support
  style: 'mapbox://styles/mapbox/dark-v11',
  
  // Paris center coordinates
  center: [2.3522, 48.8566],
  
  // Initial zoom level (13 = neighborhood level)
  zoom: 13,
  
  // 3D perspective settings
  pitch: 45,
  bearing: -17,
  
  // Map bounds for Paris
  bounds: {
    southwest: [2.22, 48.815],
    northeast: [2.47, 48.902]
  },
  
  // 3D buildings configuration
  buildings: {
    minZoom: 12,
    opacity: 0.6,
    color: '#242424'
  }
};

// H3 Configuration
export const H3_CONFIG = {
  // Resolution 9 = ~174m edge length (neighborhood level)
  resolution: 9,
  
  // Paris bounding polygon for H3 cell generation
  parisBounds: [
    [2.22, 48.815],
    [2.47, 48.815],
    [2.47, 48.902],
    [2.22, 48.902],
    [2.22, 48.815]
  ]
};

// Color gradient for density visualization (0-100)
export const COLOR_STOPS = [
  { value: 0, color: [41, 128, 185, 160] },    // Blue
  { value: 25, color: [26, 188, 156, 170] },   // Teal
  { value: 50, color: [46, 204, 113, 180] },   // Green
  { value: 65, color: [241, 196, 15, 190] },   // Yellow
  { value: 80, color: [230, 126, 34, 200] },   // Orange
  { value: 100, color: [231, 76, 60, 220] }    // Red
];

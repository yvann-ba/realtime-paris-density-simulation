/**
 * Deck.gl Layers for Real-Time Traffic Visualization
 * GPU-optimized heatmap with full control over visualization parameters
 */

import { densityToColor, densityToElevation } from './colorScale.js';

// Default layer configuration - exposed for real-time control
export const LAYER_CONFIG = {
  // Main heatmap settings
  intensity: 1.5,
  radiusPixels: 50,
  threshold: 0.03,
  opacity: 0.85,
  
  // Ambient glow settings
  glowIntensity: 0.6,
  glowRadius: 100,
  
  // Hotspot settings
  hotspotIntensity: 2.5,
  hotspotRadius: 30,
  hotspotThreshold: 45,
  
  // Animation settings
  transitionDuration: 150, // Fast transitions for real-time feel
  
  // Color preset
  colorPreset: 'vibrant'
};

// Preset color ranges for different visualizations
const COLOR_PRESETS = {
  vibrant: [
    [64, 196, 255, 0],
    [59, 130, 246, 100],
    [16, 185, 129, 150],
    [34, 197, 94, 180],
    [250, 204, 21, 210],
    [249, 115, 22, 235],
    [239, 68, 68, 255]
  ],
  heat: [
    [0, 0, 0, 0],
    [30, 0, 100, 80],
    [120, 0, 180, 130],
    [200, 50, 50, 180],
    [255, 100, 0, 220],
    [255, 200, 0, 245],
    [255, 255, 200, 255]
  ],
  cool: [
    [0, 50, 100, 0],
    [0, 100, 150, 100],
    [0, 150, 200, 150],
    [50, 200, 200, 190],
    [100, 220, 180, 220],
    [150, 240, 160, 245],
    [200, 255, 200, 255]
  ],
  plasma: [
    [13, 8, 135, 0],
    [75, 3, 161, 100],
    [138, 10, 165, 150],
    [188, 55, 84, 190],
    [227, 99, 25, 220],
    [248, 149, 64, 245],
    [252, 206, 37, 255]
  ],
  fire: [
    [0, 0, 0, 0],
    [40, 0, 0, 80],
    [100, 10, 0, 130],
    [180, 30, 0, 180],
    [230, 80, 0, 220],
    [255, 150, 20, 245],
    [255, 220, 100, 255]
  ]
};

// Ambient glow colors (softer versions)
const GLOW_PRESETS = {
  vibrant: [
    [100, 180, 255, 0],
    [80, 150, 230, 40],
    [60, 180, 160, 70],
    [100, 200, 120, 100],
    [255, 220, 100, 130],
    [255, 160, 80, 160],
    [255, 120, 120, 190]
  ],
  heat: [
    [50, 0, 50, 0],
    [80, 0, 100, 40],
    [120, 20, 100, 70],
    [160, 50, 50, 100],
    [200, 80, 30, 130],
    [230, 120, 30, 160],
    [255, 180, 100, 190]
  ],
  cool: [
    [0, 80, 120, 0],
    [0, 100, 140, 40],
    [20, 130, 160, 70],
    [40, 160, 180, 100],
    [80, 190, 180, 130],
    [120, 210, 170, 160],
    [180, 240, 200, 190]
  ],
  plasma: [
    [30, 20, 100, 0],
    [60, 20, 130, 40],
    [100, 30, 140, 70],
    [150, 50, 100, 100],
    [190, 80, 50, 130],
    [220, 120, 60, 160],
    [240, 180, 50, 190]
  ],
  fire: [
    [20, 0, 0, 0],
    [50, 10, 0, 40],
    [80, 20, 0, 70],
    [130, 40, 0, 100],
    [180, 70, 10, 130],
    [220, 110, 30, 160],
    [255, 170, 70, 190]
  ]
};

/**
 * Create the main seamless heatmap layer - GPU optimized
 */
export function createSeamlessHeatmapLayer(data, options = {}) {
  const {
    intensity = LAYER_CONFIG.intensity,
    threshold = LAYER_CONFIG.threshold,
    radiusPixels = LAYER_CONFIG.radiusPixels,
    opacity = LAYER_CONFIG.opacity,
    colorPreset = LAYER_CONFIG.colorPreset,
    visible = true,
    transitionDuration = LAYER_CONFIG.transitionDuration
  } = options;
  
  const colors = COLOR_PRESETS[colorPreset] || COLOR_PRESETS.vibrant;
  
  return new deck.HeatmapLayer({
    id: 'seamless-heatmap-main',
    data: data,
    pickable: false,
    visible: visible,
    
    getPosition: d => d.position,
    getWeight: d => Math.pow(d.density / 100, 0.8),
    
    intensity: intensity,
    threshold: threshold,
    radiusPixels: radiusPixels,
    
    colorRange: colors,
    aggregation: 'SUM',
    
    // Disable transitions for smooth real-time animation
    transitions: {},
    
    // Force update on every data change
    updateTriggers: {
      getPosition: [data],
      getWeight: [data]
    }
  });
}

/**
 * Create ambient glow layer - large soft background
 */
export function createAmbientGlowLayer(data, options = {}) {
  const {
    intensity = LAYER_CONFIG.glowIntensity,
    threshold = 0.01,
    radiusPixels = LAYER_CONFIG.glowRadius,
    colorPreset = LAYER_CONFIG.colorPreset,
    visible = true
  } = options;
  
  const colors = GLOW_PRESETS[colorPreset] || GLOW_PRESETS.vibrant;
  
  return new deck.HeatmapLayer({
    id: 'ambient-glow-layer',
    data: data,
    pickable: false,
    visible: visible,
    
    getPosition: d => d.position,
    getWeight: d => d.density / 100,
    
    intensity: intensity,
    threshold: threshold,
    radiusPixels: radiusPixels,
    
    colorRange: colors,
    aggregation: 'MEAN',
    transitions: {},
    
    updateTriggers: {
      getPosition: [data],
      getWeight: [data]
    }
  });
}

/**
 * Create high-intensity hotspot layer
 */
export function createHotspotLayer(data, options = {}) {
  const {
    intensity = LAYER_CONFIG.hotspotIntensity,
    threshold = 0.1,
    radiusPixels = LAYER_CONFIG.hotspotRadius,
    hotspotThreshold = LAYER_CONFIG.hotspotThreshold,
    visible = true
  } = options;
  
  const hotspotData = data.filter(d => d.density > hotspotThreshold);
  
  return new deck.HeatmapLayer({
    id: 'hotspot-layer',
    data: hotspotData,
    pickable: false,
    visible: visible,
    
    getPosition: d => d.position,
    getWeight: d => Math.pow((d.density - hotspotThreshold) / (100 - hotspotThreshold), 1.2),
    
    intensity: intensity,
    threshold: threshold,
    radiusPixels: radiusPixels,
    
    colorRange: [
      [255, 200, 50, 0],
      [255, 180, 50, 140],
      [255, 140, 40, 180],
      [250, 100, 30, 210],
      [240, 60, 60, 240],
      [220, 40, 80, 255]
    ],
    
    aggregation: 'MAX',
    transitions: {},
    
    updateTriggers: {
      getPosition: [hotspotData],
      getWeight: [hotspotData]
    }
  });
}

/**
 * Create all visualization layers with full control
 */
export function createAllLayers(pointData, options = {}) {
  const {
    showGlow = true,
    showMain = true,
    showHotspots = true,
    
    intensity = LAYER_CONFIG.intensity,
    radiusPixels = LAYER_CONFIG.radiusPixels,
    threshold = LAYER_CONFIG.threshold,
    opacity = LAYER_CONFIG.opacity,
    
    glowIntensity = LAYER_CONFIG.glowIntensity,
    glowRadius = LAYER_CONFIG.glowRadius,
    
    hotspotIntensity = LAYER_CONFIG.hotspotIntensity,
    hotspotRadius = LAYER_CONFIG.hotspotRadius,
    hotspotThreshold = LAYER_CONFIG.hotspotThreshold,
    
    colorPreset = LAYER_CONFIG.colorPreset,
    transitionDuration = LAYER_CONFIG.transitionDuration,
    
    visible = true
  } = options;
  
  const layers = [];
  
  if (showGlow) {
    layers.push(createAmbientGlowLayer(pointData, {
      intensity: glowIntensity * opacity,
      radiusPixels: glowRadius,
      colorPreset,
      visible
    }));
  }
  
  if (showMain) {
    layers.push(createSeamlessHeatmapLayer(pointData, {
      intensity: intensity,
      radiusPixels: radiusPixels,
      threshold: threshold,
      opacity,
      colorPreset,
      transitionDuration,
      visible
    }));
  }
  
  if (showHotspots) {
    layers.push(createHotspotLayer(pointData, {
      intensity: hotspotIntensity,
      radiusPixels: hotspotRadius,
      hotspotThreshold,
      visible
    }));
  }
  
  return layers;
}

/**
 * Get available color presets
 */
export function getColorPresets() {
  return Object.keys(COLOR_PRESETS);
}

/**
 * Legacy support
 */
export function createHexagonCloudLayer(data, options = {}) {
  const pointData = data.map(d => ({
    position: d.center || d.position,
    density: d.density
  }));
  return createSeamlessHeatmapLayer(pointData, options);
}

export function createGlowLayer(data, options = {}) {
  return createAmbientGlowLayer(data, options);
}

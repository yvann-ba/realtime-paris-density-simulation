/**
 * Main Application Entry Point
 * Paris Traffic Visualization - Simple & Light
 */

import { initializeMap, PARIS_VIEW } from './map.js';
import { createAllLayers, LAYER_CONFIG, getColorPresets } from './layers.js';
import { Controls, Tooltip, LoadingOverlay } from './controls.js';
import { fetchTrafficData, transformDataForLayers, calculateStats, DataCache } from './dataService.js';

// Application state
const state = {
  map: null,
  deckgl: null,
  
  // Data for interpolation
  currentHourData: null,
  nextHourData: null,
  displayData: null,
  
  // Animation state
  animationFrame: null,
  lastTime: 0,
  progress: 0,
  animationSpeed: 1.0, // 1.0 = normal speed
  
  // Smooth movement offsets for each point
  pointOffsets: null,
  
  settings: {
    hour: new Date().getHours(),
    day: new Date().getDay(),
    
    // Lighter defaults
    opacity: 0.6,
    intensity: 1.0,
    radiusPixels: 40,
    threshold: 0.02,
    
    glowIntensity: 0.3,
    glowRadius: 60,
    showGlow: true,
    
    hotspotIntensity: 1.5,
    hotspotRadius: 20,
    hotspotThreshold: 55,
    showHotspots: true,
    
    colorPreset: 'vibrant',
    transitionDuration: 500
  }
};

// Services
const dataCache = new DataCache();
let controls = null;
let tooltip = null;
let loadingOverlay = null;

/**
 * Initialize the application
 */
async function init() {
  console.log('🗼 Initializing Paris Traffic...');
  
  loadingOverlay = new LoadingOverlay();
  loadingOverlay.show();
  
  try {
    state.map = await initializeMap('map');
    initDeckGL();
    initControls();
    tooltip = new Tooltip();
    
    await loadHourData(state.settings.hour, state.settings.day);
    
    // Auto-start animation if live streaming is enabled (default)
    const realtimeToggle = document.getElementById('realtime-toggle');
    if (realtimeToggle && realtimeToggle.checked) {
      startSimpleAnimation();
    }
    
    loadingOverlay.hide();
    console.log('🎉 Ready!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    loadingOverlay.hide();
    showError('Loading error. Make sure backend is running.');
  }
}

/**
 * Initialize Deck.gl - simple config
 */
function initDeckGL() {
  state.deckgl = new deck.MapboxOverlay({
    interleaved: false,
    layers: []
  });
  state.map.addControl(state.deckgl);
}

/**
 * Initialize UI controls
 */
function initControls() {
  controls = new Controls({
    onTimeChange: async (hour) => {
      state.settings.hour = hour;
      state.progress = 0;
      await loadHourData(hour, state.settings.day);
    },
    
    onDayChange: async (day) => {
      state.settings.day = day;
      await loadHourData(state.settings.hour, day);
    },
    
    onOpacityChange: (v) => { state.settings.opacity = v; updateLayers(); },
    onIntensityChange: (v) => { state.settings.intensity = v; updateLayers(); },
    onRadiusChange: (v) => { state.settings.radiusPixels = v; updateLayers(); },
    onThresholdChange: (v) => { state.settings.threshold = v; updateLayers(); },
    onGlowIntensityChange: (v) => { state.settings.glowIntensity = v; updateLayers(); },
    onGlowRadiusChange: (v) => { state.settings.glowRadius = v; updateLayers(); },
    onGlowToggle: (v) => { state.settings.showGlow = v; updateLayers(); },
    onHotspotIntensityChange: (v) => { state.settings.hotspotIntensity = v; updateLayers(); },
    onHotspotRadiusChange: (v) => { state.settings.hotspotRadius = v; updateLayers(); },
    onHotspotThresholdChange: (v) => { state.settings.hotspotThreshold = v; updateLayers(); },
    onHotspotToggle: (v) => { state.settings.showHotspots = v; updateLayers(); },
    onColorPresetChange: (v) => { state.settings.colorPreset = v; updateLayers(); },
    
    // Live streaming toggle starts/stops animation
    onRealtimeToggle: (isStreaming) => {
      if (isStreaming) {
        startSimpleAnimation();
      } else {
        stopAnimation();
      }
    },
    onUpdateIntervalChange: () => {},
    onNoiseAmountChange: () => {},
    onAnimationSpeedChange: (speed) => {
      state.animationSpeed = speed;
    },
    
    onPlayToggle: (isPlaying) => {
      if (isPlaying) {
        startSimpleAnimation();
      } else {
        stopAnimation();
      }
    }
  });
}

/**
 * Load data for one hour
 */
async function loadHourData(hour, day) {
  try {
    const nextHour = (hour + 1) % 24;
    
    // Load current and next hour
    let current = dataCache.get(hour, day);
    let next = dataCache.get(nextHour, day);
    
    if (!current) {
      current = await fetchTrafficData(hour, day);
      dataCache.set(hour, day, current);
    }
    if (!next) {
      next = await fetchTrafficData(nextHour, day);
      dataCache.set(nextHour, day, next);
    }
    
    state.currentHourData = transformDataForLayers(current);
    state.nextHourData = transformDataForLayers(next);
    
    // Initialize display data with positions
    state.displayData = {
      points: state.currentHourData.points.map(p => ({
        ...p,
        position: [...p.position] // Clone position array
      }))
    };
    
    // Initialize point offsets for smooth movement
    initializePointOffsets(state.currentHourData.points.length);
    
    const stats = calculateStats(current);
    controls.updateStats(stats);
    
    updateLayers();
    
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

/**
 * Initialize random offsets for organic movement
 */
function initializePointOffsets(count) {
  state.pointOffsets = [];
  for (let i = 0; i < count; i++) {
    state.pointOffsets.push({
      // Random phase offsets for sine waves
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      // Random speeds (varied for more organic feel)
      speedX: 0.3 + Math.random() * 0.8,
      speedY: 0.3 + Math.random() * 0.8,
      // Larger amplitude for visible movement (in degrees)
      amplitude: 0.001 + Math.random() * 0.002
    });
  }
}

/**
 * Start smooth animation using requestAnimationFrame
 * Creates fluid movement of heatmap clouds
 */
let frameCount = 0;
let lastFpsUpdate = 0;

function startSimpleAnimation() {
  stopAnimation();
  
  state.progress = 0;
  state.lastTime = performance.now();
  frameCount = 0;
  lastFpsUpdate = performance.now();
  
  function animate(currentTime) {
    const deltaTime = (currentTime - state.lastTime) / 1000; // seconds
    state.lastTime = currentTime;
    
    // FPS counter
    frameCount++;
    if (currentTime - lastFpsUpdate > 1000) {
      const fps = Math.round(frameCount * 1000 / (currentTime - lastFpsUpdate));
      const fpsDisplay = document.getElementById('fps-display');
      if (fpsDisplay) fpsDisplay.textContent = `${fps} FPS`;
      frameCount = 0;
      lastFpsUpdate = currentTime;
    }
    
    // Update progress based on animation speed
    // Full hour transition takes about 10 seconds at speed 1.0
    state.progress += deltaTime * 0.1 * state.animationSpeed;
    
    if (state.progress >= 1) {
      state.progress = 0;
      state.settings.hour = (state.settings.hour + 1) % 24;
      
      // Update UI
      if (controls.timeSlider) {
        controls.timeSlider.value = state.settings.hour;
        controls.updateTimeDisplay(state.settings.hour);
      }
      
      // Shift data
      state.currentHourData = state.nextHourData;
      const nextHour = (state.settings.hour + 1) % 24;
      
      // Load next hour in background
      fetchTrafficData(nextHour, state.settings.day).then(data => {
        dataCache.set(nextHour, state.settings.day, data);
        state.nextHourData = transformDataForLayers(data);
      });
    }
    
    // Smooth interpolation with position movement
    interpolateWithMovement(state.progress, currentTime / 1000);
    updateLayers();
    
    // Continue animation
    state.animationFrame = requestAnimationFrame(animate);
  }
  
  state.animationFrame = requestAnimationFrame(animate);
  console.log('▶️ Animation started (smooth mode)');
}

/**
 * Stop animation
 */
function stopAnimation() {
  if (state.animationFrame) {
    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
  }
}

/**
 * Interpolation with smooth organic movement
 * Creates flowing heatmap cloud effect
 */
function interpolateWithMovement(t, time) {
  if (!state.currentHourData || !state.nextHourData || !state.displayData) return;
  if (!state.pointOffsets) return;
  
  const curr = state.currentHourData.points;
  const next = state.nextHourData.points;
  const disp = state.displayData.points;
  
  // Smooth t with easing for density transition
  const smooth = t * t * (3 - 2 * t);
  
  const len = Math.min(curr.length, next.length, disp.length, state.pointOffsets.length);
  
  for (let i = 0; i < len; i++) {
    // Interpolate density
    disp[i].density = curr[i].density + (next[i].density - curr[i].density) * smooth;
    
    // Apply organic movement to positions
    const offset = state.pointOffsets[i];
    const basePos = curr[i].position;
    
    // Sine wave movement creates smooth flowing effect
    const offsetX = Math.sin(time * offset.speedX + offset.phaseX) * offset.amplitude;
    const offsetY = Math.sin(time * offset.speedY + offset.phaseY) * offset.amplitude;
    
    // Scale movement by density (busier areas move more)
    const densityFactor = 0.5 + (disp[i].density / 100) * 0.5;
    
    disp[i].position[0] = basePos[0] + offsetX * densityFactor;
    disp[i].position[1] = basePos[1] + offsetY * densityFactor;
  }
}

/**
 * Simple linear interpolation between hours (fallback)
 */
function interpolate(t) {
  if (!state.currentHourData || !state.nextHourData || !state.displayData) return;
  
  const curr = state.currentHourData.points;
  const next = state.nextHourData.points;
  const disp = state.displayData.points;
  
  // Smooth t with simple easing
  const smooth = t * t * (3 - 2 * t);
  
  const len = Math.min(curr.length, next.length, disp.length);
  for (let i = 0; i < len; i++) {
    disp[i].density = curr[i].density + (next[i].density - curr[i].density) * smooth;
  }
}

/**
 * Update Deck.gl layers with current data and settings
 */
function updateLayers() {
  if (!state.displayData || !state.deckgl) return;
  
  // Create a fresh copy of points to force Deck.gl to update
  // This is necessary because HeatmapLayer doesn't detect in-place mutations
  const points = state.displayData.points.map(p => ({
    position: [p.position[0], p.position[1]],
    density: p.density
  }));
  
  const s = state.settings;
  
  const layers = createAllLayers(points, {
    // Main heatmap
    intensity: s.intensity,
    radiusPixels: s.radiusPixels,
    threshold: s.threshold,
    opacity: s.opacity,
    
    // Glow
    glowIntensity: s.glowIntensity,
    glowRadius: s.glowRadius,
    showGlow: s.showGlow,
    
    // Hotspots
    hotspotIntensity: s.hotspotIntensity,
    hotspotRadius: s.hotspotRadius,
    hotspotThreshold: s.hotspotThreshold,
    showHotspots: s.showHotspots,
    
    // Color and animation
    colorPreset: s.colorPreset,
    transitionDuration: s.transitionDuration
  });
  
  state.deckgl.setProps({ layers });
}

/**
 * Show error message to user
 */
function showError(message) {
  const overlay = document.getElementById('loading-overlay');
  overlay.innerHTML = `
    <div class="loader">
      <p style="color: #dc2626; font-size: 1.1rem;">⚠️ ${message}</p>
      <p style="margin-top: 10px; font-size: 0.85rem; color: rgba(0,0,0,0.5);">
        Run: <code style="background: rgba(0,0,0,0.06); padding: 2px 8px; border-radius: 6px;">npm start</code> in terminal
      </p>
      <button onclick="location.reload()" style="
        margin-top: 20px;
        padding: 12px 28px;
        background: #1a1a2e;
        border: none;
        border-radius: 10px;
        color: white;
        cursor: pointer;
      ">Retry</button>
    </div>
  `;
  overlay.classList.remove('hidden');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging
window.parisApp = state;

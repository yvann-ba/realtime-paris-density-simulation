/**
 * UI Controls Handler
 * Full control over real-time traffic visualization
 * Simplified smooth animation between hours
 */

import { densityToCssColor } from './colorScale.js';

/**
 * Controls class for all visualization parameters
 */
export class Controls {
  constructor(options = {}) {
    // Basic callbacks
    this.onTimeChange = options.onTimeChange || (() => {});
    this.onDayChange = options.onDayChange || (() => {});
    this.onPlayToggle = options.onPlayToggle || (() => {});
    
    // Main visualization callbacks
    this.onOpacityChange = options.onOpacityChange || (() => {});
    this.onIntensityChange = options.onIntensityChange || (() => {});
    this.onRadiusChange = options.onRadiusChange || (() => {});
    this.onThresholdChange = options.onThresholdChange || (() => {});
    
    // Glow callbacks
    this.onGlowIntensityChange = options.onGlowIntensityChange || (() => {});
    this.onGlowRadiusChange = options.onGlowRadiusChange || (() => {});
    this.onGlowToggle = options.onGlowToggle || (() => {});
    
    // Hotspot callbacks
    this.onHotspotIntensityChange = options.onHotspotIntensityChange || (() => {});
    this.onHotspotRadiusChange = options.onHotspotRadiusChange || (() => {});
    this.onHotspotThresholdChange = options.onHotspotThresholdChange || (() => {});
    this.onHotspotToggle = options.onHotspotToggle || (() => {});
    
    // Color and real-time callbacks
    this.onColorPresetChange = options.onColorPresetChange || (() => {});
    this.onRealtimeToggle = options.onRealtimeToggle || (() => {});
    this.onUpdateIntervalChange = options.onUpdateIntervalChange || (() => {});
    this.onNoiseAmountChange = options.onNoiseAmountChange || (() => {});
    this.onAnimationSpeedChange = options.onAnimationSpeedChange || (() => {});
    
    this.isPlaying = false;
    
    this.initializeControls();
  }
  
  initializeControls() {
    // Time controls
    this.timeSlider = document.getElementById('time-slider');
    this.timeDisplay = document.getElementById('time-display');
    this.daySelect = document.getElementById('day-select');
    
    // Main visualization controls
    this.opacitySlider = document.getElementById('opacity-slider');
    this.opacityDisplay = document.getElementById('opacity-display');
    this.intensitySlider = document.getElementById('intensity-slider');
    this.intensityDisplay = document.getElementById('intensity-display');
    this.radiusSlider = document.getElementById('radius-slider');
    this.radiusDisplay = document.getElementById('radius-display');
    this.thresholdSlider = document.getElementById('threshold-slider');
    this.thresholdDisplay = document.getElementById('threshold-display');
    
    // Glow controls
    this.glowIntensitySlider = document.getElementById('glow-intensity-slider');
    this.glowIntensityDisplay = document.getElementById('glow-intensity-display');
    this.glowRadiusSlider = document.getElementById('glow-radius-slider');
    this.glowRadiusDisplay = document.getElementById('glow-radius-display');
    this.glowToggle = document.getElementById('glow-toggle');
    
    // Hotspot controls
    this.hotspotIntensitySlider = document.getElementById('hotspot-intensity-slider');
    this.hotspotIntensityDisplay = document.getElementById('hotspot-intensity-display');
    this.hotspotRadiusSlider = document.getElementById('hotspot-radius-slider');
    this.hotspotRadiusDisplay = document.getElementById('hotspot-radius-display');
    this.hotspotThresholdSlider = document.getElementById('hotspot-threshold-slider');
    this.hotspotThresholdDisplay = document.getElementById('hotspot-threshold-display');
    this.hotspotToggle = document.getElementById('hotspot-toggle');
    
    // Color and real-time controls
    this.colorPresetSelect = document.getElementById('color-preset');
    this.realtimeToggle = document.getElementById('realtime-toggle');
    this.updateIntervalSlider = document.getElementById('update-interval-slider');
    this.updateIntervalDisplay = document.getElementById('update-interval-display');
    this.noiseSlider = document.getElementById('noise-slider');
    this.noiseDisplay = document.getElementById('noise-display');
    
    // Animation speed slider
    this.animationSpeedSlider = document.getElementById('animation-speed-slider');
    this.animationSpeedDisplay = document.getElementById('animation-speed-display');
    
    // Play button
    this.playBtn = document.getElementById('play-btn');
    this.playIcon = document.getElementById('play-icon');
    this.playText = document.getElementById('play-text');
    
    // Stats elements
    this.statZones = document.getElementById('stat-zones');
    this.statAvg = document.getElementById('stat-avg');
    this.statMax = document.getElementById('stat-max');
    
    this.bindEvents();
  }
  
  bindEvents() {
    // Time controls
    if (this.timeSlider) {
      this.timeSlider.addEventListener('input', (e) => {
        const hour = parseInt(e.target.value);
        this.updateTimeDisplay(hour);
        this.onTimeChange(hour);
      });
    }
    
    if (this.daySelect) {
      this.daySelect.addEventListener('change', (e) => {
        this.onDayChange(parseInt(e.target.value));
      });
    }
    
    // Main visualization controls
    if (this.opacitySlider) {
      this.opacitySlider.addEventListener('input', (e) => {
        const opacity = parseInt(e.target.value);
        if (this.opacityDisplay) this.opacityDisplay.textContent = `${opacity}%`;
        this.onOpacityChange(opacity / 100);
      });
    }
    
    if (this.intensitySlider) {
      this.intensitySlider.addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        if (this.intensityDisplay) this.intensityDisplay.textContent = intensity.toFixed(1);
        this.onIntensityChange(intensity);
      });
    }
    
    if (this.radiusSlider) {
      this.radiusSlider.addEventListener('input', (e) => {
        const radius = parseInt(e.target.value);
        if (this.radiusDisplay) this.radiusDisplay.textContent = `${radius}px`;
        this.onRadiusChange(radius);
      });
    }
    
    if (this.thresholdSlider) {
      this.thresholdSlider.addEventListener('input', (e) => {
        const threshold = parseFloat(e.target.value);
        if (this.thresholdDisplay) this.thresholdDisplay.textContent = threshold.toFixed(2);
        this.onThresholdChange(threshold);
      });
    }
    
    // Glow controls
    if (this.glowIntensitySlider) {
      this.glowIntensitySlider.addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        if (this.glowIntensityDisplay) this.glowIntensityDisplay.textContent = intensity.toFixed(1);
        this.onGlowIntensityChange(intensity);
      });
    }
    
    if (this.glowRadiusSlider) {
      this.glowRadiusSlider.addEventListener('input', (e) => {
        const radius = parseInt(e.target.value);
        if (this.glowRadiusDisplay) this.glowRadiusDisplay.textContent = `${radius}px`;
        this.onGlowRadiusChange(radius);
      });
    }
    
    if (this.glowToggle) {
      this.glowToggle.addEventListener('change', (e) => {
        this.onGlowToggle(e.target.checked);
      });
    }
    
    // Hotspot controls
    if (this.hotspotIntensitySlider) {
      this.hotspotIntensitySlider.addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        if (this.hotspotIntensityDisplay) this.hotspotIntensityDisplay.textContent = intensity.toFixed(1);
        this.onHotspotIntensityChange(intensity);
      });
    }
    
    if (this.hotspotRadiusSlider) {
      this.hotspotRadiusSlider.addEventListener('input', (e) => {
        const radius = parseInt(e.target.value);
        if (this.hotspotRadiusDisplay) this.hotspotRadiusDisplay.textContent = `${radius}px`;
        this.onHotspotRadiusChange(radius);
      });
    }
    
    if (this.hotspotThresholdSlider) {
      this.hotspotThresholdSlider.addEventListener('input', (e) => {
        const threshold = parseInt(e.target.value);
        if (this.hotspotThresholdDisplay) this.hotspotThresholdDisplay.textContent = `${threshold}%`;
        this.onHotspotThresholdChange(threshold);
      });
    }
    
    if (this.hotspotToggle) {
      this.hotspotToggle.addEventListener('change', (e) => {
        this.onHotspotToggle(e.target.checked);
      });
    }
    
    // Color and real-time controls
    if (this.colorPresetSelect) {
      this.colorPresetSelect.addEventListener('change', (e) => {
        this.onColorPresetChange(e.target.value);
      });
    }
    
    if (this.realtimeToggle) {
      this.realtimeToggle.addEventListener('change', (e) => {
        this.onRealtimeToggle(e.target.checked);
      });
    }
    
    if (this.updateIntervalSlider) {
      this.updateIntervalSlider.addEventListener('input', (e) => {
        const interval = parseInt(e.target.value);
        if (this.updateIntervalDisplay) this.updateIntervalDisplay.textContent = `${interval}ms`;
        this.onUpdateIntervalChange(interval);
      });
    }
    
    if (this.noiseSlider) {
      this.noiseSlider.addEventListener('input', (e) => {
        const noise = parseFloat(e.target.value);
        if (this.noiseDisplay) this.noiseDisplay.textContent = `${Math.round(noise * 100)}%`;
        this.onNoiseAmountChange(noise);
      });
    }
    
    // Animation speed slider
    if (this.animationSpeedSlider) {
      this.animationSpeedSlider.addEventListener('input', (e) => {
        this.animationSpeed = parseFloat(e.target.value);
        if (this.animationSpeedDisplay) {
          this.animationSpeedDisplay.textContent = `${this.animationSpeed}x`;
        }
        this.onAnimationSpeedChange(this.animationSpeed);
      });
    }
    
    // Play button
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }
  }
  
  updateTimeDisplay(hour) {
    if (this.timeDisplay) {
      this.timeDisplay.textContent = `${hour.toString().padStart(2, '0')}:00`;
    }
  }
  
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    
    if (this.isPlaying) {
      if (this.playBtn) this.playBtn.classList.add('playing');
      if (this.playIcon) this.playIcon.textContent = '⏸';
      if (this.playText) this.playText.textContent = 'Stop';
    } else {
      if (this.playBtn) this.playBtn.classList.remove('playing');
      if (this.playIcon) this.playIcon.textContent = '▶';
      if (this.playText) this.playText.textContent = 'Animate';
    }
    
    this.onPlayToggle(this.isPlaying);
  }
  
  updateStats(stats) {
    if (this.statZones) this.statZones.textContent = stats.zones || '--';
    if (this.statAvg) this.statAvg.textContent = stats.avg !== undefined ? Math.round(stats.avg) : '--';
    if (this.statMax) this.statMax.textContent = stats.max !== undefined ? Math.round(stats.max) : '--';
  }
  
  getValues() {
    return {
      hour: this.timeSlider ? parseInt(this.timeSlider.value) : 14,
      day: this.daySelect ? parseInt(this.daySelect.value) : 5,
      opacity: this.opacitySlider ? parseInt(this.opacitySlider.value) / 100 : 0.85
    };
  }
  
  destroy() {
    // Nothing to clean up
  }
}

/**
 * Tooltip manager
 */
export class Tooltip {
  constructor() {
    this.element = document.getElementById('tooltip');
  }
  
  show(info) {
    if (!info.object || !this.element) {
      this.hide();
      return;
    }
    
    const { x, y, object } = info;
    const density = object.density || 0;
    const color = densityToCssColor(density);
    
    this.element.innerHTML = `
      <div class="tooltip-title">Zone</div>
      <div class="tooltip-value">Density: ${Math.round(density)}%</div>
      <div class="tooltip-density-bar">
        <div class="tooltip-density-fill" style="width: ${density}%; background: ${color};"></div>
      </div>
    `;
    
    let posX = x + 15;
    let posY = y + 15;
    
    if (posX + 200 > window.innerWidth) posX = x - 215;
    if (posY + 100 > window.innerHeight) posY = y - 115;
    
    this.element.style.left = `${posX}px`;
    this.element.style.top = `${posY}px`;
    this.element.classList.add('visible');
  }
  
  hide() {
    if (this.element) this.element.classList.remove('visible');
  }
}

/**
 * Loading overlay manager
 */
export class LoadingOverlay {
  constructor() {
    this.element = document.getElementById('loading-overlay');
  }
  
  show() {
    if (this.element) this.element.classList.remove('hidden');
  }
  
  hide() {
    if (this.element) this.element.classList.add('hidden');
  }
}

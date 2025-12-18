/**
 * Color Scale Utility
 * Converts density values (0-100) to RGBA colors
 * Modern vibrant palette: Blue → Teal → Green → Amber → Orange → Red
 * Optimized for light/white map background
 */

// Color stops for the gradient - More vibrant colors, controlled alpha
const COLOR_STOPS = [
  { value: 0, color: [59, 130, 246, 140] },     // Blue (Tailwind blue-500)
  { value: 25, color: [16, 185, 129, 155] },    // Emerald (Tailwind emerald-500)
  { value: 50, color: [34, 197, 94, 170] },     // Green (Tailwind green-500)
  { value: 65, color: [245, 158, 11, 180] },    // Amber (Tailwind amber-500)
  { value: 80, color: [249, 115, 22, 190] },    // Orange (Tailwind orange-500)
  { value: 100, color: [239, 68, 68, 200] }     // Red (Tailwind red-500)
];

/**
 * Interpolate between two colors
 */
function lerpColor(color1, color2, t) {
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * t),
    Math.round(color1[1] + (color2[1] - color1[1]) * t),
    Math.round(color1[2] + (color2[2] - color1[2]) * t),
    Math.round(color1[3] + (color2[3] - color1[3]) * t)
  ];
}

/**
 * Get RGBA color for a density value (0-100)
 * @param {number} density - Value between 0 and 100
 * @param {number} opacityMultiplier - Optional multiplier for alpha (0-1)
 * @returns {number[]} RGBA array [r, g, b, a]
 */
export function densityToColor(density, opacityMultiplier = 1) {
  // Clamp density to 0-100
  const value = Math.max(0, Math.min(100, density));
  
  // Find the two color stops to interpolate between
  let lower = COLOR_STOPS[0];
  let upper = COLOR_STOPS[COLOR_STOPS.length - 1];
  
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (value >= COLOR_STOPS[i].value && value <= COLOR_STOPS[i + 1].value) {
      lower = COLOR_STOPS[i];
      upper = COLOR_STOPS[i + 1];
      break;
    }
  }
  
  // Calculate interpolation factor
  const range = upper.value - lower.value;
  const t = range === 0 ? 0 : (value - lower.value) / range;
  
  // Interpolate color
  const color = lerpColor(lower.color, upper.color, t);
  
  // Apply opacity multiplier - ensure we don't go too transparent or opaque
  color[3] = Math.round(Math.min(200, Math.max(40, color[3] * opacityMultiplier)));
  
  return color;
}

/**
 * Get elevation (height) for a density value
 * @param {number} density - Value between 0 and 100
 * @param {number} multiplier - Height multiplier
 * @returns {number} Elevation value
 */
export function densityToElevation(density, multiplier = 1) {
  // Non-linear scaling for more dramatic effect on high densities
  const normalizedDensity = density / 100;
  const easedDensity = Math.pow(normalizedDensity, 0.7); // Ease out for smoother curve
  return easedDensity * 600 * multiplier; // Reduced max height for cleaner look
}

/**
 * Get CSS color string for a density value
 * @param {number} density - Value between 0 and 100
 * @returns {string} CSS rgba color string
 */
export function densityToCssColor(density) {
  const [r, g, b, a] = densityToColor(density);
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

/**
 * Export color stops for use in other modules
 */
export { COLOR_STOPS };

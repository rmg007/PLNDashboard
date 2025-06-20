// Color palettes for light and dark themes
const lightPalette = [
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#ca8a04', // yellow-600
  '#c62828', // red-700
  '#7c3aed', // violet-600
  '#0e7490', // cyan-700
  '#f59e0b', // amber-500
  '#be185d'  // pink-700
];

const darkPalette = [
  '#60a5fa', // blue-400
  '#4ade80', // green-400
  '#facc15', // yellow-400
  '#f87171', // red-400
  '#d8b4fe', // purple-300
  '#67e8f9', // cyan-300
  '#fbbf24', // amber-400
  '#f472b6'  // pink-400
];

/**
 * Get the appropriate color palette based on the current theme
 * @param {boolean} isDark - Whether dark theme is active
 * @returns {string[]} Array of hex color codes
 */
export const getPalette = (isDark) => isDark ? darkPalette : lightPalette;

/**
 * Get Plotly-compatible layout configuration for the current theme
 * @param {boolean} isDark - Whether dark theme is active
 * @returns {Object} Plotly layout configuration
 */
export const getPlotlyLayout = (isDark) => ({
  paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
  plot_bgcolor: 'rgba(0,0,0,0)',  // Transparent plot area
  font: {
    color: isDark ? '#e5e7eb' : '#1f2937', // text-gray-200 : text-gray-800
    family: 'Inter, system-ui, -apple-system, sans-serif',
  },
  xaxis: {
    gridcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    linecolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
  },
  yaxis: {
    gridcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    linecolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
  },
  colorway: getPalette(isDark),
  hoverlabel: {
    bgcolor: isDark ? '#1f2937' : '#f9fafb',
    font: {
      color: isDark ? '#f3f4f6' : '#111827',
    },
    bordercolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  },
});

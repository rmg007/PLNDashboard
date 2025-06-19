// src/utils/titleManager.js

/**
 * Title mapping for different dashboard components
 */
export const PAGE_TITLES = {
  // Unique Permits Analysis
  AnnualUniquePermitsReport: 'Annual Unique Permits Analysis',
  MonthlyUniquePermitsReport: 'Monthly Unique Permits Analysis',
  QuarterlyUniquePermitsReport: 'Quarterly Unique Permits Analysis',
  
  // Department Activity
  LUActivityReport: 'Land Use Activity Analysis',
  PLNCheckActivityReport: 'Plan Check Activity Analysis',
  PSCActivityReport: 'PSC Activity Analysis',
  
  // Default
  default: 'Dashboard'
};

/**
 * Get the title for a specific component
 * @param {string} componentName - The name of the component
 * @returns {string} The title for the component
 */
export function getComponentTitle(componentName) {
  return PAGE_TITLES[componentName] || PAGE_TITLES.default;
}

/**
 * Update the document title based on the component name
 * @param {string} componentName - The name of the component
 * @param {Function} setTitle - The function to set the title (from LayoutContext)
 */
export function updateTitle(componentName, setTitle) {
  const title = getComponentTitle(componentName);
  setTitle(title);
  return title;
}

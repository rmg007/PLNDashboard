// src/utils/tooltipInit.js

/**
 * Initialize Tailwind tooltips
 * This function initializes tooltips for elements with data-tooltip-target attribute
 */
export function initTooltips() {
  const tooltipTriggerList = document.querySelectorAll('[data-tooltip-target]');
  
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    const targetId = tooltipTriggerEl.getAttribute('data-tooltip-target');
    const tooltipEl = document.getElementById(targetId);
    
    if (!tooltipEl) return;
    
    // Show tooltip on hover
    tooltipTriggerEl.addEventListener('mouseenter', () => {
      tooltipEl.classList.remove('invisible', 'opacity-0');
      tooltipEl.classList.add('visible', 'opacity-100');
      
      // Position the tooltip
      const rect = tooltipTriggerEl.getBoundingClientRect();
      tooltipEl.style.position = 'fixed';
      tooltipEl.style.top = `${rect.bottom + 10}px`;
      tooltipEl.style.left = `${rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2)}px`;
    });
    
    // Hide tooltip on mouse leave
    tooltipTriggerEl.addEventListener('mouseleave', () => {
      tooltipEl.classList.add('invisible', 'opacity-0');
      tooltipEl.classList.remove('visible', 'opacity-100');
    });
  });
}

import { useId } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Reusable Tooltip component with accessibility features and theme support
 * @param {Object} props - Component props
 * @param {Function} props.children - Render prop that receives tooltip props
 * @param {string} props.text - Tooltip text content
 * @param {string} [props.position='top'] - Tooltip position (top, bottom, left, right)
 * @param {string} [props.id] - Optional custom ID (will generate one if not provided)
 * @param {string} [props.className] - Optional additional classes for the tooltip
 * @returns {JSX.Element} Tooltip component
 */
export default function Tooltip({ 
  children, 
  text, 
  position = 'top',
  id: customId,
  className = ''
}) {
  // Generate a unique ID if not provided
  const generatedId = useId();
  const id = customId || `tooltip-${generatedId}`;
  const { isDark } = useTheme();
  
  // Position classes mapping
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Validate position
  const validPosition = Object.keys(positionClasses).includes(position) ? position : 'top';

  // Safe text rendering
  const safeText = text || 'Tooltip';
  
  try {
    return (
      <div className={`relative inline-block group ${className}`}>
        {typeof children === 'function' ? children({ id }) : children}
        <span
          id={id}
          role="tooltip"
          aria-hidden="true"
          className={`absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 
                     px-3 py-2 text-sm font-medium text-white ${isDark ? 'bg-gray-800' : 'bg-gray-900'} rounded-lg shadow-sm 
                     transition-opacity duration-300 ${positionClasses[validPosition]}`}
        >
          {safeText}
          <div 
            className={`absolute w-2 h-2 ${isDark ? 'bg-gray-800' : 'bg-gray-900'} transform rotate-45 -translate-x-1/2 -z-10`} 
            style={{
              left: '50%',
              ...(validPosition === 'top' && { bottom: '-4px' }),
              ...(validPosition === 'bottom' && { top: '-4px' }),
              ...(validPosition === 'left' && { right: '-4px', top: '50%', left: 'auto' }),
              ...(validPosition === 'right' && { left: '-4px', top: '50%' }),
            }}
            aria-hidden="true"
          />
        </span>
      </div>
    );
  } catch (error) {
    console.error('Error rendering Tooltip:', error);
    // Fallback rendering without the tooltip
    return (
      <div className={`inline-block ${className}`}>
        {typeof children === 'function' ? children({ id }) : children}
      </div>
    );
  }
}

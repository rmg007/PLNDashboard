// src/components/charts/BarChartTableFilterComponent.jsx

import React, { useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import BarChartTableComponent from './BarChartTableComponent';

/**
 * A component that extends BarChartTableComponent with filtering capabilities.
 * Allows users to filter the displayed data by selecting rows directly within the table.
 * 
 * @param {object} props - The component props
 * @param {string} props.id - Unique identifier for the component
 * @param {Array<object>} props.data - The dataset for the chart and table
 * @param {string} props.xField - The key in data representing the x-axis values
 * @param {string} props.yField - The key in data representing the y-axis values
 * @param {string} props.title - The title of the chart
 * @param {Array<object>} props.columns - Defining the table columns (React Table format)
 * @param {string} [props.selectionMode='multi'] - Either 'single' or 'multi' for table row selection
 * @param {Function} [props.onSelectionChange] - Callback when selections change
 * @param {Array} [props.initialSelection] - Initial selected xField values to filter by
 * @param {boolean} [props.showSelectionControls=true] - Display "Clear Selection" and "Select All" buttons
 * @param {string} [props.filterDisplayMode='hide'] - Either 'hide' or 'highlight'
 * @returns {React.Component} The BarChartTableFilterComponent
 */
const BarChartTableFilterComponent = forwardRef(({
  id,
  data = [],
  xField,
  yField,
  title,
  columns = [],
  selectionMode = 'multi',
  onSelectionChange,
  initialSelection = [],
  showSelectionControls = true,
  filterDisplayMode = 'hide',
  ...otherProps
}, ref) => {
  // State for selected items
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [selectedValues, setSelectedValues] = useState(new Set(initialSelection));
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  
  // Create a ref to the BarChartTableComponent
  const chartTableRef = React.useRef(null);
  
  // Expose methods to parent components through ref
  useImperativeHandle(ref, () => ({
    exportAsXLSX: () => chartTableRef.current?.exportAsXLSX(),
    exportAsPNG: () => chartTableRef.current?.exportAsPNG(),
    toggleTable: () => chartTableRef.current?.toggleTable(),
    isTableVisible: () => chartTableRef.current?.isTableVisible(),
    clearSelection: clearSelection,
    selectAll: selectAll,
    getSelectedValues: () => Array.from(selectedValues),
  }));
  
  // Initialize selection from initialSelection prop
  useEffect(() => {
    if (initialSelection && initialSelection.length > 0) {
      const indices = new Set();
      const values = new Set(initialSelection);
      
      data.forEach((item, index) => {
        if (initialSelection.includes(item[xField])) {
          indices.add(index);
        }
      });
      
      setSelectedIndices(indices);
      setSelectedValues(values);
    }
  }, [initialSelection, data, xField]);
  
  // Persist selections in localStorage
  useEffect(() => {
    if (id) {
      try {
        localStorage.setItem(`${id}-selection`, JSON.stringify(Array.from(selectedValues)));
      } catch (error) {
        console.warn('Failed to save selection to localStorage:', error);
      }
    }
  }, [selectedValues, id]);
  
  // Load persisted selections from localStorage on mount
  useEffect(() => {
    if (id && initialSelection.length === 0) {
      try {
        const savedSelection = localStorage.getItem(`${id}-selection`);
        if (savedSelection) {
          const parsedSelection = JSON.parse(savedSelection);
          if (Array.isArray(parsedSelection) && parsedSelection.length > 0) {
            const indices = new Set();
            const values = new Set(parsedSelection);
            
            data.forEach((item, index) => {
              if (parsedSelection.includes(item[xField])) {
                indices.add(index);
              }
            });
            
            setSelectedIndices(indices);
            setSelectedValues(values);
          }
        }
      } catch (error) {
        console.warn('Failed to load selection from localStorage:', error);
      }
    }
  }, [id, data, xField, initialSelection]);
  
  // Filter data based on selection and filterDisplayMode
  const filteredData = useMemo(() => {
    // If no selection, show all data
    if (selectedValues.size === 0) {
      return data;
    }
    
    if (filterDisplayMode === 'hide') {
      // Only show selected items
      return data.filter(item => selectedValues.has(item[xField]));
    } else {
      // Return all data for highlight mode
      return data;
    }
  }, [data, selectedValues, xField, filterDisplayMode]);
  
  // Handle row selection in the table
  const handleRowSelect = useCallback((rowIndex, event) => {
    const item = data[rowIndex];
    const value = item[xField];
    
    setSelectedValues(prev => {
      const newSet = new Set(prev);
      
      if (selectionMode === 'single') {
        // For single selection mode, clear previous selection
        newSet.clear();
        newSet.add(value);
      } else {
        // For multi selection mode, toggle the selection
        if (newSet.has(value)) {
          newSet.delete(value);
        } else {
          newSet.add(value);
        }
      }
      
      // Call onSelectionChange callback if provided
      if (onSelectionChange) {
        onSelectionChange(Array.from(newSet));
      }
      
      return newSet;
    });
    
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      
      if (selectionMode === 'single') {
        newSet.clear();
        newSet.add(rowIndex);
      } else {
        if (newSet.has(rowIndex)) {
          newSet.delete(rowIndex);
        } else {
          newSet.add(rowIndex);
        }
      }
      
      return newSet;
    });
  }, [data, xField, selectionMode, onSelectionChange]);
  
  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIndices(new Set());
    setSelectedValues(new Set());
    
    if (onSelectionChange) {
      onSelectionChange([]);
    }
    
    // Clear from localStorage
    if (id) {
      try {
        localStorage.removeItem(`${id}-selection`);
      } catch (error) {
        console.warn('Failed to clear selection from localStorage:', error);
      }
    }
  }, [id, onSelectionChange]);
  
  // Select all items
  const selectAll = useCallback(() => {
    const allIndices = new Set(data.map((_, index) => index));
    const allValues = new Set(data.map(item => item[xField]));
    
    setSelectedIndices(allIndices);
    setSelectedValues(allValues);
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(allValues));
    }
    
    // Save to localStorage
    if (id) {
      try {
        localStorage.setItem(`${id}-selection`, JSON.stringify(Array.from(allValues)));
      } catch (error) {
        console.warn('Failed to save selection to localStorage:', error);
      }
    }
  }, [data, xField, id, onSelectionChange]);
  
  // Generate chart traces with highlighting if needed
  const enhancedProps = useMemo(() => {
    const props = { ...otherProps };
    
    // For highlight mode, modify the chart props to highlight selected items
    if (filterDisplayMode === 'highlight' && selectedValues.size > 0) {
      props.getBarColor = (item, index) => {
        return selectedValues.has(item[xField]) 
          ? props.color || 'rgb(189, 135, 143)' // Full color for selected
          : 'rgba(189, 135, 143, 0.3)'; // Subdued color for unselected
      };
    }
    
    return props;
  }, [otherProps, filterDisplayMode, selectedValues, xField]);
  
  return (
    <div className="w-full h-full flex flex-col">
      
      {/* Bar Chart Table Component */}
      <BarChartTableComponent
        ref={chartTableRef}
        data={filteredData}
        xField={xField}
        yField={yField}
        title={title}
        columns={columns}
        onRowClick={handleRowSelect}
        highlightedIndex={highlightedIndex}
        enableSelection={true}
        {...enhancedProps}
      />
    </div>
  );
});

export default BarChartTableFilterComponent;

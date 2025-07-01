// src/components/common/DashboardCardComponent.jsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import MoreMenu from '../ChartTableComponent/MoreMenu';

/**
 * A container component that provides consistent styling and functionality for dashboard cards.
 * It handles loading states, error states, and provides export options.
 * 
 * @param {object} props - The component props
 * @param {string} props.id - Unique identifier for the card
 * @param {string} props.title - Title displayed at the top of the card
 * @param {React.ReactNode} props.children - The content to be rendered inside the card
 * @param {boolean} [props.isLoading=false] - Whether the card is in a loading state
 * @param {boolean} [props.isError=false] - Whether the card is in an error state
 * @param {string} [props.errorMessage] - Error message to display when isError is true
 * @param {object} [props.exportOptions] - Options for exporting data
 * @param {string|Function} [props.exportOptions.excel] - Filename for Excel export or custom export function
 * @param {string|Function} [props.exportOptions.image] - Filename for image export or custom export function
 * @param {string} [props.className] - Additional CSS classes to apply to the card
 * @returns {React.Component} The DashboardCardComponent
 */
export default function DashboardCardComponent({
  id,
  title,
  children,
  isLoading = false,
  isError = false,
  errorMessage = 'An error occurred while loading data.',
  exportOptions = {},
  className = '',
}) {
  // State for table visibility
  const [tableVisible, setTableVisible] = useState(true);
  // Handle Excel export
  const handleExportExcel = () => {
    if (typeof exportOptions.excel === 'function') {
      exportOptions.excel();
    } else if (exportOptions.excel && typeof children.props.data === 'object') {
      const data = children.props.data;
      if (Array.isArray(data) && data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, `${exportOptions.excel || title || 'data'}.xlsx`);
      }
    }
  };

  // Handle image export
  const handleExportImage = () => {
    if (typeof exportOptions.image === 'function') {
      exportOptions.image();
    } else if (exportOptions.image && children?.ref?.current?.getChartRef) {
      // Get the chart ref from the child component
      const chartRef = children.ref.current.getChartRef();
      if (chartRef) {
        // Use Plotly's toImage function
        import('plotly.js-dist-min').then((Plotly) => {
          Plotly.toImage(chartRef, { format: 'png', height: 600, width: 900 })
            .then(url => {
              const a = document.createElement('a');
              a.href = url;
              a.download = `${exportOptions.image || title || 'chart'}.png`;
              a.click();
            });
        });
      }
    }
  };

  return (
    <div 
      id={id}
      className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 relative flex flex-col ${className}`}
    >
      {/* MoreMenu Component */}
      <MoreMenu
        id={`more-menu-${id}`}
        chartType="bar"
        setChartType={() => {}}
        onExportCsv={handleExportExcel}
        onExportPng={handleExportImage}
        showChartTypeSwitcher={false}
        tableVisible={tableVisible}
        onToggleTable={() => {
          setTableVisible(!tableVisible);
          if (children?.ref?.current?.toggleTable) {
            children.ref.current.toggleTable();
          }
        }}
        showTableToggle={true}
      />
      
      {/* Card Content */}
      <div className="flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="mt-2 text-center">{errorMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

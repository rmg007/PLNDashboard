// src/components/ChartTableComponent/Toolbar.jsx

import React, { useId } from 'react';
import { FiBarChart } from "react-icons/fi";
import { RiLineChartLine } from "react-icons/ri";
import { TbTableDown } from "react-icons/tb";
import { GoDownload } from "react-icons/go";
import { TbTableOff } from "react-icons/tb";
import { GrTable } from "react-icons/gr";
import Tooltip from '../common/Tooltip';

export default function Toolbar({ chartType, setChartType, onExportCsv, onExportPng, showChartTypeSwitcher = true, tableVisible = true, onToggleTable, showTableToggle = true }) {
    // Generate unique IDs for buttons
    const id = useId();
    const barChartId = `btnBarChart-${id}`;
    const lineChartId = `btnLineChart-${id}`;
    const toggleTableId = `btnToggleTable-${id}`;
    const exportCsvId = `btnExportCsv-${id}`;
    const exportPngId = `btnExportPng-${id}`;

    return (
        <div className="flex items-center justify-end mb-4">
            {/* All buttons grouped on the right side */}
            <div className="flex items-center gap-2">
                {/* Chart Type Switcher - only shown if showChartTypeSwitcher is true */}
                {showChartTypeSwitcher && (
                    <div className="p-1 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center">
                        <Tooltip text="Bar Chart">
                            {({ id }) => (
                                <button 
                                    id={barChartId}
                                    aria-label="Switch to bar chart"
                                    onClick={() => setChartType('bar')} 
                                    className={`p-2 text-sm rounded-md flex items-center justify-center ${chartType === 'bar' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}
                                >
                                    <FiBarChart className="text-lg" aria-hidden="true" />
                                </button>
                            )}
                        </Tooltip>
                        <Tooltip text="Line Chart">
                            {({ id }) => (
                                <button 
                                    id={lineChartId}
                                    aria-label="Switch to line chart"
                                    onClick={() => setChartType('line')} 
                                    className={`p-2 text-sm rounded-md flex items-center justify-center ${chartType === 'line' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}
                                >
                                    <RiLineChartLine className="text-lg" aria-hidden="true" />
                                </button>
                            )}
                        </Tooltip>
                    </div>
                )}
                
                {/* Table Toggle Button - only shown if showTableToggle is true */}
                {showTableToggle && (
                    <Tooltip text={tableVisible ? "Hide Table" : "Show Table"}>
                        {({ id }) => (
                            <button
                                id={toggleTableId}
                                aria-label={tableVisible ? "Hide table" : "Show table"}
                                onClick={onToggleTable}
                                className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                            >
                                {tableVisible ? (
                                    <TbTableOff className="text-lg" aria-hidden="true" />
                                ) : (
                                    <GrTable className="text-lg" aria-hidden="true" />
                                )}
                            </button>
                        )}
                    </Tooltip>
                )}
                
                {/* Export Buttons */}
                <Tooltip text="Export XLSX">
                    {({ id }) => (
                        <button 
                            id={exportCsvId}
                            aria-label="Export to XLSX"
                            onClick={onExportCsv}
                            className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                        >
                            <TbTableDown className="text-lg" aria-hidden="true" />
                        </button>
                    )}
                </Tooltip>
                <Tooltip text="Export PNG">
                    {({ id }) => (
                        <button 
                            id={exportPngId}
                            aria-label="Export to PNG"
                            onClick={onExportPng}
                            className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                        >
                            <GoDownload className="text-lg" aria-hidden="true" />
                        </button>
                    )}
                </Tooltip>
            </div>
        </div>
    );
}

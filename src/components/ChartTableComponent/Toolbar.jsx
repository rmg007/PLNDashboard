// src/components/ChartTableComponent/Toolbar.jsx

import React from 'react';
import { FiBarChart } from "react-icons/fi";
import { RiLineChartLine } from "react-icons/ri";
import { TbTableDown } from "react-icons/tb";
import { GoDownload } from "react-icons/go";
import { TbTableOff } from "react-icons/tb";
import { GrTable } from "react-icons/gr";

export default function Toolbar({ chartType, setChartType, onExportCsv, onExportPng, showChartTypeSwitcher = true, tableVisible = true, onToggleTable, showTableToggle = true }) {
    return (
        <div className="flex items-center justify-end mb-4">
            {/* All buttons grouped on the right side */}
            <div className="flex items-center gap-2">
                {/* Chart Type Switcher - only shown if showChartTypeSwitcher is true */}
                {showChartTypeSwitcher && (
                    <div className="p-1 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center">
                        <button id='btnBarChart' 
                            onClick={() => setChartType('bar')} 
                            data-tooltip-target="tooltip-bar-chart"
                            className={`p-2 text-sm rounded-md flex items-center justify-center ${chartType === 'bar' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}
                        >
                            <FiBarChart className="text-lg" />
                            <span id="tooltip-bar-chart" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                                Bar Chart
                                <div className="tooltip-arrow" data-popper-arrow></div>
                            </span>
                        </button>
                        <button id='btnLineChart'   
                            onClick={() => setChartType('line')} 
                            data-tooltip-target="tooltip-line-chart"
                            className={`p-2 text-sm rounded-md flex items-center justify-center ${chartType === 'line' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}
                        >
                            <RiLineChartLine className="text-lg" />
                            <span id="tooltip-line-chart" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                                Line Chart
                                <div className="tooltip-arrow" data-popper-arrow></div>
                            </span>
                        </button>
                    </div>
                )}
                
                {/* Table Toggle Button - only shown if showTableToggle is true */}
                {showTableToggle && (
                    <button
                        onClick={onToggleTable}
                        data-tooltip-target="tooltip-toggle-table"
                        className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                    >
                        {tableVisible ? <TbTableOff className="text-lg" /> : <GrTable className="text-lg" />}
                        <span id="tooltip-toggle-table" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                            {tableVisible ? "Hide Table" : "Show Table"}
                            <div className="tooltip-arrow" data-popper-arrow></div>
                        </span>
                    </button>
                )}
                
                {/* Export Buttons */}
                <button id='btnExportCsv'
                    onClick={onExportCsv}
                    data-tooltip-target="tooltip-export-xlsx"
                    className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                >
                    <TbTableDown className="text-lg" />
                    <span id="tooltip-export-xlsx" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                        Export XLSX
                        <div className="tooltip-arrow" data-popper-arrow></div>
                    </span>
                </button>
                <button id='btnExportPng'
                    onClick={onExportPng}
                    data-tooltip-target="tooltip-export-png"
                    className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                >
                    <GoDownload className="text-lg" />
                    <span id="tooltip-export-png" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                        Export PNG
                        <div className="tooltip-arrow" data-popper-arrow></div>
                    </span>
                </button>
            </div>
        </div>
    );
}

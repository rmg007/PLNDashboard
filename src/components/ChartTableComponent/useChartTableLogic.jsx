// src/hooks/useChartTableLogic.jsx

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useDraggableSplitter } from './useDraggableSplitter.js';
import Plotly from 'plotly.js-dist-min';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';

export function useChartTableLogic({
    data,
    columns,
    initialTraces,
    xAccessor,
    yAccessor,
    splitterOrientation,
    initialSplitPos,
    chartType: propChartType,
    chartTitle,
    yAxisTitle,
    baseBarColor,
}) {
    const [chartType, setChartType] = useState(propChartType || 'bar');
    const [sorting, setSorting] = useState([]);
    const chartRef = useRef(null);
    const containerRef = useRef(null);

    const { splitPos, isDragging, handleMouseDown } = useDraggableSplitter(
        containerRef,
        initialSplitPos,
        splitterOrientation,
    );

    const table = useReactTable({
        data: data || [],
        columns: columns || [],
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const chartTraces = useMemo(() => {
        // If pre-configured traces are provided (like for grouped charts), use them.
        if (initialTraces) {
            // ONLY transform them if the chart type is switched to 'line'.
            if (chartType === 'line') {
                return initialTraces.map(trace => ({
                    ...trace,
                    type: 'scatter', // In Plotly, 'line' is a mode of 'scatter'
                    mode: 'lines+markers',
                }));
            }
            // IMPORTANT: If the chart type is 'bar', return the traces exactly as they were provided.
            return initialTraces;
        }

        // Fallback for simple charts without pre-configured traces.
        if (!data || !xAccessor || !yAccessor) return [];

        const sortedData = table.getRowModel().rows.map(row => row.original);
        return [{
            x: sortedData.map(d => d[xAccessor]),
            y: sortedData.map(d => d[yAccessor]),
            type: chartType,
            mode: chartType === 'line' ? 'lines+markers' : undefined,
            name: yAxisTitle || 'Data',
            marker: { color: baseBarColor || '#3498db' },
        }];
    }, [initialTraces, chartType, data, xAccessor, yAccessor, table, sorting, yAxisTitle, baseBarColor]);

    const handleExportCsv = useCallback(() => {
        const rows = table.getCoreRowModel().rows.map(row => row.original);
        if (rows.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
            XLSX.writeFile(workbook, `${chartTitle || 'data'}.xlsx`);
        }
    }, [table, chartTitle]);

    const handleExportPng = useCallback(() => {
        if (chartRef.current) {
            Plotly.toImage(chartRef.current, { format: 'png', height: 600, width: 900 })
                .then(url => {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${chartTitle || 'chart'}.png`;
                    a.click();
                });
        }
    }, [chartRef, chartTitle]);
    
    const refreshChart = useCallback(() => {}, []);

    return {
        chartType, setChartType, table, chartTraces, chartRef,
        handleExportCsv, handleExportPng, refreshChart,
        containerRef, splitPos, isDragging, handleMouseDown,
    };
}
// src/components/ChartTableComponent/Table.jsx

import React, { useCallback, useRef } from 'react';
import { useIsDark } from '../../contexts/ThemeContext';
import { flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import TablePagination from './TablePagination';

const ROW_HEIGHT = 53; // Approximate height of a table row in pixels

export default function Table({ 
    table, 
    highlightedIndex, 
    onRowHover, 
    onRowLeave,
    selectedIndices = [],
    onRowSelect,
    onSort,
    showPagination = false
}) {
    const tableContainerRef = useRef(null);
    const rows = table.getRowModel().rows;
    const isDark = useIsDark();
    
    // Virtualization setup
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: useCallback(() => ROW_HEIGHT, []),
        overscan: 10,
    });

    // Calculate the total height of the table body
    const totalHeight = rowVirtualizer.getTotalSize();
    const virtualRows = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
    const paddingBottom = virtualRows.length > 0 
        ? totalHeight - (virtualRows?.[virtualRows.length - 1]?.end || 0)
        : 0;

    // Handle scroll events to trigger virtualization
    const handleScroll = useCallback(() => {
        rowVirtualizer.measure();
    }, [rowVirtualizer]);

    // Handle header click for sorting
    const handleHeaderClick = useCallback((header, e) => {
        const sortHandler = header.column.getToggleSortingHandler();
        if (sortHandler) {
            sortHandler(e);
        }
        if (onSort) {
            onSort();
        }
    }, [onSort]);

    // Handle keyboard events for sortable headers
    const handleHeaderKeyDown = useCallback((header, e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick(header, e);
        }
    }, [handleHeaderClick]);

    // Handle row click
    const handleRowClick = useCallback((rowIndex, e) => {
        if (onRowSelect) {
            onRowSelect(rowIndex);
        }
    }, [onRowSelect]);

    // Handle keyboard events for rows
    const handleRowKeyDown = useCallback((rowIndex, e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onRowSelect) {
            e.preventDefault();
            onRowSelect(rowIndex);
        }
    }, [onRowSelect]);

    return (
        <div className="flex flex-col h-full">
            <div 
                ref={tableContainerRef}
                className={`overflow-auto h-[450px] relative scrollbar-thin ${
                    isDark ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800' : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'
                }`}
                onScroll={handleScroll}
                role="table"
                aria-label="Data table"
                aria-rowcount={rows.length}
                aria-colcount={table.getAllColumns().length}
            >
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={`px-6 py-3 text-left text-xs font-medium ${
                                            isDark ? 'text-gray-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div 
                                                className={`flex items-center ${
                                                    header.column.getCanSort() 
                                                        ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-100' 
                                                        : ''
                                                } transition-colors`}
                                                role={header.column.getCanSort() ? 'button' : 'none'}
                                                tabIndex={header.column.getCanSort() ? 0 : -1}
                                                onClick={header.column.getCanSort() ? (e) => handleHeaderClick(header, e) : undefined}
                                                onKeyDown={header.column.getCanSort() ? (e) => handleHeaderKeyDown(header, e) : undefined}
                                                aria-sort={
                                                    header.column.getIsSorted()
                                                        ? header.column.getIsSorted() === 'desc'
                                                            ? 'descending'
                                                            : 'ascending'
                                                        : 'none'
                                                }
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                <span className="ml-1" aria-hidden="true">
                                                    {{ asc: '↑', desc: '↓' }[header.column.getIsSorted()] || '↕'}
                                                </span>
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {paddingTop > 0 && (
                            <tr aria-hidden="true">
                                <td style={{ height: `${paddingTop}px` }} colSpan={table.getAllColumns().length} />
                            </tr>
                        )}
                        {virtualRows.map(virtualRow => {
                            const row = rows[virtualRow.index];
                            const isHighlighted = highlightedIndex === virtualRow.index;
                            const isSelected = Array.isArray(selectedIndices) && selectedIndices.includes(virtualRow.index);
                            
                            return (
                                <tr 
                                    key={row.id}
                                    data-index={virtualRow.index}
                                    className={`${
                                        isHighlighted 
                                            ? 'bg-blue-50 dark:bg-blue-900/30' 
                                            : isSelected 
                                                ? 'bg-blue-100 dark:bg-blue-900/50' 
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    } transition-colors cursor-pointer`}
                                    onClick={(e) => handleRowClick(virtualRow.index, e)}
                                    onKeyDown={(e) => handleRowKeyDown(virtualRow.index, e)}
                                    onMouseEnter={() => onRowHover?.(virtualRow.index)}
                                    onMouseLeave={onRowLeave}
                                    role="row"
                                    aria-selected={isSelected}
                                    aria-rowindex={virtualRow.index + 1}
                                    tabIndex={0}
                                >
                                    {row.getVisibleCells().map((cell, cellIndex) => {
                                        const isFirstCell = cellIndex === 0;
                                        return (
                                            <td 
                                                key={cell.id}
                                                className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isFirstCell 
                                                        ? 'font-medium text-gray-900 dark:text-gray-100' 
                                                        : 'text-gray-700 dark:text-gray-300'
                                                }`}
                                                style={{
                                                    width: cell.column.getSize(),
                                                    minWidth: cell.column.columnDef.minSize,
                                                    maxWidth: cell.column.columnDef.maxSize,
                                                }}
                                                role="gridcell"
                                                aria-colindex={cellIndex + 1}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                        {paddingBottom > 0 && (
                            <tr aria-hidden="true">
                                <td style={{ height: `${paddingBottom}px` }} colSpan={table.getAllColumns().length} />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showPagination && <TablePagination table={table} />}
        </div>
    );
}
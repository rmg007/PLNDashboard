// src/components/ChartTableComponent/Table.jsx

import React from 'react';
import { flexRender } from '@tanstack/react-table';
import TablePagination from './TablePagination';

export default function Table({ 
    table, 
    highlightedIndex, 
    onRowHover, 
    onRowLeave,
    selectedIndices = [],
    onRowSelect,
    onSort, // New prop for handling sort events
    showPagination = false // New prop to control pagination visibility
}) {
    console.log('Table component - table:', table);
    console.log('Table component - rows:', table?.getRowModel()?.rows);
    console.log('Table component - headers:', table?.getHeaderGroups());
    return (
        <div className="flex flex-col h-full">
            <div className="overflow-auto h-[450px]">
                <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} scope="col" className="p-3">
                                        <div 
                                            onClick={(e) => {
                                                // Get the original handler
                                                const originalHandler = header.column.getToggleSortingHandler();
                                                // Call it to toggle sorting with the event
                                                if (originalHandler) {
                                                    originalHandler(e);
                                                }
                                                // Then call our custom onSort handler if provided
                                                if (onSort) {
                                                    onSort();
                                                }
                                            }} 
                                            className="cursor-pointer select-none"
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted()] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row, index) => (
                            <tr 
                                key={row.id} 
                                className={`border-b dark:border-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors duration-200 cursor-pointer
                                    ${highlightedIndex === index ? '!bg-emerald-200 dark:!bg-emerald-700/70 font-medium' : ''}
                                    ${Array.isArray(selectedIndices) && selectedIndices.includes(index) ? '!bg-emerald-300 dark:!bg-emerald-600/60' : ''}
                                `}
                                onMouseEnter={() => onRowHover && onRowHover(index)}
                                onMouseLeave={() => onRowLeave && onRowLeave()}
                                onClick={() => onRowSelect && onRowSelect(index, false)}
                                onDoubleClick={() => onRowSelect && onRowSelect(index, true)}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className={`p-3 ${cell.column.columnDef.meta?.className}`}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showPagination && <TablePagination table={table} />}
        </div>
    );
}
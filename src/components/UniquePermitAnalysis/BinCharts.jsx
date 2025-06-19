import React, { useMemo } from 'react';
import ChartTableComponent from '../ChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

// BinCharts component to handle individual bin charts
export default function BinCharts({ valuationTableData, filteredValuationData, columns, isValuationLoading, pastelPalette }) {
    // Create custom columns for bin charts (without Monthly Avg. column)
    const binColumns = useMemo(() => [
        columnHelper.accessor('FiscalYear', {
            header: 'Fiscal Yr.',
            cell: info => info.getValue(),
            enableSorting: true,
            meta: {
                className: 'text-center' 
            }
        }),
        columnHelper.accessor('PermitCount', {
            header: 'Permits Vol.',
            cell: info => info.getValue().toLocaleString(),
            enableSorting: true,
            meta: {
                className: 'text-center'
            }
        }),
    ], []);
    // Create bin-specific data for each chart
    const binChartsData = useMemo(() => {
        if (!valuationTableData || valuationTableData.length === 0 || filteredValuationData.length === 0) {
            return [];
        }
        
        // Get unique permit ranges (bins) from the data
        const permitRanges = [...valuationTableData].map(item => item.permit_range);
        
        // Create data for each bin
        return permitRanges.map(permitRange => {
            // Filter data for this specific bin
            const binData = filteredValuationData.filter(item => item.permit_range === permitRange);
            
            // Transform to format needed for ChartTableComponent
            const chartData = binData.map(item => ({
                FiscalYear: item.year,
                PermitCount: item.count,
                AveragePermitsPerMonth: item.count / 12
            }));
            
            return {
                permitRange,
                chartData
            };
        });
    }, [valuationTableData, filteredValuationData]);
    
    // If no data, don't render anything
    if (binChartsData.length === 0) return null;
    
    // Render charts in reverse order (last bin first)
    return (
        <>
            {[...binChartsData].reverse().map((bin, index) => {
                // Create bin-specific chart title
                const binChartTitle = `Permit Volume for Valuation Range: ${bin.permitRange}`;
                
                // Use a different color from the pastelPalette for each bin chart
                const binColor = pastelPalette[index % pastelPalette.length];
                
                return (
                    <div key={`bin-chart-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-8">
                        <ChartTableComponent 
                            id={`chartValuationBin-${bin.permitRange}`}
                            data={bin.chartData}
                            columns={binColumns}
                            isLoading={isValuationLoading}
                            chartTitle={binChartTitle}
                            xAxisTitle="Fiscal Year"
                            yAxisTitle="Permit Count"
                            xAccessor="FiscalYear"
                            yAccessor="PermitCount"
                            chartType="bar"
                            baseBarColor={binColor}
                            showTrendLine={true}
                            excelFileName={`ValuationBin-${bin.permitRange}.xlsx`}
                            chartFileName={`ValuationBin-${bin.permitRange}.png`}
                            initialTableWidth={320}
                            showTablePanel={true}
                            tableHeaderClassName="text-center"
                            showBarLabels={true}
                            barLabelPosition="inside"
                            barLabelInsideAnchor="middle"
                            barLabelFontSize={12}
                            barLabelFontColor="white"
                            barLabelFormat={value => value.toLocaleString()}
                            dataLabelsOnLine={true}
                            dataLabelsFontSize={12}
                            chartLayout={{
                                legend: {
                                    orientation: 'h',
                                    y: -0.2
                                }
                            }}
                        />
                    </div>
                );
            })}
        </>
    );
}

import React, { useMemo, useRef } from 'react';
import BarChartTableComponent from '../charts/BarChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table';
import DashboardCardComponent from '../common/DashboardCardComponent';

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
                // Create a slug from the permit range for use in IDs
                const slug = bin.permitRange.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

                // Create bin-specific chart title
                const binChartTitle = `Permit Volume for Valuation Range: ${bin.permitRange}`;
                
                // Use a different color from the pastelPalette for each bin chart
                const binColor = pastelPalette[index % pastelPalette.length];
                
                return (
                    <DashboardCardComponent
                        key={`bin-chart-${index}`}
                        id={`bin-chart-container-${slug}`}
                        title={binChartTitle}
                        isLoading={isValuationLoading}
                        exportOptions={{
                            excel: `ValuationBin-${bin.permitRange}.xlsx`,
                            image: `ValuationBin-${bin.permitRange}.png`
                        }}
                        className="mt-8"
                    >
                        <BarChartTableComponent
                            id={`chart-valuation-bin-${slug}`}
                            data={bin.chartData}
                            columns={binColumns}
                            isLoading={isValuationLoading}
                            chartTitle={binChartTitle}
                            xField="FiscalYear"
                            yField="PermitCount"
                            defaultSorting={[
                                { id: 'FiscalYear', desc: true }
                            ]}
                            chartConfig={{
                                yaxis: {
                                    title: "Count"
                                },
                                showlegend: false,
                                colorway: [binColor],
                                legend: {
                                    orientation: 'h',
                                    yanchor: 'top',
                                    y: -0.2,
                                    xanchor: 'center',
                                    x: 0.5
                                },
                                traces: [{
                                    texttemplate: '%{y}',
                                    textposition: 'inside',
                                    insidetextanchor: 'middle',
                                    textfont: {
                                        color: 'white',
                                        size: 12
                                    }
                                }]
                            }}
                            initialState={{
                                pagination: {
                                    pageSize: 10
                                },
                                columnSizing: {
                                    FiscalYear: 100,
                                    PermitCount: 120
                                }
                            }}
                        />
                    </DashboardCardComponent>
                );
            })}
        </>
    );
}

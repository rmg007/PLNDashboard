import React, { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import LineChartTableComponent from '../charts/LineChartTableComponent';
import LineChartComponent from '../charts/LineChartComponent';
import DashboardCardComponent from '../common/DashboardCardComponent';

const columnHelper = createColumnHelper();

// Custom RGB Palette
const customPalette = [
    'rgb(220, 88, 42)', 'rgb(255, 159, 64)', 'rgb(153, 102, 51)', 
    'rgb(134, 100, 36)', 'rgb(210, 105, 30)', 'rgb(204, 121, 167)', 
    'rgb(240, 128, 128)', 'rgb(255, 205, 86)', 'rgb(201, 203, 207)', 
    'rgb(75, 192, 192)', 'rgb(0, 114, 178)', 'rgb(86, 180, 233)'
];

export default function QuarterlyUniquePermitsReport({ data, isLoading }) {

    // --- Column Definitions for the table ---
    const singleQuarterTrendColumns = useMemo(() => [
        columnHelper.accessor('fiscal_year', { header: 'Fiscal Year', meta: { className: 'text-center' } }),
        columnHelper.accessor('permit_count', { header: 'Permit Count', cell: info => info.getValue().toLocaleString(), meta: { className: 'text-center' } }),
    ], []);

    // Pivot data for table display - fiscal year as rows, quarters as columns
    const { pivotedData, pivotedColumns } = useMemo(() => {
        if (!data || data.length === 0) {
            return { pivotedData: [], pivotedColumns: [] };
        }

        // Create a map to organize data by fiscal year
        const pivoted = data.reduce((acc, { fiscal_year, quarter, permit_count }) => {
            if (!acc[fiscal_year]) {
                acc[fiscal_year] = { 'Year': fiscal_year, 'Q1 Vol': 0, 'Q2 Vol': 0, 'Q3 Vol': 0, 'Q4 Vol': 0 };
            }
            // Map quarter number to column name
            const quarterColumnMap = {
                1: 'Q1 Vol',
                2: 'Q2 Vol',
                3: 'Q3 Vol',
                4: 'Q4 Vol'
            };
            acc[fiscal_year][quarterColumnMap[quarter]] = permit_count;
            return acc;
        }, {});

        // Convert to array and sort by year (descending to match the image)
        const pivotedData = Object.values(pivoted).sort((a, b) => b.Year - a.Year);

        // Create columns for the table
        const pivotedColumns = [
            columnHelper.accessor('Year', { 
                header: 'Year',
                cell: info => info.getValue(),
                meta: { className: 'text-center' }
            }),
            columnHelper.accessor('Q1 Vol', { 
                header: 'Q1 Vol',
                cell: info => info.getValue().toLocaleString(),
                meta: { className: 'text-center' }
            }),
            columnHelper.accessor('Q2 Vol', { 
                header: 'Q2 Vol',
                cell: info => info.getValue().toLocaleString(),
                meta: { className: 'text-center' }
            }),
            columnHelper.accessor('Q3 Vol', { 
                header: 'Q3 Vol',
                cell: info => info.getValue().toLocaleString(),
                meta: { className: 'text-center' }
            }),
            columnHelper.accessor('Q4 Vol', { 
                header: 'Q4 Vol',
                cell: info => info.getValue().toLocaleString(),
                meta: { className: 'text-center' }
            })
        ];

        return { pivotedData, pivotedColumns };
    }, [data]);

    return (
        <div id="quarterly-unique-permits-report" className="space-y-8">
            {/* Main Quarterly Trend Chart */}
            <DashboardCardComponent
                id="quarterly-trend-report"
                title="Quarterly Trend of Unique Permits"
                isLoading={isLoading}
                exportOptions={{
                    excel: "Quarterly-Trend-Report.xlsx",
                    image: "Quarterly-Trend-Report.png"
                }}
            >
                <LineChartTableComponent
                    id="chart-quarterly-trend"
                    data={data.sort((a, b) => {
                        if (a.fiscal_year === b.fiscal_year) {
                            return a.quarter - b.quarter;
                        }
                        return a.fiscal_year - b.fiscal_year;
                    })}
                    tableData={pivotedData}
                    xField={item => `${item.fiscal_year}-Q${item.quarter}`}
                    yField="permit_count"
                    chartTitle="Quarterly Trend of Unique Permits"
                    columns={pivotedColumns}
                    tablePosition="bottom"
                    title="Quarterly Trend of Unique Permits"
                    showTable={true}
                    defaultRowsPerPage={10}
                    enableSelection={false}
                    enableSorting={false}
                    height={400}
                    lineColor={customPalette[0]}
                    markerSize={8}
                    lineStyle="solid"
                    chartConfig={{
                        yaxis: {
                            title: "Unique Permits"
                        },
                        xaxis: {
                            title: "",
                            tickangle: -45
                        },
                        showlegend: false,
                        colorway: [customPalette[0]]
                    }}
                    initialState={{
                        pagination: {
                            pageSize: 10
                        }
                    }}
                />
            </DashboardCardComponent>

            {/* Quarterly Breakdown Section */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 pt-4 border-t border-gray-200 dark:border-gray-700">
                Quarterly Breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((quarter) => {
                    const quarterData = data.filter(item => item.quarter === quarter);
                    
                    return (
                        <DashboardCardComponent
                            key={`q${quarter}-container`}
                            id={`q${quarter}-report`}
                            title={`Q${quarter} Permit Volume`}
                            isLoading={isLoading}
                            exportOptions={{
                                excel: `Q${quarter}-Permit-Volume.xlsx`,
                                image: `Q${quarter}-Permit-Volume.png`
                            }}
                        >
                            <LineChartComponent
                                id={`chart-q${quarter}-trend`}
                                data={quarterData.sort((a, b) => a.fiscal_year - b.fiscal_year)}
                                xField="fiscal_year"
                                yField="permit_count"
                                title={`Q${quarter} Permit Volume`}
                                xAxisLabel="Fiscal Year"
                                yAxisLabel="Permit Count"
                                lineColor={customPalette[quarter - 1]}
                                markerSize={6}
                                lineStyle="solid"
                                height={300}
                                showArea={false}
                            />
                        </DashboardCardComponent>
                    );
                })}
            </div>
        </div>
    );
}

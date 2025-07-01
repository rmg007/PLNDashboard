import React, { useMemo, useEffect, useState, useRef } from 'react';
import BarChartTableComponent from '../charts/BarChartTableComponent';
import GroupedBarChartTableComponent from '../charts/GroupedBarChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table';
import DashboardCardComponent from '../common/DashboardCardComponent';
import { permitAPI } from '../../services/api';

const columnHelper = createColumnHelper();

const columns = [
    columnHelper.accessor('fiscal_year', {
        header: 'Fiscal Yr.',
        cell: info => info.getValue(),
        enableSorting: true,
        meta: {
            className: 'text-center' 
        }
    }),
    columnHelper.accessor('permit_count', {
        header: 'Permits Vol.',
        cell: info => {
            const value = info.getValue();
            return value !== undefined && value !== null ? value.toLocaleString() : '';
        },
        enableSorting: true,
        meta: {
            className: 'text-center'
        }
    }),
];

export default function AnnualUniquePermitsReport({ data, isLoading, selectedItemsCount }) {
    const pastelPalette = [
        'rgb(189, 135, 143)', 'rgb(5, 80, 105)', 'rgb(9, 107, 9)',
        'rgb(126, 126, 7)', 'rgb(172, 124, 172)', 'rgb(173, 166, 99)',
        'rgb(155, 180, 180)', 'rgb(167, 147, 145)', 'rgb(163, 175, 163)',
        'rgb(184, 169, 174)', 'rgb(110, 110, 5)', 'rgb(230, 230, 250)'
    ]; // Pastel Theme
    
    const [valuationData, setValuationData] = useState([]);
    const [filteredValuationData, setFilteredValuationData] = useState([]);
    const [isValuationLoading, setIsValuationLoading] = useState(true);
    
    // Fetch the valuation data
    useEffect(() => {
        setIsValuationLoading(true);
        permitAPI.getYearlyBins()
            .then(data => {
                setValuationData(data);
                setIsValuationLoading(false);
            })
            .catch(error => {
                console.error('Error loading valuation data:', error);
                setIsValuationLoading(false);
            });
    }, []);
    
    // Filter valuation data based on selected years in the main data
    useEffect(() => {
        if (valuationData.length === 0 || data.length === 0) return;
        
        // Get the years from the filtered data
        const selectedYears = data.map(item => item.fiscal_year);
        
        // Filter the valuation data to only include those years
        const filtered = valuationData.filter(item => selectedYears.includes(item.year));
        setFilteredValuationData(filtered);
    }, [valuationData, data]);

    const processedData = useMemo(() => {
        return data;
    }, [data]);

    // Create columns for the valuation thresholds table
    const valuationColumns = useMemo(() => [
        columnHelper.accessor('bin_range', {
            header: 'Valuation Range',
            cell: info => info.getValue(),
            enableSorting: true,
            meta: {
                className: 'text-center'
            }
        }),
        ...Array.from(new Set(filteredValuationData.map(item => item.year)))
            .sort((a, b) => a - b)
            .map(year => columnHelper.accessor(
                row => {
                    const item = filteredValuationData.find(d => d.bin_range === row.bin_range && d.year === year);
                    return item ? item.permit_count : 0;
                },
                {
                    id: `year_${year}`,
                    header: year.toString(),
                    cell: info => {
                        const value = info.getValue();
                        return value !== undefined && value !== null ? value.toLocaleString() : '';
                    },
                    enableSorting: true,
                    meta: { className: 'text-center' }
                }
            ))
    ], [filteredValuationData]);

    // Process the valuation data for the table
    const valuationTableData = useMemo(() => {
        if (filteredValuationData.length === 0) return [];
        
        // Get unique permit ranges
        const permitRanges = [...new Set(filteredValuationData.map(item => item.bin_range))];
        
        // Get unique years
        const years = [...new Set(filteredValuationData.map(item => item.year))].sort((a, b) => a - b);
        
        // Create a row for each permit range with year data included
        return permitRanges.map(range => {
            // Start with the permit range
            const row = { bin_range: range };
            
            // Add data for each year
            years.forEach(year => {
                const item = filteredValuationData.find(d => d.bin_range === range && d.year === year);
                row[`year_${year}`] = item ? item.permit_count : 0;
            });
            
            return row;
        });
    }, [filteredValuationData]);

    return (
        <div id="annual-unique-permits-report" className="annual-analysis-section h-full flex flex-col space-y-8">
            <DashboardCardComponent
                id="annual-permit-volume-section"
                title="Annual Permit Volume"
                isLoading={isLoading}
                exportOptions={{
                    excel: "AnnualPermitReport.xlsx",
                    image: "AnnualPermitReport.png"
                }}
            >
                <BarChartTableComponent
                    key={`annual-permits-${JSON.stringify(processedData)}`}
                    id='chartAnnualUniquePermitsReport'
                    data={processedData}
                    columns={columns}
                    isLoading={isLoading}
                    title="Annual Permit Volume for All Years"
                    xField="fiscal_year"
                    yField="permit_count"
                    defaultSorting={[
                        { id: 'fiscal_year', desc: true }
                    ]}
                    chartConfig={{
                        yaxis: {
                            title: "Unique Permits"
                        },
                        showlegend: false,
                        colorway: [pastelPalette[0]],
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
                            fiscal_year: 100,
                            permit_count: 120
                        }
                    }}
                />
            </DashboardCardComponent>
            
            <DashboardCardComponent
                id="valuation-thresholds-container"
                title="Valuation Thresholds for Permits"
                isLoading={isValuationLoading}
                exportOptions={{
                    excel: "ValuationThresholdReport.xlsx",
                    image: "ValuationThresholdReport.png"
                }}
                className="min-h-[700px]"
            >
                <GroupedBarChartTableComponent
                    key={`valuation-thresholds-${JSON.stringify(valuationTableData)}`}
                    id='chartValuationThresholds'
                    data={valuationTableData}
                    columns={valuationColumns}
                    isLoading={isValuationLoading}
                    title="Valuation Thresholds for Permits"
                    xField="bin_range"
                    yFields={Array.from(new Set(filteredValuationData.map(item => item.year)))
                        .sort((a, b) => a - b)
                        .map(year => `year_${year}`)}
                    yLabels={Array.from(new Set(filteredValuationData.map(item => item.year)))
                        .sort((a, b) => a - b)
                        .map(year => year.toString())}
                    defaultRowsPerPage={20}
                    defaultSorting={[
                        { id: 'bin_range', desc: false }
                    ]}
                    chartConfig={{
                        yaxis: {
                            title: "Number of Permits"
                        },
                        barmode: 'group',
                        colorway: pastelPalette,
                        traces: yFields => yFields.map(() => ({
                            textposition: 'outside',
                            textfont: { color: '#333', size: 10 },
                            texttemplate: '%{y}'
                        }))
                    }}
                    initialState={{
                        pagination: {
                            pageSize: 20
                        },
                        columnSizing: {
                            bin_range: 150
                        }
                    }}
                    excelSheetName="Valuation Thresholds"
                    tableHeaderClassName="text-center"
                    showTable={true}
                    tablePosition="bottom"
                />
            </DashboardCardComponent>
            
            {/* Individual Charts for Each Valuation Bin */}
            {/* 0-10K Range Chart */}
            <DashboardCardComponent
                id="bin-chart-container-0-10k"
                title="Permit Volume for Valuation Range: 0-10K"
                isLoading={isValuationLoading}
                exportOptions={{
                    excel: "ValuationBin-0-10K.xlsx",
                    image: "ValuationBin-0-10K.png"
                }}
                className="mt-8"
            >
                <BarChartTableComponent
                    id="chart-valuation-bin-0-10k"
                    data={filteredValuationData
                        .filter(item => item.bin_range === "0-10K")
                        .map(item => ({
                            fiscal_year: item.year,
                            permit_count: item.permit_count,
                        }))}
                    columns={columns}
                    isLoading={isValuationLoading}
                    title="Permit Volume for Valuation Range: 0-10K"
                    xField="fiscal_year"
                    yField="permit_count"
                    color={pastelPalette[1]}
                    defaultSorting={[
                        { id: 'fiscal_year', desc: true }
                    ]}
                    chartConfig={{
                        yaxis: {
                            title: "Count"
                        },
                        showlegend: false,
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
                            fiscal_year: 100,
                            permit_count: 120
                        }
                    }}
                />
            </DashboardCardComponent>

            {/* 10K-100K Range Chart */}
            <DashboardCardComponent
                id="bin-chart-container-10k-100k"
                title="Permit Volume for Valuation Range: 10K-100K"
                isLoading={isValuationLoading}
                exportOptions={{
                    excel: "ValuationBin-10K-100K.xlsx",
                    image: "ValuationBin-10K-100K.png"
                }}
                className="mt-8"
            >
                <BarChartTableComponent
                    id="chart-valuation-bin-10k-100k"
                    data={filteredValuationData
                        .filter(item => item.bin_range === "10K-100K")
                        .map(item => ({
                            fiscal_year: item.year,
                            permit_count: item.permit_count,
                        }))}
                    columns={columns}
                    isLoading={isValuationLoading}
                    title="Permit Volume for Valuation Range: 10K-100K"
                    xField="fiscal_year"
                    yField="permit_count"
                    color={pastelPalette[2]}
                    defaultSorting={[
                        { id: 'fiscal_year', desc: true }
                    ]}
                    chartConfig={{
                        yaxis: {
                            title: "Count"
                        },
                        showlegend: false,
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
                            fiscal_year: 100,
                            permit_count: 120
                        }
                    }}
                />
            </DashboardCardComponent>

            {/* 100K-1M Range Chart */}
            <DashboardCardComponent
                id="bin-chart-container-100k-1m"
                title="Permit Volume for Valuation Range: 100K-1M"
                isLoading={isValuationLoading}
                exportOptions={{
                    excel: "ValuationBin-100K-1M.xlsx",
                    image: "ValuationBin-100K-1M.png"
                }}
                className="mt-8"
            >
                <BarChartTableComponent
                    id="chart-valuation-bin-100k-1m"
                    data={filteredValuationData
                        .filter(item => item.bin_range === "100K-1M")
                        .map(item => ({
                            fiscal_year: item.year,
                            permit_count: item.permit_count,
                        }))}
                    columns={columns}
                    isLoading={isValuationLoading}
                    title="Permit Volume for Valuation Range: 100K-1M"
                    xField="fiscal_year"
                    yField="permit_count"
                    color={pastelPalette[3]}
                    defaultSorting={[
                        { id: 'fiscal_year', desc: true }
                    ]}
                    chartConfig={{
                        yaxis: {
                            title: "Count"
                        },
                        showlegend: false,
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
                            fiscal_year: 100,
                            permit_count: 120
                        }
                    }}
                />
            </DashboardCardComponent>

            {/* 1M-10M Range Chart */}
            <DashboardCardComponent
                id="bin-chart-container-1m-10m"
                title="Permit Volume for Valuation Range: 1M-10M"
                isLoading={isValuationLoading}
                exportOptions={{
                    excel: "ValuationBin-1M-10M.xlsx",
                    image: "ValuationBin-1M-10M.png"
                }}
                className="mt-8"
            >
                <BarChartTableComponent
                    id="chart-valuation-bin-1m-10m"
                    data={filteredValuationData
                        .filter(item => item.bin_range === "1M-10M")
                        .map(item => ({
                            fiscal_year: item.year,
                            permit_count: item.permit_count,
                        }))}
                    columns={columns}
                    isLoading={isValuationLoading}
                    title="Permit Volume for Valuation Range: 1M-10M"
                    xField="fiscal_year"
                    yField="permit_count"
                    color={pastelPalette[4]}
                    defaultSorting={[
                        { id: 'fiscal_year', desc: true }
                    ]}
                    chartConfig={{
                        yaxis: {
                            title: "Count"
                        },
                        showlegend: false,
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
                            fiscal_year: 100,
                            permit_count: 120
                        }
                    }}
                />
            </DashboardCardComponent>
        </div>
    );
}

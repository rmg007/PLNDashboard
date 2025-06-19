import React, { useMemo, useEffect, useState } from 'react';
import ChartTableComponent from '../ChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table';
import BinCharts from './BinCharts';

const columnHelper = createColumnHelper();

const columns = [
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
    columnHelper.accessor('AveragePermitsPerMonth', {
        header: 'Monthly Avg.',
        cell: info => Math.round(info.getValue()).toLocaleString(),
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
    
    // Fetch the valuation data
    useEffect(() => {
        fetch('/data/UniquePermitsAnalysisData/UniquePermitYearlyBinsJson.json')
            .then(response => response.json())
            .then(data => {
                setValuationData(data);
            })
            .catch(error => console.error('Error loading valuation data:', error));
    }, []);
    
    // Filter valuation data based on selected years in the main data
    useEffect(() => {
        if (valuationData.length === 0 || data.length === 0) return;
        
        // Get the years from the filtered data
        const selectedYears = data.map(item => item.FiscalYear);
        
        // Filter the valuation data to only include those years
        const filtered = valuationData.filter(item => selectedYears.includes(item.year));
        setFilteredValuationData(filtered);
    }, [valuationData, data]);
    const chartTitle = useMemo(() => {
        if (selectedItemsCount === 0) {
            return 'Annual Permit Volume for All Years';
        }
        if (selectedItemsCount === 1) {
            return `Annual Permit Volume for Selected Year`;
        }
        return `Annual Permit Volume for ${selectedItemsCount} Selected Years`;
    }, [selectedItemsCount]);

    const processedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            AveragePermitsPerMonth: item.PermitCount / 12
        }));
    }, [data]);

    // Create columns for the valuation thresholds table
    const valuationColumns = useMemo(() => [
        columnHelper.accessor('permit_range', {
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
                    const item = filteredValuationData.find(d => d.permit_range === row.permit_range && d.year === year);
                    return item ? item.count : 0;
                },
                {
                    id: `year_${year}`,
                    header: year.toString(),
                    cell: info => info.getValue().toLocaleString(),
                    enableSorting: true,
                    meta: { className: 'text-center' }
                }
            ))
    ], [filteredValuationData]);

    // Process the valuation data for the table
    const valuationTableData = useMemo(() => {
        if (filteredValuationData.length === 0) return [];
        
        // Get unique permit ranges
        const permitRanges = [...new Set(filteredValuationData.map(item => item.permit_range))];
        
        // Create a row for each permit range
        return permitRanges.map(range => ({
            permit_range: range
        }));
    }, [filteredValuationData]);

    // const yearColors = useMemo(() => ({
    //     2016: '#D32F2F', // Ruby Red
    //     2017: '#F44336', // Ruby Red
    //     2018: '#7e22ce', // Purple
    //     2019: '#a855f7', // Lighter Purple
    //     2020: '#94a3b8', // Gray
    //     2021: '#0ea5e9', // Sky Blue
    //     2022: '#16a34a', // Green
    //     2023: '#65a30d', // Lime Green
    //     2024: '#9d174d', // Pink
    //     2025: '#1e40af'  // Navy Blue
    // }), []); // Replaced by pastelPalette for valuationTraces

    // Create traces for the valuation chart
    const valuationTraces = useMemo(() => {
        if (filteredValuationData.length === 0) return [];
        
        // Get unique years and permit ranges
        const years = [...new Set(filteredValuationData.map(item => item.year))].sort((a, b) => a - b);
        const permitRanges = [...new Set(filteredValuationData.map(item => item.permit_range))];
        
        // Create a trace for each year
        return years.map((year, index) => {
            // Filter data for this year
            const yearData = filteredValuationData.filter(item => item.year === year);
            
            // Create an array of counts for each permit range
            const counts = permitRanges.map(range => {
                const item = yearData.find(d => d.permit_range === range);
                return item ? item.count : 0;
            });
            
            return {
                x: permitRanges,
                y: counts,
                name: year.toString(),
                type: 'bar',
                marker: { color: pastelPalette[index % pastelPalette.length] },
                text: counts.map(val => val > 0 ? val.toLocaleString() : ''),
                textposition: 'outside',
                insidetextanchor: 'middle',
                textfont: {
                    color: '#333',
                    size: 12
                },
                hovertemplate: `<b>Year:</b> ${year}<br><b>Range:</b> %{x}<br><b>Volume:</b> %{y}<extra></extra>`
            };
        });
    }, [filteredValuationData, pastelPalette]);

    // Determine if valuation data is loading
    const isValuationLoading = useMemo(() => {
        return isLoading || valuationData.length === 0;
    }, [isLoading, valuationData]);

    return (
        <div className="annual-analysis-section h-full flex flex-col space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <ChartTableComponent id='chartAnnualUniquePermitsReport'
                    data={processedData}
                    columns={columns}
                    isLoading={isLoading}
                    chartTitle={chartTitle}
                    xAxisTitle="Fiscal Year"
                    yAxisTitle="Total Permits"
                    xAccessor="FiscalYear"
                    yAccessor="PermitCount"
                    chartType="bar"
                    baseBarColor={pastelPalette[0]}
                    showTrendLine={true}
                    excelFileName="AnnualPermitReport.xlsx"
                    chartFileName="AnnualPermitReport.png"
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
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4" style={{ minHeight: '1100px' }}>
                <ChartTableComponent id='chartValuationThresholds'
                    data={valuationTableData}
                    columns={valuationColumns}
                    isLoading={isValuationLoading}
                    chartTitle="Permit Volume by Unique Permit Numbers — Binned by Valuation Thresholds"
                    xAxisTitle="Valuation Range"
                    yAxisTitle="Permit Volume"
                    traces={valuationTraces}
                    barMode="group"
                    showTrendLine={false}
                    showAverageLine={false}
                    showBarLabels={true}
                    barLabelPosition="outside"
                    barLabelInsideAnchor="middle"
                    barLabelFontColor="#333"
                    excelFileName="ValuationThresholdReport.xlsx"
                    chartFileName="ValuationThresholdReport.png"
                    excelSheetName="Valuation Thresholds"
                    showTablePanel={true}
                    initialSplitPos={60}
                    showPagination={false}
                    showChartTypeSwitcher={false}
                    chartType="bar"
                    splitterOrientation="horizontal"
                    initialTableWidth={320}
                    disableHighlighting={true}
                    disableSelection={true}
                    tableHeaderClassName="text-center"
                    chartLayout={{
                        legend: {
                            orientation: 'h',
                            y: -0.2
                        }
                    }}
                />
            </div>
            
            {/* Individual Charts for Each Valuation Bin */}
            <BinCharts 
                valuationTableData={valuationTableData} 
                filteredValuationData={filteredValuationData} 
                columns={columns} 
                isValuationLoading={isValuationLoading} 
                pastelPalette={pastelPalette} 
            />
        </div>
    );
}

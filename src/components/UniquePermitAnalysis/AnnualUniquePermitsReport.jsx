import React, { useMemo, useEffect, useState } from 'react';
import ChartTableComponent from '../ChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

const columns = [
    columnHelper.accessor('FiscalYear', {
        header: 'Fiscal Yr.',
        cell: info => info.getValue(),
        enableSorting: true,
        meta: {
            className: 'text-right' 
        }
    }),
    columnHelper.accessor('PermitCount', {
        header: 'Permits Vol.',
        cell: info => info.getValue().toLocaleString(),
        enableSorting: true,
        meta: {
            className: 'text-right'
        }
    }),
    columnHelper.accessor('AveragePermitsPerMonth', {
        header: 'Monthly Avg.',
        cell: info => Math.round(info.getValue()).toLocaleString(),
        enableSorting: true,
        meta: {
            className: 'text-right' 
        }
    }),
];

export default function AnnualUniquePermitsReport({ data, isLoading, selectedItemsCount }) {
    const rubyRedPalette = ['#D32F2F', '#F44336', '#E57373', '#FFCDD2', '#B71C1C']; // Ruby Red Theme
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
            enableSorting: true
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
                    meta: { className: 'text-right' }
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
    // }), []); // Replaced by rubyRedPalette for valuationTraces

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
                marker: { color: rubyRedPalette[index % rubyRedPalette.length] },
                text: counts.map(val => val > 0 ? val.toString() : ''),
                textposition: 'inside',
                insidetextanchor: 'middle',
                textfont: {
                    color: 'white',
                    size: 12
                },
                hovertemplate: `<b>Year:</b> ${year}<br><b>Range:</b> %{x}<br><b>Volume:</b> %{y}<extra></extra>`
            };
        });
    }, [filteredValuationData, rubyRedPalette]);

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
                    baseBarColor={rubyRedPalette[0]} // Apply Ruby Red Theme
                    showTrendLine={true}
                    excelFileName="AnnualPermitReport.xlsx"
                    chartFileName="AnnualPermitReport.png"
                />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
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
                    barLabelPosition="inside"
                    barLabelInsideAnchor="middle"
                    barLabelFontColor="white"
                    excelFileName="ValuationThresholdReport.xlsx"
                    chartFileName="ValuationThresholdReport.png"
                    excelSheetName="Valuation Thresholds"
                    showTablePanel={true}
                    initialSplitPos={70}
                    showPagination={false}
                    showChartTypeSwitcher={false}
                    chartType="bar"
                />
            </div>
        </div>
    );
}

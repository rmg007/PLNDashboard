import React, { useMemo, useEffect, useState } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { updateTitle } from '../../utils/titleManager';
import ChartTableComponent from '../../components/ChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export default function PSCActivityReport({ data, isLoading }) {
    const { setTitle } = useLayout();
    const [weekdayData, setWeekdayData] = useState([]);
    const [isLoadingWeekdayData, setIsLoadingWeekdayData] = useState(true);
    const pscColorPalette = [
        'rgb(14, 50, 148)', 'rgb(122, 125, 129)', 'rgb(5, 100, 5)',
        'rgb(37, 44, 51)', 'rgb(7, 104, 143)', 'rgb(49, 136, 133)',
        'rgb(95, 158, 160)', 'rgb(70, 130, 180)', 'rgb(100, 149, 237)',
        'rgb(176, 224, 230)', 'rgb(7, 75, 77)', 'rgb(34, 88, 86)'
    ]; // PSC Theme - Aqua/Teal/Blue palette
    
    // Set the page title when component mounts
    useEffect(() => {
        updateTitle('PSCActivityReport', setTitle);
        return () => setTitle('My Dashboard');
    }, [setTitle]);
    
    // Fetch weekday data
    useEffect(() => {
        const fetchWeekdayData = async () => {
            try {
                const response = await fetch('./data/UniquePermitsAnalysisData/DeptAnnualActivityWeekdayJson.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch weekday data');
                }
                const allData = await response.json();
                // Filter for PSC department only
                const pscData = allData.filter(item => item.department === 'PSC');
                setWeekdayData(pscData);
            } catch (error) {
                console.error('Error fetching weekday data:', error);
            } finally {
                setIsLoadingWeekdayData(false);
            }
        };
        
        fetchWeekdayData();
    }, []);
    
    // PSC Activity Report - Data loaded
    // Define columns for the activity table using modern @tanstack/react-table v8 syntax
    const columns = useMemo(() => [
        {
            header: () => <div className="text-center">Year</div>,
            accessorKey: 'year',
            id: 'year',
            sortingFn: 'basic',
            cell: info => <div className="text-center">{info.getValue()}</div>
        },
        {
            header: () => <div className="text-center">Activity Count</div>,
            accessorKey: 'activity_count',
            id: 'activity_count',
            sortingFn: 'basic',
            cell: info => <div className="text-center">{info.getValue().toLocaleString()}</div>
        }
    ], []);
    
    // Define columns for the weekday table
    const weekdayColumns = useMemo(() => [
        columnHelper.accessor('year', {
            header: 'Fiscal Year',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('monday', {
            header: 'Monday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        }),
        columnHelper.accessor('tuesday', {
            header: 'Tuesday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        }),
        columnHelper.accessor('wednesday', {
            header: 'Wednesday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        }),
        columnHelper.accessor('thursday', {
            header: 'Thursday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        }),
        columnHelper.accessor('friday', {
            header: 'Friday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        })
    ], []);

    // Create traces for the activity chart
    const traces = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            // No data available for PSC traces
            return [];
        }

        // Sort data by year
        const sortedData = [...data].sort((a, b) => a.year - b.year);
        
        return [{
            x: sortedData.map(item => item.year),
            y: sortedData.map(item => item.activity_count),
            type: 'bar',
            name: 'PSC Activity',
            marker: { color: pscColorPalette[0] },
            text: sortedData.map(item => item.activity_count.toLocaleString()),
            textposition: 'inside',
            insidetextanchor: 'middle',
            textfont: {
                color: 'white',
                size: 12
            },
            hovertemplate: '<b>Year: %{x}</b><br>Activity Count: %{y:,}<extra></extra>'
        }];
    }, [data, pscColorPalette]);
    
    // Create traces for the weekday chart (grouped by year)
    const weekdayTraces = useMemo(() => {
        if (!weekdayData || !Array.isArray(weekdayData) || weekdayData.length === 0) {
            // No weekday data available for PSC traces
            return [];
        }

        // Sort data by year
        const sortedData = [...weekdayData].sort((a, b) => a.year - b.year);
        
        // Create a trace for each weekday
        const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        // Theme 5: Ocean & Cool - Replaced by royalPurplePalette
        // const colors = ['#03045e', '#0077b6', '#00b4d8', '#48cae4', '#90e0ef'];
        const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        return weekdays.map((day, index) => ({
            x: sortedData.map(item => item.year),
            y: sortedData.map(item => item[day]), // Keep as decimal for Plotly
            type: 'bar',
            name: weekdayLabels[index],
            marker: { color: pscColorPalette[index % pscColorPalette.length] },
            text: sortedData.map(item => `${(item[day] * 100).toFixed(1)}%`),
            textposition: 'inside',
            insidetextanchor: 'middle',
            textangle: -90,
            textfont: {
                size: 10,
                color: 'white'
            },
            hovertemplate: '<b>Year: %{x}</b><br>' + weekdayLabels[index] + ': %{text}<extra></extra>'
        }));
    }, [weekdayData, pscColorPalette]);
    
    // Create traces for the weekday chart (grouped by day)
    const weekdayByDayTraces = useMemo(() => {
        if (!weekdayData || !Array.isArray(weekdayData) || weekdayData.length === 0) {
            // No weekday data available for day-grouped PSC traces
            return [];
        }

        // Sort data by year
        const sortedData = [...weekdayData].sort((a, b) => a.year - b.year);
        
        // Create a trace for each year
        return sortedData.map((yearData, index) => ({
            x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            y: [
                yearData.monday,
                yearData.tuesday,
                yearData.wednesday,
                yearData.thursday,
                yearData.friday
            ],
            type: 'bar',
            name: `${yearData.year}`,
            marker: { color: pscColorPalette[index % pscColorPalette.length] },
            text: [
                `${(yearData.monday * 100).toFixed(1)}%`,
                `${(yearData.tuesday * 100).toFixed(1)}%`,
                `${(yearData.wednesday * 100).toFixed(1)}%`,
                `${(yearData.thursday * 100).toFixed(1)}%`,
                `${(yearData.friday * 100).toFixed(1)}%`
            ],
            textposition: 'inside',
            insidetextanchor: 'middle',
            textangle: -90,
            textfont: {
                size: 10,
                color: 'white'
            },
            hovertemplate: '<b>%{x}</b><br>Year: ' + yearData.year + '<br>Percentage: %{text}<extra></extra>'
        }));
    }, [weekdayData, pscColorPalette]);
    
    // Define columns for the weekday by day table
    const weekdayByDayColumns = useMemo(() => [
        columnHelper.accessor('year', {
            header: 'Fiscal Year',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('monday', {
            header: 'Monday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        }),
        columnHelper.accessor('tuesday', {
            header: 'Tuesday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        }),
        columnHelper.accessor('wednesday', {
            header: 'Wednesday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        }),
        columnHelper.accessor('thursday', {
            header: 'Thursday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        }),
        columnHelper.accessor('friday', {
            header: 'Friday',
            cell: info => `${(info.getValue() * 100).toFixed(1)}%`
        })
    ], []);

    return (
        <div className="psc-activity-report space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <ChartTableComponent 
                    id='chartPSCActivity'
                    initialTableWidth={250}
                    data={Array.isArray(data) ? data : []}
                    columns={columns}
                    isLoading={isLoading}
                    chartTitle="PSC Department Activity by Year"
                    xAxisTitle="Year"
                    yAxisTitle="Activity Count"
                    traces={traces}
                    showTrendLine={true}
                    showAverageLine={true}
                    showBarLabels={true}
                    barLabelPosition="inside"
                    barLabelInsideAnchor="middle"
                    barLabelFontColor="white"
                    excelFileName="PSCActivityReport.xlsx"
                    chartFileName="PSCActivityReport.png"
                    excelSheetName="PSC Activity"
                    showTablePanel={true}
                    initialSplitPos={70}
                    showPagination={false}
                    showChartTypeSwitcher={true}
                    chartType="bar"
                    chartLayout={{
                        legend: {
                            orientation: 'h',
                            y: -0.2
                        }
                    }}
                />
            </div>
            
            {/* Weekday Activity Chart - Grouped by Year */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <ChartTableComponent 
                    id='chartPSCWeekdayActivity'
                    data={Array.isArray(weekdayData) ? weekdayData : []}
                    columns={weekdayColumns}
                    isLoading={isLoadingWeekdayData}
                    chartTitle="PSC Data - Per Action (Weekdays) - Grouped by Year"
                    xAxisTitle="Year"
                    yAxisTitle="Percentage"
                    traces={weekdayTraces}
                    showTrendLine={false}
                    showAverageLine={false}
                    showBarLabels={true}
                    barLabelPosition="inside"
                    barMode="group"
                    excelFileName="PSCWeekdayActivityReport.xlsx"
                    chartFileName="PSCWeekdayActivityReport.png"
                    excelSheetName="PSC Weekday Activity"
                    showTablePanel={true}
                    splitterOrientation="horizontal"
                    initialSplitPos={60}
                    showPagination={false}
                    showChartTypeSwitcher={false}
                    disableHighlighting={true}
                    chartType="bar"
                    chartLayout={{
                        barmode: 'group',
                        yaxis: {
                            tickformat: '.0%',
                            range: [0, 0.3], // Set y-axis range from 0% to 30%
                        },
                        legend: {
                            orientation: 'h',
                            y: -0.2
                        }
                    }}
                />
            </div>
            
            {/* Weekday Activity Chart - Grouped by Day */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <ChartTableComponent 
                    id='chartPSCWeekdayByDayActivity'
                    data={Array.isArray(weekdayData) ? weekdayData : []}
                    columns={weekdayByDayColumns}
                    isLoading={isLoadingWeekdayData}
                    chartTitle="PSC Data - Per Action (Weekdays) - Grouped by Day"
                    xAxisTitle="Weekday"
                    yAxisTitle="Percentage"
                    traces={weekdayByDayTraces}
                    showTrendLine={false}
                    showAverageLine={false}
                    showBarLabels={true}
                    barLabelPosition="inside"
                    barMode="group"
                    excelFileName="PSCWeekdayByDayActivityReport.xlsx"
                    chartFileName="PSCWeekdayByDayActivityReport.png"
                    excelSheetName="PSC Weekday By Day Activity"
                    showTablePanel={true}
                    splitterOrientation="horizontal"
                    initialSplitPos={60}
                    showPagination={false}
                    showChartTypeSwitcher={false}
                    disableHighlighting={true}
                    chartType="bar"
                    chartLayout={{
                        barmode: 'group',
                        yaxis: {
                            tickformat: '.0%',
                            range: [0, 0.3], // Set y-axis range from 0% to 30%
                        },
                        legend: {
                            orientation: 'h',
                            y: -0.2
                        }
                    }}
                />
            </div>
        </div>
    );
}

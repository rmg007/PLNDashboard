import React, { useMemo, useEffect, useState } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { updateTitle } from '../../utils/titleManager';
import ChartTableComponent from '../../components/ChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table'; // Import helper

const columnHelper = createColumnHelper(); // Create an instance of the helper

export default function LUActivityReport({ data, isLoading }) {
    const { setTitle } = useLayout();
    const [weekdayData, setWeekdayData] = useState([]);
    const [isLoadingWeekdayData, setIsLoadingWeekdayData] = useState(true);
    const sunsetOrangePalette = ['#FF6700', '#FF8C42', '#FFB370', '#E55B00', '#A94300']; // Sunset Orange Theme
    
    // Set the page title when component mounts
    useEffect(() => {
        updateTitle('LUActivityReport', setTitle);
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
                // Filter for LU department only
                const luData = allData.filter(item => item.department === 'LU');
                setWeekdayData(luData);
            } catch (error) {
                console.error('Error fetching weekday data:', error);
            } finally {
                setIsLoadingWeekdayData(false);
            }
        };
        
        fetchWeekdayData();
    }, []);
    
    console.log('LUActivityReport - data:', data);
    console.log('LUActivityReport - isLoading:', isLoading);
    console.log('LUActivityReport - weekdayData:', weekdayData);
    // Define columns for the activity table using modern v8 syntax
    const columns = useMemo(() => [
        columnHelper.accessor('year', {
            header: 'Year',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('activity_count', {
            header: 'Activity Count',
            cell: info => info.getValue().toLocaleString()
        })
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
            console.log('LUActivityReport - No data available for traces');
            return [];
        }

        // Sort data by year
        const sortedData = [...data].sort((a, b) => a.year - b.year);
        console.log('LUActivityReport - Sorted data for traces:', sortedData);
        
        return [{
            x: sortedData.map(item => item.year),
            y: sortedData.map(item => item.activity_count),
            type: 'bar',
            name: 'LU Activity',
            marker: { color: sunsetOrangePalette[0] }, // Use first color of Sunset Orange Theme
            text: sortedData.map(item => item.activity_count.toLocaleString()),
            textposition: 'inside',
            insidetextanchor: 'middle',
            textfont: {
                color: 'white',
                size: 12
            },
            hovertemplate: '<b>Year: %{x}</b><br>Activity Count: %{y:,}<extra></extra>'
        }];
    }, [data, sunsetOrangePalette]);
    
    // Create traces for the weekday chart
    const weekdayTraces = useMemo(() => {
        if (!weekdayData || !Array.isArray(weekdayData) || weekdayData.length === 0) {
            console.log('LUActivityReport - No weekday data available for traces');
            return [];
        }

        // Sort data by year
        const sortedData = [...weekdayData].sort((a, b) => a.year - b.year);
        
        // Create a trace for each weekday
        const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        // Theme 5: Ocean & Cool - Replaced by sunsetOrangePalette
        // const colors = ['#03045e', '#0077b6', '#00b4d8', '#48cae4', '#90e0ef'];
        const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        return weekdays.map((day, index) => ({
            x: sortedData.map(item => item.year),
            y: sortedData.map(item => item[day]), // Keep as decimal for Plotly
            type: 'bar',
            name: weekdayLabels[index],
            marker: { color: sunsetOrangePalette[index % sunsetOrangePalette.length] },
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
    }, [weekdayData, sunsetOrangePalette]);
    
    // Create traces for the weekday chart (grouped by day)
    const weekdayByDayTraces = useMemo(() => {
        if (!weekdayData || !Array.isArray(weekdayData) || weekdayData.length === 0) {
            console.log('LUActivityReport - No weekday data available for day-grouped traces');
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
            marker: { color: sunsetOrangePalette[index % sunsetOrangePalette.length] },
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
    }, [weekdayData, sunsetOrangePalette]);
    
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
        <div className="lu-activity-report space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <ChartTableComponent 
                    id='chartLUActivity'
                    data={Array.isArray(data) ? data : []}
                    columns={columns}
                    isLoading={isLoading}
                    chartTitle="LU Department Activity by Year"
                    xAxisTitle="Year"
                    yAxisTitle="Activity Count"
                    traces={traces}
                    showTrendLine={true}
                    showAverageLine={true}
                    showBarLabels={true}
                    barLabelPosition="inside"
                    barLabelInsideAnchor="middle"
                    barLabelFontColor="white"
                    excelFileName="LUActivityReport.xlsx"
                    chartFileName="LUActivityReport.png"
                    excelSheetName="LU Activity"
                    showTablePanel={true}
                    initialSplitPos={70}
                    showPagination={false}
                    showChartTypeSwitcher={true}
                    chartType="bar"
                />
            </div>
            
            {/* Weekday Activity Chart - Grouped by Year */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <ChartTableComponent 
                    id='chartLUWeekdayActivity'
                    data={Array.isArray(weekdayData) ? weekdayData : []}
                    columns={weekdayColumns}
                    isLoading={isLoadingWeekdayData}
                    chartTitle="LU Data - Per Action (Weekdays) - Grouped by Year"
                    xAxisTitle="Year"
                    yAxisTitle="Percentage"
                    traces={weekdayTraces}
                    showTrendLine={false}
                    showAverageLine={false}
                    showBarLabels={true}
                    barLabelPosition="inside"
                    barMode="group"
                    excelFileName="LUWeekdayActivityReport.xlsx"
                    chartFileName="LUWeekdayActivityReport.png"
                    excelSheetName="LU Weekday Activity"
                    showTablePanel={true}
                    initialSplitPos={70}
                    showPagination={false}
                    showChartTypeSwitcher={false}
                    chartType="bar"
                    chartLayout={{
                        barmode: 'group',
                        yaxis: {
                            tickformat: '.0%',
                            range: [0, 0.7], // Set y-axis range from 0% to 70%
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
                    id='chartLUWeekdayByDayActivity'
                    data={Array.isArray(weekdayData) ? weekdayData : []}
                    columns={weekdayByDayColumns}
                    isLoading={isLoadingWeekdayData}
                    chartTitle="LU Data - Per Action (Weekdays) - Grouped by Day"
                    xAxisTitle="Weekday"
                    yAxisTitle="Percentage"
                    traces={weekdayByDayTraces}
                    showTrendLine={false}
                    showAverageLine={false}
                    showBarLabels={true}
                    barLabelPosition="inside"
                    barMode="group"
                    excelFileName="LUWeekdayByDayActivityReport.xlsx"
                    chartFileName="LUWeekdayByDayActivityReport.png"
                    excelSheetName="LU Weekday By Day Activity"
                    showTablePanel={true}
                    initialSplitPos={70}
                    showPagination={false}
                    showChartTypeSwitcher={false}
                    chartType="bar"
                    chartLayout={{
                        barmode: 'group',
                        yaxis: {
                            tickformat: '.0%',
                            range: [0, 0.7], // Set y-axis range from 0% to 70%
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

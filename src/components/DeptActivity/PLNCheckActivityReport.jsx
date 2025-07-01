import React, { useMemo, useEffect, useState } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useFilter } from '../../contexts/FilterContext';
import { updateTitle } from '../../utils/titleManager';
import ChartTableComponent from '../../components/ChartTableComponent';
import BarChartTableComponent from '../../components/charts/BarChartTableComponent';
import GroupedBarChartTableComponent from '../../components/charts/GroupedBarChartTableComponent';
import MoreMenu from '../../components/ChartTableComponent/MoreMenu';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export default function PLNCheckActivityReport({ isLoading }) {
        const { setTitle } = useLayout();
    const { filteredPLNCheckData: data, filteredPLNCheckWeekdayData: weekdayData } = useFilter();
    const plnCheckPalette = [
        'rgb(168, 65, 27)', 'rgb(167, 103, 26)', 'rgb(175, 153, 28)',
        'rgb(93, 173, 12)', 'rgb(42, 170, 106)', 'rgb(0, 110, 146)',
        'rgba(39, 94, 150, 0.75)', 'rgb(138, 43, 226)', 'rgb(128, 15, 75)',
        'rgb(199, 21, 133)', 'rgb(220, 20, 60)', 'rgb(75, 0, 130)'
    ]; // PLN Check Theme - RGB format
    
    // Set the page title when component mounts
    useEffect(() => {
        updateTitle('PLNCheckActivityReport', setTitle);
        return () => setTitle('My Dashboard');
    }, [setTitle]);
    
    // No need for CSS injection anymore as we're using the verticalLayout prop
    
    // PLN Check Activity Report - Data loaded
    // Define columns for the activity table using modern @tanstack/react-table v8 syntax
    const columns = useMemo(() => [
        {
            header: 'Year',
            accessorKey: 'year',
            id: 'year',
            sortingFn: 'basic',
            cell: info => info.getValue()
        },
        {
            header: 'Activity Count',
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

    // Data is now directly used by BarChartTableComponent with xField and yField
    
    // Define common chart configuration
    const commonChartConfig = useMemo(() => ({
        legend: {
            orientation: 'h',
            yanchor: 'top',
            y: -0.2,
            xanchor: 'center',
            x: 0.5
        },
        // Add data labels outside bars with -45° rotation
        traces: yFields => yFields.map((field, index) => ({
            textposition: 'outside',
            textangle: -45,
            textfont: {
                size: 10
            },
            texttemplate: '%{y:.1%}'
        }))
    }), []);
    
    // Create traces for the weekday chart (grouped by year)
    const weekdayTraces = useMemo(() => {
        if (!weekdayData || !Array.isArray(weekdayData) || weekdayData.length === 0) {
            // No weekday data available for PLN Check traces
            return [];
        }

        // Sort data by year
        const sortedData = [...weekdayData].sort((a, b) => a.year - b.year);
        
        // Create a trace for each weekday
        const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        // Theme 5: Ocean & Cool - Replaced by plnCheckPalette
        // const colors = ['#03045e', '#0077b6', '#00b4d8', '#48cae4', '#90e0ef'];
        const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        return weekdays.map((day, index) => ({
            x: sortedData.map(item => item.year),
            y: sortedData.map(item => item[day]), // Keep as decimal for Plotly
            type: 'bar',
            name: weekdayLabels[index],
            marker: { color: plnCheckPalette[index % plnCheckPalette.length] },
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
    }, [weekdayData, plnCheckPalette]);
    
    // Create traces for the weekday chart (grouped by day)
    const weekdayByDayTraces = useMemo(() => {
        if (!weekdayData || !Array.isArray(weekdayData) || weekdayData.length === 0) {
            // No weekday data available for day-grouped PLN Check traces
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
            marker: { color: plnCheckPalette[index % plnCheckPalette.length] },
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
    }, [weekdayData, plnCheckPalette]);
    
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
        <div id="pln-check-activity-report" className="pln-check-activity-report space-y-8">
             <div id="pln-check-activity-chart-container" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 relative">
                           <MoreMenu 
                               id="more-menu-pln-check-activity"
                               chartType="bar"
                               setChartType={() => {}}
                               onExportCsv={() => {}}
                               onExportPng={() => {}}
                               showChartTypeSwitcher={true}
                               tableVisible={true}
                               onToggleTable={() => {}}
                               showTableToggle={true}
                           />
                <BarChartTableComponent
                    id='chartPLNCheckActivity'
                    data={Array.isArray(data) ? data : []}
                    xField="year"
                    yField="activity_count"
                    title="PLN Check Activity by Year"
                    xAxisLabel="Year"
                    yAxisLabel="Activity Count"
                    color={plnCheckPalette[0]}
                    showLabels={true}
                    labelFormat={(value) => value.toLocaleString()}
                    columns={columns}
                    defaultRowsPerPage={10}
                    defaultSorting={[{ id: 'year', desc: true }]}
                    chartConfig={commonChartConfig}
                    initialState={{
                        columnSizing: {
                            year: 60,
                            activity_count: 100
                        }
                    }}
                />
            </div>
            
            {/* Weekday Activity Chart - Grouped by Year */}
            <div id="pln-check-weekday-activity-chart-container" className="bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 relative">
                <MoreMenu 
                    id="more-menu-pln-check-weekday-activity"
                    chartType="bar"
                    setChartType={() => {}}
                    onExportCsv={() => {}}
                    onExportPng={() => {}}
                    showChartTypeSwitcher={false}
                    tableVisible={true}
                    onToggleTable={() => {}}
                    showTableToggle={true}
                />
                <GroupedBarChartTableComponent 
                    id='chartPLNCheckWeekdayActivity'
                    data={Array.isArray(weekdayData) ? weekdayData : []}
                    columns={weekdayColumns}
                    xField="year"
                    yFields={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
                    yLabels={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
                    title="PLN Check Data - Per Action (Weekdays) - Grouped by Year"
                    xAxisLabel="Year"
                    yAxisLabel="Percentage"
                    colors={plnCheckPalette}
                    barMode="group"
                    height={400}
                    tablePosition="bottom"
                    showTable={true}
                    enableSelection={false}
                    chartConfig={{
                        yaxis: {
                            tickformat: '.0%',
                            range: [0, 0.3] // Set y-axis range from 0% to 30%
                        },
                        legend: {
                            orientation: 'h',
                            y: -0.2,
                            yanchor: 'top',
                            xanchor: 'center',
                            x: 0.5
                        }
                    }}
                />
            </div>
            
            {/* Weekday Activity Chart - Grouped by Day */}
            <div id="pln-check-weekday-by-day-activity-chart-container" className="bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 relative">
                <MoreMenu 
                    id="more-menu-pln-check-weekday-by-day-activity"
                    chartType="bar"
                    setChartType={() => {}}
                    onExportCsv={() => {}}
                    onExportPng={() => {}}
                    showChartTypeSwitcher={false}
                    tableVisible={true}
                    onToggleTable={() => {}}
                    showTableToggle={true}
                />
                <GroupedBarChartTableComponent 
                    id='chartPLNCheckWeekdayByDayActivity'
                    data={Array.isArray(weekdayData) ? weekdayData : []}
                    columns={weekdayByDayColumns}
                    xField="year"
                    yFields={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
                    yLabels={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
                    title="PLN Check Activity by Weekday"
                    xAxisLabel="Weekday"
                    yAxisLabel="Percentage"
                    colors={plnCheckPalette}
                    barMode="group"
                    defaultRowsPerPage={10}
                    defaultSorting={[{ id: 'year', desc: true }]}
                    chartConfig={{
                        yaxis: {
                            tickformat: '.0%',
                            range: [0, 0.3] // Set y-axis range from 0% to 30%
                        },
                        legend: {
                            orientation: 'h',
                            y: -0.2,
                            yanchor: 'top'
                        }
                    }}
                    initialState={{
                        columnSizing: {
                            year: 60,
                            monday: 80,
                            tuesday: 80,
                            wednesday: 80,
                            thursday: 80,
                            friday: 80
                        }
                    }}
                />
            </div>
        </div>
    );
}

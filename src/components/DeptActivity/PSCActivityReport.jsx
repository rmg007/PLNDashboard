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

export default function PSCActivityReport({ isLoading }) {
        const { setTitle } = useLayout();
    const { filteredPSCData: data, filteredPSCWeekdayData: weekdayData } = useFilter();
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

    // Data is now directly used by BarChartTableComponent with xField and yField
    
    // Weekday data is now directly used by GroupedBarChartTableComponent with xField and yFields
    
    // Weekday by day data is now directly used by GroupedBarChartTableComponent with xField and yFields
    
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
        <div id="psc-activity-report" className="psc-activity-report space-y-8">
            <div id="psc-activity-chart-container" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 relative">
                <MoreMenu 
                    id="more-menu-psc-activity"
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
                    id='chartPSCActivity'
                    data={Array.isArray(data) ? data : []}
                    xField="year"
                    yField="activity_count"
                    title="PSC Activity by Year"
                    xAxisLabel="Year"
                    yAxisLabel="Activity Count"
                    color={pscColorPalette[0]}
                    showLabels={true}
                    labelFormat={(value) => value.toLocaleString()}
                    columns={columns}
                    defaultRowsPerPage={10}
                    defaultSorting={[{ id: 'year', desc: true }]}
                    chartConfig={{
                        legend: {
                            orientation: 'h',
                            y: -0.2
                        }
                    }}
                    initialState={{
                        columnSizing: {
                            year: 60,
                            activity_count: 100
                        }
                    }}
                />
            </div>
            
            {/* Weekday Activity Chart - Grouped by Year */}
            <div id="psc-weekday-activity-chart-container" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 relative">
                <MoreMenu 
                    id="more-menu-psc-weekday-activity"
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
                    id='chartPSCWeekdayActivity'
                    data={Array.isArray(weekdayData) ? weekdayData : []}
                    xField="year"
                    yFields={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
                    yLabels={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
                    columns={weekdayColumns}
                    title="PSC Activity by Weekday (Grouped by Year)"
                    xAxisLabel="Fiscal Year"
                    yAxisLabel="Percentage"
                    colors={pscColorPalette}
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
                            y: -0.2
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
            
            {/* Weekday Activity Chart - Grouped by Day */}
            <div id="psc-weekday-by-day-activity-chart-container" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 relative">
                <MoreMenu 
                    id="more-menu-psc-weekday-by-day-activity"
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
                    id='chartPSCWeekdayByDayActivity'
                    data={Array.isArray(weekdayData) ? weekdayData : []}
                    xField="year"
                    yFields={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
                    yLabels={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
                    columns={weekdayByDayColumns}
                    title="PSC Data - Per Action (Weekdays) - Grouped by Day"
                    xAxisLabel="Weekday"
                    yAxisLabel="Percentage"
                    colors={pscColorPalette}
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
                            y: -0.1,
                            yanchor: 'top'
                        }
                    }}
                />
            </div>
        </div>
    );
}

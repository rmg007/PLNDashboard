import React, { useMemo, useEffect } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useFilter } from '../../contexts/FilterContext';
import { updateTitle } from '../../utils/titleManager';
import { createColumnHelper } from '@tanstack/react-table'; // Import helper
import BarChartTableComponent from '../charts/BarChartTableComponent';
import GroupedBarChartTableComponent from '../charts/GroupedBarChartTableComponent';
import DashboardCardComponent from '../common/DashboardCardComponent';

const columnHelper = createColumnHelper(); // Create an instance of the helper

// Define LU color palette inline since chartColors.js is missing
const luPalette = [
    'rgb(75, 150, 125)', 'rgb(122, 137, 156)', 'rgb(95, 163, 95)',
    'rgb(92, 105, 117)', 'rgb(101, 155, 177)', 'rgb(72, 209, 204)',
    'rgb(95, 158, 160)', 'rgb(70, 130, 180)', 'rgb(100, 149, 237)',
    'rgb(125, 159, 163)', 'rgb(0, 206, 209)', 'rgb(32, 178, 170)'
]; // LU Theme - RGB format



export default function LUActivityReport({ isLoading }) {
    const { setTitle } = useLayout();
    const { filteredLUData: data, filteredLUWeekdayData: weekdayData } = useFilter();

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

    
    



    
    // Set the page title when component mounts
    useEffect(() => {
        updateTitle('LUActivityReport', setTitle);
        return () => setTitle('My Dashboard');
    }, [setTitle]);
    

    
    // LU Activity Report - Data loaded

    
    // Define columns for the weekday table
    const luActivityColumns = useMemo(() => [
        columnHelper.accessor('year', {
            header: 'Fiscal Year',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('activity_count', {
            header: 'Activity Count',
            cell: info => info.getValue().toLocaleString()
        })
    ], []);

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



    

    


    return (
        <div id="lu-activity-report" className="lu-activity-report space-y-8">
            <DashboardCardComponent id="lu-activity-report"
                isLoading={isLoading}
                error={null}
                exportOptions={{
                    excelFilename: "LUActivityReport.xlsx",
                    imageFilename: "LUActivityReport.png"
                }}
            >
                {/* Chart and Table combined using BarChartTableComponent */}
                <BarChartTableComponent
                    id='chartLUActivity'
                    data={Array.isArray(data) ? data : []}
                    xField="year"
                    yField="activity_count"
                    title="LU Activity by Year"
                    xAxisLabel="Year"
                    yAxisLabel="Activity Count"
                    color={luPalette[0]}
                    showLabels={true}
                    labelFormat={(value) => value.toLocaleString()}
                    columns={luActivityColumns}
                    defaultRowsPerPage={10}
                    defaultSorting={[{ id: 'year', desc: true }]}
                    chartConfig={commonChartConfig}
                    // Make columns more compact
                    initialState={{
                        columnSizing: {
                            year: 60,
                            activity_count: 100
                        }
                    }} 
                />
            </DashboardCardComponent>
            
            {/* Weekday Activity Chart - Grouped by Year */}
            <DashboardCardComponent
                id="lu-weekday-activity-card"
                title="LU Data - Per Action (Weekdays) - Grouped by Year"
                isLoading={isLoading}
                error={null}
                exportOptions={{
                    excelFilename: "LUWeekdayActivityReport.xlsx",
                    imageFilename: "LUWeekdayActivityReport.png"
                }}
            >
                <div className="flex flex-col w-full h-full gap-4">
                    {/* Chart section */}
                    <GroupedBarChartTableComponent 
                        id='chartLUWeekdayActivity'
                        data={Array.isArray(weekdayData) ? weekdayData : []}
                        xField="year"
                        yFields={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
                        yLabels={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
                        columns={weekdayColumns}
                        title="LU Data - Per Action (Weekdays) - Grouped by Year"
                        xAxisLabel="Fiscal Year"
                        yAxisLabel="Percentage"
                        colors={luPalette}
                        barMode="group"
                        height={400}
                        tablePosition="bottom"
                        showTable={true}
                        enableSelection={false}
                        chartConfig={commonChartConfig}
                    />
                </div>
            </DashboardCardComponent>
            
            {/* Weekday Activity Chart - Grouped by Day */}
            <DashboardCardComponent
                id="lu-weekday-by-day-activity-card"
                title="LU Data - Per Action (Weekdays) - Grouped by Day"
                isLoading={isLoading}
                error={null}
                exportOptions={{
                    excelFilename: "LUWeekdayByDayActivityReport.xlsx",
                    imageFilename: "LUWeekdayByDayActivityReport.png"
                }}
            >
                <div className="flex flex-col w-full h-full gap-4">
                    {/* Chart section */}
                    <GroupedBarChartTableComponent 
                        id='chartLUWeekdayByDayActivity'
                        data={Array.isArray(weekdayData) ? weekdayData : []}
                        xField="year"
                        yFields={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
                        yLabels={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
                        columns={weekdayColumns}
                        title="LU Data - Per Action (Weekdays) - Grouped by Day"
                        xAxisLabel="Fiscal Year"
                        yAxisLabel="Percentage"
                        colors={luPalette}
                        barMode="group"
                        height={400}
                        tablePosition="bottom"
                        showTable={true}
                        enableSelection={false}
                        chartConfig={commonChartConfig}
                    />
                </div>
            </DashboardCardComponent>
        </div>
    );
}

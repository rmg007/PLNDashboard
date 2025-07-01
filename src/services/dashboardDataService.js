import { permitAPI, departmentAPI } from './api';

/**
 * Dashboard Data Service
 * Provides methods to fetch and prepare data for the dashboard components
 * Data is loaded from the API endpoints
 */

/**
 * Transform department workload data from API to heatmap format
 * @returns {Promise<Array>} Department workload data for heatmap
 */
const getDepartmentWorkloadData = async () => {
  try {
    // Fetch data from API
    const rawData = await departmentAPI.getActivityWeekday();
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No department workload data available');
    }
    
    // Transform data for heatmap format
    const result = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    
    rawData.forEach(item => {
      days.forEach(day => {
        // Convert percentage to a value between 0-100
        const value = Math.round(item[day] * 100);
        
        result.push({
          department: item.department,
          period: day.charAt(0).toUpperCase() + day.slice(1), // Capitalize first letter
          year: item.year,
          value: value
        });
      });
    });
    
    return result;
  } catch (error) {
    console.error('Error processing department workload data:', error);
    return [];
  }
};

/**
 * Transform permit data to create distribution by category
 * @returns {Promise<Array>} Permit distribution data for horizontal bar chart
 */
const getPermitDistributionData = async () => {
  try {
    // Use the yearly bins data to create permit categories
    const rawData = await permitAPI.getYearlyBins();
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No permit distribution data available');
    }
    
    // Get the most recent year's data
    const years = [...new Set(rawData.map(item => item.year))];
    const latestYear = Math.max(...years);
    const latestYearData = rawData.filter(item => item.year === latestYear);
    
    // Create categories based on permit ranges
    const categories = {};
    latestYearData.forEach(item => {
      if (!categories[item.bin_range]) {
        categories[item.bin_range] = 0;
      }
      categories[item.bin_range] += item.permit_count;
    });
    
    // Convert to array format for horizontal bar chart
    return Object.entries(categories).map(([category, value]) => ({
      category,
      value
    })).sort((a, b) => b.value - a.value); // Sort by value descending
  } catch (error) {
    console.error('Error processing permit distribution data:', error);
    return [];
  }
};

/**
 * Fetch KPI data for the dashboard
 * @returns {Promise<Object>} KPI data for the dashboard
 */
export const fetchKPIData = async () => {
  try {
    // Default fallback data in case of errors
    const defaultKpiData = {
      totalPermits: {
        value: 1250,
        trend: 'up',
        trendValue: '+8.5%',
        sparklineData: [980, 1050, 1100, 1150, 1250]
      },
      avgValuation: {
        value: 425000,
        trend: 'up',
        trendValue: '+12.5%',
        sparklineData: [340000, 360000, 385000, 400000, 425000]
      },
      deptActivity: {
        value: 3850,
        trend: 'up',
        trendValue: '+5.2%',
        sparklineData: [3500, 3600, 3700, 3800, 3850]
      },
      monthlyTrend: {
        value: 'Increasing',
        trend: 'up',
        trendValue: '+6.8%',
        sparklineData: [210, 225, 230, 235, 240, 255]
      },
      metrics: {
        avgProcessingDays: 21,
        completionRate: 87,
        approvalRate: 92,
        revisionRate: 15
      }
    };
    
    // Fetch data from API
    const [yearlyData, deptActivityData, monthlyData] = await Promise.all([
      permitAPI.getYearlyPermits(),
      departmentAPI.getActivity(),
      permitAPI.getMonthlyPermits()
    ]);
    
    if (!yearlyData.length || !deptActivityData.length || !monthlyData.length) {
      console.warn('Missing data from API, using default KPI data');
      return defaultKpiData;
    }
    
    // Sort data by year to get trends
    const sortedYearlyData = [...yearlyData].sort((a, b) => a.fiscal_year - b.fiscal_year);
    const recentYears = sortedYearlyData.slice(-5); // Get last 5 years
    
    // Check if we have enough data for trends
    if (recentYears.length < 2) {
      throw new Error('Not enough yearly data for trend calculation');
    }
    
    // Calculate total permits trend
    const currentYear = recentYears[recentYears.length - 1];
    const previousYear = recentYears[recentYears.length - 2];
    const totalPermitsTrend = previousYear.permit_count !== 0 ? 
      ((currentYear.permit_count - previousYear.permit_count) / previousYear.permit_count) * 100 : 0;
    const totalPermitsTrendValue = `${totalPermitsTrend >= 0 ? '+' : ''}${totalPermitsTrend.toFixed(1)}%`;
    
    // Get department activity data for the most recent year
    const latestActivityYear = Math.max(...deptActivityData.map(item => item.year));
    const currentYearDeptActivity = deptActivityData
      .filter(item => item.year === latestActivityYear)
      .reduce((sum, item) => sum + item.activity_count, 0);
    
    const previousYearDeptActivity = deptActivityData
      .filter(item => item.year === latestActivityYear - 1)
      .reduce((sum, item) => sum + item.activity_count, 0);
    
    const deptActivityTrend = previousYearDeptActivity !== 0 ?
      ((currentYearDeptActivity - previousYearDeptActivity) / previousYearDeptActivity) * 100 : 0;
    const deptActivityTrendValue = `${deptActivityTrend >= 0 ? '+' : ''}${deptActivityTrend.toFixed(1)}%`;
    
    // Get monthly trend for current year
    const latestMonthlyData = monthlyData
      .filter(item => item.year === currentYear.fiscal_year)
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
    
    const recentMonths = latestMonthlyData.slice(-6); // Last 6 months
    
    // Return updated KPI data
    return {
      totalPermits: {
        value: currentYear.permit_count,
        trend: totalPermitsTrend >= 0 ? 'up' : 'down',
        trendValue: totalPermitsTrendValue,
        sparklineData: recentYears.map(y => y.permit_count)
      },
      avgValuation: defaultKpiData.avgValuation, // Keep default for now
      deptActivity: {
        value: currentYearDeptActivity,
        trend: deptActivityTrend >= 0 ? 'up' : 'down',
        trendValue: deptActivityTrendValue,
        sparklineData: deptActivityData
          .filter(d => d.year >= latestActivityYear - 4)
          .map(d => d.activity_count)
      },
      monthlyTrend: {
        value: totalPermitsTrend >= 0 ? 'Increasing' : 'Decreasing',
        trend: totalPermitsTrend >= 0 ? 'up' : 'down',
        trendValue: totalPermitsTrendValue,
        sparklineData: recentMonths.map(m => m.permit_count)
      },
      metrics: defaultKpiData.metrics // Keep default for now
    };
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    return defaultKpiData;
  }
};

/**
 * Fetch chart data for the dashboard
 * @returns {Promise<Object>} Chart data for the dashboard
 */
export const fetchChartData = async () => {
  try {
    const [yearlyData, yearlyBinsData, deptActivityData] = await Promise.all([
      permitAPI.getYearlyPermits(),
      permitAPI.getYearlyBins(),
      departmentAPI.getActivity()
    ]);

    if (!yearlyData.length || !yearlyBinsData.length || !deptActivityData.length) {
      throw new Error('Failed to fetch chart data from API');
    }

    const [permitVolumeData, valuationRangeData] = await Promise.all([
      processPermitVolumeData(yearlyData, yearlyBinsData),
      processValuationRangeData(yearlyBinsData)
    ]);

    const deptTrendsData = await processDeptActivityData(deptActivityData);

    return {
      permitVolumeData,
      valuationRangeData,
      deptTrendsData
    };
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return {
      permitVolumeData: [],
      valuationRangeData: [],
      deptTrendsData: []
    };
  }
};

/**
 * Process yearly data for the Combination Chart
 * @param {Array} yearlyData - Yearly permit data
 * @param {Array} yearlyBinsData - Yearly permit data with valuation bins
 * @returns {Array} Processed data for the combination chart
 */
async function processPermitVolumeData(yearlyData, yearlyBinsData) {
  try {
    if (!yearlyData.length || !yearlyBinsData.length) {
      throw new Error('Missing data for permit volume processing');
    }
    
    // Sort data by year
    const sortedYearlyData = [...yearlyData].sort((a, b) => a.fiscal_year - b.fiscal_year);
    const recentYears = sortedYearlyData.slice(-5); // Get last 5 years
    
    // Calculate average valuation for each year
    const valuationRanges = {
      '0-10K': 5000,
      '10K-100K': 55000,
      '100K-1M': 550000,
      '1M-10M': 5500000,
      '10M+': 15000000
    };
    
    const yearlyValuations = {};
    
    yearlyBinsData.forEach(item => {
      const year = item.year;
      if (!yearlyValuations[year]) {
        yearlyValuations[year] = { totalValue: 0, totalCount: 0 };
      }
      
      const midpoint = valuationRanges[item.bin_range] || 0;
      yearlyValuations[year].totalValue += midpoint * item.permit_count;
      yearlyValuations[year].totalCount += item.permit_count;
    });
    
    // Create the combined data
    return recentYears.map(yearData => {
      const year = yearData.fiscal_year;
      const valuation = yearlyValuations[year] || { totalValue: 0, totalCount: 0 };
      const avgValuation = valuation.totalCount > 0 ? 
        Math.round(valuation.totalValue / valuation.totalCount) : 0;
      
      return {
        year: year.toString(),
        permitCount: yearData.permit_count,
        avgValuation: avgValuation
      };
    });
  } catch (error) {
    console.error('Error processing permit volume data:', error);
    return [];
  }
}

/**
 * Process department activity data for box plots or other visualizations
 * @param {Array} deptActivityData - Department activity data
 * @returns {Array} Processed data for department activity visualization
 */
async function processDeptActivityData(deptActivityData) {
  try {
    if (!deptActivityData.length) {
      throw new Error('Missing data for department activity processing');
    }
    
    // Get unique departments
    const departments = [...new Set(deptActivityData.map(item => item.department))];
    
    // Process data for each department
    return departments.map((dept, index) => {
      const deptData = deptActivityData.filter(item => item.department === dept);
      const values = deptData.map(item => item.activity_count);
      
      // Assign colors based on index
      const colors = [
        'rgb(54, 162, 235)', // Blue
        'rgb(255, 99, 132)', // Red
        'rgb(75, 192, 192)', // Teal
        'rgb(255, 159, 64)', // Orange
        'rgb(153, 102, 255)', // Purple
        'rgb(255, 205, 86)'  // Yellow
      ];
      
      return {
        name: dept,
        values: values,
        color: colors[index % colors.length]
      };
    });
  } catch (error) {
    console.error('Error processing department activity data:', error);
    return [];
  }
}

/**
 * Process valuation range data for stacked bar chart
 * @param {Array} yearlyBinsData - Yearly permit data with valuation bins
 * @returns {Array} Processed data for valuation range chart
 */
async function processValuationRangeData(yearlyBinsData) {
  try {
    if (!yearlyBinsData.length) {
      throw new Error('Missing data for valuation range processing');
    }
    
    // Get unique years and ranges
    const years = [...new Set(yearlyBinsData.map(item => item.year))].sort();
    const recentYears = years.slice(-5); // Get last 5 years
    
    // Create a map of valuation ranges
    const result = [];
    
    recentYears.forEach(year => {
      const yearData = yearlyBinsData.filter(item => item.year === year);
      const yearObj = { year: year.toString() };
      
      // Add each range as a property
      yearData.forEach(item => {
        // Convert range names to match expected format
        let rangeName = item.bin_range;
        if (rangeName === '0-10K') rangeName = '<$100K';
        else if (rangeName === '10K-100K') rangeName = '<$100K'; // Combine with the first category
        else if (rangeName === '100K-1M') rangeName = '$100K-$1M';
        else if (rangeName === '1M-10M') rangeName = '$1M-$10M';
        else if (rangeName === '10M+') rangeName = '>$10M';
        
        // Add or update the range count
        if (!yearObj[rangeName]) {
          yearObj[rangeName] = item.permit_count;
        } else {
          yearObj[rangeName] += item.permit_count;
        }
      });
      
      result.push(yearObj);
    });
    
    return result;
  } catch (error) {
    console.error('Error processing valuation range data:', error);
    return [];
  }
};

/**
 * Load dashboard data
 * @returns {Promise<Object>} All data needed for the dashboard
 */
export const loadDashboardData = async () => {
  try {
    const [kpiData, chartData] = await Promise.all([
      fetchKPIData(),
      fetchChartData()
    ]);
    
    return {
      kpiData,
      chartData
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return {
      kpiData: {},
      chartData: {}
    };
  }
};

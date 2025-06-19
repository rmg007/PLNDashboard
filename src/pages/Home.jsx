import { useEffect, useState } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import '../styles/dashboard.css';
import '../styles/dashboard-custom.css';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar';
import DashboardMainContent from '../components/Dashboard/DashboardMainContent';
import { loadDashboardData } from '../services/dashboardDataService';

export default function Home() {
  const { setTitle } = useLayout();
  const [dashboardData, setDashboardData] = useState({
    kpiData: {},
    chartData: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTitle('Planning & Development Economics Indicators');
    
    // Load dashboard data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await loadDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      setTitle('Planning & Development Economics Indicators');
    };
  }, [setTitle]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg font-medium">Loading dashboard...</span>
        </div>
      ) : (
        <div className="w-full max-w-screen-2xl mx-auto px-4 py-6 dashboard-container" id='dashboard-container'>
          {/* Page Title - Enhanced for full-width layout */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex items-center">
              <div className="bg-blue-500 w-1 h-8 mr-3 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
          
          {/* Two-Panel Layout - With height alignment */}
          <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
            {/* Sidebar (25% width on large screens) */}
            <div className="w-full lg:w-1/4 dashboard-sidebar">
              <DashboardSidebar kpiData={dashboardData.kpiData} chartData={dashboardData.chartData} />
            </div>
            
            {/* Main Content (75% width on large screens) */}
            <div className="w-full lg:w-3/4">
              <DashboardMainContent chartData={dashboardData.chartData} />
            </div>
          </div>
          
          {/* Footer with attribution */}
          <footer className="mt-12 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Planning & Development Economics Indicators Dashboard © {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}

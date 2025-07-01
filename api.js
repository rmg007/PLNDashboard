const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Department Activity API calls
export const departmentAPI = {
  // Get all department activity data
  getActivity: async () => {
    const response = await fetch(`${API_BASE_URL}/departments/activity`);
    return handleResponse(response);
  },

  // Get department activity by weekday
  getActivityWeekday: async () => {
    const response = await fetch(`${API_BASE_URL}/departments/activity/weekday`);
    return handleResponse(response);
  },

  // Get activity by specific department
  getActivityByDepartment: async (department) => {
    const response = await fetch(`${API_BASE_URL}/departments/activity/${encodeURIComponent(department)}`);
    return handleResponse(response);
  }
};

// Permit API calls
export const permitAPI = {
  // Get yearly permits
  getYearlyPermits: async () => {
    const response = await fetch(`${API_BASE_URL}/permits/yearly`);
    return handleResponse(response);
  },

  // Get monthly permits
  getMonthlyPermits: async () => {
    const response = await fetch(`${API_BASE_URL}/permits/monthly`);
    return handleResponse(response);
  },

  // Get quarterly permits
  getQuarterlyPermits: async () => {
    const response = await fetch(`${API_BASE_URL}/permits/quarterly`);
    return handleResponse(response);
  },

  // Get yearly bins
  getYearlyBins: async () => {
    const response = await fetch(`${API_BASE_URL}/permits/yearly-bins`);
    return handleResponse(response);
  }
};

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard summary
  getSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`);
    return handleResponse(response);
  },

  // Get KPIs
  getKPIs: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/kpis`);
    return handleResponse(response);
  },

  // Get trends
  getTrends: async (years = 5) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/trends?years=${years}`);
    return handleResponse(response);
  }
}; 
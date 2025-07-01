const db = require("../config/database");

// Get dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    // Get total permits
    const totalPermitsResult = await db.query(
      "SELECT SUM(permit_count) as total FROM unique_permits_yearly"
    );
    
    // Get latest year data
    const latestYearResult = await db.query(
      "SELECT * FROM unique_permits_yearly ORDER BY fiscal_year DESC LIMIT 1"
    );
    
    // Get department totals
    const departmentTotalsResult = await db.query(`
      SELECT department, SUM(activity_count) as total_activity 
      FROM department_activity 
      GROUP BY department
    `);
    
    res.json({
      totalPermits: totalPermitsResult.rows[0].total,
      latestYear: latestYearResult.rows[0],
      departmentTotals: departmentTotalsResult.rows
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};

// Get KPIs
exports.getKPIs = async (req, res) => {
  try {
    // Year-over-year growth
    const yoyResult = await db.query(`
      WITH yearly_data AS (
        SELECT fiscal_year, permit_count,
               LAG(permit_count) OVER (ORDER BY fiscal_year) as prev_year_count
        FROM unique_permits_yearly
      )
      SELECT fiscal_year, permit_count, prev_year_count,
             ROUND(((permit_count - prev_year_count)::numeric / prev_year_count) * 100, 2) as growth_percentage
      FROM yearly_data
      WHERE prev_year_count IS NOT NULL
      ORDER BY fiscal_year DESC
      LIMIT 1
    `);
    
    // Average permits per month (current year)
    const avgMonthlyResult = await db.query(`
      SELECT AVG(permit_count) as avg_monthly_permits
      FROM unique_permits_monthly
      WHERE year = (SELECT MAX(year) FROM unique_permits_monthly)
    `);
    
    // Most active department
    const mostActiveResult = await db.query(`
      SELECT department, SUM(activity_count) as total_activity
      FROM department_activity
      GROUP BY department
      ORDER BY total_activity DESC
      LIMIT 1
    `);
    
    res.json({
      yearOverYearGrowth: yoyResult.rows[0] || null,
      avgMonthlyPermits: avgMonthlyResult.rows[0].avg_monthly_permits,
      mostActiveDepartment: mostActiveResult.rows[0]
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({ error: "Failed to fetch KPIs" });
  }
};

// Get trends
exports.getTrends = async (req, res) => {
  try {
    const { years = 5 } = req.query;
    
    // Yearly trend
    const yearlyTrend = await db.query(
      "SELECT * FROM unique_permits_yearly ORDER BY fiscal_year DESC LIMIT $1",
      [years]
    );
    
    // Department trends
    const departmentTrends = await db.query(`
      SELECT year, department, activity_count
      FROM department_activity
      WHERE year >= (SELECT MAX(year) - $1 FROM department_activity)
      ORDER BY year DESC, department
    `, [years - 1]);
    
    res.json({
      yearlyTrend: yearlyTrend.rows,
      departmentTrends: departmentTrends.rows
    });
  } catch (error) {
    console.error("Error fetching trends:", error);
    res.status(500).json({ error: "Failed to fetch trends" });
  }
};

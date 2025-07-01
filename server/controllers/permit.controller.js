const db = require("../config/database");

// Get all yearly permits
exports.getYearlyPermits = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT fiscal_year, permit_count FROM unique_permits_yearly ORDER BY fiscal_year DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching yearly permits:", error);
    res.status(500).json({ error: "Failed to fetch yearly permits" });
  }
};

// Get monthly permits
exports.getMonthlyPermits = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT year as fiscal_year, month, permit_count FROM unique_permits_monthly ORDER BY year DESC, month"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching monthly permits:", error);
    res.status(500).json({ error: "Failed to fetch monthly permits" });
  }
};

// Get quarterly permits
exports.getQuarterlyPermits = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT year as fiscal_year, quarter, permit_count FROM unique_permits_quarterly ORDER BY year DESC, quarter"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching quarterly permits:", error);
    res.status(500).json({ error: "Failed to fetch quarterly permits" });
  }
};

// Get yearly bins
exports.getYearlyBins = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT year, bin_range, permit_count FROM unique_permits_yearly_bins ORDER BY year DESC, bin_range"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching yearly bins:", error);
    res.status(500).json({ error: "Failed to fetch yearly bins" });
  }
};

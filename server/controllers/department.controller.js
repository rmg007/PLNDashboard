const db = require("../config/database");

// Get all department activity
exports.getDepartmentActivity = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM department_activity ORDER BY year DESC, department"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching department activity:", error);
    res.status(500).json({ error: "Failed to fetch department activity" });
  }
};

// Get department activity by weekday
exports.getDepartmentActivityWeekday = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM department_activity_weekday ORDER BY year DESC, department"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching weekday activity:", error);
    res.status(500).json({ error: "Failed to fetch weekday activity" });
  }
};

// Get activity by specific department
exports.getActivityByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const result = await db.query(
      "SELECT * FROM department_activity WHERE department = $1 ORDER BY year DESC",
      [department]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching activity by department:", error);
    res.status(500).json({ error: "Failed to fetch activity by department" });
  }
};

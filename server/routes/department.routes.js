const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/department.controller");

// Department Activity routes
router.get("/activity", departmentController.getDepartmentActivity);
router.get("/activity/weekday", departmentController.getDepartmentActivityWeekday);
router.get("/activity/:department", departmentController.getActivityByDepartment);

module.exports = router;

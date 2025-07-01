const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

// Dashboard summary routes
router.get("/summary", dashboardController.getDashboardSummary);
router.get("/kpis", dashboardController.getKPIs);
router.get("/trends", dashboardController.getTrends);

module.exports = router;

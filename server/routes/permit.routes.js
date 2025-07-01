const express = require("express");
const router = express.Router();
const permitController = require("../controllers/permit.controller");

// Unique Permits routes
router.get("/yearly", permitController.getYearlyPermits);
router.get("/monthly", permitController.getMonthlyPermits);
router.get("/quarterly", permitController.getQuarterlyPermits);
router.get("/yearly-bins", permitController.getYearlyBins);

module.exports = router;

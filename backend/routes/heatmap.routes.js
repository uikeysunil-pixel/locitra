const express = require("express");
const router = express.Router();
const heatmapController = require("../controllers/opportunityHeatmap.controller");
const { protect } = require("../middlewares/auth.middleware");

/**
 * GET /api/opportunity-heatmap
 * Calculates local SEO opportunity scores from existing scan data.
 * Access: Private (Auth required)
 */
router.get("/", protect, heatmapController.getOpportunityHeatmap);

/**
 * GET /api/opportunity-heatmap/export
 * Exports leads as CSV for paid users.
 * Access: Private (Auth required)
 */
router.get("/export", protect, heatmapController.exportLeadsCSV);

module.exports = router;

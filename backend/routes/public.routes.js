const express = require("express");
const router = express.Router();
const publicScanController = require("../controllers/publicScan.controller");
const publicRateLimiter = require("../middlewares/publicRateLimiter");
const { getPublishedBlogs, getPublishedBlogBySlug } = require("../controllers/blog.controller");

/**
 * Public discovery endpoint for Google Maps Rank Checker
 * POST /api/public-scan
 */
router.post("/public-scan", publicRateLimiter, publicScanController.handlePublicScan);

/**
 * Public report endpoint (Cached results)
 * GET /api/public/report/:slug
 */
router.get("/report/:slug", publicScanController.getPublicReport);
router.post("/report/:slug/lead", publicScanController.captureReportLead);

/**
 * Programmatic SEO scan endpoint (Cached results)
 * GET /api/seo-scan/:keyword/:city
 */
router.get("/seo-scan/:keyword/:city", publicScanController.handleSeoScan);

/**
 * Dynamic Sitemap XML generator
 * GET /api/sitemap.xml
 */
router.get("/sitemap.xml", publicScanController.getSitemap);

/**
 * Public Blog endpoints
 * GET /api/blogs         → all published blogs
 * GET /api/blogs/:slug   → single published blog by slug
 */
router.get("/blogs", getPublishedBlogs);
router.get("/blogs/:slug", getPublishedBlogBySlug);

module.exports = router;

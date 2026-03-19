const express = require("express")
const router = express.Router()
const { protect, requireAdmin } = require("../middlewares/auth.middleware")
const {
    getStats,
    getUsers,
    updateUserPlan,
    suspendUser,
    deleteUser,
    getScans,
    getCache,
    deleteCacheEntry,
    getApiUsage
} = require("../controllers/admin.controller")

// Apply protection to all admin routes
router.use(protect)
router.use(requireAdmin)

// System Overview
router.get("/stats", getStats)

// User Management
router.get("/users", getUsers)
router.patch("/user/:id/plan", updateUserPlan)
router.patch("/user/:id/suspend", suspendUser)
router.delete("/user/:id", deleteUser)

// Scan Monitoring
router.get("/scans", getScans)

// Cache Management
router.get("/cache", getCache)
router.delete("/cache/:id", deleteCacheEntry)

// API Usage
router.get("/api-usage", getApiUsage)

module.exports = router

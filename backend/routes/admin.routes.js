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
    getApiUsage,
    syncSystem
} = require("../controllers/admin.controller")
const {
    generateBlog,
    createBlog,
    updateBlog,
    getAllBlogs,
    getBlogById,
    deleteBlog
} = require("../controllers/blog.controller")

// Apply protection to all admin routes
router.use(protect)
router.use(requireAdmin)

// System Overview
router.get("/stats", getStats)
router.post("/sync", syncSystem)

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

// ── Blog Writer (Admin Only) ──────────────────────────────
router.post("/blog/generate", generateBlog)
router.get("/blog", getAllBlogs)
router.post("/blog", createBlog)
router.get("/blog/:id", getBlogById)
router.put("/blog/:id", updateBlog)
router.delete("/blog/:id", deleteBlog)

module.exports = router

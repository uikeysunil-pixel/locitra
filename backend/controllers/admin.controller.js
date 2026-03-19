const User = require("../models/user.model")
const Lead = require("../models/lead.model")
const Business = require("../models/business.model")
const ScanCache = require("../models/scanCache.model")
const ScanLog = require("../models/scanLog.model")
const { getUsage } = require("../utils/serpClient")
const plansConfig = require("../config/plans")

// @desc    Get system-wide statistics (Enhanced)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments()
        const activeUsers = await User.countDocuments({ status: "active" }) // Assuming status field exists or default active
        const totalLeads = await Lead.countDocuments()
        const totalCachedMarkets = await ScanCache.countDocuments()
        
        // Detailed scan stats from ScanLog
        const totalScans = await ScanLog.countDocuments()
        
        // Cache hit rate (last 100 scans)
        const last100Scans = await ScanLog.find().sort({ createdAt: -1 }).limit(100)
        const cacheHits = last100Scans.filter(s => s.source === "cache").length
        const cacheHitRate = last100Scans.length > 0 ? (cacheHits / last100Scans.length) * 100 : 0

        const serpUsage = getUsage()

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                totalLeads,
                totalCachedMarkets,
                totalScans,
                serpCallsToday: serpUsage.today,
                cacheHitRate: Math.round(cacheHitRate)
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Get all users (Enhanced)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 })
        res.json({ success: true, users })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Update user plan
// @route   PATCH /api/admin/user/:id/plan
// @access  Private/Admin
exports.updateUserPlan = async (req, res) => {
    try {
        const { plan } = req.body
        if (!plansConfig[plan]) {
            return res.status(400).json({ success: false, message: "Invalid plan type" })
        }

        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        user.plan = plan
        await user.save()
        res.json({ success: true, message: `Plan updated to ${plan}` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Suspend/Unsuspend user
// @route   PATCH /api/admin/user/:id/suspend
// @access  Private/Admin
exports.suspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        user.status = user.status === "suspended" ? "active" : "suspended"
        await user.save()
        res.json({ success: true, message: `User status changed to ${user.status}`, status: user.status })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        await User.findByIdAndDelete(req.params.id)
        res.json({ success: true, message: "User deleted successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Get all scans monitoring (Enhanced)
// @route   GET /api/admin/scans
// @access  Private/Admin
exports.getScans = async (req, res) => {
    try {
        const scans = await ScanLog.find({})
            .sort({ createdAt: -1 })
            .limit(100)
            
        res.json({ success: true, scans })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Get cache entries
// @route   GET /api/admin/cache
// @access  Private/Admin
exports.getCache = async (req, res) => {
    try {
        const cache = await ScanCache.find({}).sort({ createdAt: -1 }).limit(100)
        const formatted = cache.map(c => ({
            _id: c._id,
            keyword: c.keyword,
            location: c.location || c.city,
            resultsCount: c.results ? c.results.length : 0,
            createdAt: c.createdAt
        }))
        res.json({ success: true, cache: formatted })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Delete specific cache entry
// @route   DELETE /api/admin/cache/:id
// @access  Private/Admin
exports.deleteCacheEntry = async (req, res) => {
    try {
        await ScanCache.findByIdAndDelete(req.params.id)
        res.json({ success: true, message: "Cache entry deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Get API Usage monitoring
// @route   GET /api/admin/api-usage
// @access  Private/Admin
exports.getApiUsage = async (req, res) => {
    try {
        const serpUsage = getUsage()
        
        // Monthly breakdown from logs (approximation)
        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0,0,0,0)
        
        const monthlyLogs = await ScanLog.find({ 
            source: "serpapi",
            createdAt: { $gte: monthStart }
        })

        const cacheLogs = await ScanLog.find({
            createdAt: { $gte: monthStart }
        })

        const cacheHits = cacheLogs.filter(l => l.source === "cache").length
        const totalAttempts = cacheLogs.length

        res.json({
            success: true,
            usage: {
                serpCallsToday: serpUsage.today,
                serpCallsThisMonth: serpUsage.month,
                serpCallsLogMonth: monthlyLogs.length, // Verified from our custom logs
                cacheHitsMonth: cacheHits,
                cacheMissRate: totalAttempts > 0 ? Math.round(((totalAttempts - cacheHits) / totalAttempts) * 100) : 0
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const WatchMarket = require("../models/watchMarket.model")
const { runAutoProspecting } = require("../services/prospecting/autoProspector")

// @route  GET /api/watch
exports.listWatches = async (req, res) => {
    try {
        const watches = await WatchMarket.find({ userId: req.user._id }).sort({ createdAt: -1 })
        res.json({ success: true, data: watches })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// @route  POST /api/watch
exports.addWatch = async (req, res) => {
    try {
        const { keyword, city } = req.body
        if (!keyword || !city) return res.status(400).json({ success: false, message: "keyword and city are required" })

        const watch = await WatchMarket.create({
            userId: req.user._id,
            keyword: keyword.toLowerCase().trim(),
            city: city.toLowerCase().trim()
        })
        res.status(201).json({ success: true, data: watch })
    } catch (err) {
        // Duplicate key = market already watched
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: "You are already watching this market." })
        }
        res.status(500).json({ success: false, message: err.message })
    }
}

// @route  DELETE /api/watch/:id
exports.removeWatch = async (req, res) => {
    try {
        const watch = await WatchMarket.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
        if (!watch) return res.status(404).json({ success: false, message: "Watch not found" })
        res.json({ success: true, message: "Watch removed" })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// @route  POST /api/watch/run
// @desc   Manually trigger auto-prospecting (admin/cron endpoint)
exports.triggerProspecting = async (req, res) => {
    try {
        const result = await runAutoProspecting()
        res.json({ success: true, ...result })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

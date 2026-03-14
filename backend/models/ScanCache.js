const mongoose = require("mongoose")

const scanCacheSchema = new mongoose.Schema({
    keyword: { type: String, required: true },
    location: { type: String, required: true },
    results: { type: Array, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // 7 days
    }
})

// Performance optimization: Indexes for fast queries
scanCacheSchema.index({ keyword: 1, location: 1 })

const ScanCache = mongoose.model("ScanCache", scanCacheSchema)

module.exports = ScanCache

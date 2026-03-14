const mongoose = require("mongoose")

const scanCacheSchema = new mongoose.Schema({
    queryKey: { type: String, unique: true, sparse: true },
    keyword: { type: String, required: true },
    location: { type: String },
    city: { type: String },
    country: { type: String },
    results: { type: Array, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // 7 days
    }
})

// Performance optimization: Indexes for fast queries
scanCacheSchema.index({ keyword: 1, location: 1 })
scanCacheSchema.index({ keyword: 1, city: 1 })

module.exports = mongoose.models.ScanCache || mongoose.model("ScanCache", scanCacheSchema)

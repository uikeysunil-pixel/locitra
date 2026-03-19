const mongoose = require("mongoose")

const scanLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false // Optional if it's a free scan or public scan
    },
    userEmail: String,
    keyword: {
        type: String,
        required: true
    },
    location: String,
    source: {
        type: String,
        enum: ["cache", "serpapi"],
        required: true
    },
    resultsCount: {
        type: Number,
        default: 0
    },
    error: String
}, { timestamps: true })

// Index for performance on admin queries
scanLogSchema.index({ createdAt: -1 })
scanLogSchema.index({ userEmail: 1 })

module.exports = mongoose.models.ScanLog || mongoose.model("ScanLog", scanLogSchema)

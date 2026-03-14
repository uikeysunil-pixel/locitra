const mongoose = require("mongoose")

const watchMarketSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        keyword: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        city: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        lastScanDate: {
            type: Date,
            default: null          // null = never scanned yet
        },
        newLeadsFound: {
            type: Number,
            default: 0
        },
        totalScans: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

// Prevent a user watching the same keyword+city twice
watchMarketSchema.index({ userId: 1, keyword: 1, city: 1 }, { unique: true })

module.exports = mongoose.model("WatchMarket", watchMarketSchema)

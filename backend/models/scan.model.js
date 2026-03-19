const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
    {
        keyword: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        queryKey: {
            type: String,
            required: true
        },
        history: [
            {
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                businesses: [
                    {
                        name: String,
                        rank: Number,
                        rating: Number,
                        reviews: Number
                    }
                ]
            }
        ],
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 60 * 60 * 24 * 90 // ⏳ auto-delete after 90 days
        }
    },
    {
        timestamps: true // ✅ adds createdAt & updatedAt automatically
    }
);

// 🚀 OPTIONAL (SAFE): ensure index in background (no duplicate issue)
scanSchema.index({ queryKey: 1 }, { unique: true, background: true });

module.exports = mongoose.model("Scan", scanSchema);
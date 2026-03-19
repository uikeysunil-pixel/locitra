const mongoose = require("mongoose");

const opportunityAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
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
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    rank: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    reviews: {
        type: Number,
        required: true
    },
    opportunityScore: {
        type: String,
        enum: ["High", "Medium", "Low"],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // Auto-delete after 30 days
    }
});

// Compound index to prevent duplicate alerts for the same business in the same market for a user
opportunityAlertSchema.index({ userId: 1, businessName: 1, city: 1, keyword: 1 }, { unique: true });

module.exports = mongoose.model("OpportunityAlert", opportunityAlertSchema);

const mongoose = require('mongoose');

const enrichmentCacheSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    city: { type: String, required: true },
    website: { type: String, default: "" },
    email: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    contactPage: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

// Auto-delete documents when expiresAt is reached
enrichmentCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index to find unique cache entries
enrichmentCacheSchema.index({ businessName: 1, city: 1 }, { unique: true });

module.exports = mongoose.models.EnrichmentCache || mongoose.model("EnrichmentCache", enrichmentCacheSchema);

const mongoose = require('mongoose');

const scanCacheSchema = new mongoose.Schema({
    queryKey: { type: String, required: true, unique: true },
    keyword: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: false },
    results: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

// Auto-delete documents when expiresAt is reached
scanCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ScanCache = mongoose.model('ScanCache', scanCacheSchema);

module.exports = ScanCache;

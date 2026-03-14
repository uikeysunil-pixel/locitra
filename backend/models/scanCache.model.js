const mongoose = require('mongoose');

const scanCacheSchema = new mongoose.Schema({
    queryKey: { type: String, required: true, unique: true },
    keyword: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: false },
    results: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now, expires: 604800 }
});

// Auto-delete documents when createdAt + expires reach the threshold
// mongoose handle this with the expires property on field

const ScanCache = mongoose.model('ScanCache', scanCacheSchema);

module.exports = ScanCache;

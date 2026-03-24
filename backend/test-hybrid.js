require('dotenv').config();
const connectDB = require('./config/db.js');
const { runHybridEnrichment } = require('./services/hybridEnrichment.service.js');
const mongoose = require('mongoose');

async function test() {
    try {
        await connectDB();
        await runHybridEnrichment();
    } catch (err) {
        console.error("Test failed", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
test();

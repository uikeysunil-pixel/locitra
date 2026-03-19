const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const Business = require('../backend/models/business.model');
const { scanBusinesses } = require('../backend/services/data/businessScanner');

async function testCacheLogic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const keyword = 'dentist';
        const location = 'chicago';

        console.log(`\n--- Testing Cache Lookup for "${keyword}" in "${location}" ---`);
        
        // 1. Check if records exist
        const count = await Business.countDocuments({
            keyword: keyword.toLowerCase(),
            location: location.toLowerCase()
        });
        console.log(`Records in DB: ${count}`);

        if (count > 0) {
            console.log('PASSED: Data exists in cache.');
        } else {
            console.log('WARNING: No data in cache for this test. Consider seeding first.');
        }

        // 2. We can't easily call the controller without a full Express app,
        // but we can verify the scanner internal cache fix.
        console.log('\n--- Testing Scanner Internal Cache ---');
        const results = await scanBusinesses(keyword, location, 10);
        console.log(`Scanner returned ${results.length} results.`);
        
        // If it was a cache hit, it should be fast and return data from DB
        // We can check logs of the running backend to see the "Cache hit" messages.

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

testCacheLogic();

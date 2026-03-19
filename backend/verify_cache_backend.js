const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const Business = require('./models/business.model');
const { scanBusinesses } = require('./services/data/businessScanner');

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
            console.log('SUCCESS: Data exists in cache.');
        } else {
            console.log('INFO: No data in cache for this specific test pair. This is fine if DB is empty.');
        }

        // 2. Test scanner internal cache logic (with the fix)
        console.log('\n--- Testing Scanner Internal Cache (with fixes) ---');
        // We set limit to 1 to minimize API usage if it misses
        const results = await scanBusinesses(keyword, location, 5);
        console.log(`Scanner returned ${results.length} results.`);
        
        console.log('\nVerification complete. Check logs above for "Cache hit" messages.');

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

testCacheLogic();

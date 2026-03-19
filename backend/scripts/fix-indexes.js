const mongoose = require('mongoose');
require('dotenv').config();
const Scan = require('../models/scan.model');

async function fixIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const collection = mongoose.connection.collection('scans');
        
        console.log('Current indexes:');
        const indexes = await collection.indexes();
        console.log(JSON.stringify(indexes, null, 2));

        // Safest approach: Drop all indexes (except _id) and let Mongoose rebuild them
        console.log('Dropping all indexes for "scans" collection to ensure a clean state...');
        await collection.dropIndexes();
        console.log('Indexes dropped.');

        console.log('Rebuilding indexes via Mongoose syncIndexes()...');
        await Scan.syncIndexes();
        
        const newIndexes = await collection.indexes();
        console.log('New indexes:');
        console.log(JSON.stringify(newIndexes, null, 2));

        console.log('SUCCESS: Indexes fixed and synchronized.');
    } catch (error) {
        console.error('ERROR fixing indexes:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

fixIndexes();

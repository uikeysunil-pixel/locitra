const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

const Scan = require('./backend/models/scan.model');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const queryKey = 'dentist_chicago';
        const scan = await Scan.findOne({ queryKey });

        if (scan) {
            console.log('Found scan for dentist_chicago');
            console.log('Keyword:', scan.keyword);
            console.log('City:', scan.city);
            console.log('History count:', scan.history.length);
            if (scan.history.length > 0) {
                const latest = scan.history[scan.history.length - 1];
                console.log('Latest snapshot business count:', latest.businesses.length);
                console.log('First business:', latest.businesses[0]);
            }
        } else {
            console.log('No scan found for dentist_chicago');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

verify();

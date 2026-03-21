const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/uikey/OneDrive/Desktop/locitra/backend/.env' });
const Business = require('c:/Users/uikey/OneDrive/Desktop/locitra/backend/models/business.model');

async function createMockBusiness() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const mockData = {
            name: 'Starbucks',
            city: 'chicago',
            address: '100 State St, Chicago, IL 60601',
            website: 'https://www.starbucks.com',
            facebook: 'https://facebook.com/starbucks',
            instagram: 'https://instagram.com/starbucks',
            linkedin: 'https://linkedin.com/company/starbucks',
            email: 'contact@starbucks.com',
            rating: 4.5,
            reviews: 1200,
            category: 'Coffee Shop'
        };

        console.log('Upserting mock business...');
        await Business.findOneAndUpdate(
            { name: mockData.name, city: mockData.city },
            { $set: mockData },
            { upsert: true, new: true }
        );

        console.log('✅ Mock business created/updated!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createMockBusiness();

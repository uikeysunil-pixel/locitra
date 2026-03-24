require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Business = require('../models/business.model');

async function migrate() {
    try {
        const conn = await connectDB();
        
        // 1. LOG DATABASE CONNECTION
        const dbName = mongoose.connection.db.databaseName;
        const host = conn.connection.host;
        console.log("Connected DB:", dbName, "at Host:", host);
        console.log("Collection Name:", Business.collection.collectionName);

        console.log("Starting migration: contact -> outreach");

        // 7. REMOVE LIMIT
        const businesses = await Business.find({ contact: { $exists: true } });
        console.log(`Found ${businesses.length} businesses to check for migration.`);

        let migratedCount = 0;

        for (const business of businesses) {
            // 2. FETCH AND LOG SAMPLE RECORD (Before migration)
            console.log(`\n--- Processing Business: ${business.name || business._id} ---`);
            console.log("BEFORE:", {
                name: business.name,
                contact: business.get('contact'),
                outreach: business.get('outreach')
            });

            // 3. VALIDATE SOURCE DATA
            const contact = business.get('contact') || {};
            const outreach = business.get('outreach') || {};
            const cSocials = contact.socials || {};
            
            if (!contact.email && Object.keys(cSocials).length === 0 && !contact.phone && !contact.website && !contact.contactPage) {
                console.log("No source data to migrate");
                continue;
            }

            let needsUpdate = false;
            const updateFields = {};

            // 9. CHECK FIELD PATH CORRECTNESS
            if (contact.email && !outreach.email) {
                updateFields['outreach.email'] = contact.email;
                needsUpdate = true;
            }
            if (contact.phone && !outreach.phone) {
                updateFields['outreach.phone'] = contact.phone;
                needsUpdate = true;
            }
            if (contact.website && !outreach.website) {
                updateFields['outreach.website'] = contact.website;
                needsUpdate = true;
            }
            if (contact.contactPage && !outreach.contactPage) {
                updateFields['outreach.contactPage'] = contact.contactPage;
                needsUpdate = true;
            }

            const oSocials = outreach.socials || {};

            if (cSocials.facebook && !oSocials.facebook) {
                updateFields['outreach.socials.facebook'] = cSocials.facebook;
                needsUpdate = true;
            }
            if (cSocials.instagram && !oSocials.instagram) {
                updateFields['outreach.socials.instagram'] = cSocials.instagram;
                needsUpdate = true;
            }
            if (cSocials.linkedin && !oSocials.linkedin) {
                updateFields['outreach.socials.linkedin'] = cSocials.linkedin;
                needsUpdate = true;
            }
            if (cSocials.twitter && !oSocials.twitter) {
                updateFields['outreach.socials.twitter'] = cSocials.twitter;
                needsUpdate = true;
            }

            // 8. FORCE TEST UPDATE (CRITICAL)
            updateFields['outreach.testField'] = "debug123";
            needsUpdate = true;

            // 4. TRACK UPDATE PAYLOAD
            console.log("UPDATE PAYLOAD:", updateFields);

            if (needsUpdate) {
                // 5. VERIFY UPDATE RESULT
                const result = await Business.updateOne(
                    { _id: business._id },
                    { $set: updateFields },
                    { strict: false }
                );
                
                console.log("Mongo Result:", result);

                // 6. FETCH AGAIN AFTER UPDATE
                const updated = await Business.findById(business._id);
                console.log("AFTER:", {
                    outreach: updated.get('outreach')
                });

                migratedCount++;
            }
        }

        console.log(`\nSuccessfully migrated ${migratedCount} records.`);
        
        // 10. FINAL VALIDATION LOG
        console.log("Migration completed successfully");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrate();

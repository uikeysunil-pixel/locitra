const mongoose = require("mongoose");
require("dotenv").config();
const Scan = require("./models/scan.model");

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const queryKey = "dentist_chicago";
        const snapshot = {
            timestamp: new Date(),
            businesses: [
                { rank: 1, name: "Chicago Smile Design", rating: 4.8, reviews: 450 },
                { rank: 2, name: "Downtown Dental", rating: 4.7, reviews: 320 },
                { rank: 3, name: "Loop Dental", rating: 4.6, reviews: 210 },
                { rank: 4, name: "Weak Dentist A", rating: 4.0, reviews: 15 }, // High Opp (Rating < 4.2, Reviews < 50, Rank 4-10)
                { rank: 5, name: "Weak Dentist B", rating: 4.1, reviews: 45 }, // High Opp
                { rank: 6, name: "Medium Dentist C", rating: 4.5, reviews: 30 }, // Medium Opp (Reviews < 50, Rank 4-10)
                { rank: 7, name: "Strong Dentist D", rating: 4.9, reviews: 150 }, // Low Opp (Rank 4-10, but good stats)
                { rank: 8, name: "High Opp E", rating: 3.5, reviews: 12 }, // High Opp
                { rank: 11, name: "Far Away Weak", rating: 3.8, reviews: 5 } // Rank > 10
            ]
        };

        await Scan.findOneAndUpdate(
            { queryKey },
            { 
                keyword: "dentist",
                city: "chicago",
                $push: { history: snapshot }
            },
            { upsert: true, new: true }
        );

        console.log("Successfully seeded dentist_chicago data");
        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
}

seed();

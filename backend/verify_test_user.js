const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/user.model");

async function verifyUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = "test@locitra.com";
        const result = await User.updateOne(
            { email },
            { $set: { emailVerified: true, plan: "free" } }
        );

        if (result.matchedCount === 0) {
            console.log(`User ${email} not found.`);
        } else {
            console.log(`Successfully verified user: ${email}`);
        }
        process.exit(0);
    } catch (err) {
        console.error("Verification error:", err);
        process.exit(1);
    }
}

verifyUser();

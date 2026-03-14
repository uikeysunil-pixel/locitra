const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...")
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
        return conn
    } catch (error) {
        console.error("❌ MongoDB connection error details:")
        console.error(error)
        // We do NOT call process.exit(1) here anymore.
        // Let server.js handle the failure to start if DB is critical.
        throw error
    }
}

module.exports = connectDB
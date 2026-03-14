const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const connectDB = require("./config/db")

const searchRoutes = require("./routes/search.routes")
const marketRoutes = require("./routes/market.routes")
const prospectRoutes = require("./routes/prospect.routes")
const dashboardRoutes = require("./routes/dashboard.routes")
const gapRoutes = require("./routes/gap.routes")
const alertsRoutes = require("./routes/alerts.routes")
const advisorRoutes = require("./routes/advisor.routes")
const leadsRoutes = require("./routes/leads.routes")
const outreachRoutes = require("./routes/outreach.routes")
const cityScannerRoutes = require("./routes/cityScanner.routes")
const authRoutes = require("./routes/auth.routes")
const crmLeadsRoutes = require("./routes/crmLeads.routes")
const analyticsRoutes = require("./routes/analytics.routes")
const reportsRoutes = require("./routes/reports.routes")
const billingRoutes = require("./routes/billing.routes")
const freeScanRoutes = require("./routes/freeScan.routes")
const watchMarketRoutes = require("./routes/watchMarket.routes")
const enrichRoutes = require("./routes/enrich.routes")

// Validate critical environment variables
const requiredEnv = ["MONGO_URI", "JWT_SECRET", "SERPAPI_KEY"]
const missingEnv = requiredEnv.filter(env => !process.env[env])

if (missingEnv.length > 0) {
    console.error(`❌ CRITICAL ERROR: Missing environment variables: ${missingEnv.join(", ")}`)
    console.warn("Please check your .env file or Render environment settings.")
    // We log but don't exit here to let the process stay alive for logs, 
    // but the app might fail later if these are used.
}

const app = express()

// Health check route (must be early to ensure Render sees it even if other routes have issues)
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Locitra backend is up and running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        db_connected: mongoose.connection.readyState === 1
    })
})

// Middleware
app.use(cors())
app.use(express.json())

// API Routes (Prefix all with /api)
app.use("/api/search", searchRoutes)
app.use("/api/market", marketRoutes)
app.use("/api/prospects", prospectRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/gaps", gapRoutes)
app.use("/api/alerts", alertsRoutes)
app.use("/api/advisor", advisorRoutes)
app.use("/api/leads", leadsRoutes)
app.use("/api/outreach", outreachRoutes)
app.use("/api/scanner", cityScannerRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/crm", crmLeadsRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/reports", reportsRoutes)
app.use("/api/billing", billingRoutes)
app.use("/api/free-scan", freeScanRoutes)
app.use("/api/watch", watchMarketRoutes)
app.use("/api/enrich", enrichRoutes)

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ UNHANDLED ERROR:", err)
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message
    })
})

// Start server function
const startServer = async () => {
    const PORT = process.env.PORT || 5000
    
    try {
        console.log("🚀 Starting Locitra backend...")
        
        // Ensure MongoDB is connected before listening
        await connectDB()
        
        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`)
            console.log(`🔗 Health check: http://localhost:${PORT}/`)
        })
    } catch (error) {
        console.error("❌ Failed to start server:", error)
        // Instead of exiting, we keep the process alive so Render logs can be read
        // Render will eventually restart if health check fails.
    }
}

// Global Rejection Handlers
process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason)
})

process.on("uncaughtException", (error) => {
    console.error("🚨 Uncaught Exception:", error)
})

startServer()
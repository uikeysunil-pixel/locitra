const express = require("express")
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

const app = express()

// Connect MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
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
app.use("/api/free-scan", freeScanRoutes)   // public — no auth required
app.use("/api/watch", watchMarketRoutes)
app.use("/api/enrich", enrichRoutes)

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "Locitra backend running",
        port: process.env.PORT || 5000
    })
})

// Start server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`🚀 Locitra backend running on port ${PORT}`)
})
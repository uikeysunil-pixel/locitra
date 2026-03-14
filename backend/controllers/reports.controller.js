const Lead = require("../models/lead.model")
const ScanCache = require("../models/scanCache.model")
const { generatePDF, generateCSV } = require("../services/reports/reportGenerator")
const { scanResultsCache } = require("../services/reports/scanResultsCache")

// @route  GET /api/reports/pdf
// @access Private
exports.downloadPDF = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const cachedResults = scanResultsCache[userId];

        if (!cachedResults || cachedResults.length === 0) {
            return res.status(400).send("No scan results available. Please run a market scan before generating a report.");
        }

        const options = {
            companyName: req.query.company || req.user.companyName || "Your Agency",
            customMessage: req.query.message || "",
            keyword: req.query.keyword || "Business",
            city: req.query.city || "",
            scanResults: cachedResults
        }

        await generatePDF([], options, res) // Pass empty array for the deprecated savedLeads param
    } catch (err) {
        console.error("[Reports] PDF error:", err.message)
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to generate PDF" })
        }
    }
}

// @route  GET /api/reports/csv
// @access Private
exports.downloadCSV = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const cachedResults = scanResultsCache[userId];

        if (!cachedResults || cachedResults.length === 0) {
            return res.status(400).send("No scan results available. Please run a market scan before generating a report.");
        }

        const csv = generateCSV(cachedResults)

        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment; filename=\"Locitra-Report.csv\"")
        res.send(csv)
    } catch (err) {
        console.error("[Reports] CSV error:", err.message)
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to generate CSV" })
        }
    }
}

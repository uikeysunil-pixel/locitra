const Lead = require("../models/lead.model")
const Scan = require("../models/scan.model")
const ScanCache = require("../models/scanCache.model")
const { generatePDF, generateCSV } = require("../services/reports/reportGenerator")
const { scanResultsCache } = require("../services/reports/scanResultsCache")

// @route  GET /api/reports/pdf
// @access Private
exports.downloadPDF = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const getQ = (v) => Array.isArray(v) ? v[0] : v;
        let { reportId, keyword, city, company, message, companyName, customMessage, logoUrl, primaryColor } = req.query;
        reportId = getQ(reportId);
        keyword = getQ(keyword);
        city = getQ(city);
        company = getQ(company);
        message = getQ(message);
        companyName = getQ(companyName);
        customMessage = getQ(customMessage);
        logoUrl = getQ(logoUrl);
        primaryColor = getQ(primaryColor);
        
        console.log(
            `[Reports] Generating PDF request for user: ${userId}, reportId: ${reportId}, keyword: ${keyword}, city: ${city}, companyName: ${companyName || company || ""}`
        );

        // 1. Validation
        if (!reportId && (!keyword || !city)) {
            return res.status(400).json({
                success: false,
                message: "Missing report identification. Provide reportId or keyword+city."
            });
        }

        let cachedResults = scanResultsCache[userId];
        let reportData = null;

        // 2. Try to find by reportId (slug) if provided
        if (reportId) {
            // Normalize slug to queryKey (hyphens to underscores)
            const queryKey = reportId.replace(/-/g, '_').toLowerCase();
            reportData = await Scan.findOne({ queryKey });
            
            if (reportData && reportData.history && reportData.history.length > 0) {
                cachedResults = reportData.history[reportData.history.length - 1].businesses;
                console.log(`[Reports] Found report by reportId slug: ${queryKey}`);
            }
        }

        // 3. Fallback to keyword/city lookup
        if ((!cachedResults || cachedResults.length === 0) && keyword && city) {
            const queryKey = `${keyword.trim().toLowerCase()}_${city.trim().toLowerCase()}`;
            reportData = await Scan.findOne({ queryKey });
            
            if (reportData && reportData.history && reportData.history.length > 0) {
                cachedResults = reportData.history[reportData.history.length - 1].businesses;
                console.log(`[Reports] Using keyword/city fallback for queryKey: ${queryKey}`);
            }
        }

        // 4. Final check
        if (!cachedResults || cachedResults.length === 0) {
            console.warn(`[Reports] No results found for PDF generation.`);
            return res.status(404).json({ 
                success: false, 
                message: "No report data found. Please run a market scan from the dashboard first." 
            });
        }

        const options = {
            companyName: companyName || company || req.user.companyName || "Your Agency",
            customMessage: customMessage || message || "",
            keyword: keyword || (reportData ? reportData.keyword : "Business"),
            city: city || (reportData ? reportData.city : ""),
            logoUrl: logoUrl || "",
            primaryColor: primaryColor || "",
            scanResults: cachedResults
        }

        await generatePDF([], options, res) 
    } catch (err) {
        console.error("[Reports] Controller PDF generation error:", {
            message: err?.message,
            stack: err?.stack
        })
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                message: "Internal server error during PDF generation",
                error: err.message
            })
        }
    }
}

// @route  GET /api/reports/csv
// @access Private
exports.downloadCSV = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { reportId, keyword, city } = req.query;
        
        let cachedResults = scanResultsCache[userId];
        
        if (reportId) {
            const queryKey = reportId.replace(/-/g, '_');
            const reportData = await Scan.findOne({ queryKey });
            if (reportData && reportData.history && reportData.history.length > 0) {
                cachedResults = reportData.history[reportData.history.length - 1].businesses;
            }
        }

        if ((!cachedResults || cachedResults.length === 0) && keyword && city) {
            const queryKey = `${keyword.trim().toLowerCase()}_${city.trim().toLowerCase()}`;
            const existingScan = await Scan.findOne({ queryKey });
            if (existingScan && existingScan.history && existingScan.history.length > 0) {
                cachedResults = existingScan.history[existingScan.history.length - 1].businesses;
            }
        }

        if (!cachedResults || cachedResults.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No report data found to export." 
            });
        }

        const csv = generateCSV(cachedResults)

        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment; filename=\"Locitra-Report.csv\"")
        res.send(csv)
    } catch (err) {
        console.error("[Reports] CSV generation critical error:", err)
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                message: "Server error during CSV generation",
                error: err.message
            })
        }
    }
}

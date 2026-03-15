const ScanCache = require("../models/scanCache.model")
const { analyzeBusiness } = require("../services/seoAnalyzer")
const { analyzeMarket } = require("../services/marketAnalyzer")
const { scanBusinesses } = require("../services/data/businessScanner")

exports.searchBusinesses = async (req, res) => {
    console.log("Scan request received")
    try {
        let { keyword, location } = req.query

        if (!keyword || !location) {
            return res.status(400).json({
                error: "Keyword and location required"
            })
        }

        // STEP 2 — Normalize Search Input
        keyword = keyword.toLowerCase().trim()
        location = location.toLowerCase().trim()

        console.log(`Searching for ${keyword} in ${location}`)

        // STEP 3 — Check Cache First
        console.log("Checking MongoDB cache")
        const cached = await ScanCache.findOne({
            keyword,
            location
        })

        if (cached) {
            console.log("Cache hit")
            console.log("Returning MongoDB cached results")
            return res.json({
                source: "cache",
                results: cached.results
            })
        }

        // STEP 4 — Call SERP API Only If Needed
        console.log("Cache miss")
        console.log("Cache miss → calling SERP API")

        // Use the business scanner to fetch fresh data
        const scannedResults = await scanBusinesses(keyword, location)

        // STEP 5 — Save Results in Cache
        console.log("Saving scan results")
        await ScanCache.create({
            keyword,
            location,
            results: scannedResults
        })

        // Map through results to ensure SEO analysis is applied
        // (Maintaining frontend API contract)
        const businesses = scannedResults.map((business) => {
            const analysis = analyzeBusiness(business)
            return {
                ...business,
                ...analysis
            }
        })

        const leads = businesses.filter(
            b => b.opportunity === "High" || b.opportunity === "Medium"
        )

        const marketAnalysis = analyzeMarket(businesses)

        console.log(`Scan complete. Found ${businesses.length} businesses, ${leads.length} leads.`)

        // STEP 8 — Response Format
        res.json({
            results: businesses, // User explicitly requested { results: [...] } in Step 8 example, 
                                 // but also said "Return response exactly as before".
                                 // "before" had businesses, leads, etc.
                                 // However, Step 3 example shows returning { source: "cache", results: cached.results }
                                 // I will provide both to be safe and match the "exactly as before" rule.
            totalBusinesses: businesses.length,
            totalLeads: leads.length,
            marketAnalysis,
            leads
        })

    } catch (error) {
        console.error("Search error:", error.message)
        res.status(500).json({
            error: "Search failed",
            message: error.message
        })
    }
}
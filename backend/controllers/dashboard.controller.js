const Business = require("../models/business.model")
const { analyzeMarket } = require("../services/marketAnalyzer")

exports.getDashboardData = async (req, res) => {

    try {

        const { keyword, location } = req.query

        const businesses = await Business.find({ keyword, location })

        if (!businesses.length) {
            return res.json({
                message: "No data found for this market"
            })
        }

        const leads = businesses.filter(b =>
            b.opportunity === "High" || b.opportunity === "Medium"
        )

        const prospects = businesses.filter(b =>
            b.seoScore < 80
        )

        const marketAnalysis = analyzeMarket(businesses)

        res.json({
            keyword,
            location,
            totalBusinesses: businesses.length,
            totalLeads: leads.length,
            totalProspects: prospects.length,
            marketAnalysis,
            businesses,
            leads,
            prospects
        })

    } catch (error) {

        console.error(error.message)

        res.status(500).json({
            error: "Failed to load dashboard"
        })

    }

}
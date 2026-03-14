const Lead = require("../models/lead.model")

// @route  GET /api/analytics
// @access Private
exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id

        const [total, highOpp, noWebsite, contacted] = await Promise.all([
            Lead.countDocuments({ userId }),
            Lead.countDocuments({ userId, opportunityScore: { $gte: 70 } }),
            Lead.countDocuments({ userId, website: { $in: ["", null] } }),
            Lead.countDocuments({ userId, status: { $in: ["Contacted", "Interested", "Meeting", "Closed"] } })
        ])

        res.json({
            success: true,
            metrics: {
                totalLeads: total,
                highOpportunity: highOpp,
                noWebsiteLeads: noWebsite,
                leadsContacted: contacted
            }
        })
    } catch (err) {
        console.error("[Analytics] error:", err.message)
        res.status(500).json({ success: false, message: "Failed to fetch analytics" })
    }
}

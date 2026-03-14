const { generateAudit } = require("../services/ai/seoAuditEngine")
const { generateOutreach, generateAIColdEmail } = require("../services/ai/outreachGenerator")

// @route  POST /api/outreach/generate
// @access Private
exports.generateOutreachForLead = async (req, res) => {
    try {
        const payload = req.body

        if (!payload || !payload.name) {
            // Also check for businessName for the new API
            if (!payload.businessName) {
                return res.status(400).json({ success: false, message: "Business data required" })
            }
        }

        // New format: If AI parameters are passed, use the new API
        if (payload.businessName || payload.weakSignals) {
            const aiResult = await generateAIColdEmail({
                businessName: payload.businessName || payload.name,
                industry: payload.industry,
                rating: payload.rating,
                reviews: payload.reviews,
                website: payload.website,
                weakSignals: payload.weakSignals,
                suggestedServices: payload.suggestedServices
            });
            return res.json({ success: true, outreach: aiResult });
        }

        // Legacy format
        const audit = generateAudit(payload)
        const outreach = generateOutreach(payload, audit)

        res.json({ success: true, audit, outreach })
    } catch (err) {
        console.error("[Outreach] generate error:", err.message)
        res.status(500).json({ success: false, message: "Failed to generate outreach" })
    }
}

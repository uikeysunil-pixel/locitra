const Business = require("../models/business.model")

exports.generateLeads = async (req, res) => {

    try {

        const { keyword, location } = req.query

        const businesses = await Business.find({ keyword, location })

        const leads = businesses.map(b => {

            const reviews =
                Number(b.reviews) ||
                Number(b.totalReviews) ||
                Number(b.user_ratings_total) ||
                0

            const rating = Number(b.rating) || 0
            const seoScore = Number(b.seoScore) || 0

            let score = 100

            // Low reviews = higher opportunity
            if (reviews < 50) score -= 20
            if (reviews > 300) score -= 10

            // Rating gap
            if (rating < 4.2) score -= 20
            if (rating > 4.7) score -= 10

            // SEO gap
            if (seoScore < 70) score += 20
            if (seoScore < 50) score += 30

            score = Math.max(score, 0)

            return {

                name: b.name,
                rating,
                totalReviews: reviews,

                leadScore:
                    score >= 70
                        ? "🔥 HIGH"
                        : score >= 40
                            ? "⚠ MEDIUM"
                            : "LOW",

                opportunityScore: score,

                estimatedValue:
                    score >= 70
                        ? "$3000+"
                        : "$1000-$2000",

                category: b.keyword,
                city: b.location

            }

        })

        leads.sort((a, b) => b.opportunityScore - a.opportunityScore)

        res.json({
            leads: leads.slice(0, 20)
        })

    } catch (error) {

        console.error("Lead scoring error:", error)

        res.status(500).json({
            error: "Lead scoring failed"
        })

    }

}
const Business = require("../models/business.model")

exports.getProspects = async (req, res) => {

    try {

        const { keyword, location } = req.query

        const prospects = await Business.find({
            keyword,
            location,
            seoScore: { $lt: 80 }
        })

        const formatted = prospects.map(p => ({

            name: p.name,
            rating: p.rating || 0,

            totalReviews:
                p.reviews ||
                p.totalReviews ||
                0,

            opportunityScore:
                p.opportunityScore || 0,

            mapsLink:
                p.place_id
                    ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
                    : null

        }))

        res.json({

            totalProspects: formatted.length,
            prospects: formatted

        })

    } catch (error) {

        console.error(error.message)

        res.status(500).json({
            error: "Failed to fetch prospects"
        })

    }

}
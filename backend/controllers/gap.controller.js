const Business = require("../models/business.model")

exports.detectMarketGap = async (req, res) => {

    try {

        const { keyword } = req.query

        const markets = await Business.aggregate([

            {
                $match: { keyword }
            },

            {
                $group: {
                    _id: "$location",
                    avgReviews: { $avg: "$reviews" },
                    avgRating: { $avg: "$rating" },
                    businesses: { $sum: 1 }
                }
            }

        ])

        const gaps = markets.map(m => ({

            location: m._id,
            avgReviews: Math.round(m.avgReviews),
            avgRating: m.avgRating.toFixed(1),
            opportunity: m.avgReviews < 100 ? "HIGH" : "LOW"

        }))

        res.json(gaps)

    }

    catch (error) {

        res.status(500).json({ error: "Gap detection failed" })

    }

}
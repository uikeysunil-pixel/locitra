const Business = require("../models/business.model")

exports.getAlerts = async (req, res) => {

    try {

        const alerts = await Business.find({

            $or: [
                { reviews: { $lt: 200 } },
                { rating: { $lt: 4.5 } },
                { seoScore: { $lt: 80 } }
            ]

        }).limit(10)

        res.json(alerts)

    }

    catch (error) {

        res.status(500).json({ error: "Alerts fetch failed" })

    }

}
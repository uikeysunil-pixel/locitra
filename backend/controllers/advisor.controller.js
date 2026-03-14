exports.marketAdvisor = async (req, res) => {

    try {

        const { averageReviews, marketDifficulty } = req.query

        let advice = []

        if (averageReviews > 500) {
            advice.push("Market is highly competitive. Target suburbs instead of downtown.")
        }

        if (marketDifficulty > 70) {
            advice.push("Offer review generation services to local businesses.")
        }

        if (averageReviews < 200) {
            advice.push("Easy market to enter. Focus on Google ranking improvements.")
        }

        if (advice.length === 0) {
            advice.push("Balanced market opportunity. Standard SEO services recommended.")
        }

        res.json({
            advice
        })

    } catch (error) {

        res.status(500).json({
            error: "Advisor failed"
        })

    }

}
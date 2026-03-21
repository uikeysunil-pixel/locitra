const Business = require("../models/business.model")
const Scan = require("../models/scan.model")

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
    } catch (error) {
        res.status(500).json({ error: "Gap detection failed" })
    }
}

exports.getMarketGaps = async (req, res) => {
    try {
        // 1. Retrieve recent scans from MongoDB scans collection for "dentist_chicago"
        const scan = await Scan.findOne({ queryKey: "dentist_chicago" }).sort({ "history.timestamp": -1 })

        if (!scan || !scan.history || scan.history.length === 0) {
            return res.status(200).json([]) // Empty state handled by returning empty array
        }

        // Get the latest history entry
        const latestEntry = scan.history[scan.history.length - 1]
        const businesses = latestEntry.businesses.map(b => ({
            ...b,
            title: b.name // Backward compatibility
        }))

        // 2. Extract business data and detect weak competition
        // Rules: rating < 4.3, reviews < 100, rank between 1 and 5
        const gapBusinesses = businesses.filter(b => 
            b.rating < 4.3 && 
            b.reviews < 100 && 
            b.rank >= 1 && 
            b.rank <= 5
        )

        // Calculate averages for the response
        const totalReviews = businesses.reduce((sum, b) => sum + (b.reviews || 0), 0)
        const totalRating = businesses.reduce((sum, b) => sum + (b.rating || 0), 0)
        const avgReviews = businesses.length > 0 ? Math.round(totalReviews / businesses.length) : 0
        const avgRating = businesses.length > 0 ? parseFloat((totalRating / businesses.length).toFixed(1)) : 0

        // If multiple businesses meet criteria → mark market as gap
        const isGap = gapBusinesses.length >= 2
        
        // Return structure as requested
        const result = [
            {
                keyword: scan.keyword,
                city: scan.city,
                averageReviews: avgReviews,
                averageRating: avgRating,
                competitionLevel: isGap ? "Low" : "High",
                opportunityScore: isGap ? 82 : 25 // Example score as per requirements
            }
        ]

        res.json(result)

    } catch (error) {
        console.error("Market gaps detection error:", error)
        res.status(500).json({ error: "Failed to detect market gaps" })
    }
}
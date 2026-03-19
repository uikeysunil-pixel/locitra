const locitraEvents = require("../utils/events")
const OpportunityAlert = require("../models/opportunityAlert.model")

/**
 * Helper: Generate Opportunity Alerts
 * Rules: rating < 4.2, reviews < 50, rank between 4 and 10
 */
const generateOpportunityAlerts = async ({ businesses, userId, keyword, location }) => {
    if (!userId || !Array.isArray(businesses) || businesses.length === 0) return
    
    try {
        const cityStr = (location || "").toLowerCase().trim()
        const keywordStr = (keyword || "").toLowerCase().trim()

        const alertsData = businesses
            .filter(b => b && b.rating < 4.2 && (Number(b.reviews) || 0) < 50 && b.rank >= 4 && b.rank <= 10)
            .map(b => ({
                userId,
                keyword: keywordStr,
                city: cityStr,
                businessName: b.name,
                rank: b.rank,
                rating: b.rating,
                reviews: Number(b.reviews) || 0,
                opportunityScore: (b.rating && b.rating < 3.8) ? "High" : "Medium"
            }))

        if (alertsData.length > 0) {
            // ordered: false skips duplicates silently (11000 errors)
            // The model's unique index (userId, businessName, city, keyword) prevents duplicates
            await OpportunityAlert.insertMany(alertsData, { ordered: false })
            console.log(`[AlertListener] Successfully processed ${alertsData.length} opportunities for user ${userId}`)
        }
    } catch (err) {
        // Log real errors but ignore duplicate key errors (11000)
        if (err.code !== 11000 && !err.writeErrors) {
            console.error("[AlertListener] Error in alert generation:", err.message)
        }
    }
}

// Subscribe to scanCompleted event
locitraEvents.on("scanCompleted", (payload) => {
    // Run asynchronously using setImmediate as requested to ensure it's off the main path
    setImmediate(() => {
        generateOpportunityAlerts(payload).catch(err => {
            console.error("[AlertListener] Fatal error in background task:", err)
        })
    })
})

console.log("✅ Alerts Listener initialized")

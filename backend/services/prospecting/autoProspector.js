const Lead = require("../../models/lead.model")
const WatchMarket = require("../../models/watchMarket.model")
const { scanBusinesses } = require("../data/businessScanner")

const STALE_DAYS = 7   // re-scan if last scan was more than 7 days ago

/**
 * runAutoProspecting()
 * ─────────────────────────────────────────────────────────────
 * Iterates all active watched markets that haven't been scanned
 * recently, runs the existing scanner, compares results against
 * existing leads, and saves newly discovered businesses.
 *
 * Safe — only reads existing models, never modifies scanner pipeline.
 */
async function runAutoProspecting() {
    const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000)

    // Find markets that need rescanning
    const markets = await WatchMarket.find({
        isActive: true,
        $or: [
            { lastScanDate: null },
            { lastScanDate: { $lt: cutoff } }
        ]
    })

    if (markets.length === 0) {
        console.log("[AutoProspector] No markets need rescanning right now.")
        return { processed: 0, newLeads: 0 }
    }

    let totalNew = 0

    for (const market of markets) {
        try {
            console.log(`[AutoProspector] Scanning ${market.keyword} in ${market.city} for user ${market.userId}`)

            // Run the existing scanner (unchanged)
            const businesses = await scanBusinesses(market.keyword, market.city, 50)

            // Find which businesses are not yet in this user's CRM
            const existingNames = await Lead.distinct("name", { userId: market.userId })
            const existingSet = new Set(existingNames.map(n => n.toLowerCase()))

            const newOnes = businesses.filter(b => !existingSet.has((b.name || "").toLowerCase()))

            // Save new businesses as CRM leads
            for (const b of newOnes) {
                await Lead.create({
                    userId: market.userId,
                    name: b.name,
                    category: b.category,
                    city: market.city,
                    keyword: market.keyword,
                    rating: b.rating,
                    reviews: b.reviews,
                    website: b.website,
                    phone: b.phone,
                    email: b.email,
                    opportunityScore: b.opportunityScore,
                    priorityScore: b.opportunityScore || 0,
                    status: "New",
                    source: "auto-prospecting"
                })
            }

            totalNew += newOnes.length

            // Update scan metadata
            await WatchMarket.findByIdAndUpdate(market._id, {
                lastScanDate: new Date(),
                $inc: { totalScans: 1, newLeadsFound: newOnes.length }
            })

            console.log(`[AutoProspector] Found ${newOnes.length} new leads for ${market.keyword} in ${market.city}`)

        } catch (err) {
            console.error(`[AutoProspector] Error scanning market ${market._id}:`, err.message)
            // Continue to next market — don't crash the whole run
        }
    }

    console.log(`[AutoProspector] Run complete. Processed ${markets.length} markets, found ${totalNew} new leads.`)
    return { processed: markets.length, newLeads: totalNew }
}

module.exports = { runAutoProspecting }

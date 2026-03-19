const { scanBusinesses } = require("../services/data/businessScanner")

/* Simple IP-based rate limiter — 1 free scan per IP per 10 minutes */
const ipThrottle = new Map()
const THROTTLE_MS = 10 * 60 * 1000   // 10 minutes

// @route  POST /api/free-scan
// @access Public (no auth)
exports.freeScan = async (req, res) => {
    try {
        const ip = req.ip || req.headers["x-forwarded-for"] || "unknown"

        /* Rate limit check */
        const lastScan = ipThrottle.get(ip)
        if (lastScan && Date.now() - lastScan < THROTTLE_MS) {
            const wait = Math.ceil((THROTTLE_MS - (Date.now() - lastScan)) / 60000)
            return res.status(429).json({
                success: false,
                message: `Please wait ${wait} more minute(s) before scanning again.`
            })
        }

        const { keyword, location } = req.body

        if (!keyword || !location) {
            return res.status(400).json({
                success: false,
                message: "keyword and location are required"
            })
        }

        const normalizedKeyword = keyword.toLowerCase().trim()
        const normalizedLocation = location.toLowerCase().trim()

        // 1. CHECK MONGODB CACHE FIRST
        console.log("[FreeScan] Checking MongoDB cache for:", { keyword: normalizedKeyword, location: normalizedLocation })
        let allBusinesses = await Business.find({
            keyword: normalizedKeyword,
            location: normalizedLocation
        }).lean()

        if (allBusinesses.length === 0) {
            /* Run existing scanner — capped at 50 results for free tier */
            console.log("[FreeScan] Cache miss → calling scanner")
            try {
                allBusinesses = await scanBusinesses(keyword, location, 50)
            } catch (scanErr) {
                console.error("[FreeScan] Scanner failed:", scanErr.message)
                return res.status(500).json({
                    success: false,
                    message: "Scan failed. API unavailable and no cached data found."
                })
            }
        } else {
            console.log(`[FreeScan] Cache hit! Found ${allBusinesses.length} businesses.`)
            // Cap at 50 for free tier if we got more from DB
            if (allBusinesses.length > 50) {
                allBusinesses = allBusinesses.slice(0, 50)
            }
        }

        /* Record this IP's scan time */
        ipThrottle.set(ip, Date.now())
        if (ipThrottle.size > 10000) {
            // Prevent memory leak — clear oldest 5000 entries
            const keys = [...ipThrottle.keys()].slice(0, 5000)
            keys.forEach(k => ipThrottle.delete(k))
        }

        const highOpp = allBusinesses.filter(b => (b.opportunityScore || 0) >= 70)
        const noWebsite = allBusinesses.filter(b => !b.website)

        /* Return only aggregate stats + first 5 businesses as preview */
        const preview = allBusinesses.slice(0, 5).map(b => ({
            name: b.name,
            rating: b.rating,
            reviews: b.reviews,
            category: b.category,
            address: b.address,
            opportunityScore: b.opportunityScore,
            website: b.website ? "✔ Has website" : null   // don't expose actual URL in free preview
        }))

        res.json({
            success: true,
            totalBusinesses: allBusinesses.length,
            highOpportunity: highOpp.length,
            noWebsite: noWebsite.length,
            preview,
            locked: Math.max(0, allBusinesses.length - 5)
        })

    } catch (err) {
        console.error("[FreeScan] error:", err.message)
        res.status(500).json({ success: false, message: "Scan failed. Please try again." })
    }
}

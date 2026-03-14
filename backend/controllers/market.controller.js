const Business = require("../models/business.model")

const { scanBusinesses } = require("../services/data/businessScanner")
const { normalizeBusinesses } = require("../services/data/businessNormalizer")
const { getCache, setCache } = require("../services/data/businessCache")
const { scanResultsCache } = require("../services/reports/scanResultsCache")

const User = require("../models/user.model")

// ─────────────────────────────────────────────
//  POST /api/market/scan
//  Fetches live data from Google Places, normalizes,
//  deduplicates, persists, and returns enriched metrics.
// ─────────────────────────────────────────────
exports.scanMarket = async (req, res) => {

    try {

        const { keyword, location } = req.body

        console.log("[scanMarket] SCAN REQUEST:", { keyword, location })

        if (!keyword || !location) {
            return res.status(400).json({
                error: "keyword and location are required"
            })
        }

        const cacheKey = `${keyword.toLowerCase().trim()}::${location.toLowerCase().trim()}`

        // Return cached result if available (avoids repeat API calls)
        const cached = getCache(cacheKey)

        if (cached) {
            console.log("[scanMarket] Returning cached result:", cacheKey)
            return res.json({ ...cached, fromCache: true })
        }

        // Fetch raw results from Google Places (up to 500)
        const rawBusinesses = await scanBusinesses(keyword, location, 500)

        console.log("[scanMarket] Raw businesses from Google:", rawBusinesses.length)

        const normalized = normalizeBusinesses(rawBusinesses, keyword, location)

        console.log("[scanMarket] Normalized businesses:", normalized.length)

        if (normalized.length === 0) {
            return res.json({
                keyword,
                location,
                total: 0,
                businesses: [],
                marketMetrics: {
                    totalReviews: 0,
                    averageReviews: 0,
                    averageRating: 0
                }
            })
        }

        const planConfig = req.planConfig || { maxBusinesses: 100 }
        const limit = planConfig.maxBusinesses
        const limitedNormalized = normalized.slice(0, limit)

        // Persist to DB — skip duplicates silently (ordered: false)
        try {
            await Business.insertMany(limitedNormalized, { ordered: false })
        } catch (dbErr) {
            // Duplicate key errors are expected on re-scans — ignore them
            if (dbErr.code !== 11000) {
                console.warn("[scanMarket] insertMany warning:", dbErr.message)
            }
        }

        // ── Compute enriched market metrics ──────────────────────
        let totalReviews = 0
        let totalRating = 0
        let ratingCount = 0

        for (const b of limitedNormalized) {
            totalReviews += b.reviews || 0

            if (b.rating > 0) {
                totalRating += b.rating
                ratingCount++
            }
        }

        const averageReviews = Math.round(totalReviews / limitedNormalized.length)
        const averageRating = ratingCount > 0
            ? Number((totalRating / ratingCount).toFixed(1))
            : 0

        const payload = {
            keyword,
            location,
            total: limitedNormalized.length,
            businesses: limitedNormalized,
            marketMetrics: {
                totalReviews,
                averageReviews,
                averageRating
            }
        }

        // Increment scan usage
        if (req.user) {
            const user = await User.findById(req.user.id)
            if (user) {
                user.dailyScanUsed = (user.dailyScanUsed || 0) + 1
                await user.save()
            }
        }

        // Cache the result for this session
        setCache(cacheKey, payload)

        // Store exactly these live dashboard results for the PDF generator
        if (req.user && req.user.id) {
            scanResultsCache[req.user.id] = limitedNormalized
            console.log(`[scanMarket] Stored ${limitedNormalized.length} results into report cache for user ${req.user.id}`)
        }

        res.json(payload)

    } catch (error) {

        console.error("[scanMarket] FATAL ERROR:", error.stack || error.message || error)

        res.status(500).json({
            error: "Market scan failed",
            detail: error.message
        })

    }

}

// ─────────────────────────────────────────────
//  GET /api/market/history?keyword=&location=
//  Returns aggregated metrics from previously saved DB records.
// ─────────────────────────────────────────────
exports.getMarketHistory = async (req, res) => {

    try {

        const { keyword, location } = req.query

        if (!keyword || !location) {
            return res.status(400).json({
                error: "keyword and location are required"
            })
        }

        const records = await Business.find({
            keyword: keyword.toLowerCase(),
            location: location.toLowerCase()
        }).lean()

        if (!records || records.length === 0) {
            return res.json({
                keyword,
                location,
                totalRecords: 0,
                averageReviews: 0,
                averageRating: 0,
                message: "No market data found"
            })
        }

        let totalReviews = 0
        let totalRating = 0
        let ratingCount = 0

        for (const b of records) {

            const reviews =
                Number(b.reviews) ||
                Number(b.totalReviews) ||
                Number(b.user_ratings_total) ||
                0

            const rating = Number(b.rating) || 0

            totalReviews += reviews

            if (rating > 0) {
                totalRating += rating
                ratingCount++
            }
        }

        const averageReviews = Math.round(totalReviews / records.length)

        const averageRating = ratingCount > 0
            ? Number((totalRating / ratingCount).toFixed(1))
            : 0

        res.json({
            keyword,
            location,
            totalRecords: records.length,
            marketMetrics: {
                totalReviews,
                averageReviews,
                averageRating
            }
        })

    } catch (error) {

        console.error("Market history error:", error)

        res.status(500).json({
            error: "Failed to fetch market history"
        })

    }

}
const locitraEvents = require("../utils/events")
const Business = require("../models/business.model")
const ScanLog = require("../models/scanLog.model")
const User = require("../models/user.model")
const { scanBusinesses } = require("../services/data/businessScanner")
const { normalizeBusinesses } = require("../services/data/businessNormalizer")

const applyContactFallbackArray = (docs) => {
    return docs.map(ret => {
        const o = ret.outreach || {};
        ret.contact = ret.contact || {};
        ret.contact.email = o.email || ret.contact.email;
        ret.contact.phone = o.phone || ret.contact.phone;
        ret.contact.website = o.website || ret.contact.website;
        ret.contact.contactPage = o.contactPage || ret.contact.contactPage;
        ret.contact.socials = ret.contact.socials || {};
        const os = o.socials || {};
        ret.contact.socials.facebook = os.facebook || ret.contact.socials.facebook;
        ret.contact.socials.instagram = os.instagram || ret.contact.socials.instagram;
        ret.contact.socials.linkedin = os.linkedin || ret.contact.socials.linkedin;
        ret.contact.socials.twitter = os.twitter || ret.contact.socials.twitter;
        return ret;
    });
};

// Simple in-memory cache for market scans
const scanCache = new Map()
const scanResultsCache = {} // Exported for reports

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

const getCache = (key) => {
    const cached = scanCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
    }
    return null
}

const setCache = (key, data) => {
    scanCache.set(key, { data, timestamp: Date.now() })
}


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

        const normalizedKeyword = keyword.toLowerCase().trim()
        const normalizedLocation = location.toLowerCase().trim()
        const cacheKey = `${normalizedKeyword}::${normalizedLocation}`
        const userId = req.user ? req.user.id : null

        // 1. SESSION CACHE CHECK (Fastest)
        const sessionCached = getCache(cacheKey)
        if (sessionCached) {
            console.log("[scanMarket] Returning session-cached result:", cacheKey)
            res.json({ ...sessionCached, fromCache: true, cacheSource: "session" })

            // Trigger alert generation asynchronously after response
            setImmediate(() => {
                try {
                    locitraEvents.emit("scanCompleted", {
                        businesses: sessionCached.businesses,
                        userId,
                        keyword: normalizedKeyword,
                        location: normalizedLocation
                    })
                } catch (err) {
                    console.error("[scanMarket] Event emission error (session cache):", err)
                }
            })
            return
        }

        // 2. MONGODB CACHE CHECK (Persistent)
        console.log("[scanMarket] Checking MongoDB cache for:", { keyword: normalizedKeyword, location: normalizedLocation })
        let dbCached = await Business.find({
            keyword: normalizedKeyword,
            location: normalizedLocation
        }).lean()

        if (dbCached && dbCached.length > 0) {
            dbCached = applyContactFallbackArray(dbCached);
            console.log(`[scanMarket] Cache hit! Found ${dbCached.length} businesses in MongoDB.`)
            
            // ... (metrics calculation) ...
            let totalReviews = 0
            let totalRating = 0
            let ratingCount = 0

            for (const b of dbCached) {
                totalReviews += b.reviews || 0
                if (b.rating > 0) {
                    totalRating += b.rating
                    ratingCount++
                }
            }

            const averageReviews = Math.round(totalReviews / dbCached.length)
            const averageRating = ratingCount > 0
                ? Number((totalRating / ratingCount).toFixed(1))
                : 0

            const payload = {
                keyword: normalizedKeyword,
                location: normalizedLocation,
                total: dbCached.length,
                businesses: dbCached,
                marketMetrics: {
                    totalReviews,
                    averageReviews,
                    averageRating
                }
            }

            // Cache in session for next time
            setCache(cacheKey, payload)

            // Store for report generation
            if (req.user && req.user.id) {
                scanResultsCache[req.user.id] = dbCached
            }

            // Log activity
            await ScanLog.create({
                user: userId,
                userEmail: req.user ? req.user.email : "anonymous",
                keyword: normalizedKeyword,
                location: normalizedLocation,
                source: "cache",
                resultsCount: dbCached.length
            })

            res.json({ ...payload, fromCache: true, cacheSource: "mongodb" })

            // Trigger alert generation asynchronously after response
            setImmediate(() => {
                try {
                    locitraEvents.emit("scanCompleted", {
                        businesses: dbCached,
                        userId,
                        keyword: normalizedKeyword,
                        location: normalizedLocation
                    })
                } catch (err) {
                    console.error("[scanMarket] Event emission error (db cache):", err)
                }
            })
            return
        }

        // 3. LIVE SCAN (SerpAPI)
        console.log("[scanMarket] Cache miss → calling live scanner")
        let rawBusinesses = []
        try {
            rawBusinesses = await scanBusinesses(
                keyword, 
                location, 
                500, 
                userId, 
                req.user ? req.user.email : "anonymous"
            )
            console.log("[scanMarket] Raw businesses from SerpAPI:", rawBusinesses.length)
        } catch (scanErr) {
            // fallback logic...
            let finalCheck = await Business.find({
                keyword: normalizedKeyword,
                location: normalizedLocation
            }).lean()

            if (finalCheck.length > 0) {
                finalCheck = applyContactFallbackArray(finalCheck);
                return res.json({ 
                    keyword: normalizedKeyword, 
                    location: normalizedLocation, 
                    total: finalCheck.length, 
                    businesses: finalCheck,
                    message: "Results served from local database (API unavailable)"
                })
            }
            throw scanErr
        }

        const normalized = normalizeBusinesses(rawBusinesses, keyword, location)
        
        if (normalized.length === 0) {
            return res.json({
                keyword, location, total: 0, businesses: [],
                marketMetrics: { totalReviews: 0, averageReviews: 0, averageRating: 0 }
            })
        }

        const planConfig = req.planConfig || { maxBusinesses: 100 }
        const limit = planConfig.maxBusinesses
        const limitedNormalized = normalized.slice(0, limit)

        // Persist to DB
        try {
            await Business.insertMany(limitedNormalized, { ordered: false })
        } catch (dbErr) {
            if (dbErr.code !== 11000) console.warn("[scanMarket] insertMany warning:", dbErr.message)
        }

        // ── Compute enriched market metrics ──────────────────────
        let totalReviewsCount = 0
        let totalRatingSum = 0
        let ratingCountNum = 0

        for (const b of limitedNormalized) {
            totalReviewsCount += b.reviews || 0
            if (b.rating > 0) {
                totalRatingSum += b.rating
                ratingCountNum++
            }
        }

        const averageReviews = Math.round(totalReviewsCount / limitedNormalized.length)
        const averageRating = ratingCountNum > 0
            ? Number((totalRatingSum / ratingCountNum).toFixed(1))
            : 0

        const payload = {
            keyword,
            location,
            total: limitedNormalized.length,
            businesses: limitedNormalized,
            marketMetrics: {
                totalReviews: totalReviewsCount,
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

        setCache(cacheKey, payload)

        if (req.user && req.user.id) {
            scanResultsCache[req.user.id] = limitedNormalized
        }

        res.json(payload)

        // Trigger alert generation asynchronously after response
        setImmediate(() => {
            try {
                locitraEvents.emit("scanCompleted", {
                    businesses: limitedNormalized,
                    userId,
                    keyword: normalizedKeyword,
                    location: normalizedLocation
                })
            } catch (err) {
                console.error("[scanMarket] Event emission error (live scan):", err)
            }
        })

    } catch (error) {
        console.error("[scanMarket] FATAL ERROR:", error.stack || error.message || error)
        res.status(500).json({
            error: "Market scan failed",
            detail: error.message
        })
    }
}

// (getMarketHistory remains the same below)
exports.getMarketHistory = async (req, res) => {
    // ...
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

// @route  GET /api/market/business/:id
// @access Private
exports.getBusinessById = async (req, res) => {
    try {
        const { id } = req.params
        // Try finding by MongoDB ID first, then by placeId
        let business = await Business.findOne({
            $or: [
                { _id: id.length === 24 ? id : null },
                { placeId: id }
            ].filter(q => q._id !== null || q.placeId !== undefined)
        }).lean()

        if (!business) return res.status(404).json({ success: false, message: "Business not found" })
        
        // Apply fallbacks
        const [enriched] = applyContactFallbackArray([business])
        res.json({ success: true, business: enriched })
    } catch (err) {
        console.error("[market] getBusinessById error:", err.message)
        res.status(500).json({ success: false, message: "Failed to fetch business" })
    }
}
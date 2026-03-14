const axios = require("axios")
const { enrichWithWebsites } = require("./websiteDetector")
const { enrichAllContacts } = require("./contactDiscovery")
const { enrichLead } = require("../enrichment.service")
const Business = require("../../models/business.model")
const ScanCache = require("../../models/scanCache.model")

const SERPAPI_URL = "https://serpapi.com/search.json"

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Compute a 0-100 opportunity score for a single business.
 * Lower reviews + lower rating + no website = higher score (easier target).
 */
const computeOpportunityScore = (business) => {
    let score = 100

    const reviews = Number(business.reviews) || 0
    const rating = Number(business.rating) || 0

    // Penalise for high review counts (already established)
    if (reviews > 200) score -= 40
    else if (reviews > 100) score -= 25
    else if (reviews > 50) score -= 10

    // Penalise for high ratings (strong competitors)
    if (rating > 4.6) score -= 20
    else if (rating > 4.3) score -= 10

    // Bonus if no website (easy win for a new client)
    if (!business.website) score += 15

    return Math.max(0, Math.min(100, score))
}

/**
 * Scan Google Maps via SerpAPI with automatic pagination.
 * Collects up to `limit` businesses (default 500).
 *
 * SerpAPI Google Maps engine supports `start` offsets in steps of 20.
 * Each page returns up to 20 results; we keep fetching until we reach
 * the limit or SerpAPI returns an empty page.
 */
exports.scanBusinesses = async (keyword, location, limit = 500) => {

    const apiKey = process.env.SERPAPI_KEY
    const city = location

    if (!apiKey) {
        console.error("[businessScanner] ❌ SERPAPI_KEY is not set in .env")
        return []
    }

    console.log(`[businessScanner] SCAN REQUEST: ${keyword} ${city}`)
    console.log("Checking cache for:", keyword, city)

    const cacheLimit = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const cachedBusinesses = await Business.find({
        keyword,
        city,
        createdAt: { $gte: cacheLimit }
    }).lean()

    if (cachedBusinesses.length > 0) {
        console.log("Using cached results:", cachedBusinesses.length)
        return cachedBusinesses
    }

    const country = ""
    const queryKey = `${keyword}_${city}_${country}`.toLowerCase()

    const cached = await ScanCache.findOne({
        queryKey,
        expiresAt: { $gt: new Date() }
    })

    if (cached) {
        console.log("[businessScanner] Using ScanCache results:", cached.results.length)
        return cached.results
    }

    console.log("Running fresh scan via SerpAPI")

    const allBusinesses = []
    let start = 0

    try {

        while (allBusinesses.length < limit) {

            const response = await axios.get(SERPAPI_URL, {
                params: {
                    engine: "google_maps",
                    q: `${keyword} in ${location}`,
                    type: "search",
                    start,
                    api_key: apiKey
                },
                timeout: 30000
            })

            const results = response.data?.local_results || []

            if (results.length === 0) {
                console.log(
                    `[businessScanner] No more results at offset ${start}. Stopping.`
                )
                break
            }

            // Normalize each result and attach an opportunity score
            const normalized = results.map((place) => {

                // SerpAPI returns website in different places depending on the
                // result type — always check both locations before falling back.
                const website =
                    place.website ||
                    place.links?.website ||
                    ""

                const business = {
                    name: place.title || "",
                    rating: place.rating || 0,
                    reviews: place.reviews || 0,
                    phone: place.phone || "",
                    website,
                    address: place.address || "",
                    category: place.type || "unknown",
                    placeId: place.place_id || place.data_id || undefined,
                    lat: place.gps_coordinates?.latitude || null,
                    lng: place.gps_coordinates?.longitude || null,
                    // Contact fields — populated by contactDiscovery later
                    email: "",
                    contactPage: "",
                    facebook: "",
                    instagram: "",
                    linkedin: ""
                }

                business.opportunityScore = computeOpportunityScore(business)
                return business
            })

            allBusinesses.push(...normalized)

            console.log(
                `[businessScanner] Fetched: ${allBusinesses.length} (offset=${start})`
            )

            // SerpAPI paginates in steps of 20
            start += 20

            // Respect SerpAPI rate limits between pages
            if (allBusinesses.length < limit) {
                await delay(400)
            }

        }

    } catch (error) {

        const serpError = error.response?.data?.error
        if (serpError) {
            console.error("[businessScanner] ❌ SerpAPI error:", serpError)
        } else {
            console.error("[businessScanner] ❌ Request failed:", error.message)
        }

    }

    const sliced = allBusinesses.slice(0, limit)

    console.log("[businessScanner] Maps fetch complete:", sliced.length, "businesses")

    // ── Website Enrichment ─────────────────────────────────────────────────
    // For businesses that Google Maps didn't return a website for, try to
    // detect one via a targeted Google search.  Runs AFTER pagination so it
    // only fires once and the cap (50) applies to the full result set.
    const beforeCount = sliced.filter(b => !b.website).length
    const enriched = await enrichWithWebsites(sliced, location)
    const afterCount = enriched.filter(b => !b.website).length
    const newlyFound = beforeCount - afterCount

    if (newlyFound > 0) {
        console.log(
            `[businessScanner] Website enrichment added ${newlyFound} URLs. ` +
            `Recalculating opportunity scores…`
        )
        // Recompute scores for enriched businesses — detecting a website
        // removes the +15 "no website" bonus so scores must be refreshed.
        for (const b of enriched) {
            b.opportunityScore = computeOpportunityScore(b)
        }
    }

    console.log("[businessScanner] Final businesses collected:", enriched.length)
    console.log(
        `[businessScanner] Website coverage: ` +
        `${enriched.filter(b => b.website).length}/${enriched.length} have a website`
    )

    // ── Contact Discovery ───────────────────────────────────────────────────
    // Runs after website enrichment so businesses that just gained a website
    // are immediately eligible for email / social profile extraction.
    console.log("[businessScanner] Starting Advanced Contact Discovery & AI Enrichment…")
    const withContacts = await enrichAllContacts(enriched, location)

    // Deep advanced enrichment mapping
    console.log("[businessScanner] Running deeper AI enrichment passes on leads...")
    const deeplyEnriched = await Promise.all(
        withContacts.map(lead => enrichLead(lead))
    )

    const scannedBusinesses = deeplyEnriched

    try {
        await Business.insertMany(
            scannedBusinesses.map(b => ({
                ...b,
                keyword,
                city,
                createdAt: new Date()
            })),
            { ordered: false }
        )
    } catch (cacheErr) {
        if (cacheErr.code !== 11000) {
            console.error("[businessScanner] Cache save error:", cacheErr.message)
        }
    }

    try {
        await ScanCache.create({
            queryKey,
            keyword,
            city,
            country,
            results: scannedBusinesses,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })
    } catch (err) {
        console.error("[businessScanner] ScanCache save error:", err.message)
    }

    console.log("[businessScanner] ✅ Pipeline complete. Returning", scannedBusinesses.length, "businesses.")
    return scannedBusinesses

}
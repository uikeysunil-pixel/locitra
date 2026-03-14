/**
 * websiteDetector.js
 *
 * Automatic Website Detection Engine.
 *
 * For businesses that SerpAPI Google Maps did not return a website URL for,
 * issues a targeted Google Search and attempts to find the real business
 * website from organic results.
 *
 * Strict acceptance rules (all must pass before assigning):
 *  1. URL starts with http/https
 *  2. Domain is NOT in the directory/social blocklist
 *  3. The URL contains the first 6 chars of the business name slug
 *     (confidence check — avoids assigning competitor / aggregator sites)
 *
 * Design:
 *  – Capped at MAX_DETECTIONS per scan to control SerpAPI credit spend.
 *  – Rate-limited between requests (300ms) to stay within API limits.
 *  – Individual errors are swallowed so one failure can't abort the batch.
 *  – If no candidate passes all rules, website stays "" — preserving the
 *    "No Website" lead status so it can still be pitched.
 */

const axios = require("axios")

const SERPAPI_URL = "https://serpapi.com/search.json"

/* Maximum website lookups per scan — controls API credit usage */
const MAX_DETECTIONS = 40

/* Delay between individual SerpAPI Google searches (ms) */
const DETECTION_DELAY = 300

/* ─── Blocklist ────────────────────────────────────────────────────────────
   Keywords (not full domains) — any URL whose lowercase form contains one
   of these strings is rejected as a directory / social / aggregator page.
   Using bare keywords is intentional: "yelp.com/biz/...", "m.yelp.com/...",
   and "yelp.co.uk/..." are all rejected by a single "yelp" keyword.
──────────────────────────────────────────────────────────────────────────── */
const BLOCKED_KEYWORDS = [
    "facebook",
    "instagram",
    "twitter",
    "linkedin",
    "yelp",
    "tripadvisor",
    "mapquest",
    "yellowpages",
    "foursquare",
    "angi",
    "angieslist",
    "houzz",
    "thumbtack",
    "bbb.org",
    "google.com",
    "apple.com",
    "bing.com",
    "wikipedia",
    "wikidata",
    "nextdoor",
    "bark.com",
    "homeadvisor",
    "porch.com",
]

/* ─── Validator ────────────────────────────────────────────────────────────
   Returns true ONLY if the URL:
     (a) is a non-empty http/https string
     (b) contains none of the blocked keywords
──────────────────────────────────────────────────────────────────────────── */
const isValidBusinessWebsite = (url) => {
    if (!url || typeof url !== "string") return false
    if (!url.startsWith("http")) return false

    const lower = url.toLowerCase()
    return !BLOCKED_KEYWORDS.some(kw => lower.includes(kw))
}

/* ─── Confidence check ─────────────────────────────────────────────────────
   Verifies the detected URL actually belongs to THIS business and not a
   competitor or unrelated site with a similar keyword.

   Strategy: take the first 6 characters of the "slugified" business name
   (lowercase, spaces removed) and check if the URL contains that slug.

   Examples:
     "Chicago Dental Center" → slug6 = "chicag"
     "chicagodentalcenter.com" contains "chicag" ✅
     "bestdentistchicago.com" contains "chicag" ✅ (false positive edge-case)
     "topdental.com"          does NOT contain "chicag" ❌

   Edge-case: very short business names (< 6 chars) always pass — the slug
   would be too generic to reliably discriminate.
──────────────────────────────────────────────────────────────────────────── */
const passesConfidenceCheck = (url, businessName) => {
    if (!businessName) return false

    // Slugify: lowercase + remove spaces, punctuation
    const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")

    // Short names (≤ 5 chars) — skip the check; too generic to match
    if (slug.length <= 5) return true

    const slug6 = slug.slice(0, 6)
    const urlLower = url.toLowerCase()

    return urlLower.includes(slug6)
}

/* ─── detectWebsite ────────────────────────────────────────────────────────
   Searches Google for the business and extracts the most likely real website.
   Returns the business object unchanged if no valid, confident match is found.
──────────────────────────────────────────────────────────────────────────── */
const detectWebsite = async (business, city) => {

    /* Already has a website — nothing to do */
    if (business.website) return business

    const query = `${business.name} ${city} official website`

    try {

        const response = await axios.get(SERPAPI_URL, {
            params: {
                engine: "google",
                q: query,
                num: 5,
                api_key: process.env.SERPAPI_KEY
            },
            timeout: 15000
        })

        const organicResults = response.data?.organic_results || []

        for (const result of organicResults.slice(0, 5)) {

            const candidate = result.link || ""

            /* Rule 1+2: must be http and not a blocked domain */
            if (!isValidBusinessWebsite(candidate)) continue

            /* Rule 3: must match the business name slug (confidence check) */
            if (!passesConfidenceCheck(candidate, business.name)) {
                console.log(
                    `[websiteDetector] ⚠️  "${business.name}" → ` +
                    `rejected (no name match): ${candidate}`
                )
                continue
            }

            /* All rules passed — assign and stop */
            business.website = candidate
            console.log(
                `[websiteDetector] ✅ "${business.name}" → detected: ${candidate}`
            )
            return business

        }

        console.log(
            `[websiteDetector] ❌ "${business.name}" → no valid website found`
        )

    } catch (err) {
        /* Swallow individual errors — don't abort the whole batch */
        console.warn(
            `[websiteDetector] ⚠️  "${business.name}" → lookup failed: ${err.message}`
        )
    }

    /* Return unchanged — website stays "" so lead remains "No Website" */
    return business

}

/* ─── enrichWithWebsites ───────────────────────────────────────────────────
   Main entry point. Called by businessScanner after Maps pagination.

   Picks up to MAX_DETECTIONS businesses without a website, attempts
   detection on each, and writes results back into the original array.
──────────────────────────────────────────────────────────────────────────── */
const enrichWithWebsites = async (businesses, city) => {

    const missingBefore = businesses.filter(b => !b.website).length

    /* Select only no-website businesses, capped at MAX_DETECTIONS */
    const targets = businesses
        .filter(b => !b.website)
        .slice(0, MAX_DETECTIONS)

    if (targets.length === 0) {
        console.log("[websiteDetector] All businesses already have a website — skipping enrichment.")
        return businesses
    }

    console.log(
        `[websiteDetector] Starting enrichment. ` +
        `${missingBefore} missing websites, attempting ${targets.length} (cap: ${MAX_DETECTIONS})…`
    )

    let detected = 0
    let attempted = 0

    /* Build name::address → index map for O(1) write-back */
    const indexMap = new Map(
        businesses.map((b, i) => [`${b.name}::${b.address}`, i])
    )

    for (const business of targets) {

        attempted++

        const before = business.website
        const enriched = await detectWebsite(business, city)

        if (enriched.website && enriched.website !== before) {
            detected++

            const key = `${enriched.name}::${enriched.address}`
            const idx = indexMap.get(key)
            if (idx !== undefined) {
                businesses[idx] = enriched
            }
        }

        /* Rate-limit — wait between SerpAPI calls */
        if (attempted < targets.length) {
            await new Promise(r => setTimeout(r, DETECTION_DELAY))
        }

    }

    const missingAfter = businesses.filter(b => !b.website).length

    console.log(
        `[websiteDetector] Enrichment complete.\n` +
        `  Attempted : ${attempted}\n` +
        `  Detected  : ${detected}\n` +
        `  Still missing: ${missingAfter} (were ${missingBefore})`
    )

    return businesses

}

module.exports = { enrichWithWebsites, detectWebsite, isValidBusinessWebsite }

/**
 * contactDiscovery.js
 *
 * Contact Discovery Engine for Locitra.
 *
 * Enriches business objects with:
 *   email       – extracted from website HTML (homepage + contact page)
 *   contactPage – link to /contact or similar page
 *   facebook    – business Facebook profile URL
 *   instagram   – business Instagram profile URL
 *   linkedin    – business LinkedIn page URL
 *
 * Pipeline per business:
 *   1. If website exists:
 *        a. Fetch website homepage HTML
 *        b. Extract email via regex
 *        c. Extract /contact link → fetch that page for email too
 *   2. Run a single SerpAPI Google search for social profiles
 *        (batched as "name city facebook OR instagram OR linkedin")
 *        → avoids 3 separate API calls per business
 *
 * Performance rules:
 *   – Capped at MAX_ENRICHMENTS businesses per scan
 *   – HTML fetches have a 5s timeout (slow/dead sites won't stall pipeline)
 *   – SerpAPI social search has a 12s timeout
 *   – Individual errors are swallowed — one failure never aborts the batch
 *   – 250ms delay between businesses to avoid hammering external sites
 */

const axios = require("axios")

const SERPAPI_URL = "https://serpapi.com/search.json"
const MAX_ENRICHMENTS = 50   // max businesses to contact-enrich per scan
const HTML_TIMEOUT = 5000 // ms — website fetch timeout
const SERP_TIMEOUT = 12000 // ms — SerpAPI social search timeout
const INTER_DELAY = 250  // ms between each business

/* ─── Regex patterns ──────────────────────────────────── */

// Matches standard email addresses (case-insensitive)
const EMAIL_REGEX = /[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi

// Matches href values that look like a contact page
const CONTACT_HREF_REGEX = /href=["']([^"']*(?:contact|get-in-touch|contact-us|reach-us|contactus)[^"']*)["']/gi

/* ─── HTML helpers ────────────────────────────────────── */

/**
 * Fetch the raw HTML of a URL.
 * Returns empty string on error (timeout, DNS fail, non-200, etc.)
 */
const fetchHtml = async (url) => {
    try {
        const res = await axios.get(url, {
            timeout: HTML_TIMEOUT,
            headers: {
                // Appear as a regular browser so sites don't block the request
                "User-Agent":
                    "Mozilla/5.0 (compatible; LocitraBot/1.0; +https://locitra.ai)"
            },
            // Don't follow more than 3 redirects
            maxRedirects: 3,
            // Accept only HTML-ish responses
            validateStatus: s => s < 400
        })
        return typeof res.data === "string" ? res.data : ""
    } catch {
        return ""
    }
}

/**
 * Extract the first email address from an HTML string.
 * Skips obvious placeholder / noreply addresses.
 */
const extractEmail = (html) => {
    if (!html) return ""

    const matches = [...html.matchAll(EMAIL_REGEX)].map(m => m[0].toLowerCase())

    const skip = ["noreply", "no-reply", "donotreply", "example.com", "sentry.io", "w3.org"]

    for (const email of matches) {
        if (!skip.some(s => email.includes(s))) {
            return email
        }
    }
    return ""
}

/**
 * Extract potential /contact page href values from HTML.
 * Returns the first match, resolving relative URLs against the base origin.
 */
const extractContactLink = (html, baseUrl) => {
    if (!html) return ""

    const matches = [...html.matchAll(CONTACT_HREF_REGEX)]
    if (!matches.length) return ""

    const raw = matches[0][1]
    if (!raw) return ""

    // If it's already absolute, return as-is
    if (raw.startsWith("http")) return raw

    // Resolve relative path
    try {
        const base = new URL(baseUrl)
        return new URL(raw, base.origin).href
    } catch {
        return ""
    }
}

/* ─── Social profile search ───────────────────────────── */

/**
 * Runs a single SerpAPI Google Search to find social profiles.
 * Uses the OR operator so one request can match Facebook, Instagram, OR LinkedIn.
 * Returns { facebook, instagram, linkedin } — empty string means not found.
 */
const findSocialProfiles = async (business, city) => {

    const result = { facebook: "", instagram: "", linkedin: "" }

    try {
        const query = `"${business.name}" ${city} site:facebook.com OR site:instagram.com OR site:linkedin.com`

        const res = await axios.get(SERPAPI_URL, {
            params: {
                engine: "google",
                q: query,
                num: 8,
                api_key: process.env.SERPAPI_KEY
            },
            timeout: SERP_TIMEOUT
        })

        const organicResults = res.data?.organic_results || []

        for (const r of organicResults) {
            const link = r.link || ""
            const lower = link.toLowerCase()

            if (!result.facebook && lower.includes("facebook.com/")) result.facebook = link
            if (!result.instagram && lower.includes("instagram.com/")) result.instagram = link
            if (!result.linkedin && lower.includes("linkedin.com/")) result.linkedin = link

            // Stop as soon as we have all three
            if (result.facebook && result.instagram && result.linkedin) break
        }

    } catch (err) {
        console.warn(
            `[contactDiscovery] ⚠️  Social search failed for "${business.name}": ${err.message}`
        )
    }

    return result
}

/* ─── Core enrichment function ─────────────────────────── */

/**
 * enrichContacts(business, city)
 *
 * Attempts to discover and attach contact details to a single business.
 * Returns the (possibly mutated) business object.
 */
const enrichContacts = async (business, city) => {

    // Initialise fields so they're always present in the object
    business.email = business.email || ""
    business.contactPage = business.contactPage || ""
    business.facebook = business.facebook || ""
    business.instagram = business.instagram || ""
    business.linkedin = business.linkedin || ""

    /* ── Step 1: Extract from website if available ─────── */
    if (business.website) {

        // 1a. Fetch homepage HTML
        const homeHtml = await fetchHtml(business.website)

        if (homeHtml) {

            // 1b. Try to get an email from homepage
            if (!business.email) {
                business.email = extractEmail(homeHtml)
            }

            // 1c. Find link to contact page
            if (!business.contactPage) {
                business.contactPage = extractContactLink(homeHtml, business.website)
            }

            // 1d. If a contact page was found and email is still missing, fetch it too
            if (business.contactPage && !business.email) {
                const contactHtml = await fetchHtml(business.contactPage)
                business.email = extractEmail(contactHtml)
            }

        }

    }

    /* ── Step 2: Social profile search (always runs) ──── */
    const social = await findSocialProfiles(business, city)

    if (social.facebook) business.facebook = social.facebook
    if (social.instagram) business.instagram = social.instagram
    if (social.linkedin) business.linkedin = social.linkedin

    /* ── Logging ─────────────────────────────────────── */
    const found = []
    if (business.email) found.push(`email: ${business.email}`)
    if (business.contactPage) found.push(`contact page`)
    if (business.facebook) found.push(`facebook`)
    if (business.instagram) found.push(`instagram`)
    if (business.linkedin) found.push(`linkedin`)

    if (found.length) {
        console.log(`[contactDiscovery] ✅ "${business.name}" → ${found.join(", ")}`)
    } else {
        console.log(`[contactDiscovery] ❌ "${business.name}" → no contact data found`)
    }

    return business

}

/* ─── Batch entry point ────────────────────────────────── */

/**
 * enrichAllContacts(businesses, city)
 *
 * Runs contact discovery for up to MAX_ENRICHMENTS businesses.
 * Prioritises businesses that already have a website (higher hit rate).
 *
 * @param {object[]} businesses - Full enriched business array
 * @param {string}   city       - City name used in search queries
 * @returns {object[]}          - Same array with contact fields attached
 */
const enrichAllContacts = async (businesses, city) => {

    if (!businesses || businesses.length === 0) return businesses

    // Prioritise: businesses with a website first (email extraction more likely),
    // then sort the rest after. Cap at MAX_ENRICHMENTS.
    const withSite = businesses.filter(b => b.website)
    const withoutSite = businesses.filter(b => !b.website)
    const prioritised = [...withSite, ...withoutSite].slice(0, MAX_ENRICHMENTS)

    console.log(
        `[contactDiscovery] Starting contact enrichment for ` +
        `${prioritised.length}/${businesses.length} businesses ` +
        `(${withSite.length} have website, ${withoutSite.length} don't)…`
    )

    // Build index for O(1) write-back
    const indexMap = new Map(
        businesses.map((b, i) => [`${b.name}::${b.address}`, i])
    )

    let enriched = 0

    for (const business of prioritised) {

        const before = { ...business }
        await enrichContacts(business, city)

        // Count as "enriched" if anything was found
        const gained =
            (business.email && !before.email) ||
            (business.contactPage && !before.contactPage) ||
            (business.facebook && !before.facebook) ||
            (business.instagram && !before.instagram) ||
            (business.linkedin && !before.linkedin)

        if (gained) {
            enriched++
            const key = `${business.name}::${business.address}`
            const idx = indexMap.get(key)
            if (idx !== undefined) businesses[idx] = business
        }

        // Rate-limit between businesses
        await new Promise(r => setTimeout(r, INTER_DELAY))

    }

    console.log(
        `[contactDiscovery] Complete. ` +
        `${enriched}/${prioritised.length} businesses gained contact data.`
    )

    return businesses

}

module.exports = { enrichAllContacts, enrichContacts, extractEmail, findSocialProfiles }

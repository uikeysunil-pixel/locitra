const Business = require("../models/business.model")

/**
 * POST /api/outreach/find-contact
 *
 * Cost-free contact discovery system.
 * Strategy (cache-first, strictly free):
 *   1. Check MongoDB (Business collection) for existing phone/email/website
 *   2. Generate free search links (Google / Social) if not found
 *   3. Never mutate existing data without explicit confirmation
 */
exports.findContact = async (req, res) => {
    try {
        const { name, city, address, leadId } = req.body

        if (!name && !leadId) {
            return res.status(400).json({ success: false, message: "Business name or ID required" })
        }

        // ── Step 1: Check MongoDB for an already-enriched record ──────────
        let existing = null;
        if (leadId) {
            existing = await Business.findById(leadId).lean()
        } else if (name) {
            existing = await Business.findOne({
                name: { $regex: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }
            }).lean()
        }

        if (existing) {
            const o = existing.outreach || {}
            const c = existing.contact || {}
            
            const phone    = o.phone    || c.phone    || existing.phone
            const email    = o.email    || c.email    || existing.email
            const website  = o.website  || c.website  || existing.website
            
            // Check existing data payload 
            const mapsData = existing.mapsData || null;
            const fallbackPhone = mapsData?.phone || null;
            const fallbackWebsite = mapsData?.website || null;

            const finalPhone = phone || fallbackPhone || null;
            const finalWebsite = website || fallbackWebsite || null;

            if (finalPhone || email || finalWebsite) {
                return res.json({
                    success: true,
                    source: "cache",
                    confidence: "high",
                    contact: { 
                        phone: finalPhone, 
                        email: email || null, 
                        website: finalWebsite, 
                        facebook: o.socials?.facebook || c.socials?.facebook || existing.facebook || null, 
                        instagram: o.socials?.instagram || c.socials?.instagram || existing.instagram || null 
                    }
                })
            }
        }

        // ── Step 2: Generate Free Search Links (No API interaction) ─────────────
        const baseQuery = encodeURIComponent(`${name} ${city || ""} contact`.trim())
        const socialQuery = encodeURIComponent(`${name} ${city || ""} instagram facebook`.trim())
        
        const googleSearch = `https://www.google.com/search?q=${baseQuery}`
        const socialSearch = `https://www.google.com/search?q=${socialQuery}`

        return res.json({
            success: true,
            source: "search-links",
            confidence: "manual",
            contact: {
                googleSearch,
                socialSearch
            }
        })

    } catch (err) {
        console.error("[findContact] error:", err.message)
        res.status(500).json({ success: false, message: "Contact finder failed" })
    }
}

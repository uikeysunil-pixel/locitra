/**
 * seoAuditEngine.js
 * Rule-based SEO audit generating targeted sales flags from business data.
 * No external API dependency — pure logic, fast and free.
 */

/**
 * Generate an SEO audit for a business.
 * @param {object} business  - A business object from the scanner
 * @returns {{ flags: string[], summary: string, urgency: "High"|"Medium"|"Low" }}
 */
exports.generateAudit = (business) => {
    const flags = []

    /* ── Website ────────────────────────────────── */
    if (!business.website) {
        flags.push("❌ No website — completely invisible in Google search results.")
    }

    /* ── Reviews ────────────────────────────────── */
    const reviews = Number(business.reviews) || 0
    if (reviews === 0) {
        flags.push("⚠️ Zero reviews — no social proof, losing customers to competitors.")
    } else if (reviews < 10) {
        flags.push(`⚠️ Only ${reviews} reviews — well below the 50+ local map pack threshold.`)
    } else if (reviews < 30) {
        flags.push(`📉 Low review count (${reviews}) — competitors with 50+ reviews rank above them.`)
    }

    /* ── Rating ─────────────────────────────────── */
    const rating = Number(business.rating) || 0
    if (rating > 0 && rating < 3.5) {
        flags.push(`🔴 Rating ${rating}/5 — actively damaging trust and converting fewer calls.`)
    } else if (rating > 0 && rating < 4.0) {
        flags.push(`🟡 Rating ${rating}/5 — below the 4.0 trust threshold; leaking foot traffic.`)
    }

    /* ── Contact signals ────────────────────────── */
    if (!business.phone) {
        flags.push("📵 No phone number — customers cannot call to enquire.")
    }
    if (!business.email && !business.contactPage) {
        flags.push("📭 No contact email or contact page found.")
    }

    /* ── Social ─────────────────────────────────── */
    const hasSocial = business.facebook || business.instagram || business.linkedin
    if (!hasSocial) {
        flags.push("📱 No social media presence — zero community engagement signals.")
    }

    /* ── Urgency level ───────────────────────────── */
    const urgency = flags.length >= 4 ? "High" : flags.length >= 2 ? "Medium" : "Low"

    /* ── Human summary ───────────────────────────── */
    const summaryMap = {
        High: `This business has ${flags.length} critical gaps and is a high-priority prospect. They are likely losing 30–50% of potential customers today.`,
        Medium: `This business has ${flags.length} gaps. Fixing them would meaningfully improve their local visibility and call volume.`,
        Low: `This business is relatively well-optimised but could still benefit from improvements.`
    }

    // Calculate seoScore based on flags and urgency
    // Start at 100, subtract for each flag
    let seoScore = 100 - (flags.length * 10);
    if (urgency === "High") seoScore = Math.min(seoScore, 50);
    else if (urgency === "Medium") seoScore = Math.min(seoScore, 75);
    seoScore = Math.max(seoScore, 20);

    return {
        seoScore,
        issues: flags, // Matching required format
        flags, // Keep for backward compatibility
        urgency,
        summary: summaryMap[urgency]
    }
}

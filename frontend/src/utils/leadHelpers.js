/**
 * leadHelpers.js
 *
 * Shared pure functions for lead-derived values.
 * Import these wherever you need leadValue or mapUrl
 * instead of recalculating inline.
 */

/**
 * Returns the display lead value string for a lead.
 * @param {object} lead
 * @returns {string}  e.g. "$275"
 */
export function getLeadValue(lead) {
    const score = lead?.opportunityScore ?? 0
    return `$${Math.round(score * 5)}`
}

/**
 * Returns the best available Google Maps URL for a lead.
 * Prefers the stored mapsLink (direct business listing).
 * Falls back to a name-based search.
 * @param {object} lead
 * @returns {string|null}
 */
export function getMapUrl(lead) {
    if (!lead) return null
    return (
        lead.mapsLink ||
        lead.mapUrl ||
        (lead.name
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name)}`
            : null)
    )
}

/**
 * Pass-through normalizer for SerpAPI results pre-normalized by businessScanner.
 * Deduplicates by name+address (no place_id in SerpAPI), and stamps
 * keyword + location for the MongoDB compound index.
 */
exports.normalizeBusinesses = (places, keyword, location) => {

    const seen = new Set()

    return places
        .filter((place) => {
            // Deduplicate by name + address fingerprint
            const key = `${(place.name || "").toLowerCase()}::${(place.address || "").toLowerCase()}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
        .map((place) => ({
            name: place.name || "",
            address: place.address || "",
            rating: place.rating || 0,
            reviews: place.reviews || 0,
            phone: place.phone || "",
            website: place.website || "",
            category: place.category || "unknown",
            placeId: place.placeId || undefined,
            lat: place.lat || null,
            lng: place.lng || null,
            opportunityScore: place.opportunityScore ?? 0,
            keyword: keyword.toLowerCase().trim(),
            location: location.toLowerCase().trim()
        }))

}

// Legacy single-record normalizer (kept for backward compatibility)
exports.normalizeBusiness = (place) => {

    return {
        name: place.name || place.title || "",
        address: place.address || place.formatted_address || "",
        rating: place.rating || 0,
        reviews: place.reviews || place.user_ratings_total || 0,
        phone: place.phone || "",
        website: place.website || "",
        category: place.category || place.type || "unknown"
    }

}

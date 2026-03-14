function calculateLeadScore(business) {

    let score = 0

    // Low reviews = opportunity
    if (business.totalReviews < 20) score += 40
    else if (business.totalReviews < 50) score += 20

    // Low rating = opportunity
    if (business.rating < 4) score += 30

    // No website = big opportunity
    if (!business.website) score += 30

    // Determine label
    if (score >= 70) return "🔥 HIGH VALUE LEAD"
    if (score >= 40) return "⚠️ MEDIUM LEAD"

    return "❌ LOW LEAD"
}

module.exports = calculateLeadScore

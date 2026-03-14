exports.analyzeBusiness = (business) => {

    let score = 100
    let weaknesses = []

    const reviews = Number(business.reviews) || 0
    const rating = Number(business.rating) || 0

    // Review strength
    if (reviews < 50) {
        score -= 35
        weaknesses.push("Very low reviews")
    }
    else if (reviews < 150) {
        score -= 25
        weaknesses.push("Low reviews")
    }
    else if (reviews < 300) {
        score -= 15
        weaknesses.push("Average reviews")
    }

    // Rating strength
    if (rating < 4.2) {
        score -= 25
        weaknesses.push("Low rating")
    }
    else if (rating < 4.5) {
        score -= 10
        weaknesses.push("Rating below competitors")
    }

    // Website check
    if (!business.website) {
        score -= 20
        weaknesses.push("No website")
    }

    // Clamp score
    if (score < 0) score = 0

    let opportunity = "Low"

    if (score < 60) opportunity = "High"
    else if (score < 80) opportunity = "Medium"

    return {
        seoScore: score,
        opportunity,
        weaknesses
    }

}
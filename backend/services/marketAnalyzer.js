exports.analyzeMarket = (businesses = []) => {

    if (!Array.isArray(businesses) || businesses.length === 0) {
        return {
            marketDifficulty: 0,
            averageReviews: 0,
            averageRating: 0,
            opportunityLevel: "Unknown",
            businessesWithoutWebsite: 0
        }
    }

    // Remove duplicate businesses
    const uniqueBusinesses = Array.from(
        new Map(businesses.map(b => [(b.place_id || b.name), b])).values()
    )

    let totalReviews = 0
    let totalRating = 0
    let businessesWithoutWebsite = 0

    uniqueBusinesses.forEach((b) => {

        const reviews = Number(b.reviews || b.totalReviews || 0)
        const rating = Number(b.rating || 0)

        totalReviews += reviews
        totalRating += rating

        if (!b.website || b.website === "-") {
            businessesWithoutWebsite++
        }

    })

    const averageReviews = Math.round(totalReviews / uniqueBusinesses.length)
    const averageRating = Number((totalRating / uniqueBusinesses.length).toFixed(1))

    let marketDifficulty = 0

    // Review strength
    if (averageReviews > 500) marketDifficulty += 40
    else if (averageReviews > 200) marketDifficulty += 30
    else if (averageReviews > 100) marketDifficulty += 20
    else marketDifficulty += 10

    // Rating strength
    if (averageRating >= 4.7) marketDifficulty += 40
    else if (averageRating >= 4.4) marketDifficulty += 30
    else if (averageRating >= 4.0) marketDifficulty += 20
    else marketDifficulty += 10

    // Website opportunity factor
    const websiteRatio = businessesWithoutWebsite / uniqueBusinesses.length

    if (websiteRatio > 0.5) {
        marketDifficulty -= 10
    }

    // Clamp difficulty between 0 and 100
    marketDifficulty = Math.max(0, Math.min(100, marketDifficulty))

    let opportunityLevel = "Low"

    if (marketDifficulty < 40) opportunityLevel = "High"
    else if (marketDifficulty < 70) opportunityLevel = "Medium"

    return {
        marketDifficulty,
        averageReviews,
        averageRating,
        opportunityLevel,
        businessesWithoutWebsite,
        businessesAnalyzed: uniqueBusinesses.length
    }

}
const axios = require("axios")

let cache = {}

exports.collectBusinesses = async (keyword, location) => {

    const cacheKey = `${keyword}_${location}`

    if (cache[cacheKey]) {
        return cache[cacheKey]
    }

    const results = []

    const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/textsearch/json",
        {
            params: {
                query: `${keyword} in ${location}`,
                key: process.env.GOOGLE_MAPS_KEY
            }
        }
    )

    results.push(...response.data.results)

    cache[cacheKey] = results

    return results
}
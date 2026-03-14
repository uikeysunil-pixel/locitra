const axios = require("axios")
const { analyzeBusiness } = require("../services/seoAnalyzer")
const { analyzeMarket } = require("../services/marketAnalyzer")
const Business = require("../models/business.model")

exports.searchBusinesses = async (req, res) => {

    try {

        const { keyword, location } = req.query

        if (!keyword || !location) {
            return res.status(400).json({
                error: "Keyword and location required"
            })
        }

        const query = `${keyword} in ${location}`

        const response = await axios.get("https://serpapi.com/search.json", {
            params: {
                engine: "google_maps",
                q: query,
                type: "search",
                hl: "en",
                gl: "us",
                google_domain: "google.com",
                api_key: process.env.SERPAPI_KEY
            }
        })

        const results = response.data.local_results || []

        // Remove duplicates
        const uniqueResults = Array.from(
            new Map(
                results.map(b => [b.data_id || b.place_id || b.title, b])
            ).values()
        )

        const businesses = uniqueResults.map((business) => {

            const reviews =
                business.reviews ??
                business.user_ratings_total ??
                business.total_reviews ??
                0

            let phone =
                business.phone ||
                business.phone_number ||
                business.displayed_phone_number ||
                null

            if (Array.isArray(phone)) phone = phone[0]

            let website =
                business.website ||
                business.link ||
                business.menu ||
                null

            if (typeof website !== "string") website = null

            const data = {

                name: business.title || "Unknown",

                rating: Number(business.rating) || 0,

                reviews: Number(reviews) || 0,

                address: business.address || null,

                phone,

                website,

                place_id: business.place_id || business.data_id || null,

                location

            }

            const analysis = analyzeBusiness(data)

            return {
                ...data,
                ...analysis
            }

        })

        // Save to database
        if (businesses.length) {

            const docs = businesses.map(b => ({

                name: b.name,

                keyword,
                location,

                rating: b.rating,

                reviews: b.reviews,

                address: b.address,

                phone: b.phone,

                website: b.website,

                seoScore: b.seoScore || 0,

                opportunity: b.opportunity || "Low",

                opportunityScore: b.opportunityScore || 0,

                estimatedValue: b.estimatedValue || "$1000-$2000",

                weaknesses: b.weaknesses || [],

                place_id: b.place_id

            }))

            await Business.insertMany(docs, { ordered: false }).catch(() => { })

        }

        const leads = businesses.filter(
            b => b.opportunity === "High" || b.opportunity === "Medium"
        )

        const marketAnalysis = analyzeMarket(businesses)

        res.json({

            totalBusinesses: businesses.length,

            totalLeads: leads.length,

            marketAnalysis,

            leads,

            businesses

        })

    } catch (error) {

        console.error("Search error:", error.message)

        res.status(500).json({
            error: "Search failed"
        })

    }

}
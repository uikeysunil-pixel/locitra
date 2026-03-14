const axios = require("axios")
const { enrichLead } = require("../services/enrichment.service")

const categories = [
    "dentist",
    "plumber",
    "roofing contractor",
    "lawyer",
    "restaurant",
    "gym",
    "real estate agent",
    "car repair"
]

exports.scanCity = async (req, res) => {

    try {

        const { city } = req.query

        if (!city || city.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "City required"
            })
        }

        const normalizedCity = city.trim()

        // Scan all categories in parallel
        const requests = categories.map(category =>
            axios.get(`${process.env.API_BASE_URL}/api/leads`, {
                params: {
                    keyword: category,
                    location: normalizedCity
                },
                timeout: 10000
            })
                .then(response => ({
                    category,
                    leads: response.data?.leads || []
                }))
                .catch(err => {
                    console.error(`Category scan failed: ${category}`)
                    return { category, leads: [] }
                })
        )

        const responses = await Promise.all(requests)

        let allLeads = []

        for (const { category, leads } of responses) {

            const enrichedLeads = await Promise.all(

                leads.map(lead =>
                    enrichLead({
                        ...lead,
                        category,
                        city: normalizedCity
                    })
                )

            )

            allLeads.push(...enrichedLeads)

        }

        // Remove duplicates (better key)
        const seen = new Set()
        const uniqueLeads = []

        for (const lead of allLeads) {

            const key = `${lead.name}-${lead.address || ""}-${lead.city}`.toLowerCase()

            if (!seen.has(key)) {
                seen.add(key)
                uniqueLeads.push(lead)
            }

        }

        // Sort by opportunity score
        uniqueLeads.sort((a, b) =>
            (b.opportunityScore || 0) - (a.opportunityScore || 0)
        )

        res.json({
            success: true,
            scannedCategories: categories.length,
            totalLeads: uniqueLeads.length,
            leads: uniqueLeads
        })

    } catch (error) {

        console.error("City scan failed:", error.message)

        res.status(500).json({
            success: false,
            message: "City scan failed"
        })

    }

}
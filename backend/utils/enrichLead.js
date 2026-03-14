const axios = require("axios")

async function enrichLead(lead) {

    try {

        // If your lead already contains these fields just return
        if (lead.phone || lead.website || lead.mapsLink) {
            return lead
        }

        // fallback enrichment placeholder
        return {
            ...lead,
            phone: lead.phone || "",
            website: lead.website || "",
            mapsLink: lead.mapsLink || `https://www.google.com/maps/search/${encodeURIComponent(lead.name)}`
        }

    } catch (error) {

        console.error("Lead enrichment failed:", error)

        return lead

    }

}

module.exports = enrichLead
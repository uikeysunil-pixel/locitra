const axios = require("axios");
const Lead = require("../models/lead.model");

const SERPAPI_URL = "https://serpapi.com/search.json";

/**
 * Validates if a discovered URL is a real business website and not a directory.
 */
function isValidBusinessWebsite(url) {
    if (!url) return false;
    const blocked = [
        "yelp.com",
        "facebook.com",
        "mapquest.com",
        "yellowpages.com",
        "tripadvisor.com",
        "foursquare.com",
        "instagram.com",
        "twitter.com",
        "linkedin.com",
        "apple.com",
        "google.com"
    ];
    const lower = url.toLowerCase();
    return !blocked.some(domain => lower.includes(domain));
}

/**
 * Discovers a business website using SerpAPI.
 */
async function discoverWebsite(name, city) {
    if (!name) return null;
    
    console.log("Finding website for:", name);
    
    try {
        const query = `${name} ${city || ""} official website`;
        const response = await axios.get(SERPAPI_URL, {
            params: {
                engine: "google",
                q: query,
                api_key: process.env.SERPAPI_KEY,
                num: 5 // Get top 5 results to find the best match
            }
        });

        const organicResults = response.data?.organic_results || [];
        
        for (const result of organicResults) {
            const link = result.link;
            if (isValidBusinessWebsite(link)) {
                console.log("Website discovered:", link);
                return link;
            }
        }
        
        console.log("No valid website found for:", name);
        return null;
    } catch (error) {
        console.error(`[websiteDiscovery] Error for ${name}:`, error.message);
        return null;
    }
}

/**
 * Batch processes leads with missing websites.
 */
async function discoverMissingWebsites() {
    console.log("[websiteDiscovery] Starting batch discovery for missing websites...");
    
    try {
        const leads = await Lead.find({
            website: { $in: ["", null] }
        }).limit(10);

        if (leads.length === 0) {
            console.log("[websiteDiscovery] No leads with missing websites found.");
            return;
        }

        console.log(`[websiteDiscovery] Found ${leads.length} leads to process.`);

        for (const lead of leads) {
            const discoveredUrl = await discoverWebsite(lead.name, lead.city);
            if (discoveredUrl) {
                lead.website = discoveredUrl;
                await lead.save();
                console.log(`[websiteDiscovery] Updated ${lead.name} with ${discoveredUrl}`);
            }
        }
        
        console.log("[websiteDiscovery] Batch discovery complete.");
    } catch (error) {
        console.error("[websiteDiscovery] Batch discovery error:", error.message);
    }
}

module.exports = {
    discoverWebsite,
    discoverMissingWebsites
};

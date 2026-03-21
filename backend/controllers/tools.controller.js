const Business = require("../models/business.model");
const { enrichLead } = require("../services/enrichment.service");
const { serpRequest } = require("../utils/serpClient");

/**
 * Website Presence Checker Controller
 * Analyzes a business's online presence (website, socials, etc.)
 */
exports.checkWebsitePresence = async (req, res) => {
    try {
        const { name, city } = req.body;
        const user = req.user;
        const isAdmin = user?.role === "admin";

        if (!name || !city) {
            return res.status(400).json({ success: false, message: "Business name and city are required." });
        }

        const nameNormalized = name.trim().toLowerCase();
        const cityNormalized = city.trim().toLowerCase();

        // 1. Check MongoDB Cache FIRST
        console.log(`[PresenceChecker] Checking cache for: ${nameNormalized} in ${cityNormalized}`);
        let business = await Business.findOne({ 
            name: new RegExp(`^${nameNormalized}$`, "i"), 
            city: new RegExp(`^${cityNormalized}$`, "i") 
        });

        if (business) {
            console.log(`[PresenceChecker] Cache HIT for: ${business.name}`);
            return res.json({
                success: true,
                source: "cache",
                data: business
            });
        }

        // 2. Cache MISS -> Live Search via SerpAPI
        console.log(`[PresenceChecker] Cache MISS. Searching live for: ${name} in ${city}`);
        
        const searchData = await serpRequest({
            engine: "google_maps",
            q: `${name} in ${city}`,
            type: "search"
        });

        const firstResult = searchData?.local_results?.[0];

        if (!firstResult) {
            return res.status(404).json({
                success: false,
                message: "Could not find a business with that name and city."
            });
        }

        // Create business object from SerpAPI result
        const businessObj = {
            name: firstResult.title,
            address: firstResult.address || "",
            city: cityNormalized,
            phone: firstResult.phone || "",
            website: firstResult.website || firstResult.links?.website || "",
            rating: firstResult.rating || 0,
            reviews: firstResult.reviews || 0,
            category: firstResult.type || "unknown",
            placeId: firstResult.place_id || firstResult.data_id || undefined,
            lat: firstResult.gps_coordinates?.latitude || null,
            lng: firstResult.gps_coordinates?.longitude || null,
        };

        // 3. Enrich the business (Find website if missing, find socials)
        console.log(`[PresenceChecker] Enriching: ${businessObj.name}`);
        const enrichedBusiness = await enrichLead(businessObj, true);

        // 4. Save to MongoDB (Store in cache)
        let savedBusiness;
        try {
            savedBusiness = await Business.findOneAndUpdate(
                { name: enrichedBusiness.name, city: enrichedBusiness.city },
                { $set: enrichedBusiness },
                { upsert: true, new: true, runValidators: true }
            );
        } catch (saveErr) {
            console.error("[PresenceChecker] Save failed:", saveErr.message);
            savedBusiness = enrichedBusiness; 
        }

        return res.json({
            success: true,
            source: "live-enrichment",
            data: savedBusiness
        });

    } catch (error) {
        console.error("Presence Checker Error:", error);
        res.status(500).json({ success: false, message: error.message || "An error occurred during status check." });
    }
};

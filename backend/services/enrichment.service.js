const axios = require('axios');
const EnrichmentCache = require('../models/enrichmentCache.model');
const { contactFinder } = require('./contactFinder');
const { discoverWebsite } = require('./websiteDiscovery');
const { generateAudit } = require('./ai/seoAuditEngine');
const { generateOutreach } = require('./ai/outreachGenerator');

const SERPAPI_URL = "https://serpapi.com/search.json";

async function enrichLead(business, forceWebsiteDiscovery = false) {
    if (!business || !business.name || !business.city) return business;

    console.log(`[Enrichment] Processing: ${business.name} in ${business.city}`);

    // If website discovery is explicitly requested and missing
    if (forceWebsiteDiscovery && !business.website) {
        console.log(`[Enrichment] Attempting website discovery for ${business.name}...`);
        const discovered = await discoverWebsite(business.name, business.city);
        if (discovered) {
            business.website = discovered;
        }
    }

    // Worker Constraint: If still no website, we skip contact discovery and SEO analysis 
    // unless we want to process what we have.
    if (!business.website) {
        console.log(`[Enrichment] Skipping full enrichment for ${business.name}: No website.`);
        return business;
    }

    // 1. Check cache
    const cached = await EnrichmentCache.findOne({
        businessName: business.name,
        city: business.city,
        expiresAt: { $gt: new Date() }
    });

    if (cached) {
        console.log(`[Enrichment] Cache hit for ${business.name}`);
        business.email = business.email || cached.email;
        business.facebook = business.facebook || cached.facebook;
        business.instagram = business.instagram || cached.instagram;
        business.linkedin = business.linkedin || cached.linkedin;
        business.twitter = business.twitter || cached.twitter;
        business.youtube = business.youtube || cached.youtube;
        business.tiktok = business.tiktok || cached.tiktok;
        business.contactPage = business.contactPage || cached.contactPage;
    } else {
        // 2. Discover Contacts if email is missing
        if (!business.email) {
            console.log(`[Enrichment] Running contact finder for ${business.website}`);
            const { email, socials } = await contactFinder(business.website);
            
            business.email = email || business.email;
            business.facebook = socials.facebook || business.facebook;
            business.instagram = socials.instagram || business.instagram;
            business.linkedin = socials.linkedin || business.linkedin;
            business.twitter = socials.twitter || business.twitter;
            business.youtube = socials.youtube || business.youtube;
            business.tiktok = socials.tiktok || business.tiktok;
        }

        // 3. Cache results
        try {
            await EnrichmentCache.findOneAndUpdate(
                { businessName: business.name, city: business.city },
                {
                    website: business.website || "",
                    email: business.email || "",
                    facebook: business.facebook || "",
                    instagram: business.instagram || "",
                    linkedin: business.linkedin || "",
                    twitter: business.twitter || "",
                    youtube: business.youtube || "",
                    tiktok: business.tiktok || "",
                    contactPage: business.contactPage || "",
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                },
                { upsert: true, returnDocument: "after" }
            );
        } catch (e) {
            console.error("[Enrichment] Cache Save Error:", e.message);
        }
    }

    // 4. Run SEO Analyzer
    console.log(`[Enrichment] Running SEO analyzer for ${business.name}`);
    const audit = generateAudit(business);
    business.seoAudit = audit;
    business.seoScore = audit.urgency === "High" ? 40 : audit.urgency === "Medium" ? 70 : 90;

    // 5. Generate Outreach
    console.log(`[Enrichment] Generating outreach for ${business.name}`);
    const outreach = generateOutreach(business, audit);
    business.outreach = outreach;

    // Save enrichment results back to the lead/business model
    if (business.save) {
        await business.save();
    } else {
        // If it's a plain search result object, we might need to find it and update it
        const Business = require("../models/business.model");
        await Business.updateOne({ name: business.name, city: business.city }, { $set: business });
    }

    return business;
}

module.exports = { enrichLead };

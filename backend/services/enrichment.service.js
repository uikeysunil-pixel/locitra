const axios = require('axios');
const EnrichmentCache = require('../models/enrichmentCache.model');
const { contactFinder } = require('./contactFinder');
const { discoverWebsite } = require('./websiteDiscovery');
const { generateAudit } = require('./ai/seoAuditEngine');
const { generateOutreach } = require('./ai/outreachGenerator');

const SERPAPI_URL = "https://serpapi.com/search.json";

async function enrichLead(business) {
    if (!business || !business.name || !business.city) return business;

    console.log(`Running enrichment for: ${business.name} in ${business.city}`);

    // STEP 2 — Update Lead Enrichment
    if (!business.website) {
        console.log(`Website missing for ${business.name}. Attempting discovery...`);
        const discovered = await discoverWebsite(business.name, business.city);
        if (discovered) {
            business.website = discovered;
        }
    }

    // Enrichment requirement: If still no website, skip contact discovery and SEO
    if (!business.website) {
        console.log(`Skipping full enrichment for ${business.name}: No website discovered.`);
        return business;
    }

    // 1. Check cache
    const cached = await EnrichmentCache.findOne({
        businessName: business.name,
        city: business.city,
        expiresAt: { $gt: new Date() }
    });

    if (cached) {
        console.log(`Cache hit for enrichment: ${business.name}`);
        business.email = business.email || cached.email;
        business.facebook = business.facebook || cached.facebook;
        business.instagram = business.instagram || cached.instagram;
        business.linkedin = business.linkedin || cached.linkedin;
        business.twitter = business.twitter || cached.twitter;
        business.youtube = business.youtube || cached.youtube;
        business.tiktok = business.tiktok || cached.tiktok;
        business.contactPage = business.contactPage || cached.contactPage;
        
        // Even if we hit cache, we might still want to run SEO and Outreach 
        // if they aren't in the cache model or if we want fresh AI output.
        // Assuming we want to run them now as per pipeline rules.
    } else {
        // 2. Discover Contacts if email is missing
        if (!business.email) {
            console.log(`Running contact finder for ${business.website}`);
            const { email, socials } = await contactFinder(business.website);
            
            business.email = email || business.email;
            business.facebook = socials.facebook || business.facebook;
            business.instagram = socials.instagram || business.instagram;
            business.linkedin = socials.linkedin || business.linkedin;
            business.twitter = socials.twitter || business.twitter;
            business.youtube = socials.youtube || business.youtube;
            business.tiktok = socials.tiktok || business.tiktok;
        } else {
            console.log(`Email already exists for ${business.name}, skipping contact discovery.`);
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
                { upsert: true, new: true }
            );
        } catch (e) {
            console.error("Enrichment Cache Save Error:", e.message);
        }
    }

    // 4. Run SEO Analyzer
    console.log(`Running SEO analyzer for ${business.name}`);
    const audit = generateAudit(business);
    business.seoAudit = audit;
    business.seoScore = audit.urgency === "High" ? 40 : audit.urgency === "Medium" ? 70 : 90; // Approximate score

    // 5. Generate Outreach
    console.log(`Generating outreach for ${business.name}`);
    const outreach = generateOutreach(business, audit);
    business.outreach = outreach;

    return business;
}

module.exports = { enrichLead };

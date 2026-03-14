const axios = require('axios');
const EnrichmentCache = require('../models/enrichmentCache.model');

const SERPAPI_URL = "https://serpapi.com/search.json";

function extractEmails(html) {
    // Basic regex for emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = html.match(emailRegex) || [];
    // Filter out common false positives (like .png or weird domains)
    const filtered = matches.filter(e => {
        const ext = e.split('.').pop().toLowerCase();
        return !['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
    });
    return [...new Set(filtered.map(e => e.toLowerCase()))];
}

function extractSocialLinks(html) {
    const links = { facebook: "", instagram: "", linkedin: "" };
    const fbMatch = html.match(/https?:\/\/(?:www\.)?facebook\.com\/[^"'\s<]+/i);
    const igMatch = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[^"'\s<]+/i);
    const liMatch = html.match(/https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^"'\s<]+/i);

    if (fbMatch) links.facebook = fbMatch[0];
    if (igMatch) links.instagram = igMatch[0];
    if (liMatch) links.linkedin = liMatch[0];

    return links;
}

async function fetchHtml(url) {
    try {
        const res = await axios.get(url, { timeout: 10000, maxRedirects: 3 });
        return typeof res.data === 'string' ? res.data : '';
    } catch (e) {
        return '';
    }
}

async function enrichLead(business) {
    if (!business || !business.name || !business.city) return business;

    // 1. Check cache
    const cached = await EnrichmentCache.findOne({
        businessName: business.name,
        city: business.city,
        expiresAt: { $gt: new Date() }
    });

    if (cached) {
        business.website = business.website || cached.website;
        business.email = business.email || cached.email;
        business.facebook = business.facebook || cached.facebook;
        business.instagram = business.instagram || cached.instagram;
        business.linkedin = business.linkedin || cached.linkedin;
        business.contactPage = business.contactPage || cached.contactPage;
        return business;
    }

    let website = business.website;

    // Step 1: Website Discovery via SERP
    if (!website) {
        try {
            const serpRes = await axios.get(SERPAPI_URL, {
                params: {
                    engine: "google",
                    q: `${business.name} ${business.city} official website`,
                    api_key: process.env.SERPAPI_KEY
                }
            });
            const firstResult = serpRes.data?.organic_results?.[0];
            if (firstResult && firstResult.link && !firstResult.link.includes('facebook') && !firstResult.link.includes('yelp')) {
                website = firstResult.link;
            }
        } catch (e) {
            console.error("Enrichment SERP Discovery Error:", e.message);
        }
    }

    let emails = [];
    let social = { facebook: business.facebook || "", instagram: business.instagram || "", linkedin: business.linkedin || "" };
    let contactPage = business.contactPage || "";
    let potentialEmails = [];

    // Step 2 & 3: Website Crawling
    if (website) {
        const domainMatch = website.match(/^https?:\/\/(?:www\.)?([^/]+)/i);
        const domain = domainMatch ? domainMatch[1] : null;

        const homeHtml = await fetchHtml(website);
        emails.push(...extractEmails(homeHtml));

        const newSocial = extractSocialLinks(homeHtml);
        if (!social.facebook && newSocial.facebook) social.facebook = newSocial.facebook;
        if (!social.instagram && newSocial.instagram) social.instagram = newSocial.instagram;
        if (!social.linkedin && newSocial.linkedin) social.linkedin = newSocial.linkedin;

        // Try contact pages
        const contactPaths = ['/contact', '/contact-us', '/about'];
        for (const p of contactPaths) {
            if (emails.length > 0) break; // Stop early if we have emails
            const pageUrl = website.replace(/\/$/, '') + p;
            const pageHtml = await fetchHtml(pageUrl);
            const moreEmails = extractEmails(pageHtml);
            if (moreEmails.length > 0) {
                contactPage = pageUrl;
                emails.push(...moreEmails);
            }
        }

        // Step 5: Email pattern guessing
        if (emails.length === 0 && domain && !domain.includes("facebook") && !domain.includes("instagram")) {
            potentialEmails = [
                `info@${domain}`,
                `contact@${domain}`,
                `hello@${domain}`,
                `office@${domain}`,
                `admin@${domain}`
            ].map(e => e.toLowerCase());
        }
    }

    // Step 6: SERP Social Discovery
    const discoverSocial = async (platform) => {
        try {
            const serpRes = await axios.get(SERPAPI_URL, {
                params: {
                    engine: "google",
                    q: `site:${platform}.com "${business.name}" ${business.city}`,
                    api_key: process.env.SERPAPI_KEY
                }
            });
            return serpRes.data?.organic_results?.[0]?.link || "";
        } catch (e) { return ""; }
    };

    if (!social.facebook) social.facebook = await discoverSocial("facebook");
    if (!social.instagram) social.instagram = await discoverSocial("instagram");
    if (!social.linkedin) social.linkedin = await discoverSocial("linkedin");

    // Assign back
    business.website = website || business.website;
    business.email = emails[0] || business.email; // pick the first actual email
    if (!business.email && potentialEmails.length > 0 && !business.potentialEmails) {
        // Just storing directly on the object.
        business.potentialEmails = potentialEmails;
    }
    business.facebook = social.facebook || business.facebook;
    business.instagram = social.instagram || business.instagram;
    business.linkedin = social.linkedin || business.linkedin;
    business.contactPage = contactPage || business.contactPage;

    // Step 7: Cache results
    try {
        await EnrichmentCache.findOneAndUpdate(
            { businessName: business.name, city: business.city },
            {
                website: business.website || "",
                email: business.email || "",
                facebook: business.facebook || "",
                instagram: business.instagram || "",
                linkedin: business.linkedin || "",
                contactPage: business.contactPage || "",
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            { upsert: true, new: true }
        );
    } catch (e) {
        console.error("Enrichment Cache Save Error:", e.message);
    }

    return business;
}

module.exports = { enrichLead };

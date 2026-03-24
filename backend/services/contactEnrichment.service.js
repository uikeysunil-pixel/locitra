const axios = require('axios');
const cheerio = require('cheerio');
const Business = require('../models/business.model.js');

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatUrl(url) {
    if (!url) return null;
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = 'https://' + formatted; // Default to https
    }
    return formatted;
}

const DEBUG = true; // Add debug flag

function extractSocialLinks(links, domainUrl) {
    if (!links || !links.length) return {};
    const socials = {};
    const socialPatterns = {
        facebook: /facebook\.com/i,
        instagram: /instagram\.com/i,
        linkedin: /linkedin\.com/i,
        twitter: /twitter\.com|x\.com/i
    };

    for (const link of links) {
        if (!link || typeof link !== 'string') continue;
        const lowerLink = link.toLowerCase();

        // Check against filtering rules for intent/sharer links
        if (lowerLink.includes('facebook.com/sharer') || 
            lowerLink.includes('twitter.com/intent') || 
            lowerLink.includes('x.com/intent')) {
            continue;
        }

        for (const [network, pattern] of Object.entries(socialPatterns)) {
            if (pattern.test(lowerLink)) {
                // Return first valid match for each
                if (!socials[network]) {
                    socials[network] = link;
                }
            }
        }
    }
    return socials;
}

function findContactPage(links) {
    if (!links || !links.length) return null;
    const keywords = ['contact', 'contact-us', 'get-in-touch', 'reach-us'];
    
    for (const link of links) {
        if (!link || typeof link !== 'string') continue;
        const lowerLink = link.toLowerCase();
        
        if (lowerLink.startsWith('mailto:') || lowerLink.startsWith('tel:')) continue;
        
        // Case-insensitive detection
        const isMatch = keywords.some(kw => lowerLink.includes(kw));
        if (isMatch) return link; // return first match
    }
    return null;
}

async function scrapeWebsite(baseUrl) {
    baseUrl = formatUrl(baseUrl);
    if (!baseUrl) return { emails: new Set(), socials: {}, contactPage: null };

    let domainUrl;
    try {
        const parsedUrl = new URL(baseUrl);
        domainUrl = parsedUrl.origin;
    } catch (e) {
        return { emails: new Set(), socials: {}, contactPage: null };
    }

    // Always scrape the exact "website" URL stored in DB (baseUrl),
    // followed by other paths off the main domain.
    const rawUrlsToTry = [
        baseUrl,
        `${domainUrl}/contact`,
        `${domainUrl}/contact-us`,
        `${domainUrl}/about`
    ];
    // Deduplicate to avoid repeating the exact URL
    const uniqueUrls = [...new Set(rawUrlsToTry)];
    
    let emails = new Set();
    let allLinks = [];

    for (const url of uniqueUrls) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const html = response.data;
            if (!html || typeof html !== 'string') continue;

            const $ = cheerio.load(html);

            // Extract emails
            const matches = html.match(EMAIL_REGEX);
            if (matches) {
                matches.forEach(email => {
                    const lowerEmail = email.toLowerCase();
                    // Basic filters
                    if (!lowerEmail.endsWith('.png') && !lowerEmail.endsWith('.jpg') && 
                        !lowerEmail.endsWith('.jpeg') && !lowerEmail.endsWith('.gif') &&
                        !lowerEmail.endsWith('.webp') && !lowerEmail.includes('sentry') &&
                        !lowerEmail.includes('example')
                    ) {
                        emails.add(lowerEmail);
                    }
                });
            }

            // Extract ALL Links Properly & Normalize
            const pageLinks = [];
            $("a").each((_, el) => {
                let href = $(el).attr("href");
                if (href) {
                    href = href.trim();
                    // Skip empty or fragment-only links
                    if (!href || href.startsWith('#')) return;

                    // Convert relative URLs to absolute by prepending base domain
                    if (href.startsWith('/')) {
                        href = domainUrl + href;
                    } else if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                        href = domainUrl + '/' + href;
                    }

                    // Remove URL parameters (?utm=...) and hash
                    href = href.split('?')[0].split('#')[0];
                    pageLinks.push(href);
                    allLinks.push(href);
                }
            });

            // DEBUG LOGGING (REQUIRED)
            if (DEBUG && url === baseUrl) {
                console.log("Processing:", baseUrl);
                console.log("Total links found:", pageLinks.length);
                console.log("All links:", pageLinks);
            }

            await sleep(500);

        } catch (error) {
            // If request fails -> log and continue (Do NOT crash the script)
            // if (DEBUG) console.error(`Failed to scrape ${url}:`, error.message);
        }
    }

    const contactPage = findContactPage(allLinks);
    const socials = extractSocialLinks(allLinks, domainUrl);

    return { emails, socials, contactPage };
}

async function runEnrichment() {
    console.log("Starting background contact enrichment process...");

    try {
        // Find businesses where:
        // website exists AND (contact.email is missing OR outreach.socials are missing)
        const businesses = await Business.find({
            website: { $exists: true, $ne: "", $type: "string" },
            // To ensure we don't pick up businesses we already scraped successfully
            "contact.scrapeStatus": { $ne: "success" },
            $or: [
                { "contact.email": { $exists: false } },
                { "contact.email": null },
                { "contact.email": "" },
                { "contact.contactPage": { $exists: false } },
                { "contact.contactPage": null },
                { "contact.socials": { $exists: false } },
                { "contact.socials.facebook": { $exists: false } },
                { "contact.socials.instagram": { $exists: false } },
                { "contact.socials.linkedin": { $exists: false } },
                { "contact.socials.twitter": { $exists: false } }
            ]
        }).limit(200); // Process max 200 per run to prevent timeout/bloat

        console.log(`Found ${businesses.length} businesses to process for enrichment.`);
        
        const batchSize = 10;
        let processedCount = 0;

        for (let i = 0; i < businesses.length; i += batchSize) {
            const batch = businesses.slice(i, i + batchSize);
            
            const promises = batch.map(async (business) => {
                try {
                    const url = business.website;
                    const { emails, socials, contactPage } = await scrapeWebsite(url);

                    let fetchedEmail = null;
                    if (emails.size > 0) {
                        // Priority could be given to info@, contact@ if multiple exist
                        const emailArr = Array.from(emails);
                        fetchedEmail = emailArr.find(e => e.startsWith('info@') || e.startsWith('contact@')) || emailArr[0];
                    }

                    const updateFields = {};

                    // Mongoose business.get() safely retrieves nested props even if schema doesn't define them
                    const currentContactEmail = business.get('contact.email');
                    if (!currentContactEmail && fetchedEmail) {
                        updateFields['contact.email'] = fetchedEmail;
                        updateFields['outreach.email'] = fetchedEmail;
                    }

                    const currentContactPage = business.get('contact.contactPage');
                    if (!currentContactPage && contactPage) {
                        updateFields['contact.contactPage'] = contactPage;
                        updateFields['outreach.contactPage'] = contactPage;
                    }

                    const networks = ['facebook', 'instagram', 'linkedin', 'twitter'];
                    for (const network of networks) {
                        const currentSocial = business.get(`contact.socials.${network}`);
                        if (!currentSocial && socials[network]) {
                            updateFields[`contact.socials.${network}`] = socials[network];
                            updateFields[`outreach.socials.${network}`] = socials[network];
                        }
                    }

                    // Optional safe enhancements
                    updateFields['contact.contactPageFound'] = !!contactPage;
                    updateFields['contact.socialsFound'] = Object.keys(socials).length > 0;
                    updateFields['contact.scrapedAt'] = new Date();
                    updateFields['contact.scrapeStatus'] = (fetchedEmail || Object.keys(socials).length > 0 || contactPage) ? "success" : "failed";
                    updateFields['outreach.scrapedAt'] = updateFields['contact.scrapedAt'];
                    updateFields['outreach.scrapeStatus'] = updateFields['contact.scrapeStatus'];

                    // Apply update
                    // We use strict: false so mongoose doesn't drop fields not in businessSchema
                    await Business.updateOne(
                        { _id: business._id },
                        { $set: updateFields },
                        { strict: false }
                    );
                    
                    processedCount++;
                } catch (err) {
                    console.error(`Error processing business ${business._id}:`, err.message);
                }
            });

            // Process batch concurrently
            await Promise.all(promises);
            console.log(`Processed ${processedCount}/${businesses.length}`);
            
            // Add a polite delay between batches (500-1000ms as requested)
            await sleep(1000);
        }

        console.log("Enrichment batch process completed.");

    } catch (error) {
        console.error("Error in runEnrichment:", error);
    }
}

module.exports = {
    runEnrichment,
    scrapeWebsite
};

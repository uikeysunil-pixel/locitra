const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
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
    const keywords = ['contact', 'contact-us', 'get-in-touch'];
    
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

function normalizeLinks(rawLinks, domainUrl) {
    const normalized = [];
    for (let href of rawLinks) {
        try {
            if (!href) continue;
            href = href.trim();
            // Skip empty or fragment-only links
            if (!href || href.startsWith('#')) continue;

            // Convert relative URLs to absolute by prepending base domain
            if (href.startsWith('/')) {
                href = domainUrl + href;
            } else if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                href = domainUrl + '/' + href;
            }

            // Remove URL parameters (?utm=...) and hash
            href = href.split('?')[0].split('#')[0];
            normalized.push(href);
        } catch (e) {
            // ignore malformed
        }
    }
    return normalized;
}

function extractEmails(text) {
    const emails = new Set();
    if (!text || typeof text !== 'string') return emails;
    const matches = text.match(EMAIL_REGEX);
    if (matches) {
        matches.forEach(email => {
            const lowerEmail = email.toLowerCase();
            // Basic filters
            if (!lowerEmail.endsWith('.png') && !lowerEmail.endsWith('.jpg') && 
                !lowerEmail.endsWith('.jpeg') && !lowerEmail.endsWith('.gif') &&
                !lowerEmail.endsWith('.webp') && !lowerEmail.includes('sentry') &&
                !lowerEmail.includes('example')) {
                emails.add(lowerEmail);
            }
        });
    }
    return emails;
}

async function scrapeWebsiteCheerio(baseUrl) {
    baseUrl = formatUrl(baseUrl);
    if (!baseUrl) return { emails: new Set(), rawLinks: [], domainUrl: null };

    let domainUrl;
    try {
        const parsedUrl = new URL(baseUrl);
        domainUrl = parsedUrl.origin;
    } catch (e) {
        return { emails: new Set(), rawLinks: [], domainUrl: null };
    }

    const rawUrlsToTry = [
        baseUrl,
        `${domainUrl}/contact`,
        `${domainUrl}/contact-us`,
        `${domainUrl}/about`
    ];
    const uniqueUrls = [...new Set(rawUrlsToTry)];
    
    let emails = new Set();
    let rawLinks = [];

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

            // Extract emails from body text or html
            const textContent = $('body').text() || html;
            const extractedEmails = extractEmails(textContent);
            extractedEmails.forEach(e => emails.add(e));

            // Extract ALL Links Properly
            $("a").each((_, el) => {
                let href = $(el).attr("href");
                if (href) {
                    rawLinks.push(href);
                }
            });

            await sleep(500);

        } catch (error) {
            // If request fails -> log and continue (Do NOT crash the script)
        }
    }

    return { emails, rawLinks, domainUrl };
}

async function scrapeWebsitePuppeteer(baseUrl) {
    let browser = null;
    let emails = new Set();
    let rawLinks = [];

    try {
        browser = await puppeteer.launch({
            headless: 'new', // Suppress deprecation warnings cleanly
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Wait for networkidle2
        await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Extract all anchor links mapped to href directly in the page execution context
        rawLinks = await page.$$eval("a", els => els.map(e => e.href));
        
        // Return string content and extract email
        const content = await page.content();
        const extractedEmails = extractEmails(content);
        extractedEmails.forEach(e => emails.add(e));

    } catch (error) {
        // Failed fetching with puppeteer
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return { emails, rawLinks };
}

async function runHybridEnrichment() {
    console.log("Starting background HYBRID contact enrichment process...");

    try {
        // 1. Reads businesses where: website exists AND (email OR socials OR contactPage is missing)
        const businesses = await Business.find({
            website: { $exists: true, $ne: "", $type: "string" },
            // Do not refetch successfully validated businesses
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
        }).limit(200);

        console.log(`Found ${businesses.length} businesses for hybrid enrichment.`);
        
        const batchSize = 10;
        let processedCount = 0;

        for (let i = 0; i < businesses.length; i += batchSize) {
            const batch = businesses.slice(i, i + batchSize);
            
            const promises = batch.map(async (business) => {
                try {
                    const url = business.website;
                    console.log("Processing:", url);

                    // STEP 1: Fast Cheerio Scraper
                    let { emails, rawLinks, domainUrl } = await scrapeWebsiteCheerio(url);
                    
                    if (!domainUrl) {
                        try {
                            domainUrl = new URL(formatUrl(url)).origin;
                        } catch (e) {
                            domainUrl = url;
                        }
                    }

                    // Normalize links mapping
                    let normalizedLinks = normalizeLinks(rawLinks, domainUrl);
                    let socials = extractSocialLinks(normalizedLinks, domainUrl);
                    let contactPage = findContactPage(normalizedLinks);

                    console.log("Links found:", normalizedLinks.length);

                    let fetchedEmail = null;
                    if (emails.size > 0) {
                        const emailArr = Array.from(emails);
                        fetchedEmail = emailArr.find(e => e.startsWith('info@') || e.startsWith('contact@')) || emailArr[0];
                    }

                    if (fetchedEmail) {
                        console.log("Email found:", fetchedEmail);
                    }

                    // Current database values carefully retrieved via .get()
                    const currentEmail = business.get('contact.email');
                    const needsEmail = !currentEmail && !fetchedEmail;
                    
                    const currentContactPage = business.get('contact.contactPage');
                    const needsContactPage = !currentContactPage && !contactPage;

                    // Condition: OR no socials found
                    const hasAtLeastOneSocial = Object.keys(socials).length > 0;
                    const needsSocials = !hasAtLeastOneSocial;

                    // STEP 2: Puppeteer Fallback (ONLY IF NEEDED)
                    if (needsEmail || needsSocials || needsContactPage) {
                        console.log("Using Puppeteer fallback");
                        const pupData = await scrapeWebsitePuppeteer(url);
                        
                        // Merge Data
                        pupData.emails.forEach(e => emails.add(e));
                        if (emails.size > 0 && !fetchedEmail) {
                            const emailArr = Array.from(emails);
                            fetchedEmail = emailArr.find(e => e.startsWith('info@') || e.startsWith('contact@')) || emailArr[0];
                            if (fetchedEmail) console.log("Email found:", fetchedEmail); // Added log as required
                        }

                        // We can append links normalized because Puppeteer generally outputs full absolute paths, 
                        // but calling normalize cleans ?utm safely.
                        let pupNormalized = normalizeLinks(pupData.rawLinks, domainUrl);
                        let pupSocials = extractSocialLinks(pupNormalized, domainUrl);
                        let pupContactPage = findContactPage(pupNormalized);

                        // Only merge if not formerly captured
                        if (!contactPage && pupContactPage) contactPage = pupContactPage;
                        for (const [net, link] of Object.entries(pupSocials)) {
                            if (!socials[net]) socials[net] = link;
                        }
                    }

                    // Database Update Rules
                    const updateFields = {};

                    if (!currentEmail && fetchedEmail) {
                        updateFields['contact.email'] = fetchedEmail;
                        updateFields['outreach.email'] = fetchedEmail;
                    }

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

                    updateFields['contact.scrapedAt'] = new Date();
                    updateFields['contact.scrapeStatus'] = (fetchedEmail || Object.keys(socials).length > 0 || contactPage) ? "success" : "failed";
                    updateFields['outreach.scrapedAt'] = updateFields['contact.scrapedAt'];
                    updateFields['outreach.scrapeStatus'] = updateFields['contact.scrapeStatus'];

                    // Use strict: false safe update mapped logically missing fields
                    if (Object.keys(updateFields).length > 0) {
                        await Business.updateOne(
                            { _id: business._id },
                            { $set: updateFields },
                            { strict: false }
                        );
                    }
                    processedCount++;

                } catch (err) {
                    console.error(`Error processing business ${business._id}:`, err.message);
                }
            });

            await Promise.all(promises);
            console.log(`Processed ${processedCount}/${businesses.length}`);
            
            await sleep(1000); // Wait 1000ms delay between batch requests
        }

        console.log("Hybrid Enrichment batch process completed.");

    } catch (error) {
        console.error("Error in runHybridEnrichment:", error);
    }
}

module.exports = {
    runHybridEnrichment,
    scrapeWebsiteCheerio,
    scrapeWebsitePuppeteer
};

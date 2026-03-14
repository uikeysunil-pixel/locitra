const axios = require('axios');

/**
 * Extracts emails from HTML content using regex.
 * @param {string} html 
 * @returns {string[]}
 */
function extractEmails(html) {
    if (!html) return [];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = html.match(emailRegex) || [];
    
    // Filter out common false positives and image extensions
    const filtered = matches.filter(e => {
        const ext = e.split('.').pop().toLowerCase();
        return !['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'pdf', 'js', 'css'].includes(ext);
    });
    
    return [...new Set(filtered.map(e => e.toLowerCase()))];
}

/**
 * Extracts social media links from HTML content.
 * @param {string} html 
 * @returns {object}
 */
function extractSocialLinks(html) {
    const socials = {
        facebook: "",
        instagram: "",
        linkedin: "",
        twitter: "",
        youtube: "",
        tiktok: ""
    };

    const patterns = {
        facebook: /https?:\/\/(?:www\.)?facebook\.com\/[^"'\s<]+/i,
        instagram: /https?:\/\/(?:www\.)?instagram\.com\/[^"'\s<]+/i,
        linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^"'\s<]+/i,
        twitter: /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^"'\s<]+/i,
        youtube: /https?:\/\/(?:www\.)?youtube\.com\/[^"'\s<]+/i,
        tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/[^"'\s<]+/i
    };

    for (const [platform, regex] of Object.entries(patterns)) {
        const match = html.match(regex);
        if (match) socials[platform] = match[0];
    }

    return socials;
}

/**
 * Fetches HTML from a URL with timeout and redirect handling.
 * @param {string} url 
 * @returns {Promise<string>}
 */
async function fetchHtml(url) {
    try {
        console.log(`[contactFinder] Fetching: ${url}`);
        const res = await axios.get(url, { 
            timeout: 8000, 
            maxRedirects: 3,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        return typeof res.data === 'string' ? res.data : '';
    } catch (e) {
        console.warn(`[contactFinder] Failed to fetch ${url}: ${e.message}`);
        return '';
    }
}

/**
 * Crawls a website to find contact information.
 * @param {string} website 
 * @returns {Promise<object>}
 */
async function contactFinder(website) {
    if (!website) return { email: null, socials: {} };

    console.log(`[contactFinder] Running for: ${website}`);
    
    let email = null;
    let socials = {};

    try {
        // 1. Check Homepage
        const homeHtml = await fetchHtml(website);
        const homeEmails = extractEmails(homeHtml);
        socials = extractSocialLinks(homeHtml);

        if (homeEmails.length > 0) {
            email = homeEmails[0];
        }

        // 2. Check Contact/About Pages if email not found or missing socials
        const contactPaths = ['/contact', '/contact-us', '/about'];
        const baseUrl = website.replace(/\/$/, '');

        for (const path of contactPaths) {
            // Optimization: Skip if we already have both email and some socials, but maybe social list is incomplete?
            // Re-check if we need more.
            if (email && socials.facebook && socials.instagram && socials.linkedin) break;

            const pageUrl = baseUrl + path;
            const pageHtml = await fetchHtml(pageUrl);
            
            if (!email) {
                const pageEmails = extractEmails(pageHtml);
                if (pageEmails.length > 0) email = pageEmails[0];
            }

            const pageSocials = extractSocialLinks(pageHtml);
            for (const [platform, link] of Object.entries(pageSocials)) {
                if (!socials[platform] && link) socials[platform] = link;
            }
        }

    } catch (err) {
        console.error(`[contactFinder] Error: ${err.message}`);
    }

    return {
        email,
        socials
    };
}

module.exports = { contactFinder };

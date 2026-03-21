const Scan = require("../models/scan.model");
const { serpRequest } = require("../utils/serpClient");
const ReportView = require("../models/reportView.model");
const ReportLead = require("../models/reportLead.model");

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim())

// In-memory tracker for identical requests: { "keyword*city*ip": [timestamps] }
const requestTracker = {};

const FALLBACK_RESULTS = [
    { rank: 1, name: "Sample Business 1", rating: 4.5, reviews: 120, address: "123 Main St, Chicago, IL" },
    { rank: 2, name: "Sample Business 2", rating: 4.4, reviews: 95, address: "456 Oak Ave, Chicago, IL" },
    { rank: 3, name: "Sample Business 3", rating: 4.3, reviews: 150, address: "789 Pine Rd, Chicago, IL" }
];

/**
 * Handles public ranking scans with MongoDB caching and advanced abuse protection.
 */
exports.handlePublicScan = async (req, res) => {
    try {
        const { keyword, city } = req.body;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!keyword || !city) {
            return res.status(400).json({ success: false, message: "Keyword and city are required." });
        }

        // 1. Normalize
        const keywordNormalized = keyword.trim().toLowerCase();
        const cityNormalized = city.trim().toLowerCase();

        // 2. Query + IP Abuse Protection (Identical request limit)
        const requestKey = `${keywordNormalized}*${cityNormalized}*${ip}`;
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (!requestTracker[requestKey]) {
            requestTracker[requestKey] = [];
        }

        // Clean up old timestamps
        requestTracker[requestKey] = requestTracker[requestKey].filter(t => now - t < oneHour);

        if (requestTracker[requestKey].length >= 2) {
            console.warn(`[AbuseProtection] Blocked repeated query: ${requestKey}`);
            return res.status(429).json({
                success: false,
                message: "Too many repeated requests for this search. Please try again later."
            });
        }

        requestTracker[requestKey].push(now);

        // 3. Unique Cache Key
        const queryKey = `${keywordNormalized}_${cityNormalized}`;

        // 4. Check MongoDB Cache FIRST
        const existingScan = await Scan.findOne({ queryKey });

        if (existingScan && existingScan.history && existingScan.history.length > 0) {
            console.log(`[PublicScan] Cache HIT for key: ${queryKey}`);
            const latestSnapshot = existingScan.history[existingScan.history.length - 1];
            return res.json({
                success: true,
                source: "mongodb-cache",
                results: latestSnapshot.businesses.map(b => ({
                    ...b,
                    title: b.name // Backward compatibility
                })).slice(0, 3) || FALLBACK_RESULTS,
                totalResults: latestSnapshot.businesses.length,
                historyCount: existingScan.history.length,
                lastUpdated: latestSnapshot.timestamp
            });
        }

        // 5. Cache MISS -> Return FALLBACK instead of calling SERP API
        console.log(`[PublicScan] Cache MISS for key: ${queryKey}. Returning FALLBACK data (SERP API Disabled).`);
        
        /* 
        // SERP API Logic (Disabled for Cache-First Architecture)
        const searchQuery = `${keyword} ${city}`;
        let serpData = await serpRequest({
            engine: "google_maps",
            q: searchQuery,
            type: "search"
        });
        ... 
        */

        return res.json({
            success: true,
            source: "mock-fallback",
            results: FALLBACK_RESULTS.map(b => ({
                ...b,
                title: b.name // Backward compatibility
            })),
            totalResults: FALLBACK_RESULTS.length,
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error("Public Scan Error:", error);
        res.status(500).json({ success: false, message: error.message || "An error occurred while processing your request." });
    }
};

/**
 * Handles programmatic SEO page requests (Strict MongoDB Cache ONLY)
 */
exports.handleSeoScan = async (req, res) => {
    try {
        const { keyword, city } = req.params;

        if (!keyword || !city) {
            return res.status(400).json({ success: false, message: "Keyword and city are required." });
        }

        // Normalize
        const keywordNormalized = keyword.toLowerCase();
        const cityNormalized = city.toLowerCase();
        const queryKey = `${keywordNormalized}_${cityNormalized}`;

        // Check MongoDB Cache ONLY
        const existingScan = await Scan.findOne({ queryKey });

        if (!existingScan || !existingScan.history || existingScan.history.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No data available yet for this location. Please use our free ranking checker tool to generate report."
            });
        }

        const latestSnapshot = existingScan.history[existingScan.history.length - 1];

        return res.json({
            success: true,
            results: latestSnapshot.businesses.map(b => ({
                rank: b.rank,
                name: b.name,
                title: b.name, // Map name back to title for frontend
                rating: b.rating,
                reviews: b.reviews
            })).slice(0, 3),
            totalResults: latestSnapshot.businesses.length,
            keyword: existingScan.keyword,
            city: existingScan.city,
            lastUpdated: latestSnapshot.timestamp,
            // Return history timestamps and first biz rank for the teaser chart
            history: existingScan.history.map(h => ({
                timestamp: h.timestamp,
                rank: h.businesses[0]?.rank || 0,
                reviews: h.businesses[0]?.reviews || 0
            }))
        });

    } catch (error) {
        console.error("SEO Scan Error:", error);
        res.status(500).json({ success: false, message: "An error occurred while fetching scan data." });
    }
};

/**
 * Handles public report landing pages (Full data)
 * GET /api/public/report/:slug
 */
exports.getPublicReport = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({ success: false, message: "Report slug is required." });
        }

        const queryKey = slug.replace(/-/g, '_').toLowerCase();
        
        console.log(`[PublicReport] Fetching report for queryKey: ${queryKey}`);

        const existingScan = await Scan.findOne({ queryKey });

        if (!existingScan || !existingScan.history || existingScan.history.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Report not found or no data available. Please generate it first."
            });
        }

        const latestSnapshot = existingScan.history[existingScan.history.length - 1];

        // Best-effort tracking (do not block report delivery)
        try {
            const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers["user-agent"] || "";
            const referrer = req.headers["referer"] || req.headers["referrer"] || "";
            ReportView.create({
                slug,
                queryKey,
                ip: String(ip || "").slice(0, 96),
                userAgent: String(userAgent || "").slice(0, 300),
                referrer: String(referrer || "").slice(0, 300)
            }).catch(() => {})
        } catch (_) {
            // ignore tracking failures
        }

        // Return full data for the public report page
        return res.json({
            success: true,
            data: {
                keyword: existingScan.keyword,
                city: existingScan.city,
                queryKey: existingScan.queryKey,
                lastUpdated: latestSnapshot.timestamp,
                businesses: latestSnapshot.businesses,
                totalResults: latestSnapshot.businesses.length,
                history: existingScan.history.map(h => ({
                    timestamp: h.timestamp,
                    avgRating: h.businesses.length > 0 ? (h.businesses.reduce((acc, b) => acc + (b.rating || 0), 0) / h.businesses.length).toFixed(1) : 0,
                    totalReviews: h.businesses.reduce((acc, b) => acc + (b.reviews || 0), 0)
                }))
            }
        });

    } catch (error) {
        console.error("Public Report Error:", error);
        res.status(500).json({ success: false, message: "An error occurred while fetching the public report." });
    }
};

/**
 * Generates dynamic XML sitemap based on scan database
 */
exports.getSitemap = async (req, res) => {
    try {
        const scans = await Scan.find({}, 'queryKey updatedAt').lean();
        const baseUrl = process.env.FRONTEND_URL || "https://locitra.com";
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Add default routes
        const defaults = ["", "/tools", "/login", "/register"];
        defaults.forEach(route => {
            xml += `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });

        // Add dynamic SEO pages
        scans.forEach(scan => {
            const slug = scan.queryKey.replace('_', '-');
            const lastMod = (scan.updatedAt || new Date()).toISOString().split('T')[0];
            xml += `  <url>\n    <loc>${baseUrl}/tools/google-maps-ranking-checker/${slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        });

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error("Sitemap Generation Error:", error);
        res.status(500).send("Error generating sitemap");
    }
};

/**
 * Public report lead capture
 * POST /api/report/:slug/lead
 */
exports.captureReportLead = async (req, res) => {
    try {
        const { slug } = req.params
        const { email, name = "", company = "", phone = "", note = "" } = req.body || {}

        if (!slug) return res.status(400).json({ success: false, message: "Report slug is required." })
        if (!isEmail(email)) return res.status(400).json({ success: false, message: "A valid email is required." })

        const queryKey = slug.replace(/-/g, '_').toLowerCase()
        const existingScan = await Scan.findOne({ queryKey }).select("_id queryKey keyword city").lean()
        if (!existingScan) {
            return res.status(404).json({ success: false, message: "Report not found." })
        }

        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
        const userAgent = req.headers["user-agent"] || ""
        const referrer = req.headers["referer"] || req.headers["referrer"] || ""

        const Lead = require("../models/lead.model")
        
        await Lead.updateOne(
            { email: String(email).trim().toLowerCase(), city: existingScan.city, name: String(name || "").trim().slice(0, 120) },
            {
                $setOnInsert: {
                    email: String(email).trim().toLowerCase(),
                    name: String(name || "").trim().slice(0, 120),
                    city: existingScan.city, // From scan data
                    keyword: existingScan.keyword, // From scan data
                    company: String(company || "").trim().slice(0, 140),
                    phone: String(phone || "").trim().slice(0, 40),
                    notes: `Public Lead Capture | Slug: ${slug} | Note: ${String(note || "").trim().slice(0, 400)}`,
                    address: String(referrer || "").slice(0, 300), // Storing referrer in address or notes
                    status: "New"
                }
            },
            { upsert: true }
        )

        // Track view separately in ReportLead if you want to keep both, 
        // but user specifically asked for "Collection: leads", so we prioritize Lead model.
        try {
            await ReportLead.create({
                slug,
                queryKey,
                email: String(email).trim().toLowerCase(),
                name: String(name || "").trim().slice(0, 120),
                company: String(company || "").trim().slice(0, 140),
                ip: String(ip || "").slice(0, 96),
                userAgent: String(userAgent || "").slice(0, 300),
                referrer: String(referrer || "").slice(0, 300)
            }).catch(() => {})
        } catch (_) {}

        // 🚀 Send Follow-up Email (Async, non-blocking)
        const emailService = require("../services/email.service")
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
        const reportUrl = `${frontendUrl}/tools/google-maps-ranking-checker/${slug}`
        
        emailService.sendFollowUpEmail(email, name, reportUrl).catch(err => {
            console.error("[PublicScan] Async email follow-up failed:", err)
        })

        return res.json({ success: true })
    } catch (error) {
        // Duplicate capture is fine â€” treat as success for UX
        if (error && error.code === 11000) return res.json({ success: true })
        console.error("Public Report Lead Error:", error)
        return res.status(500).json({ success: false, message: "Failed to save lead." })
    }
}

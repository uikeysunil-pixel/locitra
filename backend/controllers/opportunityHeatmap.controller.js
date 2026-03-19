const Scan = require("../models/scan.model");

/**
 * GET /api/opportunity-heatmap
 * Calculates local SEO opportunity scores from existing scan data.
 * Access: Private (Auth required)
 */
exports.getOpportunityHeatmap = async (req, res) => {
    try {
        const { keyword, city } = req.query;

        if (!keyword || !city) {
            return res.status(400).json({ success: false, message: "Keyword and city are required." });
        }

        const keywordNormalized = keyword.trim().toLowerCase();
        const cityNormalized = city.trim().toLowerCase();
        const queryKey = `${keywordNormalized}_${cityNormalized}`;

        // 1. Fetch scan from MongoDB
        const existingScan = await Scan.findOne({ queryKey });

        if (!existingScan || !existingScan.history || existingScan.history.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No data available yet. Run a market scan first." 
            });
        }

        // 2. Get latest snapshot
        const latestSnapshot = existingScan.history[existingScan.history.length - 1];
        const businesses = latestSnapshot.businesses;

        // 3. Calculate Opportunity Scores
        // score logic:
        // rating < 4.2 (+1)
        // reviews < 50 (+1)
        // rank 4-10 (+1)
        const leads = businesses.map(b => {
            let score = 0;
            if (b.rating && b.rating < 4.2) score += 1;
            if (b.reviews < 50) score += 1;
            if (b.rank >= 4 && b.rank <= 10) score += 1;

            let level = "Low";
            if (score >= 2) level = "High";
            else if (score === 1) level = "Medium";

            let insight = "";
            if (level === "High") {
                if (b.rank >= 4 && b.rank <= 10) {
                    insight = `This business ranks #${b.rank} with only ${b.reviews} reviews. Competitors likely have higher authority. Optimization could push them into the top 3.`;
                } else if (b.rating < 4.2) {
                    insight = `Poor rating (${b.rating}) is holding this business back. Reputation management is a major opportunity.`;
                } else {
                    insight = `Low review count (${b.reviews}) makes this a high-potential target for growth services.`;
                }
            }

            return {
                name: b.name,
                rank: b.rank,
                rating: b.rating,
                reviews: b.reviews,
                opportunityScore: score,
                level,
                insight
            };
        });

        // 4. Handle Plan Truncation (Paid vs Free)
        const userPlan = req.user?.plan?.toLowerCase() || "free";
        const isPaid = userPlan !== "free";

        let finalLeads = leads;
        let isTruncated = false;

        if (!isPaid) {
            finalLeads = leads.slice(0, 3);
            isTruncated = true;
        }

        res.json({
            success: true,
            keyword,
            city,
            totalFound: leads.length,
            isTruncated,
            results: finalLeads
        });

    } catch (error) {
        console.error("[Heatmap] Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate heatmap data." });
    }
};

/**
 * GET /api/opportunity-heatmap/export
 * Exports leads as CSV for paid users.
 */
exports.exportLeadsCSV = async (req, res) => {
    try {
        const { keyword, city } = req.query;
        const userPlan = req.user?.plan?.toLowerCase() || "free";

        if (userPlan === "free") {
            return res.status(403).json({ success: false, message: "Lead export is a premium feature. Please upgrade your plan." });
        }

        const keywordNormalized = keyword.trim().toLowerCase();
        const cityNormalized = city.trim().toLowerCase();
        const queryKey = `${keywordNormalized}_${cityNormalized}`;

        const existingScan = await Scan.findOne({ queryKey });

        if (!existingScan || !existingScan.history || existingScan.history.length === 0) {
            return res.status(404).send("No data available for export.");
        }

        const latestSnapshot = existingScan.history[existingScan.history.length - 1];
        
        // CSV Header
        const headers = ["Business Name", "Rank", "Rating", "Reviews", "Opportunity Score", "Level", "Insight"];
        
        const rows = latestSnapshot.businesses.map(b => {
            let score = 0;
            if (b.rating && b.rating < 4.2) score += 1;
            if (b.reviews < 50) score += 1;
            if (b.rank >= 4 && b.rank <= 10) score += 1;

            let level = "Low";
            if (score >= 2) level = "High";
            else if (score === 1) level = "Medium";

            // Escape CSV values
            const esc = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
            
            return [
                esc(b.name),
                b.rank,
                b.rating,
                b.reviews,
                score,
                level,
                esc(level === "High" ? "High potential lead identified" : "")
            ].join(",");
        });

        const csv = [headers.join(","), ...rows].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="Locitra-Heatmap-${city}.csv"`);
        res.send(csv);

    } catch (error) {
        console.error("[Heatmap Export] Error:", error);
        res.status(500).send("Export failed.");
    }
};

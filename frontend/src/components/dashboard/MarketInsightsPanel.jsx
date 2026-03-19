import { 
    TrendingUp, 
    Users, 
    Star, 
    Zap, 
    Target, 
    BarChart3,
    ArrowUpRight,
    Search,
    MessageSquare,
    CheckCircle2
} from "lucide-react"

export default function MarketInsightsPanel({ gaps }) {
    if (!gaps || gaps.length === 0) {
        return (
            <div style={emptyContainer}>
                <div style={emptyIconWrap}>
                    <Search size={32} color="rgba(255,255,255,0.2)" />
                </div>
                <h3 style={emptyTitle}>No market insights available yet.</h3>
                <p style={emptySub}>Run a market scan to generate strategic AI insights from your local data.</p>
                <button style={primaryBtnSmall}>Run Market Scan</button>
            </div>
        )
    }

    // Logic to generate insights from gaps data
    const generateInsights = () => {
        const insights = []

        // Insight 1: Review Gap Opportunity
        const lowReviewGaps = gaps.filter(g => g.averageReviews < 200)
        if (lowReviewGaps.length > 0) {
            const best = lowReviewGaps[0]
            insights.push({
                id: 'review-gap',
                title: 'Review Gap Opportunity',
                icon: <MessageSquare size={20} color="#6366f1" />,
                description: `In ${best.city}, top ranking ${best.keyword}s average only ${best.averageReviews} reviews. A focused review campaign could quickly close this gap and drive higher rankings.`,
                gradient: 'rgba(99, 102, 241, 0.1)'
            })
        }

        // Insight 2: Weak Competition Detection
        const lowCompGaps = gaps.filter(g => g.competitionLevel === 'Low')
        if (lowCompGaps.length > 0) {
            const count = lowCompGaps.length
            insights.push({
                id: 'weak-comp',
                title: 'Weak Competition Detected',
                icon: <Target size={20} color="#10b981" />,
                description: `We identified ${count} market${count > 1 ? 's' : ''} with "Low" competition. These areas represent low-hanging fruit for rapid SEO growth and market entry.`,
                gradient: 'rgba(16, 185, 129, 0.1)'
            })
        }

        // Insight 3: Rating Weakness
        const lowRatingGaps = gaps.filter(g => g.averageRating < 4.5)
        if (lowRatingGaps.length > 0) {
            const best = lowRatingGaps[0]
            insights.push({
                id: 'rating-weakness',
                title: 'Rating Weakness Analysis',
                icon: <Star size={20} color="#f59e0b" />,
                description: `Average ratings for ${best.keyword} in ${best.city} are below 4.5. Businesses with superior service and a 4.8+ rating can easily capture market share.`,
                gradient: 'rgba(245, 158, 11, 0.1)'
            })
        }

        // Insight 4: Saturation Insight
        if (gaps.length > 5) {
            insights.push({
                id: 'market-sat',
                title: 'Saturation Indicators',
                icon: <BarChart3 size={20} color="#ec4899" />,
                description: `Large number of identified gaps suggests high market fragmentation. Agencies focusing on dominant multi-location strategies will see the highest ROI.`,
                gradient: 'rgba(236, 72, 153, 0.1)'
            })
        }

        // Fallback or extra: Lead Generation
        insights.push({
            id: 'lead-gen',
            title: 'High-Value Lead Stream',
            icon: <Zap size={20} color="#8b5cf6" />,
            description: `Based on current market analysis, there are approximately ${gaps.length * 5} businesses ranking poorly that would be prime candidates for your SEO services.`,
            gradient: 'rgba(139, 92, 246, 0.1)'
        })

        return insights.slice(0, 6) // Cap at 6 insights
    }

    const insights = generateInsights()

    return (
        <div style={panelSection}>
            <div style={headerRow}>
                <div>
                    <h3 style={sectionTitle}>AI Market Insights</h3>
                    <p style={sectionSub}>Automatically generated strategic insights from your local market data.</p>
                </div>
            </div>

            <div style={insightsGrid}>
                {insights.map((insight, idx) => (
                    <div key={idx} style={{...insightCard, background: `linear-gradient(135deg, ${insight.gradient} 0%, rgba(15, 23, 42, 0.2) 100%)`}}>
                        <div style={cardHeader}>
                            <div style={iconWrap}>{insight.icon}</div>
                            <h4 style={cardTitle}>{insight.title}</h4>
                        </div>
                        <p style={cardText}>{insight.description}</p>
                        <div style={cardFooter}>
                            <span style={readMore}>Strategic Analysis <ArrowUpRight size={14} /></span>
                        </div>
                    </div>
                ))}
            </div>
            
            <style>{`
                .insight-card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.4);
                    border-color: rgba(255,255,255,0.15) !important;
                }
            `}</style>
        </div>
    )
}

/* ── Styles ──────────────────────────────────────────── */

const panelSection = {
    marginBottom: "40px"
}

const headerRow = {
    marginBottom: "24px"
}

const sectionTitle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "4px"
}

const sectionSub = {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)"
}

const insightsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px"
}

const insightCard = {
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
    borderRadius: "24px",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    cursor: "default"
}

const cardHeader = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
}

const iconWrap = {
    padding: "10px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
}

const cardTitle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff",
    margin: 0
}

const cardText = {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "20px"
}

const cardFooter = {
    display: "flex",
    justifyContent: "flex-end",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: "16px"
}

const readMore = {
    fontSize: "12px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
    display: "flex",
    alignItems: "center",
    gap: "4px"
}

const emptyContainer = {
    background: "rgba(255,255,255,0.02)",
    border: "2px dashed rgba(255,255,255,0.08)",
    borderRadius: "32px",
    padding: "60px 40px",
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "40px"
}

const emptyIconWrap = {
    width: "64px",
    height: "64px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px"
}

const emptyTitle = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "8px"
}

const emptySub = {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "24px"
}

const primaryBtnSmall = {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
}

import { useMemo } from "react"

export default function LostRevenueDetector({ businesses = [] }) {
    const revenueOpportunities = useMemo(() => {
        if (!businesses || businesses.length < 3) return []

        // 1. Calculate average reviews of top 3 businesses
        const top3 = [...businesses]
            .sort((a, b) => (a.rank || 99) - (b.rank || 99))
            .slice(0, 3)
        
        const avgTopReviews = top3.reduce((sum, b) => sum + (Number(b.reviews) || 0), 0) / 3

        // 2. Estimate lost revenue for other businesses
        return businesses
            .filter(b => (b.rank || 99) > 3) // Only for businesses below top 3
            .map(b => {
                const reviews = Number(b.reviews) || 0
                const reviewGap = Math.max(0, avgTopReviews - reviews)
                const estimatedRevenue = Math.round(reviewGap * 25)
                return { ...b, estimatedRevenue, reviewGap }
            })
            .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue) // Top opportunities first
            .slice(0, 3)
    }, [businesses])

    if (businesses.length === 0) return null

    return (
        <div className="card" style={container}>
            <div style={header}>
                <h3 style={title}>💰 Lost Revenue Opportunities</h3>
                <span style={badge}>Actionable Insights</span>
            </div>
            
            <p style={sub}>Estimated monthly revenue lost due to review gaps vs top competitors.</p>

            <div style={list}>
                {revenueOpportunities.length > 0 ? (
                    revenueOpportunities.map((b, idx) => (
                        <div key={idx} style={row}>
                            <div style={bizInfo}>
                                <div style={bizName}>{b.name || b.title}</div>
                                <div style={bizMeta}>Rank #{b.rank} • {b.reviews || 0} Reviews</div>
                            </div>
                            <div style={revenueVal}>
                                <div style={amount}>${b.estimatedRevenue.toLocaleString()}</div>
                                <div style={label}>Opportunity</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={empty}>
                        No significant revenue gaps identified in current scan.
                    </div>
                )}
            </div>
        </div>
    )
}

const container = {
    padding: "24px",
    background: "#fff",
    borderRadius: "16px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
}

const header = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
}

const title = {
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0
}

const badge = {
    fontSize: "10px",
    fontWeight: "700",
    background: "#f0fdf4",
    color: "#16a34a",
    padding: "4px 8px",
    borderRadius: "6px",
    textTransform: "uppercase"
}

const sub = {
    fontSize: "13px",
    color: "#64748b",
    margin: "0 0 8px 0",
    lineHeight: "1.4"
}

const list = {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
}

const row = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0"
}

const bizInfo = {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
}

const bizName = {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b"
}

const bizMeta = {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500"
}

const revenueVal = {
    textAlign: "right"
}

const amount = {
    fontSize: "15px",
    fontWeight: "800",
    color: "#dc2626"
}

const label = {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase"
}

const empty = {
    padding: "20px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
    fontStyle: "italic"
}

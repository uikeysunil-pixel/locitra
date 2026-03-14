import { useMemo } from "react"
import { useMarketStore } from "../store/marketStore"

export default function MarketIntelligence({ businesses: propData }) {

    const { businesses: storeData } = useMarketStore()
    const data = propData?.length > 0 ? propData : storeData

    const metrics = useMemo(() => {

        if (!data.length) return null

        const total = data.length

        // Market difficulty
        const avgReviews = data.reduce((s, b) => s + (Number(b.reviews) || 0), 0) / total
        const avgRating = data.reduce((s, b) => s + (Number(b.rating) || 0), 0) / total
        const difficulty = Math.min(100, Math.round((avgReviews / 50) + (avgRating * 10)))

        let diffLabel, diffColor, diffBg
        if (difficulty <= 30) { diffLabel = "Easy"; diffColor = "#166534"; diffBg = "#dcfce7" }
        else if (difficulty <= 60) { diffLabel = "Medium"; diffColor = "#92400e"; diffBg = "#fef3c7" }
        else { diffLabel = "Hard"; diffColor = "#991b1b"; diffBg = "#fee2e2" }

        // Revenue opportunity
        const highLeads = data.filter(b => (b.opportunityScore ?? 0) >= 70)
        const revenue = highLeads.length * 300

        // AI intelligence segments
        const noWebsite = data.filter(b => !b.website)
        const lowReviews = data.filter(b => (Number(b.reviews) || 0) < 30)
        const lowRating = data.filter(b => (Number(b.rating) || 0) < 4.0)
        const highScore = data.filter(b => (b.opportunityScore ?? 0) > 70)

        // Deduplicated AI leads
        const aiLeadSet = new Set([
            ...noWebsite.map(b => b.name),
            ...lowReviews.map(b => b.name),
            ...lowRating.map(b => b.name),
            ...highScore.map(b => b.name)
        ])

        return {
            total, avgReviews: Math.round(avgReviews), avgRating: avgRating.toFixed(1),
            difficulty, diffLabel, diffColor, diffBg,
            revenue, highLeads: highLeads.length,
            noWebsite: noWebsite.length,
            lowReviews: lowReviews.length,
            lowRating: lowRating.length,
            highScore: highScore.length,
            aiLeads: aiLeadSet.size
        }

    }, [data])

    if (!metrics) {
        return (
            <div className="card" style={emptyCard}>
                <h3 style={heading}>🤖 AI Market Intelligence</h3>
                <p style={emptySub}>Run a market scan to activate intelligence engine.</p>
            </div>
        )
    }

    const {
        total, avgReviews, avgRating,
        difficulty, diffLabel, diffColor, diffBg,
        revenue, highLeads,
        noWebsite, lowReviews, lowRating, highScore, aiLeads
    } = metrics

    return (

        <div className="card" style={card}>

            <h3 style={heading}>🤖 AI Market Intelligence Engine</h3>
            <p style={subText}>Automated lead scoring across {total} businesses</p>

            <div style={grid}>

                {/* Market Difficulty */}
                <div style={block}>
                    <p style={blockLabel}>Market Difficulty</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                        <div style={diffBar}>
                            <div style={{ ...diffFill, width: `${difficulty}%`, background: diffColor }} />
                        </div>
                        <span style={{ background: diffBg, color: diffColor, ...pill }}>{diffLabel}</span>
                    </div>
                    <div style={metaRow}>
                        <span>Avg reviews: <b>{avgReviews}</b></span>
                        <span>Avg rating: <b>{avgRating} ⭐</b></span>
                    </div>
                </div>

                {/* Revenue */}
                <div style={{ ...block, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <p style={blockLabel}>Estimated Revenue Opportunity</p>
                    <p style={{ ...bigNum, color: "#16a34a", marginTop: "8px" }}>${revenue.toLocaleString()}</p>
                    <p style={{ fontSize: "12px", color: "#4ade80", marginTop: "4px" }}>
                        {highLeads} leads × $300 / contract
                    </p>
                </div>

                {/* AI Lead Breakdown */}
                <div style={{ ...block, gridColumn: "1 / -1" }}>
                    <p style={{ ...blockLabel, marginBottom: "14px" }}>AI Lead Signal Breakdown</p>
                    <div style={signalRow}>
                        {[
                            { label: "No Website", val: noWebsite, color: "#f59e0b", icon: "🌐" },
                            { label: "Low Reviews <30", val: lowReviews, color: "#6366f1", icon: "📝" },
                            { label: "Low Rating <4.0", val: lowRating, color: "#ef4444", icon: "⭐" },
                            { label: "High Score >70", val: highScore, color: "#22c55e", icon: "🎯" },
                            { label: "Total AI Leads", val: aiLeads, color: "#0ea5e9", icon: "🤖" },
                        ].map(({ label, val, color, icon }) => (
                            <div key={label} style={{ ...signalTile, borderTop: `3px solid ${color}` }}>
                                <span style={{ fontSize: "20px" }}>{icon}</span>
                                <span style={{ ...bigNum, color, fontSize: "26px" }}>{val}</span>
                                <span style={signalLabel}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>

    )

}

/* ── Styles ──────────────────────────────────────────── */

const card = { padding: "28px" }
const emptyCard = { padding: "28px" }
const heading = { fontSize: "17px", fontWeight: "700", marginBottom: "4px" }
const subText = { fontSize: "13px", color: "#64748b", marginBottom: "20px" }
const emptySub = { fontSize: "14px", color: "#94a3b8", marginTop: "8px" }

const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }
const block = { background: "#f8fafc", borderRadius: "10px", padding: "18px", border: "1px solid #e2e8f0" }
const blockLabel = { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }
const bigNum = { fontSize: "32px", fontWeight: "800", color: "#0f172a" }
const metaRow = { display: "flex", gap: "16px", marginTop: "10px", fontSize: "12px", color: "#64748b" }

const diffBar = { flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }
const diffFill = { height: "100%", borderRadius: "99px", transition: "width 0.5s ease" }
const pill = { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }

const signalRow = { display: "flex", gap: "12px", flexWrap: "wrap" }
const signalTile = {
    flex: "1 1 140px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "flex-start"
}
const signalLabel = { fontSize: "11px", color: "#64748b", fontWeight: "600" }

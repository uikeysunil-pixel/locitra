import { useMemo } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

export default function HeatmapPreview({ businesses = [] }) {
    const previewData = useMemo(() => {
        if (!businesses) return []

        return businesses.slice(0, 6).map(b => {
            let score = 0
            const rating = Number(b.rating) || 0
            const reviews = Number(b.reviews) || 0
            const rank = Number(b.rank) || 99

            if (rating < 4.2) score += 1
            if (reviews < 50) score += 1
            if (rank > 3) score += 1

            let level = "low"
            let color = "#22c55e" // Green
            let bg = "#f0fdf4"

            if (score >= 2) {
                level = "high"
                color = "#ef4444" // Red
                bg = "#fef2f2"
            } else if (score === 1) {
                level = "medium"
                color = "#f59e0b" // Orange
                bg = "#fffbeb"
            }

            return { ...b, score, level, color, bg }
        })
    }, [businesses])

    if (businesses.length === 0) return null

    return (
        <div className="card" style={container}>
            <div style={header}>
                <h3 style={title}>🗺️ Market Heatmap Preview</h3>
                <Link to="/dashboard/opportunity-heatmap" style={viewAll}>
                    Full View <ChevronRight size={14} />
                </Link>
            </div>

            <p style={sub}>Color-coded snapshot of local business SEO vulnerabilities.</p>

            <div style={grid}>
                {previewData.map((b, idx) => (
                    <div key={idx} style={{ ...miniCard, background: b.bg, borderColor: b.color + '40' }}>
                        <div style={{ ...rankDot, background: b.color }}>{b.rank}</div>
                        <div style={bizName} title={b.name || b.title}>
                            {b.name || b.title}
                        </div>
                        <div style={bizStats}>
                            ⭐ {b.rating || 0} • 💬 {b.reviews || 0}
                        </div>
                    </div>
                ))}
            </div>

            <Link to="/dashboard/opportunity-heatmap" style={ctaBtn}>
                Launch Full Heatmap Analyzer
            </Link>
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

const viewAll = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#6366f1",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "2px"
}

const sub = {
    fontSize: "13px",
    color: "#64748b",
    margin: "0 0 8px 0"
}

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
    flex: 1
}

const miniCard = {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0
}

const rankDot = {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "2px"
}

const bizName = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1e293b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
}

const bizStats = {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: "600"
}

const ctaBtn = {
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#6366f1",
    background: "#eef2ff",
    padding: "10px",
    borderRadius: "8px",
    textDecoration: "none",
    marginTop: "8px",
    transition: "all 0.2s"
}

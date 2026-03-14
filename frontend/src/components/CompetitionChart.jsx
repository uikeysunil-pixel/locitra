import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Cell
} from "recharts"
import { useMarketStore } from "../store/marketStore"

export default function CompetitionChart({ businesses: propData }) {

    const { businesses: storeData } = useMarketStore()
    const data = propData?.length > 0 ? propData : storeData

    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="card" style={{ padding: "28px" }}>
                <h3 style={heading}>Competition Density</h3>
                <p style={sub}>Run a market scan to see chart.</p>
            </div>
        )
    }

    const getReviews = b =>
        Number(b.reviews) || Number(b.totalReviews) || 0

    const sorted = [...data]
        .map(b => ({
            name: (b.name || "Business").substring(0, 16),
            reviews: getReviews(b),
            score: b.opportunityScore ?? 0
        }))
        .sort((a, b) => b.reviews - a.reviews)
        .slice(0, 12)

    return (

        <div className="card">

            <h3 style={heading}>Competition Density</h3>
            <p style={sub}>Top {sorted.length} by review count</p>

            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sorted} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(v) => [`${v} reviews`, "Reviews"]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                    />
                    <Bar dataKey="reviews" radius={[6, 6, 0, 0]}>
                        {sorted.map((entry, i) => (
                            <Cell
                                key={i}
                                fill={entry.score >= 70 ? "#22c55e" : entry.score >= 40 ? "#f59e0b" : "#6366f1"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <p style={legend}>
                <span style={{ color: "#22c55e" }}>■</span> High opp&nbsp;&nbsp;
                <span style={{ color: "#f59e0b" }}>■</span> Medium&nbsp;&nbsp;
                <span style={{ color: "#6366f1" }}>■</span> Low
            </p>

        </div>

    )

}

const heading = { fontSize: "16px", fontWeight: "700", marginBottom: "4px" }
const sub = { fontSize: "13px", color: "var(--text-3, #94a3b8)", marginBottom: "16px" }
const legend = { fontSize: "12px", color: "#94a3b8", marginTop: "10px" }
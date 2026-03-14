import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useMarketStore } from "../store/marketStore"

const COLORS = ["#ef4444", "#f59e0b", "#22c55e"]

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.55
    return (
        <text
            x={cx + r * Math.cos(-midAngle * RADIAN)}
            y={cy + r * Math.sin(-midAngle * RADIAN)}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: 13, fontWeight: 700 }}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

export default function OpportunityDistribution({ businesses: propData }) {

    const { businesses: storeData } = useMarketStore()
    const data = propData?.length > 0 ? propData : storeData

    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="card" style={emptyBox}>
                <h3 style={heading}>Opportunity Distribution</h3>
                <p style={emptyText}>Run a market scan to see distribution.</p>
            </div>
        )
    }

    const low = data.filter(b => (b.opportunityScore ?? 0) <= 40).length
    const medium = data.filter(b => (b.opportunityScore ?? 0) > 40 && (b.opportunityScore ?? 0) <= 70).length
    const high = data.filter(b => (b.opportunityScore ?? 0) > 70).length

    const chartData = [
        { name: "Low (0–40)", value: low },
        { name: "Medium (41–70)", value: medium },
        { name: "High (71–100)", value: high },
    ].filter(d => d.value > 0)

    return (

        <div className="card">

            <h3 style={heading}>Opportunity Distribution</h3>
            <p style={sub}>{data.length} businesses analysed</p>

            <div style={statsRow}>
                <div style={{ ...stat, background: "#fee2e2", color: "#991b1b" }}>
                    <span style={statNum}>{low}</span>
                    <span style={statLabel}>Low</span>
                </div>
                <div style={{ ...stat, background: "#fef3c7", color: "#92400e" }}>
                    <span style={statNum}>{medium}</span>
                    <span style={statLabel}>Medium</span>
                </div>
                <div style={{ ...stat, background: "#dcfce7", color: "#166534" }}>
                    <span style={statNum}>{high}</span>
                    <span style={statLabel}>High</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                        label={renderLabel}
                    >
                        {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} businesses`, ""]} />
                    <Legend iconType="circle" iconSize={10} />
                </PieChart>
            </ResponsiveContainer>

        </div>

    )

}

const heading = { fontSize: "16px", fontWeight: "700", marginBottom: "4px" }
const sub = { fontSize: "13px", color: "var(--text-3, #94a3b8)", marginBottom: "16px" }
const emptyBox = { padding: "28px" }
const emptyText = { fontSize: "14px", color: "var(--text-3, #94a3b8)", marginTop: "8px" }

const statsRow = { display: "flex", gap: "10px", marginBottom: "16px" }
const stat = { flex: 1, textAlign: "center", borderRadius: "8px", padding: "12px 8px", display: "flex", flexDirection: "column", gap: "4px" }
const statNum = { fontSize: "24px", fontWeight: "800" }
const statLabel = { fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts"
import { useMarketStore } from "../store/marketStore"

export default function OpportunityChart({ businesses: propBusinesses = [] }) {

    const { businesses: storeBusinesses } = useMarketStore()
    const businesses = propBusinesses.length > 0 ? propBusinesses : storeBusinesses


    if (!Array.isArray(businesses) || businesses.length === 0) {
        return (
            <div style={container}>
                <h3>Opportunity Distribution</h3>
                <p>No opportunity data available</p>
            </div>
        )
    }

    // normalize opportunity scores safely
    const normalized = businesses.map(b => ({
        ...b,
        opportunityScore: Number(b.opportunityScore) || 0
    }))

    const high = normalized.filter(b => b.opportunityScore >= 70).length
    const medium = normalized.filter(
        b => b.opportunityScore >= 30 && b.opportunityScore < 70
    ).length
    const low = normalized.filter(b => b.opportunityScore < 30).length

    const data = [
        { name: "High Opportunity", value: high },
        { name: "Medium Opportunity", value: medium },
        { name: "Low Opportunity", value: low }
    ]

    const total = high + medium + low

    const COLORS = ["#22c55e", "#f59e0b", "#ef4444"]

    return (

        <div style={container}>

            <h3>Opportunity Distribution</h3>

            {total === 0 ? (

                <p>No opportunities detected yet</p>

            ) : (

                <ResponsiveContainer width="100%" height={320}>

                    <PieChart>

                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={110}
                            label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                            }
                        >

                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index]}
                                />
                            ))}

                        </Pie>

                        <Tooltip
                            formatter={(value) => `${value} businesses`}
                        />

                        <Legend />

                    </PieChart>

                </ResponsiveContainer>

            )}

        </div>

    )
}

const container = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
}
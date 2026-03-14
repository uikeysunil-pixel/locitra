import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts"

export default function ActivityChart() {

    const data = [
        { day: "Mon", leads: 5 },
        { day: "Tue", leads: 8 },
        { day: "Wed", leads: 12 },
        { day: "Thu", leads: 9 },
        { day: "Fri", leads: 14 },
        { day: "Sat", leads: 10 },
        { day: "Sun", leads: 7 }
    ]

    return (

        <div style={container}>

            <h3>Lead Activity (Last 7 Days)</h3>

            <ResponsiveContainer width="100%" height={300}>

                <LineChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="day" />

                    <YAxis />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="leads"
                        stroke="#6366f1"
                        strokeWidth={3}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    )

}

const container = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "40px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
}
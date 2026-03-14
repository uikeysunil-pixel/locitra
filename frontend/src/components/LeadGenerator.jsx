import { useEffect, useState } from "react"

export default function LeadGenerator() {

    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {

        const loadLeads = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/leads?keyword=dentist&location=chicago"
                )

                const data = await response.json()

                console.log("API response:", data)

                setLeads(Array.isArray(data.leads) ? data.leads : [])

            } catch (err) {

                console.error("Failed to load leads:", err)
                setError("Failed to load leads")

            } finally {

                setLoading(false)

            }

        }

        loadLeads()

    }, [])

    const getReviews = (lead) =>
        Number(lead.reviews) ||
        Number(lead.totalReviews) ||
        Number(lead.user_ratings_total) ||
        0

    const getMapsLink = (lead) =>
        lead.mapsLink ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${lead.name || ""} ${lead.location || lead.city || ""}`
        )}`

    const getOpportunityBadge = (score) => {

        const s = Number(score) || 0

        if (s >= 60) return <span style={high}>High</span>
        if (s >= 35) return <span style={medium}>Medium</span>
        return <span style={low}>Low</span>
    }

    if (loading) return <h2>Loading leads...</h2>

    if (error) return <h2>{error}</h2>

    return (

        <div style={container}>

            <h2>Lead Generator</h2>

            <div style={tableWrapper}>

                <table style={table}>

                    <thead style={header}>
                        <tr>
                            <th style={cell}>Business</th>
                            <th style={cell}>Rating</th>
                            <th style={cell}>Reviews</th>
                            <th style={cell}>Website</th>
                            <th style={cell}>Opportunity</th>
                            <th style={cell}>Maps</th>
                            <th style={cell}>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {leads.length === 0 && (
                            <tr>
                                <td style={cell} colSpan="7">
                                    No leads found
                                </td>
                            </tr>
                        )}

                        {leads.map((lead, index) => (

                            <tr key={lead.placeId || index}>

                                <td style={cell}>
                                    {lead.name || "Unknown"}
                                </td>

                                <td style={cell}>
                                    {lead.rating ?? "-"}
                                </td>

                                <td style={cell}>
                                    {getReviews(lead)}
                                </td>

                                <td style={cell}>
                                    {lead.website ? (
                                        <a
                                            href={lead.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Visit
                                        </a>
                                    ) : (
                                        <span style={noWebsite}>
                                            No Website
                                        </span>
                                    )}
                                </td>

                                <td style={cell}>
                                    {getOpportunityBadge(
                                        lead.opportunityScore ?? lead.leadScore
                                    )}
                                </td>

                                <td style={cell}>
                                    <a
                                        href={getMapsLink(lead)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View
                                    </a>
                                </td>

                                <td style={cell}>
                                    <button style={button}>
                                        Generate Email
                                    </button>
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    )

}

const container = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
}

const tableWrapper = {
    overflowX: "auto"
}

const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    minWidth: "720px"
}

const header = {
    background: "#f1f5f9"
}

const cell = {
    padding: "10px",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "left",
    whiteSpace: "nowrap"
}

const button = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#6366f1",
    color: "white",
    cursor: "pointer"
}

const noWebsite = {
    color: "red",
    fontWeight: "500"
}

const high = {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 8px",
    borderRadius: "6px",
    fontWeight: "600"
}

const medium = {
    background: "#fef3c7",
    color: "#92400e",
    padding: "4px 8px",
    borderRadius: "6px",
    fontWeight: "600"
}

const low = {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 8px",
    borderRadius: "6px",
    fontWeight: "600"
}
export default function ProspectTable({ prospects = [] }) {

    if (!Array.isArray(prospects) || prospects.length === 0) {
        return (
            <div style={{ marginTop: "40px" }}>
                <h3>Top Opportunities</h3>
                <p>No opportunities yet. Run a city scan.</p>
            </div>
        )
    }

    const getOpportunity = (score = 0) => {

        if (score >= 50)
            return <span style={high}>High</span>

        if (score >= 30)
            return <span style={medium}>Medium</span>

        return <span style={low}>Low</span>
    }

    // normalize review values from different APIs
    const getReviews = (p) => {
        return (
            Number(p.totalReviews) ||
            Number(p.reviews) ||
            Number(p.user_ratings_total) ||
            0
        )
    }

    // ensure maps link always exists
    const getMapsLink = (p) => {

        if (p.mapsLink) return p.mapsLink

        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${p.name || ""} ${p.city || p.location || ""}`
        )}`
    }

    // remove duplicates by place_id or name+city
    const unique = Array.from(
        new Map(
            prospects.map(p => [
                p.placeId || p.place_id || `${p.name}-${p.city || p.location || ""}`,
                p
            ])
        ).values()
    )

    // sort by opportunity score descending
    const sorted = [...unique].sort(
        (a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0)
    )

    return (

        <div style={{ marginTop: "40px" }}>

            <h3>Top Opportunities</h3>

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

                        {sorted.slice(0, 50).map((p, i) => {

                            const reviews = getReviews(p)

                            return (

                                <tr key={p.placeId || `${p.name}-${i}`}>

                                    <td style={cell}>
                                        {p.name || "Unknown"}
                                    </td>

                                    <td style={cell}>
                                        {p.rating ?? "-"}
                                    </td>

                                    <td style={cell}>
                                        {reviews}
                                    </td>

                                    <td style={cell}>
                                        {p.website ? (
                                            <a
                                                href={p.website}
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
                                        {getOpportunity(p.opportunityScore)}
                                    </td>

                                    <td style={cell}>
                                        <a
                                            href={getMapsLink(p)}
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

                            )
                        })}

                    </tbody>

                </table>

            </div>

        </div>

    )
}

const tableWrapper = {
    overflowX: "auto"
}

const table = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px"
}

const header = {
    background: "#f0f0f0"
}

const cell = {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    textAlign: "left",
    whiteSpace: "nowrap"
}

const button = {
    padding: "6px 12px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "6px",
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
export default function AnalysisPanel({ data }) {

    if (!data || !data.marketAnalysis) return null

    const businesses = data?.businesses || []
    const leads = data?.leads || []

    // Prospects = High + Medium opportunity
    const prospects = businesses.filter(
        b => b.opportunity === "High" || b.opportunity === "Medium"
    )

    const totalBusinesses = data.totalBusinesses || businesses.length
    const totalProspects = prospects.length
    const totalLeads = data.totalLeads || leads.length
    const marketDifficulty = data.marketAnalysis?.marketDifficulty || 0

    return (

        <div style={container}>

            <div style={cardStyle}>
                <p style={title}>Businesses</p>
                <h2 style={value}>{totalBusinesses}</h2>
            </div>

            <div style={cardStyle}>
                <p style={title}>Prospects</p>
                <h2 style={value}>{totalProspects}</h2>
            </div>

            <div style={cardStyle}>
                <p style={title}>Leads</p>
                <h2 style={value}>{totalLeads}</h2>
            </div>

            <div style={cardStyle}>
                <p style={title}>Market Difficulty</p>
                <h2 style={value}>{marketDifficulty}</h2>
            </div>

        </div>

    )

}

const container = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginTop: "25px"
}

const cardStyle = {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    transition: "transform 0.15s ease",
    cursor: "default"
}

const title = {
    fontSize: "14px",
    color: "#666",
    marginBottom: "8px"
}

const value = {
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0
}
export default function RevenueOpportunity({ leads = [] }) {

    if (!Array.isArray(leads) || leads.length === 0) {
        return null
    }

    const totalLeads = leads.length

    // Estimated SEO monthly deal value
    const avgDealValue = 1500

    const monthlyRevenue = totalLeads * avgDealValue
    const yearlyRevenue = monthlyRevenue * 12

    return (

        <div style={container}>

            <h3>Market Revenue Opportunity</h3>

            <div style={stats}>

                <div style={card}>
                    <h4>Total Leads</h4>
                    <p>{totalLeads}</p>
                </div>

                <div style={card}>
                    <h4>Avg SEO Deal</h4>
                    <p>${avgDealValue}/month</p>
                </div>

                <div style={cardHighlight}>
                    <h4>Market Opportunity</h4>
                    <p>${yearlyRevenue.toLocaleString()}/year</p>
                </div>

            </div>

        </div>

    )

}

const container = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
}

const stats = {
    display: "flex",
    gap: "20px",
    marginTop: "15px"
}

const card = {
    flex: 1,
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center"
}

const cardHighlight = {
    flex: 1,
    background: "#6366f1",
    color: "white",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center"
}
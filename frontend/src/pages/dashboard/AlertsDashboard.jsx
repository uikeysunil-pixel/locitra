import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import useAuthStore from "../../store/authStore"

export default function AlertsDashboard() {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [markingRead, setMarkingRead] = useState(false)
    const token = useAuthStore(s => s.token)

    const fetchAlerts = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/alerts`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.alerts) {
                setAlerts(data.alerts)
            }
        } catch (error) {
            console.error("Failed to fetch alerts:", error)
        } finally {
            setLoading(false)
        }
    }

    const markAllAsRead = async () => {
        try {
            setMarkingRead(true)
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/alerts/read`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            })
            // Update local state isRead status
            setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
        } catch (error) {
            console.error("Failed to mark as read:", error)
        } finally {
            setMarkingRead(false)
        }
    }

    useEffect(() => {
        fetchAlerts()
    }, [])

    const copyLead = (alert) => {
        const text = `Business: ${alert.businessName}
City: ${alert.city}
Keyword: ${alert.keyword}
Rank: #${alert.rank}
Rating: ${alert.rating}
Reviews: ${alert.reviews}
Opportunity: ${alert.opportunityScore}`;

        navigator.clipboard.writeText(text);
        alert("Lead data copied!");
    };

    if (loading) {
        return <div style={{ padding: "40px" }}>Loading opportunities...</div>
    }

    return (
        <div style={page}>
            <div style={header}>
                <div>
                    <h1 style={title}>Opportunity Alerts</h1>
                    <p style={sub}>Automatically detected high-potential leads from your recent scans.</p>
                </div>
                {alerts.some(a => !a.isRead) && (
                    <button 
                        onClick={markAllAsRead} 
                        disabled={markingRead}
                        className="btn-ghost"
                        style={markReadBtn}
                    >
                        {markingRead ? "..." : "✓ Mark all as read"}
                    </button>
                )}
            </div>

            {alerts.length === 0 ? (
                <div className="card" style={emptyState}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔭</div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>No opportunities detected yet</h3>
                    <p style={{ color: "#64748b", marginBottom: "20px" }}>Run a Market Scan to start discovering high-value leads automatically.</p>
                    <Link to="/app" className="btn-primary" style={{ textDecoration: "none", padding: "10px 20px" }}>
                        Run Market Scan
                    </Link>
                </div>
            ) : (
                <div style={grid}>
                    {alerts.map((alert) => (
                        <div key={alert._id} className="card" style={alertCard}>
                            <div style={cardHeader}>
                                <div style={businessInfo}>
                                    <h3 style={businessName}>
                                        {alert.businessName}
                                        {!alert.isRead && <span style={unreadDot} />}
                                    </h3>
                                    <p style={marketInfo}>{alert.keyword} in {alert.city}</p>
                                </div>
                                <div style={getScoreBadge(alert.opportunityScore)}>
                                    {alert.opportunityScore}
                                </div>
                            </div>

                            <div style={metricsRow}>
                                <div style={metric}>
                                    <span style={metricLabel}>Rank</span>
                                    <span style={metricVal}>#{alert.rank}</span>
                                </div>
                                <div style={metric}>
                                    <span style={metricLabel}>Rating</span>
                                    <span style={metricVal}>{alert.rating} ⭐</span>
                                </div>
                                <div style={metric}>
                                    <span style={metricLabel}>Reviews</span>
                                    <span style={metricVal}>{alert.reviews}</span>
                                </div>
                            </div>

                            <div style={cardActions}>
                                <button onClick={() => copyLead(alert)} className="btn-ghost" style={actionBtn}>
                                    📋 Copy Data
                                </button>
                                <Link to="/leads" className="btn-primary" style={{ ...actionBtn, textDecoration: "none", textAlign: "center" }}>
                                    🎯 View in Leads
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const getScoreBadge = (score) => {
    const base = {
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "700",
        textTransform: "uppercase"
    }
    if (score === "High") return { ...base, background: "#dcfce7", color: "#16a34a" }
    if (score === "Medium") return { ...base, background: "#fef3c7", color: "#d97706" }
    return { ...base, background: "#f1f5f9", color: "#64748b" }
}

const page = { display: "flex", flexDirection: "column", gap: "24px" }
const header = { display: "flex", justifyContent: "space-between", alignItems: "flex-end" }
const title = { fontSize: "28px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px", marginBottom: "4px" }
const sub = { color: "#64748b", fontSize: "15px" }
const markReadBtn = { fontSize: "13px", color: "#6366f1", fontWeight: "600", padding: "4px 8px" }

const emptyState = { padding: "80px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "20px"
}

const alertCard = {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    }
}

const cardHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }
const businessInfo = { display: "flex", flexDirection: "column", gap: "2px" }
const businessName = { fontSize: "17px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }
const unreadDot = { width: "8px", height: "8px", background: "#6366f1", borderRadius: "50%" }
const marketInfo = { fontSize: "12px", color: "#94a3b8", textTransform: "capitalize" }

const metricsRow = {
    display: "flex",
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "12px"
}

const metric = { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    gap: "2px",
    borderRight: "1px solid #e2e8f0",
    ":last-child": { borderRight: "none" }
}

const metricLabel = { fontSize: "10px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" }
const metricVal = { fontSize: "14px", fontWeight: "700", color: "#1e293b" }

const cardActions = { display: "flex", gap: "10px", marginTop: "4px" }
const actionBtn = { flex: 1, fontSize: "13px", padding: "8px" }

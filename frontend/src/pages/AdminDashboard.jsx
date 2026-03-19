import React, { useState, useEffect } from "react"
import axios from "axios"
import useAuthStore from "../store/authStore"

const AdminDashboard = () => {
    const { token } = useAuthStore()
    const [activeView, setActiveView] = useState("overview")
    const [data, setData] = useState({
        stats: null,
        users: [],
        scans: [],
        cache: [],
        apiUsage: null
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Axios instance with auth
    const api = axios.create({
        baseURL: "/api/admin",
        headers: { Authorization: `Bearer ${token}` }
    })

    const views = [
        { id: "overview", label: "Admin Dashboard", icon: "📊" },
        { id: "users", label: "Users", icon: "👥" },
        { id: "plans", label: "Plans", icon: "💳" },
        { id: "scans", label: "Scans", icon: "🔍" },
        { id: "cache", label: "Cache", icon: "🧊" },
        { id: "api-usage", label: "API Usage", icon: "⚡" }
    ]

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [statsRes, usersRes, scansRes, cacheRes, usageRes] = await Promise.all([
                api.get("/stats"),
                api.get("/users"),
                api.get("/scans"),
                api.get("/cache"),
                api.get("/api-usage")
            ])

            setData({
                stats: statsRes.data.stats,
                users: usersRes.data.users,
                scans: scansRes.data.scans,
                cache: cacheRes.data.cache,
                apiUsage: usageRes.data.usage
            })
        } catch (err) {
            setError(err.response?.data?.message || "Failed to sync system data")
        } finally {
            setLoading(false)
        }
    }

    // Handlers
    const handleUpdateUserPlan = async (userId, plan) => {
        try {
            await api.patch(`/user/${userId}/plan`, { plan })
            fetchAllData()
        } catch (err) { alert("Failed to update plan") }
    }

    const handleSuspendUser = async (userId) => {
        try {
            await api.patch(`/user/${userId}/suspend`)
            fetchAllData()
        } catch (err) { alert("Action failed") }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("CRITICAL: Delete user data permanently?")) return
        try {
            await api.delete(`/user/${userId}`)
            fetchAllData()
        } catch (err) { alert("Deletion failed") }
    }

    const handleDeleteCache = async (id) => {
        if (!window.confirm("Remove this cache entry?")) return
        try {
            await api.delete(`/cache/${id}`)
            fetchAllData()
        } catch (err) { alert("Cache removal failed") }
    }

    // ── Render Utilities ──────────────────────────────────────

    const Card = ({ title, value, sub, icon, trend }) => (
        <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={styles.cardTitle}>{title}</div>
                    <div style={styles.cardValue}>{value}</div>
                    {sub && <div style={styles.cardSub}>{sub}</div>}
                </div>
                <div style={styles.cardIcon}>{icon}</div>
            </div>
            {trend && <div style={{ ...styles.cardTrend, color: trend > 0 ? "#10b981" : "#ef4444" }}>
                {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
            </div>}
        </div>
    )

    // ── Layout Style Definitions ────────────────────────────────

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <span style={{ fontSize: "24px" }}>🔍</span>
                    <span style={{ fontWeight: "800", fontSize: "18px", color: "#f8fafc" }}>Locitra Admin</span>
                </div>
                <nav style={styles.nav}>
                    {views.map(v => (
                        <button 
                            key={v.id} 
                            onClick={() => setActiveView(v.id)}
                            style={{
                                ...styles.navItem,
                                background: activeView === v.id ? "#334155" : "transparent",
                                color: activeView === v.id ? "#fff" : "#94a3b8"
                            }}
                        >
                            <span style={{ marginRight: "12px" }}>{v.icon}</span>
                            {v.label}
                        </button>
                    ))}
                </nav>
                <div style={styles.sidebarFooter}>
                    v1.2.0 (Stable)
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>
                        {views.find(v => v.id === activeView)?.label}
                    </h2>
                    <button onClick={fetchAllData} style={styles.refreshBtn}>
                        Sync Data
                    </button>
                </header>

                <div style={styles.content}>
                    {error && <div style={styles.errorBox}>{error}</div>}

                    {loading ? <div style={styles.loading}>Accessing secure system data...</div> : (
                        <>
                            {activeView === "overview" && data.stats && (
                                <div style={styles.grid}>
                                    <Card title="Total Users" value={data.stats.totalUsers} sub={`${data.stats.activeUsers} active`} icon="👤" />
                                    <Card title="Total Leads" value={data.stats.totalLeads.toLocaleString()} sub="Stored in MongoDB" icon="📈" />
                                    <Card title="Total Scans" value={data.stats.totalScans} sub="Audit log entries" icon="🔍" />
                                    <Card title="Serp Usage (24h)" value={data.stats.serpCallsToday} sub="Calls to SerpAPI" icon="⚡" />
                                    <Card title="Cache Hit Rate" value={`${data.stats.cacheHitRate}%`} sub="Last 100 scans" icon="🧊" />
                                </div>
                            )}

                            {activeView === "users" && (
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Email</th>
                                                <th>Company</th>
                                                <th>Plan</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.users.map(u => (
                                                <tr key={u._id}>
                                                    <td>{u.email}</td>
                                                    <td>{u.companyName || "-"}</td>
                                                    <td>
                                                        <select 
                                                            value={u.plan} 
                                                            onChange={(e) => handleUpdateUserPlan(u._id, e.target.value)}
                                                            style={styles.select}
                                                        >
                                                            <option value="free">Free</option>
                                                            <option value="starter">Starter</option>
                                                            <option value="agency">Agency</option>
                                                        </select>
                                                    </td>
                                                    <td>{u.role}</td>
                                                    <td>
                                                        <span style={{
                                                            ...styles.badge,
                                                            background: u.status === "suspended" ? "#fee2e2" : "#dcfce7",
                                                            color: u.status === "suspended" ? "#991b1b" : "#166534"
                                                        }}>
                                                            {u.status || "active"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button onClick={() => handleSuspendUser(u._id)} style={styles.actionBtn}>
                                                            {u.status === "suspended" ? "Unsuspend" : "Suspend"}
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(u._id)} style={{ ...styles.actionBtn, color: "#ef4444" }}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeView === "scans" && (
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Query</th>
                                                <th>Source</th>
                                                <th>Results</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.scans.map(s => (
                                                <tr key={s._id}>
                                                    <td style={{ fontSize: "12px" }}>{s.userEmail || "anonymous"}</td>
                                                    <td>{s.keyword} in {s.location}</td>
                                                    <td>
                                                        <span style={{
                                                            ...styles.badge,
                                                            background: s.source === "serpapi" ? "#fef3c7" : "#e0f2fe",
                                                            color: s.source === "serpapi" ? "#92400e" : "#075985"
                                                        }}>
                                                            {s.source}
                                                        </span>
                                                    </td>
                                                    <td>{s.resultsCount}</td>
                                                    <td style={{ fontSize: "11px", color: "#64748b" }}>{new Date(s.createdAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeView === "cache" && (
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Keyword</th>
                                                <th>Location</th>
                                                <th>Count</th>
                                                <th>Created At</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.cache.map(c => (
                                                <tr key={c._id}>
                                                    <td>{c.keyword}</td>
                                                    <td>{c.location}</td>
                                                    <td>{c.resultsCount}</td>
                                                    <td style={{ fontSize: "12px" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button onClick={() => handleDeleteCache(c._id)} style={{ ...styles.actionBtn, color: "#ef4444" }}>Evict</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeView === "api-usage" && data.apiUsage && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                    <div style={styles.card}>
                                        <h3 style={styles.cardTitle}>SerpAPI Quota Usage</h3>
                                        <div style={{ marginTop: "24px" }}>
                                            <div style={styles.usageItem}>
                                                <span>Calls Today</span>
                                                <span style={{ fontWeight: "700" }}>{data.apiUsage.serpCallsToday}</span>
                                            </div>
                                            <div style={styles.usageBar}><div style={{ ...styles.usageFill, width: `${(data.apiUsage.serpCallsToday/500)*100}%` }}></div></div>
                                            
                                            <div style={{ ...styles.usageItem, marginTop: "20px" }}>
                                                <span>Calls This Month</span>
                                                <span style={{ fontWeight: "700" }}>{data.apiUsage.serpCallsThisMonth}</span>
                                            </div>
                                            <div style={styles.usageBar}><div style={{ ...styles.usageFill, width: `${(data.apiUsage.serpCallsThisMonth/10000)*100}%`, background: "#8b5cf6" }}></div></div>
                                        </div>
                                    </div>
                                    <div style={styles.card}>
                                        <h3 style={styles.cardTitle}>Cache Performance</h3>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "150px", flexDirection: "column" }}>
                                            <div style={{ fontSize: "40px", fontWeight: "800", color: "#2563eb" }}>{data.apiUsage.cacheHitsMonth}</div>
                                            <div style={{ color: "#64748b" }}>Efficiently served from MongoDB this month</div>
                                            <div style={{ marginTop: "12px", fontSize: "14px", fontWeight: "600", color: "#059669" }}>
                                                Miss Rate: {data.apiUsage.cacheMissRate}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeView === "plans" && (
                                <div style={styles.card}>
                                    <h3 style={styles.cardTitle}>Plan Configurations (Read Only)</h3>
                                    <div style={{ marginTop: "20px" }}>
                                        {["free", "starter", "agency"].map(plan => (
                                            <div key={plan} style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ fontWeight: "700", textTransform: "capitalize" }}>{plan}</span>
                                                <span style={{ color: "#64748b" }}>Unlimited Export • {plan === 'free' ? '2' : plan === 'starter' ? '20' : '∞'} Scans/Day</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

const styles = {
    container: { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "260px", background: "#0f172a", display: "flex", flexDirection: "column", padding: "24px 0" },
    sidebarBrand: { padding: "0 24px", marginBottom: "40px", display: "flex", alignItems: "center", gap: "12px" },
    nav: { flex: 1, padding: "0 12px" },
    navItem: { 
        width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: "8px", border: "none", 
        marginBottom: "4px", fontSize: "14px", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center",
        transition: "all 0.2s"
    },
    sidebarFooter: { padding: "24px", color: "#475569", fontSize: "12px", borderTop: "1px solid #1e293b" },
    main: { flex: 1, display: "flex", flexDirection: "column" },
    header: { 
        background: "#fff", padding: "16px 32px", borderBottom: "1px solid #e2e8f0", 
        display: "flex", justifyContent: "space-between", alignItems: "center" 
    },
    refreshBtn: { 
        padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", 
        borderRadius: "6px", fontWeight: "600", fontSize: "13px", cursor: "pointer" 
    },
    content: { padding: "32px", overflowY: "auto" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" },
    card: { background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    cardTitle: { color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" },
    cardValue: { fontSize: "28px", fontWeight: "800", color: "#0f172a" },
    cardSub: { fontSize: "12px", color: "#94a3b8", marginTop: "4px" },
    cardIcon: { fontSize: "24px", opacity: 0.8 },
    cardTrend: { fontSize: "12px", marginTop: "12px", fontWeight: "600" },
    tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    select: { padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "13px" },
    actionBtn: { border: "none", background: "none", color: "#2563eb", fontWeight: "600", fontSize: "12px", cursor: "pointer", marginRight: "12px" },
    badge: { padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" },
    usageItem: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", color: "#475569" },
    usageBar: { height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" },
    usageFill: { height: "100%", background: "#2563eb", borderRadius: "4px" },
    loading: { padding: "60px", textAlign: "center", color: "#64748b" },
    errorBox: { background: "#fee2e2", color: "#b91c1c", padding: "16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }
}

styles.table.th = { padding: "16px 24px", background: "#f8fafc", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }
styles.table.td = { padding: "16px 24px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" }

export default AdminDashboard

import { useState, useEffect } from "react"
import useAuthStore from "../../store/authStore"
import { 
    PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from "recharts"
import { Search, Flame, MapPin, TrendingUp, Users, Star, BarChart3, Info, ChevronRight, X, LayoutGrid, Zap } from "lucide-react"
import MarketOpportunityMap from "../../components/dashboard/MarketOpportunityMap"
import MarketInsightsPanel from "../../components/dashboard/MarketInsightsPanel"

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"]

export default function MarketGaps() {
    const [gaps, setGaps] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedGap, setSelectedGap] = useState(null)
    const [businesses, setBusinesses] = useState([])
    const [loadingBusinesses, setLoadingBusinesses] = useState(false)
    const token = useAuthStore((s) => s.token)

    useEffect(() => {
        const fetchGaps = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/gaps/market-gaps`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (!res.ok) throw new Error("Failed to fetch market gaps")
                const data = await res.json()
                setGaps(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (token) fetchGaps()
    }, [token])

    const handleViewBusinesses = async (gap) => {
        setSelectedGap(gap)
        setLoadingBusinesses(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/search?keyword=${gap.keyword}&location=${gap.city}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            setBusinesses(data.results || [])
        } catch (err) {
            console.error("Failed to fetch businesses", err)
        } finally {
            setLoadingBusinesses(false)
        }
    }

    if (loading) return (
        <div style={fullPageLoader}>
            <div style={loaderInner}>
                <Zap size={32} color="#6366f1" className="animate-pulse" />
                <p style={msgStyle}>Identifying market opportunities...</p>
            </div>
        </div>
    )

    // Summary Metrics Calculations
    const totalMarkets = gaps.length
    const highOppMarkets = gaps.filter(g => g.opportunityScore >= 70).length
    const avgScore = totalMarkets > 0 ? Math.round(gaps.reduce((s, g) => s + g.opportunityScore, 0) / totalMarkets) : 0
    const lowCompMarkets = gaps.filter(g => g.competitionLevel === "Low").length

    // Chart Data
    const distributionData = [
        { name: "High", value: highOppMarkets },
        { name: "Medium", value: gaps.filter(g => g.opportunityScore >= 40 && g.opportunityScore < 70).length },
        { name: "Low", value: gaps.filter(g => g.opportunityScore < 40).length }
    ].filter(d => d.value > 0)

    const competitionData = [
        { name: "Low Comp", value: lowCompMarkets },
        { name: "High Comp", value: totalMarkets - lowCompMarkets }
    ].filter(d => d.value > 0)

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerSection}>
                <div>
                    <h1 style={titleStyle}>Market Gap Intelligence</h1>
                    <p style={subtitleStyle}>Discover cities and industries with weak competition and high SEO opportunity.</p>
                </div>
                <button style={runScanBtn}>
                    <Search size={16} /> Run Market Scan
                </button>
            </div>

            {gaps.length === 0 ? (
                <div style={emptyStateCard}>
                    <div style={emptyIconWrap}>
                        <Search size={40} color="rgba(255,255,255,0.2)" />
                    </div>
                    <h3 style={{ color: "#fff", marginBottom: "8px", fontSize: "20px" }}>No market gaps detected yet.</h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>Start by running a comprehensive market scan to identify low-competition niches.</p>
                    <button style={primaryBtnSmall}>Run Market Scan</button>
                </div>
            ) : (
                <>
                    {/* Section 1: Summary Metrics */}
                    <div style={metricsGrid}>
                        <MetricCard label="Markets Analyzed" value={totalMarkets} icon={<LayoutGrid size={20} color="#6366f1" />} />
                        <MetricCard label="High Opportunity" value={highOppMarkets} icon={<Flame size={20} color="#f59e0b" />} />
                        <MetricCard label="Avg Opp Score" value={avgScore} icon={<TrendingUp size={20} color="#10b981" />} />
                        <MetricCard label="Low Competition" value={lowCompMarkets} icon={<Users size={20} color="#ec4899" />} />
                    </div>

                    {/* Map Section */}
                    <MarketOpportunityMap gaps={gaps} onMarketClick={handleViewBusinesses} />

                    {/* AI Insights Section */}
                    <MarketInsightsPanel gaps={gaps} />

                    <div style={mainGrid}>
                        {/* Section 2: Market Gap Cards */}
                        <div style={leftCol}>
                            <h2 style={sectionTitle}>Opportunity Markets</h2>
                            <div style={cardsGrid}>
                                {gaps.map((gap, idx) => (
                                    <div key={idx} style={gapCard}>
                                        <div style={cardHeader}>
                                            <div>
                                                <h3 style={cardTitle}>{gap.keyword}</h3>
                                                <div style={locationRow}>
                                                    <MapPin size={12} color="rgba(255,255,255,0.4)" />
                                                    <p style={cardLocation}>{gap.city}</p>
                                                </div>
                                            </div>
                                            <div style={opportunityBadge(gap.opportunityScore)}>
                                                🔥 {gap.opportunityScore}
                                            </div>
                                        </div>

                                        <div style={statsGrid}>
                                            <StatItem label="Avg Reviews" value={gap.averageReviews} />
                                            <StatItem label="Avg Rating" value={gap.averageRating} />
                                            <StatItem label="Competition" value={gap.competitionLevel} isBadge />
                                        </div>

                                        <div style={actionRow}>
                                            <button onClick={() => handleViewBusinesses(gap)} style={actionBtnPrimary}>View Businesses</button>
                                            <button style={actionBtnSecondary}>Campaign</button>
                                            <button style={actionBtnIcon} title="Save Market">★</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Section 4: Target Businesses Preview */}
                            {selectedGap && (
                                <div style={previewSection}>
                                    <div style={previewHeader}>
                                        <h3 style={previewTitle}>Target Businesses: {selectedGap.keyword} in {selectedGap.city}</h3>
                                        <button onClick={() => setSelectedGap(null)} style={closeBtn}><X size={18} /></button>
                                    </div>
                                    {loadingBusinesses ? (
                                        <p style={msgStyle}>Fetching business details...</p>
                                    ) : (
                                        <div style={tableWrapper}>
                                            <table style={businessTable}>
                                                <thead>
                                                    <tr>
                                                        <th style={thStyle}>Business Name</th>
                                                        <th style={thStyle}>Rank</th>
                                                        <th style={thStyle}>Rating</th>
                                                        <th style={thStyle}>Reviews</th>
                                                        <th style={thStyle}>Opp. Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {businesses.slice(0, 5).map((b, i) => (
                                                        <tr key={i} style={trStyle}>
                                                            <td style={tdName}>{b.name}</td>
                                                            <td style={tdStyle}>{b.rank}</td>
                                                            <td style={tdStyle}>⭐ {b.rating}</td>
                                                            <td style={tdStyle}>{b.reviews}</td>
                                                            <td style={tdScore(b.opportunityScore)}>{b.opportunityScore || 85}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Analytics & Insight */}
                        <div style={rightCol}>
                            {/* Section 3: Opportunity Breakdown */}
                            <div style={analyticsPanel}>
                                <h3 style={panelTitle}><BarChart3 size={18} /> Market Analytics</h3>
                                
                                <div style={chartBox}>
                                    <p style={chartTitle}>Opportunity Distribution</p>
                                    <div style={{height: '200px'}}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={distributionData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {distributionData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <ReTooltip />
                                                <Legend verticalAlign="bottom" height={36}/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div style={chartBox}>
                                    <p style={chartTitle}>Competition Levels</p>
                                    <div style={{height: '200px', marginTop: '10px'}}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={competitionData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Insight Panel */}
                            <div style={insightPanel}>
                                <div style={insightHeader}>
                                    <Info size={18} color="#6366f1" />
                                    <h3 style={insightTitle}>Market Insight</h3>
                                </div>
                                <p style={insightText}>
                                    In <span style={{color: '#fff', fontWeight: '600'}}>{gaps[0]?.city || 'selected cities'}</span>, 
                                    approximately <span style={{color: '#fff', fontWeight: '600'}}>63%</span> of businesses ranking in the top 5 have fewer than 150 reviews.
                                </p>
                                <div style={insightFooter}>
                                    <TrendingUp size={14} color="#10b981" />
                                    <span>This indicates strong opportunity for SEO growth.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

/* ── Sub-components ───────────────────────────────────────── */

const MetricCard = ({ label, value, icon }) => (
    <div style={metricCardStyle}>
        <div style={metricHeader}>
            <div style={metricIconBox}>{icon}</div>
            <p style={metricLabel}>{label}</p>
        </div>
        <p style={metricValue}>{value}</p>
    </div>
)

const StatItem = ({ label, value, isBadge }) => (
    <div style={statBox}>
        <p style={statLabel}>{label}</p>
        <p style={isBadge ? competitionBadge(value) : statValue}>{value}</p>
    </div>
)

/* ── Styles ──────────────────────────────────────────── */

const containerStyle = {
    padding: "40px",
    maxWidth: "100%",
    margin: "0",
    background: "#0f172a", // Dark background to contrast with white text
    minHeight: "calc(100vh - 72px)", // Adjust for layout padding
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
}

const headerSection = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px"
}

const titleStyle = {
    fontSize: "36px",
    fontWeight: "900",
    letterSpacing: "-1px",
    marginBottom: "8px",
    background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
}

const subtitleStyle = {
    fontSize: "16px",
    color: "rgba(255,255,255,0.4)",
    fontWeight: "400"
}

const runScanBtn = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease"
}

const metricsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "40px"
}

const metricCardStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
}

const metricHeader = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px"
}

const metricIconBox = {
    padding: "8px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "10px"
}

const metricLabel = {
    fontSize: "13px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
}

const metricValue = {
    fontSize: "32px",
    fontWeight: "800",
    color: "#fff"
}

const mainGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "32px"
}

const leftCol = {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
}

const sectionTitle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "4px"
}

const cardsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px"
}

const gapCard = {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden"
}

const cardHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px"
}

const cardTitle = {
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    textTransform: "capitalize",
    letterSpacing: "-0.5px"
}

const locationRow = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px"
}

const cardLocation = {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)"
}

const opportunityBadge = (score) => ({
    background: score >= 70 ? "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" : "rgba(255,255,255,0.1)",
    padding: "6px 12px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "800",
    color: "#fff",
    boxShadow: score >= 70 ? "0 4px 15px rgba(239, 68, 68, 0.4)" : "none"
})

const statsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "24px"
}

const statBox = {
    background: "rgba(255,255,255,0.02)",
    padding: "12px",
    borderRadius: "16px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.04)"
}

const statLabel = {
    fontSize: "10px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px"
}

const statValue = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff"
}

const competitionBadge = (level) => ({
    fontSize: "14px",
    fontWeight: "800",
    color: level === "Low" ? "#10b981" : "#f59e0b"
})

const actionRow = {
    display: "flex",
    gap: "10px"
}

const actionBtnPrimary = {
    flex: 1,
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease"
}

const actionBtnSecondary = {
    padding: "12px 16px",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
}

const actionBtnIcon = {
    width: "44px",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
}

const previewSection = {
    background: "rgba(255,255,255,0.02)",
    borderRadius: "24px",
    padding: "32px",
    border: "1px solid rgba(255,255,255,0.08)",
    marginTop: "12px"
}

const previewHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
}

const previewTitle = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff"
}

const closeBtn = {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer"
}

const tableWrapper = {
    overflowX: "auto"
}

const businessTable = {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
}

const thStyle = {
    fontSize: "12px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)"
}

const trStyle = {
    borderBottom: "1px solid rgba(255,255,255,0.03)"
}

const tdName = {
    padding: "16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff"
}

const tdStyle = {
    padding: "16px",
    fontSize: "14px",
    color: "rgba(255,255,255,0.7)"
}

const tdScore = (score) => ({
    padding: "16px",
    fontSize: "14px",
    fontWeight: "800",
    color: score >= 70 ? "#10b981" : "#f59e0b"
})

const rightCol = {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
}

const analyticsPanel = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "24px"
}

const panelTitle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "20px"
}

const chartBox = {
    background: "rgba(0,0,0,0.2)",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "20px"
}

const chartTitle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "12px"
}

const insightPanel = {
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    borderRadius: "24px",
    padding: "24px"
}

const insightHeader = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px"
}

const insightTitle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff"
}

const insightText = {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "20px"
}

const insightFooter = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#10b981",
    fontWeight: "600"
}

const fullPageLoader = {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
}

const loaderInner = {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px"
}

const msgStyle = {
    color: "rgba(255,255,255,0.5)",
    fontSize: "15px",
    fontWeight: "500"
}

const emptyStateCard = {
    background: "rgba(255,255,255,0.02)",
    border: "2px dashed rgba(255,255,255,0.08)",
    borderRadius: "32px",
    padding: "80px 40px",
    textAlign: "center",
    marginTop: "20px"
}

const emptyIconWrap = {
    width: "80px",
    height: "80px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px"
}

const primaryBtnSmall = {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer"
}

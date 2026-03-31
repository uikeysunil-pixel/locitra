import { useState } from "react"
import { scanMarket } from "../services/api"
import { useMarketStore } from "../store/marketStore"
import useAuthStore from "../store/authStore"
import { useNavigate } from "react-router-dom"

export default function CityScanner({ onScanComplete }) {

    const { setBusinesses, clearBusinesses } = useMarketStore()
    const { user, updateUser } = useAuthStore()
    const navigate = useNavigate()

    const [city, setCity] = useState("")
    const [keyword, setKeyword] = useState("dentist")
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [scanned, setScanned] = useState(false)
    const [cacheInfo, setCacheInfo] = useState(null)

    /* ── helpers ────────────────────────────────────── */

    const calcScore = (b) => {
        let s = 100
        const rev = Number(b.reviews) || Number(b.totalReviews) || 0
        const rat = Number(b.rating) || 0
        if (rev > 200) s -= 40; else if (rev > 100) s -= 25; else if (rev > 50) s -= 10
        if (rat > 4.6) s -= 20; else if (rat > 4.3) s -= 10
        if (!b.website) s += 15
        return Math.max(0, Math.min(100, s))
    }

    /* ── scan ───────────────────────────────────────── */

    const handleScan = async (forceRefresh = false) => {

        if (!city.trim()) { alert("Please enter a city"); return }
        if (!keyword.trim()) { alert("Please enter a keyword"); return }

        try {

            setLoading(true)
            setError(null)
            setCacheInfo(null)
            clearBusinesses()
            setLeads([])
            setScanned(false)

            const response = await scanMarket(keyword.trim(), city.trim(), forceRefresh)

            if (!response.success) {
                throw new Error(response.error || "Scan failed")
            }

            const raw = response.data?.businesses || []

            const results = raw.map(lead => ({
                ...lead,
                name: lead.name || "Unknown",
                category: lead.category || "unknown",
                rating: lead.rating ?? 0,
                reviews: lead.reviews ?? lead.totalReviews ?? 0,
                totalReviews: lead.reviews ?? lead.totalReviews ?? 0,
                website: lead.website || "",
                phone: lead.phone || "",
                address: lead.address || "",
                opportunityScore: lead.opportunityScore ?? calcScore(lead),
                mapsLink: lead.mapsLink ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name || "")}`
            }))

            setLeads(results)
            setBusinesses(results)
            setScanned(true)

            if (onScanComplete) onScanComplete(results)

            if (response.data?.fromCache) {
                 setCacheInfo({ lastUpdated: response.data.lastUpdated || null, source: response.data.cacheSource })
            } else {
                // If it wasn't a cache hit, we likely consumed a credit
                if (user && typeof user.credits === "number" && user.credits > 0) {
                    updateUser({ credits: user.credits - 1 })
                }
            }

        } catch (err) {
            console.error("[CityScanner] error:", err)
            setError("Scan failed — please check your keyword and city and try again.")
        } finally {
            setLoading(false)
        }

    }

    const handleKeyDown = (e) => { if (e.key === "Enter" && (!user || user.credits > 0)) handleScan(false) }

    /* ── render ─────────────────────────────────────── */

    return (

        <div className="card" style={scannerCard}>

            {/* Header */}
            <div style={scannerHeader}>
                <div>
                    <h3 style={scannerTitle}>🔍 City Business Scanner</h3>
                    <p style={scannerSub}>Scan any local market and find high-value leads in seconds.</p>
                </div>
                {scanned && (
                    <div style={resultBadge}>
                        <span style={resultNum}>{leads.length}</span>
                        <span style={resultLbl}>businesses found</span>
                    </div>
                )}
            </div>

            {/* Inputs */}
            <div style={inputRow}>

                <div style={inputGroup}>
                    <label style={label}>Keyword</label>
                    <input
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="dentist, plumber, restaurant…"
                        style={inputStyle}
                    />
                </div>

                <div style={inputGroup}>
                    <label style={label}>City</label>
                    <input
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Chicago, New York, Austin…"
                        style={inputStyle}
                    />
                </div>

                <div style={btnWrap}>
                    <label style={{ ...label, opacity: 0 }}>Go</label>
                    <button
                        className="btn-primary"
                        onClick={() => handleScan(false)}
                        disabled={loading || (user && user.credits <= 0)}
                        style={{ ...scanBtn, opacity: (user && user.credits <= 0) ? 0.5 : 1 }}
                    >
                        {loading
                            ? <><span style={spinner} />Scanning…</>
                            : "⚡ Scan Market"
                        }
                    </button>
                    {user && (
                        <div style={{ fontSize: "11px", color: user.credits <= 0 ? "#ef4444" : "#64748b", marginTop: "4px", fontWeight: "600", textAlign: "right" }}>
                            {user.credits > 0 ? (
                                <>Credits left: {user.credits} <span style={{ opacity: 0.6 }}>(1 scan = 1 credit)</span></>
                            ) : (
                                <span style={{ color: "#ef4444" }}>No credits left</span>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Error or No Credits handling */}
            {user && user.credits <= 0 && !error && (
                 <div style={{ ...errorBox, background: "#fff7ed", color: "#9a3412" }}>
                     <span>⚠️</span> You have exhausted your credits. <button onClick={() => navigate("/pricing")} style={{ background: "none", border: "none", color: "#ea580c", fontWeight: "700", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Upgrade your plan</button> to continue scanning.
                 </div>
            )}
            {error && (
                <div style={errorBox}>
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Cache info row */}
            {cacheInfo && !loading && (
                <div style={{ marginTop: "16px", padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", fontSize: "14px", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center" }}>
                    <span>✅ Showing cached results {cacheInfo.lastUpdated ? `(last updated ${new Date(cacheInfo.lastUpdated).toLocaleDateString()})` : ""}</span>
                    <button 
                         onClick={() => handleScan(true)}
                         disabled={loading || (user && user.credits <= 0)}
                         style={{ background: "#fff", border: "1px solid #166534", color: "#166534", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", opacity: (user && user.credits <= 0) ? 0.5 : 1 }}
                    >
                         🔄 Refresh Data (uses 1 credit)
                    </button>
                </div>
            )}

            {/* Progress */}
            {loading && (
                <div style={progressBox}>
                    <div style={progressBar}>
                        <div style={progressFill} />
                    </div>
                    <p style={progressText}>Fetching businesses from Google Maps…</p>
                </div>
            )}

            {/* Success summary */}
            {!loading && scanned && leads.length > 0 && (
                <div style={summaryRow}>
                    {[
                        { label: "Total Scanned", val: leads.length, color: "#6366f1" },
                        { label: "High Opportunity", val: leads.filter(b => b.opportunityScore >= 70).length, color: "#22c55e" },
                        { label: "No Website", val: leads.filter(b => !b.website).length, color: "#f59e0b" },
                        { label: "Strong Leads (⭐<4)", val: leads.filter(b => b.rating < 4).length, color: "#ef4444" },
                    ].map(({ label: lbl, val, color }) => (
                        <div key={lbl} style={{ ...summaryTile, borderTop: `3px solid ${color}` }}>
                            <span style={{ ...summaryVal, color }}>{val}</span>
                            <span style={summaryLbl}>{lbl}</span>
                        </div>
                    ))}
                </div>
            )}

        </div>

    )

}

/* ── Styles ──────────────────────────────────────────── */

const scannerCard = { padding: "28px" }

const scannerHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px"
}

const scannerTitle = { fontSize: "17px", fontWeight: "700", marginBottom: "4px" }
const scannerSub = { fontSize: "13px", color: "#64748b" }

const resultBadge = {
    background: "#eef2ff",
    borderRadius: "10px",
    padding: "10px 18px",
    textAlign: "center",
    border: "1px solid #c7d2fe"
}
const resultNum = { display: "block", fontSize: "26px", fontWeight: "800", color: "#6366f1" }
const resultLbl = { fontSize: "11px", color: "#6366f1", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }

const inputRow = { display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" }
const inputGroup = { display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 160px" }
const label = { fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }
const inputStyle = { width: "100%", minWidth: "0" }
const btnWrap = { display: "flex", flexDirection: "column", gap: "6px" }

const scanBtn = {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap"
}

const spinner = {
    display: "inline-block",
    width: "13px",
    height: "13px",
    border: "2px solid rgba(255,255,255,.4)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite"
}

const errorBox = {
    marginTop: "16px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    display: "flex",
    gap: "8px"
}

const progressBox = { marginTop: "20px" }
const progressBar = { height: "4px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden", marginBottom: "10px" }
const progressFill = {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    width: "60%",
    borderRadius: "99px",
    animation: "progress 1.5s ease-in-out infinite"
}
const progressText = { fontSize: "13px", color: "#64748b", textAlign: "center" }

const summaryRow = { display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }
const summaryTile = {
    flex: "1 1 120px",
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
}
const summaryVal = { fontSize: "22px", fontWeight: "800" }
const summaryLbl = { fontSize: "11px", color: "#64748b", fontWeight: "600" }
import { useState } from "react"
import { scanMarket } from "../services/api"
import { useMarketStore } from "../store/marketStore"
import useAuthStore from "../store/authStore"
import { useNavigate } from "react-router-dom"

export default function FirstScanOnboarding({ onScanComplete }) {

    const { setBusinesses, clearBusinesses } = useMarketStore()
    const { user, updateUser } = useAuthStore()
    const navigate = useNavigate()

    const [city, setCity] = useState("")
    const [keyword, setKeyword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleQuickStart = (kw, c) => {
        setKeyword(kw)
        setCity(c)
        handleScan(kw, c)
    }

    const handleScan = async (kw = keyword, c = city) => {
        if (!c.trim() || !kw.trim()) {
            alert("Please enter a keyword and city")
            return
        }

        try {
            setLoading(true)
            setError(null)
            clearBusinesses()

            const response = await scanMarket(kw.trim(), c.trim())

            if (!response.success) {
                throw new Error(response.error || "Scan failed")
            }

            const raw = response.data?.businesses || []
            const calcScore = (b) => {
                let s = 100
                const rev = Number(b.reviews) || Number(b.totalReviews) || 0
                const rat = Number(b.rating) || 0
                if (rev > 200) s -= 40; else if (rev > 100) s -= 25; else if (rev > 50) s -= 10
                if (rat > 4.6) s -= 20; else if (rat > 4.3) s -= 10
                if (!b.website) s += 15
                return Math.max(0, Math.min(100, s))
            }

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
                opportunityScore: lead.opportunityScore ?? calcScore(lead)
            }))

            setBusinesses(results)

            localStorage.setItem("locitra_first_scan_complete", "true")

            if (onScanComplete) onScanComplete(results)

            if (!response.data?.fromCache) {
                // If it wasn't a cache hit, we likely consumed a credit
                if (user && typeof user.credits === "number" && user.credits > 0) {
                    updateUser({ credits: user.credits - 1 })
                }
            }

        } catch (err) {
            console.error("[Onboarding] error:", err)
            setError("Scan failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => { if (e.key === "Enter" && (!user || user.credits > 0)) handleScan() }

    return (
        <div style={panel}>
            <h2 style={title}>Welcome to Locitra 🚀</h2>
            <p style={subtitle}>Find your first client opportunity in seconds.</p>
            <p style={desc}>Scan any city and discover businesses that need SEO, more reviews, or a website.</p>

            {error && <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fca5a5", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", display: "inline-block" }}>{error}</div>}

            <div style={inputsWrap}>
                <input
                    style={inputStyle}
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Dentist, Plumber, Roofing, Restaurant"
                />
                <input
                    style={inputStyle}
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Chicago, Austin, Dallas, Miami"
                />
                <button style={{ ...scanBtn, opacity: (user && user.credits <= 0) ? 0.5 : 1 }} disabled={loading || (user && user.credits <= 0)} onClick={() => handleScan(keyword, city)}>
                    {loading ? "Scanning..." : "Scan Market"}
                </button>
            </div>

            {user && user.credits > 0 && (
                 <div style={{ fontSize: "11px", color: "#64748b", marginTop: "-16px", marginBottom: "16px", fontWeight: "600" }}>
                     Credits left: {user.credits} <span style={{ opacity: 0.6 }}>(1 scan = 1 credit)</span>
                 </div>
            )}
            {user && user.credits <= 0 && !error && (
                 <div style={{ color: "#9a3412", background: "#fff7ed", border: "1px solid #fdba74", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", display: "inline-block" }}>
                     <span>⚠️</span> You have exhausted your credits. <button onClick={() => navigate("/pricing")} style={{ background: "none", border: "none", color: "#ea580c", fontWeight: "700", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Upgrade your plan</button> to continue.
                 </div>
            )}

            <div style={quickStartWrap}>
                <span style={qsLabel}>Try one of these markets:</span>
                <div style={qsButtons}>
                    <button style={qsBtn} onClick={() => handleQuickStart("Dentist", "Chicago")} disabled={loading || (user && user.credits <= 0)}>• Dentist – Chicago</button>
                    <button style={qsBtn} onClick={() => handleQuickStart("Plumber", "Austin")} disabled={loading || (user && user.credits <= 0)}>• Plumber – Austin</button>
                    <button style={qsBtn} onClick={() => handleQuickStart("Roofing", "Dallas")} disabled={loading || (user && user.credits <= 0)}>• Roofing – Dallas</button>
                    <button style={qsBtn} onClick={() => handleQuickStart("Restaurant", "Miami")} disabled={loading || (user && user.credits <= 0)}>• Restaurant – Miami</button>
                </div>
            </div>

            {loading && (
                <div style={progressBox}>
                    <div style={progressBar}>
                        <div style={progressFill} />
                    </div>
                    <p style={progressText}>Fetching businesses from Google Maps…</p>
                </div>
            )}
        </div>
    )
}

/* ── Styles ── */
const panel = {
    background: "#f7f9ff",
    border: "1px solid #e4e8ff",
    borderRadius: "16px",
    padding: "36px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
    textAlign: "center"
}

const title = { fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }
const subtitle = { fontSize: "16px", fontWeight: "600", color: "#3b82f6", marginBottom: "12px" }
const desc = { fontSize: "15px", color: "#64748b", maxWidth: "480px", margin: "0 auto 24px" }

const inputsWrap = {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    maxWidth: "700px",
    margin: "0 auto 24px",
    flexWrap: "wrap",
    alignItems: "center"
}

const inputStyle = {
    padding: "14px 18px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "15px",
    flex: "1 1 200px",
    outline: "none"
}

const scanBtn = {
    padding: "14px 28px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #a855f7, #6366f1)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flex: "0 1 auto"
}

const quickStartWrap = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center"
}

const qsLabel = { fontSize: "13px", color: "#64748b", fontWeight: "600" }
const qsButtons = { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }
const qsBtn = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#475569",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.15s ease"
}

const progressBox = { marginTop: "24px" }
const progressBar = { height: "4px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden", marginBottom: "10px", maxWidth: "400px", margin: "0 auto 10px" }
const progressFill = {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    width: "60%",
    borderRadius: "99px",
    animation: "progress 1.5s ease-in-out infinite"
}
const progressText = { fontSize: "13px", color: "#64748b" }

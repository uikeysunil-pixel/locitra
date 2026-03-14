import { useState } from "react"
import { Link } from "react-router-dom"

const API_BASE = "http://localhost:5000/api"

export default function ScanPreview() {

    const [form, setForm] = useState({ keyword: "", location: "" })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

    const handleScan = async (e) => {
        e.preventDefault()
        setError("")
        setResult(null)
        setLoading(true)

        try {
            const res = await fetch(`${API_BASE}/free-scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword: form.keyword, location: form.location })
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.message || "Scan failed")
            setResult(data)
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    return (
        <div style={page}>

            {/* ── Hero ── */}
            <div style={hero}>
                <div style={heroBadge}>🔍 Free Market Preview</div>
                <h1 style={heroTitle}>Discover Local Business Leads<br />in Any City — Instantly</h1>
                <p style={heroSub}>
                    Scan any market for free. See how many high-opportunity leads are waiting.
                </p>

                {/* ── Scan form ── */}
                <form onSubmit={handleScan} style={formRow}>
                    <input
                        placeholder="Business type (e.g. dentist)"
                        value={form.keyword}
                        onChange={set("keyword")}
                        required
                        style={inputStyle}
                    />
                    <input
                        placeholder="City (e.g. Chicago)"
                        value={form.location}
                        onChange={set("location")}
                        required
                        style={inputStyle}
                    />
                    <button type="submit" style={scanBtn} disabled={loading}>
                        {loading ? "Scanning…" : "⚡ Scan Market"}
                    </button>
                </form>

                {error && <div style={errBox}>{error}</div>}
            </div>

            {/* ── Results ── */}
            {result && (
                <div style={results}>

                    {/* ── Stat cards ── */}
                    <div style={statsRow}>
                        <StatCard icon="🏢" label="Businesses Found" value={result.totalBusinesses} />
                        <StatCard icon="🔥" label="High Opportunity" value={result.highOpportunity} color="#ef4444" />
                        <StatCard icon="🌐" label="No Website Detected" value={result.noWebsite} color="#f59e0b" />
                    </div>

                    {/* ── Preview table ── */}
                    <div style={previewCard}>
                        <h3 style={previewTitle}>Preview Results (5 of {result.totalBusinesses})</h3>

                        <div style={tableWrap}>
                            <table style={table}>
                                <thead>
                                    <tr>
                                        {["Business", "Category", "Rating", "Reviews", "Opportunity", "Website"].map(h => (
                                            <th key={h} style={th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.preview.map((b, i) => (
                                        <tr key={i} style={tRow}>
                                            <td style={{ ...td, fontWeight: "700" }}>{b.name}</td>
                                            <td style={{ ...td, color: "#64748b", fontSize: "12px" }}>{b.category || "—"}</td>
                                            <td style={td}>⭐ {b.rating || "–"}</td>
                                            <td style={td}>{b.reviews || 0}</td>
                                            <td style={td}>
                                                <span style={scoreBadge(b.opportunityScore)}>
                                                    {b.opportunityScore ?? "—"}
                                                </span>
                                            </td>
                                            <td style={td}>
                                                {b.website
                                                    ? <span style={{ color: "#16a34a", fontWeight: "600", fontSize: "12px" }}>✔ Has website</span>
                                                    : <span style={{ color: "#ef4444", fontWeight: "600", fontSize: "12px" }}>No Website</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Locked rows teaser ── */}
                        {result.locked > 0 && (
                            <div style={lockedBanner}>
                                <div style={lockedBlur}>
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} style={blurRow}>
                                            <span style={blurCell(140)} />
                                            <span style={blurCell(60)} />
                                            <span style={blurCell(40)} />
                                            <span style={blurCell(40)} />
                                        </div>
                                    ))}
                                </div>
                                <div style={lockedOverlay}>
                                    <div style={lockBox}>
                                        <span style={{ fontSize: "28px" }}>🔒</span>
                                        <p style={lockTitle}>
                                            Unlock {result.locked} more leads
                                        </p>
                                        <p style={lockSub}>
                                            Create a free account to access all{" "}
                                            <strong>{result.totalBusinesses}</strong> businesses,
                                            full contact details, and AI outreach scripts.
                                        </p>
                                        <div style={lockActions}>
                                            <Link to="/register" style={signupBtn}>
                                                🚀 Create Free Account
                                            </Link>
                                            <Link to="/login" style={loginLink}>
                                                Already have an account? Sign in →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}

        </div>
    )
}

function StatCard({ icon, label, value, color = "#6366f1" }) {
    return (
        <div style={statCard}>
            <span style={{ fontSize: "26px" }}>{icon}</span>
            <div>
                <div style={{ fontSize: "28px", fontWeight: "900", color }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{label}</div>
            </div>
        </div>
    )
}

/* ── Styles ── */
const page = { minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)" }
const hero = { maxWidth: "700px", margin: "0 auto", padding: "70px 24px 40px", textAlign: "center" }
const heroBadge = { display: "inline-block", background: "rgba(99,102,241,0.2)", color: "#a5b4fc", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: "700", marginBottom: "18px", border: "1px solid rgba(99,102,241,0.3)" }
const heroTitle = { fontSize: "clamp(28px,5vw,48px)", fontWeight: "900", color: "#fff", lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-1px" }
const heroSub = { fontSize: "16px", color: "#94a3b8", margin: "0 0 32px" }

const formRow = { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }
const inputStyle = { padding: "13px 16px", borderRadius: "10px", border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: "14px", outline: "none", flex: "1 1 180px", minWidth: "160px" }
const scanBtn = { padding: "13px 26px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: "800", border: "none", cursor: "pointer", fontSize: "15px" }
const errBox = { marginTop: "14px", background: "rgba(239,68,68,0.15)", color: "#fca5a5", borderRadius: "10px", padding: "12px" }

const results = { maxWidth: "900px", margin: "0 auto", padding: "0 24px 60px" }
const statsRow = { display: "flex", gap: "14px", marginBottom: "24px", flexWrap: "wrap" }
const statCard = { display: "flex", alignItems: "center", gap: "14px", background: "rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px 22px", border: "1px solid rgba(255,255,255,0.08)", flex: 1, minWidth: "140px" }

const previewCard = { background: "#fff", borderRadius: "16px", overflow: "hidden" }
const previewTitle = { fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0, padding: "18px 20px 14px" }
const tableWrap = { overflowX: "auto" }
const table = { width: "100%", borderCollapse: "collapse", fontSize: "13px" }
const th = { padding: "10px 14px", textAlign: "left", background: "#f8fafc", fontWeight: "700", color: "#475569", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }
const td = { padding: "12px 14px", color: "#0f172a", borderBottom: "1px solid #f1f5f9" }
const tRow = {}

const scoreBadge = (s = 0) => ({
    padding: "3px 8px", borderRadius: "99px", fontWeight: "700", fontSize: "11px",
    background: s >= 70 ? "#f0fdf4" : s >= 40 ? "#fffbeb" : "#f1f5f9",
    color: s >= 70 ? "#16a34a" : s >= 40 ? "#ca8a04" : "#64748b"
})

const lockedBanner = { position: "relative" }
const lockedBlur = { padding: "10px 14px", filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }
const blurRow = { display: "flex", gap: "20px", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }
const blurCell = (w) => ({ display: "inline-block", height: "14px", width: w, background: "#e2e8f0", borderRadius: "4px" })
const lockedOverlay = { position: "absolute", inset: 0, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid #e2e8f0" }
const lockBox = { textAlign: "center", padding: "30px 20px" }
const lockTitle = { fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "10px 0 8px" }
const lockSub = { fontSize: "14px", color: "#475569", maxWidth: "360px", margin: "0 auto 20px" }
const lockActions = { display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }
const signupBtn = { padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: "700", textDecoration: "none", fontSize: "14px" }
const loginLink = { fontSize: "13px", color: "#6366f1", textDecoration: "none", fontWeight: "600" }

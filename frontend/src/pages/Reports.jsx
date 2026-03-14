import { useState, useEffect } from "react"
import { fetchMyLeads } from "../services/api"

const API_BASE = "http://localhost:5000/api"

const getToken = () => {
    try {
        const raw = localStorage.getItem("locitra-auth")
        return raw ? JSON.parse(raw)?.state?.token || "" : ""
    } catch { return "" }
}

export default function Reports() {

    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ companyName: "", customMessage: "", keyword: "", city: "" })
    const [downloading, setDownloading] = useState(null)

    useEffect(() => {
        fetchMyLeads().then(res => {
            if (res.success) setLeads(res.data.leads || [])
            setLoading(false)
        })
    }, [])

    const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

    const handleDownload = async (format) => {
        setDownloading(format)
        try {
            const token = getToken()
            const params = new URLSearchParams({
                company: form.companyName,
                message: form.customMessage,
                keyword: form.keyword,
                city: form.city
            })
            const url = `${API_BASE}/reports/${format}?${params}`

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const errorText = await response.text()
                alert(errorText || "Failed to generate report")
                console.error("Failed to generate report:", errorText)
            } else {
                const blob = await response.blob()
                const objectUrl = window.URL.createObjectURL(blob)

                const a = document.createElement("a")
                a.href = objectUrl
                a.download = `locitra-report.${format}`
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(objectUrl)
            }
        } catch (error) {
            console.error("Download error:", error)
        } finally {
            setDownloading(null)
        }
    }



    return (
        <div style={page}>

            <div style={header}>
                <div>
                    <h2 style={heading}>📊 White-Label Reports</h2>
                    <p style={sub}>Generate branded client reports from your saved leads</p>
                </div>
            </div>



            {loading && <p style={{ color: "#94a3b8", marginTop: "12px" }}>Loading your leads…</p>}

            {!loading && leads.length === 0 && (
                <div style={emptyBox}>
                    Run a market scan from the Dashboard first to generate a report.
                </div>
            )}

            {/* ── Branding form ── */}
            <div style={formCard}>
                <h3 style={sectionTitle}>Report Branding</h3>

                <div style={grid}>
                    <div>
                        <label style={label}>Your Company Name</label>
                        <input placeholder="Acme Marketing Agency" value={form.companyName} onChange={set("companyName")} style={inputStyle} />
                    </div>
                    <div>
                        <label style={label}>Market Keyword</label>
                        <input placeholder="dentist" value={form.keyword} onChange={set("keyword")} style={inputStyle} />
                    </div>
                    <div>
                        <label style={label}>City</label>
                        <input placeholder="Chicago" value={form.city} onChange={set("city")} style={inputStyle} />
                    </div>
                </div>

                <label style={{ ...label, marginTop: "16px" }}>Custom Message (optional)</label>
                <textarea
                    placeholder="e.g. These are the top local opportunities identified for Q1 2025…"
                    value={form.customMessage}
                    onChange={set("customMessage")}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                />

                <div style={btnRow}>
                    <button onClick={() => handleDownload("pdf")} style={pdfBtn} disabled={!!downloading}>
                        {downloading === "pdf" ? "Generating report..." : "📄 Download PDF Report"}
                    </button>
                    <button onClick={() => handleDownload("csv")} style={csvBtn} disabled={!!downloading}>
                        {downloading === "csv" ? "Generating report..." : "📊 Export CSV"}
                    </button>
                </div>
            </div>

        </div>
    )
}



/* ── Styles ── */
const page = { padding: "28px 24px" }
const header = { marginBottom: "20px" }
const heading = { fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }
const sub = { fontSize: "13px", color: "#64748b", margin: "4px 0 0" }
const emptyBox = { background: "#fffbeb", borderRadius: "12px", padding: "20px", color: "#92400e", fontSize: "13px", marginBottom: "20px" }
const formCard = { background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }
const sectionTitle = { fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px" }
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }
const label = { display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box" }
const btnRow = { display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }
const pdfBtn = { padding: "12px 22px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "13px" }
const csvBtn = { padding: "12px 22px", borderRadius: "10px", background: "#f1f5f9", color: "#374151", fontWeight: "700", border: "1.5px solid #e2e8f0", cursor: "pointer", fontSize: "13px" }

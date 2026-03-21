import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { fetchMyLeads } from "../services/api"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const getToken = () => {
    try { return JSON.parse(localStorage.getItem("locitra-auth") || "{}")?.state?.token || "" }
    catch { return "" }
}

export default function Outreach({ initialLead }) {

    const [leads, setLeads] = useState([])
    const [selected, setSelected] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [leadsLoaded, setLeadsLoaded] = useState(false)
    const [activeTab, setActiveTab] = useState("email")
    const [copied, setCopied] = useState(false)
    const [copiedSubject, setCopiedSubject] = useState(false)
    const [copiedEmail, setCopiedEmail] = useState(false)

    const location = useLocation()

    useEffect(() => {
        if (initialLead) {
            setSelected(initialLead)
        } else if (location.state?.lead) {
            setSelected(location.state.lead)
        }
    }, [initialLead, location.state])

    const loadLeads = async () => {
        if (leadsLoaded) return
        const res = await fetchMyLeads()
        if (res.success) setLeads(res.data.leads || [])
        setLeadsLoaded(true)
    }

    const generate = async () => {
        if (!selected) return
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/outreach/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
                body: JSON.stringify(selected)
            })
            const data = await res.json()
            setResult(data)
            setActiveTab("email")
        } catch { /* swallow */ }
        setLoading(false)
    }

    const handleCopy = async (text, type = "default") => {
        try {
            await navigator.clipboard.writeText(text || "")
            if (type === "subject") {
                setCopiedSubject(true)
                setTimeout(() => setCopiedSubject(false), 2000)
            } else if (type === "email") {
                setCopiedEmail(true)
                setTimeout(() => setCopiedEmail(false), 2000)
            } else {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        } catch (err) {
            console.error("Copy failed", err)
        }
    }

    return (
        <div style={page}>

            <h2 style={heading}>✉ AI Outreach Generator</h2>
            <p style={sub}>Generate cold email, call script, and LinkedIn DM for any saved lead</p>

            {/* ── Lead Selector ── */}
            <div style={selectorCard}>
                <select
                    style={selectStyle}
                    onClick={loadLeads}
                    onChange={e => {
                        const val = e.target.value
                        if (val === "imported-lead-temp") return // keep currently selected imported lead
                        const lead = leads.find(l => l._id === val)
                        setSelected(lead || null)
                        setResult(null)
                    }}
                    value={
                        selected
                            ? (leads.find(l => l._id === selected._id) ? selected._id : "imported-lead-temp")
                            : ""
                    }
                >
                    <option value="">— Select a saved lead —</option>
                    {selected && !leads.find(l => l._id === selected._id) && (
                        <option value="imported-lead-temp">
                            {selected.name} (Auto-selected) · {selected.city || "Unknown City"} · Score {selected.opportunityScore || 0}
                        </option>
                    )}
                    {leads.map(l => (
                        <option key={l._id} value={l._id}>
                            {l.name} · {l.city} · Score {l.opportunityScore}
                        </option>
                    ))}
                </select>

                <button onClick={generate} style={genBtn} disabled={!selected || loading}>
                    {loading ? "Generating…" : "⚡ Generate Scripts"}
                </button>
            </div>

            {/* ── Audit Flags ── */}
            {result && (
                <div style={auditCard}>
                    <div style={auditHeader}>
                        <span style={auditTitle}>🔍 SEO Audit</span>
                        <span style={urgencyBadge(result.audit?.urgency)}>
                            {result.audit?.urgency} Urgency
                        </span>
                    </div>
                    <p style={auditSummary}>{result.audit?.summary}</p>
                    <ul style={{ margin: "10px 0 0", padding: "0 0 0 18px" }}>
                        {(result.audit?.flags || []).map((f, i) => (
                            <li key={i} style={flagItem}>{f}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Outreach Tabs ── */}
            {result && (
                <div style={outreachCard}>

                    <div style={tabs}>
                        {[
                            { id: "email", label: "📧 Cold Email" },
                            { id: "call", label: "📞 Call Script" },
                            { id: "linkedin", label: "💼 LinkedIn DM" }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                style={tabBtn(activeTab === t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div style={scriptBox}>
                        <pre style={pre}>
                            {activeTab === "email" && result.outreach?.email}
                            {activeTab === "call" && result.outreach?.callScript}
                            {activeTab === "linkedin" && result.outreach?.linkedinDM}
                        </pre>

                        {activeTab === "email" ? (() => {
                            const emailText = result.outreach?.email || "";
                            let subjectStr = "";
                            let bodyStr = emailText;
                            if (emailText.startsWith("Subject: ")) {
                                const breakIdx = emailText.indexOf("\n\n");
                                if (breakIdx !== -1) {
                                    subjectStr = emailText.substring("Subject: ".length, breakIdx).trim();
                                    bodyStr = emailText.substring(breakIdx + 2).trim();
                                }
                            }
                            return (
                                <div style={emailCopyActions}>
                                    <button
                                        style={copyBtnGroup}
                                        onClick={() => handleCopy(subjectStr, "subject")}
                                    >
                                        {copiedSubject ? "✓ Subject copied" : "📋 Copy Subject"}
                                    </button>
                                    <button
                                        style={copyBtnGroup}
                                        onClick={() => handleCopy(bodyStr, "email")}
                                    >
                                        {copiedEmail ? "✓ Email copied" : "📋 Copy Email"}
                                    </button>
                                </div>
                            );
                        })() : (
                            <button
                                style={copyBtn}
                                onClick={() => handleCopy(
                                    activeTab === "call" ? result.outreach?.callScript :
                                        result.outreach?.linkedinDM
                                )}
                            >
                                {copied ? "✓ Copied to clipboard" : "📋 Copy"}
                            </button>
                        )}
                    </div>

                </div>
            )}

        </div>
    )
}

/* ── Styles ── */
const page = { padding: "28px 24px" }
const heading = { fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }
const sub = { fontSize: "13px", color: "#64748b", margin: "4px 0 20px" }

const selectorCard = { display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }
const selectStyle = { flex: 1, minWidth: "240px", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none" }
const genBtn = { padding: "11px 22px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "13px" }

const auditCard = { background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #e2e8f0", marginBottom: "16px" }
const auditHeader = { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }
const auditTitle = { fontSize: "14px", fontWeight: "700", color: "#0f172a" }
const auditSummary = { fontSize: "13px", color: "#475569", margin: 0 }
const flagItem = { fontSize: "13px", color: "#374151", marginBottom: "5px" }

const urgencyBadge = (u) => ({
    padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
    background: u === "High" ? "#fef2f2" : u === "Medium" ? "#fffbeb" : "#f0fdf4",
    color: u === "High" ? "#b91c1c" : u === "Medium" ? "#92400e" : "#166534"
})

const outreachCard = { background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }
const tabs = { display: "flex", borderBottom: "1px solid #e2e8f0" }
const tabBtn = (active) => ({
    padding: "12px 20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600",
    background: active ? "#fff" : "#f8fafc",
    color: active ? "#6366f1" : "#64748b",
    borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
    transition: "all .15s"
})

const scriptBox = { position: "relative", padding: "20px" }
const pre = { margin: 0, fontFamily: "monospace", fontSize: "12.5px", color: "#334155", whiteSpace: "pre-wrap", lineHeight: 1.7 }
const copyBtn = { position: "absolute", top: "16px", right: "16px", padding: "6px 12px", borderRadius: "8px", background: "#f1f5f9", color: "#374151", fontWeight: "600", fontSize: "12px", border: "1px solid #e2e8f0", cursor: "pointer" }
const emailCopyActions = { position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }
const copyBtnGroup = { padding: "6px 12px", borderRadius: "8px", background: "#f1f5f9", color: "#374151", fontWeight: "600", fontSize: "12px", border: "1px solid #e2e8f0", cursor: "pointer", whiteSpace: "nowrap" }

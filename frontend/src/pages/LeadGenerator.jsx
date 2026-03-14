import { useState, useMemo } from "react"
import { useMarketStore } from "../store/marketStore"
import ExportCSV from "../components/ExportCSV"

export default function LeadGenerator() {

    const { businesses } = useMarketStore()

    const [selected, setSelected] = useState(new Set())
    const [inlineEmails, setInlineEmails] = useState({})
    const [loadingLead, setLoadingLead] = useState(null)
    const [generating, setGenerating] = useState(false)
    const [bulkEmails, setBulkEmails] = useState([])
    const [searchQ, setSearchQ] = useState("")
    const [filterMode, setFilterMode] = useState("all") // all | high | nosite

    /* ── Filtering ───────────────────────────────────── */
    const filtered = useMemo(() => {
        let src = [...businesses]
        if (filterMode === "high") src = src.filter(b => (b.opportunityScore ?? 0) >= 70)
        if (filterMode === "nosite") src = src.filter(b => !b.website)
        if (searchQ.trim()) {
            const q = searchQ.toLowerCase()
            src = src.filter(b =>
                (b.name || "").toLowerCase().includes(q) ||
                (b.category || "").toLowerCase().includes(q) ||
                (b.address || "").toLowerCase().includes(q)
            )
        }
        return src.sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
    }, [businesses, filterMode, searchQ])

    /* ── Selection ───────────────────────────────────── */
    const toggleSelect = (name) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(name) ? next.delete(name) : next.add(name)
            return next
        })
    }

    const toggleAll = () => {
        if (selected.size === filtered.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(filtered.map(b => b.name)))
        }
    }

    /* ── Email helpers ───────────────────────────────── */
    const getReviews = (b) => Number(b.reviews) || Number(b.totalReviews) || 0

    const generateSingle = async (lead) => {
        try {
            setLoadingLead(lead.name)
            const res = await fetch("http://localhost:5000/api/outreach/generate-outreach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName: lead.name,
                    category: lead.category || "business",
                    rating: lead.rating,
                    reviews: getReviews(lead),
                    city: lead.location || lead.city || ""
                })
            })
            const data = await res.json()
            setInlineEmails(prev => ({ ...prev, [lead.name]: data.outreach || "No email generated" }))
        } catch (e) {
            console.error("Email gen failed:", e)
        } finally {
            setLoadingLead(null)
        }
    }

    const generateBulk = async () => {
        if (selected.size === 0) { alert("Select at least one lead"); return }
        setGenerating(true)
        const results = []
        for (const name of selected) {
            const lead = businesses.find(b => b.name === name)
            if (!lead) continue
            try {
                const res = await fetch("http://localhost:5000/api/outreach/generate-outreach", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        businessName: lead.name,
                        category: lead.category || "business",
                        rating: lead.rating,
                        reviews: getReviews(lead),
                        city: lead.location || lead.city || ""
                    })
                })
                const data = await res.json()
                results.push({ business: lead.name, email: data.outreach || "Generation failed" })
            } catch {
                results.push({ business: lead.name, email: "Error generating email" })
            }
        }
        setBulkEmails(results)
        setGenerating(false)
    }

    const getMapsLink = (b) =>
        b.mapsLink ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name || ""} ${b.city || ""}`)}`

    const getOpBadge = (score) => {
        const s = Number(score) || 0
        if (s >= 70) return <span className="badge badge-high">High</span>
        if (s >= 40) return <span className="badge badge-medium">Medium</span>
        return <span className="badge badge-low">Low</span>
    }

    /* ── Empty state ─────────────────────────────────── */
    if (businesses.length === 0) {
        return (
            <div style={page}>
                <h1 style={pageTitle}>Lead Generator</h1>
                <div className="card" style={emptyCard}>
                    <p style={{ fontSize: "40px", marginBottom: "12px" }}>🚀</p>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>No leads yet</h3>
                    <p style={{ color: "#64748b", fontSize: "15px" }}>
                        Run a <strong>Market Scan</strong> from the Dashboard to populate this list.
                    </p>
                </div>
            </div>
        )
    }

    /* ── Render ──────────────────────────────────────── */
    return (

        <div style={page}>

            {/* Header */}
            <div style={pageHeader}>
                <div>
                    <h1 style={pageTitle}>Lead Generator</h1>
                    <p style={pageSub}>{businesses.length} businesses loaded from last scan</p>
                </div>
                <ExportCSV businesses={businesses} />
            </div>

            {/* Controls */}
            <div className="card" style={controls}>

                <input
                    placeholder="Search business, category, address…"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    style={{ flex: 1, minWidth: "200px" }}
                />

                <div style={filterBtns}>
                    {[
                        { key: "all", label: "All Leads" },
                        { key: "high", label: "🎯 High Opportunity" },
                        { key: "nosite", label: "🌐 No Website" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilterMode(key)}
                            className={filterMode === key ? "btn-primary" : "btn-ghost"}
                            style={{ padding: "8px 14px", fontSize: "13px" }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={generateBulk}
                    disabled={generating || selected.size === 0}
                    className="btn-primary"
                    style={{ whiteSpace: "nowrap" }}
                >
                    {generating
                        ? "Generating…"
                        : `✉ Generate Emails (${selected.size})`
                    }
                </button>

            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, marginTop: "20px" }}>

                <div style={{ padding: "16px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                        Showing {filtered.length} leads
                    </p>
                </div>

                <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "600px", marginTop: "12px" }}>
                    <table>
                        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                            <tr>
                                <th style={{ width: "40px" }}>
                                    <input
                                        type="checkbox"
                                        checked={selected.size === filtered.length && filtered.length > 0}
                                        onChange={toggleAll}
                                    />
                                </th>
                                <th>Business</th>
                                <th>Rating</th>
                                <th>Reviews</th>
                                <th>Website</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Opportunity</th>
                                <th>Lead Value</th>
                                <th>Maps</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: "center", color: "#94a3b8", padding: "32px" }}>
                                        No leads match your filters
                                    </td>
                                </tr>
                            )}
                            {filtered.map((lead, i) => {
                                const isSelected = selected.has(lead.name)
                                const leadValue = Math.round((lead.opportunityScore ?? 0) * 5)
                                return (
                                    <tr
                                        key={lead.placeId || `${lead.name}-${i}`}
                                        style={isSelected ? { background: "#eef2ff" } : {}}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(lead.name)}
                                            />
                                        </td>

                                        <td>
                                            <div style={{ fontWeight: "600", fontSize: "14px" }}>{lead.name || "Unknown"}</div>
                                            {lead.category && <div style={{ fontSize: "11px", color: "#94a3b8" }}>{lead.category}</div>}
                                        </td>

                                        <td style={{ color: "#f59e0b", fontWeight: "600" }}>
                                            ⭐ {lead.rating ?? "–"}
                                        </td>

                                        <td>{getReviews(lead).toLocaleString()}</td>

                                        <td>
                                            {lead.website
                                                ? <a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", fontWeight: "600", fontSize: "13px" }}>Visit ↗</a>
                                                : <span style={{ color: "#ef4444", fontWeight: "600", fontSize: "12px" }}>No Website</span>
                                            }
                                        </td>

                                        <td style={{ fontSize: "13px", color: "#475569" }}>
                                            {lead.phone || <span style={{ color: "#cbd5e1" }}>—</span>}
                                        </td>

                                        <td style={{ fontSize: "13px", color: "#475569", maxWidth: "180px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {lead.address || <span style={{ color: "#cbd5e1" }}>—</span>}
                                        </td>

                                        <td>{getOpBadge(lead.opportunityScore)}</td>

                                        <td style={{ fontWeight: "700", color: "#16a34a" }}>${leadValue}</td>

                                        <td>
                                            <a href={getMapsLink(lead)} target="_blank" rel="noopener noreferrer" style={{ color: "#475569", fontSize: "13px" }}>
                                                🗺 View
                                            </a>
                                        </td>

                                        <td>
                                            <button
                                                className="btn-primary btn-sm"
                                                disabled={loadingLead === lead.name}
                                                onClick={() => generateSingle(lead)}
                                            >
                                                {loadingLead === lead.name ? "…" : "✉ Email"}
                                            </button>
                                            {inlineEmails[lead.name] && (
                                                <textarea
                                                    rows={4}
                                                    readOnly
                                                    value={inlineEmails[lead.name]}
                                                    style={{ display: "block", width: "220px", marginTop: "6px", fontSize: "12px", borderRadius: "6px", border: "1px solid #e2e8f0", padding: "6px" }}
                                                />
                                            )}
                                        </td>

                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Bulk email results */}
            {bulkEmails.length > 0 && (
                <div className="card" style={{ marginTop: "28px", padding: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
                        ✉ Bulk Generated Outreach Emails
                    </h3>
                    {bulkEmails.map((item, i) => (
                        <div key={i} style={{ marginBottom: "20px" }}>
                            <p style={{ fontWeight: "600", marginBottom: "6px" }}>{item.business}</p>
                            <textarea
                                rows={6}
                                readOnly
                                value={item.email}
                                style={{ width: "100%", fontSize: "13px", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "10px" }}
                            />
                        </div>
                    ))}
                </div>
            )}

        </div>

    )

}

/* ── Styles ──────────────────────────────────────────── */

const page = { display: "flex", flexDirection: "column" }
const pageHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "4px" }
const pageTitle = { fontSize: "24px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.3px" }
const pageSub = { fontSize: "14px", color: "#64748b", marginTop: "4px" }

const controls = { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", padding: "16px 20px", marginTop: "20px" }
const filterBtns = { display: "flex", gap: "8px", flexWrap: "wrap" }

const emptyCard = { padding: "60px 40px", textAlign: "center", marginTop: "20px" }
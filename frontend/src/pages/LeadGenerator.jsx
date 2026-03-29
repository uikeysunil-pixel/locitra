import { useState, useMemo, useEffect } from "react"
import { useMarketStore } from "../store/marketStore"
import ExportCSV from "../components/ExportCSV"
import useLeadStore from "../store/leadStore"
import Outreach from "./Outreach"
import LeadFilters from "../components/LeadFilters"

export default function LeadGenerator() {

    const { businesses } = useMarketStore()

    const [selected, setSelected] = useState(new Set())
    const [filtered, setFiltered] = useState([])

    const setSelectedLead = useLeadStore((state) => state.setSelectedLead)
    const [outreachLead, setOutreachLead] = useState(null)

    // Close outreach modal on ESC
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') setOutreachLead(null) }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [])

    const handleFilter = (filteredList) => {
        setFiltered(filteredList)
    }

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

            {/* Filters */}
            <div style={{ marginTop: "20px" }}>
                <LeadFilters businesses={businesses} onFilter={handleFilter} />
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
                                                ? <a href={lead.website} target="_blank" rel="noopener noreferrer" style={tableLink}>🌐 Visit ↗</a>
                                                : <span style={noSite}>No Website</span>
                                            }
                                        </td>

                                        <td style={{ fontSize: "13px", color: "#475569", whiteSpace: "nowrap" }}>
                                            {lead.phone ? (
                                                <a href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`} style={tableLink}>📞 {lead.phone}</a>
                                            ) : (
                                                <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>No Phone</span>
                                            )}
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
                                                onClick={() => { setSelectedLead(lead); setOutreachLead(lead) }}
                                                style={outreachBtnStyle}
                                            >
                                                🚀 Outreach
                                            </button>
                                        </td>

                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* ── Outreach Modal ── */}
            {outreachLead && (
                <div style={outreachModalBackdrop} onClick={() => setOutreachLead(null)}>
                    <div style={outreachModalCard} onClick={e => e.stopPropagation()}>
                        <div style={outreachModalHeader}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>✉ AI Outreach Generator</h3>
                            <button onClick={() => setOutreachLead(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
                        </div>
                        <div style={{ flex: 1, overflowY: "auto" }}>
                            <Outreach initialLead={outreachLead} />
                        </div>
                    </div>
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

const tableLink = { color: "#6366f1", textDecoration: "none", fontWeight: "700", cursor: "pointer", fontSize: "13px" }
const noSite = { color: "#ef4444", fontWeight: "600", fontSize: "12px" }

const emptyCard = { padding: "60px 40px", textAlign: "center", marginTop: "20px" }

const outreachBtnStyle = { padding: "6px 10px", borderRadius: "6px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap", transition: "all 0.2s" }

const outreachModalBackdrop = {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(15, 23, 42, 0.65)", display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 10000, padding: "20px"
}
const outreachModalCard = {
    background: "#fff", borderRadius: "16px",
    width: "100%", maxWidth: "900px", maxHeight: "90vh",
    display: "flex", flexDirection: "column",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden"
}
const outreachModalHeader = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc"
}
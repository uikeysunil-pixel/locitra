import { useState, useEffect, useCallback } from "react"
import { fetchMyLeads, updateLead, saveLead, deleteLead, bulkDeleteLeads } from "../services/api"

const STATUS_OPTIONS = ["New", "Contacted", "Interested", "Meeting", "Closed"]

const STATUS_COLORS = {
    New: { bg: "#eff6ff", color: "#2563eb" },
    Contacted: { bg: "#fefce8", color: "#ca8a04" },
    Interested: { bg: "#f0fdf4", color: "#16a34a" },
    Meeting: { bg: "#faf5ff", color: "#7c3aed" },
    Closed: { bg: "#f0fdf4", color: "#15803d" }
}

export default function LeadManager() {

    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [notes, setNotes] = useState({})    // leadId → text
    const [saving, setSaving] = useState({})    // leadId → bool
    const [search, setSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState([])

    const loadLeads = useCallback(async () => {
        setLoading(true)
        const res = await fetchMyLeads()
        setLoading(false)
        if (res.success) setLeads(res.data.leads || [])
        else setError(res.error || "Failed to load leads")
    }, [])

    useEffect(() => { loadLeads() }, [loadLeads])

    const patchStatus = async (id, status) => {
        setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l))
        await updateLead(id, { status })
    }

    const saveNotes = async (id) => {
        setSaving(prev => ({ ...prev, [id]: true }))
        await updateLead(id, { notes: notes[id] })
        setSaving(prev => ({ ...prev, [id]: false }))
        setLeads(prev => prev.map(l => l._id === id ? { ...l, notes: notes[id] } : l))
    }

    const filtered = leads.filter(l =>
        !search ||
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.city?.toLowerCase().includes(search.toLowerCase())
    )

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filtered.map(l => l._id))
        }
    }

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleDeleteSingle = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lead from your CRM?")) return;
        
        try {
            const res = await deleteLead(id);
            if (res.success) {
                setLeads(prev => prev.filter(l => l._id !== id));
                setSelectedIds(prev => prev.filter(x => x !== id));
            } else {
                alert("Failed to delete lead. Please try again.");
            }
        } catch (err) {
            alert("Failed to delete lead. Please try again.");
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm("Are you sure you want to delete the selected leads?")) return;
        
        try {
            const res = await bulkDeleteLeads(selectedIds);
            if (res.success) {
                setLeads(prev => prev.filter(l => !selectedIds.includes(l._id)));
                setSelectedIds([]);
            } else {
                alert("Failed to delete lead. Please try again.");
            }
        } catch (err) {
            alert("Failed to delete lead. Please try again.");
        }
    }

    return (
        <div style={page}>

            {/* ── Header ── */}
            <div style={header}>
                <div>
                    <h2 style={heading}>📋 Lead CRM</h2>
                    <p style={sub}>{leads.length} leads saved · manage your pipeline</p>
                </div>
                <input
                    placeholder="Search leads…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={searchInput}
                />
            </div>

            {error && <div style={errBox}>{error}</div>}

            {loading ? (
                <div style={emptyState}>Loading leads…</div>
            ) : filtered.length === 0 ? (
                <div style={emptyState}>
                    No leads yet. Save businesses from the Dashboard to get started.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            onClick={handleBulkDelete}
                            disabled={selectedIds.length === 0}
                            style={{ ...bulkDeleteBtn, opacity: selectedIds.length === 0 ? 0.5 : 1, cursor: selectedIds.length === 0 ? "not-allowed" : "pointer" }}
                        >
                            Delete Selected ({selectedIds.length})
                        </button>
                    </div>
                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={{...th, width: "40px", textAlign: "center"}}>
                                        <input
                                            type="checkbox"
                                            checked={filtered.length > 0 && selectedIds.length === filtered.length}
                                            onChange={toggleSelectAll}
                                            style={{ cursor: "pointer" }}
                                        />
                                    </th>
                                    {["Business", "City", "Website", "Email", "Phone", "Opp Score", "Priority", "Status", "Notes", "Last Contact"].map(h => (
                                        <th key={h} style={th}>{h}</th>
                                    ))}
                                    <th style={{...th, textAlign: "center"}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            {filtered.map(lead => (
                                <tr key={lead._id} style={tr}>
                                    <td style={{...td, textAlign: "center"}}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(lead._id)}
                                            onChange={() => toggleSelect(lead._id)}
                                            style={{ cursor: "pointer" }}
                                        />
                                    </td>

                                    <td style={{ ...td, fontWeight: "700", maxWidth: "160px" }}>
                                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {lead.name}
                                        </div>
                                        {lead.category && <div style={catTag}>{lead.category}</div>}
                                    </td>

                                    <td style={{ ...td, color: "#64748b", fontSize: "12px" }}>{lead.city || "—"}</td>

                                    <td style={td}>
                                        {lead.website
                                            ? <a href={lead.website} target="_blank" rel="noopener noreferrer" style={link}>Visit ↗</a>
                                            : <span style={noSite}>No Website</span>}
                                    </td>

                                    <td style={{ ...td, fontSize: "12px" }}>{lead.email || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                                    <td style={{ ...td, fontSize: "12px" }}>{lead.phone || <span style={{ color: "#cbd5e1" }}>—</span>}</td>

                                    <td style={td}>
                                        <span style={scoreBadge(lead.opportunityScore)}>{lead.opportunityScore}</span>
                                    </td>

                                    <td style={td}>
                                        <span style={{ fontWeight: "700", color: "#6366f1" }}>
                                            {lead.priorityScore || "—"}
                                        </span>
                                    </td>

                                    <td style={td}>
                                        <select
                                            value={lead.status}
                                            onChange={e => patchStatus(lead._id, e.target.value)}
                                            style={statusSelect(lead.status)}
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>

                                    <td style={td}>
                                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                            <input
                                                value={notes[lead._id] !== undefined ? notes[lead._id] : (lead.notes || "")}
                                                onChange={e => setNotes(prev => ({ ...prev, [lead._id]: e.target.value }))}
                                                placeholder="Add note…"
                                                style={noteInput}
                                            />
                                            {notes[lead._id] !== undefined && (
                                                <button onClick={() => saveNotes(lead._id)} style={saveBtn} disabled={saving[lead._id]}>
                                                    {saving[lead._id] ? "…" : "✓"}
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    <td style={{ ...td, fontSize: "11px", color: "#94a3b8" }}>
                                        {lead.contactedAt
                                            ? new Date(lead.contactedAt).toLocaleDateString()
                                            : "—"}
                                    </td>

                                    <td style={{...td, textAlign: "center"}}>
                                        <button
                                            onClick={() => handleDeleteSingle(lead._id)}
                                            style={deleteBtn}
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </div>
            )}
        </div>
    )
}

/* ── Styles ── */
const page = { padding: "28px 24px" }
const header = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }
const heading = { fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }
const sub = { fontSize: "13px", color: "#64748b", margin: "4px 0 0" }
const errBox = { background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: "10px", padding: "12px", marginBottom: "16px" }
const searchInput = { padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "13px", width: "220px", outline: "none" }
const tableWrap = { overflowX: "auto", borderRadius: "14px", border: "1px solid #e2e8f0" }
const table = { width: "100%", borderCollapse: "collapse", fontSize: "13px" }
const th = { padding: "12px 14px", textAlign: "left", background: "#f8fafc", fontWeight: "700", color: "#475569", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }
const td = { padding: "12px 14px", color: "#0f172a", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" }
const tr = { transition: "background .1s" }
const link = { color: "#6366f1", fontWeight: "600", fontSize: "12px" }
const noSite = { color: "#ef4444", fontSize: "12px", fontWeight: "600" }
const catTag = { fontSize: "10px", color: "#94a3b8", marginTop: "2px" }
const noteInput = { padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", width: "130px", outline: "none" }
const saveBtn = { padding: "4px 8px", borderRadius: "6px", background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px" }
const deleteBtn = { padding: "6px 10px", borderRadius: "6px", background: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5", cursor: "pointer", fontSize: "11px", fontWeight: "700", transition: "all 0.2s" }
const bulkDeleteBtn = { padding: "8px 16px", borderRadius: "8px", background: "#ef4444", color: "#fff", border: "none", fontSize: "13px", fontWeight: "600", transition: "opacity 0.2s" }
const emptyState = { padding: "60px 24px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }

const scoreBadge = (score = 0) => ({
    padding: "3px 8px", borderRadius: "20px", fontWeight: "700", fontSize: "11px",
    background: score >= 70 ? "#f0fdf4" : score >= 40 ? "#fffbeb" : "#f1f5f9",
    color: score >= 70 ? "#16a34a" : score >= 40 ? "#ca8a04" : "#64748b"
})

const statusSelect = (status) => {
    const c = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569" }
    return {
        padding: "5px 8px", borderRadius: "8px", fontWeight: "700", fontSize: "11px",
        background: c.bg, color: c.color, border: `1.5px solid ${c.color}33`,
        cursor: "pointer", outline: "none"
    }
}

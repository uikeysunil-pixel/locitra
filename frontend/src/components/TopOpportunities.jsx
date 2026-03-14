import { useState, useMemo } from "react"
import { useMarketStore } from "../store/marketStore"
import ContactModal from "./ContactModal"
import { saveLead } from "../services/api"

/* ── Shared badge helper ─────────────────────────────── */
const OpBadge = ({ score = 0 }) => {
    if (score >= 70) return <span className="badge badge-high">High</span>
    if (score >= 40) return <span className="badge badge-medium">Medium</span>
    return <span className="badge badge-low">Low</span>
}

function OutreachModal({ lead, onClose }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [copied, setCopied] = useState(false);

    const generate = async () => {
        setLoading(true);
        setCopied(false);
        try {
            const trustSignals = [];
            if ((lead.reviews || 0) < 30) trustSignals.push("Low reviews");
            if (lead.rating > 0 && lead.rating < 4.0) trustSignals.push("Low rating");
            if (!lead.website) trustSignals.push("No website");

            const res = await fetch("http://localhost:5000/api/outreach/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName: lead.name,
                    industry: lead.category,
                    rating: lead.rating,
                    reviews: lead.reviews || lead.totalReviews || 0,
                    website: lead.website || "",
                    weakSignals: trustSignals
                })
            });
            const data = await res.json();
            if (data.success && data.outreach) {
                setEmail(`${data.outreach.subject}\n\n${data.outreach.emailBody}`);
            } else {
                setEmail("Failed to generate outreach.");
            }
        } catch (e) {
            setEmail("An error occurred during generation.");
        }
        setLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={modalBackdrop} onClick={onClose}>
            <div style={modalCard} onClick={e => e.stopPropagation()}>
                <div style={modalHeader}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>AI Outreach Generator</h3>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>

                <div style={{ marginBottom: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontWeight: "600", color: "#0f172a" }}>{lead.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Opportunity Score: {lead.opportunityScore || 0}/100</div>
                </div>

                <textarea
                    readOnly
                    value={email}
                    placeholder="Click Generate to write a personalized cold email..."
                    style={modalTextarea}
                />

                <div style={modalActions}>
                    {!email ? (
                        <button style={btnPrimary} onClick={generate} disabled={loading}>
                            {loading ? "Generating..." : "⚡ Generate Cold Email"}
                        </button>
                    ) : (
                        <>
                            <button style={btnSecondary} onClick={generate} disabled={loading}>
                                {loading ? "Regenerating..." : "🔄 Regenerate"}
                            </button>
                            <button style={btnPrimary} onClick={copyToClipboard}>
                                {copied ? "✅ Copied!" : "📋 Copy Email"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Single reusable table ───────────────────────────── */
function BusinessTable({ title, subtitle, rows, icon, emptyMsg, onOutreach, onEmail, onCopy }) {

    const [selectedBusiness, setSelectedBusiness] = useState(null)
    const [crmState, setCrmState] = useState({}) // leadName → 'saving'|'saved'|'dup'

    if (!rows || rows.length === 0) {
        return (
            <div className="card" style={tableCard}>
                <div style={{ padding: "20px 24px" }}>
                    <h3 style={tHeading}>{icon} {title}</h3>
                    <p style={emptySub}>{emptyMsg || "No results yet — run a market scan."}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="card" style={tableCard}>

                <div style={tableHeader}>
                    <div>
                        <h3 style={tHeading}>{icon} {title}</h3>
                        {subtitle && <p style={tSub}>{subtitle}</p>}
                    </div>
                    <span style={countPill}>{rows.length.toLocaleString()} businesses</span>
                </div>

                <div style={tableWrapper}>
                    <table>
                        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                            <tr>
                                <th>#</th>
                                <th>Business</th>
                                <th>Rating</th>
                                <th>Reviews</th>
                                <th>Website</th>
                                <th>Phone</th>
                                <th>Opportunity</th>
                                <th>Lead Value</th>
                                <th>Maps</th>
                                <th>Contact</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((lead, i) => {
                                const leadValue = Math.round((lead.opportunityScore ?? 0) * 5)
                                return (
                                    <tr key={lead.placeId || `${lead.name}-${i}`}>

                                        <td style={{ color: "#94a3b8", fontSize: "12px", width: "36px" }}>
                                            {i + 1}
                                        </td>

                                        <td>
                                            <div style={bizName}>{lead.name || "Unknown"}</div>
                                            {lead.category && (
                                                <div style={bizCat}>{lead.category}</div>
                                            )}
                                            {lead.address && (
                                                <div style={bizAddr}>{lead.address}</div>
                                            )}
                                        </td>

                                        <td>
                                            <span style={ratingStyle}>
                                                ⭐ {lead.rating ?? "–"}
                                            </span>
                                        </td>

                                        <td>{(lead.reviews ?? lead.totalReviews ?? 0).toLocaleString()}</td>

                                        <td>
                                            {lead.website ? (
                                                <a
                                                    href={lead.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={linkStyle}
                                                >
                                                    Visit ↗
                                                </a>
                                            ) : (
                                                <span style={noWebsiteStyle}>No Website</span>
                                            )}
                                        </td>

                                        <td style={{ color: "#475569", fontSize: "13px" }}>
                                            {lead.phone || <span style={{ color: "#cbd5e1" }}>—</span>}
                                        </td>

                                        <td><OpBadge score={lead.opportunityScore ?? 0} /></td>

                                        <td>
                                            <span style={leadValueStyle}>${leadValue}</span>
                                        </td>

                                        <td>
                                            <a
                                                href={
                                                    lead.mapsLink ||
                                                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name || "")}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={mapsLinkStyle}
                                            >
                                                🗺 View
                                            </a>
                                        </td>

                                        {/* Contact Info button */}
                                        <td>
                                            <button
                                                onClick={() => setSelectedBusiness(lead)}
                                                style={contactBtn}
                                                title="View full contact details"
                                            >
                                                📇 Contact
                                            </button>
                                        </td>

                                        <td style={actionColumn}>
                                            {/* Full Outreach Generator */}
                                            <button
                                                className="btn-primary btn-sm"
                                                onClick={() => onOutreach && onOutreach(lead)}
                                                style={{ ...actionBtnShared, background: "#f59e0b", color: "#fff", border: "none" }}
                                            >
                                                🚀 Outreach
                                            </button>

                                            {/* AI Outreach Email */}
                                            <button
                                                className="btn-primary btn-sm"
                                                onClick={() => onEmail && onEmail(lead)}
                                                style={actionBtnShared}
                                            >
                                                ✉ Email
                                            </button>

                                            <button
                                                style={{ ...crmBtnStyle(crmState[lead.name]), ...actionBtnShared }}
                                                disabled={crmState[lead.name] === 'saving' || crmState[lead.name] === 'saved' || crmState[lead.name] === 'dup'}
                                                onClick={async () => {
                                                    setCrmState(p => ({ ...p, [lead.name]: 'saving' }))
                                                    const res = await saveLead(lead)
                                                    if (res.success) {
                                                        const state = res.data?.duplicate ? 'dup' : 'saved'
                                                        setCrmState(p => ({ ...p, [lead.name]: state }))
                                                    } else {
                                                        setCrmState(p => ({ ...p, [lead.name]: null }))
                                                    }
                                                }}
                                            >
                                                {crmState[lead.name] === 'saving' ? '⏳' :
                                                    crmState[lead.name] === 'saved' ? '✅ Saved' :
                                                        crmState[lead.name] === 'dup' ? '📋 In CRM' :
                                                            '💾 Save'}
                                            </button>

                                            <button
                                                style={{ ...copyBtnStyle, ...actionBtnShared }}
                                                onClick={() => onCopy && onCopy(lead)}
                                            >
                                                📋 Copy
                                            </button>
                                        </td>

                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Contact Info Modal */}
            {selectedBusiness && (
                <ContactModal
                    business={selectedBusiness}
                    onClose={() => setSelectedBusiness(null)}
                />
            )}

        </>
    )

}

/* ── Main exported component ─────────────────────────── */
/**
 * Props:
 *   leads            – full business list (from scan / store)
 *   filteredLeads    – already-filtered subset from LeadFilters; used for Table 1
 *   activeFilter     – the current filter key (for the subtitle label)
 */
export default function TopOpportunities({ leads: propLeads, filteredLeads, activeFilter, onOutreach, onEmail, onCopy }) {

    const { businesses } = useMarketStore()

    // Full source — used to derive the no-website table independently
    const source = propLeads?.length > 0 ? propLeads : businesses

    /* Table 1 — respects the active filter sent from LeadFilters */
    const displayRows = useMemo(() => {
        const base = filteredLeads ?? source
        return [...base]
            .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
    }, [filteredLeads, source])



    /* Build a human-readable subtitle for Table 1 */
    const filterLabels = {
        all: "All scanned businesses sorted by opportunity score",
        noWebsite: "Filtered: businesses without a website",
        lowReviews: "Filtered: businesses with fewer than 30 reviews",
        lowRating: "Filtered: businesses with rating below 4.0",
        highOpportunity: "Filtered: high opportunity score (≥ 70)",
    }
    const table1Sub = filterLabels[activeFilter] ?? filterLabels.all

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Table 1 — filtered dataset */}
            <BusinessTable
                icon="🏆"
                title="All Businesses"
                subtitle={table1Sub}
                rows={displayRows}
                emptyMsg="No businesses match the active filter."
                onOutreach={onOutreach}
                onEmail={onEmail}
                onCopy={onCopy}
            />

        </div>
    )

}

/* ── Styles ──────────────────────────────────────────── */

const tableCard = { padding: "0", overflow: "hidden" }
const tableHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 0",
    flexWrap: "wrap",
    gap: "12px"
}
const tHeading = { fontSize: "16px", fontWeight: "700" }
const tSub = { fontSize: "13px", color: "#64748b", marginTop: "3px" }
const emptySub = { fontSize: "14px", color: "#94a3b8", marginTop: "8px", paddingBottom: "4px" }
const countPill = {
    background: "#eef2ff",
    color: "#6366f1",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "700"
}
const tableWrapper = {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "600px",
    marginTop: "16px"
}

const bizName = { fontWeight: "600", fontSize: "14px" }
const bizCat = { fontSize: "11px", color: "#94a3b8", marginTop: "2px" }
const bizAddr = { fontSize: "11px", color: "#94a3b8", marginTop: "1px" }
const ratingStyle = { fontSize: "13px", fontWeight: "600", color: "#f59e0b" }
const linkStyle = { color: "#6366f1", fontWeight: "600", fontSize: "13px" }
const noWebsiteStyle = { color: "#ef4444", fontWeight: "600", fontSize: "12px" }
const mapsLinkStyle = { color: "#475569", fontSize: "13px", fontWeight: "500" }
const leadValueStyle = { fontWeight: "700", color: "#16a34a", fontSize: "14px" }

const emailArea = {
    display: "block",
    width: "220px",
    marginTop: "8px",
    fontSize: "12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    padding: "6px"
}

const contactBtn = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    border: "1.5px solid #e0e7ff",
    background: "#eef2ff",
    color: "#6366f1",
    whiteSpace: "nowrap",
    transition: "background .15s, border-color .15s"
}

const crmBtnStyle = (state) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: state === "saved" || state === "dup" ? "default" : "pointer",
    border: "1.5px solid",
    borderColor: state === "saved" ? "#bbf7d0" : state === "dup" ? "#e0e7ff" : "#e2e8f0",
    background: state === "saved" ? "#f0fdf4" : state === "dup" ? "#eef2ff" : "#f8fafc",
    color: state === "saved" ? "#16a34a" : state === "dup" ? "#6366f1" : "#475569",
    whiteSpace: "nowrap",
    transition: "all .15s"
})

const copyBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    whiteSpace: "nowrap",
    transition: "all .15s"
}

/* Outreach Modal Styles */
const modalBackdrop = {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(15, 23, 42, 0.65)", display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 9999, padding: "20px"
}
const modalCard = {
    background: "#fff", padding: "24px", borderRadius: "16px",
    width: "100%", maxWidth: "500px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
}
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }
const closeBtnStyle = { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }
const modalTextarea = {
    width: "100%", height: "200px", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1",
    fontSize: "13px", color: "#334155", fontFamily: "inherit", resize: "none", marginBottom: "20px"
}
const modalActions = { display: "flex", justifyContent: "flex-end", gap: "12px" }
const btnPrimary = {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
    border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
}
const btnSecondary = {
    background: "#f1f5f9", color: "#475569",
    border: "1px solid #cbd5e1", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
}

/* Action Column Button Adjustments */
const actionColumn = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "flex-start"
}

const actionBtnShared = {
    whiteSpace: "nowrap",
    minWidth: "90px",
    justifyContent: "center"
}


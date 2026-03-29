import React, { useState } from "react";
import { saveLead } from "../services/api";

export default function TopOpportunitiesToday({ leads, onOutreach, onEmail, onCopy }) {
    const [crmState, setCrmState] = useState({}); // leadName → 'saving'|'saved'|'dup'
    const [notification, setNotification] = useState("");

    // 1. Filtering Logic
    const topLeads = leads
        ?.filter(lead => (lead.opportunityScore || 0) >= 80)
        .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
        .slice(0, 10) || [];

    if (topLeads.length === 0) return null;

    const getReason = (lead) => {
        if (!lead.website) return "No Website";
        if ((lead.reviews || 0) < 30) return "Low Reviews";
        if ((lead.rating || 0) > 0 && lead.rating < 4.0) return "Low Rating";
        return "High Potential";
    };

    const getInsight = (reason) => {
        switch (reason) {
            case "Low Reviews":
                return "Competitors with more reviews are ranking higher on Google Maps.";
            case "Low Rating":
                return "Ratings below 4.0 may reduce customer trust and call volume.";
            case "No Website":
                return "Businesses without websites often lose search traffic to competitors.";
            default:
                return "Social media presence can improve local engagement and visibility.";
        }
    };

    return (
        <div className="card" style={cardStyle}>
            {notification && (
                <div style={notificationStyle}>
                    {notification}
                </div>
            )}
            <div style={headerStyle}>
                <h3 style={titleStyle}>🔥 Top Opportunities Today</h3>
                <p style={subStyle}>Best prospects based on opportunity score.</p>
            </div>

            <div className="top-opportunities-container" style={tableWrapper}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Business</th>
                            <th style={thStyle}>Score</th>
                            <th style={thStyle}>Main Reason</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topLeads.map((lead, i) => (
                            <tr key={lead.placeId || i} style={trStyle}>
                                <td style={tdStyle}>
                                    <div style={bizName}>{lead.name}</div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={scoreBadge}>{lead.opportunityScore}</span>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div><span style={reasonBadge}>{getReason(lead)}</span></div>
                                        <div style={insightStyle}>💡 {getInsight(getReason(lead))}</div>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <button
                                        style={{ ...actionBtnStyle, background: "#f59e0b", color: "#fff", border: "none" }}
                                        onClick={() => onOutreach && onOutreach(lead)}
                                    >
                                        🚀 Outreach
                                    </button>
                                    {lead.email && (
                                        <button
                                            style={actionBtnStyle}
                                            onClick={() => window.open(`mailto:${lead.email}`)}
                                        >
                                            ✉ Email
                                        </button>
                                    )}
                                    <button
                                        style={actionBtnStyle}
                                        onClick={() => onCopy && onCopy(lead)}
                                    >
                                        📋 Copy
                                    </button>
                                    <button
                                        style={crmBtnStyle(crmState[lead.name])}
                                        disabled={crmState[lead.name] === 'saving' || crmState[lead.name] === 'saved' || crmState[lead.name] === 'dup'}
                                        onClick={async () => {
                                            setCrmState(p => ({ ...p, [lead.name]: 'saving' }));
                                            const res = await saveLead(lead);
                                            if (res.success) {
                                                const state = res.data?.duplicate ? 'dup' : 'saved';
                                                setCrmState(p => ({ ...p, [lead.name]: state }));
                                                if (state === 'saved') {
                                                    setNotification("✓ Lead saved to CRM");
                                                    setTimeout(() => setNotification(""), 2000);
                                                }
                                            } else {
                                                setCrmState(p => ({ ...p, [lead.name]: null }));
                                            }
                                        }}
                                    >
                                        {crmState[lead.name] === 'saving' ? '⏳' :
                                            crmState[lead.name] === 'saved' ? '✅ Saved' :
                                                crmState[lead.name] === 'dup' ? '📋 In CRM' :
                                                    '💾 Save'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ── Styles ── */
const cardStyle = { padding: "0", overflow: "hidden" };
const headerStyle = { padding: "20px 24px 0", marginBottom: "16px" };
const titleStyle = { fontSize: "16px", fontWeight: "700", margin: 0 };
const subStyle = { fontSize: "13px", color: "#64748b", marginTop: "4px" };
const tableWrapper = { width: "100%", overflowX: "auto", overflowY: "auto", maxHeight: "420px" };
const tableStyle = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const thStyle = { padding: "12px 24px", fontSize: "12px", color: "#94a3b8", fontWeight: "600", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 10 };
const trStyle = { borderBottom: "1px solid #f1f5f9" };
const tdStyle = { padding: "12px 24px", verticalAlign: "middle" };
const bizName = { fontWeight: "600", fontSize: "14px", color: "#0f172a" };
const scoreBadge = { background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" };
const reasonBadge = { background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", display: "inline-block" };
const insightStyle = { fontSize: "13px", color: "#6B7280", marginTop: "4px" };

const actionBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    whiteSpace: "nowrap",
    marginRight: "8px",
    transition: "all .15s"
};

const crmBtnStyle = (state) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
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
});

const notificationStyle = {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "#10b981",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    zIndex: 9999,
    animation: "fadeIn 0.2s ease-out"
};

/**
 * ContactModal.jsx
 *
 * A centered overlay modal that displays all enriched contact data
 * for a selected business. Closes on X button click, Escape key, or
 * clicking the backdrop overlay.
 *
 * Props:
 *   business  – the business object from the global store
 *   onClose   – function called when the modal should close
 */

import { useEffect, useState } from "react"
import { enrichSingleLead } from "../services/api"

/* ── Helper: Opportunity Scorecard ───────────────────────
   Derives sales-ready signals from existing business data.
   No API calls — instant, deterministic output.
────────────────────────────────────────────────────────── */
function OppScorecard({ business }) {
    const trustSignals = []
    const visibilityIssues = []
    const growthOpportunities = []

    if (!business.website) {
        visibilityIssues.push({ icon: "🌐", text: "No website detected" })
        growthOpportunities.push("Website development & hosting")
    }
    if ((business.reviews || 0) < 30) {
        trustSignals.push({ icon: "💬", text: `Only ${business.reviews || 0} reviews — low trust` })
        growthOpportunities.push("Review generation campaign")
    }
    if ((business.rating || 0) > 0 && business.rating < 4.0) {
        trustSignals.push({ icon: "⭐", text: `Rating ${business.rating}/5 — below trust threshold` })
        growthOpportunities.push("Reputation management")
    }
    if (!business.facebook && !business.instagram) {
        visibilityIssues.push({ icon: "📱", text: "No social media presence found" })
        growthOpportunities.push("Social media management")
    }
    if (!business.email && !business.contactPage) {
        visibilityIssues.push({ icon: "📭", text: "No contact info available online" })
        growthOpportunities.push("Local SEO & data syndication")
    }

    const score = business.opportunityScore ?? 0
    const urgency = (trustSignals.length + visibilityIssues.length) >= 4 ? "High" : (trustSignals.length + visibilityIssues.length) >= 2 ? "Medium" : "Low"
    const urgColors = {
        High: { bg: "#fef2f2", text: "#b91c1c" },
        Medium: { bg: "#fffbeb", text: "#92400e" },
        Low: { bg: "#f0fdf4", text: "#166534" }
    }
    const uc = urgColors[urgency]

    if (trustSignals.length === 0 && visibilityIssues.length === 0) return null

    const revenueEstimate = score >= 70 ? "$3,000+" : score >= 40 ? "$1,000 - $2,000" : "$500"

    return (
        <div style={scorecardWrap}>
            <div style={scorecardHeader}>
                <span style={scorecardTitle}>📊 Advanced AI Audit</span>
                <span style={{ ...urgBadge, background: uc.bg, color: uc.text }}>
                    {urgency} Priority Match
                </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={meterLabel}>Opportunity Score: {score}/100</span>
                <span style={meterLabel}>Est. Rev: {revenueEstimate}/mo</span>
            </div>
            <div style={meterWrap}>
                <div style={{ ...meterFill, width: `${score}%` }} />
            </div>

            {trustSignals.length > 0 && (
                <>
                    <p style={scorecardSub}>Trust Signals</p>
                    <ul style={signalList}>
                        {trustSignals.map((s, i) => (
                            <li key={i} style={signalItem}><span>{s.icon}</span><span>{s.text}</span></li>
                        ))}
                    </ul>
                </>
            )}

            {visibilityIssues.length > 0 && (
                <>
                    <p style={{ ...scorecardSub, marginTop: "12px" }}>Visibility Issues</p>
                    <ul style={signalList}>
                        {visibilityIssues.map((s, i) => (
                            <li key={i} style={signalItem}><span>{s.icon}</span><span>{s.text}</span></li>
                        ))}
                    </ul>
                </>
            )}

            {growthOpportunities.length > 0 && (
                <>
                    <p style={{ ...scorecardSub, marginTop: "12px" }}>Growth Opportunities (Pitch)</p>
                    <ul style={signalList}>
                        {growthOpportunities.map((p, i) => (
                            <li key={i} style={{ ...signalItem, color: "#6366f1", fontWeight: "600" }}>
                                <span style={{ fontSize: "13px" }}>✅</span>
                                <span>{p}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}

/* ── Helper: render a contact row ────────────────────────
   Shows label + value/link. Returns null if value is empty.
────────────────────────────────────────────────────────── */
function ContactRow({ icon, label, value, href, tag }) {
    if (!value) return (
        <div style={row}>
            <span style={rowIcon}>{icon}</span>
            <div>
                <div style={rowLabel}>{label}</div>
                <span style={emptyVal}>{tag || "Not found"}</span>
            </div>
        </div>
    )

    return (
        <div style={row}>
            <span style={rowIcon}>{icon}</span>
            <div style={{ minWidth: 0 }}>
                <div style={rowLabel}>{label}</div>
                {href ? (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={rowLink}
                    >
                        {value}
                    </a>
                ) : (
                    <span style={rowValue}>{value}</span>
                )}
            </div>
        </div>
    )
}

/* ── ContactModal ─────────────────────────────────────── */
export default function ContactModal({ business: initialBusiness, onClose }) {

    const [business, setBusiness] = useState(initialBusiness)
    const [enriching, setEnriching] = useState(false)

    /* Close on Escape key */
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [onClose])

    /* Lock body scroll while open */
    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = "" }
    }, [])

    if (!business) return null

    /* Opportunity badge colour */
    const score = business.opportunityScore ?? 0
    const badgeColor = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#6366f1"
    const badgeBg = score >= 70 ? "#f0fdf4" : score >= 40 ? "#fffbeb" : "#eef2ff"
    const badgeLabel = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low"

    /* Count how many contact fields are populated */
    const populated = [
        business.email, business.phone, business.website,
        business.facebook, business.instagram, business.linkedin,
        business.contactPage
    ].filter(Boolean).length

    return (

        /* ── Backdrop ──────────────────────────────────── */
        <div style={backdrop} onClick={onClose} role="dialog" aria-modal="true">

            {/* ── Modal card ───────────────────────────── */}
            <div
                style={card}
                onClick={e => e.stopPropagation()}   /* prevent backdrop close */
            >

                {/* ── Header ─────────────────────────── */}
                <div style={header}>

                    <div style={headerLeft}>
                        <div style={avatarCircle}>
                            {(business.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 style={bizTitle}>{business.name}</h2>
                            {business.category && (
                                <p style={bizMeta}>{business.category}</p>
                            )}
                            {business.address && (
                                <p style={bizMeta}>📍 {business.address}</p>
                            )}
                        </div>
                    </div>

                    <div style={headerRight}>
                        {/* Opportunity badge */}
                        <span style={{
                            ...scoreBadge,
                            background: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${badgeColor}33`
                        }}>
                            Score {score} · {badgeLabel}
                        </span>

                        {/* Close button */}
                        <button style={closeBtn} onClick={onClose} aria-label="Close">
                            ✕
                        </button>
                    </div>

                </div>

                {/* ── Stats bar ──────────────────────── */}
                <div style={statsBar}>
                    <div style={statItem}>
                        <span style={statVal}>⭐ {business.rating || "–"}</span>
                        <span style={statLbl}>Rating</span>
                    </div>
                    <div style={statDivider} />
                    <div style={statItem}>
                        <span style={statVal}>{(business.reviews || 0).toLocaleString()}</span>
                        <span style={statLbl}>Reviews</span>
                    </div>
                    <div style={statDivider} />
                    <div style={statItem}>
                        <span style={statVal}>${Math.round(score * 5)}</span>
                        <span style={statLbl}>Lead Value</span>
                    </div>
                    <div style={statDivider} />
                    <div style={statItem}>
                        <span style={statVal}>{populated}/7</span>
                        <span style={statLbl}>Contacts Found</span>
                    </div>
                </div>

                {/* ── Scorecard ───────────────────────── */}
                <OppScorecard business={business} />

                {/* ── Contact rows ────────────────────── */}
                <div style={body}>

                    {/* Section: Direct Contact */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <p style={{ ...sectionTitle, margin: 0 }}>📇 Direct Contact</p>
                        {populated < 4 && (
                            <button
                                style={enrichBtn}
                                disabled={enriching}
                                onClick={async () => {
                                    setEnriching(true);
                                    const id = business._id || business.placeId || business.name;
                                    const res = await enrichSingleLead(id);
                                    if (res.success) {
                                        setBusiness({ ...business, ...res.lead });
                                    }
                                    setEnriching(false);
                                }}
                            >
                                {enriching ? "⏳ Searching..." : "🔍 Find Contact Info"}
                            </button>
                        )}
                    </div>

                    <ContactRow
                        icon="📧"
                        label="Email"
                        value={business.email}
                        href={business.email ? `mailto:${business.email}` : null}
                    />
                    <ContactRow
                        icon="📞"
                        label="Phone"
                        value={business.phone}
                        href={business.phone ? `tel:${business.phone}` : null}
                    />
                    <ContactRow
                        icon="🌐"
                        label="Website"
                        value={business.website ? "Visit Website ↗" : null}
                        href={business.website}
                    />
                    <ContactRow
                        icon="📋"
                        label="Contact Page"
                        value={business.contactPage ? "View Contact Page ↗" : null}
                        href={business.contactPage}
                    />

                    {/* Section: Social Profiles */}
                    <p style={{ ...sectionTitle, marginTop: "20px" }}>📱 Social Profiles</p>

                    <ContactRow
                        icon="📘"
                        label="Facebook"
                        value={business.facebook ? "View Facebook Page ↗" : null}
                        href={business.facebook}
                    />
                    <ContactRow
                        icon="📸"
                        label="Instagram"
                        value={business.instagram ? "View Instagram ↗" : null}
                        href={business.instagram}
                    />
                    <ContactRow
                        icon="💼"
                        label="LinkedIn"
                        value={business.linkedin ? "View LinkedIn Page ↗" : null}
                        href={business.linkedin}
                    />

                </div>

                {/* ── Footer actions ──────────────────── */}
                <div style={footer}>

                    <a
                        href={
                            business.mapsLink ||
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name || "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={footerLink}
                    >
                        🗺 View on Maps
                    </a>

                    {business.website && (
                        <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={footerLink}
                        >
                            🌐 Open Website
                        </a>
                    )}

                    <button style={footerClose} onClick={onClose}>
                        Close
                    </button>

                </div>

            </div>

        </div>

    )

}

/* ── Styles ──────────────────────────────────────────────── */

const backdrop = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
}

const card = {
    background: "#fff",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "540px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,.04)",
    display: "flex",
    flexDirection: "column"
}

const header = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 24px 0",
    gap: "12px"
}

const headerLeft = {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    minWidth: 0
}

const headerRight = {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexShrink: 0
}

const avatarCircle = {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontWeight: "800",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
}

const bizTitle = {
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    lineHeight: "1.2"
}

const bizMeta = {
    fontSize: "12px",
    color: "#64748b",
    margin: "3px 0 0"
}

const scoreBadge = {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap"
}

const closeBtn = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#94a3b8",
    padding: "4px 8px",
    borderRadius: "8px",
    lineHeight: 1,
    transition: "color .15s, background .15s"
}

/* Stats bar */
const statsBar = {
    display: "flex",
    alignItems: "center",
    padding: "16px 24px",
    margin: "16px 24px 0",
    background: "#f8fafc",
    borderRadius: "12px",
    gap: "0"
}

const statItem = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1
}

const statVal = { fontSize: "16px", fontWeight: "800", color: "#0f172a" }
const statLbl = { fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }
const statDivider = { width: "1px", height: "32px", background: "#e2e8f0", margin: "0 4px" }

/* Body */
const body = { padding: "20px 24px" }

const sectionTitle = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "10px",
    marginTop: 0
}

/* Contact rows */
const row = {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9"
}

const rowIcon = {
    fontSize: "18px",
    width: "26px",
    flexShrink: 0,
    marginTop: "1px"
}

const rowLabel = {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: "2px"
}

const rowValue = { fontSize: "14px", color: "#0f172a", fontWeight: "500", wordBreak: "break-all" }
const rowLink = { fontSize: "14px", color: "#6366f1", fontWeight: "600", textDecoration: "none" }
const emptyVal = { fontSize: "13px", color: "#cbd5e1", fontStyle: "italic" }

/* Footer */
const footer = {
    display: "flex",
    gap: "10px",
    padding: "16px 24px",
    borderTop: "1px solid #f1f5f9",
    flexWrap: "wrap",
    alignItems: "center"
}

const footerLink = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "8px 14px",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#374151",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none"
}

const footerClose = {
    marginLeft: "auto",
    padding: "8px 18px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "13px",
    border: "none",
    cursor: "pointer"
}

/* ── Scorecard styles ───────────────────────────────────── */
const scorecardWrap = {
    margin: "12px 24px 0",
    background: "linear-gradient(135deg, #fafafa 0%, #f0f4ff 100%)",
    border: "1.5px solid #e0e7ff",
    borderRadius: "14px",
    padding: "16px 18px"
}
const scorecardHeader = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px"
}
const scorecardTitle = { fontSize: "13px", fontWeight: "700", color: "#0f172a" }
const urgBadge = {
    fontSize: "10px", fontWeight: "700", padding: "3px 9px",
    borderRadius: "20px"
}
const meterWrap = {
    height: "8px", background: "#e2e8f0", borderRadius: "99px",
    position: "relative", marginBottom: "4px", overflow: "hidden"
}
const meterFill = {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    borderRadius: "99px",
    transition: "width .5s ease"
}
const meterLabel = { fontSize: "11px", color: "#6366f1", fontWeight: "700", display: "inline-block", marginBottom: "12px" }
const scorecardSub = { fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }
const signalList = { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "5px" }
const signalItem = { display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "#374151" }

const enrichBtn = {
    background: "#eff6ff",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "10px",
    fontWeight: "600",
    cursor: "pointer"
}

import { useMemo, useState, useCallback, useEffect } from "react"
import { Link } from "react-router-dom"
import { useMarketStore } from "../store/marketStore"
import useLeadStore from "../store/leadStore"
import { fetchAnalytics } from "../services/api"
import useAuthStore from "../store/authStore"

import CityScanner from "../components/CityScanner"
import FirstScanOnboarding from "../components/FirstScanOnboarding"
import OpportunityDistribution from "../components/OpportunityDistribution"
import CompetitionChart from "../components/CompetitionChart"
import TopOpportunities from "../components/TopOpportunities"
import TopOpportunitiesToday from "../components/TopOpportunitiesToday"
import MarketIntelligence from "../components/MarketIntelligence"
import ExportCSV from "../components/ExportCSV"
import LeadFilters from "../components/LeadFilters"
import Outreach from "./Outreach"
import LostRevenueDetector from "../components/dashboard/LostRevenueDetector"
import HeatmapPreview from "../components/dashboard/HeatmapPreview"

/* ── Lifted Outreach Modal Styles ───────────────────────── */
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

/* ── Lifted Outreach Modal ──────────────────────────────── */
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

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/outreach/generate`, {
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
                    placeholder="Use quick email to contact this business instantly..."
                    style={modalTextarea}
                />

                <div style={{ display: "flex", justifyContent: "center" }}>
                    {lead.email && (
                        <button style={btnPrimary} onClick={() => window.open(`mailto:${lead.email}`)}>
                            📧 Open Email
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function RecentOpportunitiesWidget() {
    const [unread, setUnread] = useState(0)
    const token = useAuthStore(s => s.token)

    useEffect(() => {
        if (!token) return
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/alerts`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setUnread(data.unreadCount || 0))
            .catch(() => {})
    }, [token])

    if (unread === 0) return null

    return (
        <div className="card" style={recentOppCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={recentOppIcon}>🔔</div>
                <div>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                        {unread} new SEO opportunities detected today.
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b" }}>
                        Weak competitors identified in your recent scans.
                    </p>
                </div>
            </div>
            <Link to="/app/alerts" className="btn-primary" style={{ textDecoration: "none", fontSize: "13px", padding: "8px 16px" }}>
                View Alerts
            </Link>
        </div>
    )
}

const recentOppCard = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    background: "linear-gradient(90deg, #f8fafc 0%, #eff6ff 100%)",
    borderLeft: "4px solid #6366f1"
}

const recentOppIcon = {
    fontSize: "24px",
    background: "#fff",
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
}

export default function Dashboard() {

    const { businesses, setBusinesses } = useMarketStore()
    const setSelectedLead = useLeadStore((state) => state.setSelectedLead)

    /* ── Shared Email / Copy / Outreach Handlers ──────────────────── */
    const [outreachLead, setOutreachLead] = useState(null)
    const [fullOutreachLead, setFullOutreachLead] = useState(null)

    const handleOutreach = (lead) => {
        setSelectedLead(lead)       // ← writes to global store
        setFullOutreachLead(lead)   // ← keeps modal open/close logic
    }

    const handleEmail = (lead) => {
        if (lead.email) {
            window.open(`mailto:${lead.email}`)
        }
    }

    const copyLead = (lead) => {
        const text = `Business: ${lead.name}
Address: ${lead.address || "Not available"}
Phone: ${lead.phone || "Not available"}
Website: ${lead.website || "Not available"}
Rating: ${lead.rating || "N/A"}
Reviews: ${lead.reviews || 0}
Opportunity: ${lead.opportunityScore || 0}`;

        navigator.clipboard.writeText(text);
        alert("Lead copied to clipboard!");
    };

    /* ── Close Modals on ESC ───────────────────────────── */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setFullOutreachLead(null)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    /* ── Filter state ────────────────────────────────────
       filteredLeads  – the currently visible subset
       activeFilter   – key string for the active button
    ───────────────────────────────────────────────────── */
    const [filteredLeads, setFilteredLeads] = useState(null)
    const [activeFilter, setActiveFilter] = useState("all")

    const handleFilter = useCallback((filtered, key) => {
        setFilteredLeads(filtered)
        setActiveFilter(key)
    }, [])

    const [showFirstScanBanner, setShowFirstScanBanner] = useState(false)

    const handleScanComplete = useCallback((results) => {
        setBusinesses(results)
        setFilteredLeads(null)
        setActiveFilter("all")

        if (!localStorage.getItem("locitra_first_scan_complete")) {
            localStorage.setItem("locitra_first_scan_complete", "true")
            setShowFirstScanBanner(true)
        }
    }, [setBusinesses])

    /* ── CRM analytics (from backend) ────────────────────── */
    const [crm, setCrm] = useState(null)
    useEffect(() => {
        fetchAnalytics().then(res => {
            if (res.success) setCrm(res.data)
        }).catch(() => { })
    }, [])

    /* ── Derived metrics ─────────────────────────────── */
    const stats = useMemo(() => {

        const total = businesses.length
        const prospects = businesses.filter(b => (b.opportunityScore ?? 0) >= 60).length
        const highLeads = businesses.filter(b => (b.opportunityScore ?? 0) >= 80).length

        const avgReviews = total
            ? businesses.reduce((s, b) => s + (Number(b.reviews) || 0), 0) / total
            : 0
        const avgRating = total
            ? businesses.reduce((s, b) => s + (Number(b.rating) || 0), 0) / total
            : 0
        const difficulty = Math.min(100, Math.round((avgReviews / 50) + (avgRating * 10)))

        let diffLabel = "–"
        if (total) {
            if (difficulty <= 30) diffLabel = "Easy"
            else if (difficulty <= 60) diffLabel = "Medium"
            else diffLabel = "Hard"
        }

        const revenue = businesses.filter(b => (b.opportunityScore ?? 0) >= 70).length * 300

        return { total, prospects, highLeads, difficulty, diffLabel, revenue }

    }, [businesses])

    /* ── First Scan logic ── */
    const showOnboarding = businesses.length === 0 && !localStorage.getItem("locitra_first_scan_complete")

    /* ── Hero tiles ──────────────────────────────────── */
    const TILES = [
        {
            label: "Businesses Scanned",
            value: stats.total,
            icon: "🏢",
            color: "#6366f1",
            bg: "#eef2ff",
            format: n => n.toLocaleString()
        },
        {
            label: "Prospects Identified",
            value: stats.prospects,
            icon: "🎯",
            color: "#0ea5e9",
            bg: "#e0f2fe",
            format: n => n.toLocaleString()
        },
        {
            label: "High Opportunity Leads",
            value: stats.highLeads,
            icon: "🚀",
            color: "#22c55e",
            bg: "#dcfce7",
            format: n => n.toLocaleString()
        },
        {
            label: "Market Difficulty",
            value: stats.diffLabel,
            icon: "📊",
            color: "#f59e0b",
            bg: "#fef3c7",
            format: v => v
        },
        {
            label: "Revenue Opportunity",
            value: stats.revenue,
            icon: "💰",
            color: "#16a34a",
            bg: "#f0fdf4",
            format: n => `$${n.toLocaleString()}`
        },
    ]

    /* ── Render ──────────────────────────────────────── */
    return (

        <div style={page}>

            {/* ── Hero ─────────────────────────────────── */}
            <div style={heroSection}>
                <div>
                    <h1 style={heroTitle}>Welcome to Locitra</h1>
                    <p style={heroSub}>
                        Discover local market opportunities and generate high-value leads automatically.
                    </p>
                </div>
                {businesses.length > 0 && (
                    <ExportCSV businesses={filteredLeads ?? businesses} />
                )}
            </div>

            {/* ── Intelligence Tiles ───────────────────── */}
            <div style={tilesGrid}>
                {TILES.map(({ label, value, icon, color, bg, format }) => (
                    <div key={label} className="card" style={{ ...tile, borderTop: `3px solid ${color}` }}>
                        <div style={tileIconWrap}>
                            <span style={{ ...tileIcon, background: bg, color }}>{icon}</span>
                        </div>
                        <p style={tileVal}>{format(value)}</p>
                        <p style={tileLbl}>{label}</p>
                    </div>
                ))}
            </div>

            {/* ── Dashboard Insights Row (Revenue & Heatmap) ───────── */}
            {businesses.length > 0 && (
                <div style={{ ...section, ...twoCol, marginTop: "20px" }}>
                    <LostRevenueDetector businesses={businesses} />
                    <HeatmapPreview businesses={businesses} />
                </div>
            )}

            {/* ── CRM Pipeline Metrics ─────────────────── */}
            {crm && (
                <div style={crmRow}>
                    {[
                        { icon: "📂", label: "Total CRM Leads", value: crm.totalLeads, color: "#6366f1" },
                        { icon: "🔥", label: "High Opportunity", value: crm.highOpp, color: "#ef4444" },
                        { icon: "🌐", label: "No Website Leads", value: crm.noWebsite, color: "#f59e0b" },
                        { icon: "✉", label: "Leads Contacted", value: crm.contacted, color: "#0ea5e9" }
                    ].map(({ icon, label, value, color }) => (
                        <div key={label} style={{ ...crmCard, borderLeft: `3px solid ${color}` }}>
                            <span style={{ fontSize: "20px" }}>{icon}</span>
                            <div>
                                <div style={{ fontSize: "22px", fontWeight: "900", color }}>{value ?? "—"}</div>
                                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── First Scan Onboarding ────────────────── */}
            {showOnboarding && (
                <section style={{ ...section, marginTop: "16px" }}>
                    <FirstScanOnboarding onScanComplete={handleScanComplete} />
                </section>
            )}

            {/* FIRST SCAN SUCCESS MESSAGE */}
            {showFirstScanBanner && (
                <div style={firstScanSuccessBanner}>
                    🔥 {stats.highLeads || 0} high-opportunity leads found.
                    <span style={{ fontWeight: "500" }}>Estimated revenue opportunity:</span> ${stats.revenue ? stats.revenue.toLocaleString() : "9,600"}
                </div>
            )}

            {/* Recent Opportunities Widget */}
            <div style={section}>
                <RecentOpportunitiesWidget />
            </div>

            {/* ── City Business Scanner ────────────────── */}
            <section style={section}>
                <CityScanner onScanComplete={handleScanComplete} />
            </section>

            {/* ── Post-scan sections (hidden until data exists) ── */}
            {businesses.length > 0 && (
                <>
                    {/* AI Intelligence Engine */}
                    <section style={section}>
                        <MarketIntelligence businesses={businesses} />
                    </section>

                    {/* Opportunity Distribution + Competition Charts */}
                    <section style={{ ...section, ...twoCol }}>
                        <OpportunityDistribution businesses={businesses} />
                        <CompetitionChart businesses={businesses} />
                    </section>

                    {/* ── Top Opportunities Today ───────────────── */}
                    <section style={section}>
                        <TopOpportunitiesToday
                            leads={businesses}
                            onOutreach={handleOutreach}
                            onEmail={handleEmail}
                            onCopy={copyLead}
                        />
                    </section>

                    {/* ── Lead Filters ──────────────────────────── */}
                    <section style={section}>
                        <LeadFilters
                            businesses={businesses}
                            onFilter={handleFilter}
                        />
                    </section>

                    {/* ── All Businesses table (filtered) + No-Website table ── */}
                    <section style={section}>
                        <TopOpportunities
                            leads={businesses}
                            filteredLeads={filteredLeads}
                            activeFilter={activeFilter}
                            onOutreach={handleOutreach}
                            onEmail={handleEmail}
                            onCopy={copyLead}
                        />
                    </section>

                    {/* ── Export CSV ─────────────────────────── */}
                    <section style={{ ...section, ...exportRow }}>
                        <ExportCSV businesses={filteredLeads ?? businesses} />
                    </section>
                </>
            )}

            {/* ── Empty state ───────────────────────────── */}
            {businesses.length === 0 && !showOnboarding && (
                <div className="card" style={emptyState}>
                    <p style={emptyIcon}>🔍</p>
                    <h3 style={emptyTitle}>Start your first market scan</h3>
                    <p style={emptySub2}>
                        Enter a keyword and city above, then click <strong>Scan Market</strong> to discover
                        local businesses and generate leads automatically.
                    </p>
                </div>
            )}

            {/* AI Outreach Modal (Shared for all tables) */}
            {outreachLead && (
                <OutreachModal
                    lead={outreachLead}
                    onClose={() => setOutreachLead(null)}
                />
            )}

            {/* Full Outreach Generator Modal */}
            {fullOutreachLead && (
                <div style={fullModalBackdrop} onClick={() => setFullOutreachLead(null)}>
                    <div style={fullModalCard} onClick={e => e.stopPropagation()}>
                        <div style={fullModalHeader}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>AI Outreach Generator</h3>
                            <button onClick={() => setFullOutreachLead(null)} style={closeBtnStyle}>✕</button>
                        </div>
                        <div style={fullModalContent}>
                            <Outreach initialLead={fullOutreachLead} />
                        </div>
                    </div>
                </div>
            )}

        </div>

    )

}

/* ── Styles ──────────────────────────────────────────── */

const page = { display: "flex", flexDirection: "column", gap: "0" }
const section = { marginTop: "28px" }

const firstScanSuccessBanner = {
    background: "linear-gradient(135deg, #fff7ed, #fff7ed)",
    border: "1px solid #fdba74",
    color: "#9a3412",
    padding: "16px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "15px",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(253, 186, 116, 0.2)"
}

const heroSection = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "4px"
}

const heroTitle = {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "6px",
    letterSpacing: "-0.4px"
}

const heroSub = {
    fontSize: "15px",
    color: "#64748b",
    maxWidth: "540px",
    lineHeight: "1.5"
}

const tilesGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "16px",
    marginTop: "28px"
}

const tile = {
    padding: "20px 18px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
}

const tileIconWrap = { marginBottom: "4px" }

const tileIcon = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    fontSize: "18px"
}

const tileVal = {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: "1.1"
}

const tileLbl = {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600"
}

const twoCol = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
}

const exportRow = {
    display: "flex",
    justifyContent: "flex-end"
}

const emptyState = {
    padding: "60px 40px",
    textAlign: "center",
    marginTop: "28px"
}

const emptyIcon = { fontSize: "48px", marginBottom: "12px" }
const emptyTitle = { fontSize: "20px", fontWeight: "700", marginBottom: "10px", color: "#0f172a" }
const emptySub2 = { fontSize: "15px", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" }

const crmRow = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "-4px",
    marginBottom: "8px"
}

const crmCard = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#fff",
    borderRadius: "12px",
    padding: "14px 18px",
    border: "1px solid #e2e8f0",
    flex: "1 1 130px",
    minWidth: "130px"
}

/* ── Full Modal Styles ───────────────────────────────── */
const fullModalBackdrop = {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(15, 23, 42, 0.65)", display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 10000, padding: "20px"
}
const fullModalCard = {
    background: "#fff", borderRadius: "16px",
    width: "100%", maxWidth: "900px", maxHeight: "90vh",
    display: "flex", flexDirection: "column",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden"
}
const fullModalHeader = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc"
}
const fullModalContent = {
    flex: 1, overflowY: "auto", padding: "0" // Padding handled by Outreach component itself
}

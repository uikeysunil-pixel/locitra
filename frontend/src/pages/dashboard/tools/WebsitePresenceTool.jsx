import React, { useState, useEffect } from "react"
import axios from "axios"
import { 
    Globe, 
    Link as LinkIcon, 
    Search, 
    Loader2, 
    Mail, 
    Facebook, 
    Instagram, 
    Linkedin, 
    Twitter, 
    CheckCircle2, 
    XCircle,
    ArrowRight,
    MapPin,
    AlertCircle
} from "lucide-react"

import ToolLayout from "../../../components/dashboard/ToolLayout"
import ToolHeader from "../../../components/dashboard/ToolHeader"
import PreviewCard from "../../../components/dashboard/PreviewCard"
import LockedReportGate from "../../tools/components/LockedReportGate"
import { fetchMyLeads } from "../../../services/api"
import useAuthStore from "../../../store/authStore"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const WebsitePresenceTool = () => {
    const { token } = useAuthStore()
    const [leads, setLeads] = useState([])
    const [selectedLead, setSelectedLead] = useState("")
    const [businessName, setBusinessName] = useState("")
    const [city, setCity] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState("")

    // Load saved leads on mount
    useEffect(() => {
        const loadLeads = async () => {
            const res = await fetchMyLeads()
            if (res.success) {
                setLeads(res.data.leads || [])
            }
        }
        loadLeads()
    }, [])

    const handleLeadChange = (e) => {
        const leadId = e.target.value
        setSelectedLead(leadId)
        
        const lead = leads.find(l => l._id === leadId)
        if (lead) {
            setBusinessName(lead.name || "")
            setCity(lead.city || "")
            // Trigger auto-analysis if lead is selected
            handleAnalyze(null, lead.name, lead.city)
        }
    }

    const handleAnalyze = async (e, bName, bCity) => {
        if (e) e.preventDefault()
        
        const name = bName || businessName
        const location = bCity || city

        if (!name || !location) {
            setError("Please select a lead or enter business name and city.")
            return
        }

        setLoading(true)
        setError("")
        setResults(null)

        try {
            const response = await axios.post(`${API_BASE}/tools/website-presence`, { 
                name, 
                city: location 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            setResults(response.data.data)
        } catch (err) {
            console.error("Presence check error:", err)
            setError(err.response?.data?.message || "Failed to analyze presence. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <ToolLayout>
            <ToolHeader 
                title="Website Presence Checker" 
                description="Analyze a business's online footprint across websites and social platforms."
            />

            {/* Selector Section */}
            <div style={selectorCard}>
                <div style={inputGroup}>
                    <label style={labelStyle}>Select a saved lead</label>
                    <div style={selectWrapper}>
                        <Globe size={16} style={inputIcon} />
                        <select 
                            value={selectedLead}
                            onChange={handleLeadChange}
                            style={selectStyle}
                        >
                            <option value="">— Pick a business —</option>
                            {leads.map(l => (
                                <option key={l._id} value={l._id}>
                                    {l.name} · {l.city}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={divider}>OR</div>

                <div style={manualInputs}>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Business Name</label>
                        <div style={selectWrapper}>
                            <Search size={16} style={inputIcon} />
                            <input 
                                type="text"
                                placeholder="Enter name"
                                value={businessName}
                                onChange={(e) => {
                                    setBusinessName(e.target.value)
                                    setSelectedLead("") // Clear lead selection if manual input
                                }}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    <div style={inputGroup}>
                        <label style={labelStyle}>City</label>
                        <div style={selectWrapper}>
                            <MapPin size={16} style={inputIcon} />
                            <input 
                                type="text"
                                placeholder="Enter city"
                                value={city}
                                onChange={(e) => {
                                    setCity(e.target.value)
                                    setSelectedLead("") // Clear lead selection if manual input
                                }}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={(e) => handleAnalyze(e)}
                        disabled={loading}
                        style={analyzeBtn}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Analyze"}
                    </button>
                </div>
            </div>

            {error && (
                <div style={errorBox}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {results && (
                <div style={resultsGrid}>
                    <div style={resultsHeader}>
                        <div>
                            <h2 style={bizTitle}>{results.name}</h2>
                            <p style={bizMeta}><MapPin size={14} /> {results.address || city}</p>
                        </div>
                        <div style={statusBadge(results.website)}>
                            {results.website ? "Website Found" : "No Website"}
                        </div>
                    </div>

                    <div style={metricsRow}>
                        <PreviewCard 
                            title="Website Presence" 
                            subtitle="Primary Domain Status"
                            icon={<Globe size={20} />}
                            badge={results.website ? "Live" : "Missing"}
                        >
                            <div style={cardContent}>
                                {results.website ? (
                                    <a href={results.website} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                                        {results.website} <ArrowRight size={14} />
                                    </a>
                                ) : (
                                    <p style={emptyText}>No website discovered for this business.</p>
                                )}
                            </div>
                        </PreviewCard>

                        <PreviewCard 
                            title="Social Footprint" 
                            subtitle="Platform Discovery"
                            icon={<Linkedin size={20} />}
                        >
                            <div style={socialGrid}>
                                <SocialItem icon={<Facebook size={16} />} active={!!results.facebook} />
                                <SocialItem icon={<Instagram size={16} />} active={!!results.instagram} />
                                <SocialItem icon={<Linkedin size={16} />} active={!!results.linkedin} />
                                <SocialItem icon={<Twitter size={16} />} active={!!results.twitter} />
                            </div>
                        </PreviewCard>
                    </div>

                    <LockedReportGate 
                        toolName="Website Presence Checker"
                        features={[
                            "Full list of indexed social profiles",
                            "Email discovery for decision makers",
                            "Technical website health audit",
                            "Competitor presence comparison"
                        ]}
                    >
                        <div style={premiumSection}>
                            <h3 style={premiumTitle}>Contact Details & Deep Audit</h3>
                            <div style={premiumGrid}>
                                <div style={premiumItem}>
                                    <label style={premiumLabel}>Detected Email</label>
                                    <p style={premiumVal}>{results.email || "Processing..."}</p>
                                </div>
                                <div style={premiumItem}>
                                    <label style={premiumLabel}>Contact Page</label>
                                    <p style={premiumVal}>{results.contactPage || "Analyzing..."}</p>
                                </div>
                                <div style={premiumItem}>
                                    <label style={premiumLabel}>Phone Number</label>
                                    <p style={premiumVal}>{results.phone || "Not Found"}</p>
                                </div>
                            </div>
                        </div>
                    </LockedReportGate>
                </div>
            )}

            {!results && !loading && !error && (
                <div style={emptyState}>
                    <div style={emptyIcon}>
                        <LinkIcon size={40} />
                    </div>
                    <h3>Start Analyzing Presence</h3>
                    <p>Select a business lead from the dropdown or enter details manually.</p>
                </div>
            )}
        </ToolLayout>
    )
}

const SocialItem = ({ icon, active }) => (
    <div style={active ? socialItemActive : socialItemInactive}>
        {icon}
    </div>
)

/* ── Styles ──────────────────────────────────────────── */

const selectorCard = {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "flex-end",
    gap: "24px",
    marginBottom: "32px",
    flexWrap: "wrap"
}

const inputGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
    minWidth: "200px"
}

const labelStyle = {
    fontSize: "12px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
}

const selectWrapper = {
    position: "relative",
    display: "flex",
    alignItems: "center"
}

const inputIcon = {
    position: "absolute",
    left: "14px",
    color: "rgba(255,255,255,0.3)"
}

const selectStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px 12px 12px 40px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
    appearance: "none"
}

const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px 12px 12px 40px",
    color: "#fff",
    fontSize: "14px",
    outline: "none"
}

const divider = {
    fontSize: "12px",
    fontWeight: "800",
    color: "rgba(255,255,255,0.1)",
    paddingBottom: "14px"
}

const manualInputs = {
    display: "flex",
    gap: "16px",
    flex: 3,
    alignItems: "flex-end",
    flexWrap: "wrap"
}

const analyzeBtn = {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "46px",
    minWidth: "100px"
}

const errorBox = {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    padding: "16px 24px",
    borderRadius: "16px",
    marginBottom: "32px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: "500"
}

const resultsGrid = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    animation: "fadeIn 0.5s ease-out"
}

const resultsHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px"
}

const bizTitle = {
    fontSize: "24px",
    fontWeight: "900",
    color: "#fff",
    margin: 0
}

const bizMeta = {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px"
}

const statusBadge = (exists) => ({
    background: exists ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
    color: exists ? "#10b981" : "#ef4444",
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    border: `1px solid ${exists ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
})

const metricsRow = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px"
}

const cardContent = {
    height: "100%",
    display: "flex",
    alignItems: "center"
}

const linkStyle = {
    color: "#6366f1",
    fontWeight: "700",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px"
}

const emptyText = {
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    fontStyle: "italic"
}

const socialGrid = {
    display: "flex",
    gap: "12px",
    height: "100%",
    alignItems: "center"
}

const socialItemActive = {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "rgba(99, 102, 241, 0.1)",
    color: "#6366f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(99, 102, 241, 0.2)"
}

const socialItemInactive = {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.02)",
    color: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.05)"
}

const premiumSection = {
    marginTop: "32px",
    padding: "32px",
    background: "rgba(99, 102, 241, 0.05)",
    borderRadius: "24px",
    border: "1px solid rgba(99, 102, 241, 0.1)"
}

const premiumTitle = {
    fontSize: "18px",
    fontWeight: "800",
    color: "#fff",
    marginBottom: "24px"
}

const premiumGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px"
}

const premiumItem = {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
}

const premiumLabel = {
    fontSize: "11px",
    fontWeight: "700",
    color: "rgba(99, 102, 241, 0.6)",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
}

const premiumVal = {
    fontSize: "15px",
    fontWeight: "600",
    color: "#fff"
}

const emptyState = {
    padding: "100px 40px",
    textAlign: "center",
    color: "rgba(255,255,255,0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px"
}

const emptyIcon = {
    width: "80px",
    height: "80px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
    color: "rgba(255,255,255,0.05)"
}

export default WebsitePresenceTool

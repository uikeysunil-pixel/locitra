import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { fetchMyLeads, fetchLeadById, fetchBusinessById } from "../services/api"
import useLeadStore from "../store/leadStore"
import { getLeadValue, getMapUrl } from "../utils/leadHelpers"
import { 
    Mail, 
    Phone as PhoneIcon, 
    Globe, 
    Facebook, 
    Instagram, 
    Linkedin as LinkedInIcon, 
    Twitter, 
    MessageCircle,
    ExternalLink
} from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const getToken = () => {
    try { return JSON.parse(localStorage.getItem("locitra-auth") || "{}")?.state?.token || "" }
    catch { return "" }
}

export default function Outreach({ initialLead }) {

    const [leads, setLeads] = useState([])
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [leadsLoaded, setLeadsLoaded] = useState(false)
    const [activeTab, setActiveTab] = useState("email")
    const [copied, setCopied] = useState(false)
    const [copiedSubject, setCopiedSubject] = useState(false)
    const [copiedEmail, setCopiedEmail] = useState(false)
    const [aiContact, setAiContact] = useState(null)       // AI-found contact suggestions
    const [aiSearching, setAiSearching] = useState(false)  // loading state for AI finder
    const [autoDispatching, setAutoDispatching] = useState(false)
    const [dispatchStatus, setDispatchStatus] = useState(null)

    const location = useLocation()
    const [fetching, setFetching] = useState(false)

    // ── Local state holds the FULL lead object (for UI rendering) ──
    const [selected, setSelected] = useState(null)

    // ── Store holds ONLY the ID + type (for persistence across refresh) ──
    const selectedLeadId   = useLeadStore((state) => state.selectedLeadId)
    const selectedLeadType = useLeadStore((state) => state.selectedLeadType)
    const storeSetLead     = useLeadStore((state) => state.setSelectedLead)

    // Write to both local state and store
    const selectLead = (lead) => {
        setSelected(lead)
        storeSetLead(lead)
        setResult(null)
    }

    // Seed from prop or navigation state
    useEffect(() => {
        if (initialLead) {
            selectLead(initialLead)
        } else if (location.state?.lead) {
            selectLead(location.state.lead)
        }
    }, [initialLead, location.state])

    // Re-fetch fresh contact data when selectedLeadId changes (handles page refresh)
    useEffect(() => {
        const refresh = async () => {
            if (!selectedLeadId || fetching) return
            // Skip if we already have fresh contact data for this ID
            const currentId = selected?._id || selected?.placeId
            if (currentId === selectedLeadId && (selected?.outreach?.email || selected?.contact?.email || selected?.email || selected?.website || selected?.outreach?.website || selected?.contact?.website)) return

            setFetching(true)
            try {
                const res = selectedLeadType === "lead"
                    ? await fetchLeadById(selectedLeadId)
                    : await fetchBusinessById(selectedLeadId)
                if (res.success) {
                    const fresh = res.data.lead || res.data.business
                    // Merge: take fresh contact/outreach data, but preserve
                    // opportunityScore/rating/reviews from existing selected
                    // (DB doc may have opportunityScore=0 since it's computed dynamically)
                    setSelected(prev => ({
                        ...fresh,
                        opportunityScore: prev?.opportunityScore || fresh.opportunityScore || 0,
                        rating:           prev?.rating           || fresh.rating           || 0,
                        reviews:          prev?.reviews          || fresh.reviews          || 0,
                        mapsLink:         prev?.mapsLink         || fresh.mapsLink,
                        city:             prev?.city             || fresh.city || fresh.location,
                    }))
                }
            } catch (err) {
                console.error("Fresh fetch failed:", err)
            } finally {
                setFetching(false)
            }
        }
        refresh()
    }, [selectedLeadId])

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
            const business = selected;
            const o = business.outreach || {}
            const c = business.contact || {}

            const email = o.email || c.email || business.email;
            const phone = o.phone || c.phone || business.phone;
            const website = o.website || c.website || business.website;
            const contactPage = o.contactPage || c.contactPage || business.contactPage;
            const socials = o.socials || c.socials || {};

            console.log("AI BUSINESS DATA:", business);
            console.log("OUTREACH:", o);
            console.log("NORMALIZED:", { email, phone, website, contactPage, socials });

            const res = await fetch(`${API_BASE}/outreach/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
                body: JSON.stringify({
                    ...business,
                    website: website || ""
                })
            })
            const data = await res.json()
            setResult(data)
            setActiveTab("email")
        } catch (err) {
            console.error("Generation failed:", err)
        }
        setLoading(false)
    }

    const handleFindContact = async () => {
        if (!selected || aiSearching) return
        setAiSearching(true)
        setAiContact(null)
        try {
            const res = await fetch(`${API_BASE}/outreach/find-contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
                body: JSON.stringify({
                    name:    selected.name    || "",
                    city:    selected.city    || selected.location || "",
                    address: selected.address || "",
                    leadId:  selected._id
                })
            })
            const data = await res.json()
            if (data.success && data.contact) {
                setAiContact(data)
            } else {
                setAiContact({ contact: null, message: data.message || "No contact info found" })
            }
        } catch (err) {
            console.error("AI contact finder failed:", err)
            setAiContact({ contact: null, message: "Search failed. Please try again." })
        }
        setAiSearching(false)
    }

    const handleAutoOutreach = async () => {
        if (!selected || autoDispatching) return;
        
        const confirmed = window.confirm(`Send an automated outreach message to ${selected.name}?`);
        if (!confirmed) return;

        setAutoDispatching(true);
        setDispatchStatus({ status: "loading", message: "Checking contact info..." });
        
        try {
            // STEP 1: Determine contact
            const o = selected.outreach || {};
            const c = selected.contact || {};
            let contact = {
                email: o.email || c.email || selected.email,
                phone: o.phone || c.phone || selected.phone,
                website: o.website || c.website || selected.website
            };

            if (!contact.email && !contact.phone) {
                setDispatchStatus({ status: "loading", message: "Finding contact info..." });
                const res = await fetch(`${API_BASE}/outreach/find-contact`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
                    body: JSON.stringify({
                        name: selected.name || "",
                        city: selected.city || selected.location || "",
                        address: selected.address || "",
                    })
                });
                const data = await res.json();
                if (data.success && data.contact) {
                    contact = data.contact;
                } else {
                    throw new Error("No contact info found. Please find manually.");
                }
            }

            const type = contact.email ? "email" : "sms";
            setDispatchStatus({ status: "loading", message: "Generating message..." });

            // STEP 2: Generate Message
            const generateRes = await fetch(`${API_BASE}/outreach/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
                body: JSON.stringify({
                    businessName: selected.name,
                    industry: selected.category,
                    rating: selected.rating,
                    reviews: selected.reviews,
                    website: contact.website || "",
                    weakSignals: selected.weakSignals || [],
                    suggestedServices: selected.suggestedServices || []
                })
            });
            const generateData = await generateRes.json();
            
            if (!generateData.success) throw new Error("Failed to generate message");
            
            const outreachData = generateData.outreach || {};
            const subject = outreachData.subject || "Locitra Quick Update";
            const body = outreachData.emailBody || outreachData.email || "Hello from Locitra.";

            setDispatchStatus({ status: "loading", message: `Sending ${type}...` });

            // STEP 3: Send Message
            if (type === "email") {
                const sendRes = await fetch(`${API_BASE}/outreach/send-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
                    body: JSON.stringify({
                        to: contact.email,
                        subject: subject,
                        body: body
                    })
                });
                const sendData = await sendRes.json();
                if (!sendData.success) throw new Error(sendData.message || "Failed to send email");
            } else if (type === "sms") {
                const sendRes = await fetch(`${API_BASE}/outreach/send-sms`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
                    body: JSON.stringify({
                        to: contact.phone,
                        message: body
                    })
                });
                const sendData = await sendRes.json();
                if (!sendData.success) throw new Error(sendData.message || "Failed to send SMS");
            }

            setDispatchStatus({ status: "success", message: `✅ Automatically sent via ${type}!` });
        } catch (err) {
            console.error("Auto outreach failed:", err);
            setDispatchStatus({ status: "error", message: `❌ ${err.message}` });
        } finally {
            setAutoDispatching(false);
            // Clear status after 5s if successful
            setTimeout(() => {
                setDispatchStatus(prev => prev?.status === "success" ? null : prev);
            }, 5000);
        }
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
                        selectLead(lead || null)
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

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                    <button onClick={generate} style={{...genBtn, marginTop: 0}} disabled={!selected || loading || fetching || autoDispatching}>
                        {loading ? "Generating…" : "⚡ Generate Scripts"}
                    </button>
                    
                    <button 
                        onClick={handleAutoOutreach} 
                        disabled={!selected || autoDispatching || loading || fetching}
                        style={{
                            ...genBtn,
                            marginTop: 0,
                            background: "linear-gradient(135deg, #9333ea, #4f46e5)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        {autoDispatching ? "Working…" : "🚀 1-Click Auto Outreach"}
                    </button>
                </div>
                {dispatchStatus && (
                    <div style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: dispatchStatus.status === "error" ? "#b91c1c" : dispatchStatus.status === "success" ? "#15803d" : "#4338ca",
                        background: dispatchStatus.status === "error" ? "#fef2f2" : dispatchStatus.status === "success" ? "#f0fdf4" : "#e0e7ff",
                        border: `1px solid ${dispatchStatus.status === "error" ? "#fecaca" : dispatchStatus.status === "success" ? "#bbf7d0" : "#c7d2fe"}`
                    }}>
                        {dispatchStatus.message}
                    </div>
                )}
            </div>

            {/* ── Data Preview (Debug/Verification) ── */}
            {selected && (() => {
                const business = selected;
                const o = business.outreach || {}
                const c = business.contact || {}
                const os = o.socials || {}
                const cs = c.socials || {}

                const email = o.email || c.email || business.email
                const phone = o.phone || c.phone || business.phone
                const website = o.website || c.website || business.website
                const contactPage = o.contactPage || c.contactPage || business.contactPage

                const facebook = os.facebook || cs.facebook || business.facebook
                const instagram = os.instagram || cs.instagram || business.instagram
                const linkedin = os.linkedin || cs.linkedin || business.linkedin
                const twitter = os.twitter || cs.twitter || business.twitter

                const cleanPhone = phone?.replace(/[^0-9+]/g, "")
                const noContact  = !email && !phone && !website && !facebook && !instagram

                const googleUrl  = `https://www.google.com/search?q=${encodeURIComponent(business.name || "")}`
                const socialUrl  = `https://www.google.com/search?q=${encodeURIComponent(`${business.name || ""} ${business.city || ""} social media`)}`
                const mapUrl     = selected?.mapUrl || null

                return (
                    <div style={previewCard} onClick={e => e.stopPropagation()}>
                        {noContact ? (
                            /* ── No-contact fallback ── */
                            <div className="flex flex-col gap-2 py-1">
                                <p className="text-sm font-semibold text-slate-600">No direct contact found</p>
                                <p className="text-xs text-slate-400">Try one of these to reach them:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {mapUrl && (
                                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-100">
                                            🗺️ View Map
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ── Normal contact fields ── */
                            <>
                        <div style={previewItem}>
                            <span style={previewLabel}>📧 EMAIL</span>
                            <span style={previewValue}>
                                {email ? (
                                    <a 
                                        href={`mailto:${email.trim()}`}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{...previewLink, cursor: "pointer", position: "relative", zIndex: 11}}
                                    >
                                        {email.trim()}
                                    </a>
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ color: "#64748b" }}>Not found</span>
                                        {contactPage && (
                                            <a 
                                                href={contactPage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={previewActionLink}
                                            >
                                                📩 Website Contact
                                            </a>
                                        )}
                                    </div>
                                )}
                            </span>
                        </div>
                        {phone && (
                            <div style={previewItem}>
                                <span style={previewLabel}>📞 PHONE</span>
                                <span style={previewValue}>
                                    <a href={`tel:${cleanPhone}`} style={previewLink}>{phone}</a>
                                </span>
                            </div>
                        )}
                        <div style={previewItem}>
                            <span style={previewLabel}>🌐 WEBSITE</span>
                            <span style={previewValue}>
                                {website ? (
                                    <a href={website} target="_blank" rel="noopener noreferrer" style={previewLink}>
                                        Visit Website
                                    </a>
                                ) : <span style={{ color: "#64748b" }}>Not found</span>}
                            </span>
                        </div>
                        <div style={previewItem}>
                            <span style={previewLabel}>🪟 SOCIALS</span>
                            <div style={socialRowSmall}>
                                {(() => {
                                    const links = [];
                                    if (facebook) links.push(<a key="fb" href={facebook} target="_blank" rel="noopener noreferrer" style={socialLinkSmall}>Facebook</a>);
                                    if (instagram) links.push(<a key="ig" href={instagram} target="_blank" rel="noopener noreferrer" style={socialLinkSmall}>Instagram</a>);
                                    if (cleanPhone) links.push(<a key="wa" href={`https://wa.me/${cleanPhone.replace("+", "")}`} target="_blank" rel="noopener noreferrer" style={socialLinkSmall}>WhatsApp</a>);
                                    if (cleanPhone) links.push(<a key="sms" href={`sms:${cleanPhone}?body=${encodeURIComponent("Hi, I came across your business and wanted to connect.")}`} style={socialLinkSmall}>SMS</a>);

                                    if (links.length === 0) return <span style={{ color: "#64748b", fontSize: "13px" }}>Not found</span>;

                                    return links.reduce((acc, link, i) => {
                                        if (i > 0) acc.push(<span key={`sep-${i}`} style={socialDividerSmall}>|</span>);
                                        acc.push(link);
                                        return acc;
                                    }, []);
                                })()}
                            </div>
                        </div>
                        {fetching && <div style={fetchingOverlay}>Refreshing data…</div>}

                            </>
                        )}

                        {/* ── AI Contact Finder ── */}
                        {(!email && !phone && !website) && (
                            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #e2e8f0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleFindContact() }}
                                        disabled={aiSearching}
                                        style={{
                                            fontSize: "12px", fontWeight: "600", padding: "5px 12px",
                                            borderRadius: "8px", border: "none",
                                            cursor: aiSearching ? "not-allowed" : "pointer",
                                            background: aiSearching
                                                ? "#a5b4fc"
                                                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                            color: "#fff", opacity: aiSearching ? 0.7 : 1,
                                            transition: "all .2s"
                                        }}
                                    >
                                        {aiSearching ? "🔍 Searching…" : "🤖 Find Contact (AI)"}
                                    </button>
                                    {aiSearching && (
                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                                            Checking database &amp; search…
                                        </span>
                                    )}
                                </div>

                                {aiContact && (
                                    <div style={{
                                        marginTop: "10px", padding: "12px", borderRadius: "10px",
                                        background: aiContact.contact ? "#f0fdf4" : "#fafafa",
                                        border: `1px solid ${aiContact.contact ? "#bbf7d0" : "#e2e8f0"}`
                                    }}>
                                        {aiContact.source === "search-links" ? (
                                            <>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                                                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                        Manual Search
                                                    </span>
                                                    <span style={{ fontSize: "10px", color: "#94a3b8", marginLeft: "auto" }}>
                                                        Free Web Search
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: "12px", color: "#475569", marginBottom: "10px" }}>
                                                    No direct contact found in database. Try these quick searches:
                                                </p>
                                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                    <a href={aiContact.contact?.googleSearch} target="_blank" rel="noopener noreferrer"
                                                       style={{ fontSize: "12px", background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", color: "#334155", textDecoration: "none", fontWeight: "600", border: "1px solid #e2e8f0" }}>
                                                        🔍 Search on Google
                                                    </a>
                                                    <a href={aiContact.contact?.socialSearch} target="_blank" rel="noopener noreferrer"
                                                       style={{ fontSize: "12px", background: "#f8fafc", padding: "6px 12px", borderRadius: "6px", color: "#334155", textDecoration: "none", fontWeight: "600", border: "1px solid #e2e8f0" }}>
                                                        📱 Find on Social
                                                    </a>
                                                </div>
                                            </>
                                        ) : aiContact.contact ? (
                                            <>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                                                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                        AI Suggestions
                                                    </span>
                                                    <span style={{
                                                        fontSize: "10px", padding: "1px 6px", borderRadius: "999px", fontWeight: "600",
                                                        background: aiContact.confidence === "high" ? "#dcfce7" : aiContact.confidence === "medium" ? "#fef9c3" : "#fce7f3",
                                                        color: aiContact.confidence === "high" ? "#16a34a" : aiContact.confidence === "medium" ? "#92400e" : "#9d174d",
                                                    }}>
                                                        {aiContact.confidence || "low"} confidence
                                                    </span>
                                                    <span style={{ fontSize: "10px", color: "#94a3b8", marginLeft: "auto" }}>
                                                        via {aiContact.source || "search"}
                                                    </span>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                    {aiContact.contact.phone && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{ fontSize: "12px", color: "#475569" }}>📞 {aiContact.contact.phone}</span>
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(aiContact.contact.phone)}
                                                                style={{ fontSize: "10px", color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>
                                                                Copy
                                                            </button>
                                                        </div>
                                                    )}
                                                    {aiContact.contact.email && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{ fontSize: "12px", color: "#475569" }}>📧 {aiContact.contact.email}</span>
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(aiContact.contact.email)}
                                                                style={{ fontSize: "10px", color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>
                                                                Copy
                                                            </button>
                                                        </div>
                                                    )}
                                                    {aiContact.contact.website && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <a href={aiContact.contact.website} target="_blank" rel="noopener noreferrer"
                                                                onClick={e => e.stopPropagation()}
                                                                style={{ fontSize: "12px", color: "#6366f1", fontWeight: "500" }}>
                                                                🌐 {aiContact.contact.website}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "8px", fontStyle: "italic" }}>
                                                    AI suggestions — verify before use.
                                                </p>
                                            </>
                                        ) : (
                                            <p style={{ fontSize: "12px", color: "#64748b" }}>
                                                😕 {aiContact.message || "No contact info found"}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* ── Business Insights Card ── */}
            {selected && (() => {
                const rating = selected.rating ?? null
                const reviews = selected.reviews ?? selected.totalReviews ?? 0
                const leadValue = selected.leadValue ?? getLeadValue(selected)
                const address = selected.address || null
                const mapUrl = selected.mapUrl ?? getMapUrl(selected)

                const contactFields = [
                    selected.email || selected.outreach?.email || selected.contact?.email,
                    selected.phone || selected.outreach?.phone || selected.contact?.phone,
                    selected.website || selected.outreach?.website || selected.contact?.website,
                    selected.outreach?.socials?.facebook || selected.contact?.socials?.facebook,
                    selected.outreach?.socials?.instagram || selected.contact?.socials?.instagram,
                    address
                ].filter(Boolean).length

                return (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                        {/* Top metrics grid */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {[
                                { icon: "⭐", label: "Rating", value: rating ? `${rating}/5` : "—" },
                                { icon: "📝", label: "Reviews", value: reviews ? reviews.toLocaleString() : "—" },
                                { icon: "💰", label: "Lead Value", value: leadValue },
                                { icon: "📊", label: "Contacts", value: `${contactFields}/6` },
                            ].map(({ icon, label, value }) => (
                                <div key={label} style={{ background: "#fff", borderRadius: "10px", padding: "10px 12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                    <div style={{ fontSize: "18px", marginBottom: "4px" }}>{icon}</div>
                                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>{value}</div>
                                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginTop: "3px", letterSpacing: "0.04em" }}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom row: address + map button */}
                        {address && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                                <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>
                                    📍 {address}
                                </span>
                                {mapUrl && (
                                    <a
                                        href={mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        style={{ padding: "5px 12px", borderRadius: "8px", background: "#eff6ff", color: "#3b82f6", fontSize: "11px", fontWeight: "700", textDecoration: "none", whiteSpace: "nowrap", border: "1px solid #bfdbfe", flexShrink: 0 }}
                                    >
                                        🗺️ View Map
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )
            })()}

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

const previewCard = { position: "relative", background: "#f8fafc", borderRadius: "12px", padding: "12px 16px", border: "1px dashed #cbd5e1", marginBottom: "20px", display: "flex", gap: "24px", flexWrap: "wrap" }
const previewItem = { display: "flex", flexDirection: "column", gap: "2px" }
const previewLabel = { fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }
const previewValue = { fontSize: "13px", color: "#1e293b", fontWeight: "600" }
const previewLink = { color: "#6366f1", textDecoration: "underline", fontWeight: "700", cursor: "pointer" }
const previewActionLink = { background: "#f0fdf4", color: "#16a34a", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", textDecoration: "none", border: "1px solid #bbf7d0", cursor: "pointer" }
const fetchingOverlay = { position: "absolute", inset: 0, background: "rgba(248, 250, 252, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", fontSize: "12px", color: "#6366f1", fontWeight: "700", pointerEvents: "none", zIndex: 10 }

const socialRowSmall = { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "2px" }
const socialLinkSmall = { color: "#6366f1", textDecoration: "underline", fontWeight: "700", fontSize: "13px" }
const socialDividerSmall = { color: "#cbd5e1", fontSize: "12px" }

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

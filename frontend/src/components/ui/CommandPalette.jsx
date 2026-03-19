import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useMarketStore } from "../../store/marketStore"
import { 
    Search, LayoutDashboard, Target, Zap, 
    BarChart3, FileText, CreditCard, Crosshair,
    Settings, Compass, Command
} from "lucide-react"

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const navigate = useNavigate()
    const { businesses } = useMarketStore()
    const inputRef = useRef(null)

    // keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
            if (e.key === "Escape") {
                setIsOpen(false)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 10)
            setQuery("")
            setSelectedIndex(0)
        }
    }, [isOpen])

    const navigationItems = [
        { id: "nav-dash", label: "Dashboard", icon: <LayoutDashboard size={18}/>, path: "/app", section: "Navigation" },
        { id: "nav-gen", label: "Lead Generator", icon: <Target size={18}/>, path: "/dashboard/lead-generator", section: "Navigation" },
        { id: "nav-gap", label: "Market Gaps", icon: <Compass size={18}/>, path: "/dashboard/market-gaps", section: "Navigation" },
        { id: "nav-heat", label: "Opportunity Heatmap", icon: <Zap size={18}/>, path: "/dashboard/opportunity-heatmap", section: "Navigation" },
        { id: "nav-crm", label: "Lead CRM", icon: <BarChart3 size={18}/>, path: "/dashboard/lead-crm", section: "Navigation" },
        { id: "nav-out", label: "Outreach", icon: <Crosshair size={18}/>, path: "/dashboard/outreach", section: "Navigation" },
        { id: "nav-rep", label: "Reports", icon: <FileText size={18}/>, path: "/dashboard/reports", section: "Navigation" },
        { id: "nav-bill", label: "Billing", icon: <CreditCard size={18}/>, path: "/dashboard/billing", section: "Navigation" }
    ]

    const filteredItems = useMemo(() => {
        const q = query.toLowerCase()
        const items = []

        // Navigation filter
        const navMatches = navigationItems.filter(i => i.label.toLowerCase().includes(q))
        if (navMatches.length) items.push(...navMatches)

        // Business search (limit to 5)
        if (q.length > 1) {
            const bizMatches = businesses
                .filter(b => (b.name || b.title || "").toLowerCase().includes(q))
                .slice(0, 5)
                .map(b => ({
                    id: `biz-${b.name || b.title}`,
                    label: b.name || b.title,
                    icon: <Settings size={18} />,
                    section: "Businesses",
                    isBusiness: true,
                    rank: b.rank
                }))
            if (bizMatches.length) items.push(...bizMatches)
        }

        return items
    }, [query, businesses])

    const handleSelect = (item) => {
        if (item.path) {
            navigate(item.path)
        } else if (item.isBusiness) {
            // Logic to scroll to business could be added here if we had page context
            alert(`Selected: ${item.label} (Rank #${item.rank})`)
        }
        setIsOpen(false)
    }

    const onKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % filteredItems.length)
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
        } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
            handleSelect(filteredItems[selectedIndex])
        }
    }

    if (!isOpen) return null

    return (
        <div style={overlay} onClick={() => setIsOpen(false)}>
            <div style={modal} onClick={e => e.stopPropagation()}>
                <div style={searchBox}>
                    <Search size={20} color="#94a3b8" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search tools, businesses, actions..."
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={onKeyDown}
                        style={input}
                    />
                    <div style={kLabel}><Command size={12}/> K</div>
                </div>

                <div style={resultsArea}>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, idx) => (
                            <div key={item.id}>
                                {(idx === 0 || filteredItems[idx-1].section !== item.section) && (
                                    <div style={sectionTitle}>{item.section}</div>
                                )}
                                <div
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    style={{
                                        ...resultItem,
                                        background: selectedIndex === idx ? "#f1f5f9" : "transparent"
                                    }}
                                >
                                    <div style={{ ...iconBox, color: selectedIndex === idx ? "#6366f1" : "#64748b" }}>
                                        {item.icon}
                                    </div>
                                    <span style={{ 
                                        fontWeight: selectedIndex === idx ? "700" : "500",
                                        color: selectedIndex === idx ? "#0f172a" : "#475569"
                                    }}>{item.label}</span>
                                    {item.isBusiness && <span style={rankTag}>Rank #{item.rank}</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={noResults}>No search results found</div>
                    )}
                </div>

                <div style={footer}>
                    <div style={keyTip}><span>↑↓</span> to navigate</div>
                    <div style={keyTip}><span>Enter</span> to select</div>
                    <div style={keyTip}><span>Esc</span> to close</div>
                </div>
            </div>
        </div>
    )
}

const overlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    paddingTop: "12vh",
    zIndex: 99999
}

const modal = {
    width: "100%",
    maxWidth: "640px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid #e2e8f0"
}

const searchBox = {
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    gap: "12px",
    position: "relative"
}

const input = {
    flex: 1,
    border: "none",
    padding: "8px 0",
    fontSize: "16px",
    fontFamily: "inherit",
    outline: "none",
    color: "#0f172a"
}

const kLabel = {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    border: "1px solid #e2e8f0"
}

const resultsArea = {
    padding: "8px",
    maxHeight: "400px",
    overflowY: "auto"
}

const sectionTitle = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    padding: "16px 12px 6px 12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
}

const resultItem = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background 0.1s ease"
}

const iconBox = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px"
}

const rankTag = {
    marginLeft: "auto",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    background: "#f8fafc",
    padding: "2px 8px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0"
}

const noResults = {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px"
}

const footer = {
    display: "flex",
    padding: "12px 20px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    gap: "18px"
}

const keyTip = {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    display: "flex",
    gap: "6px",
    alignItems: "center"
}

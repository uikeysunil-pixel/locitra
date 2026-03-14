import { useState, useMemo } from "react"
import { useMarketStore } from "../store/marketStore"

/* ─────────────────────────────────────────────────────────
   Filter definitions — single source of truth.
   Each entry declares:
     key      → internal filter id
     label    → button label
     icon     → emoji prefix
     fn       → predicate applied to every business
───────────────────────────────────────────────────────── */
const FILTERS = [
    {
        key: "all",
        label: "All Businesses",
        icon: "🏢",
        fn: () => true
    },
    {
        key: "noWebsite",
        label: "No Website",
        icon: "🌐",
        fn: b => !b.website
    },
    {
        key: "lowReviews",
        label: "Low Reviews",
        icon: "📝",
        fn: b => (Number(b.reviews) || Number(b.totalReviews) || 0) < 30
    },
    {
        key: "lowRating",
        label: "Low Rating",
        icon: "⭐",
        fn: b => (Number(b.rating) || 0) < 4.0
    },
    {
        key: "highOpportunity",
        label: "High Opportunity",
        icon: "🎯",
        fn: b => (b.opportunityScore ?? 0) >= 70
    },
]

/**
 * LeadFilters
 *
 * Renders the filter toggle bar and calls `onFilter(filteredBusinesses, activeKey)`
 * whenever the selection changes.  The parent (Dashboard) keeps no filter state —
 * all logic lives here.
 *
 * Props:
 *   businesses  – full dataset (passed from Dashboard; falls back to store)
 *   onFilter    – (filteredList: Business[], activeKey: string) => void
 */
export default function LeadFilters({ businesses: propData, onFilter }) {

    const { businesses: storeData } = useMarketStore()
    const businesses = propData?.length > 0 ? propData : storeData

    const [active, setActive] = useState("all")

    /* Count how many businesses match each filter — memoised for 500+ perf */
    const counts = useMemo(() => {
        const result = {}
        for (const f of FILTERS) {
            result[f.key] = businesses.filter(f.fn).length
        }
        return result
    }, [businesses])

    /* Apply the chosen filter and notify the parent */
    const handleSelect = (key) => {
        setActive(key)
        const predicate = FILTERS.find(f => f.key === key)?.fn ?? (() => true)
        onFilter?.(businesses.filter(predicate), key)
    }

    if (!businesses.length) return null

    return (

        <div className="card" style={panel}>

            {/* Panel header */}
            <div style={panelHeader}>
                <div>
                    <h3 style={panelTitle}>🔽 Lead Filters</h3>
                    <p style={panelSub}>
                        Instantly segment {businesses.length.toLocaleString()} businesses by lead quality
                    </p>
                </div>

                {/* Active filter summary pill */}
                <div style={activePill}>
                    <span style={activeDot} />
                    <span style={activeLabel}>
                        {counts[active].toLocaleString()} result{counts[active] !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Filter buttons */}
            <div style={btnRow}>
                {FILTERS.map(({ key, label, icon }) => {
                    const isActive = active === key
                    const count = counts[key]
                    return (
                        <button
                            key={key}
                            onClick={() => handleSelect(key)}
                            style={{
                                ...filterBtn,
                                ...(isActive ? activeBtnStyle : inactiveBtnStyle)
                            }}
                            title={`Show ${label} businesses`}
                        >
                            <span style={btnIcon}>{icon}</span>
                            <span>{label}</span>
                            <span style={{
                                ...countBadge,
                                background: isActive ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                                color: isActive ? "#fff" : "#475569"
                            }}>
                                {count.toLocaleString()}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Progress bar strip showing proportion of filtered vs total */}
            <div style={barTrack}>
                {FILTERS.slice(1).map(({ key }, i) => {
                    const pct = businesses.length > 0
                        ? (counts[key] / businesses.length) * 100
                        : 0
                    const colours = ["#f59e0b", "#6366f1", "#ef4444", "#22c55e"]
                    return (
                        <div
                            key={key}
                            title={`${FILTERS[i + 1].label}: ${counts[key]} businesses`}
                            style={{
                                ...barSegment,
                                width: `${pct}%`,
                                background: colours[i],
                                opacity: active === key ? 1 : 0.45
                            }}
                        />
                    )
                })}
            </div>

            {/* Legend below bar */}
            <div style={legend}>
                {FILTERS.slice(1).map(({ key, icon, label }, i) => {
                    const colours = ["#f59e0b", "#6366f1", "#ef4444", "#22c55e"]
                    return (
                        <span key={key} style={legendItem}>
                            <span style={{ color: colours[i], fontSize: "10px" }}>■</span>
                            {icon} {label} ({counts[key]})
                        </span>
                    )
                })}
            </div>

        </div>

    )

}

/* ── Styles ──────────────────────────────────────────────── */

const panel = {
    padding: "22px 24px 18px"
}

const panelHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
    flexWrap: "wrap",
    gap: "10px"
}

const panelTitle = { fontSize: "15px", fontWeight: "700", marginBottom: "3px" }
const panelSub = { fontSize: "12px", color: "#64748b" }

const activePill = {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "20px",
    padding: "5px 14px"
}
const activeDot = { width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }
const activeLabel = { fontSize: "13px", fontWeight: "700", color: "#16a34a" }

const btnRow = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
}

const filterBtn = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    border: "1.5px solid transparent",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap"
}

const activeBtnStyle = {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "1.5px solid transparent",
    boxShadow: "0 4px 12px rgba(99,102,241,.30)"
}

const inactiveBtnStyle = {
    background: "#f8fafc",
    color: "#374151",
    border: "1.5px solid #e2e8f0"
}

const btnIcon = { fontSize: "14px" }

const countBadge = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "26px",
    height: "20px",
    padding: "0 7px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700"
}

/* Proportional bar */
const barTrack = {
    display: "flex",
    height: "5px",
    borderRadius: "99px",
    overflow: "hidden",
    background: "#f1f5f9",
    marginTop: "18px",
    gap: "2px"
}

const barSegment = {
    height: "100%",
    borderRadius: "99px",
    transition: "opacity 0.2s ease, width 0.3s ease"
}

const legend = {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "8px"
}

const legendItem = {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    display: "flex",
    gap: "4px",
    alignItems: "center"
}

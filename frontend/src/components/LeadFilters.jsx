import { useState, useEffect } from "react"
import { useMarketStore } from "../store/marketStore"

export default function LeadFilters({ businesses: propData, onFilter }) {
    const { businesses: storeData } = useMarketStore()
    const businesses = propData?.length > 0 ? propData : storeData

    const [searchQ, setSearchQ] = useState("")
    const [filters, setFilters] = useState({
        opportunity: "All",
        website: "All",
        rating: "All",
        value: "All"
    })

    useEffect(() => {
        let src = [...businesses]
        
        if (searchQ.trim()) {
            const q = searchQ.toLowerCase()
            src = src.filter(b =>
                (b.name || "").toLowerCase().includes(q) ||
                (b.category || "").toLowerCase().includes(q) ||
                (b.address || "").toLowerCase().includes(q)
            )
        }

        src = src.filter((lead) => {
            const leadValue = Math.round((lead.opportunityScore ?? 0) * 5)
            const opScore = lead.opportunityScore ?? 0
            let opStr = "Low"
            if (opScore >= 70) opStr = "High"
            else if (opScore >= 40) opStr = "Medium"

            if (filters.opportunity !== "All" && opStr !== filters.opportunity) return false;

            if (filters.website === "No Website" && lead.website) return false;
            if (filters.website === "Has Website" && !lead.website) return false;

            const rating = Number(lead.rating) || 0;
            if (filters.rating === "Below 4.0" && rating >= 4) return false;
            if (filters.rating === "4.0+" && (rating < 4 || !lead.rating)) return false;

            if (filters.value === "0-200" && leadValue > 200) return false;
            if (filters.value === "200-500" && (leadValue < 200 || leadValue > 500)) return false;
            if (filters.value === "500+" && leadValue < 500) return false;

            return true;
        });

        src.sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
        
        // Pass the filtered results up, and also the active filter description if needed
        onFilter?.(src, filters.opportunity !== "All" ? filters.opportunity : "all")
    }, [businesses, filters, searchQ, onFilter])

    if (!businesses.length) return null

    return (
        <div className="card" style={controls}>
            <input
                placeholder="Search business, category, address…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                style={searchInput}
            />

            <div style={filterBtns}>
                <div style={filterGroup}>
                    <label style={filterLabel}>Opportunity</label>
                    <select value={filters.opportunity} onChange={(e) => setFilters({...filters, opportunity: e.target.value})} style={filterSelect}>
                        <option>All</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                </div>
                <div style={filterGroup}>
                    <label style={filterLabel}>Website</label>
                    <select value={filters.website} onChange={(e) => setFilters({...filters, website: e.target.value})} style={filterSelect}>
                        <option>All</option>
                        <option>No Website</option>
                        <option>Has Website</option>
                    </select>
                </div>
                <div style={filterGroup}>
                    <label style={filterLabel}>Rating</label>
                    <select value={filters.rating} onChange={(e) => setFilters({...filters, rating: e.target.value})} style={filterSelect}>
                        <option>All</option>
                        <option>Below 4.0</option>
                        <option>4.0+</option>
                    </select>
                </div>
                <div style={filterGroup}>
                    <label style={filterLabel}>Lead Value</label>
                    <select value={filters.value} onChange={(e) => setFilters({...filters, value: e.target.value})} style={filterSelect}>
                        <option>All</option>
                        <option>0-200</option>
                        <option>200-500</option>
                        <option>500+</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

/* ── Styles ──────────────────────────────────────────── */
const controls = { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", padding: "16px 20px" }
const searchInput = { flex: 1, minWidth: "200px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px" }
const filterBtns = { display: "flex", gap: "8px", flexWrap: "wrap" }
const filterGroup = { display: "flex", flexDirection: "column", gap: "4px" }
const filterLabel = { fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }
const filterSelect = { padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#334155", outline: "none", cursor: "pointer", background: "#f8fafc", minWidth: "120px" }

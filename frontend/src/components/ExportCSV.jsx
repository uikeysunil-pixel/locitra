import { useMarketStore } from "../store/marketStore"

/**
 * ExportCSV — accepts an optional `businesses` prop (from Dashboard)
 * but falls back to the global store if no prop is passed.
 */
export default function ExportCSV({ businesses: propBusinesses }) {

    const { businesses: storeBusinesses } = useMarketStore()

    // Prefer prop data; fall back to persisted store data
    const businesses = propBusinesses ?? storeBusinesses

    const downloadCSV = () => {

        if (!businesses || businesses.length === 0) {
            alert("No leads available to export. Run a market scan first.")
            return
        }

        const headers = [
            "Name",
            "Rating",
            "Reviews",
            "Website",
            "Phone",
            "Address",
            "Category",
            "Opportunity Score"
        ]

        const escape = (val) => {
            const str = String(val ?? "")
            // Wrap in quotes if value contains commas, quotes, or newlines
            return str.includes(",") || str.includes('"') || str.includes("\n")
                ? `"${str.replace(/"/g, '""')}"`
                : str
        }

        const rows = businesses.map(b => [
            escape(b.name),
            escape(b.rating ?? 0),
            escape(b.reviews ?? b.totalReviews ?? 0),
            escape(b.website ?? ""),
            escape(b.phone ?? ""),
            escape(b.address ?? ""),
            escape(b.category ?? ""),
            escape(b.opportunityScore ?? 0)
        ])

        let csv = headers.join(",") + "\n"
        rows.forEach(row => {
            csv += row.join(",") + "\n"
        })

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `locitra_leads_${Date.now()}.csv`
        a.click()
        window.URL.revokeObjectURL(url)

    }

    return (

        <button
            onClick={downloadCSV}
            style={btn}
            title={`Export ${businesses?.length ?? 0} businesses to CSV`}
        >
            ⬇ Export {businesses?.length ?? 0} Leads to CSV
        </button>

    )

}

const btn = {
    padding: "10px 20px",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px"
}
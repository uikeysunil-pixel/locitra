import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * leadStore — persists ONLY the identity of the selected lead.
 *
 * Stores:
 *   selectedLeadId    → _id (CRM lead) or placeId (scan business)
 *   selectedLeadType  → "lead" | "business"
 *
 * The FULL lead object is never stored here — it lives in
 * component state (fetched fresh from MongoDB on mount).
 *
 * Data flow:
 *   click → setSelectedLead(lead) → stores ID + type
 *   refresh → store rehydrates from localStorage
 *   Outreach.jsx mounts → sees selectedLeadId → fetchLeadById / fetchBusinessById
 *   fresh full data → component local state → rendered in UI
 */
const useLeadStore = create(
    persist(
        (set) => ({
            selectedLeadId:   null,
            selectedLeadType: null,   // "lead" | "business"

            // Accepts the full object, stores only what's needed
            setSelectedLead: (lead) => {
                if (!lead) return set({ selectedLeadId: null, selectedLeadType: null })
                set({
                    selectedLeadId:   lead._id || lead.placeId || null,
                    selectedLeadType: lead.userId ? "lead" : "business",
                })
            },

            clearSelectedLead: () => set({ selectedLeadId: null, selectedLeadType: null }),
        }),
        {
            name: "locitra-selected-lead",
            partialize: (state) => ({
                selectedLeadId:   state.selectedLeadId,
                selectedLeadType: state.selectedLeadType,
            }),
        }
    )
)

export default useLeadStore


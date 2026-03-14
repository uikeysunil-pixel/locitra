import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useMarketStore = create(
    persist(
        (set) => ({
            businesses: [],
            setBusinesses: (data) => set({ businesses: data }),
            clearBusinesses: () => set({ businesses: [] })
        }),
        { name: "locitra-market-data" }
    )
)
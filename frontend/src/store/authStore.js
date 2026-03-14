import { create } from "zustand"
import { persist } from "zustand/middleware"

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,

            login: (data) => set({
                user: {
                    _id: data._id,
                    email: data.email,
                    companyName: data.companyName,
                    plan: data.plan
                },
                token: data.token
            }),

            logout: () => set({ user: null, token: null }),

            updatePlan: (plan) => set((state) => ({
                user: state.user ? { ...state.user, plan } : null
            }))
        }),
        {
            name: "locitra-auth"   // localStorage key
        }
    )
)

export default useAuthStore

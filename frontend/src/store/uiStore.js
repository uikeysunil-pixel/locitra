import { create } from "zustand"

const useUiStore = create((set) => ({
    isAuthModalOpen: false,
    authModalMode: "login", // "login" | "register"

    openAuthModal: (mode = "login") => set({ 
        isAuthModalOpen: true, 
        authModalMode: mode 
    }),

    closeAuthModal: () => set({ 
        isAuthModalOpen: false 
    }),

    setAuthModalMode: (mode) => set({ 
        authModalMode: mode 
    })
}))

export default useUiStore

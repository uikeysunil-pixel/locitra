import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"
import useUiStore from "../../store/uiStore"
import useAuthStore from "../../store/authStore"

export default function AuthModal() {
    const { isAuthModalOpen, authModalMode, closeAuthModal, setAuthModalMode } = useUiStore()
    const { user } = useAuthStore()
    const navigate = useNavigate()

    // Disable background scroll
    useEffect(() => {
        if (isAuthModalOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => { document.body.style.overflow = "unset" }
    }, [isAuthModalOpen])

    // Handle post-login redirect intent
    useEffect(() => {
        if (user && isAuthModalOpen) {
            const selectedTool = localStorage.getItem("selectedTool");
            if (selectedTool) {
                localStorage.removeItem("selectedTool");
                closeAuthModal();
                
                // Unified tool route mapping
                if (selectedTool.includes("rank-checker") || selectedTool.includes("ranking-checker")) {
                    navigate("/tools/google-maps-rank-checker");
                } else {
                    navigate(`/tools/${selectedTool}`);
                }
            }
        }
    }, [user, isAuthModalOpen, navigate, closeAuthModal])

    // ESC key listener
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") closeAuthModal()
        }
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [closeAuthModal])

    if (!isAuthModalOpen) return null

    return (
        <div style={overlay} onClick={closeAuthModal}>
            <div 
                style={modalContainer(authModalMode)} 
                onClick={(e) => e.stopPropagation()}
                className="animate-in zoom-in-95 fade-in duration-200"
            >
                {/* Close Button */}
                <button onClick={closeAuthModal} style={closeBtn}>
                    <X size={20} />
                </button>

                {/* Clarity Message */}
                <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "#475569", fontWeight: "500", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        Create a free account to run this tool and unlock full insights.
                    </p>
                </div>

                {/* Tabs */}
                <div style={tabs}>
                    <button 
                        onClick={() => setAuthModalMode("login")}
                        style={{
                            ...tab,
                            color: authModalMode === "login" ? "#6366f1" : "#64748b",
                            borderBottom: authModalMode === "login" ? "2px solid #6366f1" : "2px solid transparent"
                        }}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setAuthModalMode("register")}
                        style={{
                            ...tab,
                            color: authModalMode === "register" ? "#6366f1" : "#64748b",
                            borderBottom: authModalMode === "register" ? "2px solid #6366f1" : "2px solid transparent"
                        }}
                    >
                        Register
                    </button>
                </div>

                <div style={content}>
                    {authModalMode === "login" ? (
                        <LoginForm onSuccess={closeAuthModal} />
                    ) : (
                        <RegisterForm onSuccess={() => setAuthModalMode("login")} />
                    )}
                </div>

                {/* Switcher Footer */}
                <div style={footer}>
                    {authModalMode === "login" ? (
                        <p>Don't have an account? <span style={link} onClick={() => setAuthModalMode("register")}>Create one free</span></p>
                    ) : (
                        <p>Already have an account? <span style={link} onClick={() => setAuthModalMode("login")}>Sign in</span></p>
                    )}
                </div>
            </div>
        </div>
    )
}

const overlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
}

const modalContainer = (mode) => ({
    background: "#fff",
    borderRadius: "24px",
    width: "100%",
    maxWidth: mode === "register" ? "850px" : "460px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    padding: "40px 32px 32px",
    transition: "max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
})

const closeBtn = {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "#f1f5f9",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#64748b",
    transition: "all 0.2s"
}

const tabs = {
    display: "flex",
    gap: "24px",
    marginBottom: "32px",
    borderBottom: "1px solid #f1f5f9"
}

const tab = {
    padding: "8px 4px 12px",
    fontSize: "15px",
    fontWeight: "700",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s"
}

const content = {
    marginBottom: "20px"
}

const footer = {
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
    marginTop: "20px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "20px"
}

const link = {
    color: "#6366f1",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline"
}

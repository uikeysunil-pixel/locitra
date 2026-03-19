import { useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import axios from "axios"
import useAuthStore from "../../store/authStore"
import { authResendVerification } from "../../services/api"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function LoginForm({ onSuccess }) {
    const enableTurnstile = import.meta.env.VITE_ENABLE_TURNSTILE === "true";

    const navigate = useNavigate()
    const location = useLocation()
    const login = useAuthStore((s) => s.login)

    const params = new URLSearchParams(location.search)
    const registered = params.get("registered") === "true"

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Resend states
    const [resendLoading, setResendLoading] = useState(false)
    const [resendError, setResendError] = useState("")
    const [resendSuccess, setResendSuccess] = useState("")

    const handleResendVerification = async () => {
        setResendError("")
        setResendSuccess("")

        if (!email.trim()) {
            setResendError("Please enter your email address first.")
            return
        }

        let turnstileToken = undefined;
        if (enableTurnstile) {
            if (window.turnstile) {
                turnstileToken = window.turnstile.getResponse()
                if (!turnstileToken) {
                    setResendError("Please complete the bot verification.")
                    return
                }
            }
        }

        setResendLoading(true)
        const res = await authResendVerification(email, turnstileToken)
        setResendLoading(false)

        if (!res.success) {
            if (enableTurnstile && window.turnstile) window.turnstile.reset();
            setResendError(res.error || "Failed to resend verification email.")
        } else {
            setResendSuccess("Verification email sent. Please check your inbox.")
        }
    }

    const handleLogin = async (e) => {
        if (e) e.preventDefault()
        setError("")

        let turnstileToken = undefined;
        if (enableTurnstile) {
            if (window.turnstile) {
                turnstileToken = window.turnstile.getResponse()
                if (!turnstileToken) {
                    setError("Please complete the bot verification.")
                    return
                }
            }
        }

        setLoading(true)

        try {
            const response = await axios.post(`${API_BASE}/auth/login`, {
                email,
                password,
                turnstileToken
            })

            setLoading(false)

            if (response.data.success) {
                login(response.data.user)
                if (onSuccess) {
                    onSuccess()
                } else {
                    navigate("/app")
                }
            } else {
                setError(response.data.message || "Login failed")
            }
        } catch (err) {
            setLoading(false)
            const msg = err.response?.data?.message || err.message || "Connection error"
            setError(msg)
            if (enableTurnstile && window.turnstile) window.turnstile.reset()
        }
    }

    return (
        <div style={container}>
            {registered && (
                <div style={successBanner}>
                    🎉 Account created successfully! Please check your email to verify your account before signing in.
                </div>
            )}

            <h1 style={heading}>{registered ? "Welcome to Locitra" : "Welcome back"}</h1>
            <p style={sub}>Sign in to your account to continue</p>

            {error && <div style={errorBox}>{error}</div>}

            <form onSubmit={handleLogin} style={formStyle}>
                <label style={label}>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    placeholder="you@agency.com"
                    required
                />

                <label style={{ ...label, marginTop: "16px" }}>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={inputStyle}
                    placeholder="••••••••"
                    required
                />

                {enableTurnstile && (
                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
                        <div className="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
                    </div>
                )}

                <button type="submit" style={btn} disabled={loading}>
                    {loading ? "Signing in…" : "Sign In"}
                </button>
            </form>

            <div style={{ marginTop: "24px", textAlign: "center" }}>
                <p style={{ ...sub, marginBottom: "8px" }}>Didn't receive the verification email?</p>
                {resendError && <div style={{ ...errorBox, marginBottom: "8px" }}>{resendError}</div>}
                {resendSuccess && <div style={{ ...successBanner, marginBottom: "8px" }}>{resendSuccess}</div>}
                <button
                    type="button"
                    onClick={handleResendVerification}
                    style={secondaryBtn}
                    disabled={resendLoading}
                >
                    {resendLoading ? "Sending..." : "Resend Verification Email"}
                </button>
            </div>
        </div>
    )
}

const container = { width: "100%" }

const heading = {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px"
}

const sub = {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 24px"
}

const errorBox = {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "13px",
    marginBottom: "16px"
}

const successBanner = {
    background: "#e8f8ee",
    border: "1px solid #a6e3b8",
    color: "#1b7a3d",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1.5"
}

const formStyle = { display: "flex", flexDirection: "column" }

const label = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px"
}

const inputStyle = {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    color: "#0f172a",
    transition: "border-color .15s"
}

const btn = {
    marginTop: "24px",
    padding: "14px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    transition: "opacity .15s"
}

const secondaryBtn = {
    padding: "10px 14px",
    borderRadius: "8px",
    background: "transparent",
    color: "#6366f1",
    fontWeight: "600",
    fontSize: "14px",
    border: "1px solid #6366f1",
    cursor: "pointer",
    transition: "background .15s, color .15s"
}

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authRegister } from "../../services/api"
import { plans } from "../../config/plans"

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
    const enableTurnstile = import.meta.env.VITE_ENABLE_TURNSTILE === "true";

    const navigate = useNavigate()

    const [form, setForm] = useState({ email: "", password: "", companyName: "" })
    const [selectedPlan, setSelectedPlan] = useState("Free")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
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

        const res = await authRegister(form.email, form.password, form.companyName, turnstileToken, selectedPlan)
        setLoading(false)

        if (!res.success) {
            if (enableTurnstile && window.turnstile) window.turnstile.reset();
            setError(res.error || "Registration failed. Please try again.")
            return
        }

        if (onSuccess) {
            onSuccess()
        } else {
            navigate("/login?registered=true")
        }
    }

    return (
        <div style={container}>
            <h1 style={heading}>Create your account</h1>
            <p style={sub}>Start finding high-value leads in any market</p>

            {error && <div style={errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={formStyle}>
                <label style={label}>Company Name</label>
                <input
                    type="text"
                    value={form.companyName}
                    onChange={set("companyName")}
                    style={inputStyle}
                    placeholder="Your Agency Name"
                />

                <label style={{ ...label, marginTop: "16px" }}>Email</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    style={inputStyle}
                    placeholder="you@agency.com"
                    required
                />

                <label style={{ ...label, marginTop: "16px" }}>Password</label>
                <input
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    style={inputStyle}
                    placeholder="Min 6 characters"
                    minLength={6}
                    required
                />

                <div style={labelBlock}>Select your plan:</div>
                <div style={plansBox}>
                    {plans.map((plan) => (
                        <div 
                            key={plan.name}
                            onClick={() => setSelectedPlan(plan.name)}
                            style={{
                                ...planRow,
                                border: selectedPlan === plan.name ? "2px solid #6366f1" : "2px solid transparent",
                                background: selectedPlan === plan.name ? "#fff" : "transparent",
                                cursor: "pointer",
                                padding: "10px",
                                borderRadius: "10px",
                                transition: "all 0.2s"
                            }}
                        >
                            <span style={{ fontSize: "16px" }}>{plan.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>{plan.name}</span>
                                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                                        {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                                    </span>
                                </div>
                                <span style={{ fontSize: "11px", color: "#64748b" }}>
                                    {plan.scansPerDay} scans · {plan.businesses} leads
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {enableTurnstile && (
                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
                        <div className="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
                    </div>
                )}

                <button type="submit" style={btn} disabled={loading}>
                    {loading ? "Creating account…" : selectedPlan === "Free" ? "Create Free Account" : `Join ${selectedPlan} Plan`}
                </button>
            </form>
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
    color: "#0f172a"
}

const labelBlock = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginTop: "20px",
    marginBottom: "8px"
}

const plansBox = {
    marginTop: "20px",
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
}

const planRow = {
    display: "flex",
    alignItems: "center",
    gap: "10px"
}

const btn = {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    border: "none",
    cursor: "pointer"
}

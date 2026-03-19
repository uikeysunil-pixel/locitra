import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, Flame } from "lucide-react"
import { authRegister } from "../../services/api"
import { plans } from "../../config/plans"

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
    const enableTurnstile = import.meta.env.VITE_ENABLE_TURNSTILE === "true";

    const navigate = useNavigate()

    const [form, setForm] = useState({ email: "", password: "", companyName: "" })
    const [selectedPlan, setSelectedPlan] = useState("Starter") 
    const [hoveredPlan, setHoveredPlan] = useState(null)
    const [isYearly, setIsYearly] = useState(false)
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
                
                {/* Monthly / Yearly Toggle (UI Only) */}
                <div style={toggleContainer}>
                    <span style={{ ...toggleLabel, color: !isYearly ? "#0f172a" : "#64748b" }}>Monthly</span>
                    <div style={toggleSwitch} onClick={() => setIsYearly(!isYearly)}>
                        <div style={{ ...toggleBall, left: isYearly ? "22px" : "2px" }} />
                    </div>
                    <span style={{ ...toggleLabel, color: isYearly ? "#0f172a" : "#64748b" }}>
                        Yearly <span style={discountBadge}>-20%</span>
                    </span>
                </div>

                <div style={plansGrid}>
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.name;
                        const isPopular = plan.name === "Starter";
                        const displayPrice = isYearly ? Math.floor(plan.price * 0.8) : plan.price;

                        return (
                            <div 
                                key={plan.name}
                                onClick={() => setSelectedPlan(plan.name)}
                                style={{
                                    ...planCard,
                                    border: isSelected ? "2px solid #6366f1" : "2px solid #e2e8f0",
                                    boxShadow: isSelected ? "0 10px 25px -5px rgba(99, 102, 241, 0.1)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                                    position: "relative",
                                    background: "#fff"
                                }}
                                className="pricing-card-hover"
                            >
                                {isPopular && (
                                    <div style={popularBadge}>
                                        <Flame size={10} fill="currentColor" />
                                        Most Popular
                                    </div>
                                )}

                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                    <span style={{ fontSize: "20px" }}>{plan.icon}</span>
                                    <span style={planTitle}>{plan.name}</span>
                                </div>

                                <div style={priceContainer}>
                                    <span style={currencySymbol}>$</span>
                                    <span style={priceValue}>{plan.price === 0 ? "0" : displayPrice}</span>
                                    <span style={pricePeriod}>/mo</span>
                                </div>

                                <p style={planDesc}>{plan.description}</p>

                                <div style={featuresList}>
                                    <div style={featureItem}>
                                        <Check size={14} color="#10b981" />
                                        <span>{plan.scansPerDay} scans / day</span>
                                    </div>
                                    <div style={featureItem}>
                                        <Check size={14} color="#10b981" />
                                        <span>{plan.businesses} leads / scan</span>
                                    </div>
                                    {plan.features.slice(2).map((feat, i) => (
                                        <div key={i} style={featureItem}>
                                            <Check size={14} color="#10b981" />
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    type="button"
                                    style={{
                                        ...planBtn,
                                        background: isSelected ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f8fafc",
                                        color: isSelected ? "#fff" : "#475569",
                                        border: isSelected ? "none" : "1.5px solid #e2e8f0"
                                    }}
                                >
                                    {plan.name === "Free" ? "Start Free" : 
                                     plan.name === "Starter" ? "Upgrade to Starter" : "Go Agency"}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div style={trustSection}>
                    <div style={trustItem}>🔒 No credit card required</div>
                    <div style={trustItem}>✨ Cancel anytime</div>
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
    marginTop: "24px",
    padding: "16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontWeight: "800",
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
    transition: "all 0.2s"
}

/* ── New Styles ── */
const toggleContainer = { display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "20px" }
const toggleLabel = { fontSize: "13px", fontWeight: "600", color: "#64748b", transition: "all 0.2s" }
const toggleSwitch = { width: "44px", height: "24px", background: "#e2e8f0", borderRadius: "12px", position: "relative", cursor: "pointer" }
const toggleBall = { width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }
const discountBadge = { background: "#f0fdf4", color: "#166534", padding: "2px 6px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", marginLeft: "4px" }

const plansGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "10px" }
const planCard = {
    padding: "20px",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
}
const popularBadge = {
    position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
    background: "#6366f1", color: "#fff", fontSize: "10px", fontWeight: "800",
    padding: "4px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px",
    boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)", whiteSpace: "nowrap"
}
const planTitle = { fontSize: "15px", fontWeight: "800", color: "#0f172a" }
const priceContainer = { display: "flex", alignItems: "baseline", marginBottom: "4px" }
const currencySymbol = { fontSize: "16px", fontWeight: "700", color: "#0f172a" }
const priceValue = { fontSize: "32px", fontWeight: "900", color: "#0f172a", letterSpacing: "-1px" }
const pricePeriod = { fontSize: "13px", color: "#64748b", marginLeft: "2px" }
const planDesc = { fontSize: "12px", color: "#64748b", marginBottom: "16px", lineHeight: "1.4" }
const featuresList = { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", flex: 1 }
const featureItem = { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569" }
const planBtn = {
    width: "100%", padding: "10px", borderRadius: "10px", fontWeight: "700", fontSize: "12px",
    border: "none", cursor: "pointer", transition: "all 0.2s"
}

const trustSection = { display: "flex", justifyContent: "center", gap: "16px", marginTop: "20px" }
const trustItem = { fontSize: "11px", color: "#94a3b8", fontWeight: "500" }

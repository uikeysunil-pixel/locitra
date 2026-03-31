import { useState } from "react"
import useAuthStore from "../store/authStore"

const PLANS = [
    {
        id: "free",
        name: "Free",
        price: null,
        icon: "🆓",
        color: "#6366f1",
        features: ["10 credits / day", "1 credit = 1 scan", "100 businesses / scan", "CSV export", "Contact Info popup"]
    },
    {
        id: "starter",
        name: "Starter",
        price: 49,
        icon: "🚀",
        color: "#0ea5e9",
        badge: "Most Popular",
        features: ["300 credits / month", "500 businesses / scan", "Lead CRM", "AI Outreach Generator", "White-label PDF Reports"]
    },
    {
        id: "agency",
        name: "Agency",
        price: 99,
        icon: "🏢",
        color: "#8b5cf6",
        features: ["1000 credits / month", "500+ businesses / scan", "Everything in Starter", "Priority support", "Team seats (coming soon)"]
    }
]

export default function Billing() {

    const user = useAuthStore((s) => s.user)
    const [paying, setPaying] = useState(null)
    const [method, setMethod] = useState("paypal")   // "paypal" | "razorpay"

    const handlePayment = async (plan) => {
        setPaying(plan.id)
        try {
            const token = JSON.parse(localStorage.getItem("locitra-auth") || "{}")?.state?.token || ""
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/billing/${method}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ plan: plan.id, amount: plan.price })
            })
            const data = await res.json()

            if (method === "paypal" && data.approvalUrl) {
                window.location.href = data.approvalUrl
            } else if (method === "razorpay" && data.orderId) {
                launchRazorpay(data, plan, token)
            } else {
                alert("Payment gateway error. Please try again.")
            }
        } catch (err) {
            alert("Network error: " + err.message)
        }
        setPaying(null)
    }

    const launchRazorpay = (data, plan, token) => {
        if (!window.Razorpay) return alert("Razorpay SDK not loaded. Add the script tag.")
        const options = {
            key: data.keyId,
            amount: data.amount,
            currency: "USD",
            name: "Locitra",
            description: `${plan.name} Plan — $${plan.price}/mo`,
            order_id: data.orderId,
            handler: async (response) => {
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/billing/razorpay/verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ ...response, plan: plan.id })
                })
                window.location.reload()
            }
        }
        new window.Razorpay(options).open()
    }

    return (
        <div style={page}>

            <div style={header}>
                <h2 style={heading}>💳 Plans & Billing</h2>
                <p style={sub}>Upgrade your plan to unlock more credits and AI features</p>
                {user?.plan && (
                    <span style={currentPlanBadge}>
                        Current plan: <strong>{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</strong>
                    </span>
                )}
            </div>

            {/* ── Payment Method Toggle ── */}
            <div style={methodRow}>
                <span style={methodLabel}>Pay with:</span>
                <button onClick={() => setMethod("paypal")} style={methodBtn(method === "paypal")}>🅿 PayPal</button>
                <button onClick={() => setMethod("razorpay")} style={methodBtn(method === "razorpay")}>₹ Razorpay</button>
            </div>

            {/* ── Plan Cards ── */}
            <div style={plansGrid}>
                {PLANS.map(plan => {
                    const isCurrent = user?.plan === plan.id
                    return (
                        <div key={plan.id} style={planCard(plan.color, isCurrent)}>

                            {plan.badge && <div style={badgeTag(plan.color)}>{plan.badge}</div>}

                            <div style={planIcon}>{plan.icon}</div>
                            <h3 style={planName}>{plan.name}</h3>

                            <div style={priceRow}>
                                {plan.price
                                    ? <><span style={price}>${plan.price}</span><span style={perMonth}>/month</span></>
                                    : <span style={price}>Free</span>}
                            </div>

                            <ul style={featureList}>
                                {plan.features.map((f, i) => (
                                    <li key={i} style={featureItem}>✅ {f}</li>
                                ))}
                            </ul>

                            {plan.price ? (
                                <button
                                    style={upgradeBtn(plan.color, isCurrent)}
                                    disabled={isCurrent || paying === plan.id}
                                    onClick={() => !isCurrent && handlePayment(plan)}
                                >
                                    {isCurrent ? "Current Plan" : paying === plan.id ? "Processing…" : `Upgrade to ${plan.name}`}
                                </button>
                            ) : (
                                <button style={upgradeBtn(plan.color, isCurrent)} disabled>
                                    {isCurrent ? "Current Plan" : "Free Plan"}
                                </button>
                            )}

                        </div>
                    )
                })}
            </div>

        </div>
    )
}

/* ── Styles ── */
const page = { padding: "28px 24px" }
const header = { marginBottom: "24px" }
const heading = { fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }
const sub = { fontSize: "13px", color: "#64748b", margin: "4px 0 10px" }
const currentPlanBadge = { display: "inline-block", background: "#f0fdf4", color: "#166534", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" }

const methodRow = { display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }
const methodLabel = { fontSize: "13px", fontWeight: "600", color: "#374151" }
const methodBtn = (active) => ({
    padding: "8px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer",
    background: active ? "#0f172a" : "#f1f5f9", color: active ? "#fff" : "#374151",
    border: `1.5px solid ${active ? "#0f172a" : "#e2e8f0"}`
})

const plansGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }
const planCard = (color, current) => ({
    background: "#fff", borderRadius: "18px", padding: "28px 24px",
    border: `2px solid ${current ? color : "#e2e8f0"}`,
    position: "relative", boxShadow: current ? `0 0 0 4px ${color}22` : "none"
})
const badgeTag = (color) => ({
    position: "absolute", top: "14px", right: "14px",
    background: color, color: "#fff", fontSize: "10px", fontWeight: "700",
    padding: "3px 10px", borderRadius: "20px"
})
const planIcon = { fontSize: "28px", marginBottom: "10px" }
const planName = { fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }
const priceRow = { display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "16px" }
const price = { fontSize: "36px", fontWeight: "900", color: "#0f172a" }
const perMonth = { fontSize: "13px", color: "#64748b" }
const featureList = { listStyle: "none", padding: 0, margin: "0 0 20px" }
const featureItem = { fontSize: "13px", color: "#374151", marginBottom: "8px" }
const upgradeBtn = (color, current) => ({
    width: "100%", padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "14px",
    background: current ? "#f1f5f9" : color, color: current ? "#94a3b8" : "#fff",
    border: "none", cursor: current ? "default" : "pointer"
})

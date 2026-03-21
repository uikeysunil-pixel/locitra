import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import useAuthStore from "../store/authStore"

const NAV_MAIN = [
    { to: "/app", icon: "⬛", label: "Dashboard" },
    { to: "/leads", icon: "🚀", label: "Lead Generator" },
    { to: "/dashboard/market-gaps", icon: "📈", label: "Market Gaps" },
    { to: "/alerts", icon: "🔔", label: "Alerts" },
]

const NAV_MANAGEMENT = [
    { to: "/crm", icon: "📋", label: "Lead CRM" },
    { to: "/outreach", icon: "✉", label: "Outreach" },
    { to: "/reports", icon: "📊", label: "Reports" },
    { to: "/billing", icon: "💳", label: "Billing" },
]

const NAV_SEO_TOOLS = [
    { to: "/tools/google-maps-rank-checker", icon: "📍", label: "Maps Checker" },
    { to: "/tools/google-business-profile-audit", icon: "🏢", label: "GBP Audit" },
    { to: "/tools/local-competitor-finder", icon: "🔍", label: "Comp Finder" },
    { to: "/tools/review-gap-analyzer", icon: "⭐", label: "Review Gap" },
    { to: "/tools/local-opportunity-finder", icon: "💡", label: "Opp Finder" },
    { to: "/dashboard/tools/website-presence", icon: "🌐", label: "Presence Checker" },
]

export default function Sidebar() {

    const { pathname } = useLocation()
    const user = useAuthStore((s) => s.user)
    const token = useAuthStore((s) => s.token)
    const logout = useAuthStore((s) => s.logout)

    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!token) return
        const fetchUnread = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/alerts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.unreadCount !== undefined) {
                    setUnreadCount(data.unreadCount)
                }
            } catch (e) {
                console.error("Failed to fetch unread alerts", e)
            }
        }
        fetchUnread()
        // Poll every 5 minutes for new alerts
        const interval = setInterval(fetchUnread, 1000 * 60 * 5)
        return () => clearInterval(interval)
    }, [token, pathname])

    const NavItem = ({ to, icon, label }) => {
        const active = pathname === to
        const hasAlerts = label === "Alerts" && unreadCount > 0
        return (
            <li key={to}>
                <Link to={to} style={{ ...itemStyle, ...(active ? activeStyle : {}) }}>
                    <span style={iconStyle}>{icon}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {label}
                        {hasAlerts && <span title={`${unreadCount} new opportunities`} style={notificationDot} />}
                    </span>
                    {active && <span style={activeDot} />}
                </Link>
            </li>
        )
    }

    return (

        <aside style={sidebarStyle}>

            {/* Logo */}
            <div style={logoWrap}>
                <span style={logoIcon}>⚡</span>
                <span style={logoText}>Locitra</span>
                <span style={logoBadge}>AI</span>
            </div>

            {/* Navigation */}
            <nav style={navContainer} className="sidebar-nav">
                <p style={navLabel}>NAVIGATION</p>
                <ul style={menuStyle}>
                    {NAV_MAIN.map(n => <NavItem key={n.to} {...n} />)}
                </ul>

                <p style={navLabel}>MANAGEMENT</p>
                <ul style={menuStyle}>
                    {NAV_MANAGEMENT.map(n => <NavItem key={n.to} {...n} />)}
                </ul>

                <p style={navLabel}>TOOLS</p>
                <ul style={menuStyle}>
                    {NAV_SEO_TOOLS.map(n => <NavItem key={n.to} {...n} />)}
                </ul>
            </nav>

            {/* Footer */}
            <div style={footerStyle}>
                <div style={footerCard}>
                    <p style={footerTitle}>{user?.companyName || user?.email || "Locitra"}</p>
                    <p style={footerSub}>
                        Plan: <strong style={{ color: "#a5b4fc", textTransform: "capitalize" }}>{user?.plan || "free"}</strong>
                    </p>
                    <button onClick={logout} style={logoutBtn}>Sign out</button>
                </div>
            </div>

        </aside>

    )

}

/* ── Styles ──────────────────────────────────────────── */

const notificationDot = {
    width: "7px",
    height: "7px",
    background: "#ef4444",
    borderRadius: "50%",
    boxShadow: "0 0 8px rgba(239, 68, 68, 0.5)"
}

const sidebarStyle = {
    width: "var(--sidebar-w, 240px)",
    height: "100vh",
    background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100,
    borderRight: "1px solid rgba(255,255,255,0.05)",
    overflow: "hidden"
}

const logoWrap = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "28px 24px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.07)"
}

const logoIcon = {
    fontSize: "20px"
}

const logoText = {
    fontSize: "18px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.3px"
}

const logoBadge = {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 7px",
    borderRadius: "6px",
    letterSpacing: "0.05em"
}

const navLabel = {
    fontSize: "10px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: "0.1em",
    padding: "24px 24px 8px",
    textTransform: "uppercase"
}

const menuStyle = {
    listStyle: "none",
    padding: "0 12px",
    margin: 0
}

const itemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 14px",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.55)",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "4px",
    transition: "all 0.15s ease",
    position: "relative",
    textDecoration: "none"
}

const activeStyle = {
    background: "rgba(99,102,241,0.25)",
    color: "#fff",
    fontWeight: "600"
}

const iconStyle = {
    fontSize: "16px",
    width: "20px",
    textAlign: "center"
}

const activeDot = {
    width: "6px",
    height: "6px",
    background: "#6366f1",
    borderRadius: "50%",
    marginLeft: "auto"
}

const navContainer = {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "20px"
}

const footerStyle = {
    padding: "16px 12px 24px",
    borderTop: "1px solid rgba(255,255,255,0.05)"
}

const footerCard = {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "10px",
    padding: "14px 16px",
    border: "1px solid rgba(255,255,255,0.08)"
}

const footerTitle = {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "2px"
}

const footerSub = {
    color: "rgba(255,255,255,0.4)",
    fontSize: "11px"
}

const logoutBtn = {
    marginTop: "10px",
    width: "100%",
    padding: "7px",
    borderRadius: "8px",
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.25)",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
}

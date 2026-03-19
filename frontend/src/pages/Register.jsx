import { Link } from "react-router-dom"
import RegisterForm from "../components/auth/RegisterForm"

export default function Register() {
    return (
        <div style={wrapper}>
            <div style={card}>
                {/* ── Brand ── */}
                <div style={brand}>
                    <span style={brandIcon}>🔍</span>
                    <span style={brandName}>Locitra</span>
                </div>

                <RegisterForm />

                <p style={footer}>
                    Already have an account?{" "}
                    <Link to="/login" style={linkStyle}>Sign in</Link>
                </p>
            </div>
        </div>
    )
}

/* ── Styles ── */
const wrapper = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px"
}

const card = {
    background: "#fff",
    borderRadius: "20px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
}

const brand = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "28px"
}

const brandIcon = { fontSize: "28px" }

const brandName = {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.3px"
}

const footer = {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#64748b"
}

const linkStyle = {
    color: "#6366f1",
    fontWeight: "600",
    textDecoration: "none"
}

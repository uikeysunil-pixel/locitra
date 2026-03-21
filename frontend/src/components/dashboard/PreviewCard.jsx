import React from "react"

const PreviewCard = ({ title, subtitle, icon, children, badge }) => {
    return (
        <div style={cardStyle}>
            <div style={cardHeader}>
                <div style={headerLeft}>
                    {icon && <div style={iconBox}>{icon}</div>}
                    <div>
                        <h3 style={cardTitle}>{title}</h3>
                        {subtitle && <p style={cardSubtitle}>{subtitle}</p>}
                    </div>
                </div>
                {badge && <div style={badgeStyle}>{badge}</div>}
            </div>
            <div style={contentBox}>
                {children}
            </div>
        </div>
    )
}

const cardStyle = {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    height: "100%",
    display: "flex",
    flexDirection: "column"
}

const cardHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px"
}

const headerLeft = {
    display: "flex",
    alignItems: "center",
    gap: "12px"
}

const iconBox = {
    width: "40px",
    height: "40px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6366f1"
}

const cardTitle = {
    fontSize: "18px",
    fontWeight: "800",
    color: "#fff",
    margin: 0
}

const cardSubtitle = {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    margin: "2px 0 0"
}

const badgeStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#fff"
}

const contentBox = {
    flex: 1
}

export default PreviewCard

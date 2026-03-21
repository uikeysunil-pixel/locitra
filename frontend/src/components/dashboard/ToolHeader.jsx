import React from "react"

const ToolHeader = ({ title, description, action }) => {
    return (
        <div style={headerSection}>
            <div>
                <h1 style={titleStyle}>{title}</h1>
                <p style={subtitleStyle}>{description}</p>
            </div>
            {action && (
                <div style={actionWrap}>
                    {action}
                </div>
            )}
        </div>
    )
}

const headerSection = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px",
    gap: "20px",
    flexWrap: "wrap"
}

const titleStyle = {
    fontSize: "36px",
    fontWeight: "900",
    letterSpacing: "-1px",
    marginBottom: "8px",
    background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
}

const subtitleStyle = {
    fontSize: "16px",
    color: "rgba(255,255,255,0.4)",
    fontWeight: "400"
}

const actionWrap = {
    display: "flex",
    alignItems: "center",
    gap: "12px"
}

export default ToolHeader

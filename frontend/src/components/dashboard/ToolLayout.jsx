import React from "react"

const ToolLayout = ({ children }) => {
    return (
        <div style={containerStyle}>
            {children}
        </div>
    )
}

const containerStyle = {
    padding: "40px",
    maxWidth: "100%",
    margin: "0",
    background: "#0f172a",
    minHeight: "calc(100vh - 72px)",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
}

export default ToolLayout

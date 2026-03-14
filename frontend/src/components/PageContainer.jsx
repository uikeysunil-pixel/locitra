export default function PageContainer({ children, title, subtitle }) {
    return (
        <div style={outer}>

            {title && (
                <div style={header}>
                    <h1 style={titleStyle}>{title}</h1>
                    {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
                </div>
            )}

            <div style={content}>
                {children}
            </div>

        </div>
    )
}

const outer = {
    width: "100%",
    padding: "30px",
    boxSizing: "border-box"
}

const header = {
    marginBottom: "25px"
}

const titleStyle = {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#111827"
}

const subtitleStyle = {
    color: "#6b7280",
    fontSize: "14px"
}

const content = {
    maxWidth: "1200px",
    margin: "0 auto"
}
let cachedTransporter = null

function createTransporter() {
    let nodemailer
    try {
        nodemailer = require("nodemailer")
    } catch (e) {
        throw new Error("nodemailer is not installed")
    }

    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || "587", 10)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true"

    if (!host) throw new Error("Missing SMTP_HOST")
    if (!user) throw new Error("Missing SMTP_USER")
    if (!pass) throw new Error("Missing SMTP_PASS")

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
    })
}

exports.getMailer = () => {
    if (!cachedTransporter) cachedTransporter = createTransporter()
    return cachedTransporter
}

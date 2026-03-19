const { getMailer } = require("../utils/mailer")

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim())

// @route POST /api/report/send-email
// @access Private
exports.sendReportEmail = async (req, res) => {
    try {
        const {
            to,
            reportUrl,
            recipientName = "",
            companyName = "Your Agency",
            senderName = "",
            note = ""
        } = req.body || {}

        console.log("Sending email to:", to, "Report URL:", reportUrl)

        if (!isEmail(to)) {
            return res.status(400).json({ success: false, message: "A valid recipient email (to) is required." })
        }
        if (!reportUrl || typeof reportUrl !== "string") {
            return res.status(400).json({ success: false, message: "reportUrl is required." })
        }

        const from = process.env.SMTP_FROM || "no-reply@locitra.com"
        const safeCompany = String(companyName || "Your Agency").slice(0, 80)
        const safeRecipientName = String(recipientName || "").slice(0, 80)
        const safeSenderName = String(senderName || "").slice(0, 80)
        const safeNote = String(note || "").slice(0, 500)

        const subject = `${safeCompany} â€” Market Report`

        const greeting = safeRecipientName ? `Hi ${safeRecipientName},` : "Hi,"
        const signer = safeSenderName ? safeSenderName : safeCompany
        const noteBlock = safeNote
            ? `<p style="margin: 16px 0; color:#0f172a; font-size:14px; line-height:1.5;"><strong>Note:</strong> ${escapeHtml(safeNote)}</p>`
            : ""

        const html = `
<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; max-width:640px; margin:0 auto; padding:24px;">
  <h2 style="margin:0 0 8px; color:#0f172a; font-size:20px;">${escapeHtml(safeCompany)} Report</h2>
  <p style="margin:0 0 18px; color:#334155; font-size:14px; line-height:1.5;">${greeting} Hereâ€™s the market report we discussed.</p>
  ${noteBlock}
  <a href="${escapeAttr(reportUrl)}" style="display:inline-block; background:#7c3aed; color:#ffffff; text-decoration:none; padding:12px 16px; border-radius:12px; font-weight:700; font-size:14px;">View Report</a>
  <p style="margin:18px 0 0; color:#64748b; font-size:12px; line-height:1.5;">If the button doesnâ€™t work, copy and paste this link: ${escapeHtml(reportUrl)}</p>
  <p style="margin:24px 0 0; color:#0f172a; font-size:14px;">â€” ${escapeHtml(signer)}</p>
</div>`

        let transporter
        try {
            transporter = getMailer()
        } catch (e) {
            return res.status(503).json({
                success: false,
                message: "Email delivery is not configured on this server."
            })
        }
        await transporter.sendMail({
            from,
            to,
            subject,
            html
        })

        return res.json({ success: true })
    } catch (err) {
        console.error("[ReportEmail] Send error:", err)
        return res.status(500).json({
            success: false,
            message: "Failed to send email."
        })
    }
}

function escapeHtml(input) {
    return String(input || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function escapeAttr(input) {
    return escapeHtml(input).replace(/`/g, "&#96;")
}

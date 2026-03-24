const { generateAudit } = require("../services/ai/seoAuditEngine")
const { generateOutreach, generateAIColdEmail } = require("../services/ai/outreachGenerator")

// @route  POST /api/outreach/generate
// @access Private
exports.generateOutreachForLead = async (req, res) => {
    try {
        const payload = req.body

        if (!payload || !payload.name) {
            // Also check for businessName for the new API
            if (!payload.businessName) {
                return res.status(400).json({ success: false, message: "Business data required" })
            }
        }

        // New format: If AI parameters are passed, use the new API
        if (payload.businessName || payload.weakSignals) {
            const o = payload.outreach || {}
            const c = payload.contact || {}

            const aiResult = await generateAIColdEmail({
                businessName: payload.businessName || payload.name,
                industry: payload.industry,
                rating: payload.rating,
                reviews: payload.reviews,
                website: o.website || c.website || payload.website || "",
                weakSignals: payload.weakSignals,
                suggestedServices: payload.suggestedServices
            });
            return res.json({ success: true, outreach: aiResult });
        }

        // Legacy format
        const audit = generateAudit(payload)
        const outreach = generateOutreach(payload, audit)

        res.json({ success: true, audit, outreach })
    } catch (err) {
        console.error("[Outreach] generate error:", err.message)
        res.status(500).json({ success: false, message: "Failed to generate outreach" })
    }
}

// @route  POST /api/outreach/send-email
// @access Private
exports.sendEmail = async (req, res) => {
    try {
        const { to, subject, body } = req.body

        if (!to || !subject || !body) {
            return res.status(400).json({ success: false, message: "Missing email parameters" })
        }

        const apiKey = process.env.RESEND_API_KEY
        
        if (!apiKey) {
            console.log(`\n[EMAIL MOCK] Would send to: ${to}`)
            console.log(`[EMAIL MOCK] Subject: ${subject}`)
            console.log(`[EMAIL MOCK] Body:\n${body}\n`)
            // Simulate network delay
            await new Promise(r => setTimeout(r, 1000))
            return res.json({ success: true, message: "Email sent (mocked)" })
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: "Locitra <outreach@locitra.com>", // Default verified domain
                to: [to],
                subject: subject,
                text: body
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Resend API error")
        }

        res.json({ success: true, message: "Email sent successfully" })
    } catch (err) {
        console.error("[Outreach] sendEmail error:", err.message)
        res.status(500).json({ success: false, message: "Failed to send email" })
    }
}

// @route  POST /api/outreach/send-sms
// @access Private
exports.sendSms = async (req, res) => {
    try {
        const { to, message } = req.body

        if (!to || !message) {
            return res.status(400).json({ success: false, message: "Missing SMS parameters" })
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const fromNumber = process.env.TWILIO_PHONE_NUMBER
        
        if (!accountSid || !authToken || !fromNumber) {
            console.log(`\n[SMS MOCK] Would send to: ${to}`)
            console.log(`[SMS MOCK] Message:\n${message}\n`)
            // Simulate network delay
            await new Promise(r => setTimeout(r, 1000))
            return res.json({ success: true, message: "SMS sent (mocked)" })
        }

        // Twilio requires form-urlencoded data
        const params = new URLSearchParams()
        params.append("To", to)
        params.append("From", fromNumber)
        params.append("Body", message)

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base6")
            },
            body: params
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Twilio API error")
        }

        res.json({ success: true, message: "SMS sent successfully" })
    } catch (err) {
        console.error("[Outreach] sendSms error:", err.message)
        res.status(500).json({ success: false, message: "Failed to send SMS" })
    }
}

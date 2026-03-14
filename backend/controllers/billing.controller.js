const User = require("../models/user.model")

// ─── PayPal ──────────────────────────────────────────────────────────────────
// PayPal REST SDK (v1). Requires PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET in .env
// and the `@paypal/checkout-server-sdk` package to be installed.
// Scaffolded here — keys are loaded from .env, no hardcoded secrets.

const PLAN_AMOUNTS = { starter: "49.00", agency: "99.00" }

const getPayPalAccessToken = async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error("PayPal credentials not configured in .env")
    }

    const res = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
        },
        body: "grant_type=client_credentials"
    })
    const data = await res.json()
    return data.access_token
}

// @route  POST /api/billing/paypal/create
exports.createPaypalOrder = async (req, res) => {
    try {
        const { plan } = req.body
        const amount = PLAN_AMOUNTS[plan]
        if (!amount) return res.status(400).json({ success: false, message: "Invalid plan" })

        const token = await getPayPalAccessToken()
        const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
                application_context: {
                    return_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/billing?paypal=success&plan=${plan}`,
                    cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/billing`
                }
            })
        })
        const order = await orderRes.json()
        const link = order.links?.find(l => l.rel === "approve")

        res.json({ success: true, orderId: order.id, approvalUrl: link?.href })
    } catch (err) {
        console.error("[Billing] PayPal create error:", err.message)
        res.status(500).json({ success: false, message: err.message })
    }
}

// @route  POST /api/billing/paypal/verify
exports.verifyPaypalOrder = async (req, res) => {
    try {
        const { orderId, plan } = req.body
        const token = await getPayPalAccessToken()
        const capRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        })
        const capture = await capRes.json()

        if (capture.status === "COMPLETED") {
            await User.findByIdAndUpdate(req.user._id, { plan })
            res.json({ success: true, plan })
        } else {
            res.status(400).json({ success: false, message: "Payment not completed" })
        }
    } catch (err) {
        console.error("[Billing] PayPal verify error:", err.message)
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─── Razorpay ────────────────────────────────────────────────────────────────
// Requires RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in .env
// and `razorpay` npm package installed.

const getRazorpayInstance = () => {
    const Razorpay = require("razorpay")
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
}

// @route  POST /api/billing/razorpay/create
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { plan } = req.body
        const amountUSD = PLAN_AMOUNTS[plan]
        if (!amountUSD) return res.status(400).json({ success: false, message: "Invalid plan" })

        const razorpay = getRazorpayInstance()
        const order = await razorpay.orders.create({
            amount: parseFloat(amountUSD) * 100,   // Razorpay uses paise (cents)
            currency: "USD",
            receipt: `receipt_${req.user._id}_${plan}`
        })

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            keyId: process.env.RAZORPAY_KEY_ID
        })
    } catch (err) {
        console.error("[Billing] Razorpay create error:", err.message)
        res.status(500).json({ success: false, message: err.message })
    }
}

// @route  POST /api/billing/razorpay/verify
exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const crypto = require("crypto")
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body

        const expectedSig = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")

        if (expectedSig !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" })
        }

        await User.findByIdAndUpdate(req.user._id, { plan })
        res.json({ success: true, plan })
    } catch (err) {
        console.error("[Billing] Razorpay verify error:", err.message)
        res.status(500).json({ success: false, message: err.message })
    }
}

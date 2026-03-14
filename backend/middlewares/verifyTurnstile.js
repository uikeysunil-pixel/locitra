// middlewares/verifyTurnstile.js

const verifyTurnstile = async (req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
        return next();
    }

    try {
        const { turnstileToken } = req.body;

        if (!turnstileToken) {
            return res.status(400).json({ success: false, message: "Bot verification failed: Token missing" });
        }

        const secretKey = process.env.TURNSTILE_SECRET_KEY || "YOUR_SECRET_KEY";

        const formData = new URLSearchParams();
        formData.append("secret", secretKey);
        formData.append("response", turnstileToken);

        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: formData
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            return res.status(400).json({ success: false, message: "Bot verification failed" });
        }

        // Token is valid, proceed
        next();

    } catch (error) {
        console.error("Turnstile Verification Error:", error);
        return res.status(500).json({ success: false, message: "Bot verification service error" });
    }
};

module.exports = verifyTurnstile;

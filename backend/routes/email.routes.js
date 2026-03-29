const express = require("express");
const router = express.Router();

router.post("/send", async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        
        // Dynamically import the ES module since this is a CommonJS file importing an ES module
        // But wait... earlier files use require(). Let's check how the user wrote the email service.
        // The user wrote `import nodemailer from "nodemailer";` which implies the file is an ES module.
        // Let's create an ES module for the service, but the router is CommonJS. We might need to handle this.
        // Actually, let's just make the service CommonJS if the backend is CommonJS.
        const { sendEmail } = require("../services/email.service.js");
        
        await sendEmail({
            to,
            subject,
            html: `<p>${message}</p>`
        });
        
        res.json({ success: true });
    } catch (err) {
        console.error("Email send error:", err);
        res.status(500).json({ success: false, message: "Email failed" });
    }
});

module.exports = router;

const express = require("express")
const router = express.Router()
const { generateOutreachForLead, sendEmail, sendSms } = require("../controllers/outreach.controller")
const { findContact } = require("../controllers/contactFinder.controller")
const { protect } = require("../middlewares/auth.middleware")

router.post("/generate", protect, generateOutreachForLead)
router.post("/find-contact", protect, findContact)
router.post("/send-email", protect, sendEmail)
router.post("/send-sms", protect, sendSms)

module.exports = router
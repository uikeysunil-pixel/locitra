const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/auth.middleware")
const { sendReportEmail } = require("../controllers/reportEmail.controller")

router.post("/send-email", protect, sendReportEmail)

module.exports = router


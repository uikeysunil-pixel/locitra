const express = require("express")
const router = express.Router()
const { generateOutreachForLead } = require("../controllers/outreach.controller")
const { protect } = require("../middlewares/auth.middleware")

router.post("/generate", protect, generateOutreachForLead)

module.exports = router
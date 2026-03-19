const express = require("express")
const router = express.Router()

const { generateLeads } = require("../controllers/leads.controller")
const { saveLead, getMyLeads } = require("../controllers/crmLeads.controller")
const { protect } = require("../middlewares/auth.middleware")

// GET /api/leads - Default to fetching user's saved leads (CRM)
// (Legacy: use ?generate=true to call the scorer)
router.get("/", protect, (req, res, next) => {
    if (req.query.generate === "true") return generateLeads(req, res, next)
    return getMyLeads(req, res, next)
})

// POST /api/leads - Save a new lead to CRM
router.post("/", protect, saveLead)

module.exports = router
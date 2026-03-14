const express = require("express")
const router = express.Router()

const { generateLeads } = require("../controllers/leads.controller")

// GET leads
router.get("/", generateLeads)

module.exports = router
const express = require("express")
const router = express.Router()
const { saveLead, getMyLeads, updateLead, deleteLead, bulkDeleteLeads } = require("../controllers/crmLeads.controller")
const { protect } = require("../middlewares/auth.middleware")

router.use(protect)   // All CRM routes require auth

router.post("/leads/bulk-delete", bulkDeleteLeads)
router.post("/leads", saveLead)
router.get("/leads", getMyLeads)
router.patch("/leads/:id", updateLead)
router.delete("/leads/:id", deleteLead)

module.exports = router

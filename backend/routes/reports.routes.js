const express = require("express")
const router = express.Router()
const { downloadPDF, downloadCSV } = require("../controllers/reports.controller")
const { protect } = require("../middlewares/auth.middleware")

router.get("/pdf", protect, downloadPDF)
router.get("/csv", protect, downloadCSV)

module.exports = router

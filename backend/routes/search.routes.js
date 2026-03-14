const express = require("express")
const router = express.Router()

const { searchBusinesses } = require("../controllers/search.controller")

// GET /api/search?keyword=...&location=...
router.get("/", searchBusinesses)

module.exports = router
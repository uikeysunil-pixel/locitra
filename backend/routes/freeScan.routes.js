const express = require("express")
const router = express.Router()
const { freeScan } = require("../controllers/freeScan.controller")

// Public — no protect middleware intentionally
router.post("/", freeScan)

module.exports = router

const express = require("express")
const router = express.Router()

const {
    getMarketHistory,
    scanMarket
} = require("../controllers/market.controller")

const { protect } = require("../middlewares/auth.middleware")
const scanLimit = require("../middlewares/scanLimit")

router.get("/history", getMarketHistory)

// Protected scan route: Must be logged in + checks daily limit tier
router.post("/scan", protect, scanLimit, scanMarket)

module.exports = router
const express = require("express")
const router = express.Router()

const {
    getMarketHistory,
    scanMarket
} = require("../controllers/market.controller")

const { protect } = require("../middlewares/auth.middleware")
const { checkCredits } = require("../middlewares/creditMiddleware")

router.get("/history", getMarketHistory)
router.get("/business/:id", protect, (req, res, next) => {
    // We'll implement getBusinessById in market.controller.js
    const { getBusinessById } = require("../controllers/market.controller")
    return getBusinessById(req, res, next)
})

router.post("/scan", protect, checkCredits, scanMarket)

module.exports = router
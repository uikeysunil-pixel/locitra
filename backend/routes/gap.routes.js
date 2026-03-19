const express = require("express")
const router = express.Router()

const { detectMarketGap, getMarketGaps } = require("../controllers/gap.controller")

router.get("/", detectMarketGap)
router.get("/market-gaps", getMarketGaps)

module.exports = router
const express = require("express")
const router = express.Router()

const { detectMarketGap } = require("../controllers/gap.controller")

router.get("/", detectMarketGap)

module.exports = router
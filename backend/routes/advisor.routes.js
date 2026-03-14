const express = require("express")
const router = express.Router()

const { marketAdvisor } = require("../controllers/advisor.controller")

router.get("/", marketAdvisor)

module.exports = router
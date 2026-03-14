const express = require("express")
const router = express.Router()

const { getAlerts } = require("../controllers/alerts.controller")

router.get("/", getAlerts)

module.exports = router
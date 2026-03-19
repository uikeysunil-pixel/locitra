const express = require("express")
const router = express.Router()

const { protect } = require("../middlewares/auth.middleware")
const { getAlerts, markAsRead } = require("../controllers/alerts.controller")

router.get("/", protect, getAlerts)
router.put("/read", protect, markAsRead)

module.exports = router
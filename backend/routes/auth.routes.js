const express = require("express")
const router = express.Router()

const authController = require("../controllers/auth.controller")
const { protect } = require("../middlewares/auth.middleware")
const verifyTurnstile = require("../middlewares/verifyTurnstile")

// Register new user
router.post("/register", verifyTurnstile, async (req, res) => {
    return authController.registerUser(req, res)
})

// Login user
router.post("/login", verifyTurnstile, async (req, res) => {
    return authController.loginUser(req, res)
})

// Get current logged in user
router.get("/me", protect, async (req, res) => {
    return authController.getMe(req, res)
})

// Verify Email
router.get("/verify-email", async (req, res) => {
    return authController.verifyEmail(req, res)
})

// Resend Verification
router.post("/resend-verification", verifyTurnstile, async (req, res) => {
    return authController.resendVerification(req, res)
})

module.exports = router
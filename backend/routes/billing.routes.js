const express = require("express")
const router = express.Router()
const {
    createPaypalOrder,
    verifyPaypalOrder,
    createRazorpayOrder,
    verifyRazorpayPayment
} = require("../controllers/billing.controller")
const { protect } = require("../middlewares/auth.middleware")

router.use(protect)

router.post("/paypal/create", createPaypalOrder)
router.post("/paypal/verify", verifyPaypalOrder)
router.post("/razorpay/create", createRazorpayOrder)
router.post("/razorpay/verify", verifyRazorpayPayment)

module.exports = router

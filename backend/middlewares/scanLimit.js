const User = require("../models/user.model")
const plans = require("../config/plans")

const scanLimit = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authorized" })
        }

        // Bypassing for admin
        if (req.user.role === "admin") {
            return next()
        }

        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const planConfig = plans[user.plan] || plans.free
        const now = new Date()

        // Reset logic if new day boundary is crossed
        if (!user.scanResetDate || now > user.scanResetDate) {
            user.dailyScanUsed = 0;
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            user.scanResetDate = tomorrow;
            await user.save();
        }

        if (user.dailyScanUsed >= planConfig.scansPerDay) {
            return res.status(403).json({
                success: false,
                message: "Daily scan limit reached. Please upgrade your plan."
            })
        }

        // Attach plan config to request for downstream controllers
        req.planConfig = planConfig;

        next()

    } catch (error) {
        console.error("Scan Limit Middleware Error:", error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

module.exports = scanLimit

const User = require("../models/user.model")

exports.checkScanLimit = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authorized" })
        }

        // Bypassing for admin
        if (req.user.role === "admin") {
            return next()
        }

        const user = await User.findById(req.user.id)

        // Reset daily scans if it's a new day
        const now = new Date()
        const lastScan = user.lastScanDate ? new Date(user.lastScanDate) : null

        if (
            !lastScan ||
            now.toDateString() !== lastScan.toDateString()
        ) {
            user.scansToday = 0
            user.lastScanDate = now
        }

        // Apply plan limits
        let scanLimit = 0
        if (user.plan === "free") scanLimit = 2
        if (user.plan === "starter") scanLimit = 20
        if (user.plan === "agency") scanLimit = 999999

        if (user.scansToday >= scanLimit) {
            return res.status(403).json({
                success: false,
                message: `Daily scan limit reached for ${user.plan} plan. Please upgrade.`
            })
        }

        // Increment scan count and save
        user.scansToday += 1
        user.lastScanDate = now
        await user.save()

        next()

    } catch (error) {
        console.error("Limit Check Error:", error.message)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

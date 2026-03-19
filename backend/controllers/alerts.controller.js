const OpportunityAlert = require("../models/opportunityAlert.model")

exports.getAlerts = async (req, res) => {
    try {
        const userId = req.user.id
        const alerts = await OpportunityAlert.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50)

        const unreadCount = await OpportunityAlert.countDocuments({ userId, isRead: false })

        res.json({
            alerts,
            unreadCount
        })
    } catch (error) {
        console.error("[getAlerts] Error:", error)
        res.status(500).json({ error: "Alerts fetch failed" })
    }
}

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id
        await OpportunityAlert.updateMany({ userId, isRead: false }, { isRead: true })
        res.json({ success: true })
    } catch (error) {
        console.error("[markAsRead] Error:", error)
        res.status(500).json({ error: "Failed to update alerts" })
    }
}
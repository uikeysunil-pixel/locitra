const User = require("../models/user.model");

const PLAN_CREDITS = {
    free: 10,
    starter: 300,
    agency: 1000
};

const isNewDay = (lastReset, now) => {
    if (!lastReset) return true;
    const last = new Date(lastReset);
    return last.getDate() !== now.getDate() ||
           last.getMonth() !== now.getMonth() ||
           last.getFullYear() !== now.getFullYear();
};

const isNewMonth = (lastReset, now) => {
    if (!lastReset) return true;
    const last = new Date(lastReset);
    return last.getMonth() !== now.getMonth() ||
           last.getFullYear() !== now.getFullYear();
};

const resetCreditsIfNeeded = (user) => {
    const now = new Date();
    const currentPlan = user.plan || "free";
    const creditsToAssign = PLAN_CREDITS[currentPlan] || PLAN_CREDITS.free;
    
    let shouldReset = false;

    if (currentPlan === "free") {
        if (isNewDay(user.lastCreditReset, now)) {
            shouldReset = true;
        }
    } else {
        if (isNewMonth(user.lastCreditReset, now)) {
            shouldReset = true;
        }
    }

    if (shouldReset) {
        user.credits = creditsToAssign;
        user.lastCreditReset = now;
    }
};

const checkCredits = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        // Admin bypass
        if (req.user.role === "admin") {
            return next();
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        resetCreditsIfNeeded(user);

        // Ensure newly registered users get initialized credits immediately even if not handled in auth.controller
        if (user.credits === 0 && user.lastCreditReset === undefined) {
             user.credits = PLAN_CREDITS[user.plan] || PLAN_CREDITS.free;
             user.lastCreditReset = new Date();
        }

        if (user.isModified("credits") || user.isModified("lastCreditReset")) {
            await user.save();
        }

        if (user.credits <= 0) {
            return res.status(403).json({
                success: false,
                message: "No credits left. Please upgrade your plan."
            });
        }

        req.dbUser = user;
        
        next();

    } catch (error) {
        console.error("Credit Middleware Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { checkCredits, resetCreditsIfNeeded, PLAN_CREDITS };

const User = require("../models/user.model")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { sendVerificationEmail } = require("../services/email.service")
const disposableDomains = require("../utils/disposableDomains")

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || "locitra_dev_secret",
        { expiresIn: "30d" }
    )
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {

    try {

        const { email, password, companyName } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            })
        }

        const emailDomain = email.split("@")[1].toLowerCase()

        if (disposableDomains.includes(emailDomain)) {
            return res.status(400).json({
                success: false,
                message: "Disposable email addresses are not allowed. Please use a real email."
            })
        }

        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;

        const count = await User.countDocuments({
            registerIP: ip,
            createdAt: { $gte: Date.now() - 24 * 60 * 60 * 1000 }
        })

        if (count >= 3) {
            return res.status(429).json({
                success: false,
                message: "Too many accounts created from this network. Please try again later."
            })
        }

        const userExists = await User.findOne({ email })

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        const token = crypto.randomBytes(32).toString("hex")

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        const user = await User.create({
            email,
            password,
            companyName: companyName || "",
            plan: "free",
            emailVerificationToken: token,
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
            registerIP: ip,
            scanResetDate: tomorrow
        })

        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`
        await sendVerificationEmail(user.email, verificationLink)

        return res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                companyName: user.companyName,
                plan: user.plan,
                token: generateToken(user._id)
            }
        })

    } catch (error) {

        console.error("Register Error:", error)

        return res.status(500).json({
            success: false,
            message: "Server error"
        })

    }

}


// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {

    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        if (!user.emailVerified) {
            return res.status(401).json({
                success: false,
                message: "Please verify your email before logging in."
            })
        }

        return res.json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                companyName: user.companyName,
                plan: user.plan,
                token: generateToken(user._id)
            }
        })

    } catch (error) {

        console.error("Login Error:", error)

        return res.status(500).json({
            success: false,
            message: "Server error"
        })

    }

}


// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {

    try {

        const user = await User
            .findById(req.user.id)
            .select("-password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.json({
            success: true,
            user
        })

    } catch (error) {

        console.error("GetMe Error:", error)

        return res.status(500).json({
            success: false,
            message: "Server error"
        })

    }

}

// @desc    Verify user email
// @route   GET /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: "Invalid or missing token" });
        }

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        return res.json({ success: true, message: "Email successfully verified" });

    } catch (error) {
        console.error("Verify Email Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide an email" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.emailVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified" });
        }

        const token = crypto.randomBytes(32).toString("hex");

        user.emailVerificationToken = token;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
        await sendVerificationEmail(user.email, verificationLink);

        return res.json({ success: true, message: "Verification email sent" });

    } catch (error) {
        console.error("Resend Verification Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
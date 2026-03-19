const rateLimit = {};

/**
 * Simple IP-based rate limiter to prevent abuse of public endpoints.
 * Limits to 5 requests per IP per hour.
 */
const publicRateLimiter = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (!rateLimit[ip]) {
        rateLimit[ip] = [];
    }

    // Clean up old requests outside the 1-hour window
    rateLimit[ip] = rateLimit[ip].filter(timestamp => now - timestamp < oneHour);

    if (rateLimit[ip].length >= 5) {
        console.warn(`[RateLimiter] Blocked IP: ${ip} (Limit exceeded)`);
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again in an hour or create a free account."
        });
    }

    rateLimit[ip].push(now);
    next();
};

module.exports = publicRateLimiter;

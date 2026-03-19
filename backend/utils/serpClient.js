const axios = require("axios")

const SERP_DELAY = 1000 // 1 second delay between calls to protect quota
let lastCallTime = 0
let quotaExceeded = false

// Stats tracking
let totalCallsToday = 0
let totalCallsThisMonth = 0

/**
 * Centralized SerpAPI client with rate limiting and quota protection.
 */
async function serpRequest(params) {
    if (quotaExceeded) {
        console.warn("[SerpClient] skipping call: quota previously exceeded")
        return null
    }

    // Rate limiting: wait if too soon
    const now = Date.now()
    const waitTime = Math.max(0, lastCallTime + SERP_DELAY - now)
    if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    try {
        console.log(`[SerpClient] SERP call executed: ${params.engine || 'google'}`)
        const response = await axios.get("https://serpapi.com/search.json", {
            params: {
                ...params,
                api_key: process.env.SERPAPI_KEY
            },
            timeout: 15000
        })

        lastCallTime = Date.now()
        totalCallsToday++
        totalCallsThisMonth++
        
        return response.data

    } catch (error) {
        if (error.response) {
            const status = error.response.status
            const errorMsg = error.response.data?.error || ""
            
            if (status === 429 || errorMsg.toLowerCase().includes("quota exceeded")) {
                console.error("[SerpClient] ❌ QUOTA EXCEEDED")
                quotaExceeded = true
                return null
            }
        }
        
        console.error(`[SerpClient] Request failed: ${error.message}`)
        return null
    }
}

/**
 * Reset quota flag (e.g., on new request context or daily reset)
 */
function resetQuota() {
    quotaExceeded = false
}

function getUsage() {
    return {
        today: totalCallsToday,
        month: totalCallsThisMonth
    }
}

module.exports = { serpRequest, resetQuota, getUsage }

import { getCachedData, setCachedData } from "../utils/apiCache"

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

console.log("API Base URL:", API_BASE)

/* ── Token helper ─────────────────────────────────────────
   Reads the JWT from the Zustand-persisted localStorage key.
   This avoids importing authStore here (circular dep risk).
 ──────────────────────────────────────────────────────────── */
const getToken = () => {
    try {
        const raw = localStorage.getItem("locitra-auth")
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return parsed?.state?.token || null
    } catch {
        return null
    }
}

/* ---------------- Query Builder ---------------- */

const buildQuery = (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, value)
        }
    })
    return query.toString() ? `?${query.toString()}` : ""
}

/* ---------------- Core Fetch Helper ---------------- */

const fetchJSON = async (
    endpoint,
    params = {},
    options = {}
) => {
    const {
        method = "GET",
        body = null,
        headers = {},
        skipAuth = false
    } = options

    const url =
        method === "GET"
            ? `${API_BASE}${endpoint}${buildQuery(params)}`
            : `${API_BASE}${endpoint}`

    const authHeaders = {}
    if (!skipAuth) {
        const token = getToken()
        if (token) authHeaders["Authorization"] = `Bearer ${token}`
    }

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...authHeaders,
                ...headers
            },
            body: body ? JSON.stringify(body) : undefined
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                error: data.message || data.error || "API request failed"
            }
        }

        return {
            success: true,
            data
        }
    } catch (error) {
        console.error("API request failed:", url, error)
        return {
            success: false,
            error: error.message || "Network error"
        }
    }
}

/* ---------------- Auth ---------------------------------------- */

export const authLogin = (email, password, turnstileToken) => {
    const body = { email, password }
    if (turnstileToken) body.turnstileToken = turnstileToken
    return fetchJSON("/auth/login", {}, {
        method: "POST",
        body,
        skipAuth: true
    })
}

export const authRegister = (email, password, companyName, turnstileToken, plan = "Free") => {
    const body = { email, password, companyName, plan }
    if (turnstileToken) body.turnstileToken = turnstileToken
    return fetchJSON("/auth/register", {}, {
        method: "POST",
        body,
        skipAuth: true
    })
}

export const authResendVerification = (email, turnstileToken) => {
    const body = { email }
    if (turnstileToken) body.turnstileToken = turnstileToken
    return fetchJSON("/auth/resend-verification", {}, {
        method: "POST",
        body,
        skipAuth: true
    })
}

export const fetchMe = () => fetchJSON("/auth/me")

/* ---------------- Dashboard ---------------- */

export const fetchDashboard = async (keyword, location) => {
    // Normalize input
    const normalizedKeyword = (keyword || "").toLowerCase().trim()
    const normalizedLocation = (location || "").toLowerCase().trim()

    const cacheKey = `scan_dashboard_${normalizedKeyword}_${normalizedLocation}`
    const cached = getCachedData(cacheKey)

    if (cached) {
        console.log("Using cached dashboard results for:", normalizedKeyword, normalizedLocation)
        return { success: true, data: cached }
    }

    console.log("Fetching fresh dashboard data from backend for:", normalizedKeyword, normalizedLocation)
    const result = await fetchJSON("/dashboard", {
        keyword: normalizedKeyword,
        location: normalizedLocation
    })

    if (result.success) {
        setCachedData(cacheKey, result.data)
    }

    return result
}

/* ---------------- Alerts ---------------- */

export const fetchAlerts = () => fetchJSON("/alerts")

/* ---------------- Market History ---------------- */

export const fetchMarketHistory = (keyword, location) =>
    fetchJSON("/market/history", { keyword, location })

/* ---------------- Market Scanner ---------------- */

export const scanMarket = async (keyword, location, forceRefresh = false) => {
    // Normalize input
    const normalizedKeyword = (keyword || "").toLowerCase().trim()
    const normalizedLocation = (location || "").toLowerCase().trim()

    return fetchJSON(
        "/market/scan",
        {},
        {
            method: "POST",
            body: { keyword: normalizedKeyword, location: normalizedLocation, forceRefresh }
        }
    )
}

export const fetchBusinessById = (id) => fetchJSON(`/market/business/${id}`)

/* ---------------- Market Gaps ---------------- */

export const fetchMarketGaps = (keyword) =>
    fetchJSON("/gaps", { keyword })

/* ---------------- AI Advisor ---------------- */

export const fetchAdvisor = (averageReviews, marketDifficulty) =>
    fetchJSON("/advisor", { averageReviews, marketDifficulty })

/* ---------------- Lead Discovery ---------------- */

export const fetchLeads = async (keyword, location) => {
    // Normalize input
    const normalizedKeyword = (keyword || "").toLowerCase().trim()
    const normalizedLocation = (location || "").toLowerCase().trim()

    const cacheKey = `scan_leads_${normalizedKeyword}_${normalizedLocation}`
    const cached = getCachedData(cacheKey)

    if (cached) {
        console.log("Using cached lead results for:", normalizedKeyword, normalizedLocation)
        return { success: true, data: cached }
    }

    console.log("Fetching fresh lead data from backend for:", normalizedKeyword, normalizedLocation)
    const result = await fetchJSON("/leads", {
        keyword: normalizedKeyword,
        location: normalizedLocation
    })

    if (result.success) {
        setCachedData(cacheKey, result.data)
    }

    return result
}

/* ---------------- CRM Leads ---------------- */

export const saveLead = (business) =>
    fetchJSON("/crm/leads", {}, { method: "POST", body: business })

export const fetchMyLeads = () => fetchJSON("/crm/leads")

export const fetchLeadById = (id) => fetchJSON(`/crm/leads/${id}`)

export const updateLead = (id, patch) =>
    fetchJSON(`/crm/leads/${id}`, {}, { method: "PATCH", body: patch })

export const deleteLead = (id) =>
    fetchJSON(`/crm/leads/${id}`, {}, { method: "DELETE" })

export const bulkDeleteLeads = (ids) =>
    fetchJSON("/crm/leads/bulk-delete", {}, { method: "POST", body: { ids } })

/* ---------------- Analytics ---------------- */

export const fetchAnalytics = () => fetchJSON("/analytics")

/* ---------------- Reports ---------------- */

export const downloadReport = (format, params = {}) => {
    const token = getToken()
    const query = new URLSearchParams(params).toString()
    const url = `${API_BASE}/reports/${format}${query ? "?" + query : ""}`
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `locitra-report.${format}`)
    link.href = `${url}${query ? "&" : "?"}token=${token}`
    document.body.appendChild(link)
    link.click()
    link.remove()
}

export const enrichSingleLead = (leadId) =>
    fetchJSON(`/enrich/${leadId}`, {}, { method: "POST" })

export const generateAIOutreachEmail = (data) =>
    fetchJSON('/outreach/generate', {}, { method: "POST", body: data })

export const sendEmailToLead = (data) =>
    fetchJSON('/email/send', {}, { method: "POST", body: data })
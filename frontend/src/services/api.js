const API_BASE = "http://localhost:5000/api"

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

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
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
        skipAuth = false      // set true for login/register calls
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

export const authLogin = (email, password, turnstileToken) =>
    fetchJSON("/auth/login", {}, {
        method: "POST",
        body: { email, password, turnstileToken },
        skipAuth: true
    })

export const authRegister = (email, password, companyName, turnstileToken) =>
    fetchJSON("/auth/register", {}, {
        method: "POST",
        body: { email, password, companyName, turnstileToken },
        skipAuth: true
    })

export const authResendVerification = (email, turnstileToken) =>
    fetchJSON("/auth/resend-verification", {}, {
        method: "POST",
        body: { email, turnstileToken },
        skipAuth: true
    })

export const fetchMe = () => fetchJSON("/auth/me")

/* ---------------- Dashboard ---------------- */

export const fetchDashboard = (keyword, location) => {

    return fetchJSON("/dashboard", {
        keyword,
        location
    })

}

/* ---------------- Alerts ---------------- */

export const fetchAlerts = () => {

    return fetchJSON("/alerts")

}

/* ---------------- Market History ---------------- */

export const fetchMarketHistory = (keyword, location) => {

    return fetchJSON("/market/history", {
        keyword,
        location
    })

}

/* ---------------- Market Scanner ---------------- */

export const scanMarket = (keyword, location) => {

    return fetchJSON(
        "/market/scan",
        {},
        {
            method: "POST",
            body: { keyword, location }
        }
    )

}

/* ---------------- Market Gaps ---------------- */

export const fetchMarketGaps = (keyword) => {

    return fetchJSON("/gaps", {
        keyword
    })

}

/* ---------------- AI Advisor ---------------- */

export const fetchAdvisor = (
    averageReviews,
    marketDifficulty
) => {

    return fetchJSON("/advisor", {
        averageReviews,
        marketDifficulty
    })

}

/* ---------------- Lead Discovery ---------------- */

export const fetchLeads = (keyword, location) => {

    return fetchJSON("/leads", {
        keyword,
        location
    })

}

/* ---------------- CRM Leads ---------------- */

export const saveLead = (business) =>
    fetchJSON("/crm/leads", {}, { method: "POST", body: business })

export const fetchMyLeads = () => fetchJSON("/crm/leads")

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
    // Include token as query param for file downloads (no fetch headers on anchor)
    link.href = `${url}${query ? "&" : "?"}token=${token}`
    document.body.appendChild(link)
    link.click()
    link.remove()
}

export const enrichSingleLead = (leadId) =>
    fetchJSON(`/enrich/${leadId}`, {}, { method: "POST" })

export const generateAIOutreachEmail = (data) =>
    fetchJSON('/outreach/generate', {}, { method: "POST", body: data })
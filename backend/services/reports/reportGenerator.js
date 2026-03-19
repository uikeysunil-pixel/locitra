/**
 * reportGenerator.js
 * Professional SaaS-style PDF + CSV report exporter.
 * Mimics BrightLocal / Semrush clean layout logic.
 * Uses ONLY live dashboard scanResults.
 */

const PDFDocument = require("pdfkit")
const axios = require("axios")
const { OpenAI } = require("openai")

function normalizeHexColor(input) {
    if (!input) return null
    const raw = String(input).trim()
    if (!raw) return null
    const hex = raw.startsWith("#") ? raw : `#${raw}`
    return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : null
}

async function fetchImageBuffer(url) {
    const u = String(url || "").trim()
    if (!u) return null
    if (!/^https?:\/\//i.test(u)) return null
    try {
        const res = await axios.get(u, { responseType: "arraybuffer", timeout: 9000 })
        return res.data
    } catch (e) {
        console.warn("Logo fetch error:", e.message)
        return null
    }
}

async function generateAIExecutiveSummary({
    avgRating,
    avgReviews,
    competitors,
    opportunities,
    keyword,
    city
}) {
    if (!process.env.OPENAI_API_KEY) return null
    let openai
    try {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    } catch (_) {
        return null
    }

    const model = process.env.OPENAI_PDF_SUMMARY_MODEL || "gpt-4o-mini"
    const safeCompetitors = Array.isArray(competitors) ? competitors.filter(Boolean).slice(0, 6) : []
    const prompt = [
        "Write a concise executive summary for a white-label local market report PDF.",
        "Style: professional, client-facing, confident but not hypey.",
        "Length: 4-6 short sentences, then 3 bullet points (use '-' bullets).",
        "Do not mention tools, datasets, or how the report was generated.",
        "",
        `Market: ${city || "Market"} | Keyword: ${keyword || "Businesses"}`,
        `Average rating: ${avgRating}`,
        `Average reviews: ${avgReviews}`,
        `Competitors (top by rank): ${safeCompetitors.join(", ") || "N/A"}`,
        `Opportunities: ${JSON.stringify(opportunities || {})}`
    ].join("\n")

    try {
        const completion = await openai.chat.completions.create({
            model,
            temperature: 0.4,
            max_tokens: 260,
            messages: [{ role: "user", content: prompt }]
        })

        const text = completion?.choices?.[0]?.message?.content
        if (!text) return null
        return String(text).trim()
    } catch (e) {
        console.warn("AI executive summary error:", e.message)
        return null
    }
}

async function fetchChartBuffer(
    chartConfig,
    { width = 900, height = 520, devicePixelRatio = 2, version = "4" } = {}
) {
    try {
        const res = await axios.post("https://quickchart.io/chart", {
            chart: chartConfig,
            format: "png",
            width,
            height,
            devicePixelRatio,
            version,
            backgroundColor: "white"
        }, { responseType: "arraybuffer" })
        return res.data
    } catch (e) {
        console.error("Chart generation error:", e.message)
        return null
    }
}

/* ── Helper styles ────────────────────────────────────────── */
const C_DARK = "#0f172a"
const C_MUTED = "#64748b"
const C_LIGHT = "#f1f5f9"
const C_PURPLE = "#7c3aed"
const C_TEAL = "#14b8a6"
const C_YELLOW = "#f59e0b"
const C_BRAND = C_PURPLE
const C_GREEN = "#10b981"
const C_RED = "#ef4444"

/* ── PDF Generator ────────────────────────────────────────── */
exports.generatePDF = async (savedLeads_DEPRECATED, options, res) => {
    try {
        const {
            companyName = "Your Agency",
            customMessage = "",
            keyword = "Businesses",
            city = "Market",
            logoUrl = "",
            primaryColor = "",
            scanResults = []
        } = options

        const businesses = scanResults

        if (!businesses || businesses.length === 0) {
            throw new Error("No scan results available.")
        }

        const BRAND_PRIMARY = normalizeHexColor(primaryColor) || C_BRAND
        const requestedWhiteLabel = Boolean(String(logoUrl || "").trim() || String(primaryColor || "").trim())
        const logoBuffer = await fetchImageBuffer(logoUrl)
        const isWhiteLabel = requestedWhiteLabel

        const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true })

        doc.on("error", (err) => {
            console.error("[ReportGenerator] PDFKit stream error:", err)
            try {
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: "PDF stream error",
                        details: err?.message || String(err)
                    })
                } else {
                    res.end()
                }
            } catch (_) {
                // best-effort: avoid throwing inside stream error handler
            }
        })

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="Locitra-Report-${city || "Market"}.pdf"`
        )

        doc.pipe(res)

        const PAGE_MARGIN = 50
        const HEADER_H = 34
        const FOOTER_H = 52
        const CONTENT_W = doc.page.width - PAGE_MARGIN * 2
        const contentTopY = () => PAGE_MARGIN + (headerEnabled ? HEADER_H + 12 : 0)
        const contentBottomY = () => doc.page.height - FOOTER_H - 18

        const checkPage = (heightNeeded) => {
            if (doc.y + heightNeeded > contentBottomY()) doc.addPage()
        }

        let headerEnabled = false
        const drawBrandedHeader = () => {
            if (!headerEnabled) return
            const x = PAGE_MARGIN
            const y = PAGE_MARGIN
            const w = CONTENT_W

            doc.save()
            doc.rect(0, 0, doc.page.width, PAGE_MARGIN + HEADER_H).fill("#ffffff")
            doc.rect(x, y + HEADER_H - 3, w, 3).fill(BRAND_PRIMARY)

            const brandTextX = x
            const brandTextY = y + 8
            const rightW = 140
            const textW = w - rightW - 10

            doc.fill(C_DARK).fontSize(10).font("Helvetica-Bold").text(companyName, brandTextX, brandTextY, {
                width: textW,
                lineBreak: false,
                ellipsis: true
            })

            if (logoBuffer) {
                try {
                    doc.image(logoBuffer, x + w - rightW, y + 5, { fit: [rightW, HEADER_H - 10], align: "right", valign: "center" })
                } catch (_) {
                    // ignore invalid logo formats
                }
            }
            doc.restore()

            doc.y = Math.max(doc.y, contentTopY())
        }

        doc.on("pageAdded", () => {
            drawBrandedHeader()
        })

        const addSectionTitle = (title, subtitle = "") => {
            checkPage(140)
            doc.y = Math.max(doc.y, contentTopY())

            doc.fill(C_MUTED).fontSize(10).font("Helvetica-Bold").text("SECTION", PAGE_MARGIN, doc.y)
            doc.moveDown(0.4)
            doc.fill(C_DARK).fontSize(22).font("Helvetica-Bold").text(title, PAGE_MARGIN, doc.y, { width: CONTENT_W })

            if (subtitle) {
                doc.moveDown(0.2)
                doc.fill(C_MUTED).fontSize(11).font("Helvetica").text(subtitle, PAGE_MARGIN, doc.y, { width: CONTENT_W })
            }

            doc.moveDown(0.7)
            doc.rect(PAGE_MARGIN, doc.y, CONTENT_W, 2).fill(BRAND_PRIMARY)
            doc.moveDown(1.2)
        }

        const drawMetricCard = ({ x, y, w, h, label, value, valueColor = C_DARK, hint = "" }) => {
            doc.save()
            doc.roundedRect(x, y, w, h, 14).fillAndStroke("#ffffff", "#e2e8f0")
            doc.fill(C_MUTED).fontSize(9).font("Helvetica-Bold").text(String(label || "").toUpperCase(), x + 14, y + 12, { width: w - 28 })
            doc.fill(valueColor).fontSize(22).font("Helvetica-Bold").text(String(value ?? ""), x + 14, y + 30, { width: w - 28 })
            if (hint) {
                doc.fill(C_MUTED).fontSize(9).font("Helvetica").text(String(hint), x + 14, y + 56, { width: w - 28 })
            }
            doc.restore()
        }

        const drawCallout = ({ x, y, w, h = 68, title, body, accent = BRAND_PRIMARY }) => {
            const pad = 14
            doc.save()
            doc.roundedRect(x, y, w, h, 14).fillAndStroke("#f8fafc", "#e2e8f0")
            doc.rect(x, y, 6, h).fill(accent)
            doc.fill(C_DARK).fontSize(11).font("Helvetica-Bold").text(title, x + pad + 6, y + 12, { width: w - (pad * 2) - 6 })
            doc.fill(C_MUTED).fontSize(10).font("Helvetica").text(body, x + pad + 6, y + 30, { width: w - (pad * 2) - 6, lineGap: 3 })
            doc.restore()
        }

        const drawChartCard = ({
            title,
            subtitle = "",
            chartBuffer,
            insightTitle,
            insightBody,
            accent = BRAND_PRIMARY
        }) => {
            const pad = 14
            const headerH = subtitle ? 48 : 40
            const imgH = 220
            const insightH = 72
            const innerGap = 12
            const cardH = headerH + imgH + innerGap + insightH + 18
            checkPage(cardH + 10)

            const cardX = PAGE_MARGIN
            const cardW = CONTENT_W
            const chartW = cardW - pad * 2
            const y = doc.y

            doc.save()
            doc.roundedRect(cardX, y, cardW, cardH, 16).fillAndStroke("#ffffff", "#e2e8f0")
            doc.fill(C_DARK).fontSize(12).font("Helvetica-Bold").text(title, cardX + pad, y + 12, { width: chartW })
            if (subtitle) {
                doc.fill(C_MUTED).fontSize(10).font("Helvetica").text(subtitle, cardX + pad, y + 30, { width: chartW, lineGap: 2 })
            }

            const chartX = cardX + pad
            const chartY = y + headerH

            if (chartBuffer) {
                doc.image(chartBuffer, chartX, chartY, { fit: [chartW, imgH], align: "center", valign: "center" })
            } else {
                doc.roundedRect(chartX, chartY, chartW, imgH, 12).fillAndStroke("#f8fafc", "#e2e8f0")
                doc.fill(C_MUTED).fontSize(11).font("Helvetica").text("Chart unavailable", chartX, chartY + 96, { width: chartW, align: "center" })
            }

            const insightY = chartY + imgH + innerGap
            drawCallout({
                x: chartX,
                y: insightY,
                w: chartW,
                h: insightH,
                title: insightTitle,
                body: insightBody,
                accent
            })
            doc.restore()

            doc.y = y + cardH + 18
        }

        /* ────────────────────────────────────────────────────────
           1. COVER PAGE
        ──────────────────────────────────────────────────────── */
        const coverHeaderH = 300
        const generatedDate = new Date().toLocaleDateString("en-US", { dateStyle: "long" })

        doc.rect(0, 0, doc.page.width, coverHeaderH).fill(C_DARK)

        // Vertically balanced cover header
        const coverTop = 78
        const coverBrandName = isWhiteLabel ? companyName : "LOCITRA"

        if (isWhiteLabel && logoBuffer) {
            try {
                doc.image(logoBuffer, PAGE_MARGIN, coverTop - 4, { fit: [180, 56], align: "left", valign: "center" })
            } catch (_) {
                doc.fill("#ffffff").fontSize(40).font("Helvetica-Bold").text(coverBrandName, PAGE_MARGIN, coverTop)
            }
        } else {
            doc.fill("#ffffff").fontSize(42).font("Helvetica-Bold").text(coverBrandName, PAGE_MARGIN, coverTop)
        }

        doc.fill(BRAND_PRIMARY).fontSize(12).font("Helvetica-Bold").text("MARKET INTELLIGENCE REPORT", PAGE_MARGIN, coverTop + 54)
        doc.rect(PAGE_MARGIN, coverTop + 76, 44, 4).fill(BRAND_PRIMARY)

        doc.fill("#ffffff").fontSize(26).font("Helvetica-Bold").text(`${keyword.toUpperCase()} MARKET ANALYSIS`, PAGE_MARGIN, coverTop + 112, { width: CONTENT_W })
        doc.fill("#94a3b8").fontSize(16).font("Helvetica").text(`${city}`, PAGE_MARGIN, coverTop + 146, { width: CONTENT_W })

        // Cover meta block
        doc.y = coverHeaderH + 42
        const metaY = doc.y
        const half = (CONTENT_W - 16) / 2

        doc.fill(C_DARK).fontSize(12).font("Helvetica-Bold").text("Prepared for", PAGE_MARGIN, metaY, { width: half })
        doc.fill(C_MUTED).fontSize(16).font("Helvetica-Bold").text(companyName, PAGE_MARGIN, metaY + 16, { width: half })

        doc.fill(C_DARK).fontSize(12).font("Helvetica-Bold").text("Date generated", PAGE_MARGIN + half + 16, metaY, { width: half })
        doc.fill(C_MUTED).fontSize(12).font("Helvetica").text(generatedDate, PAGE_MARGIN + half + 16, metaY + 18, { width: half })

        doc.y = metaY + 54

        if (customMessage) {
            // Dynamic box sizing prevents text from being cut off
            doc.font("Helvetica").fontSize(10)
            const msgWidth = CONTENT_W - 28
            const msgHeight = doc.heightOfString(customMessage, { width: msgWidth, lineGap: 3 })
            const boxH = Math.min(msgHeight, 220) + 44

            // If it doesn't fit on the cover page, continue on a new page
            if (doc.y + boxH > contentBottomY()) {
                doc.addPage()
                addSectionTitle("Client Message", "Continuation from the cover page")
            }

            const boxY = doc.y
            doc.roundedRect(PAGE_MARGIN, boxY, CONTENT_W, boxH, 14).fillAndStroke("#ffffff", "#e2e8f0")
            doc.fill(C_DARK).fontSize(12).font("Helvetica-Bold").text("Introduction", PAGE_MARGIN + 14, boxY + 14, { width: CONTENT_W - 28 })
            doc.fill(C_MUTED).fontSize(10).font("Helvetica").text(customMessage, PAGE_MARGIN + 14, boxY + 34, { width: CONTENT_W - 28, lineGap: 3 })
            doc.y = boxY + boxH + 12
        }

        doc.addPage()

        /* ────────────────────────────────────────────────────────
           CALCULATIONS & METRICS
        ──────────────────────────────────────────────────────── */
        const totalBusinesses = businesses.length
        const totalRating = businesses.reduce((acc, b) => acc + (b.rating || 0), 0)
        const totalReviews = businesses.reduce((acc, b) => acc + (b.reviews || 0), 0)
        
        const avgRating = totalBusinesses > 0 ? (totalRating / totalBusinesses).toFixed(1) : 0
        const avgReviews = totalBusinesses > 0 ? Math.round(totalReviews / totalBusinesses) : 0
        
        const highOppCount = businesses.filter(b => (b.opportunityScore || 0) >= 70).length
        const noWebsite = businesses.filter(b => !b.website).length
        const lowReviews = businesses.filter(b => (b.reviews || 0) < 30).length
        const lowRatingCount = businesses.filter(b => b.rating && b.rating < 4.0).length

        let difficulty = "Medium"
        if (totalBusinesses > 0) {
            const highOppPct = highOppCount / totalBusinesses
            if (highOppPct < 0.2) difficulty = "High"
            else if (highOppPct > 0.5) difficulty = "Low"
        }

        const top10 = businesses.slice(0, 10)
        const top10NoWeb = top10.filter(b => !b.website).length
        const top10AvgReviews = Math.round(top10.reduce((acc, b) => acc + (b.reviews || 0), 0) / 10)

        /* ────────────────────────────────────────────────────────
           2. MARKET OVERVIEW
        ──────────────────────────────────────────────────────── */
        headerEnabled = true
        drawBrandedHeader()

        addSectionTitle("Executive Summary", `${city} - ${keyword}`)

        const competitorsForSummary = [...businesses]
            .sort((a, b) => (a.rank || 99) - (b.rank || 99))
            .slice(0, 5)
            .map((b) => String(b.name || "").trim())
            .filter(Boolean)

        const opportunitiesForSummary = {
            highOpportunity: highOppCount,
            noWebsite,
            lowReviews,
            lowRating: lowRatingCount,
            marketDifficulty: difficulty
        }

        const fallbackExecutiveSummary =
            `This ${city} market scan covers ${totalBusinesses} ${keyword.toLowerCase()} businesses with an average rating of ${avgRating} and about ${avgReviews} reviews.\n` +
            `The market difficulty is ${difficulty}, with the biggest near-term wins concentrated in website coverage and review velocity.\n` +
            (competitorsForSummary.length ? `Top-ranked competitors include: ${competitorsForSummary.join(", ")}.\n` : "") +
            `\n- Prioritize website + review initiatives to improve visibility\n- Start outreach with high-opportunity targets first\n- Regenerate this report monthly to track movement`

        const aiExecutiveSummary = await generateAIExecutiveSummary({
            avgRating,
            avgReviews,
            competitors: competitorsForSummary,
            opportunities: opportunitiesForSummary,
            keyword,
            city
        })

        const executiveSummaryText = aiExecutiveSummary || fallbackExecutiveSummary
        doc.font("Helvetica").fontSize(10)
        const summaryBodyW = CONTENT_W - (14 * 2) - 6
        const summaryH = Math.min(doc.heightOfString(executiveSummaryText, { width: summaryBodyW, lineGap: 3 }) + 46, 230)
        checkPage(summaryH + 10)
        const summaryY = doc.y
        drawCallout({
            x: PAGE_MARGIN,
            y: summaryY,
            w: CONTENT_W,
            h: summaryH,
            title: "Executive Summary",
            body: executiveSummaryText,
            accent: BRAND_PRIMARY
        })
        doc.y = summaryY + summaryH + 18

        const GAP_SUM = 14
        const cardW = (CONTENT_W - GAP_SUM) / 2
        const cardH = 80
        const difficultyColor = difficulty === "Low" ? C_GREEN : (difficulty === "High" ? C_RED : "#f59e0b")
        const y0 = doc.y

        drawMetricCard({ x: PAGE_MARGIN, y: y0, w: cardW, h: cardH, label: "Businesses analyzed", value: totalBusinesses })
        drawMetricCard({ x: PAGE_MARGIN + cardW + GAP_SUM, y: y0, w: cardW, h: cardH, label: "Average rating", value: avgRating })
        drawMetricCard({ x: PAGE_MARGIN, y: y0 + cardH + GAP_SUM, w: cardW, h: cardH, label: "Average reviews", value: avgReviews })
        drawMetricCard({
            x: PAGE_MARGIN + cardW + GAP_SUM,
            y: y0 + cardH + GAP_SUM,
            w: cardW,
            h: cardH,
            label: "Market difficulty",
            value: difficulty,
            valueColor: difficultyColor,
            hint: "Based on opportunity density"
        })

        doc.y = y0 + cardH * 2 + GAP_SUM * 2 + 18

        doc.fill(C_DARK).fontSize(14).font("Helvetica-Bold").text("Key Findings", PAGE_MARGIN, doc.y)
        doc.moveDown(0.6)

        const findings = []
        if (noWebsite > 0) findings.push(`${noWebsite} businesses currently lack a website.`)
        if (lowReviews > 0) findings.push(`${lowReviews} businesses have fewer than 30 reviews.`)
        if (lowRatingCount > 0) findings.push(`${lowRatingCount} businesses have ratings below 4.0.`)
        if (top10NoWeb > 0) findings.push(`${top10NoWeb} of the top 10 businesses rank without a website.`)
        findings.push(`Top performers average ${top10AvgReviews} reviews.`)

        findings.forEach((t) => {
            checkPage(22)
            const y = doc.y
            doc.fill(C_DARK).fontSize(10).font("Helvetica").text("-", PAGE_MARGIN, y)
            doc.fill(C_DARK).fontSize(10).font("Helvetica").text(t, PAGE_MARGIN + 12, y, { width: CONTENT_W - 12, lineGap: 2 })
            doc.y = doc.y + 6
        })

        doc.addPage()

        addSectionTitle("Market Overview", "At-a-glance market health metrics")

        const ovCardH = 78
        const ovY = doc.y
        drawMetricCard({ x: PAGE_MARGIN, y: ovY, w: cardW, h: ovCardH, label: "Businesses analyzed", value: totalBusinesses })
        drawMetricCard({ x: PAGE_MARGIN + cardW + GAP_SUM, y: ovY, w: cardW, h: ovCardH, label: "High opportunity (>=70)", value: highOppCount, valueColor: C_GREEN })
        drawMetricCard({ x: PAGE_MARGIN, y: ovY + ovCardH + GAP_SUM, w: cardW, h: ovCardH, label: "Average rating", value: avgRating })
        drawMetricCard({ x: PAGE_MARGIN + cardW + GAP_SUM, y: ovY + ovCardH + GAP_SUM, w: cardW, h: ovCardH, label: "Average reviews", value: avgReviews })
        drawMetricCard({ x: PAGE_MARGIN, y: ovY + (ovCardH + GAP_SUM) * 2, w: cardW, h: ovCardH, label: "No website", value: noWebsite, valueColor: C_RED })
        drawMetricCard({ x: PAGE_MARGIN + cardW + GAP_SUM, y: ovY + (ovCardH + GAP_SUM) * 2, w: cardW, h: ovCardH, label: "Low reviews (<30)", value: lowReviews, valueColor: "#f59e0b" })

        doc.y = ovY + (ovCardH + GAP_SUM) * 3 + 16
        drawCallout({
            x: PAGE_MARGIN,
            y: doc.y,
            w: CONTENT_W,
            h: 72,
            title: "What this means",
            body: "Website coverage and review velocity are the highest-leverage actions for visible ranking gains. Use these cards to frame the opportunity in a single slide.",
            accent: BRAND_PRIMARY
        })
        doc.y = doc.y + 92

        /* â”€â”€ Branded Charts + Insight Blocks â”€â”€ */
        doc.addPage()
        addSectionTitle("Market Insights", "Branded charts for fast client scanning")

        const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0)
        const hasWebsite = Math.max(totalBusinesses - noWebsite, 0)

        const oppLow = businesses.filter(b => (b.opportunityScore || 0) < 40).length
        const oppMed = businesses.filter(b => (b.opportunityScore || 0) >= 40 && (b.opportunityScore || 0) < 70).length
        const oppHigh = highOppCount

        const chartCommon = {
            options: {
                responsive: false,
                animation: false,
                plugins: {
                    legend: { display: false }
                }
            }
        }

        const gapsChartConfig = {
            type: "bar",
            data: {
                labels: ["No Website", "Low Reviews", "Low Rating", "High Opp."],
                datasets: [{
                    label: "Count",
                    data: [noWebsite, lowReviews, lowRatingCount, highOppCount],
                    backgroundColor: [C_TEAL, C_YELLOW, C_RED, BRAND_PRIMARY],
                    borderRadius: 10,
                    barThickness: 42
                }]
            },
            options: {
                ...chartCommon.options,
                scales: {
                    x: { grid: { display: false }, ticks: { color: C_DARK, font: { size: 11 } } },
                    y: { beginAtZero: true, ticks: { precision: 0, color: C_MUTED }, grid: { color: "#e2e8f0" } }
                }
            }
        }

        const oppMixChartConfig = {
            type: "bar",
            data: {
                labels: ["High (>=70)", "Medium (40-69)", "Low (<40)"],
                datasets: [{
                    label: "Businesses",
                    data: [oppHigh, oppMed, oppLow],
                    backgroundColor: [C_TEAL, C_YELLOW, C_RED],
                    borderRadius: 10,
                    barThickness: 28
                }]
            },
            options: {
                ...chartCommon.options,
                indexAxis: "y",
                scales: {
                    x: { beginAtZero: true, ticks: { precision: 0, color: C_MUTED }, grid: { color: "#e2e8f0" } },
                    y: { grid: { display: false }, ticks: { color: C_DARK, font: { size: 11 } } }
                }
            }
        }

        const websiteDonutConfig = {
            type: "doughnut",
            data: {
                labels: ["Has Website", "No Website"],
                datasets: [{
                    data: [hasWebsite, noWebsite],
                    backgroundColor: [BRAND_PRIMARY, C_RED],
                    borderWidth: 0
                }]
            },
            options: {
                ...chartCommon.options,
                cutout: "68%",
                plugins: {
                    legend: { display: true, position: "bottom", labels: { boxWidth: 12, color: C_DARK } }
                }
            }
        }

        const [gapsChartBuf, oppMixChartBuf, websiteDonutBuf] = await Promise.all([
            fetchChartBuffer(gapsChartConfig, { width: 900, height: 420 }),
            fetchChartBuffer(oppMixChartConfig, { width: 900, height: 420 }),
            fetchChartBuffer(websiteDonutConfig, { width: 700, height: 520 })
        ])

        drawChartCard({
            title: "Gap Snapshot",
            subtitle: "Where the easiest wins are concentrated",
            chartBuffer: gapsChartBuf,
            insightTitle: "Insight",
            insightBody: `${pct(noWebsite, totalBusinesses)}% lack a website and ${pct(lowReviews, totalBusinesses)}% have fewer than 30 reviews. Lead with web + reviews to move rankings fastest.`,
            accent: BRAND_PRIMARY
        })

        drawChartCard({
            title: "Opportunity Score Mix",
            subtitle: "Segment the market by outreach readiness",
            chartBuffer: oppMixChartBuf,
            insightTitle: "Insight",
            insightBody: `${oppHigh} businesses (${pct(oppHigh, totalBusinesses)}%) score 70+ — these are the highest-probability outreach targets. Use the medium bucket for nurture sequences.`,
            accent: C_TEAL
        })

        drawChartCard({
            title: "Website Coverage",
            subtitle: "How much of the market is already web-ready",
            chartBuffer: websiteDonutBuf,
            insightTitle: "Insight",
            insightBody: `${hasWebsite} businesses (${pct(hasWebsite, totalBusinesses)}%) already have a website. Position SEO-first offers here, and website-first packages for the remaining ${noWebsite}.`,
            accent: C_YELLOW
        })

        /* ────────────────────────────────────────────────────────
           3. COMPETITION INSIGHTS (RANKING TABLE)
        ──────────────────────────────────────────────────────── */
        doc.addPage()
        addSectionTitle("Competition Insights", "Top ranked competitors in the market")

        doc.fill(C_MUTED).fontSize(10).font("Helvetica").text(
            "Top 15 businesses by rank. The top 3 rows are highlighted for fast scanning.",
            PAGE_MARGIN,
            doc.y,
            { width: CONTENT_W }
        )
        doc.moveDown(1)

        const tableX = PAGE_MARGIN
        const tableW = CONTENT_W
        const tableRowH = 24
        const cols = [
            { label: "Rank", w: 44, align: "center" },
            { label: "Business", w: 240, align: "left" },
            { label: "Rating", w: 54, align: "center" },
            { label: "Reviews", w: 62, align: "center" },
            { label: "Website", w: tableW - (44 + 240 + 54 + 62), align: "left" }
        ]

        const drawTableHeader = () => {
            const y = doc.y
            doc.roundedRect(tableX, y, tableW, 28, 10).fill(C_DARK)
            doc.fill("#ffffff").fontSize(10).font("Helvetica-Bold")
            let xx = tableX
            cols.forEach((c) => {
                doc.text(c.label, xx + 8, y + 8, { width: c.w - 16, align: c.align })
                xx += c.w
            })
            doc.y = y + 34
        }

        drawTableHeader()

        const topCompetitors = [...businesses].sort((a, b) => (a.rank || 99) - (b.rank || 99)).slice(0, 15)

        topCompetitors.forEach((lead, idx) => {
            if (doc.y + tableRowH > contentBottomY()) {
                doc.addPage()
                addSectionTitle("Competition Insights", "Top ranked competitors in the market")
                drawTableHeader()
            }

            const bg = idx < 3 ? "#fef9c3" : (idx % 2 === 0 ? "#f8fafc" : "#ffffff")
            doc.rect(tableX, doc.y, tableW, tableRowH).fill(bg)
            doc.rect(tableX, doc.y, tableW, tableRowH).stroke("#e2e8f0")

            let xx = tableX
            const rankText = String(lead.rank || idx + 1)
            doc.fill(C_DARK).fontSize(9).font(idx < 3 ? "Helvetica-Bold" : "Helvetica")
                .text(rankText, xx + 8, doc.y + 7, { width: cols[0].w - 16, align: cols[0].align })
            xx += cols[0].w

            const name = (lead.name || "Unknown").slice(0, 60)
            doc.fill(C_DARK).fontSize(9).font(idx < 3 ? "Helvetica-Bold" : "Helvetica")
                .text(name, xx + 8, doc.y + 7, { width: cols[1].w - 16, align: cols[1].align })
            xx += cols[1].w

            doc.fill(C_DARK).fontSize(9).font("Helvetica")
                .text(String(lead.rating || "N/A"), xx + 8, doc.y + 7, { width: cols[2].w - 16, align: cols[2].align })
            xx += cols[2].w

            doc.fill(C_DARK).fontSize(9).font("Helvetica")
                .text(String(lead.reviews || 0), xx + 8, doc.y + 7, { width: cols[3].w - 16, align: cols[3].align })
            xx += cols[3].w

            doc.fill(lead.website ? C_GREEN : C_RED).fontSize(9).font("Helvetica")
                .text(lead.website ? "Website Found" : "No Website", xx + 8, doc.y + 7, { width: cols[4].w - 16, align: cols[4].align })

            doc.y += tableRowH
        })

        doc.addPage()

        /* ────────────────────────────────────────────────────────
           4. OPPORTUNITY INSIGHTS
        ──────────────────────────────────────────────────────── */
        addSectionTitle("Opportunity Insights", "Structured gaps and quick wins you can act on")

        const GAP_INS = 14
        const colW = (CONTENT_W - GAP_INS) / 2
        const insightRowH = 82
        const startY = doc.y

        const cards = []
        if (noWebsite > 0) cards.push({ title: "Website coverage", body: `${noWebsite} businesses lack a website. A modern site + local SEO can create fast ranking gains.`, accent: C_RED })
        if (lowReviews > 0) cards.push({ title: "Review velocity", body: `${lowReviews} businesses have fewer than 30 reviews. Closing the trust gap improves conversion and map visibility.`, accent: "#f59e0b" })
        if (lowRatingCount > 0) cards.push({ title: "Reputation risk", body: `${lowRatingCount} businesses are rated below 4.0. Reputation management can unlock rank movement.`, accent: "#ef4444" })

        if (top10NoWeb > 0) cards.push({ title: "Top-10 vulnerability", body: `${top10NoWeb} of the top 10 rank without a website. Strong execution can displace incumbents.`, accent: BRAND_PRIMARY })
        const benchmark = { title: "Market entry benchmark", body: `Top performers average ${top10AvgReviews} reviews. Beating this number is a simple growth target for share capture.`, accent: C_GREEN }

        let cursorY = startY
        for (let i = 0; i < cards.length; i += 2) {
            doc.y = cursorY
            checkPage(insightRowH + 10)
            cursorY = doc.y
            const left = cards[i]
            const right = cards[i + 1]

            drawCallout({ x: PAGE_MARGIN, y: cursorY, w: colW, h: 68, title: left.title, body: left.body, accent: left.accent })
            if (right) {
                drawCallout({ x: PAGE_MARGIN + colW + GAP_INS, y: cursorY, w: colW, h: 68, title: right.title, body: right.body, accent: right.accent })
            }
            cursorY = cursorY + insightRowH
        }

        doc.y = cursorY
        checkPage(86)
        cursorY = doc.y
        drawCallout({ x: PAGE_MARGIN, y: cursorY, w: CONTENT_W, h: 72, title: benchmark.title, body: benchmark.body, accent: benchmark.accent })
        doc.y = cursorY + 92

        /* ────────────────────────────────────────────────────────
           5. TOP BUSINESSES (OPPORTUNITY LEADS)
        ──────────────────────────────────────────────────────── */
        doc.addPage()
        addSectionTitle("Top Businesses (Opportunity Leads)", "Targets prioritized by opportunity score")
        
        doc.fill(C_MUTED).fontSize(10).font("Helvetica")
            .text("Highlighting businesses with high growth potential through improved SEO and reputation.", PAGE_MARGIN, doc.y, { width: CONTENT_W })
        doc.moveDown(1)

        const topTargets = [...businesses]
            .filter(b => (b.opportunityScore || 0) >= 50)
            .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
            .slice(0, 5)

        if (!topTargets || topTargets.length === 0) {
            drawCallout({
                x: PAGE_MARGIN,
                y: doc.y,
                w: CONTENT_W,
                h: 72,
                title: "No high-opportunity targets found",
                body: "This scan did not surface targets above the current threshold. Try broadening the keyword/city scope or regenerate after collecting more data.",
                accent: BRAND_PRIMARY
            })
            doc.y = doc.y + 92
        } else {
            topTargets.forEach((target, i) => {
                checkPage(72)
                const y = doc.y
                doc.roundedRect(PAGE_MARGIN, y, CONTENT_W, 56, 14).fillAndStroke("#f0fdf4", "#e2e8f0")
                doc.fill(C_DARK).fontSize(12).font("Helvetica-Bold")
                    .text(`${i + 1}. ${String(target.name || "Unknown").slice(0, 70)}`, PAGE_MARGIN + 16, y + 14, { width: CONTENT_W - 32 })
                doc.fill(C_MUTED).fontSize(10).font("Helvetica")
                    .text(
                        `Opportunity Score: ${target.opportunityScore || 0}/100  |  ${target.reviews || 0} Reviews  |  Rating: ${target.rating || 0}`,
                        PAGE_MARGIN + 16,
                        y + 34,
                        { width: CONTENT_W - 32 }
                    )
                doc.y = y + 72
            })
        }

        /* ────────────────────────────────────────────────────────
           6. RECOMMENDED ACTIONS
        ──────────────────────────────────────────────────────── */
        doc.addPage()
        addSectionTitle("Recommended Actions", "A simple execution plan to win market share")

        const actions = [
            { title: "Website Development", desc: "Build professional, SEO-optimized websites for local businesses lacking an online presence." },
            { title: "Reviews & Reputation", desc: "Implement review generation sequences to bridge the social proof gap identified in several players." },
            { title: "Local SEO Strategy", desc: "Optimize Google Maps profiles to help underperforming businesses climb into the top 3 spots." },
            { title: "Lead Outreach", desc: "Contact the identified 'Target Businesses' with this report to demonstrate expertise and opportunity." }
        ]

        const GAP_ACT = 14
        const actionColW = (CONTENT_W - GAP_ACT) / 2
        const actionCardH = 78
        let actionCursorY = doc.y

        const drawActionCard = (action, x, y) => {
            doc.roundedRect(x, y, actionColW, actionCardH, 14).fillAndStroke("#ffffff", "#e2e8f0")
            doc.fill(BRAND_PRIMARY).fontSize(11).font("Helvetica-Bold").text(action.title, x + 14, y + 14, { width: actionColW - 28 })
            doc.fill(C_MUTED).fontSize(10).font("Helvetica").text(action.desc, x + 14, y + 34, { width: actionColW - 28, lineGap: 3 })
        }

        for (let i = 0; i < actions.length; i += 2) {
            doc.y = actionCursorY
            checkPage(actionCardH + GAP_ACT + 10)
            actionCursorY = doc.y

            const left = actions[i]
            const right = actions[i + 1]
            drawActionCard(left, PAGE_MARGIN, actionCursorY)
            if (right) drawActionCard(right, PAGE_MARGIN + actionColW + GAP_ACT, actionCursorY)

            actionCursorY = actionCursorY + actionCardH + GAP_ACT
        }

        doc.y = actionCursorY + 10

        /* CTA page (new) */
        doc.addPage()
        addSectionTitle("Next Steps", "Turn insight into action")

        doc.fill(C_MUTED).fontSize(11).font("Helvetica").text(
            "Use this final page as a client-facing close. Keep the message clear: what you found, what you will do, and what success looks like.",
            PAGE_MARGIN,
            doc.y,
            { width: CONTENT_W, lineGap: 3 }
        )
        doc.moveDown(1.2)

        const steps = [
            "1) Confirm priorities (website, reviews, SEO) based on this market snapshot.",
            "2) Run outreach to the top targets using this report as proof of opportunity.",
            "3) Track wins month-over-month and regenerate this report to show progress."
        ]
        steps.forEach((t) => {
            checkPage(22)
            doc.fill(C_DARK).fontSize(10).font("Helvetica").text(t, PAGE_MARGIN, doc.y, { width: CONTENT_W, lineGap: 2 })
            doc.moveDown(0.4)
        })

        doc.moveDown(1)
        const ctaY = doc.y
        doc.roundedRect(PAGE_MARGIN, ctaY, CONTENT_W, 92, 16).fill(C_DARK)
        if (isWhiteLabel) {
            doc.fill("#ffffff").fontSize(16).font("Helvetica-Bold").text("Ready to act on these insights?", PAGE_MARGIN + 16, ctaY + 18, { width: CONTENT_W - 32 })
            doc.fill("#cbd5e1").fontSize(11).font("Helvetica").text(`Use this report to guide outreach and implementation with ${companyName}.`, PAGE_MARGIN + 16, ctaY + 42, { width: CONTENT_W - 32 })
            doc.roundedRect(PAGE_MARGIN + 16, ctaY + 62, 220, 22, 11).fill(BRAND_PRIMARY)
            doc.fill("#ffffff").fontSize(10).font("Helvetica-Bold").text("Schedule Next Step", PAGE_MARGIN + 16, ctaY + 68, { width: 220, align: "center" })
        } else {
            doc.fill("#ffffff").fontSize(16).font("Helvetica-Bold").text("Want this report branded for your clients?", PAGE_MARGIN + 16, ctaY + 18, { width: CONTENT_W - 32 })
            doc.fill("#cbd5e1").fontSize(11).font("Helvetica").text("Generate, share, and export in seconds inside Locitra.", PAGE_MARGIN + 16, ctaY + 42, { width: CONTENT_W - 32 })
            
            // Draw Button
            doc.roundedRect(PAGE_MARGIN + 16, ctaY + 62, 220, 24, 6).fill(BRAND_PRIMARY)
            doc.fill("#ffffff").fontSize(10).font("Helvetica-Bold").text("Continue in Locitra", PAGE_MARGIN + 16, ctaY + 69, { width: 220, align: "center" })
            
            // Make Clickable
            doc.link(PAGE_MARGIN + 16, ctaY + 62, 220, 24, "https://locitra.com")
            
            doc.fill("#cbd5e1").fontSize(9).font("Helvetica").text("locitra.com", PAGE_MARGIN, ctaY + 70, { width: CONTENT_W - 16, align: "right" })
        }
        doc.y = ctaY + 110

        /* ── Footer ──────────────────────────────────── */
        const range = doc.bufferedPageRange()
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i)
            const footerY = doc.page.height - FOOTER_H
            // PDFKit will auto-add pages if `text()` is placed below the current page's bottom margin.
            // Our footer is intentionally drawn at the bottom edge, so temporarily relax margins to
            // prevent blank pages from being appended during footer rendering.
            const prevBottomMargin = doc.page && doc.page.margins ? doc.page.margins.bottom : undefined
            if (doc.page && doc.page.margins) doc.page.margins.bottom = 0

            doc.rect(0, footerY, doc.page.width, FOOTER_H).fill(C_DARK)
            doc.fill("#ffffff").fontSize(9).font("Helvetica")
                .text(
                    isWhiteLabel
                        ? `(c) ${new Date().getFullYear()} ${companyName}`
                        : `(c) ${new Date().getFullYear()} ${companyName} - Powered by Locitra`,
                    PAGE_MARGIN,
                    footerY + 18,
                    { width: doc.page.width - PAGE_MARGIN * 2, align: "left", lineBreak: false, ellipsis: true }
                )
            doc.fill("#ffffff").fontSize(9).font("Helvetica")
                .text(`Page ${i + 1} of ${range.count}`, PAGE_MARGIN, footerY + 18, { width: doc.page.width - PAGE_MARGIN * 2, align: "right", lineBreak: false })

            if (doc.page && doc.page.margins && typeof prevBottomMargin === "number") doc.page.margins.bottom = prevBottomMargin
        }

        doc.end()
    } catch (err) {
        console.error("[ReportGenerator] PDF generation failed error:", err)
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                message: "Internal PDF generation engine error",
                details: err.message
            });
        }
    }
}

/* ── CSV Generator ────────────────────────────────────────── */
exports.generateCSV = (scanResults) => {

    const columns = [
        "Rank", "Business Name", "Rating", "Reviews", "Website", "Phone", "Address", "Opportunity Score"
    ]
    
    const mapLeadData = (l, idx) => {
        return [
            l.rank || idx + 1,
            l.name || "",
            l.rating || "",
            l.reviews || "",
            l.website || "",
            l.phone || "",
            l.address || "",
            l.opportunityScore || 0
        ]
    }

    const esc = (v) => {
        if (v == null) return ""
        const s = String(v)
        return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s
    }

    const header = columns.join(",")
    const rows = (scanResults || []).map((b, i) => mapLeadData(b, i).map(val => esc(val)).join(","))

    return [header, ...rows].join("\n")
}

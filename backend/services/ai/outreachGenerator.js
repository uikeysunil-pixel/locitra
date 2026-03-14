/**
 * outreachGenerator.js
 * Template-driven outreach message generator.
 * Takes a business object + SEO audit flags and returns three message types.
 */

const { OpenAI } = require("openai");

/**
 * @param {object} business - Business data from scanner
 * @param {object} audit    - From seoAuditEngine.generateAudit()
 * @returns {{ email: string, callScript: string, linkedinDM: string }}
 */
exports.generateOutreach = (business, audit) => {

    const name = business.name || "your business"
    const city = business.city || business.location || "your area"
    const topFlag = audit.flags[0] || "opportunities to improve your online presence"
    const urgency = audit.urgency || "Medium"

    /* ── Pick strongest hook from audit flags ────── */
    const hook = !business.website
        ? `I noticed that ${name} doesn't have a website`
        : business.reviews < 30
            ? `I noticed that ${name} has very few Google reviews`
            : `I was researching businesses in ${city} and noticed ${name} has some local SEO gaps`

    /* ── Cold Email ──────────────────────────────── */
    const email = `Subject: Quick question about ${name}'s online presence

Hi there,

${hook}, which is costing you potential customers every single day.

In our experience working with local businesses in ${city}, this is one of the fastest wins available — and it's exactly the type of problem we fix.

We help businesses like yours:
✅ Get found on Google Maps
✅ Build reviews that convert callers
✅ Turn your online presence into a lead machine

Would you be open to a free 15-minute call this week to walk through what's possible for ${name}?

Best,
[Your Name]
[Your Agency]
[Your Phone]`

    /* ── Phone Call Script ───────────────────────── */
    const callScript = `--- COLD CALL SCRIPT ---

INTRO:
"Hi, is this the owner or manager of ${name}? Great —
 my name is [Your Name] from [Your Agency].
 I'll keep this quick — do you have 60 seconds?"

HOOK:
"I was researching local ${business.category || "businesses"} in ${city} this week
 and I noticed ${hook.toLowerCase()}.
 That could be costing you $3,000 to $10,000 in revenue every month."

VALUE:
"We specialise in fixing exactly this for local businesses —
 usually within 30 days — and we offer a free audit to start."

ASK:
"Would you be open to hopping on a quick 15-minute call this week?
 I can show you exactly what your competitors are doing that you're not."

OBJECTION — "We're not interested":
"Totally fair — would it be okay if I sent you a free written report
 so you can see the gaps yourself? No obligation."

CLOSE:
"What's the best email to send that to?"`

    /* ── LinkedIn DM ─────────────────────────────── */
    const linkedinDM = `Hi [First Name],

I came across ${name} while researching ${business.category || "local businesses"} in ${city}.

${hook} — which is something I help local businesses fix quickly.

I put together a quick audit — would it be okay to send it over?

[Your Name]`

    return {
        email,
        callScript,
        linkedinDM,
        urgency,
        topFlag
    }
}

/**
 * Generate highly personalized cold email via OpenAI
 */
exports.generateAIColdEmail = async ({
    businessName,
    industry,
    rating,
    reviews,
    website,
    weakSignals,
    suggestedServices
}) => {
    let openai;
    try {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } catch (e) {
        console.warn("OpenAI not configured, falling back to static template.");
        return {
            subject: `Quick idea to help ${businessName || "your business"} attract more customers`,
            emailBody: `Hi,\n\nI noticed that ${businessName || "your business"} currently has only ${reviews || "a few"} Google reviews, which may make it harder for new customers to trust the business.\n\nWe help local businesses improve review generation and local search visibility.\n\nWould you be open to a quick 10-minute chat this week?\n\nBest,\nYour Name`,
            callToAction: "Reply to this email"
        };
    }

    const prompt = `
Generate a personalized cold outreach email for a local business lead.
Business Name: ${businessName}
Industry: ${industry || 'Local Business'}
Rating: ${rating || 'N/A'}
Reviews: ${reviews || 0}
Website: ${website ? website : 'None'}
Weak Signals: ${Array.isArray(weakSignals) ? weakSignals.join(', ') : weakSignals || 'Low reviews / low rating'}
Suggested Services: ${Array.isArray(suggestedServices) ? suggestedServices.join(', ') : suggestedServices || 'Review generation'}

Email requirements:
- Highly personalized based on their weak signals
- Short (100-150 words)
- Friendly tone
- Clear value proposition
- Simple Call To Action (CTA)

Respond with exactly a JSON object having "subject", "emailBody", and "callToAction". Do not add markdown backticks around the json.
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        });

        const content = completion.choices[0].message.content.trim();
        const jsonStr = content.startsWith('\`\`\`')
            ? content.replace(/^\`\`\`json\s*/i, '').replace(/\`\`\`$/, '')
            : content;

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("OpenAI Outreach Gen Error:", error.message);
        return {
            subject: `Quick idea to help ${businessName || "your business"} attract more customers`,
            emailBody: `Hi,\n\nI noticed that ${businessName || "your business"} could improve its online presence to earn more trust.\n\nWe help local businesses improve review generation and local search visibility.\n\nWould you be open to a quick 10-minute chat this week?\n\nBest,\nYour Name`,
            callToAction: "Reply to this email"
        };
    }
};

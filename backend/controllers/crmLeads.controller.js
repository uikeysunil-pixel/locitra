const Lead = require("../models/lead.model")

/* Compute a priority score from enriched lead data */
const computePriorityScore = (b) => {
    let score = b.opportunityScore || 0
    if (b.reviews < 30) score += 20
    if (b.rating < 4.0) score += 15
    if (!b.website) score += 25
    return Math.min(score, 160)   // cap at 160
}

// @route  POST /api/crm/leads
// @access Private
exports.saveLead = async (req, res) => {
    try {
        const b = req.body

        // Avoid duplicate saves per user + business name
        const existing = await Lead.findOne({ userId: req.user._id, name: b.name, city: b.city || b.location })
        if (existing) return res.json({ success: true, lead: existing, duplicate: true })

        const lead = await Lead.create({
            userId: req.user._id,
            keyword: b.keyword || "",
            city: b.city || b.location || "",
            name: b.name || "",
            rating: b.rating || 0,
            reviews: b.reviews || 0,
            website: b.website || "",
            phone: b.phone || "",
            email: b.email || "",
            contactPage: b.contactPage || "",
            facebook: b.facebook || "",
            instagram: b.instagram || "",
            linkedin: b.linkedin || "",
            address: b.address || "",
            opportunityScore: b.opportunityScore || 0,
            priorityScore: computePriorityScore(b),
            outreach: b.outreach || {},
            contact: b.contact || {},
            status: "New"
        })

        res.status(201).json({ success: true, lead })
    } catch (err) {
        console.error("[CRM] saveLead error:", err.message)
        res.status(500).json({ success: false, message: "Failed to save lead" })
    }
}

// @route  GET /api/crm/leads/:id
// @access Private
exports.getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findOne({ _id: req.params.id, userId: req.user._id })
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" })
        res.json({ success: true, lead })
    } catch (err) {
        console.error("[CRM] getLeadById error:", err.message)
        res.status(500).json({ success: false, message: "Failed to fetch lead" })
    }
}

// @route  GET /api/crm/leads
// @access Private
exports.getMyLeads = async (req, res) => {
    try {
        const query = req.user.role === 'admin' 
            ? { $or: [{ userId: req.user._id }, { userId: null }] } 
            : { userId: req.user._id }

        const leads = await Lead.find(query)
            .sort({ priorityScore: -1, createdAt: -1 })
            .lean()

        res.json({ success: true, leads, total: leads.length })
    } catch (err) {
        console.error("[CRM] getMyLeads error:", err.message)
        res.status(500).json({ success: false, message: "Failed to fetch leads" })
    }
}

// @route  PATCH /api/crm/leads/:id
// @access Private
exports.updateLead = async (req, res) => {
    try {
        const { status, notes, responseLogs } = req.body

        const patch = {}
        if (status !== undefined) patch.status = status
        if (notes !== undefined) patch.notes = notes
        if (responseLogs !== undefined) patch.responseLogs = responseLogs
        if (status === "Contacted") patch.contactedAt = new Date()

        const lead = await Lead.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },   // scoped to this user
            { $set: patch },
            { returnDocument: "after" }
        )

        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" })

        res.json({ success: true, lead })
    } catch (err) {
        console.error("[CRM] updateLead error:", err.message)
        res.status(500).json({ success: false, message: "Failed to update lead" })
    }
}

// @route  DELETE /api/crm/leads/:id
// @access Private
exports.deleteLead = async (req, res) => {
    try {
        await Lead.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
        res.json({ success: true })
    } catch (err) {
        console.error("[CRM] deleteLead error:", err.message)
        res.status(500).json({ success: false, message: "Failed to delete lead" })
    }
}

// @route  POST /api/crm/leads/bulk-delete
// @access Private
exports.bulkDeleteLeads = async (req, res) => {
    try {
        const { ids } = req.body
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: "Invalid lead IDs provided" })
        }
        
        // Delete multiple leads belonging to the current user
        await Lead.deleteMany({ _id: { $in: ids }, userId: req.user._id })
        
        res.json({ success: true })
    } catch (err) {
        console.error("[CRM] bulkDeleteLeads error:", err.message)
        res.status(500).json({ success: false, message: "Failed to delete leads" })
    }
}

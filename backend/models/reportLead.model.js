const mongoose = require("mongoose")

const reportLeadSchema = new mongoose.Schema({
    slug: { type: String, required: true, index: true },
    queryKey: { type: String, required: true, index: true },
    name: { type: String },
    email: { type: String, required: true },
    company: { type: String },
    phone: { type: String },
    note: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    referrer: { type: String }
}, { timestamps: true })

reportLeadSchema.index({ slug: 1, email: 1 }, { unique: true })
reportLeadSchema.index({ createdAt: -1 })

module.exports = mongoose.models.ReportLead || mongoose.model("ReportLead", reportLeadSchema)


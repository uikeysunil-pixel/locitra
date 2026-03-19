const mongoose = require("mongoose")

const reportViewSchema = new mongoose.Schema({
    slug: { type: String, required: true, index: true },
    queryKey: { type: String, required: true, index: true },
    ip: { type: String },
    userAgent: { type: String },
    referrer: { type: String }
}, { timestamps: true })

reportViewSchema.index({ createdAt: -1 })

module.exports = mongoose.models.ReportView || mongoose.model("ReportView", reportViewSchema)


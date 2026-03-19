const mongoose = require("mongoose")

const leadSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for public/anonymous leads
    keyword: String,
    city: String,
    name: String,
    rating: Number,
    reviews: Number,
    website: String,
    phone: String,
    email: String,
    contactPage: String,
    facebook: String,
    instagram: String,
    linkedin: String,
    address: String,
    opportunityScore: Number,
    priorityScore: Number,
    status: {
        type: String,
        enum: ["New", "Contacted", "Interested", "Meeting", "Closed"],
        default: "New"
    },
    contactedAt: Date,
    responseLogs: String,
    notes: String,
    seoAuditHash: String, // Future-proofing for AI SEO Audits
    createdAt: { type: Date, default: Date.now }
})

// Prevent duplicates: business name + location (city)
leadSchema.index({ name: 1, city: 1 }, { unique: true });

module.exports = mongoose.models.Lead || mongoose.model("Lead", leadSchema)

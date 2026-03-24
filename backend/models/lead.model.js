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
    outreach: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    contact: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false })

const transformContactFallback = (doc, ret) => {
    const o = ret.outreach || {};
    ret.contact = ret.contact || {};
    
    ret.contact.email = o.email || ret.contact.email;
    ret.contact.phone = o.phone || ret.contact.phone;
    ret.contact.website = o.website || ret.contact.website;
    ret.contact.contactPage = o.contactPage || ret.contact.contactPage;

    ret.contact.socials = ret.contact.socials || {};
    const os = o.socials || {};
    
    ret.contact.socials.facebook = os.facebook || ret.contact.socials.facebook;
    ret.contact.socials.instagram = os.instagram || ret.contact.socials.instagram;
    ret.contact.socials.linkedin = os.linkedin || ret.contact.socials.linkedin;
    ret.contact.socials.twitter = os.twitter || ret.contact.socials.twitter;
    
    return ret;
};

leadSchema.set('toJSON', { virtuals: true, transform: transformContactFallback });
leadSchema.set('toObject', { virtuals: true, transform: transformContactFallback });

// Prevent duplicates: business name + location (city)
leadSchema.index({ name: 1, city: 1 }, { unique: true });

module.exports = mongoose.models.Lead || mongoose.model("Lead", leadSchema)

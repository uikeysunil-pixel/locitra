const mongoose = require("mongoose")

const businessSchema = new mongoose.Schema({

    name: String,

    keyword: String,

    location: String,

    city: String,

    address: String,

    phone: String,

    website: String,

    email: String,

    contactPage: String,

    facebook: String,

    instagram: String,

    linkedin: String,

    rating: Number,

    reviews: Number,

    category: String,

    opportunityScore: Number,

    lat: Number,

    lng: Number,

    placeId: {
        type: String,
        unique: true,
        sparse: true
    }

}, { timestamps: true })

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

businessSchema.set('toJSON', { virtuals: true, transform: transformContactFallback });
businessSchema.set('toObject', { virtuals: true, transform: transformContactFallback });

module.exports = mongoose.models.Business || mongoose.model("Business", businessSchema)
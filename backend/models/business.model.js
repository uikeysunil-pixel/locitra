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

module.exports = mongoose.model("Business", businessSchema)
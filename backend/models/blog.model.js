const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        excerpt: {
            type: String,
            default: ""
        },
        content: {
            type: String,  // HTML string
            default: ""
        },
        coverImage: {
            type: String,
            default: ""
        },
        author: {
            type: String,
            default: "Locitra AI"
        },
        category: {
            type: String,
            default: "General"
        },
        metaTitle: {
            type: String,
            default: ""
        },
        metaDescription: {
            type: String,
            default: ""
        },
        keywords: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        }
    },
    {
        timestamps: true
    }
)

// Auto-generate slug from title before validation
blogSchema.pre("validate", function () {
    if (this.isModified("title") && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
    }
})

module.exports = mongoose.models.Blog || mongoose.model("Blog", blogSchema)

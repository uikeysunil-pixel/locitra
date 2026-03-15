const mongoose = require("mongoose")

const jobSchema = new mongoose.Schema({
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        default: "enrichment"
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
        index: true
    },
    error: {
        type: String
    },
    attempts: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema)

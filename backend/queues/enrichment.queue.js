const Job = require("../models/job.model")

/**
 * Adds an enrichment job to the queue.
 */
async function addEnrichmentJob(leadId) {
    try {
        const job = await Job.create({
            targetId: leadId,
            type: "enrichment",
            status: "pending"
        })
        console.log(`[Queue] Enrichment job queued for lead: ${leadId}`)
        return job
    } catch (error) {
        console.error(`[Queue] Failed to add job for lead ${leadId}:`, error.message)
        return null
    }
}

module.exports = { addEnrichmentJob }

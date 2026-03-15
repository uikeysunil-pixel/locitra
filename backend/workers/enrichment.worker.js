const Business = require("../models/business.model")
const Job = require("../models/job.model")
const { enrichLead } = require("../services/enrichment.service")

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Recursive worker loop for processing jobs.
 */
async function workerLoop(workerId) {
    try {
        // STEP 2 — Claim next job using atomic MongoDB query
        const job = await Job.findOneAndUpdate(
            { status: "pending", type: "enrichment" },
            { status: "processing" },
            { returnDocument: "after", sort: { createdAt: 1 } }
        );

        if (!job) {
            // STEP 3 - Safety: if no jobs available, wait 2 seconds
            await delay(2000);
            return workerLoop(workerId);
        }

        // STEP 4 - Logging: Include worker id
        console.log(`[Worker ${workerId}] Processing job`, job._id);
        console.log(`[Worker ${workerId}] Processing lead: ${job.targetId}`);

        const lead = await Business.findById(job.targetId);

        if (!lead) {
            console.warn(`[Worker ${workerId}] Lead not found: ${job.targetId}`);
            await Job.findByIdAndUpdate(job._id, {
                status: "failed",
                error: "Lead not found"
            });
            return workerLoop(workerId);
        }

        // Run enrichment
        await enrichLead(lead);

        // Mark completion
        await Job.findByIdAndUpdate(job._id, { status: "completed" });
        console.log(`[Worker ${workerId}] Job completed:`, job._id);
        console.log(`[Worker ${workerId}] Successfully enriched lead: ${lead.name}`);

    } catch (error) {
        console.error(`[Worker ${workerId}] Error:`, error.message);
        // Error handling for job-specific failures
        if (error.jobId) {
            await Job.findByIdAndUpdate(error.jobId, {
                status: "failed",
                error: error.message
            });
        }
    }

    // Continue loop immediately if we found a job (or after the error)
    return workerLoop(workerId);
}

/**
 * Initializes the worker process.
 */
async function startEnrichmentWorker(workerId = 0) {
    console.log(`[Worker ${workerId}] Enrichment worker started`);

    // Only start recovery logic on the first worker instance to avoid redundancy
    if (workerId === 0) {
        console.log("[Worker 0] Starting recovery watchdog...");
        setInterval(async () => {
            try {
                const tenMinutesAgo = new Date(Date.now() - 600000);
                const recovered = await Job.updateMany(
                    {
                        status: "processing",
                        updatedAt: { $lt: tenMinutesAgo }
                    },
                    { status: "pending" }
                );
                if (recovered.modifiedCount > 0) {
                    console.log(`[Worker] Recovered ${recovered.modifiedCount} stuck jobs`);
                }
            } catch (error) {
                console.error("[Worker Recovery] Error:", error.message);
            }
        }, 300000); // 5 minutes
    }

    // Start the recursive loop
    workerLoop(workerId);
}

module.exports = { startEnrichmentWorker }

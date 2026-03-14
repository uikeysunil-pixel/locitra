const express = require('express');
const router = express.Router();
const { enrichLead } = require('../services/enrichment.service');
const Business = require('../models/business.model');

// POST /api/enrich/:leadId
router.post('/:leadId', async (req, res) => {
    try {
        const { leadId } = req.params;
        let business = await Business.findById(leadId);

        if (!business) {
            // Check if placeId or something else is passed
            business = await Business.findOne({ placeId: leadId });
            if (!business) {
                return res.status(404).json({ success: false, message: 'Lead not found' });
            }
        }

        const enriched = await enrichLead(business.toObject ? business.toObject() : business);

        // Update database explicitly for this lead
        await Business.findByIdAndUpdate(business._id, {
            website: enriched.website || business.website,
            email: enriched.email || business.email,
            facebook: enriched.facebook || business.facebook,
            instagram: enriched.instagram || business.instagram,
            linkedin: enriched.linkedin || business.linkedin,
            contactPage: enriched.contactPage || business.contactPage,
            potentialEmails: enriched.potentialEmails || business.potentialEmails
        });

        return res.json({ success: true, lead: enriched });

    } catch (e) {
        console.error("Enrichment endpoint error:", e);
        return res.status(500).json({ success: false, message: "Enrichment failed" });
    }
});

module.exports = router;

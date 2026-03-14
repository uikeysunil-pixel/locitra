const mongoose = require('mongoose');
const axios = require('axios');
const { contactFinder } = require('../services/contactFinder');
const { generateAudit } = require('../services/ai/seoAuditEngine');
const { generateOutreach } = require('../services/ai/outreachGenerator');

exports.getSystemStatus = async (req, res) => {
    try {
        const status = {
            mongodb: mongoose.connection.readyState === 1,
            cache: !!mongoose.model('ScanCache'),
            serp: !!process.env.SERPAPI_KEY,
            leadDB: !!mongoose.model('Lead'),
            contactFinder: typeof contactFinder === 'function',
            seoAnalyzer: typeof generateAudit === 'function',
            outreachGenerator: typeof generateOutreach === 'function'
        };

        res.json(status);
    } catch (error) {
        res.status(500).json({
            error: "Status check failed",
            message: error.message
        });
    }
};

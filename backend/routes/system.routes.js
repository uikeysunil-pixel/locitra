const express = require('express');
const router = express.Router();
const { getSystemStatus } = require('../controllers/system.controller');

router.get('/system-status', getSystemStatus);

module.exports = router;

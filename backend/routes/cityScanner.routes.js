const express = require("express");

const router = express.Router();

const cityScannerController = require("../controllers/cityScanner.controller");

// Scan entire city for leads
router.get("/scan-city", cityScannerController.scanCity);

module.exports = router;
const express = require("express");
const router = express.Router();
const toolsController = require("../controllers/tools.controller");
const publicRateLimiter = require("../middlewares/publicRateLimiter");

// website presence checker endpoint
router.post("/website-presence", publicRateLimiter, toolsController.checkWebsitePresence);

module.exports = router;

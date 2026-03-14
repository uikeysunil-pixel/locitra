const express = require("express")
const router = express.Router()

const { getProspects } = require("../controllers/prospect.controller")

router.get("/", getProspects)

module.exports = router